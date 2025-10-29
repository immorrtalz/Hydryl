import { fetchWeatherApi } from "openmeteo";
import { useState } from "react";
import { Locale, translate } from "../misc/translations";

export interface WeatherData
{
	current:
	{
		time: Date;
		is_day: boolean;
		weather_code: number;
		temperature_2m: number;
		surface_pressure: number;
		wind_speed_10m: number;
		wind_direction_10m: number;
		wind_gusts_10m: number;
		relative_humidity_2m: number;
		precipitation: number;
		precipitation_probability: number;
		visibility: number;
		cloud_cover: number;
		uv_index: number;
	};
	hourly:
	{
		time: Date[];
		is_day: boolean[];
		weather_code: number[];
		temperature_2m: number[];
		precipitation_probability: number[];
	};
	daily:
	{
		time: Date[];
		weather_code: number[];
		temperature_2m_min: number[];
		temperature_2m_max: number[];
		wind_direction_10m_dominant: number[];
		wind_speed_10m_max: number[];
		sunrise: Date[];
		sunset: Date[];
		precipitation_probability_max: number[];
	};
}

export function useWeatherManager()
{
	const apiUrl = "https://api.open-meteo.com/v1/forecast";

	var weatherFetchParams =
	{
		"latitude": 54.7431,
		"longitude": 55.9678,
		"daily": ["weather_code", "temperature_2m_min", "temperature_2m_max", "wind_direction_10m_dominant", "wind_speed_10m_max", "sunrise", "sunset", "precipitation_probability_max"],
		"hourly": ["is_day", "weather_code", "temperature_2m", "precipitation_probability"],
		"models": "best_match",
		"current": ["is_day", "weather_code", "temperature_2m", "surface_pressure", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
			"relative_humidity_2m", "precipitation", "precipitation_probability", "visibility", "cloud_cover", "uv_index"],
		"timezone": "GMT+5",
		"forecast_days": 8,
		"forecast_hours": 25,
		"temperature_unit": "celsius", //celsius, fahrenheit
		"wind_speed_unit": "ms", //kmh, ms, mph, kn
		"precipitation_unit": "mm", //mm, inch
	};

	const [weatherFetchState, setWeatherFetchState] = useState<'idle' | 'fetching'>('idle');

	const setLocationCoords = (latitude: number, longitude: number) =>
	{
		weatherFetchParams.latitude = latitude;
		weatherFetchParams.longitude = longitude;
	};

	const setTemperatureUnit = (unit: 'celsius' | 'fahrenheit') => weatherFetchParams.temperature_unit = unit;
	const setWindSpeedUnit = (unit: 'kmh' | 'ms' | 'mph' | 'kn') => weatherFetchParams.wind_speed_unit = unit;
	const setPrecipitationUnit = (unit: 'mm' | 'inch') => weatherFetchParams.precipitation_unit = unit;

	const fetchWeather = async (): Promise<WeatherData | null> =>
	{
		if (weatherFetchState === 'fetching') return null;

		try
		{
			setWeatherFetchState('fetching');

			const responses = await fetchWeatherApi(apiUrl, weatherFetchParams);
			const response = responses[0];

			const latitude = response.latitude();
			const longitude = response.longitude();
			const elevation = response.elevation(); // meters above sea level
			const timezone = response.timezone();
			const timezoneAbbreviation = response.timezoneAbbreviation();
			const utcOffsetSeconds = response.utcOffsetSeconds();

			const current = response.current()!;
			const hourly = response.hourly()!;
			const daily = response.daily()!;

			// Note: The order of weather variables in the URL query and the indices below need to match!
			const weatherData: WeatherData =
			{
				current:
				{
					time: new Date((Number(current.time())/*  + utcOffsetSeconds */) * 1000),
					is_day: Boolean(current.variables(0)!.value()),
					weather_code: current.variables(1)!.value(),
					temperature_2m: Math.round(current.variables(2)!.value()),
					surface_pressure: Math.round(current.variables(3)!.value() * 0.75006156130264), // mbar (hPa) to mmHg
					wind_speed_10m: Math.round(current.variables(4)!.value() * 10) / 10,
					wind_direction_10m: Math.round(current.variables(5)!.value()),
					wind_gusts_10m: Math.round(current.variables(6)!.value()),
					relative_humidity_2m: current.variables(7)!.value(),
					precipitation: Math.round(current.variables(8)!.value()),
					precipitation_probability: Math.round(current.variables(9)!.value()),
					visibility: Math.round(current.variables(10)!.value() / 100) / 10,
					cloud_cover: Math.round(current.variables(11)!.value()),
					uv_index: Math.round(current.variables(12)!.value() * 10) / 10,
				},
				hourly:
				{
					time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())]
						.map((_, i) => new Date((Number(hourly.time()) + i * hourly.interval()) * 1000)),
					is_day: Array.from(hourly.variables(0)!.valuesArray() || []).map(value => Boolean(value)),
					weather_code: Array.from(hourly.variables(1)!.valuesArray() || []),
					temperature_2m: Array.from(hourly.variables(2)!.valuesArray()!.map(value => Math.round(value))),
					precipitation_probability: Array.from(hourly.variables(3)!.valuesArray() || []).map(value => Math.round(value))
				},
				daily:
				{
					time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())]
						.map((_, i) => new Date((Number(daily.time()) + i * daily.interval()) * 1000)),
					weather_code: Array.from(daily.variables(0)!.valuesArray() || []),
					temperature_2m_min: Array.from(daily.variables(1)!.valuesArray()!.map(value => Math.round(value))),
					temperature_2m_max: Array.from(daily.variables(2)!.valuesArray()!.map(value => Math.round(value))),
					wind_direction_10m_dominant: Array.from(daily.variables(3)!.valuesArray() || []).map(value => Math.round(value)),
					wind_speed_10m_max: Array.from(daily.variables(4)!.valuesArray() || []).map(value => Math.round(value * 10) / 10),
					sunrise: [...Array(daily.variables(5)!.valuesInt64Length())]
						.map((_, i) => new Date((Number(daily.variables(5)!.valuesInt64(i))) * 1000)),
					sunset: [...Array(daily.variables(6)!.valuesInt64Length())]
						.map((_, i) => new Date((Number(daily.variables(6)!.valuesInt64(i))) * 1000)),
					precipitation_probability_max: Array.from(daily.variables(7)!.valuesArray() || []).map(value => Math.round(value))
				}
			};

			/* console.log(weatherData.hourly); */
			/* console.log(weatherData.daily); */

			setWeatherFetchState('idle');

			return weatherData;
		}
		catch (error)
		{
			setWeatherFetchState('idle');
			console.error("Error fetching weather data:", error);
			return null;
		}
	};

	return { weatherFetchState, setLocationCoords, setTemperatureUnit, setWindSpeedUnit, setPrecipitationUnit, fetchWeather };
}

