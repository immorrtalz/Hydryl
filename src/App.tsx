import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import useSettingsLoader from "./hooks/Loaders/useSettingsLoader";
import useLocationsLoader from "./hooks/Loaders/useLocationsLoader";
import useWeatherLoader from "./hooks/Loaders/useWeatherLoader";

import Home from "./pages/Home";
import SettingsPage from "./pages/Settings";
import Locations from "./pages/Locations";
import AddLocation from "./pages/AddLocation";

function App()
{
	const { loadSettingsFromFile } = useSettingsLoader();
	const { loadLocationsFromFile } = useLocationsLoader();
	const { loadWeatherFromFile } = useWeatherLoader();

	useEffect(() =>
	{
		loadSettingsFromFile();
		loadLocationsFromFile();
		loadWeatherFromFile();
	}, []);

	const router = createBrowserRouter([
		{
			index: true,
			Component: Home
		},
		{
			path: "settings",
			Component: SettingsPage
		},
		{
			path: "locations",
			Component: Locations
		},
		{
			path: "addlocation",
			Component: AddLocation
		}
	]);

	return <RouterProvider router={router}/>;
}

export default App;