import { fetchWeatherApi } from "openmeteo";
import { useContext, useState } from "react";
import WeatherContext from "../context/WeatherContext";
import { initialWeatherData, WeatherData } from "../misc/weather";
import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const WEATHER_FILE_NAME = 'weather';

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
		"forecast_days": 6,
		"forecast_hours": 25,
		"temperature_unit": "celsius", //celsius, fahrenheit
		"wind_speed_unit": "ms", //kmh, ms, mph, kn
		"precipitation_unit": "mm", //mm, inch
	};

	const [isWeatherFetching, setWeatherFetching] = useState<boolean>(false);
	const [, setWeather,, setWeatherFetchStatus] = useContext(WeatherContext);

	/* const setLocationCoords = (latitude: number, longitude: number, refetchWeather: boolean = false) =>
	{
		weatherFetchParams.latitude = latitude;
		weatherFetchParams.longitude = longitude;

		if (refetchWeather) fetchWeather().catch(() => {});
	}; */

	const fetchWeather = async () =>
	{
		if (isWeatherFetching) return;

		try
		{
			setWeatherFetching(true);
			setWeatherFetchStatus(0);

			const responses = await fetchWeatherApi(apiUrl, weatherFetchParams);
			const response = responses[0];

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

			setWeatherFetching(false);
			setWeather(weatherData, 1);
		}
		catch (e)
		{
			setWeatherFetching(false);
			setWeatherFetchStatus(-1);
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

	return { fetchWeather/* , setLocationCoords */, loadWeatherFromFile, saveWeatherToFile };
}