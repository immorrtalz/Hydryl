import { weatherCodeToSVGName } from '../../hooks/useWeatherManager';
import { SVG } from '../SVG';
import styles from './HourlyForecastItem.module.scss';

interface Props
{
	temperature: number;
	weatherCode: number;
	isDay: boolean;
	precipProbability: number;
	time: string;
}

export function HourlyForecastItem(props: Props)
{
	return (
		<div className={styles.container}>
			<p className={styles.temperatureText}>{props.temperature}º</p>
			<SVG name={weatherCodeToSVGName(props.weatherCode, props.isDay)} className={styles.weatherIcon}/>
			<p className={styles.precipProbabilityText}>{props.precipProbability}%</p>
			<p className={styles.timeText}>{props.time}</p>
		</div>
	);
}