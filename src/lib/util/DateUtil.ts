export function getQuarter(date: Date): Number {
    date = date || new Date();
    var m = Math.floor(date.getMonth()/3) + 2;
    return m > 4? m - 4 : m;
}

export function getDate(date: Date): string {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${year}-${dateNumberToString(month)}-${dateNumberToString(day)}`;
}

export function getDateDayBefore(date: Date): string {
    date.setDate(date.getDay() - 1);

    return getDate(date);
}

function dateNumberToString(num: Number): string {
    return num < 10 ? `0${num}` : `${num}`;
}

type DayOfWeekMapType = { [key: number]: string };

const dayOfWeekMap: DayOfWeekMapType = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
}

export function dayOfWeekNumberToName(dayOfWeek: number): string {
    return dayOfWeekMap[dayOfWeek];
}

type monthMapType = { [key: number]: string };

const monthMap: monthMapType = {
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
}

export function monthNumberToName(dayOfWeek: number): string {
    return monthMap[dayOfWeek];
}

