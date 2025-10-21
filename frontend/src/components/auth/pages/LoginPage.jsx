import LoginForm from '../forms/LoginForm';
import GoogleLoginButton from '../pages/GoogleLoginButton';
import styles from './SignupPage.module.css';

const LoginPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formCard}>
        <h2>Virtual Learning App</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
