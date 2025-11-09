import { NextResponse } from "next/server";
import { EnokiClient } from "@mysten/enoki";
import { GOOGLE_CLIENT_ID, ZKLOGIN_REDIRECT_URI, ENOKI_API_KEY, ZKLOGIN_NETWORK } from "@/lib/constants";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    console.debug("[zklogin.complete] Exchanging code for tokens", {
      provider,
      redirectUri,
      hasClientId: !!clientId,
      clientIdSuffix: clientId ? clientId.slice(-6) : undefined,
    });
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

    // Require server-side Enoki API key
    const enokiApiKey = ENOKI_API_KEY;
    if (!enokiApiKey || enokiApiKey === (process.env.NEXT_PUBLIC_ENOKI_API_KEY || "")) {
      console.error("[zklogin.complete] Missing ENOKI_API_KEY (server secret). Do not use NEXT_PUBLIC key here.");
      return NextResponse.json({ error: "Missing ENOKI API key" }, { status: 500 });
    }

    // Debug: decode JWT payload (iss/aud)
    const decodeJwtPayload = (jwt: string) => {
      try {
        const [, payload] = jwt.split(".");
        const norm = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = Buffer.from(norm, "base64").toString("utf8");
        return JSON.parse(json);
      } catch {
        return null;
      }
    };
    const jwtPayload = decodeJwtPayload(tokenData.id_token);
    console.debug("[zklogin.complete] JWT payload summary", {
      iss: jwtPayload?.iss,
      aud: jwtPayload?.aud,
      sub: jwtPayload?.sub ? `${String(jwtPayload.sub).slice(0, 6)}…` : undefined,
    });
    if (jwtPayload?.aud && clientId && jwtPayload.aud !== clientId) {
      console.warn("[zklogin.complete] Warning: JWT audience does not match GOOGLE_CLIENT_ID. Check Google client and Enoki app config.");
    }

    // Use Enoki SDK to resolve zkLogin address/publicKey/salt from JWT
    const enoki = new EnokiClient({ apiKey: enokiApiKey });
    let zklogin;
    try {
      zklogin = await enoki.getZkLogin({ jwt: tokenData.id_token });
    } catch (e: any) {
      console.error("[zklogin.complete] Enoki getZkLogin failed", {
        status: e?.status,
        code: e?.code,
        errors: e?.errors,
      });
      const status = typeof e?.status === "number" ? e.status : 502;
      return NextResponse.json({ error: "Enoki zkLogin failed", details: { status: e?.status, code: e?.code, errors: e?.errors } }, { status });
    }

    return NextResponse.json({
      address: zklogin.address,
      // zkProof is created later via nonce/zkp flow when sending transactions
      zkProof: null,
      userInfo: {
        // Basic claims from Google token (subset only; redacted)
        sub: jwtPayload?.sub,
        email: jwtPayload?.email,
        name: jwtPayload?.name,
        picture: jwtPayload?.picture,
      },
      provider: "google",
    });
  } catch (error) {
    console.error("zklogin complete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
