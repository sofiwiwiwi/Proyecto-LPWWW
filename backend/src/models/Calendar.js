const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  isHoliday: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
});

const Calendar = mongoose.model("Calendar", CalendarSchema);
module.exports = Calendar;