const express = require('express');
const mockDB = require('../config/mockDB');
const auth = require('../middleware/auth');

const router = express.Router();

// Create employee
router.post('/', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, position, dateOfJoining } = req.body;

    if (!firstName || !lastName || !email || !phone || !department || !position) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = mockDB.employees.some(e => e.email === email);
    if (exists) return res.status(400).json({ message: 'Employee with this email already exists' });

    const employee = mockDB.createEmployee({ firstName, lastName, email, phone, department, position, dateOfJoining });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all employees — with search and filter
router.get('/', auth, async (req, res) => {
  try {
    const { search, department } = req.query;

    let employees = [...mockDB.employees];

    if (search) {
      employees = employees.filter(e =>
        e.firstName.toLowerCase().includes(search.toLowerCase()) ||
        e.lastName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (department) {
      employees = employees.filter(e => e.department === department);
    }

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = mockDB.employees.find(e => e._id === req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const employee = mockDB.updateEmployee(req.params.id, req.body);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = mockDB.employees.find(e => e._id === req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    mockDB.deleteEmployee(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
