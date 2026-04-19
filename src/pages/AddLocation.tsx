import { useContext, useEffect, useRef, useState } from "react";
import { message } from "@tauri-apps/plugin-dialog";
import styles from "./AddLocation.module.scss";

import { SVG } from "../components/SVG";
import { Button, ButtonType } from "../components/Button";
import { TopBar } from "../components/TopBar";
import { GroupTitle } from "../components/GroupTitle";
import { TextBox } from "../components/TextBox";
import { SearchBox } from "../components/SearchBox";
import { SearchResultItem } from "../components/SearchBox/SearchResultItem";

import LocationContext from "../context/LocationsContext";
import { clamp } from "../misc/utils";
import { LocationItem, LocationSearchResultItem, isLocationItemValid, validateLocationItem } from "../misc/locations";

import useTranslations from "../hooks/useTranslations";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import useGeoLocation from "../hooks/useGeoLocation";
import useLocationsSearcher from "../hooks/useLocationsSearcher";

function AddLocation()
{
	const { translate } = useTranslations();
	const { locations, setLocations } = useContext(LocationContext);

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef);

	const { getCurrentGeoLocation } = useGeoLocation();
	const { fetchLocations, searchFetchCooldown } = useLocationsSearcher();

	const [constructedLocationItem, internal_setConstructedLocationItem] = useState<LocationItem>({ isCurrent: false, name: '', latitude: 0, longitude: 0 });
	const [isConstructedLocationItemValid, setIsConstructedLocationItemValid] = useState(false);

	const [searchResults, setSearchResults] = useState<LocationSearchResultItem[]>([]);
	const [searchStatus, setSearchStatus] = useState<string | null>(null);

	const setConstructedLocationItem = (newConstructedLocationItem: LocationItem) =>
	{
		internal_setConstructedLocationItem(validateLocationItem(newConstructedLocationItem));
		setIsConstructedLocationItemValid(isLocationItemValid(validateLocationItem(newConstructedLocationItem)));
	};

	const fillFieldsWithCurrentLocation = async () =>
	{
		try
		{
			const pos = await getCurrentGeoLocation();
			setConstructedLocationItem({ isCurrent: false, name: translate('new_location'), latitude: pos.latitude, longitude: pos.longitude });
		}
		catch (error)
		{
			await message(error instanceof Error ? error.message : String(error), { title: translate('could_not_get_your_current_location'), kind: 'error' });
		}
	};

	const searchLocation = async (searchText: string) =>
	{
		try
		{
			setSearchStatus(translate("searching"));
			const results = await fetchLocations(searchText);
			setSearchStatus(null);
			setSearchResults(results);
		}
		catch (e) { setSearchStatus(e as string); }
	};

	const onSearchInput = () =>
	{
		setSearchStatus(null);
		setSearchResults([]);
	};

	const onNameInput = (e: React.InputEvent<HTMLInputElement>) =>
		setConstructedLocationItem({...constructedLocationItem, name: (e.target as HTMLInputElement).value });

	const onLatitudeInput = (e: React.InputEvent<HTMLInputElement>) =>
		setConstructedLocationItem({...constructedLocationItem, latitude: (e.target as HTMLInputElement).valueAsNumber });

	const onLongitudeInput = (e: React.InputEvent<HTMLInputElement>) =>
		setConstructedLocationItem({...constructedLocationItem, longitude: (e.target as HTMLInputElement).valueAsNumber });

	const onAddLocation = () =>
	{
		if (!isConstructedLocationItemValid) return;

		setLocations([...locations,
		{
			isCurrent: false,
			name: constructedLocationItem.name,
			latitude: constructedLocationItem.latitude,
			longitude: constructedLocationItem.longitude
		}], true);

		navigateTo("/locations", NavigateDirection.Left);
	};

	useEffect(() =>
	{
		initialNavigateSetup();
	}, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<TopBar>
				<Button type={ButtonType.Secondary} square onClick={() => navigateTo("/locations", NavigateDirection.Left)}>
					<SVG name="chevronLeft"/>
				</Button>

				<p>{translate("add_a_location")}</p>

				<Button type={ButtonType.Secondary} square onClick={fillFieldsWithCurrentLocation}>
					<SVG name="location"/>
				</Button>
			</TopBar>

			<div className={styles.mainContentContainer}>
				<GroupTitle>{`${translate("search_a_city")} (${translate("optional")})`}</GroupTitle>

				<SearchBox placeholder={translate("search")} disabled={searchFetchCooldown !== null} onInput={onSearchInput} onSearch={searchLocation}
					statusText={searchStatus !== null ? searchStatus : ""} name="input-search">
				{
					searchResults.map((item, index) =>
						<SearchResultItem key={`${index}-${item.name}-${item.country}`} name={item.name} country={item.country} admin1={item.admin1}
							onClick={() =>
							{
								setConstructedLocationItem({ isCurrent: false, name: item.name, latitude: item.latitude, longitude: item.longitude });
								setSearchResults([]);
							}}/>)
				}
				</SearchBox>

				<GroupTitle>{translate("name")}</GroupTitle>
				<TextBox placeholder={translate("input_incentive")}
					value={constructedLocationItem !== null ? constructedLocationItem.name : ""} onInput={onNameInput} name="input-name"/>

				<GroupTitle>{translate("latitude")}</GroupTitle>
				<TextBox type="number" min={-90} max={90} placeholder={translate("input_incentive")}
					value={constructedLocationItem !== null ? constructedLocationItem.latitude.toString() : ""} onInput={onLatitudeInput} name="input-latitude"/>

				<GroupTitle>{translate("longitude")}</GroupTitle>
				<TextBox type="number" min={-180} max={180} placeholder={translate("input_incentive")}
					value={constructedLocationItem !== null ? constructedLocationItem.longitude.toString() : ""} onInput={onLongitudeInput} name="input-longitude"/>

				<Button type={ButtonType.Primary} className={styles.addLocationButton} disabled={!isConstructedLocationItemValid} onClick={onAddLocation}>
					{ translate("add_the_location") }
				</Button>
			</div>

		</div>
	);
}

export default AddLocation;