export const weatherCodeToText = (code: number, locale: Locale): string =>
{
	const weatherTranslationKeys: Record<number, string> =
	{
		0: "clear",
		1: "mainly_clear",
		2: "partly_cloudy",
		3: "overcast",
		45: "fog",
		48: "depositing_rime_fog",
		51: "light_drizzle",
		53: "moderate_drizzle",
		55: "dense_drizzle",
		56: "light_freezing_drizzle",
		57: "dense_freezing_drizzle",
		61: "slight_rain",
		63: "moderate_rain",
		65: "heavy_rain",
		66: "light_freezing_rain",
		67: "heavy_freezing_rain",
		71: "slight_snow_fall",
		73: "moderate_snow_fall",
		75: "heavy_snow_fall",
		77: "snow_grains",
		80: "slight_rain_showers",
		81: "moderate_rain_showers",
		82: "violent_rain_showers",
		85: "slight_snow_showers",
		86: "heavy_snow_showers",
		95: "thunderstorm",
		96: "thunderstorm_with_slight_hail",
		99: "thunderstorm_with_heavy_hail"
	};

	return translate(weatherTranslationKeys[code], locale) || "Unknown";
};

export const weatherCodeToSVGName = (code: number, isDay: boolean): string =>
{
	const weatherNames: Record<number, string> =
	{
		0: isDay ? "sun" : "moon",
		1: isDay ? "sun" : "moon",
		2: isDay ? "cloudSun" : "cloudMoon",
		3: "cloud",
		45: "fog",
		48: "rimeFog",
		51: "cloudDrizzle",
		53: "cloudDrizzle",
		55: "cloudDrizzle",
		56: "cloudDrizzle",
		57: "cloudDrizzle",
		61: "cloudRain",
		63: "cloudRain",
		65: "cloudHeavyRain",
		66: "cloudRain",
		67: "cloudHeavyRain",
		71: "snow",
		73: "heavySnow",
		75: "snowStorm",
		77: "snowGrains",
		80: "cloudHeavyRain",
		81: "cloudHeavyRain",
		82: "cloudHeavyRain",
		85: "snowStorm",
		86: "snowStorm",
		95: "cloudThunderstorm",
		96: "cloudThunderstorm",
		99: "cloudThunderstorm"
	};

	return weatherNames[code] ?? "sun";
};

export const degreesToCompassDirection = (degrees: number, locale: Locale): string =>
{
	const directions = ["wind_N", "wind_NW", "wind_W", "wind_SW", "wind_S", "wind_SE", "wind_E", "wind_NE"];
	return translate(directions[Math.ceil(((degrees - 22.5) / 45))], locale);
};

export const uvIndexToText = (uvIndex: number, locale: Locale): string =>
{
	const key = uvIndex <= 2 ? "uv_low" : uvIndex <= 5 ? "uv_moderate" : uvIndex <= 7 ? "uv_high" : uvIndex <= 10 ? "uv_very_high" : "uv_extreme";
	return translate(key, locale);
};