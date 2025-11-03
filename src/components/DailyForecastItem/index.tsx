import { useWeatherUtils } from '../../hooks/useWeatherUtils';
import { SVG } from '../SVG';
import styles from './DailyForecastItem.module.scss';

interface Props
{
	date: string;
	weatherCode: number;
	precipitationProbability: number;
	temperatureNight: number;
	temperatureDay: number;
}

export function DailyForecastItem(props: Props)
{
	const { weatherCodeToSVGName } = useWeatherUtils();

	return (
		<div className={styles.container}>
			<p className={styles.dateText}>{props.date}</p>

			<div className={styles.weatherContainer}>
				<p className={styles.precipitationText}>{props.precipitationProbability}%</p>

				<SVG name={weatherCodeToSVGName(props.weatherCode, true)} className={styles.weatherIcon}/>

				<p className={styles.temperatureText}>{props.temperatureNight}º</p>
				<p className={styles.temperatureText}>/</p>
				<p className={styles.temperatureText}>{props.temperatureDay}º</p>
			</div>
		</div>
	);
}