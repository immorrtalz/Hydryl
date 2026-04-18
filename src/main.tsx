import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import './global.scss';

import SettingsContext from "./context/SettingsContext";
import LocationsContext from "./context/LocationsContext";
import WeatherContext from "./context/WeatherContext";

import useSettingsLoader from "./hooks/Loaders/useSettingsLoader";
import useLocationsLoader from "./hooks/Loaders/useLocationsLoader";
import useWeatherLoader from "./hooks/Loaders/useWeatherLoader";

import { initialSettings, Settings } from "./misc/settings";
import { initialLocation, LocationItem } from "./misc/locations";
import { initialWeatherData, WeatherData, WeatherFetchStatus } from "./misc/weather";

import App from "./App";

function AppRoot()
{
	const [settings, internal_setSettings] = useState<Settings>(initialSettings);
	const { saveSettingsToFile } = useSettingsLoader();

	const [locations, internal_setLocations] = useState<LocationItem[]>([initialLocation]);
	const { saveLocationsToFile } = useLocationsLoader();

	const [weather, internal_setWeather] = useState<WeatherData>(initialWeatherData);
	const [weatherFetchStatus, setWeatherFetchStatus] = useState(WeatherFetchStatus.NotFetched);
	const { saveWeatherToFile } = useWeatherLoader();

	const setSettings = (newSettings: Settings, saveToFile: boolean) =>
	{
		internal_setSettings(newSettings);
		if (saveToFile) saveSettingsToFile(newSettings);
	};

	const setLocations = (newLocations: LocationItem[], saveToFile: boolean) =>
	{
		internal_setLocations(newLocations);
		if (saveToFile) saveLocationsToFile({ locations: newLocations });
	};

	const setWeather = (newWeather: WeatherData, saveToFile: boolean) =>
	{
		internal_setWeather(newWeather);
		if (saveToFile) saveWeatherToFile(newWeather);
	};

	return (
		<React.StrictMode>
			<SettingsContext.Provider value={{ settings, setSettings }}>
				<LocationsContext.Provider value={{ locations, setLocations }}>
					<WeatherContext.Provider value={{ weather, setWeather, weatherFetchStatus, setWeatherFetchStatus }}>
						<App/>
					</WeatherContext.Provider>
				</LocationsContext.Provider>
			</SettingsContext.Provider>
		</React.StrictMode>);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<AppRoot/>);