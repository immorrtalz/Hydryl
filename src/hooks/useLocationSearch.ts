import { useState } from "react";
//import { initialWeatherData, WeatherData } from "../misc/weather";
//import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

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
	const [searchFetchCooldown, setSearchFetchCooldown] = useState<NodeJS.Timeout | null>(null);

	const canSearch = () => searchFetchCooldown === null;

	const fetchSearch = async (searchText: string) =>
	{
		if (searchFetchCooldown !== null || searchText.length === 0) return;

		const enCheck: boolean = /[a-zA-Z]/.test(searchText);
		const ruCheck: boolean = /[а-яёА-ЯЁ]/.test(searchText);

		if (enCheck && ruCheck)
		{
			const errorHeader = "Error fetching search data:";
			console.error(errorHeader, "Mixed language input is not supported.");
			return Promise.reject(`${errorHeader} Mixed language input is not supported.`);
		}
		else if (!enCheck && !ruCheck)
		{
			const errorHeader = "Error fetching search data:";
			console.error(errorHeader, "Only EN or RU input is supported.");
			return Promise.reject(`${errorHeader} Only EN or RU input is supported.`);
		}

		setSearchFetchCooldown(setTimeout(() => setSearchFetchCooldown(null), 1000));

		const language = enCheck ? 'en' : 'ru';
		const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=10&language=${language}&format=json`;

		try
		{
			const response = await fetch(apiUrl);
			const data = await response.json();

			if (data.results === undefined || data.results.length === 0)
			{
				const errorHeader = "Error fetching search data:";
				console.error(errorHeader, "No results found.");
				return Promise.reject(`${errorHeader} No results found.`);
			}

			console.log(data.results);
		}
		catch (e)
		{
			const errorHeader = "Error fetching search data:";
			console.error(errorHeader, e);
			return Promise.reject(`${errorHeader} ${e}`);
		}
	};

	return { fetchSearch, canSearch };
}