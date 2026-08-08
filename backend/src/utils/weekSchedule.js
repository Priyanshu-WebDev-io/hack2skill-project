const getStartOfDay = (date) => {
  const output = new Date(date);
  output.setHours(0, 0, 0, 0);
  return output;
};

const getEndOfDay = (date) => {
  const output = new Date(date);
  output.setHours(23, 59, 59, 999);
  return output;
};

const getMondayStart = (date = new Date()) => {
  const base = getStartOfDay(date);
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diff);
  return base;
};

const getIsoWeekInfo = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const weekYear = utcDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const weekNumber = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  return { weekYear, weekNumber, weekLabel: `Week ${weekNumber}` };
};

const buildWeeklySeminarSchedule = (baseDate = new Date()) => {
  const seminarHour = Number(process.env.SEMINAR_HOUR ?? 10);
  const seminarMinute = Number(process.env.SEMINAR_MINUTE ?? 0);

  const mondayStart = getMondayStart(baseDate);
  const saturdayEnd = getEndOfDay(new Date(mondayStart));
  saturdayEnd.setDate(mondayStart.getDate() + 5);

  const sundaySeminarDate = new Date(mondayStart);
  sundaySeminarDate.setDate(mondayStart.getDate() + 6);
  sundaySeminarDate.setHours(seminarHour, seminarMinute, 0, 0);

  const { weekYear, weekNumber, weekLabel } = getIsoWeekInfo(mondayStart);

  return {
    weekYear,
    weekNumber,
    weekLabel,
    registrationStartDate: mondayStart,
    registrationEndDate: saturdayEnd,
    seminarDate: sundaySeminarDate
  };
};

const isEnrollmentOpen = (seminar, now = new Date()) => {
  if (!seminar || seminar.isCompleted) {
    return false;
  }

  if (!seminar.registrationStartDate || !seminar.registrationEndDate) {
    return !!seminar.registrationOpen;
  }

  return now >= seminar.registrationStartDate && now <= seminar.registrationEndDate;
};

module.exports = {
  buildWeeklySeminarSchedule,
  getIsoWeekInfo,
  isEnrollmentOpen
};