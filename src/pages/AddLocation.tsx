import { useEffect, useRef, useState } from "react";
import styles from "./AddLocation.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { TopBar } from "../components/TopBar";
import { GroupTitle } from "../components/GroupTitle";
import { TextBox } from "../components/TextBox";
import { LocationSearchResultItem, useLocationSearch } from "../hooks/useLocationSearch";
import { SearchBox } from "../components/SearchBox";
import { SearchResultItem } from "../components/SearchBox/SearchResultItem";
import { getTimeZoneUTCOffset } from "../misc/utils";

function AddLocation()
{
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const { fetchLocations, canSearch } = useLocationSearch();
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
								console.log("Selected location:", item);
								setSelectedSearchResult(item);
								setSearchResults([]);
							}}/>)
				}
				</SearchBox>

				<GroupTitle>{translate("name")}</GroupTitle>
				<TextBox placeholder={`${translate("input_incentive")}...`} value={selectedSearchResult !== null ? selectedSearchResult.name : ""}/>

				<GroupTitle>{translate("timezone")}</GroupTitle>
				<TextBox placeholder={`${translate("input_incentive")}...`} value={selectedSearchResult !== null ? getTimeZoneUTCOffset(selectedSearchResult.timezone) : ""}/>

				<GroupTitle>{translate("latitude")}</GroupTitle>
				<TextBox disabled placeholder={`${translate("input_incentive")}...`} value={selectedSearchResult !== null ? selectedSearchResult.latitude.toString() : ""}/>

				<GroupTitle>{translate("longitude")}</GroupTitle>
				<TextBox disabled placeholder={`${translate("input_incentive")}...`} value={selectedSearchResult !== null ? selectedSearchResult.longitude.toString() : ""}/>

				<Button type={ButtonType.Primary} className={styles.addLocationButton}>{ translate("add_the_location") }</Button>
			</div>

		</div>
	);
}

export default AddLocation;