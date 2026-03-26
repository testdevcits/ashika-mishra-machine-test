const express = require('express');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: get today's date as YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

// Clock in
router.post('/login', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const today = getToday();

    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing) return res.status(400).json({ message: 'Already clocked in today' });

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      loginTime: new Date(),
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clock out
router.post('/logout', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const today = getToday();

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });
    if (attendance.logoutTime) return res.status(400).json({ message: 'Already clocked out today' });

    attendance.logoutTime = new Date();
    attendance.totalWorkedHours = attendance.calculateWorkedHours();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start break
router.post('/start-break', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const today = getToday();

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });

    // Check if there's already an ongoing break
    const ongoingBreak = attendance.breaks.find((b) => b.startTime && !b.endTime);
    if (ongoingBreak) return res.status(400).json({ message: 'Break already in progress' });

    attendance.breaks.push({ startTime: new Date() });
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End break
router.post('/end-break', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const today = getToday();

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });

    const ongoingBreak = attendance.breaks.find((b) => b.startTime && !b.endTime);
    if (!ongoingBreak) return res.status(400).json({ message: 'No ongoing break found' });

    ongoingBreak.endTime = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records by employeeId
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const records = await Attendance.find({ employee: employeeId })
      .populate('employee', 'firstName lastName email')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
