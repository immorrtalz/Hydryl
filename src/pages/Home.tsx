import { useContext, useEffect, useRef, useState, useTransition } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import styles from "./Home.module.scss";
import { useWeatherManager } from "../hooks/useWeatherManager";
import { useWeatherUtils } from "../hooks/useWeatherUtils";
import { useScrollOverflowMask } from "../hooks/useScrollOverflowMask";
import { HourlyForecastItem } from "../components/HourlyForecastItem";
import { DailyForecastItem } from "../components/DailyForecastItem";
import { SVG } from "../components/SVG";
import { CurrentWeatherDetailsItem } from "../components/CurrentWeatherDetailsItem";
import { SunriseVisualElement } from "../components/SunriseVisualElement";
import { Button, ButtonType } from "../components/Button";
import { useTranslations } from "../hooks/useTranslations";
import SettingsContext from "../context/SettingsContext";
import { settingOptions, settingTranslationKeys } from "../misc/settings";

function Home()
{
	const navigate = useNavigate();
	const [isTransitionPending, startTransition] = useTransition();
	const [settings] = useContext(SettingsContext);
	const { translate, translateWeekday, translateMonth } = useTranslations();
	const { weatherCodeToText, weatherCodeToSVGName, degreesToCompassDirection, uvIndexToText,
		celsiusToFahrenheit, windSpeedToText, precipitationToText, pressureToText, distanceToText } = useWeatherUtils();

	const { weather, fetchWeather } = useWeatherManager();
	const [isWeatherFetched, setIsWeatherFetched] = useState(false);

	const currentHours: number = (weather.current.time.getHours() ?? 0) + (weather.current.time.getMinutes() ?? 0) / 60;
	const sunrise: Date = weather.daily.sunrise[0] ?? new Date(), sunset: Date = weather.daily.sunset[0] ?? new Date();
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

	const hoursTo12Format = (hours: number, minutes?: number): string =>
	{
		const adjustedHours = hours - (hours == 24 ? 24 : hours > 12 ? 12 : 0);
		return `${adjustedHours}${minutes ? ':' + minutes?.toString().padStart(2, '0') : ''} ${hours < 12 ? 'A' : 'P'}M`
	}

	const hourlyForecastRef = useRef(null);
	const hourlyForecastMaskImage = weather ? useScrollOverflowMask(hourlyForecastRef) : '';

	useEffect(() =>
	{
		const fetchWeatherAsync = async () =>
		{
			try
			{
				await fetchWeather();
				setIsWeatherFetched(true);
			}
			catch(error) { console.warn("Failed to fetch weather:", error) }
		};

		if (!isWeatherFetched) fetchWeatherAsync();
	}, []);

	return (
		<motion.div className={styles.page}
			initial={{ opacity: 0.5, pointerEvents: "none" }}
			animate={{ opacity: 1, pointerEvents: "all" }}
			exit={{ opacity: 0.5, pointerEvents: "none" }}
			transition={{ duration: 0.3, ease: [0.66, 0, 0.34, 1] }}>

			<div className={styles.topBar}>
				<Button type={ButtonType.Secondary} square onClick={() => startTransition(() => navigate("/settings"))}>
					<SVG name="settings"/>
				</Button>

				<p className={styles.currentLocationNameText}>Fukuoka</p>

				<Button type={ButtonType.Secondary} square /* onClick={() => startTransition(() => navigate("/locations"))} */>
					<SVG name="location"/>
				</Button>
			</div>

			<div className={styles.heroContainer}>
				<div className={styles.mainInfoContainer} style={{ background: `var(--${timeBackgroundGradient()}-gradient)` }}>

					<div className={styles.currentWeatherContainer}>
						<div className={styles.currentPrecipContainer}>
							<SVG name={weatherCodeToSVGName(weather.current.weather_code ?? -1, weather.current.is_day ?? true)} className={styles.currentPrecipIcon}/>
							<p className={styles.currentPrecipText}>{weatherCodeToText(weather.current.weather_code ?? -1)}</p>
						</div>

						<div className={styles.currentTempContainer}>
							<h1 className={styles.currentTempText}>{settings.temperature === "celsius" ? weather.current.temperature_2m :
								Math.round(weather.current.temperature_2m * 9 / 5 + 32)}</h1>
							<h3 className={styles.currentTempText}>{settings.temperature === "celsius" ? "ºC" : "ºF"}</h3>
						</div>

						<div className={styles.currentDayNightTempContainer}>
							<p className={styles.currentDayNightTempText}>{settings.temperature === "celsius" ? weather.daily.temperature_2m_min[0] :
								celsiusToFahrenheit(weather.daily.temperature_2m_min[0])}º</p>
							<p className={styles.currentDayNightTempText}>/</p>
							<p className={styles.currentDayNightTempText}>{settings.temperature === "celsius" ? weather.daily.temperature_2m_max[0] :
								celsiusToFahrenheit(weather.daily.temperature_2m_max[0])}º</p>
						</div>
					</div>

					<div className={styles.hourlyForecastContainer}>
						<motion.div className={styles.hourlyForecastItems} ref={hourlyForecastRef} style={{ maskImage: hourlyForecastMaskImage }}>
							{
								weather.hourly.time.map((time, index) =>
									<HourlyForecastItem key={`${index}-${time}`}
										temperature={Math.round(weather.hourly.temperature_2m[index])}
										weatherCode={weather.hourly.weather_code[index]}
										isDay={weather.hourly.is_day[index]}
										isNightVariant={!weather.hourly.is_day[0]}
										precipProbability={weather.hourly.precipitation_probability[index]}
										time={index === 0 ? "Now" :
											time.getHours() === 0 ? `${time.getDate().toString().padStart(2, '0')}.${(time.getMonth() + 1).toString().padStart(2, '0')}` :
											settings.time === "12" ? hoursTo12Format(time.getHours()) :
											time.getHours() + ":00"}/>)
							}
						</motion.div>
					</div>

				</div>

				<div className={styles.dailyForecastContainer}>
					{
						weather.daily.time.map((time, index) => (
							index < 5 &&
								<DailyForecastItem key={`${index}-${time}`}
									date={index === 0 ? translate("tomorrow") :
										`${translateWeekday(time.getDay(), true)}, ${translateMonth(time.getMonth(), true)} ${time.getDate()}`}
									weatherCode={weather.daily.weather_code[index]}
									precipitationProbability={weather.daily.precipitation_probability_max[index]}
									temperatureNight={settings.temperature === "celsius" ? Math.round(weather.daily.temperature_2m_min[index]) :
										celsiusToFahrenheit(weather.daily.temperature_2m_min[index])}
									temperatureDay={settings.temperature === "celsius" ? Math.round(weather.daily.temperature_2m_max[index]) :
										celsiusToFahrenheit(weather.daily.temperature_2m_max[index])}/>))
					}
				</div>
			</div>

			<div className={styles.mainContentContainer}>
				<div className={styles.currentWeatherDetailsContainer}>
					<CurrentWeatherDetailsItem title={translate("wind")}
						content={`${windSpeedToText(weather.current.wind_speed_10m, settings.windSpeed)} ${degreesToCompassDirection(weather.current.wind_direction_10m || 0)}`}/>
					<CurrentWeatherDetailsItem title={translate("wind_gusts")}
						content={`${windSpeedToText(weather.current.wind_gusts_10m, settings.windSpeed)}`}/>
					<CurrentWeatherDetailsItem title={translate("humidity")}
						content={`${weather.current.relative_humidity_2m} %`}/>
					<CurrentWeatherDetailsItem title={translate("precipitation")}
						content={`${precipitationToText(weather.current.precipitation, settings.precipitation)}`}/>
					<CurrentWeatherDetailsItem title={translate("precipitation_probability")}
						content={`${weather.current.precipitation_probability} %`}/>
					<CurrentWeatherDetailsItem title={translate("pressure")}
						content={`${pressureToText(weather.current.surface_pressure, settings.pressure)}`}/>
					<CurrentWeatherDetailsItem title={translate("cloud_cover")}
						content={`${weather.current.cloud_cover} %`}/>
					<CurrentWeatherDetailsItem title={translate("visibility")}
						content={`${distanceToText(weather.current.visibility, settings.distance)}`}/>
					<CurrentWeatherDetailsItem title={translate("uv_index")}
						content={`${weather.current.uv_index} (${uvIndexToText(weather.current.uv_index || 0)})`}/>
				</div>

				<div className={`${styles.currentWeatherDetailsContainer} ${styles.sunriseSunsetContainer}`}>
					<div className={styles.sunriseSunsetItem}>
						<p className={styles.sunriseSunsetItemContentText}>{settings.time === "12" ? hoursTo12Format(sunrise.getHours(), sunrise.getMinutes()) :
							sunrise.getHours() + ":" + sunrise.getMinutes().toString().padStart(2, "0")}</p>
						<p className={styles.sunriseSunsetItemTitleText}>{translate("sunrise")}</p>
					</div>

					<SunriseVisualElement currentHours={currentHours} daylightHours={daylightHours}/>

					<div className={styles.sunriseSunsetItem}>
						<p className={styles.sunriseSunsetItemContentText}>{settings.time === "12" ? hoursTo12Format(sunset.getHours(), sunset.getMinutes()) :
							sunset.getHours() + ":" + sunset.getMinutes().toString().padStart(2, "0")}</p>
						<p className={styles.sunriseSunsetItemTitleText}>{translate("sunset")}</p>
					</div>
				</div>

				<p className={styles.dataProvidedByText}>{translate("data_provided_by")}</p>
			</div>

		</motion.div>
	);
}

export default Home;