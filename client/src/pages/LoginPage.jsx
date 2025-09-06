import '../styles/LoginPage.css';
import LightDarkSwitch from '../components/LightDarkSwitch';
import LanguageSelect from '../components/LanguageSelect';

function LoginPage() {
  return (
    <>
      <LightDarkSwitch />
      {/* <LanguageSelect /> */}
      <h1>Inventory Management App</h1>
      <div className="login-page-container">

        <h1 data-translate>Sign in to your profile</h1>
        <div className="login-buttons">
          <a
            href="https://inventory-management-app-ctpn.onrender.com/auth/google"
            className="login-btn google-btn"
            data-translate
          >
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
              alt="Google logo"
              className="login-logo"
            />
            Sign in with Google
          </a>
          <a
            href="https://inventory-management-app-ctpn.onrender.com/auth/github"
            className="login-btn github-btn"
            data-translate
          >
            <img
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub logo"
              className="login-logo"
            />
            Sign in with GitHub
          </a>
        </div>
      </div>
    </>
  );
}

export default LoginPage;