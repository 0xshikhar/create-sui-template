import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, ZKLOGIN_REDIRECT_URI } from "@/lib/constants";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getOrigin(req: Request) {
  const proto = (req.headers.get("x-forwarded-proto") || "http").split(",")[0];
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = (searchParams.get("provider") || "google").toLowerCase();

    const origin = getOrigin(req);
    const redirectUri = ZKLOGIN_REDIRECT_URI || `${origin}/auth/callback`;

    if (provider !== "google") {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID" }, { status: 500 });
    }

    console.debug("[zklogin.url] Building OAuth URL", {
      provider,
      redirectUri,
      hasClientId: !!clientId,
      clientIdSuffix: clientId.slice(-6),
    });

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("include_granted_scopes", "true");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", "google");

    return NextResponse.json({ url: authUrl.toString() });
  } catch (error) {
    console.error("zklogin url error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
