import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    const hinted = localStorage.getItem("app:lastAuthIntent") || "/profile";
    loginWithRedirect({ appState: { returnTo: hinted } });
  };

  return (
    <button type="button" className="login-button" onClick={handleLogin}>
      Log In
    </button>
  );
};

export default LoginButton;