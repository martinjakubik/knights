const aMonthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const getTwoDigitNumberString = function (sNumber) {
    return sNumber.length < 2 ? `0${sNumber}` : sNumber.substring(0, 1);
}

const getNiceTime = function () {
    const oNow = new Date();
    const nMonthNum = oNow.getUTCMonth();
    const nDayNum = oNow.getUTCDate();
    const sHourDigits = '' + oNow.getUTCHours();
    const sMinuteDigits = '' + oNow.getUTCMinutes();
    const sHour = getTwoDigitNumberString(sHourDigits);
    const sMinute = getTwoDigitNumberString(sMinuteDigits);
    const sMonth = aMonthShortNames[nMonthNum];
    const sTime = `${sMonth} ${nDayNum} ${sHour}:${sMinute}`;
    return sTime;
}

const getMonthStamp = function () {
    const oNow = new Date();
    const nMonthNum = oNow.getUTCMonth();
    const nYearNum = oNow.getUTCFullYear();
    const sMonth = aMonthShortNames[nMonthNum];
    const sTime = `${sMonth}-${nYearNum}`;
    return sTime;
}

export { getNiceTime };