"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeriod = exports.getTime = exports.getMinutesAfterMidnight = exports.getSecondsAfterMidnight = void 0;
function getSecondsAfterMidnight(date) {
    return date.getUTCHours() * 60 * 60 + date.getUTCMinutes() * 60 + date.getUTCSeconds();
}
exports.getSecondsAfterMidnight = getSecondsAfterMidnight;
function getMinutesAfterMidnight(date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}
exports.getMinutesAfterMidnight = getMinutesAfterMidnight;
function getTime(date) {
    return `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
}
exports.getTime = getTime;
function getPeriod(date) {
    const hours = date.getUTCHours();
    if (hours < 6 || hours > 20)
        return 'Night';
    else if (hours < 12)
        return 'Morning';
    else if (hours < 17)
        return 'Afternoon';
    else
        return 'Evening';
}
exports.getPeriod = getPeriod;
