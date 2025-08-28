const SignupService = require('../services/signup.service');
const { formatSignupResponse } = require('../dto/response/userResponse/signup.response');

const signup = async (req, res, next) => {
  try {
    const newUser = await SignupService(req.body, req.file);

    console.log('🟡 SignupService response:', newUser); 

    const response = formatSignupResponse(newUser.user, newUser.token, newUser.streamToken);

    return res.status(201).json(response);
  } catch (err) {
    console.error('Signup error:', err); 
    next(err);
  }
};

module.exports = { signup };
