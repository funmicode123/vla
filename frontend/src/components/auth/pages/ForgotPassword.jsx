import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styles from "./ForgotPassword.module.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email address").required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      // Replace this with your real API request
      console.log("Requesting password reset for:", data.email);
      toast.success("Password reset link sent to your email");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to send reset link. Try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formCard}>
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            {...register("email")}
            className={styles.input}
            placeholder="Enter your email"
          />
          <p className={styles.error}>{errors.email?.message}</p>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className={styles.backLink}
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
