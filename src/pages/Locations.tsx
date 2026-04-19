import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Locations.module.scss";
import { SVG } from "../components/SVG";
import { Button, ButtonType } from "../components/Button";
import { LocationItem as LocationItemUI } from "../components/LocationItem";
import { ReorderableList } from "../components/ReorderableList";
import { TopBar } from "../components/TopBar";
import LocationContext from "../context/LocationsContext";

import { LocationItem, isLocationItemValid } from "../misc/locations";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import useTranslations from "../hooks/useTranslations";

function Locations()
{
	const { translate } = useTranslations();
	const { locations, setLocations } = useContext(LocationContext);

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef);

	const [reorderKey, setReorderKey] = useState(0);

	const [bulkSelectedLocations, setBulkSelectedLocations] = useState<number[]>([]);
	const [editingLocation, setEditingLocation] = useState<number | null>(null);

	const setCurrentLocationIndex = (newCurrentLocationIndex: number, saveToFile: boolean, locationsToMap: LocationItem[] = locations) =>
		setLocations(locationsToMap.map((loc, index) => ({ ...loc, isCurrent: index === newCurrentLocationIndex })), saveToFile);

	const onReorder = (newOrder: number[]) =>
	{
		const prevLocations = [...locations];
		const sortedLocations = newOrder.map(i => prevLocations[i]);
		setLocations(sortedLocations, true);

		const currentLocationIndex = locations.findIndex(loc => loc.isCurrent);
		const newCurrentLocationIndex = newOrder.indexOf(currentLocationIndex);

		if (newCurrentLocationIndex >= 0 && newCurrentLocationIndex !== currentLocationIndex)
			setCurrentLocationIndex(newCurrentLocationIndex, true);

		setReorderKey(k => k + 1);
	};

	const onBulkSelectLocation = (locationIndex: number) =>
	{
		if (editingLocation !== null) return;

		if (bulkSelectedLocations.includes(locationIndex))
			setBulkSelectedLocations(prev => prev.filter(i => i !== locationIndex));
		else setBulkSelectedLocations(prev => [...prev, locationIndex].sort((a, b) => a - b));
		
	};

	const onBulkDeleteLocations = () =>
	{
		const remainingLocations = locations.filter((_, index) => !bulkSelectedLocations.includes(index));
		if (remainingLocations.length === 0 || remainingLocations.length === locations.length) return;

		setLocations(remainingLocations, true);
		setBulkSelectedLocations([]);
	};

	const onEditLocation = (locationIndex: number) =>
	{
		if (bulkSelectedLocations.length > 0) return;

		if (editingLocation !== locationIndex)
			setEditingLocation(locationIndex);
	};

	const onEditLocationComplete = (locationIndex: number, newName: string) =>
	{
		setEditingLocation(null);

		if (locations[locationIndex].name !== newName && isLocationItemValid({ ...locations[locationIndex], name: newName }))
			setLocations(locations.map((loc, index) => ({ ...loc, name: index === locationIndex ? newName : loc.name })), true);
	};
	
	// this is for selecting the current location which we fetch weather for
	const onSelectLocation = (locationIndex: number) =>
	{
		const currentLocationIndex = locations.findIndex(loc => loc.isCurrent);

		if (locationIndex !== currentLocationIndex)
		{
			setCurrentLocationIndex(locationIndex, true);
			navigateTo("/", NavigateDirection.Left);
		}
	};

	useEffect(() =>
	{
		initialNavigateSetup();
	}, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<TopBar>
				<Button type={ButtonType.Secondary} square onClick={() =>
					bulkSelectedLocations.length === 0 ? navigateTo("/", NavigateDirection.Left) : setBulkSelectedLocations([])}>
					<SVG name={bulkSelectedLocations.length === 0 ? 'chevronLeft' : 'cross'}/>
				</Button>

				<p>{bulkSelectedLocations.length === 0 ? translate("locations") : translate("select_locations")}</p>

				<Button type={ButtonType.Secondary} square onClick={() =>
					bulkSelectedLocations.length === 0 ? navigateTo("/addlocation", NavigateDirection.Right) : onBulkDeleteLocations()}>
					<SVG name={bulkSelectedLocations.length === 0 ? 'plus' : 'delete'}/>
				</Button>
			</TopBar>

			<ReorderableList key={reorderKey} className={styles.mainContentContainer} ghostItemClassName='ghostLocationItem' disableFeature={true}
				onReorder={newOrder =>
				{
					if (bulkSelectedLocations.length === 0 && editingLocation === null)
						onReorder(newOrder);
				}}>
			{
				locations.map((location, index) => (
					<LocationItemUI
						key={`${location.name}-${index}-${location.latitude}-${location.longitude}`}
						isCurrentLocation={location.isCurrent}
						locationName={location.name}
						isInEditMode={editingLocation === index ? true : editingLocation !== null || bulkSelectedLocations.length !== 0 ? undefined : false}
						isInBulkSelectionMode={bulkSelectedLocations.includes(index)}
						onClick={() => bulkSelectedLocations.length === 0 && editingLocation === null ? onSelectLocation(index) : onBulkSelectLocation(index)}
						onHold={(e: React.MouseEvent<HTMLElement>) =>
						{
							e.preventDefault();
							if (bulkSelectedLocations.length === 0) onBulkSelectLocation(index);
						}}
						onEdit={() => onEditLocation(index)}
						onEditComplete={newName => onEditLocationComplete(index, newName)}/>))
			}
			</ReorderableList>
		</div>
	);
}

export default Locations;