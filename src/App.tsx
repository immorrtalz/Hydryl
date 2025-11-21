import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import SettingsContext from './context/SettingsContext';
import { initialSettings, Settings } from "./misc/settings";
import Home from "./pages/Home";
import SettingsPage from "./pages/Settings";

function App()
{
	return (
		<BrowserRouter>
			<AnimatedRoutes/>
		</BrowserRouter>);
}

function AnimatedRoutes()
{
	const location = useLocation();
	const [settings, setSettings] = useState<Settings>(initialSettings);

	return (
		<SettingsContext value={[settings, setSettings]}>
			<AnimatePresence>
				<Routes location={location} key={location.pathname}>
					<Route index element={<Home/>}/>
					<Route path="settings" element={<SettingsPage/>}/>
					{/* <Route path="locations">
						<Route index element={<Locations/>}/>
						<Route path="add" element={<AddLocation/>}/>
					</Route> */}
				</Routes>
			</AnimatePresence>
		</SettingsContext>
	);
}

export default App;