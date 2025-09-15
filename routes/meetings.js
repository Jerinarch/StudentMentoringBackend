const express = require('express');
const Meeting = require('../models/Meeting');
const { verifyToken } = require('./auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({ studentId: req.userId })
      .sort({ scheduledDate: 1 });
    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
});

router.get('/upcoming', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const meetings = await Meeting.find({
      studentId: req.userId,
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'rescheduled'] }
    }).sort({ scheduledDate: 1 });
    res.json({ meetings });
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    res.status(500).json({ message: 'Server error fetching upcoming meetings' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { mentorName, topic, scheduledDate, scheduledTime, duration, location, notes } = req.body;

    const meeting = new Meeting({
      studentId: req.userId,
      mentorName,
      topic,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration: duration || 60,
      location: location || 'Online',
      notes: notes || ''
    });

    await meeting.save();

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { mentorName, topic, scheduledDate, scheduledTime, duration, location, notes, status } = req.body;
    
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, studentId: req.userId },
      {
        mentorName,
        topic,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        scheduledTime,
        duration,
        location,
        notes,
        status: status || 'rescheduled'
      },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({
      message: 'Meeting updated successfully',
      meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Server error updating meeting' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      studentId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Server error deleting meeting' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      studentId: req.userId
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error fetching meeting' });
  }
});

module.exports = router;


