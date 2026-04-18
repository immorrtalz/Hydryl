import { exists, readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { useContext } from "react";
import { initialWeatherData, WeatherData } from '../../misc/weather';
import WeatherContext from "../../context/WeatherContext";

const WEATHER_FILE_NAME = 'weather.json';

export default function useWeatherLoader()
{
	const { setWeather } = useContext(WeatherContext);

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
	const loadWeatherFromFile = async (): Promise<boolean> =>
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
		setWeather(weatherToSet, false);
		if (!weatherFileExists) saveWeatherToFile(weatherToSet);

		const isSavedWeatherOutdated = (new Date().getTime() - weatherToSet.current.time.getTime() >= 1000 * 60 * 30) || !weatherFileExists;

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

	return { loadWeatherFromFile, saveWeatherToFile };
}