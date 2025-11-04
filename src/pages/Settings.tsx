import { useContext, useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import styles from "./Settings.module.scss";
import { SVG } from "../components/SVG";
import { Locale, useTranslations } from "../hooks/useTranslate";
import { Button, ButtonType } from "../components/Button";
import SettingsContext from '../context/SettingsContext';
import { Dropdown } from "../components/Dropdown";
import { getVersion } from '@tauri-apps/api/app';

function Settings()
{
	const navigate = useNavigate();
	const [isTransitionPending, startTransition] = useTransition();
	const [settings, setSettings] = useContext(SettingsContext);
	const { translate } = useTranslations();

	const [appVersion, setAppVersion] = useState("");

	useEffect(() =>
	{
		getVersion().then(version => setAppVersion("v" + version)).catch(error =>
		{
			console.warn("Failed to get app version:", error);
			setAppVersion("Unknown version");
		});

	}, []);

	const changeLocale = (locale: string) => setSettings({...settings, locale: locale as Locale});
	const changeTime = (time: string) => setSettings({...settings, time: time as "12" | "24"});
	const changeTemperature = (temperature: string) => setSettings({...settings, temperature: temperature as "celsius" | "fahrenheit"});
	const changeWindSpeed = (windSpeed: string) => setSettings({...settings, windSpeed: windSpeed as "kmh" | "ms" | "mph" | "knots"});
	const changePrecipitation = (precipitation: string) => setSettings({...settings, precipitation: precipitation as "mm" | "inch"});
	const changePressure = (pressure: string) => setSettings({...settings, pressure: pressure as "atm" | "mmHg" | "inHg" | "mbar" | "psi"});
	const changeDistance = (distance: string) => setSettings({...settings, distance: distance as "m" | "km" | "miles"});

	useEffect(() => console.log("Current locale in Settings:", settings.locale), [settings.locale]);

	return (
		<motion.div className={styles.page}
			initial={{ pointerEvents: "none", visibility: "hidden", transform: "translateX(-100%)" }}
			animate={{ pointerEvents: "all", visibility: "visible", transform: "translateX(0)" }}
			exit={{ pointerEvents: "none", visibility: "hidden", transform: "translateX(-100%)" }}
			transition={{ duration: 0.3, ease: [0.66, 0, 0.34, 1] }}>

			<div className={styles.topBar}>
				<Button type={ButtonType.Secondary} square onClick={() => startTransition(() => navigate("/"))}>
					<SVG name="chevronLeft"/>
				</Button>
				<p className={styles.currentPageNameText}>{translate("settings")}</p>
			</div>

			<div className={styles.mainContentContainer}>

				<div className={styles.settingsGroupContainer}>
					<p className={styles.settingsGroupTitleText}>{translate("general_settings")}</p>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Language</p>
						</div>

						<Dropdown onOptionClick={changeLocale} options=
							{[
								{ title: "English", value: "en" },
								{ title: "Русский", value: "ru" },
							]}/>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Time</p>
						</div>

						<Dropdown onOptionClick={changeTime} options=
							{[
								{ title: "24 h", value: "24" },
								{ title: "12 h", value: "12" },
							]}/>
					</div>
				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<p className={styles.settingsGroupTitleText}>Measure units</p>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Temperature</p>
						</div>

						<Dropdown onOptionClick={changeTemperature} options=
							{[
								{ title: "ºC", value: "celsius" },
								{ title: "ºF", value: "fahrenheit" },
							]}/>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Wind speed</p>
						</div>

						<Dropdown onOptionClick={changeWindSpeed} options=
							{[
								{ title: "km/h", value: "kmh" },
								{ title: "m/s", value: "ms" },
								{ title: "mph", value: "mph" },
								{ title: "knots", value: "knots" },
							]}/>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Precipitation</p>
						</div>

						<Dropdown onOptionClick={changePrecipitation} options=
							{[
								{ title: "mm", value: "mm" },
								{ title: "inch", value: "inch" },
							]}/>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Pressure</p>
						</div>

						<Dropdown onOptionClick={changePressure} options=
							{[
								{ title: "atm", value: "atm" },
								{ title: "mmHg", value: "mmHg" },
								{ title: "inHg", value: "inHg" },
								{ title: "mbar", value: "mbar" },
								{ title: "psi", value: "psi" },
							]}/>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Distance</p>
						</div>

						<Dropdown onOptionClick={changeDistance} options=
							{[
								{ title: "m", value: "m" },
								{ title: "km", value: "km" },
								{ title: "miles", value: "miles" },
							]}/>
					</div>
				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<p className={styles.settingsGroupTitleText}>About</p>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Source</p>
							<p className={styles.settingsItemDescriptionText}>This app is open source</p>
						</div>

						<Button type={ButtonType.Secondary}>Github</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Check for updates</p>
							<p className={styles.settingsItemDescriptionText}>Official releases from GitHub</p>
						</div>

						<Button type={ButtonType.Secondary}>Check</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Hydryl</p>
							<p className={styles.settingsItemDescriptionText}>{appVersion}</p>
						</div>
					</div>
				</div>

			</div>
		</motion.div>
	);
}

export default Settings;