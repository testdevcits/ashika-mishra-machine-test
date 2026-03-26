const express = require('express');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

const router = express.Router();

// Create department
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Department already exists' });

    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!department) return res.status(404).json({ message: 'Department not found' });

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete department
router.delete('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) return res.status(404).json({ message: 'Department not found' });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
