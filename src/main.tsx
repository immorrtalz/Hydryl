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
import { initialLocation, LocationItem, validateLocationItem } from "./misc/locations";
import { initialWeatherData, WeatherData, WeatherFetchStatus } from "./misc/weather";

import App from "./App";

import useTranslations from "./hooks/useTranslations";

function AppRoot()
{
	const { translate } = useTranslations();

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
		const localNewLocations = [...newLocations];
		const currentLocationsCount = localNewLocations.reduce((count, loc) => count + (loc.isCurrent ? 1 : 0), 0);

		if (currentLocationsCount === 0) localNewLocations[0].isCurrent = true;
		else if (currentLocationsCount > 1)
		{
			for (let i = 0; i < localNewLocations.length; i++)
				localNewLocations[i].isCurrent = i === 0;
		}

		localNewLocations.map(loc => validateLocationItem(loc, translate('new_location')));

		internal_setLocations(localNewLocations);
		setWeatherFetchStatus(WeatherFetchStatus.NotFetched);
		if (saveToFile) saveLocationsToFile({ locations: localNewLocations });
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