import React, { useRef, useState } from "react";
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

	const [currentLocationIndex, internal_setCurrentLocationIndex] = useState(0);
	const [locations, internal_setLocations] = useState<LocationItem[]>([initialLocation]);
	const { saveLocationsToFile } = useLocationsLoader();
	const currentLocationIndexRef = useRef(currentLocationIndex);
	const locationsRef = useRef<LocationItem[]>(locations);

	const [weather, internal_setWeather] = useState<WeatherData>(initialWeatherData);
	const [weatherFetchStatus, setWeatherFetchStatus] = useState(WeatherFetchStatus.NotFetched);
	const { saveWeatherToFile } = useWeatherLoader();

	const setSettings = (newSettings: Settings) =>
	{
		internal_setSettings(newSettings);
		saveSettingsToFile(newSettings);
	};

	const setCurrentLocationIndex = (newCurrentLocationIndex: number) =>
	{
		internal_setCurrentLocationIndex(newCurrentLocationIndex);
		currentLocationIndexRef.current = newCurrentLocationIndex;
		saveLocationsToFile({ currentLocationIndex: newCurrentLocationIndex, locations: locationsRef.current });
	};

	// TODO: Review this vibecoded function
	const setLocations = (newLocations: LocationItem[]) =>
	{
		internal_setLocations(newLocations);
		locationsRef.current = newLocations;

		const safeLocationIndex = newLocations.length > 0 ? Math.min(currentLocationIndexRef.current, newLocations.length - 1) : 0;

		if (safeLocationIndex !== currentLocationIndexRef.current)
		{
			internal_setCurrentLocationIndex(safeLocationIndex);
			currentLocationIndexRef.current = safeLocationIndex;
		}

		saveLocationsToFile({ currentLocationIndex: safeLocationIndex, locations: newLocations });
	};

	const setWeather = (newWeather: WeatherData, _weatherFetchStatus: WeatherFetchStatus = WeatherFetchStatus.Fetched) =>
	{
		internal_setWeather(newWeather);
		setWeatherFetchStatus(_weatherFetchStatus);
		saveWeatherToFile(newWeather);
	};

	return (
		<React.StrictMode>
			<SettingsContext.Provider value={{ settings, setSettings }}>
				<LocationsContext.Provider value={{ currentLocationIndex, setCurrentLocationIndex, locations, setLocations }}>
					<WeatherContext.Provider value={{ weather, setWeather, weatherFetchStatus, setWeatherFetchStatus }}>
						<App/>
					</WeatherContext.Provider>
				</LocationsContext.Provider>
			</SettingsContext.Provider>
		</React.StrictMode>);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<AppRoot/>);