# Cruise0 – Auth0 React SPA (PoC)

A modernized **Cruise0** single-page app showing how **Auth0** solves Travel0’s requirements:

- Email/password & **Google** social login (Universal Login)
- **Email verification** with an in-app Verify screen (manual + auto-refresh)
- **Country from IP** via **Post-Login Action** (app_metadata + ID token claims)
- **Burner email blocking** via **Pre-User Registration Action** (+ post-login safety net for social)

## ✨ Demo UX
- Home: elegant, centered login with cruise background
- After sign-up: redirected to **/verify-email** (button + auto check)
- After verification: **/profile** shows Name, Email, Verified, **Country**, **Time zone**

---

## ⚙️ Quick start

```bash
npm install
copy .env.example .env
# open .env and fill REACT_APP_AUTH0_CLIENT_ID
npm start
