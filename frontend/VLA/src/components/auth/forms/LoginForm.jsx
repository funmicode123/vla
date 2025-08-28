import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../../utils/yupSchemas";
import { loginThunk, googleAuthThunk } from "../../../store/slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

import styles from "./LoginForm.module.css";
import { toast } from "react-toastify";

const LoginForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const formData = {
        email: data.email,
        password: data.password,
    };

    const result = await dispatch(loginThunk(formData));
    if (loginThunk.fulfilled.match(result)) {
          toast.success("Login successful! Redirecting...", {
            position: "top-right",
            theme: "colored",
            icon: "✅",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
    
          setIsRedirecting(true);
          setTimeout(() => {
            setIsRedirecting(false);
            onClose?.();
            navigate("/dashboard", {replace: true});
          }, 2000);
        } else {
          toast.error(result.payload || "Login failed. Please try again.");
        }
    };
    

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);
      const result = await dispatch(
        googleAuthThunk(credentialResponse.credential)
      );
      if (googleAuthThunk.fulfilled.match(result)) {
        toast.success("🎉 Google login successful! Redirecting...", {
          position: "top-right",
          theme: "colored",
          icon: "✅",
          autoClose: 3000,
        });
        onClose?.();
        navigate("/sessions", {replace: true});
      } else {
        toast.error(result.payload || "Google login failed. Please try again.");
      }
    } catch (error) {
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
    setIsGoogleLoading(false);
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input type="email" {...register("email")} className={styles.input} />
          <p className={styles.error}>{errors.email?.message}</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.input}
              {...register("password", {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
              value={passwordValue}              
            />
            {passwordValue && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleBtn}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>
          <p className={styles.error}>{errors.password?.message}</p>
        </div>


        <button
          type="submit"
          disabled={loading || isRedirecting}
          className={styles.submitButton}
        >
          {loading || isRedirecting ? "Processing..." : "Login"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.authLinks}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
          <p>
            Don’t have an account?{" "}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </p>
        </div>
      </form>


      {/* Separator with lines and 'OR' */}
      <div className={styles.separator}>
        <span className={styles.line}></span>
        <span className={styles.orText}>OR</span>
        <span className={styles.line}></span>
      </div>

      {/* Google login section */}
      <div className={styles.socialLogin}>
        <GoogleLogin 
          onSuccess={handleGoogleSuccess} 
          onError={handleGoogleError}
          disabled={isGoogleLoading}
          text={isGoogleLoading ? "signin_with" : "signin_with"}
          shape="rectangular"
          theme="outline"
          size="large"
        />
        {isGoogleLoading && (
          <button className={styles.iconButton} disabled>
            <FcGoogle className={styles.icon} />
            Signing in...
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
