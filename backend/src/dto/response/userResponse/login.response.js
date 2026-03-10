function formatLoginResponse(user, token, streamToken) {
  return {
    token,
    streamToken,
    user: {
      id: user.id,
      email: user.email,
      profilePic: user.profilePic || null,
    },
    message: 'User logged in successfully',
  };
}

module.exports = { formatLoginResponse };
