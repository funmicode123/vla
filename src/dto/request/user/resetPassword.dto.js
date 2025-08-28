// src/dto/request/user/resetPassword.dto.js

class ResetPasswordRequest {
  /**
   * @param {string} token
   * @param {string} newPassword
   */
  constructor(token, newPassword) {
    this.token = token;
    this.newPassword = newPassword;
  }
}

module.exports = ResetPasswordRequest; 