import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Locations.module.scss";
import { SVG } from "../components/SVG";
import { Button, ButtonType } from "../components/Button";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { LocationItem } from "../components/LocationItem";
import { ReorderableList } from "../components/ReorderableList";
import { TopBar } from "../components/TopBar";
import LocationContext from "../context/LocationsContext";

import useTranslations from "../hooks/useTranslations";
import useLocationsLoader from "../hooks/Loaders/useLocationsLoader";

import { getCurrentTimeInTimezone, getTimeZoneUTCOffset } from "../misc/utils";

function Locations()
{
	const { translate } = useTranslations();
	const { currentLocationIndex, setCurrentLocationIndex, locations, setLocations } = useContext(LocationContext);
	const { loadLocationsFromFile } = useLocationsLoader();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const [reorderKey, setReorderKey] = useState(0);

	const onReorder = (newOrder: number[]) =>
	{
		const prevLocations = [...locations];
		const sortedLocations = newOrder.map(i => prevLocations[i]);
		setLocations(sortedLocations);

		const newCurrentLocationIndex = newOrder.indexOf(currentLocationIndex);

		if (newCurrentLocationIndex >= 0 && newCurrentLocationIndex !== currentLocationIndex)
			setCurrentLocationIndex(newCurrentLocationIndex);

		setReorderKey(k => k + 1);
	};

	const onSelectLocation = (locationIndex: number) =>
	{
		if (locationIndex !== currentLocationIndex)
			setCurrentLocationIndex(locationIndex);

		navigateTo("/", NavigateDirection.Left);
	};

	useEffect(() =>
	{
		initialNavigateSetup();
		loadLocationsFromFile();
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
				locations.map((location, index) => (
					<LocationItem
						key={`${location.name}-${location.latitude}-${location.longitude}`}
						locationName={location.name}
						countryName={location.country}
						currentTime={getCurrentTimeInTimezone(location.timezone)}
						timezone={getTimeZoneUTCOffset(location.timezone)}
						currentWeatherCode={0}
						currentTemperature={0}
						onClick={() => onSelectLocation(index)}/>))
			}
			</ReorderableList>
		</div>
	);
}

export default Locations;