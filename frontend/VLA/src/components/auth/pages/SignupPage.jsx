import SignupForm from '../forms/SignupForm';
import GoogleLoginButton from '../pages/GoogleLoginButton';
import styles from './SignupPage.module.css';

const SignupPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formCard}>
        <h2>Virtual Learning App</h2>
        <SignupForm />
        {/* <div className={styles.divider}>OR</div>
        <GoogleLoginButton /> */}
      </div>
    </div>
  );
};

export default SignupPage;
