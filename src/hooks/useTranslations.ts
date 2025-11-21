import { useCallback, useContext } from "react";
import SettingsContext from "../context/SettingsContext";
import translationsJson from "../misc/translations.json";

const translations: Record<string, Record<string, string>> = translationsJson;

type TranslationsJson = typeof translationsJson;

export type TranslationKey =
{
	[K in keyof TranslationsJson]: TranslationsJson[K] extends Record<string, string> ? K : never;
}[keyof TranslationsJson];

export function useTranslations()
{
	const [settings] = useContext(SettingsContext);
	const translate = useCallback((key: TranslationKey): string => translations[key]?.[settings.locale ?? 'en'] ?? key, [settings.locale]);

	return {
		translate: useCallback((key: TranslationKey): string => translate(key), [settings.locale]),

		translateWeekday: useCallback((weekday: number, useShortWeekday: boolean = false): string =>
		{
			if (weekday < 0 || weekday > 6) return "??";
			const weekdaysKeys: TranslationKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
			return translate(weekdaysKeys[weekday] + (useShortWeekday ? "_short" : "") as TranslationKey);
		}, [settings.locale]),

		translateMonth: useCallback((month: number, useShortMonth: boolean = false): string =>
		{
			if (month < 0 || month > 11) return "???";
			const monthKeys: TranslationKey[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
			const fullTranslation = translate(monthKeys[month]);

			return useShortMonth ? fullTranslation.substring(0, 3) : fullTranslation;
		}, [settings.locale])
	};
}