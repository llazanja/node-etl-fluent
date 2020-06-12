"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthNumberToName = exports.dayOfWeekNumberToName = exports.getDate = exports.getQuarter = void 0;
function getQuarter(date) {
    date = date || new Date();
    var m = Math.floor(date.getMonth() / 3) + 2;
    return m > 4 ? m - 4 : m;
}
exports.getQuarter = getQuarter;
function getDate(date) {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    return `${year}-${dateNumberToString(month)}-${dateNumberToString(day)}`;
}
exports.getDate = getDate;
function dateNumberToString(num) {
    return num < 10 ? `0${num}` : `${num}`;
}
const dayOfWeekMap = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};
function dayOfWeekNumberToName(dayOfWeek) {
    return dayOfWeekMap[dayOfWeek];
}
exports.dayOfWeekNumberToName = dayOfWeekNumberToName;
const monthMap = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December',
};
function monthNumberToName(dayOfWeek) {
    return monthMap[dayOfWeek];
}
exports.monthNumberToName = monthNumberToName;
