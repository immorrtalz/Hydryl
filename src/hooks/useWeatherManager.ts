import { fetchWeatherApi } from "openmeteo";
import { useContext, useState } from "react";
import WeatherContext, { WeatherFetchStatus } from "../context/WeatherContext";
import { initialWeatherData, WeatherData } from "../misc/weather";
import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { round } from "../misc/utils";

const WEATHER_FILE_NAME = 'weather.json';

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
		"timezone": "auto",
		"forecast_days": 6,
		"forecast_hours": 25,
		"temperature_unit": "celsius", //celsius, fahrenheit
		"wind_speed_unit": "ms", //kmh, ms, mph, kn
		"precipitation_unit": "mm", //mm, inch
	};

	const [, setWeather, weatherFetchStatus, setWeatherFetchStatus] = useContext(WeatherContext);
	const [weatherFetchCooldown, setWeatherFetchCooldown] = useState<NodeJS.Timeout | null>(null);

	const fetchWeather = async () =>
	{
		if (weatherFetchStatus === 2 || weatherFetchCooldown !== null) return Promise.reject("Weather fetch is already in progress or on cooldown.");
		setWeatherFetchCooldown(setTimeout(() => setWeatherFetchCooldown(null), 2000));

		try
		{
			setWeatherFetchStatus(WeatherFetchStatus.Fetching);

			const responses = await fetchWeatherApi(apiUrl, weatherFetchParams);
			const response = responses[0];

			const current = response.current()!;
			const hourly = response.hourly()!;
			const daily = response.daily()!;

			const v = (i: number) => current.variables(i)!.value();

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
					weather_code: v(1),
					temperature_2m: round(v(2)),
					surface_pressure: round(v(3)) * 0.75006156130264, // mbar (hPa) to mmHg
					wind_speed_10m: round(v(4), 1),
					wind_direction_10m: round(v(5)),
					wind_gusts_10m: round(v(6)),
					relative_humidity_2m: round(v(7)),
					precipitation: round(v(8)),
					precipitation_probability: round(v(9)),
					visibility: round(v(10) / 1000, 1), // m -> km
					cloud_cover: round(v(11)),
					uv_index: round(v(12), 1)
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

			setWeather(weatherData, WeatherFetchStatus.Fetched);

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

	/**
		@params `autoFetch` A boolean indicating whether to automatically fetch new weather data if the loaded data is outdated.

		@returns A boolean which indicates whether loading the weather data from file is outdated.

		The weather data is considered outdated if it was fetched 30+ minutes ago.

		If the file does not exist, it will return `true`.

		@example
		```tsx
		const isWeatherOutdated = await loadWeatherFromFile();
		```
	*/
	const loadWeatherFromFile = async (autoFetch: boolean = false): Promise<boolean> =>
	{
		const weatherFileExists = await exists(WEATHER_FILE_NAME, { baseDir: BaseDirectory.AppConfig });

		const readWeatherFile = async (): Promise<WeatherData> =>
		{
			try
			{
				const loadedWeatherContent = await readTextFile(WEATHER_FILE_NAME, { baseDir: BaseDirectory.AppConfig });
				const decodedString = new TextDecoder().decode(new Uint8Array(loadedWeatherContent.match(/.{2}/g)!.map(byte => 255 - parseInt(byte, 16))));

				const loadedWeather: WeatherData = JSON.parse(decodedString, (key, value) =>
					["time", "sunrise", "sunset"].includes(key) ?
						(Array.isArray(value) ? value.map((v: string) => new Date(v)) : new Date(value)) :
						value);

				return loadedWeather === undefined ? initialWeatherData : loadedWeather;
			}
			catch (e) { return initialWeatherData }
		};

		const weatherToSet = weatherFileExists ? await readWeatherFile() : initialWeatherData;
		setWeather(weatherToSet, 1);
		if (!weatherFileExists) saveWeatherToFile(weatherToSet);

		const isSavedWeatherOutdated = (new Date().getTime() - weatherToSet.current.time.getTime() >= 1000 * 60 * 30) || !weatherFileExists;
		if (autoFetch && isSavedWeatherOutdated) fetchWeather().catch(() => {});

		return isSavedWeatherOutdated;
	};

	const saveWeatherToFile = async (weatherData: WeatherData) =>
	{
		const jsonData = JSON.stringify(weatherData);

		// Only ASCII characters are allowed
		if (/[^\x00-\x7F]/.test(jsonData))
		{
			const errorText = "Error saving weather data to file: Non-ASCII characters detected";
			console.error(errorText);
			return Promise.reject(errorText);
		}

		const bytesString = Array.from(new TextEncoder().encode(jsonData)).map(b => (255 - b).toString(16).padStart(2, '0')).join('');
		await writeTextFile(WEATHER_FILE_NAME, bytesString, { baseDir: BaseDirectory.AppConfig });
	}

	return { fetchWeather, loadWeatherFromFile, saveWeatherToFile };
}