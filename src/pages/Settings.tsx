import { useCallback, useContext, useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import styles from "./Settings.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import SettingsContext from '../context/SettingsContext';
import { Dropdown } from "../components/Dropdown";
import { getVersion } from '@tauri-apps/api/app';
import { arch, platform, version as osVersion } from '@tauri-apps/plugin-os';
import { settingTranslationKeys, settingOptions, Settings } from "../misc/settings";

function SettingsPage()
{
	const navigate = useNavigate();
	const [isTransitionPending, startTransition] = useTransition();
	const [settings, setSettings] = useContext(SettingsContext);
	const { translate } = useTranslations();

	const [envParams, setEnvParams] = useState<string[]>(["", "", "", ""]);

	const getSettingOptions = useCallback((key: keyof Settings) =>
		settingOptions[key].map((value, index) => (
		{
			title: translate(settingTranslationKeys[key][index]),
			value
		})), [translate]);

	const changeSetting = useCallback((key: keyof Settings, value: Settings[typeof key]) => setSettings({...settings, [key]: value}), [setSettings]);

	useEffect(() =>
	{
		const updateEnvParams = async () =>
		{
			try
			{
				const appVersion = await getVersion();
				const osArch = arch();
				const osPlatform = platform();
				const osVer = osVersion();

				setEnvParams([appVersion, osArch, osPlatform, osVer]);
			}
			catch(error) { console.warn("Failed to get environment info:", error) }
		};

		updateEnvParams();
	}, []);

	return (
		<motion.div className={styles.page}
			initial={{ pointerEvents: "none", visibility: "hidden", x: "-100%" }}
			animate={{ pointerEvents: "all", visibility: "visible", x: "0" }}
			exit={{ pointerEvents: "none", visibility: "hidden", x: "-100%" }}
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
						<p className={styles.settingsItemTitleText}>{translate("language")}</p>
						<Dropdown onOptionClick={value => changeSetting("locale", value)}
							options={getSettingOptions("locale")}
							defaultOptionIndex={settingOptions.locale.indexOf(settings.locale)}/>
					</div>

					<div className={styles.settingsItem}>
						<p className={styles.settingsItemTitleText}>{translate("time")}</p>
						<Dropdown onOptionClick={value => changeSetting("time", value)}
							options={getSettingOptions("time")}
							defaultOptionIndex={settingOptions.time.indexOf(settings.time)}/>
					</div>
				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<p className={styles.settingsGroupTitleText}>{translate("measure_units")}</p>

					<div className={styles.settingsItem}>
						<p className={styles.settingsItemTitleText}>{translate("temperature")}</p>
						<Dropdown onOptionClick={value => changeSetting("temperature", value)}
							options={getSettingOptions("temperature")}
							defaultOptionIndex={settingOptions.temperature.indexOf(settings.temperature)}/>
					</div>

					<div className={styles.settingsItem}>
						<p className={styles.settingsItemTitleText}>{translate("wind_speed")}</p>
						<Dropdown onOptionClick={value => changeSetting("windSpeed", value)}
							options={getSettingOptions("windSpeed")}
							defaultOptionIndex={settingOptions.windSpeed.indexOf(settings.windSpeed)}/>
					</div>

					<div className={styles.settingsItem}>
						<p className={styles.settingsItemTitleText}>{translate("precipitation")}</p>
						<Dropdown onOptionClick={value => changeSetting("precipitation", value)}
							options={getSettingOptions("precipitation")}
							defaultOptionIndex={settingOptions.precipitation.indexOf(settings.precipitation)}/>
					</div>

					<div className={styles.settingsItem}>
						<p className={styles.settingsItemTitleText}>{translate("pressure")}</p>
						<Dropdown onOptionClick={value => changeSetting("pressure", value)}
							options={getSettingOptions("pressure")}
							defaultOptionIndex={settingOptions.pressure.indexOf(settings.pressure)}/>
					</div>

					<div className={styles.settingsItem}>
						<p className={styles.settingsItemTitleText}>{translate("distance")}</p>
						<Dropdown onOptionClick={value => changeSetting("distance", value)}
							options={getSettingOptions("distance")}
							defaultOptionIndex={settingOptions.distance.indexOf(settings.distance)}/>
					</div>
				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<p className={styles.settingsGroupTitleText}>{translate("about_app_title")}</p>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>{translate("source_code_title")}</p>
							<p className={styles.settingsItemDescriptionText}>{translate("source_code_text")}</p>
						</div>

						<Button type={ButtonType.Secondary}>Github</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>{translate("check_for_updates_title")}</p>
							<p className={styles.settingsItemDescriptionText}>{translate("check_for_updates_text")}</p>
						</div>

						<Button type={ButtonType.Secondary}>{translate("check_for_updates_button")}</Button>
					</div>

					{
						(envParams.some(param => param)) &&
							<div className={styles.settingsItem}>
								<div className={styles.settingsItemTextsContainer}>
									<p className={styles.settingsItemTitleText}>Hydryl</p>
									<p className={styles.settingsItemDescriptionText}>{envParams.join(" ")}</p>
								</div>
							</div>
					}
				</div>

			</div>
		</motion.div>
	);
}

export default SettingsPage;
//export default React.memo(SettingsPage);