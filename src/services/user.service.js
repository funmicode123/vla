// src/services/user.service.js
const crypto = require('crypto');
const User = require('../models/user');
// You may need to implement or import your email utility and token storage logic

class UserService {
  /**
   * Handle forgot password: generate token, store it, and send email
   * @param {string} email
   * @returns {Promise<void>}
   */
  static async forgotPassword(email) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return; // For security, do not reveal if user exists

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour

    // Store token and expiry on user (or in a separate collection)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email (placeholder)
    // await sendResetEmail(user.email, token);
  }

  /**
   * Handle reset password: validate token and update password
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<boolean>} true if successful
   */
  static async resetPassword(token, newPassword) {
    // Find user by token and check expiry
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return false;

    // Update password and clear token
    user.password = newPassword; // Hash in real implementation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return true;
  }
}

module.exports = UserService; 