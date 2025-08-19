import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const domain = "dev-h51cv77hvalu1e1o.us.auth0.com";      
const clientId = "ZZMj7M5Jkq4WvtlcafTszjIZcjbWCl8l";  

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
    onRedirectCallback={(appState) => {
      // Remove the last auth intent after use
      localStorage.removeItem("app:lastAuthIntent");
      const target = appState?.returnTo || "/profile";
      window.history.replaceState({}, document.title, target);
    }}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
);