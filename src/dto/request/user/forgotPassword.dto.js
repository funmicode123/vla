// src/dto/request/user/forgotPassword.dto.js

class ForgotPasswordRequest {
  /**
   * @param {string} email
   */
  constructor(email) {
    this.email = email;
  }
}

module.exports = ForgotPasswordRequest; 