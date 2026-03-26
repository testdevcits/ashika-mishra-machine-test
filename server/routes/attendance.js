const express = require('express');
const mockDB = require('../config/mockDB');
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
    const existing = mockDB.getTodayAttendance(employeeId, today);
    if (existing?.loginTime) return res.status(400).json({ message: 'Already clocked in today' });

    const attendance = mockDB.createAttendance({
      employeeId,
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
    const attendance = mockDB.getTodayAttendance(employeeId, today);
    if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });
    if (attendance.logoutTime) return res.status(400).json({ message: 'Already clocked out today' });

    const updated = mockDB.updateAttendance(attendance._id, { logoutTime: new Date() });
    res.json(updated);
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
    const attendance = mockDB.getTodayAttendance(employeeId, today);
    if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });

    const ongoingBreak = attendance.breaks?.find((b) => b.startTime && !b.endTime);
    if (ongoingBreak) return res.status(400).json({ message: 'Break already in progress' });

    if (!attendance.breaks) attendance.breaks = [];
    attendance.breaks.push({ startTime: new Date() });
    const updated = mockDB.updateAttendance(attendance._id, { breaks: attendance.breaks });

    res.json(updated);
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
    const attendance = mockDB.getTodayAttendance(employeeId, today);
    if (!attendance) return res.status(404).json({ message: 'No clock-in record found for today' });

    const ongoingBreak = attendance.breaks?.find((b) => b.startTime && !b.endTime);
    if (!ongoingBreak) return res.status(400).json({ message: 'No ongoing break found' });

    ongoingBreak.endTime = new Date();
    const updated = mockDB.updateAttendance(attendance._id, { breaks: attendance.breaks });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records by employeeId
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const records = mockDB.getAttendance(employeeId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
