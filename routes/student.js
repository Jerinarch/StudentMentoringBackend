const express = require('express');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Feedback = require('../models/Feedback');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get student profile and progress
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recentMeetings = await Meeting.countDocuments({
      studentId: req.userId,
      status: 'completed'
    });

    const upcomingMeetings = await Meeting.countDocuments({
      studentId: req.userId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'rescheduled'] }
    });

    const feedbackCount = await Feedback.countDocuments({
      studentId: req.userId
    });

    res.json({
      user,
      stats: {
        recentMeetings,
        upcomingMeetings,
        feedbackCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update student profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, program, attendance, gpa, totalCredits, skills } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (program) updateData.program = program;
    if (attendance !== undefined) updateData.attendance = attendance;
    if (gpa !== undefined) updateData.gpa = gpa;
    if (totalCredits !== undefined) updateData.totalCredits = totalCredits;
    if (skills) updateData.skills = skills;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get student dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const upcomingMeetings = await Meeting.find({
      studentId: req.userId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'rescheduled'] }
    }).sort({ scheduledDate: 1 }).limit(5);

    const recentMeetings = await Meeting.find({
      studentId: req.userId,
      status: 'completed'
    }).sort({ scheduledDate: -1 }).limit(5);

    const recentFeedback = await Feedback.find({
      studentId: req.userId
    }).sort({ createdAt: -1 }).limit(3).select('-studentId');

    res.json({
      user,
      upcomingMeetings,
      recentMeetings,
      recentFeedback
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Get student progress
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalMeetings = await Meeting.countDocuments({
      studentId: req.userId
    });

    const completedMeetings = await Meeting.countDocuments({
      studentId: req.userId,
      status: 'completed'
    });

    const totalFeedback = await Feedback.countDocuments({
      studentId: req.userId
    });

    const progressPercentage = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;

    res.json({
      user,
      progress: {
        totalMeetings,
        completedMeetings,
        totalFeedback,
        progressPercentage: Math.round(progressPercentage),
        attendance: user.attendance,
        gpa: user.gpa,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error fetching progress data' });
  }
});

module.exports = router;


