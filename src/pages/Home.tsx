import { useContext, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Home.module.scss";

import { SVG } from "../components/SVG";
import { Button, ButtonType } from "../components/Button";
import { CurrentWeatherDetailsItem } from "../components/CurrentWeatherDetailsItem";
import { HourlyForecastItem } from "../components/HourlyForecastItem";
import { DailyForecastItem } from "../components/DailyForecastItem";
import { SunriseVisualElement } from "../components/SunriseVisualElement";
import { TopBar } from "../components/TopBar";

import useTranslations, { TranslationKey } from "../hooks/useTranslations";
import { NavigateDirection, useAnimatedNavigate } from "../hooks/useAnimatedNavigate";
import { useScrollOverflowMask } from "../hooks/useScrollOverflowMask";
import { useTimeWeatherBg } from "../hooks/useTimeWeatherBg";

import { addHoursToDate, formatHoursFromDate, formatTimeFromDate } from "../misc/utils";

import SettingsContext from "../context/SettingsContext";
import LocationContext from "../context/LocationsContext";
import WeatherContext from "../context/WeatherContext";

import useWeatherLoader from "../hooks/Loaders/useWeatherLoader";
import useWeatherFetcher from "../hooks/useWeatherFetcher";
import { useWeatherUtils } from "../hooks/useWeatherUtils";
import { WeatherFetchStatus } from "../misc/weather";

function Home()
{
	const { settings } = useContext(SettingsContext);
	const { translate, translateWeekday, translateMonth } = useTranslations();
	const { weatherCodeToText, weatherCodeToSVGName, degreesToCompassDirection, uvIndexToText,
		celsiusToFahrenheit, windSpeedToText, precipitationToText, pressureToText, distanceToText } = useWeatherUtils();
	const {} = useWeatherLoader();
	const { fetchWeather } = useWeatherFetcher();
	const { locations } = useContext(LocationContext);

	const pageRef = useRef<HTMLDivElement | null>(null);
	const { initialNavigateSetup, navigateTo } = useAnimatedNavigate(pageRef);

	const navigate = (path: string, direction: NavigateDirection) =>
	{
		if (weatherFetchStatus !== WeatherFetchStatus.Fetching)
			navigateTo(path, direction);
	};

	const { weather, weatherFetchStatus } = useContext(WeatherContext);

	const currentHours: number = (weather.current.time.getHours() ?? 0) + (weather.current.time.getMinutes() ?? 0) / 60;
	const sunrise: Date = weather.daily.sunrise[0] ?? new Date(), sunset: Date = weather.daily.sunset[0] ?? new Date();
	const daylightHours = (sunset.getTime() - sunrise.getTime()) / 1000 / 60 / 60;

	const { getCSSGradient } = useTimeWeatherBg();
	const hourlyForecastRef = useRef<HTMLDivElement | null>(null);
	useScrollOverflowMask(hourlyForecastRef);

	useEffect(initialNavigateSetup, []);

	useEffect(() =>
	{
		if (weatherFetchStatus === WeatherFetchStatus.NotFetched)
			fetchWeather();
	}, []);

	return (
		<div className={styles.page} ref={pageRef}>

			<TopBar useBgBlur>
				<Button type={ButtonType.Secondary} square onClick={() => navigate("/settings", NavigateDirection.Left)}>
					<SVG name="settings"/>
				</Button>

				<div className={styles.currentLocationClickableContainer} onClick={() => navigate("/locations", NavigateDirection.Right)}>
					<p className={styles.currentLocationText}>{locations.find(item => item.isCurrent)?.name || "--"}</p>
				</div>

				<Button type={ButtonType.Secondary} square onClick={fetchWeather} disabled={weatherFetchStatus === WeatherFetchStatus.Fetching}>
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

				<div className={styles.mainInfoContainer} style={{ background: getCSSGradient(sunrise, sunset, weather.current.weatherCode ?? 0) }}>

					<div className={styles.currentWeatherContainer}>
						<div className={styles.currentPrecipContainer}>
							<SVG name={weatherCodeToSVGName(weather.current.weatherCode ?? -1, weather.current.isDay ?? true)} className={styles.currentPrecipIcon}/>
							<p className={styles.currentPrecipText}>{weatherCodeToText(weather.current.weatherCode ?? -1)}</p>
						</div>

						<h1 className={styles.currentTempText}>
							{settings.temperature === "celsius" ? weather.current.temperature + 'º' : Math.round(weather.current.temperature * 9 / 5 + 32) + 'º'}
						</h1>

						<div className={styles.currentDayNightTempContainer}>
							<p className={styles.currentDayNightTempText}>{settings.temperature === "celsius" ? weather.daily.temperatureMin[0] :
								celsiusToFahrenheit(weather.daily.temperatureMin[0])}º</p>
							<p className={styles.currentDayNightTempText}>/</p>
							<p className={styles.currentDayNightTempText}>{settings.temperature === "celsius" ? weather.daily.temperatureMax[0] :
								celsiusToFahrenheit(weather.daily.temperatureMax[0])}º</p>
						</div>
					</div>

					<div className={styles.hourlyForecastContainer}>
						<div className={styles.hourlyForecastItems} ref={hourlyForecastRef}>
						{
							weather.hourly.time.map((time, index) =>
								<HourlyForecastItem key={`${index}-${time}`}
									temperature={settings.temperature === "celsius" ? Math.round(weather.hourly.temperature[index]) :
										celsiusToFahrenheit(Math.round(weather.hourly.temperature[index]))}
									weatherCode={weather.hourly.weatherCode[index]}
									isDay={weather.hourly.isDay[index]}
									isNightVariant={!weather.hourly.isDay[0]}
									precipProbability={weather.hourly.precipitationProbability[index]}
									time={index === 0 ? translate("now") :
										addHoursToDate(new Date(), index).getHours() === 0 ? `${addHoursToDate(new Date(), index).getDate().toString().padStart(2, '0')}.${(addHoursToDate(new Date(), index).getMonth() + 1).toString().padStart(2, '0')}` :
										formatHoursFromDate(addHoursToDate(new Date(), index), settings.time === "12")}/>)
						}
						</div>
					</div>

				</div>

				<div className={styles.dailyForecastContainer}>
				{
					weather.daily.time.map((time, index) =>
					{
						if (index > 0)
						{
							let weekday = translateWeekday(time.getDay(), true);

							return (<DailyForecastItem key={`${index}-${time.toString()}`}
								date={`${index === 1 ? translate("tomorrow") + ', ' + weekday.toLowerCase() : ''}${index === 1 ? '' : weekday}, ${translateMonth(time.getMonth(), true).toLowerCase()} ${time.getDate()}`}
								weatherCode={weather.daily.weatherCode[index]}
								precipitationProbability={weather.daily.precipitationProbabilityMax[index]}
								temperatureNight={settings.temperature === "celsius" ? Math.round(weather.daily.temperatureMin[index])
									: celsiusToFahrenheit(weather.daily.temperatureMin[index])}
								temperatureDay={settings.temperature === "celsius" ? Math.round(weather.daily.temperatureMax[index])
									: celsiusToFahrenheit(weather.daily.temperatureMax[index])}
								prevTemperatureNight={settings.temperature === "celsius" ? Math.round(weather.daily.temperatureMin[index - 1])
									: celsiusToFahrenheit(weather.daily.temperatureMin[index - 1])}
								prevTemperatureDay={settings.temperature === "celsius" ? Math.round(weather.daily.temperatureMax[index - 1])
									: celsiusToFahrenheit(weather.daily.temperatureMax[index - 1])}/>);
						}
						else return null;
					})
				}
				</div>
			</div>

			<div className={styles.mainContentContainer}>
				<div className={styles.currentWeatherDetailsContainer}>
				{
					[
						{ titleKey: "wind" as TranslationKey,
							content: `${windSpeedToText(weather.current.windSpeed, settings.windSpeed)} ${degreesToCompassDirection(weather.current.windDirection)}` },
						{ titleKey: "wind_gusts" as TranslationKey,
							content: `${translate("up_to")} ${windSpeedToText(weather.current.windGusts, settings.windSpeed)}` },
						{ titleKey: "humidity" as TranslationKey,
							content: `${weather.current.relativeHumidity} %` },
						{ titleKey: "precipitation" as TranslationKey,
							content: precipitationToText(weather.current.precipitation, settings.precipitation) },
						{ titleKey: "precipitation_probability" as TranslationKey,
							content: `${weather.current.precipitationProbability} %` },
						{ titleKey: "pressure" as TranslationKey,
							content: pressureToText(weather.current.surfacePressure, settings.pressure) },
						{ titleKey: "cloud_cover" as TranslationKey,
							content: `${weather.current.cloudCover} %` },
						{ titleKey: "visibility" as TranslationKey,
							content: distanceToText(weather.current.visibility, settings.distance) },
						{ titleKey: "uv_index" as TranslationKey,
							content: `${weather.current.uvIndex} (${uvIndexToText(weather.current.uvIndex)})` }
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