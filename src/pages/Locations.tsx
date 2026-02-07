import { useEffect, useRef, useState } from "react";
import styles from "./Locations.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import { useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { LocationItem } from "../components/LocationItem";
import { ReorderableList } from "../components/ReorderableList";

function Locations()
{
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { transitionedFromDirection, initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	useEffect(() =>
	{
		initialNavigateSetup();
	}, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<div className={styles.topBar}>
				<Button type={ButtonType.Secondary} square onClick={() => navigateTo("/", transitionedFromDirection)}>
					<SVG name="chevronLeft"/>
				</Button>
				<p className={styles.currentPageNameText}>{translate("locations")}</p>
			</div>

			<ReorderableList className={styles.mainContentContainer}>
				<LocationItem locationName="Ufa" countryName="Russia" currentTime="17:08" timezone="UTC+5" currentWeatherCode={61} currentTemperature={25}/>
				<LocationItem locationName="Moscow" countryName="Russia" currentTime="17:08" timezone="UTC+3" currentWeatherCode={2} currentTemperature={22}/>
				<LocationItem locationName="Tokyo" countryName="Japan" currentTime="17:08" timezone="UTC+9" currentWeatherCode={2} currentTemperature={14}/>
				<LocationItem locationName="Fukuoka" countryName="Japan" currentTime="17:08" timezone="UTC+9" currentWeatherCode={0} currentTemperature={17}/>
				<LocationItem locationName="Sapporo" countryName="Japan" currentTime="17:08" timezone="UTC+9" currentWeatherCode={61} currentTemperature={10}/>
			</ReorderableList>
		</div>
	);
}

export default Locations;