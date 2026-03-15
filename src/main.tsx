import { useRef, useState } from "react";
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
import LocationContext from "./context/LocationContext";
import { initialLocation, LocationItem } from "./misc/location";
import { useLocationsManager } from "./hooks/useLocationsManager";

function AppRoot()
{
	const [settings, internal_setSettings] = useState<Settings>(initialSettings);
	const { saveSettingsToFile } = useSettingsLoader();

	const [currentLocationIndex, internal_setCurrentLocationIndex] = useState(0);
	const [locations, internal_setLocations] = useState<LocationItem[]>([initialLocation]);
	const { saveLocationsToFile } = useLocationsManager();
	const currentLocationIndexRef = useRef(currentLocationIndex);
	const locationsRef = useRef<LocationItem[]>(locations);

	const [weather, internal_setWeather] = useState<WeatherData>(initialWeatherData);
	const [weatherFetchStatus, setWeatherFetchStatus] = useState(0);
	const { saveWeatherToFile } = useWeatherManager();

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
			<SettingsContext.Provider value={[settings, setSettings]}>
				<LocationContext.Provider value={[currentLocationIndex, setCurrentLocationIndex, locations, setLocations]}>
					<WeatherContext.Provider value={[weather, setWeather, weatherFetchStatus, setWeatherFetchStatus]}>
						<App/>
					</WeatherContext.Provider>
				</LocationContext.Provider>
			</SettingsContext.Provider>
		</React.StrictMode>);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<AppRoot/>);