import { NextResponse } from "next/server";
import { EnokiClient } from "@mysten/enoki";
import { GOOGLE_CLIENT_ID, ZKLOGIN_REDIRECT_URI, ENOKI_API_KEY } from "@/lib/constants";

function getOrigin(req: Request) {
  const proto = (req.headers.get("x-forwarded-proto") || "http").split(",")[0];
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body.code as string;
    const provider = (body.provider as string) || "google";

    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    if (provider !== "google") {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    const origin = getOrigin(req);
    const redirectUri = ZKLOGIN_REDIRECT_URI || `${origin}/auth/callback`;

    const clientId = GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET" }, { status: 500 });
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return NextResponse.json({ error: "OAuth token exchange failed" }, { status: tokenRes.status });
    }

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) {
      return NextResponse.json({ error: "No id_token returned" }, { status: 500 });
    }

    const enokiApiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY || process.env.ENOKI_API_KEY;
    if (!enokiApiKey) {
      return NextResponse.json({ error: "Missing ENOKI API key" }, { status: 500 });
    }

    // Prove with Enoki zkLogin
    const proveRes = await fetch("https://api.enoki.mystenlabs.com/v1/zklogin/prove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${enokiApiKey}`,
      },
      body: JSON.stringify({
        jwt: tokenData.id_token,
        network: process.env.ZKLOGIN_NETWORK || "testnet",
      }),
    });

    if (!proveRes.ok) {
      const t = await proveRes.text();
      console.error("Enoki prove failed:", t);
      return NextResponse.json({ error: "Enoki zkLogin failed" }, { status: proveRes.status });
    }

    const result = await proveRes.json();

    return NextResponse.json({
      address: result.address,
      zkProof: result.zkProof,
      userInfo: {
        sub: result.sub,
        email: result.email,
        name: result.name,
        picture: result.picture,
      },
      provider: "google",
    });
  } catch (error) {
    console.error("zklogin complete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
