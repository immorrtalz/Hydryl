import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Settings.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import SettingsContext from '../context/SettingsContext';
import { Dropdown } from "../components/Dropdown";
import { getVersion } from '@tauri-apps/api/app';
import { arch, version as osVersion, type } from '@tauri-apps/plugin-os';
import { openUrl } from '@tauri-apps/plugin-opener';
import { settingTranslationKeys, settingOptions, Settings } from "../misc/settings";
import { useGitHubReleaseCheck } from "../hooks/useGitHubReleaseCheck";
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { TopBar } from "../components/TopBar";

function SettingsPage()
{
	const [settings, setSettings] = useContext(SettingsContext);
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { transitionedFromDirection, initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const [envParams, setEnvParams] = useState<string[]>(["", ""]);

	const getSettingOptions = (key: keyof Settings) =>
		settingOptions[key].map((value, index) => (
		{
			title: translate(settingTranslationKeys[key][index]),
			value
		}));

	const changeSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings({...settings, [key]: value});

	const openGitHubRepo = async () => await openUrl('https://github.com/immorrtalz/Hydryl').catch(e => console.error(e));
	const { getUpdateUrl } = useGitHubReleaseCheck();

	const checkForUpdate = async () =>
	{
		const updateUrl = await getUpdateUrl();

		if (updateUrl !== "")
		{
			const userConfirmedDownload = await confirm(translate('update_available_message'), { title: translate('update_available_title'), kind: 'info' });

			if (userConfirmedDownload)
			{
				await openUrl(updateUrl)
					.catch(async e => await message(`Url: ${updateUrl}\n` + (e instanceof Error ? e.message : String(e)), { title: translate('couldnt_open_url_title'), kind: 'error' }));
			}
		}
		else await message(translate('no_updates_available_message'), { title: translate('no_updates_available_title'), kind: 'info' });
	};

	useEffect(() =>
	{
		const updateEnvParams = async () =>
		{
			try
			{
				const appVersion = await getVersion();
				const osType = type();
				const osVer = osVersion();
				const osArch = arch();

				const appInfo = `v${appVersion} ${import.meta.env.VITE_APP_BUILD_PROFILE}`;
				const osInfo = `${osType} ${osVer} ${osArch}`;
				setEnvParams([appInfo, osInfo]);
			}
			catch (e) { console.warn("Failed to get environment info:", e) }
		};

		updateEnvParams();

		initialNavigateSetup();
	}, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<TopBar>
				<Button type={ButtonType.Secondary} square onClick={() => navigateTo("/", transitionedFromDirection)}>
					<SVG name="chevronLeft"/>
				</Button>
				<p>{translate("settings")}</p>
			</TopBar>

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

						<Button type={ButtonType.Secondary} onClick={openGitHubRepo}>Github</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>{translate("check_for_updates_title")}</p>
							<p className={styles.settingsItemDescriptionText}>{translate("check_for_updates_text")}</p>
						</div>

						<Button type={ButtonType.Secondary} onClick={checkForUpdate}>
							{translate("check_for_updates_button")}
						</Button>
					</div>

					{
						envParams[0] &&
							<div className={styles.settingsItem}>
								<div className={styles.settingsItemTextsContainer}>
									<p className={styles.settingsItemTitleText}>Hydryl</p>
									<p className={styles.settingsItemDescriptionText}>{envParams.join("\n")}</p>
								</div>
							</div>
					}
				</div>

			</div>
		</div>
	);
}

export default SettingsPage;