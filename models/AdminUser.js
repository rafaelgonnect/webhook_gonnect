const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'admin_users'
});

AdminUserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('AdminUser', AdminUserSchema); 