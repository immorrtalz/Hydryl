import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import SettingsPage from "./pages/Settings";
import { useWeatherManager } from "./hooks/useWeatherManager";
import { useSettingsLoader } from "./hooks/useSettingsLoader";
import Locations from "./pages/Locations";

function App()
{
	const { loadSettingsFromFile } = useSettingsLoader();
	const { loadWeatherFromFile } = useWeatherManager();

	useEffect(() =>
	{
		loadSettingsFromFile();
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
		}
	]);

	return <RouterProvider router={router}/>;
}

export default App;