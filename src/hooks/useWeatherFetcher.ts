import { useContext, useState } from "react";
import { fetchWeatherApi } from "openmeteo";
import LocationContext from "../context/LocationsContext";
import WeatherContext from "../context/WeatherContext";
import { WeatherData, WeatherFetchStatus } from "../misc/weather";
import { round } from "../misc/utils";

const API_URL = "https://api.open-meteo.com/v1/forecast";

export default function useWeatherFetcher()
{
	const { currentLocationIndex, locations } = useContext(LocationContext);

	let weatherFetchParams =
	{
		"latitude": locations[currentLocationIndex].latitude,
		"longitude": locations[currentLocationIndex].longitude,
		"daily": ["weather_code", "temperature_2m_min", "temperature_2m_max", "wind_direction_10m_dominant", "wind_speed_10m_max", "sunrise", "sunset", "precipitation_probability_max"],
		"hourly": ["is_day", "weather_code", "temperature_2m", "precipitation_probability"],
		"models": "best_match",
		"current": ["is_day", "weather_code", "temperature_2m", "surface_pressure", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
			"relative_humidity_2m", "precipitation", "precipitation_probability", "visibility", "cloud_cover", "uv_index"],
		"timezone": "auto",
		"forecast_days": 6,
		"forecast_hours": 25,
		"temperature_unit": "celsius", //celsius, fahrenheit
		"wind_speed_unit": "ms", //kmh, ms, mph, kn
		"precipitation_unit": "mm", //mm, inch
	};

	const { setWeather, weatherFetchStatus, setWeatherFetchStatus } = useContext(WeatherContext);
	const [weatherFetchCooldown, setWeatherFetchCooldown] = useState<NodeJS.Timeout | null>(null);

	const fetchWeather = async () =>
	{
		if (weatherFetchStatus === WeatherFetchStatus.Fetching || weatherFetchCooldown !== null) return Promise.reject("Weather fetch is already in progress or on cooldown.");
		setWeatherFetchCooldown(setTimeout(() =>
		{
			if (weatherFetchCooldown !== null)
			{
				clearTimeout(weatherFetchCooldown);
				setWeatherFetchCooldown(null);
			}
		}, 2000));

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

			// Note: The order of weather variables in the URL query and the indices below need to match!
			const weatherData: WeatherData =
			{
				current:
				{
					time: new Date(Number(current.time()) * 1000),
					is_day: Boolean(current.variables(0)!.value()),
					weather_code: cV(1),
					temperature_2m: round(cV(2)),
					surface_pressure: round(cV(3)) * 0.75006156130264, // mbar (hPa) to mmHg
					wind_speed_10m: round(cV(4), 1),
					wind_direction_10m: round(cV(5)),
					wind_gusts_10m: round(cV(6)),
					relative_humidity_2m: round(cV(7)),
					precipitation: round(cV(8)),
					precipitation_probability: round(cV(9)),
					visibility: round(cV(10) / 1000, 1), // m -> km
					cloud_cover: round(cV(11)),
					uv_index: round(cV(12), 1)
				},
				hourly:
				{
					time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())]
						.map((_, i) => new Date((Number(hourly.time()) + i * hourly.interval()) * 1000)),
					is_day: mappedHVArr(0, Boolean),
					weather_code: hVArr(1),
					temperature_2m: mappedHVArr(2, round),
					precipitation_probability: mappedHVArr(3, round)
				},
				daily:
				{
					time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())]
						.map((_, i) => new Date((Number(daily.time()) + i * daily.interval()) * 1000)),
					weather_code: dVArr(0),
					temperature_2m_min: mappedDVArr(1, round),
					temperature_2m_max: mappedDVArr(2, round),
					wind_direction_10m_dominant: mappedDVArr(3, round),
					wind_speed_10m_max: mappedDVArr(4, val => round(val, 1)),
					sunrise: int64LengthDVArr(5).map((_, i) => new Date((Number(int64DVArr(5, i))) * 1000)),
					sunset: int64LengthDVArr(6).map((_, i) => new Date((Number(int64DVArr(6, i))) * 1000)),
					precipitation_probability_max: mappedDVArr(7, round)
				}
			};

			setWeather(weatherData);
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