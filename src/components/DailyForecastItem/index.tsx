import { weatherCodeToSVGName } from '../../hooks/useWeatherManager';
import { SVG } from '../SVG';
import styles from './DailyForecastItem.module.scss';

interface Props
{
	date: string;
	weatherCode: number;
	temperatureNight: number;
	temperatureDay: number;
}

export function DailyForecastItem(props: Props)
{
	return (
		<div className={styles.container}>
			<p className={styles.dateText}>{props.date}</p>

			<div className={styles.weatherContainer}>
				<SVG name={weatherCodeToSVGName(props.weatherCode, true)} className={styles.weatherIcon}/>

				<p className={styles.temperatureText}>{props.temperatureNight}º</p>
				<p className={styles.temperatureText}>/</p>
				<p className={styles.temperatureText}>{props.temperatureDay}º</p>
			</div>
		</div>
	);
}