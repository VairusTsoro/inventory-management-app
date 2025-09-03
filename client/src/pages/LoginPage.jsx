import '../styles/LoginPage.css'
import LightDarkSwitch from '../components/LightDarkSwitch';
import LanguageSelect from '../components/LanguageSelect';

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function LoginPage() {
  return (
    <div>
      <LightDarkSwitch />
      <LanguageSelect />
      <h1 data-translate>Sign in to to your profile</h1>
      {/* <script src="https://accounts.google.com/gsi/client" async></script>
      <div id="g_id_onload"
        data-client_id={GOOGLE_CLIENT_ID}
        data-login_uri="http://localhost:3000/auth/google"
        data-auto_prompt="false">
      </div>
      <div className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left">
      </div> */}
      <a href="https://inventory-management-app-ctpn.onrender.com/auth/google" data-translate>Sign in with Google</a>
      <br />
      <a href="https://inventory-management-app-ctpn.onrender.com/auth/github" data-translate>Sign in with GitHub</a>
    </div>
  )
}

export default LoginPage;