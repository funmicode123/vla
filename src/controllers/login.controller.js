const { loginUser } = require('../services/login.service');
const loginRequestDto = require('../dto/request/user/login.dto');
const { formatLoginResponse } = require('../dto/response/userResponse/login.response');
const { BadRequestError } = require('../utils/customErrors');
const UserService = require('../services/user.service');
const ForgotPasswordRequest = require('../dto/request/user/forgotPassword.dto');
const ResetPasswordRequest = require('../dto/request/user/resetPassword.dto');
const ForgotPasswordResponse = require('../dto/response/userResponse/forgotPassword.response');
const ResetPasswordResponse = require('../dto/response/userResponse/resetPassword.response');

const login = async (req, res, next) => {
  try {
    const { error } = loginRequestDto.validate(req.body);
    if (error) {
      return next(new BadRequestError(error.details[0].message));
    }

    const result = await loginUser(req.body);
    console.log('loginUser result:', result);

    const { user, token, streamToken } = result;
    const response = formatLoginResponse(user, token, streamToken);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return next(new BadRequestError('A valid email is required.'));
    }
    await UserService.forgotPassword(email);
    const response = new ForgotPasswordResponse('If your email exists, a reset link has been sent.');
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return next(new BadRequestError('Token and new password are required.'));
    }
    const success = await UserService.resetPassword(token, newPassword);
    if (!success) {
      return next(new BadRequestError('Invalid or expired token.'));
    }
    const response = new ResetPasswordResponse('Password has been reset successfully.');
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, forgotPassword, resetPassword };
