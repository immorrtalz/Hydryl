import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Settings.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import SettingsContext from '../context/SettingsContext';
import { getVersion } from '@tauri-apps/api/app';
import { arch, version as osVersion, type } from '@tauri-apps/plugin-os';
import { openUrl } from '@tauri-apps/plugin-opener';
import { settingTranslationKeys, settingOptions, Settings } from "../misc/settings";
import { useGitHubReleaseCheck } from "../hooks/useGitHubReleaseCheck";
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { TopBar } from "../components/TopBar";
import { GroupTitle } from "../components/GroupTitle";
import { SettingsItem } from "../components/SettingsItem";

function SettingsPage()
{
	const [settings, setSettings] = useContext(SettingsContext);
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

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
				<Button type={ButtonType.Secondary} square onClick={() => navigateTo("/", NavigateDirection.Right)}>
					<SVG name="chevronLeft"/>
				</Button>
				<p>{translate("settings")}</p>
			</TopBar>

			<div className={styles.mainContentContainer}>

				<div className={styles.settingsGroupContainer}>
					<GroupTitle>{translate("general_settings")}</GroupTitle>

					<SettingsItem
						titleText={translate("language")}
						options={getSettingOptions("locale")}
						defaultValue={settings.locale}
						onChange={value => changeSetting("locale", value)}/>

					<SettingsItem
						titleText={translate("time")}
						options={getSettingOptions("time")}
						defaultValue={settings.time}
						onChange={value => changeSetting("time", value)}/>

				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<GroupTitle>{translate("measure_units")}</GroupTitle>

					<SettingsItem
						titleText={translate("temperature")}
						options={getSettingOptions("temperature")}
						defaultValue={settings.temperature}
						onChange={value => changeSetting("temperature", value)}/>

					<SettingsItem
						titleText={translate("wind_speed")}
						options={getSettingOptions("windSpeed")}
						defaultValue={settings.windSpeed}
						onChange={value => changeSetting("windSpeed", value)}/>

					<SettingsItem
						titleText={translate("precipitation")}
						options={getSettingOptions("precipitation")}
						defaultValue={settings.precipitation}
						onChange={value => changeSetting("precipitation", value)}/>

					<SettingsItem
						titleText={translate("pressure")}
						options={getSettingOptions("pressure")}
						defaultValue={settings.pressure}
						onChange={value => changeSetting("pressure", value)}/>

					<SettingsItem
						titleText={translate("distance")}
						options={getSettingOptions("distance")}
						defaultValue={settings.distance}
						onChange={value => changeSetting("distance", value)}/>
				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<GroupTitle>{translate("about_app_title")}</GroupTitle>

					<SettingsItem titleText={translate("source_code_title")} descriptionText={translate("source_code_text")}>
						<Button type={ButtonType.Secondary} onClick={openGitHubRepo}>Github</Button>
					</SettingsItem>

					<SettingsItem titleText={translate("check_for_updates_title")} descriptionText={translate("check_for_updates_text")}>
						<Button type={ButtonType.Secondary} onClick={checkForUpdate}>{translate("check_for_updates_button")}</Button>
					</SettingsItem>

					{ envParams[0] && <SettingsItem titleText="Hydryl" descriptionText={envParams.join("\n")}/> }
				</div>

			</div>
		</div>
	);
}

export default SettingsPage;