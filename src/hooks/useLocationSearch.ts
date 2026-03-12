import { useState } from "react";
import { useTranslations } from "./useTranslations";

export interface LocationSearchResultItem
{
	latitude: number;
	longitude: number;
	elevation: number;
	timezone: string;
	name: string;
	country: string;
	admin1?: string;
};

export function useLocationSearch()
{
	const { translate } = useTranslations();
	const [searchFetchCooldown, setSearchFetchCooldown] = useState<NodeJS.Timeout | null>(null);

	const canSearch = () => searchFetchCooldown === null;

	const fetchLocations = async (searchText: string): Promise<LocationSearchResultItem[]> =>
	{
		if (!canSearch() || searchText.length === 0) return [];

		const enCheck: boolean = /[a-zA-Z]/.test(searchText);
		const ruCheck: boolean = /[а-яёА-ЯЁ]/.test(searchText);

		if (enCheck && ruCheck)
			return Promise.reject(translate('mixed_language_input_not_supported'));
		else if (!enCheck && !ruCheck)
			return Promise.reject(translate('only_en_or_ru_input_is_supported'));

		setSearchFetchCooldown(setTimeout(() => setSearchFetchCooldown(null), 1000));

		const language = enCheck ? 'en' : 'ru';
		const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=10&language=${language}&format=json`;

		try
		{
			const response = await fetch(apiUrl);
			const data = await response.json();

			if (data.results === undefined || data.results.length === 0)
				return Promise.reject(translate('no_results_found'));

			return data.results.map((item: LocationSearchResultItem) => (
			{
				latitude: item.latitude,
				longitude: item.longitude,
				elevation: item.elevation ?? 0,
				timezone: item.timezone,
				name: item.name,
				country: item.country,
				admin1: item.admin1
			})) as LocationSearchResultItem[];
		}
		catch (e) { return Promise.reject(`${translate('error_fetching_locations')}: ${e}`); }
	};

	return { fetchLocations, canSearch };
}