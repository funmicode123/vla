const User = require('../models/user');

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(userId) {
    return await User.findById(userId);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findAll() {
    return await User.find();
  }

  async update(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async delete(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = new UserRepository();
