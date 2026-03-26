const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  startTime: { type: Date },
  endTime: { type: Date },
});

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // stored as YYYY-MM-DD for easy querying
    loginTime: { type: Date },
    logoutTime: { type: Date },
    breaks: [breakSchema],
    totalWorkedHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate total worked hours dynamically
attendanceSchema.methods.calculateWorkedHours = function () {
  if (!this.loginTime || !this.logoutTime) return 0;

  let totalMs = this.logoutTime - this.loginTime;

  // Subtract break durations
  this.breaks.forEach((b) => {
    if (b.startTime && b.endTime) {
      totalMs -= b.endTime - b.startTime;
    }
  });

  return parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2)); // convert ms to hours
};

module.exports = mongoose.model('Attendance', attendanceSchema);
