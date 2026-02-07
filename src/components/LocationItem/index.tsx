import styles from './LocationItem.module.scss';
import './LocationItem.global.scss';
import { SVG } from '../SVG';

interface Props
{
	locationName: string;
	countryName: string;
	currentTime: string;
	timezone: string;
	currentWeatherCode: number;
	currentTemperature: number;
	onClick?: (...args: any[]) => any;
}

export function LocationItem(props: Props)
{
	const onClick = (e: React.MouseEvent<HTMLElement>) => props.onClick?.(e);

	return (
		<div onClick={onClick} className={styles.locationItem}>

			<span className="dragZone"/>

			<div className={styles.mainContainer}>
				<SVG name="drag"/>

				<div className={styles.locationNameContainer}>
					<p>{props.locationName}</p>
					<p>{props.countryName}</p>
				</div>
			</div>

			<div className={styles.detailsContainer}>
				<div className={styles.timeContainer}>
					<p>{props.currentTime}</p>
					<p>{props.timezone}</p>
				</div>

				<SVG name="cloudSun"/>
				<p className={styles.temperatureText}>{props.currentTemperature}º</p>
			</div>
		</div>
	);
}