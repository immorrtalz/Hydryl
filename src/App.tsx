import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import SettingsPage from "./pages/Settings";
import { useWeatherManager } from "./hooks/useWeatherManager";
import { useSettingsLoader } from "./hooks/useSettingsLoader";

function App()
{
	const { loadSettingsFromFile } = useSettingsLoader();
	const { weather, fetchWeather } = useWeatherManager();
	const [isWeatherFetched, setIsWeatherFetched] = useState(false);

	useEffect(() => { loadSettingsFromFile() }, []);

	let router = createBrowserRouter([
		{
			index: true,
			Component: Home,
			loader: async () =>
			{
				try
				{
					if (isWeatherFetched) return { weather, isWeatherFetched };
					await fetchWeather();
					setIsWeatherFetched(true);
				}
				catch (e) { console.warn("Failed to fetch weather:", e) }

				return { weather, isWeatherFetched };
			}
		},
		{
			path: "settings",
			Component: SettingsPage
		}
	]);

	return <RouterProvider router={router}/>;
}

export default App;