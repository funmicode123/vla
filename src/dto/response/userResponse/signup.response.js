function formatSignupResponse(user, token, streamToken) {
  return {
    token,
    streamToken,
    user: {
      id: user.id,
      email: user.email,
      profilePic: user.profilePic,
    },
    message: 'User created successfully',
  };
}

module.exports = { formatSignupResponse };
