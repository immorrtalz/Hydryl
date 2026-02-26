import { useEffect, useRef } from "react";
import styles from "./AddLocation.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { TopBar } from "../components/TopBar";
import { GroupTitle } from "../components/GroupTitle";
import { TextBox } from "../components/TextBox";
import { useLocationSearch } from "../hooks/useLocationSearch";
import { SearchBox } from "../components/SearchBox";
import { SearchResultItem } from "../components/SearchBox/SearchResultItem";

function AddLocation()
{
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const { fetchSearch, canSearch } = useLocationSearch();

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
				<p>{translate("add_location")}</p>
			</TopBar>

			<div className={styles.mainContentContainer}>
				<GroupTitle>{translate("search_a_city")}</GroupTitle>

				<SearchBox svgIconName="search" placeholder={translate("search")} onEditingEnded={e => fetchSearch(e.target.value)} disabled={!canSearch()}>
					<SearchResultItem name="Ufa" country="Russia, Bashkortostan Republic" timezone="UTC+5"/>
					<SearchResultItem name="Moscow" country="Russia, Moscow" timezone="UTC+3"/>
					<SearchResultItem name="Tokyo" country="Japan, Tokyo" timezone="UTC+9"/>
					<SearchResultItem name="Fukuoka" country="Japan, Fukuoka" timezone="UTC+9"/>
					<SearchResultItem name="Sapporo" country="Japan, Hokkaido" timezone="UTC+9"/>
					<SearchResultItem name="Ufa" country="Russia, Bashkortostan Republic" timezone="UTC+5"/>
					<SearchResultItem name="Moscow" country="Russia, Moscow" timezone="UTC+3"/>
					<SearchResultItem name="Tokyo" country="Japan, Tokyo" timezone="UTC+9"/>
					<SearchResultItem name="Fukuoka" country="Japan, Fukuoka" timezone="UTC+9"/>
					<SearchResultItem name="Sapporo" country="Japan, Hokkaido" timezone="UTC+9"/>
				</SearchBox>

				<GroupTitle>{translate("location_name")}</GroupTitle>
				<TextBox placeholder={`${translate("input_incentive")}...`}/>

				<GroupTitle>{translate("location_timezone")}</GroupTitle>
				<TextBox placeholder={`${translate("input_incentive")}...`}/>
			</div>

		</div>
	);
}

export default AddLocation;