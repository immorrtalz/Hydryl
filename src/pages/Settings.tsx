import { useContext, useEffect, useTransition } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import styles from "./Settings.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslate";
import { Button, ButtonType } from "../components/Button";
import SettingsContext from '../context/SettingsContext';

function Settings()
{
	const navigate = useNavigate();
	const [isTransitionPending, startTransition] = useTransition();
	const [settings, setSettings] = useContext(SettingsContext);
	const { translate } = useTranslations();

	//const changeLocale = () => setSettings({...settings, locale: settings.locale === 'ru' ? 'en' : 'ru'});

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
							<p className={styles.settingsItemTitleText}>Item title</p>
							<p className={styles.settingsItemDescriptionText}>Item description</p>
						</div>

						<Button type={ButtonType.Secondary} square>
							<SVG name="chevronRight"/>
						</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Item title</p>
							<p className={styles.settingsItemDescriptionText}>Item description</p>
						</div>

						<Button type={ButtonType.Secondary} square>
							<SVG name="chevronRight"/>
						</Button>
					</div>
				</div>

				<div className={styles.settingsGroupSeparator}/>

				<div className={styles.settingsGroupContainer}>
					<p className={styles.settingsGroupTitleText}>{translate("general_settings")}</p>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Item title</p>
							<p className={styles.settingsItemDescriptionText}>Item description</p>
						</div>

						<Button type={ButtonType.Secondary} square>
							<SVG name="chevronRight"/>
						</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Item title</p>
							<p className={styles.settingsItemDescriptionText}>Item description</p>
						</div>

						<Button type={ButtonType.Secondary} square>
							<SVG name="chevronRight"/>
						</Button>
					</div>

					<div className={styles.settingsItem}>
						<div className={styles.settingsItemTextsContainer}>
							<p className={styles.settingsItemTitleText}>Item title</p>
							<p className={styles.settingsItemDescriptionText}>Item description</p>
						</div>

						<Button type={ButtonType.Secondary} square>
							<SVG name="chevronRight"/>
						</Button>
					</div>
				</div>

			</div>
		</motion.div>
	);
}

export default Settings;