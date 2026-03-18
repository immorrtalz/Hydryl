import { useContext, useEffect, useRef, useState } from "react";
import styles from "./AddLocation.module.scss";

import { SVG } from "../components/SVG";
import { Button, ButtonType } from "../components/Button";
import { TopBar } from "../components/TopBar";
import { GroupTitle } from "../components/GroupTitle";
import { TextBox } from "../components/TextBox";
import { SearchBox } from "../components/SearchBox";
import { SearchResultItem } from "../components/SearchBox/SearchResultItem";

import LocationContext from "../context/LocationsContext";
import { getTimeZoneUTCOffset } from "../misc/utils";
import { LocationSearchResultItem } from "../misc/locations";

import useTranslations from "../hooks/useTranslations";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import useLocationsSearcher from "../hooks/useLocationsSearcher";

function AddLocation()
{
	const { translate } = useTranslations();
	const { locations, setLocations } = useContext(LocationContext);

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const { fetchLocations, canSearch } = useLocationsSearcher();

	const [searchResults, setSearchResults] = useState<LocationSearchResultItem[]>([]);
	const [selectedSearchResult, setSelectedSearchResult] = useState<LocationSearchResultItem | null>(null);
	const [searchStatus, setSearchStatus] = useState<string | null>(null);

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

	const onInput = () =>
	{
		setSearchStatus(null);
		setSearchResults([]);
	};

	const onAddLocation = () =>
	{
		if (selectedSearchResult === null) return;

		setLocations([...locations,
		{
			name: selectedSearchResult.name,
			latitude: selectedSearchResult.latitude,
			longitude: selectedSearchResult.longitude,
			timezone: selectedSearchResult.timezone,
			country: selectedSearchResult.country
		}]);

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
			</TopBar>

			<div className={styles.mainContentContainer}>
				<GroupTitle>{`${translate("search_a_city")} (${translate("optional")})`}</GroupTitle>

				<SearchBox placeholder={translate("search")} disabled={!canSearch()} onInput={onInput} onSearch={searchLocation}
					statusText={searchStatus !== null ? searchStatus : ""}>
				{
					searchResults.map((item, index) =>
						<SearchResultItem key={index} name={item.name} country={item.country} admin1={item.admin1} timezone={getTimeZoneUTCOffset(item.timezone)}
							onClick={() =>
							{
								setSelectedSearchResult(item);
								setSearchResults([]);
							}}/>)
				}
				</SearchBox>

				<GroupTitle>{translate("name")}</GroupTitle>
				<TextBox placeholder={translate("input_incentive")} value={selectedSearchResult !== null ? selectedSearchResult.name : ""}/>

				<GroupTitle>{translate("timezone")}</GroupTitle>
				<TextBox placeholder={translate("input_incentive")} value={selectedSearchResult !== null ? getTimeZoneUTCOffset(selectedSearchResult.timezone) : ""}/>

				<GroupTitle>{`${translate("country")} (${translate("optional")})`}</GroupTitle>
				<TextBox placeholder={translate("input_incentive")} value={selectedSearchResult !== null ? selectedSearchResult.country : ""}/>

				<GroupTitle>{translate("latitude")}</GroupTitle>
				<TextBox disabled placeholder={translate("input_incentive")} value={selectedSearchResult !== null ? selectedSearchResult.latitude.toString() : ""}/>

				<GroupTitle>{translate("longitude")}</GroupTitle>
				<TextBox disabled placeholder={translate("input_incentive")} value={selectedSearchResult !== null ? selectedSearchResult.longitude.toString() : ""}/>

				<Button type={ButtonType.Primary} className={styles.addLocationButton} disabled={selectedSearchResult === null} onClick={onAddLocation}>{ translate("add_the_location") }</Button>
			</div>

		</div>
	);
}

export default AddLocation;