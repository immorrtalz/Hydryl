export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

export const lerpHexColors = (color1: string, color2: string, t: number): string =>
{
	const r1 = parseInt(color1.slice(1, 3), 16);
	const g1 = parseInt(color1.slice(3, 5), 16);
	const b1 = parseInt(color1.slice(5, 7), 16);

	const r2 = parseInt(color2.slice(1, 3), 16);
	const g2 = parseInt(color2.slice(3, 5), 16);
	const b2 = parseInt(color2.slice(5, 7), 16);

	const r = Math.round(r1 + (r2 - r1) * t);
	const g = Math.round(g1 + (g2 - g1) * t);
	const b = Math.round(b1 + (b2 - b1) * t);

	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const lerpHexColorsWithStops = (stops: Array<{ color: string; position: number }>, t: number): string =>
{
	const sortedStops = [...stops].sort((a, b) => a.position - b.position);

	if (t <= sortedStops[0].position) return sortedStops[0].color;
	if (t >= sortedStops[sortedStops.length - 1].position) return sortedStops[sortedStops.length - 1].color;

	for (let i = 0; i < sortedStops.length - 1; i++)
	{
		if (t >= sortedStops[i].position && t <= sortedStops[i + 1].position)
		{
			const localT = (t - sortedStops[i].position) / (sortedStops[i + 1].position - sortedStops[i].position);
			return lerpHexColors(sortedStops[i].color, sortedStops[i + 1].color, localT);
		}
	}

	return sortedStops[0].color;
};

export const formatTimeFromDate = (date: Date, is12HourFormat: boolean = false, zeroMinutes: boolean = false): string =>
	formatTime(date.getHours(), date.getMinutes(), is12HourFormat, zeroMinutes);

export const formatTime = (hours: number, minutes: number, is12HourFormat: boolean = false, zeroMinutes: boolean = false): string =>
{
	const newHours = formatHoursAsNumber(hours, is12HourFormat);
	const suffix = is12HourFormat ? ` ${hours < 12 ? 'A' : 'P'}M` : '';
	return `${newHours}:${zeroMinutes ? "00" : minutes.toString().padStart(2, '0')}${suffix}`;
};

export const formatHoursFromDate = (date: Date, is12HourFormat: boolean = false): string =>
	formatHours(date.getHours(), is12HourFormat);

export const formatHours = (hours: number, is12HourFormat: boolean = false): string =>
{
	const suffix = is12HourFormat ? ` ${hours < 12 ? 'A' : 'P'}M` : ':00';
	return `${formatHoursAsNumber(hours, is12HourFormat)}${suffix}`;
};

const formatHoursAsNumber = (hours: number, is12HourFormat: boolean = false): number =>
{
	var newHours = hours;

	if (is12HourFormat && hours > 12)
	{
		newHours %= 12;
		if (newHours === 0) newHours = 12;
	}

	return newHours;
};

export const getCurrentTimeInTimezone = (ianaTimeZone: string, is12HourFormat: boolean = false): string =>
{
	try
	{
		let date = new Date();
		date.setSeconds(0, 0);
		date = new Date(date.toLocaleString('en-US', { timeZone: ianaTimeZone }));
		return formatTimeFromDate(date, is12HourFormat);
	}
	catch (e) { return ''; }
};

export const getTimeZoneUTCOffset = (ianaTimeZone: string): string =>
{
	const now = new Date();
	now.setSeconds(0, 0);

	// Format current time in `ianaTimeZone` as `M/DD/YYYY, HH:MM:SS`:
	const tzDateString = now.toLocaleString('en-US',
	{
		timeZone: ianaTimeZone,
		hourCycle: 'h23',
	});

	// Parse formatted date string:
	const match = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/.exec(tzDateString);
	if (match === null) return "";
	const [_, month, day, year, hour, min] = match.map(Number);

	// Change date string's time zone to UTC and get timestamp:
	const tzTime = Date.UTC(year, month - 1, day, hour, min);

	// Return the offset between UTC and target time zone:
	const UTCOffsetMinutes = Math.floor((tzTime - now.getTime()) / (1000 * 60));
	const hours = Math.floor(UTCOffsetMinutes / 60);
	const minutes = UTCOffsetMinutes % 60;
	return `UTC${hours >= 0 ? "+" : ""}${hours}${minutes > 0 ? ":" + minutes.toString().padStart(2, "0") : ""}`;
};

/**
	@param `num` A number to be rounded.
	@param `fractionDigits` The number of decimal places to round to. Must be an integer between 0 and 20 (inclusive). If it's out of range or not an integer, it will be clamped to the nearest valid integer value.
	@returns The rounded number.
*/
export const round = (num: number, fractionDigits: number = 0): number =>
{
	const digits = fractionDigits < 0 || fractionDigits > 20 ? clamp(fractionDigits, 0, 20) : (Number.isInteger(fractionDigits) ? fractionDigits : Math.round(fractionDigits));
	return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
};

export const addHoursToDate = (date: Date, hours: number): Date =>
{
	const result = new Date(date);
	result.setTime(result.getTime() + hours * 60 * 60 * 1000);
	return result;
};