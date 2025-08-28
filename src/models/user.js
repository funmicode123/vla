const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },  
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  bio: {type: String, default:''},
  profilePic: { type: String, default: process.env.AVATAR },
},{
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
