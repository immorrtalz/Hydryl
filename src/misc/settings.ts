import { TranslationKey } from "../hooks/useTranslations";

export type Locale = "en" | "ru";
export type Time = "12" | "24";
export type Temperature = "celsius" | "fahrenheit";
export type WindSpeed = "kmh" | "ms" | "mph" | "knots";
export type Precipitation = "mm" | "inch";
export type Pressure = "atm" | "mmHg" | "mbar" | "psi";
export type Distance = "m" | "km" | "mi";

export interface Settings
{
	locale: Locale,
	time: Time,
	temperature: Temperature,
	windSpeed: WindSpeed,
	precipitation: Precipitation,
	pressure: Pressure,
	distance: Distance
}

export interface DisplayOption
{
	displayValue: string;
	value: string;
}

export const settingOptions: Record<keyof Settings, string[]> =
{
	locale: ["en", "ru"],
	time: ["12", "24"],
	temperature: ["celsius", "fahrenheit"],
	windSpeed: ["kmh", "ms", "mph", "knots"],
	precipitation: ["mm", "inch"],
	pressure: ["atm", "mmHg", "mbar", "psi"],
	distance: ["m", "km", "mi"]
} as const;

export const settingTranslationKeys: Record<keyof Settings, TranslationKey[]> =
{
	locale: settingOptions.locale.map(value => `setting_locale_${value}`) as TranslationKey[],
	time: settingOptions.time.map(value => `setting_time_${value}`) as TranslationKey[],
	temperature: settingOptions.temperature.map(value => `setting_temperature_${value}`) as TranslationKey[],
	windSpeed: settingOptions.windSpeed.map(value => `setting_windSpeed_${value}`) as TranslationKey[],
	precipitation: settingOptions.precipitation.map(value => `setting_precipitation_${value}`) as TranslationKey[],
	pressure: settingOptions.pressure.map(value => `setting_pressure_${value}`) as TranslationKey[],
	distance: settingOptions.distance.map(value => `setting_distance_${value}`) as TranslationKey[]
} as const;

export const getSettingTranslationKey = (settingKey: keyof Settings, settingUnit: keyof typeof settingOptions): TranslationKey =>
	settingTranslationKeys[settingKey][settingOptions[settingKey].indexOf(settingUnit)];

export const initialSettings: Settings =
{
	locale: "en",
	time: "24",
	temperature: "celsius",
	windSpeed: "ms",
	precipitation: "mm",
	pressure: "mmHg",
	distance: "km"
};