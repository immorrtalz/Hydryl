import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import SettingsPage from "./pages/Settings";
import Locations from "./pages/Locations";
import AddLocation from "./pages/AddLocation";
import { useSettingsLoader } from "./hooks/useSettingsLoader";
import { useLocationsManager } from "./hooks/useLocationsManager";
import { useWeatherManager } from "./hooks/useWeatherManager";

function App()
{
	const { loadSettingsFromFile } = useSettingsLoader();
	const { loadLocationsFromFile } = useLocationsManager();
	const { loadWeatherFromFile } = useWeatherManager();

	useEffect(() =>
	{
		loadSettingsFromFile();
		loadLocationsFromFile();
		loadWeatherFromFile(true);
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