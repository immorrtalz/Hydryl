import { useContext } from "react";
import SettingsContext from "../context/SettingsContext";
import translationsJson from "../misc/translations.json";

export type Locale = 'en' | 'ru';

const translations: {[key: string]: {[locale: string]: string }} = translationsJson;

export type TranslationKey = keyof typeof translations;

export function useTranslations()
{
	const [settings] = useContext(SettingsContext);
	const translate = (key: TranslationKey): string => translations[key]?.[settings.locale ?? 'en'] ?? key;

	return {
		translate: (key: TranslationKey): string => translate(key),

		translateWeekday: (weekday: number, useShortWeekday: boolean = false): string =>
		{
			if (weekday < 0 || weekday > 6) return "??";
			const weekdaysKeys: TranslationKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
			return translate(weekdaysKeys[weekday] + (useShortWeekday ? "_short" : "") as TranslationKey);
		},

		translateMonth: (month: number, useShortMonth: boolean = false): string =>
		{
			if (month < 0 || month > 11) return "???";
			const monthKeys: TranslationKey[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
			const fullTranslation = translate(monthKeys[month]);

			return useShortMonth ? fullTranslation.substring(0, 3) : fullTranslation;
		}
	};
}