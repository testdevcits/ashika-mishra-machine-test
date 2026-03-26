const express = require('express');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

const router = express.Router();

// Create employee
router.post('/', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, position, dateOfJoining } = req.body;

    if (!firstName || !lastName || !email || !phone || !department || !position) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Employee with this email already exists' });

    const employee = await Employee.create({ firstName, lastName, email, phone, department, position, dateOfJoining });
    await employee.populate('department', 'name');

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all employees — with search and filter
router.get('/', auth, async (req, res) => {
  try {
    const { search, department, position } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (position) query.position = { $regex: position, $options: 'i' };

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department', 'name');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
