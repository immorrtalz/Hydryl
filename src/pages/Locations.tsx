import { useEffect, useRef, useState } from "react";
import styles from "./Locations.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { LocationItem } from "../components/LocationItem";
import { ReorderableList } from "../components/ReorderableList";
import { TopBar } from "../components/TopBar";

function Locations()
{
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const [locations, setLocations] = useState([
		{ locationName: "Ufa", countryName: "Russia", currentTime: "17:08", timezone: "UTC+5", currentWeatherCode: 61, currentTemperature: 25 },
		{ locationName: "Moscow", countryName: "Russia", currentTime: "17:08", timezone: "UTC+3", currentWeatherCode: 2, currentTemperature: 22 },
		{ locationName: "Tokyo", countryName: "Japan", currentTime: "17:08", timezone: "UTC+9", currentWeatherCode: 2, currentTemperature: 14 },
		{ locationName: "Fukuoka", countryName: "Japan", currentTime: "17:08", timezone: "UTC+9", currentWeatherCode: 0, currentTemperature: 17 },
		{ locationName: "Sapporo", countryName: "Japan", currentTime: "17:08", timezone: "UTC+9", currentWeatherCode: 61, currentTemperature: 10 }
	]);

	const [reorderKey, setReorderKey] = useState(0);

	const onReorder = (newOrder: number[]) =>
	{
		const prevLocations = [...locations];
		const sortedLocations = newOrder.map(i => prevLocations[i]);
		setLocations(sortedLocations);
		setReorderKey(k => k + 1);
	};

	useEffect(() =>
	{
		initialNavigateSetup();
	}, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<TopBar>
				<Button type={ButtonType.Secondary} square onClick={() => navigateTo("/", NavigateDirection.Left)}>
					<SVG name="chevronLeft"/>
				</Button>
				<p>{translate("locations")}</p>
				<Button type={ButtonType.Secondary} square onClick={() => navigateTo("/addlocation", NavigateDirection.Right)}>
					<SVG name="plus"/>
				</Button>
			</TopBar>

			<ReorderableList key={reorderKey} className={styles.mainContentContainer} ghostItemClassName='ghostLocationItem' onReorder={onReorder}>
			{
				locations.map(location => (
					<LocationItem
						key={`${location.locationName}-${location.countryName}`}
						locationName={location.locationName}
						countryName={location.countryName}
						currentTime={location.currentTime}
						timezone={location.timezone}
						currentWeatherCode={location.currentWeatherCode}
						currentTemperature={location.currentTemperature}/>))
			}
			</ReorderableList>
		</div>
	);
}

export default Locations;