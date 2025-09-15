const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorName: { type: String, required: true, trim: true },
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
  ratings: {
    expertise: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    supportiveness: { type: Number, required: true, min: 1, max: 5 },
    overallSatisfaction: { type: Number, required: true, min: 1, max: 5 }
  },
  suggestions: { type: String, trim: true, maxlength: 1000 },
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);


