const express = require('express');
const Feedback = require('../models/Feedback');
const { verifyToken } = require('./auth');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      mentorName,
      program,
      expertise,
      communication,
      supportiveness,
      suggestions,
      overallSatisfaction,
      isAnonymous
    } = req.body;

    if (!mentorName || !program || !expertise || !communication || !supportiveness || !overallSatisfaction) {
      return res.status(400).json({ message: 'All rating fields are required' });
    }

    const ratings = { expertise, communication, supportiveness, overallSatisfaction };
    for (const [key, value] of Object.entries(ratings)) {
      if (value < 1 || value > 5) {
        return res.status(400).json({ message: `${key} rating must be between 1 and 5` });
      }
    }

    const feedback = new Feedback({
      studentId: req.userId,
      mentorName,
      program,
      ratings: {
        expertise: parseInt(expertise),
        communication: parseInt(communication),
        supportiveness: parseInt(supportiveness),
        overallSatisfaction: parseInt(overallSatisfaction)
      },
      suggestions: suggestions || '',
      isAnonymous: isAnonymous || false
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        mentorName: feedback.mentorName,
        program: feedback.program,
        ratings: feedback.ratings,
        suggestions: feedback.suggestions,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ studentId: req.userId })
      .sort({ createdAt: -1 })
      .select('-studentId');

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      studentId: req.userId
    }).select('-studentId');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const {
      mentorName,
      program,
      expertise,
      communication,
      supportiveness,
      suggestions,
      overallSatisfaction,
      isAnonymous
    } = req.body;

    const updateData = {};
    if (mentorName) updateData.mentorName = mentorName;
    if (program) updateData.program = program;
    if (suggestions !== undefined) updateData.suggestions = suggestions;
    if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;

    if (expertise || communication || supportiveness || overallSatisfaction) {
      updateData.ratings = {};
      if (expertise) updateData.ratings.expertise = parseInt(expertise);
      if (communication) updateData.ratings.communication = parseInt(communication);
      if (supportiveness) updateData.ratings.supportiveness = parseInt(supportiveness);
      if (overallSatisfaction) updateData.ratings.overallSatisfaction = parseInt(overallSatisfaction);
    }

    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, studentId: req.userId },
      updateData,
      { new: true, runValidators: true }
    ).select('-studentId');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error updating feedback' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({
      _id: req.params.id,
      studentId: req.userId
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error deleting feedback' });
  }
});

module.exports = router;


