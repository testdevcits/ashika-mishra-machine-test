// Mock in-memory database for development
const mockDB = {
  users: [],
  employees: [],
  departments: [],
  attendance: [],
};

// Mock User functions
mockDB.findUser = (email) => mockDB.users.find(u => u.email === email);
mockDB.createUser = (userData) => {
  const user = { _id: Date.now().toString(), ...userData };
  mockDB.users.push(user);
  return user;
};

// Mock Employee functions
mockDB.getEmployees = (filter = {}) => {
  let result = [...mockDB.employees];
  if (filter.search) {
    result = result.filter(e => 
      e.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
      e.lastName.toLowerCase().includes(filter.search.toLowerCase())
    );
  }
  if (filter.department) {
    result = result.filter(e => e.department === filter.department);
  }
  return result;
};

mockDB.createEmployee = (empData) => {
  const emp = { _id: Date.now().toString(), ...empData };
  mockDB.employees.push(emp);
  return emp;
};

mockDB.updateEmployee = (id, data) => {
  const idx = mockDB.employees.findIndex(e => e._id === id);
  if (idx !== -1) {
    mockDB.employees[idx] = { ...mockDB.employees[idx], ...data };
    return mockDB.employees[idx];
  }
  return null;
};

mockDB.deleteEmployee = (id) => {
  mockDB.employees = mockDB.employees.filter(e => e._id !== id);
};

// Mock Department functions
mockDB.getDepartments = () => [...mockDB.departments];

mockDB.createDepartment = (deptData) => {
  const dept = { _id: Date.now().toString(), ...deptData };
  mockDB.departments.push(dept);
  return dept;
};

mockDB.updateDepartment = (id, data) => {
  const idx = mockDB.departments.findIndex(d => d._id === id);
  if (idx !== -1) {
    mockDB.departments[idx] = { ...mockDB.departments[idx], ...data };
    return mockDB.departments[idx];
  }
  return null;
};

mockDB.deleteDepartment = (id) => {
  mockDB.departments = mockDB.departments.filter(d => d._id !== id);
};

// Mock Attendance functions
mockDB.getAttendance = (employeeId) => mockDB.attendance.filter(a => a.employeeId === employeeId);

mockDB.getTodayAttendance = (employeeId, date) => {
  return mockDB.attendance.find(a => a.employeeId === employeeId && a.date === date);
};

mockDB.createAttendance = (attData) => {
  const att = { _id: Date.now().toString(), breaks: [], ...attData };
  mockDB.attendance.push(att);
  return att;
};

mockDB.updateAttendance = (id, data) => {
  const idx = mockDB.attendance.findIndex(a => a._id === id);
  if (idx !== -1) {
    mockDB.attendance[idx] = { ...mockDB.attendance[idx], ...data };
    return mockDB.attendance[idx];
  }
  return null;
};

// Add test data AFTER defining all functions
const initTestData = () => {
  // Test departments
  mockDB.createDepartment({ name: 'Engineering', description: 'Software Development' });
  mockDB.createDepartment({ name: 'Sales', description: 'Sales & Business Development' });
  mockDB.createDepartment({ name: 'HR', description: 'Human Resources' });

  // Test employees
  mockDB.createEmployee({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com',
    phone: '9876543210',
    department: mockDB.departments[0]._id,
    position: 'Senior Developer',
    dateOfJoining: '2023-01-15'
  });

  mockDB.createEmployee({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@company.com',
    phone: '9876543211',
    department: mockDB.departments[1]._id,
    position: 'Sales Manager',
    dateOfJoining: '2023-02-20'
  });

  mockDB.createEmployee({
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@company.com',
    phone: '9876543212',
    department: mockDB.departments[0]._id,
    position: 'Frontend Developer',
    dateOfJoining: '2023-03-10'
  });
};

// Initialize with test data
initTestData();

module.exports = mockDB;
