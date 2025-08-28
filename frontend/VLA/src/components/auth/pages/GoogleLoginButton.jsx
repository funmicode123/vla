import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { googleAuthThunk } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async ({ credential }) => {
    const result = await dispatch(googleAuthThunk(credential));
    if (googleAuthThunk.fulfilled.match(result)) {
      navigate('/dashboard'); 
    } else {
      console.error('Google login failed:', result);
    }
  };


  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Google login failed')}
      text="signin_with"
      shape="rectangular"
      theme="outline"
      size="large"
    />
  );
};

export default GoogleLoginButton;
