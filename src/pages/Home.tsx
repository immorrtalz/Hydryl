import { useContext, useEffect, useRef } from "react";
import styles from "./Home.module.scss";
import { useWeatherUtils } from "../hooks/useWeatherUtils";
import { useScrollOverflowMask } from "../hooks/useScrollOverflowMask";
import { HourlyForecastItem } from "../components/HourlyForecastItem";
import { DailyForecastItem } from "../components/DailyForecastItem";
import { SVG } from "../components/SVG";
import { CurrentWeatherDetailsItem } from "../components/CurrentWeatherDetailsItem";
import { SunriseVisualElement } from "../components/SunriseVisualElement";
import { Button, ButtonType } from "../components/Button";
import { TranslationKey, useTranslations } from "../hooks/useTranslations";
import SettingsContext from "../context/SettingsContext";
import { formatHoursFromDate, formatTimeFromDate } from "../misc/utils";
import { useTimeWeatherBg } from "../hooks/useTimeWeatherBg";
import WeatherContext, { WeatherFetchStatus } from "../context/WeatherContext";
import { AnimatePresence, motion } from "motion/react";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { useWeatherManager } from "../hooks/useWeatherManager";
import { TopBar } from "../components/TopBar";

function Home()
{
	const [settings] = useContext(SettingsContext);
	const { translate, translateWeekday, translateMonth } = useTranslations();
	const { weatherCodeToText, weatherCodeToSVGName, degreesToCompassDirection, uvIndexToText,
		celsiusToFahrenheit, windSpeedToText, precipitationToText, pressureToText, distanceToText } = useWeatherUtils();
	const { fetchWeather } = useWeatherManager();

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef, styles);

	const navigate = (path: string, direction: NavigateDirection) =>
	{
		if (weatherFetchStatus !== WeatherFetchStatus.Fetching) navigateTo(path, direction);
	};

	const [weather,, weatherFetchStatus] = useContext(WeatherContext);

	const currentHours: number = (weather.current.time.getHours() ?? 0) + (weather.current.time.getMinutes() ?? 0) / 60;
	const sunrise: Date = weather.daily.sunrise[0] ?? new Date(), sunset: Date = weather.daily.sunset[0] ?? new Date();
	const daylightHours = (sunset.getTime() - sunrise.getTime()) / 1000 / 60 / 60;

	const { getCSSGradient } = useTimeWeatherBg();
	const hourlyForecastRef = useRef<HTMLDivElement | null>(null);
	useScrollOverflowMask(hourlyForecastRef);

	useEffect(initialNavigateSetup, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<TopBar>
				<Button type={ButtonType.Secondary} square onClick={() => navigate("/settings", NavigateDirection.Left)}>
					<SVG name="settings"/>
				</Button>

				<div className={styles.currentLocationClickableContainer} onClick={() => navigate("/locations", NavigateDirection.Right)}>
					<p className={styles.currentLocationText}>Ufa</p>
				</div>

				<Button type={ButtonType.Secondary} square onClick={fetchWeather}>
					<SVG name="update"/>
				</Button>
			</TopBar>

			<div className={styles.heroContainer}>
				<AnimatePresence>
					{
						weatherFetchStatus !== WeatherFetchStatus.Fetched &&
						<motion.div className={`${styles.weatherFetchingNotifContainer} ${weatherFetchStatus === WeatherFetchStatus.Error ? styles.weatherFetchingNotifContainerError : ''}`}
							initial={{ opacity: 0, y: "-50%" }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: "-50%" }}
							transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}>
							<p className={styles.weatherFetchingNotifText}>{translate(weatherFetchStatus === WeatherFetchStatus.Fetching ? "fetching_up_to_date_weather" : "weather_fetch_failed")}</p>
						</motion.div>
					}
				</AnimatePresence>

				<div className={styles.mainInfoContainer} style={{ background: getCSSGradient(sunrise, sunset, weather.current.weather_code ?? 0) }}>

					<div className={styles.currentWeatherContainer}>
						<div className={styles.currentPrecipContainer}>
							<SVG name={weatherCodeToSVGName(weather.current.weather_code ?? -1, weather.current.is_day ?? true)} className={styles.currentPrecipIcon}/>
							<p className={styles.currentPrecipText}>{weatherCodeToText(weather.current.weather_code ?? -1)}</p>
						</div>

						<h1 className={styles.currentTempText}>
							{settings.temperature === "celsius" ? weather.current.temperature_2m + 'º' : Math.round(weather.current.temperature_2m * 9 / 5 + 32) + 'º'}
						</h1>

						<div className={styles.currentDayNightTempContainer}>
							<p className={styles.currentDayNightTempText}>{settings.temperature === "celsius" ? weather.daily.temperature_2m_min[0] :
								celsiusToFahrenheit(weather.daily.temperature_2m_min[0])}º</p>
							<p className={styles.currentDayNightTempText}>/</p>
							<p className={styles.currentDayNightTempText}>{settings.temperature === "celsius" ? weather.daily.temperature_2m_max[0] :
								celsiusToFahrenheit(weather.daily.temperature_2m_max[0])}º</p>
						</div>
					</div>

					<div className={styles.hourlyForecastContainer}>
						<div className={styles.hourlyForecastItems} ref={hourlyForecastRef}>
							{
								weather.hourly.time.map((time, index) =>
									<HourlyForecastItem key={`${index}-${time}`}
										temperature={settings.temperature === "celsius" ? Math.round(weather.hourly.temperature_2m[index]) :
											celsiusToFahrenheit(Math.round(weather.hourly.temperature_2m[index]))}
										weatherCode={weather.hourly.weather_code[index]}
										isDay={weather.hourly.is_day[index]}
										isNightVariant={!weather.hourly.is_day[0]}
										precipProbability={weather.hourly.precipitation_probability[index]}
										time={index === 0 ? translate("now") :
											time.getHours() === 0 ? `${time.getDate().toString().padStart(2, '0')}.${(time.getMonth() + 1).toString().padStart(2, '0')}` :
											formatHoursFromDate(time, settings.time === "12")}/>)
							}
						</div>
					</div>

				</div>

				<div className={styles.dailyForecastContainer}>
					{
						weather.daily.time.map((time, index) =>
							{
								var weekday = translateWeekday(time.getDay(), true);
								if (index === 1) weekday = weekday.toLowerCase();

								return ( index >= 1 &&
									<DailyForecastItem key={`${index}-${time}`}
										date={`${index === 1 ? translate("tomorrow") + ', ' : ''}${weekday}, ${translateMonth(time.getMonth(), true).toLowerCase()} ${time.getDate()}`}
										weatherCode={weather.daily.weather_code[index]}
										precipitationProbability={weather.daily.precipitation_probability_max[index]}
										temperatureNight={settings.temperature === "celsius" ? Math.round(weather.daily.temperature_2m_min[index]) :
											celsiusToFahrenheit(weather.daily.temperature_2m_min[index])}
										temperatureDay={settings.temperature === "celsius" ? Math.round(weather.daily.temperature_2m_max[index]) :
											celsiusToFahrenheit(weather.daily.temperature_2m_max[index])}/>)
							})
					}
				</div>
			</div>

			<div className={styles.mainContentContainer}>
				<div className={styles.currentWeatherDetailsContainer}>
					{
						[
							{ titleKey: "wind" as TranslationKey,
								content: `${windSpeedToText(weather.current.wind_speed_10m, settings.windSpeed)} ${degreesToCompassDirection(weather.current.wind_direction_10m)}` },
							{ titleKey: "wind_gusts" as TranslationKey,
								content: `${translate("up_to")} ${windSpeedToText(weather.current.wind_gusts_10m, settings.windSpeed)}` },
							{ titleKey: "humidity" as TranslationKey,
								content: `${weather.current.relative_humidity_2m} %` },
							{ titleKey: "precipitation" as TranslationKey,
								content: precipitationToText(weather.current.precipitation, settings.precipitation) },
							{ titleKey: "precipitation_probability" as TranslationKey,
								content: `${weather.current.precipitation_probability} %` },
							{ titleKey: "pressure" as TranslationKey,
								content: pressureToText(weather.current.surface_pressure, settings.pressure) },
							{ titleKey: "cloud_cover" as TranslationKey,
								content: `${weather.current.cloud_cover} %` },
							{ titleKey: "visibility" as TranslationKey,
								content: distanceToText(weather.current.visibility, settings.distance) },
							{ titleKey: "uv_index" as TranslationKey,
								content: `${weather.current.uv_index} (${uvIndexToText(weather.current.uv_index)})` }
						].map(({ titleKey, content }) => <CurrentWeatherDetailsItem key={`weather-details-${titleKey}`} title={translate(titleKey)} content={content}/>)
					}
				</div>

				<div className={`${styles.currentWeatherDetailsContainer} ${styles.sunriseSunsetContainer}`}>
					<div className={styles.sunriseSunsetItem}>
						<p className={styles.sunriseSunsetItemContentText}>{formatTimeFromDate(sunrise, settings.time === "12")}</p>
						<p className={styles.sunriseSunsetItemTitleText}>{translate("sunrise")}</p>
					</div>

					<SunriseVisualElement currentHours={currentHours} daylightHours={daylightHours}/>

					<div className={styles.sunriseSunsetItem}>
						<p className={styles.sunriseSunsetItemContentText}>{formatTimeFromDate(sunset, settings.time === "12")}</p>
						<p className={styles.sunriseSunsetItemTitleText}>{translate("sunset")}</p>
					</div>
				</div>

				<p className={styles.dataProvidedByText}>{translate("data_provided_by")}</p>
			</div>

		</div>
	);
}

export default Home;