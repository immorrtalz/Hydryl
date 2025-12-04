const timeAffixes = ["early", "mid", "late", "day", "night", "mornevening"];
const weatherAffixes = ["clear", "fog"];

const gradientColors: Record<string, string[]> =
{
	"early_clear": ["#0C091A", "#402040", "#B25071"],
	"mid_clear": ["#3B2D59", "#A6536F", "#FF9059"],
	"late_clear": ["#2D5AB2", "#6088BF", "#E5C37E"],
	"day_clear": ["#3060BF", "#679CE5"],
	"night_clear": ["#0C091A", "#1F1F4D"],
	"mornevening_fog": ["#504C59", "#A68D95", "#E5BFAC"],
	"day_fog": ["#4D5566", "#8F9FBF"],
	"night_fog": ["#16161A", "#303240"]
};

export function useTimeWeatherBg()
{
	return {
		getCSSGradient: (sunriseDateTime: Date, sunsetDateTime: Date, currentWeatherCode: number): string =>
		{
			const thirtyMinutesInMs = 1000 * 60 * 30;

			const currentMilliseconds = new Date().getTime();
			const sunriseMinusCurrentTime = sunriseDateTime.getTime() - currentMilliseconds;
			const sunsetMinusCurrentTime = sunsetDateTime.getTime() - currentMilliseconds;

			const isHourNearSunrise = Math.abs(sunriseMinusCurrentTime) <= thirtyMinutesInMs * 2;
			const isHourNearSunset = Math.abs(sunsetMinusCurrentTime) <= thirtyMinutesInMs * 2;

			var timeAffixIndex = 3;

			if (isHourNearSunrise || isHourNearSunset)
			{
				if (currentWeatherCode >= 3) timeAffixIndex = 5; // morning/evening for fog or weather with precipitation
				else if (isHourNearSunrise)  timeAffixIndex = Math.abs(sunriseMinusCurrentTime) <= thirtyMinutesInMs ? 1 : sunriseMinusCurrentTime > 0 ? 0 : 2; // around sunrise
				else if (isHourNearSunset)  timeAffixIndex = Math.abs(sunsetMinusCurrentTime) <= thirtyMinutesInMs ? 1 : sunsetMinusCurrentTime > 0 ? 2 : 0; // around sunset
			}
			else timeAffixIndex = sunriseMinusCurrentTime < 0 && sunsetMinusCurrentTime > 0 ? 3 : 4; // day or night

			return `linear-gradient(to bottom, ${gradientColors[`${timeAffixes[timeAffixIndex]}_${weatherAffixes[currentWeatherCode <= 2 ? 0 : 1]}`].join(", ")})`;
		}
	};
}