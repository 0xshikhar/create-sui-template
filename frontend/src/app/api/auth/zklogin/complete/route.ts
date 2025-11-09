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
      let details: any = errText;
      try { details = JSON.parse(errText); } catch {}
      console.error("[zklogin.complete] Token exchange failed", { status: tokenRes.status, details });
      const payload = process.env.DEV_DEBUG_OAUTH
        ? { error: "OAuth token exchange failed", details }
        : { error: "OAuth token exchange failed" };
      return NextResponse.json(payload, { status: tokenRes.status });
    }

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) {
      return NextResponse.json({ error: "No id_token returned" }, { status: 500 });
    }

    // Require Enoki API key; allow dev fallback explicitly
    const enokiApiKey = ENOKI_API_KEY;
    const allowPublicFallback = process.env.DEV_ZKLOGIN_ALLOW_PUBLIC === 'true';
    const publicKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY || "";
    if (!enokiApiKey) {
      console.error("[zklogin.complete] Missing ENOKI_API_KEY. Configure server secret or enable DEV_ZKLOGIN_ALLOW_PUBLIC for dev.");
      return NextResponse.json({ error: "Missing ENOKI API key" }, { status: 500 });
    }
    if (enokiApiKey === publicKey) {
      if (!allowPublicFallback) {
        console.error("[zklogin.complete] ENOKI_API_KEY equals NEXT_PUBLIC_ENOKI_API_KEY but DEV_ZKLOGIN_ALLOW_PUBLIC is not enabled.");
        return NextResponse.json({ error: "Missing ENOKI API key" }, { status: 500 });
      }
      console.warn("[zklogin.complete] Using public Enoki key via DEV_ZKLOGIN_ALLOW_PUBLIC (development only).");
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
    const now = Math.floor(Date.now() / 1000);
    if (jwtPayload) {
      console.debug("[zklogin.complete] JWT timing", {
        now,
        iat: jwtPayload.iat,
        exp: jwtPayload.exp,
        expiresIn: typeof jwtPayload.exp === 'number' ? (jwtPayload.exp - now) : undefined,
      });
    }
    if (jwtPayload?.aud && clientId && jwtPayload.aud !== clientId) {
      console.warn("[zklogin.complete] Warning: JWT audience does not match GOOGLE_CLIENT_ID. Check Google client and Enoki app config.");
    }

    // Optional: verify token with Google tokeninfo for debugging
    if (process.env.DEV_DEBUG_JWT === '1' || process.env.DEV_DEBUG_JWT === 'true') {
      try {
        const tiRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`);
        const tiText = await tiRes.text();
        let ti: any = tiText; try { ti = JSON.parse(tiText); } catch {}
        console.debug('[zklogin.complete] Google tokeninfo', { status: tiRes.status, body: ti });
      } catch (tiErr: any) {
        console.warn('[zklogin.complete] tokeninfo debug failed', tiErr?.message || String(tiErr));
      }
    }

    // Use Enoki SDK to resolve zkLogin address/publicKey/salt from JWT
    const enoki = new EnokiClient({ apiKey: enokiApiKey });
    let zklogin;
    try {
      console.debug("[zklogin.complete] Calling Enoki SDK getZkLogin...");
      zklogin = await enoki.getZkLogin({ jwt: tokenData.id_token });
      console.debug("[zklogin.complete] Enoki SDK success", { 
        address: zklogin.address?.slice(0, 10),
        hasPublicKey: !!zklogin.publicKey,
        hasSalt: !!zklogin.salt
      });
    } catch (e: any) {
      console.error("[zklogin.complete] Enoki getZkLogin failed", {
        status: e?.status,
        code: e?.code,
        errors: e?.errors,
        message: e?.message,
      });
      
      // Development fallback: create mock session like QEDI does
      if (process.env.NODE_ENV === 'development' || allowPublicFallback) {
        console.warn('[zklogin.complete] Using development mock session (Enoki config needed for production)');
        const mockAddress = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        return NextResponse.json({
          address: mockAddress,
          zkProof: null,
          userInfo: {
            sub: jwtPayload?.sub || code.slice(0, 10),
            email: jwtPayload?.email || 'user@example.com',
            name: jwtPayload?.name || 'Dev User',
            picture: jwtPayload?.picture || 'https://via.placeholder.com/150',
          },
          provider: 'google',
          _devMode: true,
        });
      }
      
      const status = typeof e?.status === 'number' ? e.status : 502;
      return NextResponse.json({ 
        error: 'Enoki zkLogin failed', 
        details: { 
          status: e?.status, 
          code: e?.code, 
          errors: e?.errors,
          message: 'Configure ENOKI_API_KEY with a server key and register your Google OAuth client in Enoki portal'
        } 
      }, { status });
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
