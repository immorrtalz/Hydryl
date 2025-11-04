import { Locale } from "../hooks/useTranslate";

export interface Settings
{
	locale: Locale;
	time: "12" | "24";
	temperature: "celsius" | "fahrenheit";
	windSpeed: "kmh" | "ms" | "mph" | "knots";
	precipitation: "mm" | "inch";
	pressure: "atm" | "mmHg" | "inHg" | "mbar" | "psi";
	distance: "m" | "km" | "miles";
}

export const initialSettings: Settings =
{
	locale: "en",
	time: "24",
	temperature: "celsius",
	windSpeed: "kmh",
	precipitation: "mm",
	pressure: "mmHg",
	distance: "km",
};