import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import { HourlyForecastItem } from "./components/HourlyForecastItem";
import { DailyForecastItem } from "./components/DailyForecastItem";
import { WeatherData, useWeatherManager, weatherCodeToSVGName, weatherCodeToText } from "./hooks/useWeatherManager";
import { SVG } from "./components/SVG";
import { Locale, translate, translateMonth, translateWeekday } from "./misc/translations";

interface Settings
{
	locale: Locale;
}

function App()
{
	const [settings, setSettings] = useState<Settings>({ locale: 'en' });

	const weatherManager = useWeatherManager();
	const [weather, setWeather] = useState<WeatherData | null>(null);

	useEffect(() => { weatherManager.fetchWeather().then(weather => setWeather(weather)); }, []);

	return (
		<main>
			<div className={styles.topBar}></div>

			<div className={styles.heroContainer}>
				<div className={styles.mainInfoContainer}>

					<div className={styles.currentWeatherContainer}>
						<div className={styles.currentPrecipContainer}>
							<SVG name={weatherCodeToSVGName(weather?.current.weather_code ?? -1, weather?.current.is_day ?? true)} className={styles.currentPrecipIcon}/>
							<p className={styles.currentPrecipText}>{weatherCodeToText(weather?.current.weather_code ?? -1, settings.locale)}</p>
						</div>

						<div className={styles.currentTempContainer}>
							<h1 className={styles.currentTempText}>{weather?.current.temperature_2m}</h1>
							<h3 className={styles.currentTempText}>ºC</h3>
						</div>

						<div className={styles.currentAdditionalTempsContainer}>
							<p className={styles.currentApparentTempText}>{translate("feels_like", settings.locale)} {weather?.current.apparent_temperature}º</p>

							<div className={styles.currentDayNightTempContainer}>
								<p className={styles.currentDayNightTempText}>{weather?.daily.temperature_2m_min[0]}º</p>
								<p className={styles.currentDayNightTempText}>/</p>
								<p className={styles.currentDayNightTempText}>{weather?.daily.temperature_2m_max[0]}º</p>
							</div>
						</div>
					</div>

					<div className={styles.hourlyForecastContainer}>
						<div className={styles.hourlyForecastMaskedItems}>
							{
								weather?.hourly.time.map((time, index) =>
									<HourlyForecastItem key={`${index}-${time}`}
										temperature={Math.round(weather.hourly.temperature_2m[index])}
										weatherCode={weather.hourly.weather_code[index]}
										isDay={weather.hourly.is_day[index]}
										time={index === 0 ? "Now" : time.getHours() === 0 ?
											`${time.getDate().toString().padStart(2, '0')}.${(time.getMonth() + 1).toString().padStart(2, '0')}` : time.getHours() + ":00"}/>)
							}
						</div>
					</div>

				</div>

				<div className={styles.dailyForecastContainer}>
					{
						weather?.daily.time.map((time, index) => (
							index < 5 &&
								<DailyForecastItem key={`${index}-${time}`}
									date={index === 0 ? "Tomorrow" :
										`${translateWeekday(time.getDay(), settings.locale, true)}, ${translateMonth(time.getMonth(), settings.locale, true)} ${time.getDate()}`}
									weatherCode={weather.daily.weather_code[index]}
									temperatureNight={Math.round(weather.daily.temperature_2m_min[index])}
									temperatureDay={Math.round(weather.daily.temperature_2m_max[index])}/>))
					}
				</div>
			</div>
		</main>
	);
}

export default App;