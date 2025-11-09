export async function startZkLogin(provider: string = "google") {
  try {
    try {
      localStorage.setItem('zklogin_provider', provider);
    } catch {}
    console.debug('[zklogin] starting login', { provider });
    const res = await fetch(`/api/auth/zklogin/url?provider=${encodeURIComponent(provider)}`);
    if (!res.ok) throw new Error(`Failed to get auth url (${res.status})`);
    const data = await res.json();
    if (!data.url) throw new Error("No auth url returned");
    // Navigate to provider consent screen
    window.location.href = data.url;
  } catch (err) {
    console.error("startZkLogin error", err);
    throw err;
  }
}
