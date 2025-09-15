const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, trim: true },
  program: {
    type: String,
    required: true,
    enum: [
      'Computer Science',
      'Information Technology',
      'Civil Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Electronics & Communication',
      'Data Science',
      'Artificial Intelligence',
      'Biotechnology',
      'Physics'
    ]
  },
  studentId: { type: String, required: true, unique: true },
  attendance: { type: Number, default: 0, min: 0, max: 100 },
  gpa: { type: Number, default: 0.0, min: 0.0, max: 4.0 },
  totalCredits: { type: Number, default: 0 },
  skills: {
    communication: { type: Number, default: 0, min: 0, max: 100 },
    problemSolving: { type: Number, default: 0, min: 0, max: 100 },
    teamwork: { type: Number, default: 0, min: 0, max: 100 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) { next(error); }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);


