export type Locale = 'en' | 'ru';

export function translate(key: string, locale: Locale): string
{
	const translations: {[key: string]: {[locale: string]: string }} =
	{
		"monday":
		{
			"en": "Monday",
			"ru": "Понедельник"
		},
		"tuesday":
		{
			"en": "Tuesday",
			"ru": "Вторник"
		},
		"wednesday":
		{
			"en": "Wednesday",
			"ru": "Среда"
		},
		"thursday":
		{
			"en": "Thursday",
			"ru": "Четверг"
		},
		"friday":
		{
			"en": "Friday",
			"ru": "Пятница"
		},
		"saturday":
		{
			"en": "Saturday",
			"ru": "Суббота"
		},
		"sunday":
		{
			"en": "Sunday",
			"ru": "Воскресенье"
		},
		"monday_short":
		{
			"en": "Mon",
			"ru": "Пн"
		},
		"tuesday_short":
		{
			"en": "Tue",
			"ru": "Вт"
		},
		"wednesday_short":
		{
			"en": "Wed",
			"ru": "Ср"
		},
		"thursday_short":
		{
			"en": "Thu",
			"ru": "Чт"
		},
		"friday_short":
		{
			"en": "Fri",
			"ru": "Пт"
		},
		"saturday_short":
		{
			"en": "Sat",
			"ru": "Сб"
		},
		"sunday_short":
		{
			"en": "Sun",
			"ru": "Вс"
		},
		"january":
		{
			"en": "January",
			"ru": "Январь"
		},
		"february":
		{
			"en": "February",
			"ru": "Февраль"
		},
		"march":
		{
			"en": "March",
			"ru": "Март"
		},
		"april":
		{
			"en": "April",
			"ru": "Апрель"
		},
		"may":
		{
			"en": "May",
			"ru": "Май"
		},
		"june":
		{
			"en": "June",
			"ru": "Июнь"
		},
		"july":
		{
			"en": "July",
			"ru": "Июль"
		},
		"august":
		{
			"en": "August",
			"ru": "Август"
		},
		"september":
		{
			"en": "September",
			"ru": "Сентябрь"
		},
		"october":
		{
			"en": "October",
			"ru": "Октябрь"
		},
		"november":
		{
			"en": "November",
			"ru": "Ноябрь"
		},
		"december":
		{
			"en": "December",
			"ru": "Декабрь"
		},
		"clear":
		{
			"en": "Clear",
			"ru": "Ясно"
		},
		"mainly_clear":
		{
			"en": "Mainly clear",
			"ru": "В основном ясно"
		},
		"partly_cloudy":
		{
			"en": "Partly cloudy",
			"ru": "Небольшая облачность"
		},
		"overcast":
		{
			"en": "Overcast",
			"ru": "Облачно"
		},
		"fog":
		{
			"en": "Fog",
			"ru": "Туман"
		},
		"depositing_rime_fog":
		{
			"en": "Depositing rime fog",
			"ru": "Туман с инеем"
		},
		"light_drizzle":
		{
			"en": "Light drizzle",
			"ru": "Лёгкая морось"
		},
		"moderate_drizzle":
		{
			"en": "Moderate drizzle",
			"ru": "Морось"
		},
		"dense_drizzle":
		{
			"en": "Dense drizzle",
			"ru": "Сильная морось"
		},
		"light_freezing_drizzle":
		{
			"en": "Light freezing drizzle",
			"ru": "Лёгкая ледяная морось"
		},
		"dense_freezing_drizzle":
		{
			"en": "Dense freezing drizzle",
			"ru": "Ледяная морось"
		},
		"slight_rain":
		{
			"en": "Slight rain",
			"ru": "Небольшой дождь"
		},
		"moderate_rain":
		{
			"en": "Moderate rain",
			"ru": "Дождь"
		},
		"heavy_rain":
		{
			"en": "Heavy rain",
			"ru": "Сильный дождь"
		},
		"light_freezing_rain":
		{
			"en": "Light freezing rain",
			"ru": "Лёгкий ледяной дождь"
		},
		"heavy_freezing_rain":
		{
			"en": "Heavy freezing rain",
			"ru": "Ледяной дождь"
		},
		"slight_snow_fall":
		{
			"en": "Slight snow fall",
			"ru": "Небольшой снег"
		},
		"moderate_snow_fall":
		{
			"en": "Moderate snow fall",
			"ru": "Снег"
		},
		"heavy_snow_fall":
		{
			"en": "Heavy snow fall",
			"ru": "Сильный снег"
		},
		"snow_grains":
		{
			"en": "Snow grains",
			"ru": "Сильный снег"
		},
		"slight_rain_showers":
		{
			"en": "Slight rain showers",
			"ru": "Небольшой ливень"
		},
		"moderate_rain_showers":
		{
			"en": "Moderate rain showers",
			"ru": "Ливень"
		},
		"violent_rain_showers":
		{
			"en": "Violent rain showers",
			"ru": "Сильный ливень"
		},
		"slight_snow_showers":
		{
			"en": "Slight snow showers",
			"ru": "Небольшой снегопад"
		},
		"heavy_snow_showers":
		{
			"en": "Heavy snow showers",
			"ru": "Сильный снегопад"
		},
		"thunderstorm":
		{
			"en": "Thunderstorm",
			"ru": "Гроза"
		},
		"thunderstorm_with_slight_hail":
		{
			"en": "Thunderstorm with slight hail",
			"ru": "Гроза с небольшим градом"
		},
		"thunderstorm_with_heavy_hail":
		{
			"en": "Thunderstorm with heavy hail",
			"ru": "Гроза с сильным градом"
		}
	};

	return translations[key]?.[locale] ?? key;
}

export function translateWeekday(weekday: number, locale: Locale, useShortWeekday: boolean = false): string
{
	if (weekday < 0 || weekday > 6) return "??";
	const weekdaysKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	return translate(weekdaysKeys[weekday] + (useShortWeekday ? "_short" : ""), locale);
}

export function translateMonth(month: number, locale: Locale, useShortMonth: boolean = false): string
{
	if (month < 0 || month > 11) return "???";
	const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
	return translate(monthKeys[month], locale).substring(0, useShortMonth ? 3 : undefined);
}