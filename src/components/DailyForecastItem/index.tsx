import { useEffect, useState } from 'react';
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
	prevTemperatureNight: number;
	prevTemperatureDay: number;
}

export function DailyForecastItem(props: Props)
{
	const { weatherCodeToSVGName } = useWeatherUtils();

	const [temperatureDeltaSign, setTemperatureDeltaSign] = useState<[(-1 | 0 | 1), (-1 | 0 | 1)]>([0, 0]);

	useEffect(() =>
	{
		const nightDelta = props.temperatureNight - props.prevTemperatureNight;
		const dayDelta = props.temperatureDay - props.prevTemperatureDay;

		setTemperatureDeltaSign([
			nightDelta > 1 ? 1 : nightDelta < -1 ? -1 : 0,
			dayDelta > 1 ? 1 : dayDelta < -1 ? -1 : 0]);
	}, []);

	return (
		<div className={styles.container}>
			<p className={styles.dateText}>{props.date}</p>

			<div className={styles.weatherContainer}>
				<p className={styles.precipitationText}>{props.precipitationProbability}%</p>

				<SVG name={weatherCodeToSVGName(props.weatherCode, true)} className={styles.weatherIcon}/>

				<div className={styles.temperatureContainer}>
					<div className={styles.temperatureTextsContainer}>
						<p className={styles.temperatureText}>{props.temperatureNight}º</p>
						<p className={styles.slashText}>/</p>
						<p className={styles.temperatureText}>{props.temperatureDay}º</p>
					</div>

					<div className={styles.temperatureDeltaContainer}>
					{
						temperatureDeltaSign.map((sign, index) =>
							<SVG key={`temperature-delta-${index}`} name={sign === -1 ? 'temperatureDeltaArrowDown'
								: sign === 0 ? 'temperatureDeltaCircle'
								: 'temperatureDeltaArrowUp'}
								className={styles.weatherIcon}
								style={sign === -1 ? { transform: 'rotateZ(180deg)' } : {}}/>)
					}
					</div>
				</div>
			</div>
		</div>
	);
}