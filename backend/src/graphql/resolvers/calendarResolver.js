const Calendar = require('../../models/Calendar');

const calendarResolver = {
  Query: {
    getCalendar: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return await Calendar.find({
        date: { $gte: start, $lte: end },
      }).sort({ date: 1 });
    },
  },
  Mutation: {
    generateBaseCalendar: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      const existingDates = await Calendar.find({
        date: { $in: dates },
      }).select("date");
      const existingDatesSet = new Set(existingDates.map((entry) => entry.date.toISOString()));

      const newEntries = dates
        .filter((date) => !existingDatesSet.has(date.toISOString()))
        .map((date) => ({
          date,
          isHoliday: [0, 6].includes(date.getDay()), 
          description: [0, 6].includes(date.getDay()) ? "Fin de semana" : "",
        }));

      const createdEntries = await Calendar.insertMany(newEntries);
      return createdEntries;
    },
    addHoliday: async (_, { input }) => {
      const { date, description } = input;
      const holidayDate = new Date(date);

      let holiday = await Calendar.findOne({ date: holidayDate });
      if (!holiday) {
        holiday = new Calendar({
          date: holidayDate,
          isHoliday: true,
          description,
        });
      } else {
        holiday.isHoliday = true;
        holiday.description = description;
      }

      await holiday.save();
      return holiday;
    },
  },
};

module.exports = calendarResolver;