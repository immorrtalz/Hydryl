import { useState } from "react";
import ReactDOM from "react-dom/client";
import './global.scss';
import App from "./App";
import SettingsContext from "./context/SettingsContext";
import { initialSettings, Settings } from "./misc/settings";
import { useSettingsLoader } from "./hooks/useSettingsLoader";


function AppRoot()
{
	const [settings, internal_setSettings] = useState<Settings>(initialSettings);
	const { saveSettingsToFile } = useSettingsLoader();

	const setSettings = (newSettings: Settings) =>
	{
		internal_setSettings(newSettings);
		saveSettingsToFile(newSettings);
	};

	return (
		<SettingsContext value={[settings, setSettings]}>
			<App/>
		</SettingsContext>);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<AppRoot/>);