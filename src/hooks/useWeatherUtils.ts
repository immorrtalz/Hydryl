import { useTranslations } from "./useTranslate";

export function useWeatherUtils()
{
	const { translate } = useTranslations();

	return {
		weatherCodeToText: (code: number): string =>
		{
			const weatherTranslationKeys: Record<number, string> =
			{
				0: "clear",
				1: "mainly_clear",
				2: "partly_cloudy",
				3: "overcast",
				45: "fog",
				48: "depositing_rime_fog",
				51: "light_drizzle",
				53: "moderate_drizzle",
				55: "dense_drizzle",
				56: "light_freezing_drizzle",
				57: "dense_freezing_drizzle",
				61: "slight_rain",
				63: "moderate_rain",
				65: "heavy_rain",
				66: "light_freezing_rain",
				67: "heavy_freezing_rain",
				71: "slight_snow_fall",
				73: "moderate_snow_fall",
				75: "heavy_snow_fall",
				77: "snow_grains",
				80: "slight_rain_showers",
				81: "moderate_rain_showers",
				82: "violent_rain_showers",
				85: "slight_snow_showers",
				86: "heavy_snow_showers",
				95: "thunderstorm",
				96: "thunderstorm_with_slight_hail",
				99: "thunderstorm_with_heavy_hail"
			};

			return translate(weatherTranslationKeys[code]) || "Unknown";
		},

		weatherCodeToSVGName: (code: number, isDay: boolean): string =>
		{
			const weatherNames: Record<number, string> =
			{
				0: isDay ? "sun" : "moon",
				1: isDay ? "sun" : "moon",
				2: isDay ? "cloudSun" : "cloudMoon",
				3: "cloud",
				45: "fog",
				48: "rimeFog",
				51: "cloudDrizzle",
				53: "cloudDrizzle",
				55: "cloudDrizzle",
				56: "cloudDrizzle",
				57: "cloudDrizzle",
				61: "cloudRain",
				63: "cloudRain",
				65: "cloudHeavyRain",
				66: "cloudRain",
				67: "cloudHeavyRain",
				71: "snow",
				73: "heavySnow",
				75: "snowStorm",
				77: "snowGrains",
				80: "cloudHeavyRain",
				81: "cloudHeavyRain",
				82: "cloudHeavyRain",
				85: "snowStorm",
				86: "snowStorm",
				95: "cloudThunderstorm",
				96: "cloudThunderstorm",
				99: "cloudThunderstorm"
			};

			return weatherNames[code] ?? "sun";
		},

		degreesToCompassDirection: (degrees: number): string =>
		{
			const directions = ["wind_N", "wind_NW", "wind_W", "wind_SW", "wind_S", "wind_SE", "wind_E", "wind_NE"];
			return translate(directions[Math.ceil(((degrees - 22.5) / 45))]);
		},

		uvIndexToText: (uvIndex: number): string =>
		{
			const key = uvIndex <= 2 ? "uv_low" : uvIndex <= 5 ? "uv_moderate" : uvIndex <= 7 ? "uv_high" : uvIndex <= 10 ? "uv_very_high" : "uv_extreme";
			return translate(key);
		}
	};
}