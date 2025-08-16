// api/resend-verification.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).end("Method Not Allowed");
    }
  
    try {
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing bearer token" });
      }
      const userAccessToken = authHeader.slice("Bearer ".length);
  
      const domain = process.env.AUTH0_DOMAIN; // e.g. dev-h51cv77hvalu1e1o.us.auth0.com
      const audience = `https://${domain}/api/v2/`;
  
      // 1) Map caller's SPA token → user_id via /userinfo
      const uiResp = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${userAccessToken}` },
      });
      if (!uiResp.ok) return res.status(401).json({ error: "Invalid user token" });
      const ui = await uiResp.json(); // { sub: "auth0|123...", email: "...", ... }
      const user_id = ui.sub;
  
      // 2) Get a Management API token (client credentials)
      const mgmtResp = await fetch(`https://${domain}/oauth/token`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_MGMT_CLIENT_ID,
          client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
          audience,
          grant_type: "client_credentials",
        }),
      });
      if (!mgmtResp.ok) {
        const t = await mgmtResp.text();
        return res.status(500).json({ error: "Failed to obtain management token", details: t });
      }
      const { access_token: mgmtToken } = await mgmtResp.json();
  
      // 3) Ask Auth0 to resend the verification email
      const jobsResp = await fetch(`https://${domain}/api/v2/jobs/verification-email`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${mgmtToken}`,
        },
        body: JSON.stringify({
          user_id,
          client_id: process.env.AUTH0_APP_CLIENT_ID, // SPA app's Client ID (optional but nice)
        }),
      });
  
      if (!jobsResp.ok) {
        const t = await jobsResp.text();
        return res.status(500).json({ error: "Failed to create verification job", details: t });
      }
  
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Unexpected error" });
    }
  }
  