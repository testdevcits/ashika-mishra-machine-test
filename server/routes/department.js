const express = require('express');
const mockDB = require('../config/mockDB');
const auth = require('../middleware/auth');

const router = express.Router();

// Create department
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const exists = mockDB.departments.some(d => d.name === name);
    if (exists) return res.status(400).json({ message: 'Department already exists' });

    const department = mockDB.createDepartment({ name, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const departments = mockDB.getDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = mockDB.updateDepartment(req.params.id, { name, description });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete department
router.delete('/:id', auth, async (req, res) => {
  try {
    const department = mockDB.departments.find(d => d._id === req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    mockDB.deleteDepartment(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
