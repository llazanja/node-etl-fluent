export function getSecondsAfterMidnight(date: Date): Number {
    return date.getUTCHours() * 60 * 60 + date.getUTCMinutes() * 60 + date.getUTCSeconds();
}

export function getMinutesAfterMidnight(date: Date): Number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function getTime(date: Date): string {
    return `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;

}

export function getPeriod(date: Date): string {
    const hours = date.getUTCHours();

    if (hours < 6 || hours > 20) return 'Night';
    else if (hours < 12) return 'Morning';
    else if (hours < 17) return 'Afternoon';
    else return 'Evening';
}