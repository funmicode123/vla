import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../../utils/yupSchemas";
import { signupThunk, googleAuthThunk } from "../../../store/slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

import styles from "./SignupForm.module.css";
import { toast } from "react-toastify";

const SignupForm = ({ onClose }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      profilePic: null,
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type/size
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('File too large (max 5MB)');
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
      setProfilePic(file);
    }
  };


  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    console.log("📦 Submitting form data:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    const result = await dispatch(signupThunk(formData));
    if (signupThunk.fulfilled.match(result)) {
      toast.success("🎉 Signup successful! Redirecting...", {
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
        navigate("/createSession");
      }, 3000);
    } else {
      toast.error(result.payload || "Signup failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);
      const result = await dispatch(
        googleAuthThunk(credentialResponse.credential)
      );
      if (googleAuthThunk.fulfilled.match(result)) {
        toast.success("🎉 Google signup successful! Redirecting...", {
          position: "top-right",
          theme: "colored",
          icon: "✅",
          autoClose: 3000,
        });
        onClose?.();
        navigate("/createSession");
      } else {
        toast.error(result.payload || "Google signup failed. Please try again.");
      }
    } catch (error) {
      toast.error("Google signup failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google signup failed. Please try again.");
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
          <input
            type="password"
            {...register("password")}
            className={styles.input}
          />
          <p className={styles.error}>{errors.password?.message}</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Profile picture</label>
          <input
            type="file"
            accept="image/*"
           // {...register("profilePic")}
            name="profilePic"
            onChange={handleAvatarChange}
            className={styles.fileInput}
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className={styles.avatarPreview}
            />
          )}
        </div>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading || isRedirecting}
        >
          {loading || isRedirecting ? "Processing..." : "Sign Up"}
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
              onClick={() => navigate("/login")}
            >
              Login
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

export default SignupForm;
