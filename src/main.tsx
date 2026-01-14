import { useState } from "react";
import ReactDOM from "react-dom/client";
import './global.scss';
import App from "./App";
import SettingsContext from "./context/SettingsContext";
import { initialSettings, Settings } from "./misc/settings";
import { useSettingsLoader } from "./hooks/useSettingsLoader";
import WeatherContext, { WeatherFetchStatus } from "./context/WeatherContext";
import { initialWeatherData, WeatherData } from "./misc/weather";
import { useWeatherManager } from "./hooks/useWeatherManager";
import React from "react";

function AppRoot()
{
	const [settings, internal_setSettings] = useState<Settings>(initialSettings);
	const { saveSettingsToFile } = useSettingsLoader();

	const [weather, internal_setWeather] = useState<WeatherData>(initialWeatherData);
	const [weatherFetchStatus, setWeatherFetchStatus] = useState(0);
	const { saveWeatherToFile } = useWeatherManager();

	const setSettings = (newSettings: Settings) =>
	{
		internal_setSettings(newSettings);
		saveSettingsToFile(newSettings);
	};

	const setWeather = (newWeather: WeatherData, _weatherFetchStatus: WeatherFetchStatus = WeatherFetchStatus.Fetched) =>
	{
		internal_setWeather(newWeather);
		setWeatherFetchStatus(_weatherFetchStatus);
		saveWeatherToFile(newWeather);
	};

	return (
		<React.StrictMode>
			<SettingsContext.Provider value={[settings, setSettings]}>
				<WeatherContext.Provider value={[weather, setWeather, weatherFetchStatus, setWeatherFetchStatus]}>
					<App/>
				</WeatherContext.Provider>
			</SettingsContext.Provider>
		</React.StrictMode>);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<AppRoot/>);