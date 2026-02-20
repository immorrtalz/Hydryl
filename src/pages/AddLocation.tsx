import { useEffect, useRef } from "react";
import styles from "./AddLocation.module.scss";
import { SVG } from "../components/SVG";
import { useTranslations } from "../hooks/useTranslations";
import { Button, ButtonType } from "../components/Button";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { TopBar } from "../components/TopBar";

function AddLocation()
{
	const { translate } = useTranslations();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

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
				<p>Тестовый текст</p>
			</TopBar>

		</div>
	);
}

export default AddLocation;