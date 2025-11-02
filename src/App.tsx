import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import { HourlyForecastItem } from "./components/HourlyForecastItem";
import { DailyForecastItem } from "./components/DailyForecastItem";
import { WeatherData, useWeatherManager, weatherCodeToSVGName, weatherCodeToText, degreesToCompassDirection, uvIndexToText } from "./hooks/useWeatherManager";
import { SVG } from "./components/SVG";
import { Locale, translate, translateMonth, translateWeekday } from "./misc/translations";
import { CurrentWeatherDetailsItem } from "./components/CurrentWeatherDetailsItem";
import { SunriseVisualElement } from "./components/SunriseVisualElement";
import { Button, ButtonType } from "./components/Button";

interface Settings
{
	locale: Locale;
}

function App()
{
	const [settings, setSettings] = useState<Settings>({ locale: 'en' });

	const weatherManager = useWeatherManager();
	const [weather, setWeather] = useState<WeatherData | null>(null);

	const currentHours: number = (weather?.current.time.getHours() ?? 0) + (weather?.current.time.getMinutes() ?? 0) / 60;
	const sunrise: Date = weather?.daily.sunrise[0] ?? new Date(), sunset: Date = weather?.daily.sunset[0] ?? new Date();
	const daylightHours = (sunset.getTime() - sunrise.getTime()) / 1000 / 60 / 60;

	const timeBackgroundGradients = ["early", "mid", "late", "day", "night"];

	const timeBackgroundGradient = (): string =>
	{
		const currentDateTime = new Date().getTime();
		const sunriseMinusCurrentTime = sunrise.getTime() - currentDateTime;
		const sunsetMinusCurrentTime = sunset.getTime() - currentDateTime;

		const thirtyMinutesInMs = 1000 * 60 * 30;

		var gradientIndex;

		if (Math.abs(sunriseMinusCurrentTime) <= thirtyMinutesInMs * 2) // around sunrise
			gradientIndex = Math.abs(sunriseMinusCurrentTime) <= thirtyMinutesInMs ? 1 : sunriseMinusCurrentTime > 0 ? 0 : 2;
		else if (Math.abs(sunsetMinusCurrentTime) <= thirtyMinutesInMs * 2) // around sunset
			gradientIndex = Math.abs(sunsetMinusCurrentTime) <= thirtyMinutesInMs ? 1 : sunsetMinusCurrentTime > 0 ? 2 : 0;
		else gradientIndex = sunriseMinusCurrentTime < 0 && sunsetMinusCurrentTime > 0 ? 3 : 4; // daytime or nighttime

		return timeBackgroundGradients[gradientIndex];
	};

	useEffect(() => { weatherManager.fetchWeather().then(weather => setWeather(weather)); }, []);

	return (
		<main>
			<div className={styles.topBar}>
				<Button type={ButtonType.Secondary} square>
					<SVG name="settings" className={styles.currentPrecipIcon}/>
				</Button>
				<p className={styles.currentLocationNameText}>Fukuoka</p>
				<Button type={ButtonType.Secondary} square>
					<SVG name="location" className={styles.currentPrecipIcon}/>
				</Button>
			</div>

			<div className={styles.heroContainer}>
				<div className={styles.mainInfoContainer} style={{background: `var(--${timeBackgroundGradient()}-gradient)`}}>

					<div className={styles.currentWeatherContainer}>
						<div className={styles.currentPrecipContainer}>
							<SVG name={weatherCodeToSVGName(weather?.current.weather_code ?? -1, weather?.current.is_day ?? true)} className={styles.currentPrecipIcon}/>
							<p className={styles.currentPrecipText}>{weatherCodeToText(weather?.current.weather_code ?? -1, settings.locale)}</p>
						</div>

						<div className={styles.currentTempContainer}>
							<h1 className={styles.currentTempText}>{weather?.current.temperature_2m ?? "--"}</h1>
							<h3 className={styles.currentTempText}>ºC</h3>
						</div>

						<div className={styles.currentDayNightTempContainer}>
							<p className={styles.currentDayNightTempText}>{weather?.daily.temperature_2m_min[0] ?? "--"}º</p>
							<p className={styles.currentDayNightTempText}>/</p>
							<p className={styles.currentDayNightTempText}>{weather?.daily.temperature_2m_max[0] ?? "--"}º</p>
						</div>
					</div>

					<div className={styles.hourlyForecastContainer}>
						<div className={styles.hourlyForecastItems}>
							{
								weather?.hourly.time.map((time, index) =>
									<HourlyForecastItem key={`${index}-${time}`}
										temperature={Math.round(weather.hourly.temperature_2m[index])}
										weatherCode={weather.hourly.weather_code[index]}
										isDay={weather.hourly.is_day[index]}
										precipProbability={weather.hourly.precipitation_probability[index]}
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
									date={index === 0 ? translate("tomorrow", settings.locale) :
										`${translateWeekday(time.getDay(), settings.locale, true)}, ${translateMonth(time.getMonth(), settings.locale, true)} ${time.getDate()}`}
									weatherCode={weather.daily.weather_code[index]}
									precipitationProbability={weather.daily.precipitation_probability_max[index]}
									temperatureNight={Math.round(weather.daily.temperature_2m_min[index])}
									temperatureDay={Math.round(weather.daily.temperature_2m_max[index])}/>))
					}
				</div>
			</div>

			<div className={styles.mainContentContainer}>
				<div className={styles.currentWeatherDetailsContainer}>
					<CurrentWeatherDetailsItem title={translate("wind", settings.locale)} content={`${weather?.current.wind_speed_10m} m/s ${degreesToCompassDirection(weather?.current.wind_direction_10m || 0, settings.locale)}`}/>
					<CurrentWeatherDetailsItem title={translate("wind_gusts", settings.locale)} content={`${weather?.current.wind_gusts_10m} m/s`}/>
					<CurrentWeatherDetailsItem title={translate("humidity", settings.locale)} content={`${weather?.current.relative_humidity_2m} %`}/>
					<CurrentWeatherDetailsItem title={translate("precipitation", settings.locale)} content={`${weather?.current.precipitation} mm`}/>
					<CurrentWeatherDetailsItem title={translate("precipitation_probability", settings.locale)} content={`${weather?.current.precipitation_probability} %`}/>
					<CurrentWeatherDetailsItem title={translate("pressure", settings.locale)} content={`${weather?.current.surface_pressure} mmHg`}/>
					<CurrentWeatherDetailsItem title={translate("cloud_cover", settings.locale)} content={`${weather?.current.cloud_cover} %`}/>
					<CurrentWeatherDetailsItem title={translate("visibility", settings.locale)} content={`${weather?.current.visibility} km`}/>
					<CurrentWeatherDetailsItem title={translate("uv_index", settings.locale)} content={`${weather?.current.uv_index} (${uvIndexToText(weather?.current.uv_index || 0, settings.locale)})`}/>
				</div>

				<div className={`${styles.currentWeatherDetailsContainer} ${styles.sunriseSunsetContainer}`}>
					<div className={styles.sunriseSunsetItem}>
						<p className={styles.sunriseSunsetItemContentText}>{sunrise.getHours()}:{sunrise.getMinutes().toString().padStart(2, '0')}</p>
						<p className={styles.sunriseSunsetItemTitleText}>Sunrise</p>
					</div>

					<SunriseVisualElement currentHours={currentHours} daylightHours={daylightHours}/>

					<div className={styles.sunriseSunsetItem}>
						<p className={styles.sunriseSunsetItemContentText}>{sunset.getHours()}:{sunset.getMinutes().toString().padStart(2, '0')}</p>
						<p className={styles.sunriseSunsetItemTitleText}>Sunset</p>
					</div>
				</div>

				<p className={styles.dataProvidedByText}>Data provided by open-meteo.com</p>
			</div>
		</main>
	);
}

export default App;