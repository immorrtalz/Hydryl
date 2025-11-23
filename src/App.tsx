import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import SettingsContext from './context/SettingsContext';
import { initialSettings, Settings } from "./misc/settings";
import Home from "./pages/Home";
import SettingsPage from "./pages/Settings";
import { useWeatherManager } from "./hooks/useWeatherManager";

function App()
{
	const [settings, setSettings] = useState<Settings>(initialSettings);
	const { weather, fetchWeather } = useWeatherManager();
	const [isWeatherFetched, setIsWeatherFetched] = useState(false);

	let router = createBrowserRouter([
		{
			path: "/",
			Component: Home,
			loader: async () =>
			{
				try
				{
					if (isWeatherFetched) return { weather, isWeatherFetched };
					await fetchWeather();
					setIsWeatherFetched(true);
				}
				catch (error) { console.warn("Failed to fetch weather:", error) }

				return { weather, isWeatherFetched };
			},
		},
		{
			path: "settings",
			Component: SettingsPage,
		},
	]);

	return (
		<SettingsContext value={[settings, setSettings]}>
			<RouterProvider router={router}/>
			{/* <Routes location={location} key={location.pathname}>
				<Route index element={<Home/>}/>
				<Route path="settings" element={<SettingsPage/>}/> */}
				{/* <Route path="locations">
					<Route index element={<Locations/>}/>
					<Route path="add" element={<AddLocation/>}/>
				</Route> */}
			{/* </Routes> */}
		</SettingsContext>
	);
}

export default App;