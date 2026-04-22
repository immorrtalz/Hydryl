import { useContext, useState } from "react";
import { fetchWeatherApi } from "openmeteo";
import LocationContext from "../context/LocationsContext";
import WeatherContext from "../context/WeatherContext";
import { WeatherData, WeatherFetchStatus } from "../misc/weather";
import { lerp, round } from "../misc/utils";
import { initialLocation } from "../misc/locations";

const API_URL = "https://api.open-meteo.com/v1/forecast";
// Open meteo has an issue - temperature is always a little higher that it should be, and apparent temperature is usually much closer to technically real one,
// so they're being averaged, and just temperature (not apparent) gets more weight
const TEMPERATURE_WEIGHT_OVER_APPARENT = 0.25;

export default function useWeatherFetcher()
{
	const { locations } = useContext(LocationContext);

	let weatherFetchParams =
	{
		"latitude": locations.find(loc => loc.isCurrent)?.latitude || initialLocation.latitude,
		"longitude": locations.find(loc => loc.isCurrent)?.longitude || initialLocation.longitude,
		"daily": ["weather_code", "temperature_2m_min", "temperature_2m_max", "apparent_temperature_min", "apparent_temperature_max", "wind_direction_10m_dominant", "wind_speed_10m_max", "sunrise", "sunset", "precipitation_probability_max"],
		"hourly": ["is_day", "weather_code", "temperature_2m", "apparent_temperature", "precipitation_probability"],
		"models": "best_match",
		"current": ["is_day", "weather_code", "temperature_2m", "apparent_temperature", "surface_pressure", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
			"relative_humidity_2m", "precipitation", "precipitation_probability", "visibility", "cloud_cover", "uv_index"],
		"timezone": "auto",
		"forecast_days": 6,
		"forecast_hours": 25,
		"temperature_unit": "celsius", //celsius, fahrenheit
		"wind_speed_unit": "ms", //kmh, ms, mph, kn
		"precipitation_unit": "mm", //mm, inch
	};

	const { setWeather, weatherFetchStatus, setWeatherFetchStatus } = useContext(WeatherContext);
	const [weatherFetchCooldown, setWeatherFetchCooldown] = useState<number | null>(null);

	const fetchWeather = async () =>
	{
		if (weatherFetchStatus === WeatherFetchStatus.Fetching || weatherFetchCooldown !== null)
			return Promise.reject("Weather fetch is already in progress or on cooldown.");

		const cooldown = setTimeout(() =>
		{
			if (weatherFetchCooldown !== null) clearTimeout(weatherFetchCooldown);
			setWeatherFetchCooldown(null);
		}, 2000);

		setWeatherFetchCooldown(cooldown);

		try
		{
			setWeatherFetchStatus(WeatherFetchStatus.Fetching);

			const responses = await fetchWeatherApi(API_URL, weatherFetchParams);
			const response = responses[0];

			const current = response.current();
			const hourly = response.hourly();
			const daily = response.daily();

			if (current === null || current.variablesLength() === 0
				|| hourly === null || hourly.variablesLength() === 0
				|| daily === null || daily.variablesLength() === 0)
				return Promise.reject("Failed to fetch weather data.");

			const cV = (i: number) => current.variables(i)!.value();

			const hVArr = (i: number) => Array.from(hourly.variables(i)!.valuesArray() || []);
			const mappedHVArr = <T>(i: number, mapFn: (v: number) => T) => hVArr(i).map(val => mapFn(val));
			const dVArr = (i: number) => Array.from(daily.variables(i)!.valuesArray() || []);
			const mappedDVArr = <T>(i: number, mapFn: (v: number) => T) => dVArr(i).map(val => mapFn(val));
			const int64LengthDVArr = (i: number) => [...Array(daily.variables(i)!.valuesInt64Length())];
			const int64DVArr = (i: number, j: number) => daily.variables(i)!.valuesInt64(j);

			const lerpTwoNumbersArrays = (array1: number[], array2: number[], t: number): number[] =>
				array1.length === 0 || array2.length === 0 || array1.length !== array2.length ? [] : array1.map((val, i) => lerp(val, array2[i], t));

			// Note: The order of weather variables in the URL query and the indices below need to match!
			const weatherData: WeatherData =
			{
				current:
				{
					time: new Date(Number(current.time()) * 1000),
					isDay: Boolean(current.variables(0)!.value()),
					weatherCode: cV(1),
					temperature: round(lerp(cV(2), cV(3), TEMPERATURE_WEIGHT_OVER_APPARENT)),
					surfacePressure: round(cV(4)) * 0.75006156130264, // mbar (hPa) to mmHg
					windSpeed: round(cV(5), 1),
					windDirection: round(cV(6)),
					windGusts: round(cV(7)),
					relativeHumidity: round(cV(8)),
					precipitation: round(cV(9)),
					precipitationProbability: round(cV(10)),
					visibility: round(cV(11) / 1000, 1), // m -> km
					cloudCover: round(cV(12)),
					uvIndex: round(cV(13), 1)
				},
				hourly:
				{
					time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())]
						.map((_, i) => new Date((Number(hourly.time()) + i * hourly.interval()) * 1000)),
					isDay: mappedHVArr(0, Boolean),
					weatherCode: hVArr(1),
					temperature: lerpTwoNumbersArrays(hVArr(2), hVArr(3), TEMPERATURE_WEIGHT_OVER_APPARENT).map(val => round(val)),
					precipitationProbability: mappedHVArr(4, round)
				},
				daily:
				{
					time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())]
						.map((_, i) => new Date((Number(daily.time()) + i * daily.interval()) * 1000)),
					weatherCode: dVArr(0),
					temperatureMin: lerpTwoNumbersArrays(dVArr(1), dVArr(3), TEMPERATURE_WEIGHT_OVER_APPARENT).map(val => round(val)),
					temperatureMax: lerpTwoNumbersArrays(dVArr(2), dVArr(4), TEMPERATURE_WEIGHT_OVER_APPARENT).map(val => round(val)),
					windDirectionDominant: mappedDVArr(5, round),
					windSpeedMax: mappedDVArr(6, val => round(val, 1)),
					sunrise: int64LengthDVArr(7).map((_, i) => new Date((Number(int64DVArr(7, i))) * 1000)),
					sunset: int64LengthDVArr(8).map((_, i) => new Date((Number(int64DVArr(8, i))) * 1000)),
					precipitationProbabilityMax: mappedDVArr(9, round)
				}
			};

			setWeather(weatherData, true);
			setWeatherFetchStatus(WeatherFetchStatus.Fetched);

			return weatherData;
		}
		catch (e)
		{
			setWeatherFetchStatus(WeatherFetchStatus.Error);
			const errorHeader = "Error fetching weather data:";
			console.error(errorHeader, e);
			return Promise.reject(`${errorHeader} ${e}`);
		}
	};

	return { fetchWeather };
}