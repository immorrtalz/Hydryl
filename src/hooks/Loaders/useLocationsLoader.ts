import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useContext } from "react";
import { initialLocation, initialLocationsData, LocationItem, StoredLocationsData } from "../../misc/locations";
import LocationContext from "../../context/LocationsContext";

const LOCATIONS_FILE_NAME = 'locations.json';

export default function useLocationsLoader()
{
	const { setLocations } = useContext(LocationContext);

	const isLocationItemValid = (item: any): item is LocationItem =>
		typeof item === "object" && item !== null &&
		item.hasOwnProperty('isCurrent') && typeof item.isCurrent === "boolean" &&
		item.hasOwnProperty('name') && typeof item.name === "string" && item.name.length > 0 &&
		item.hasOwnProperty('latitude') && typeof item.latitude === "number" && Number.isFinite(item.latitude) && !isNaN(item.latitude) &&
		item.hasOwnProperty('longitude') && typeof item.longitude === "number" && Number.isFinite(item.longitude) && !isNaN(item.longitude);

	const loadLocationsFromFile = async () =>
	{
		const locationsFileExists = await exists(LOCATIONS_FILE_NAME, { baseDir: BaseDirectory.AppConfig });

		const readLocationsFile = async (): Promise<StoredLocationsData> =>
		{
			try
			{
				const loadedLocationsContent = await readTextFile(LOCATIONS_FILE_NAME, { baseDir: BaseDirectory.AppConfig });
				const loadedLocationsObject = JSON.parse(loadedLocationsContent);
				var loadedLocationsData: StoredLocationsData = { ...initialLocationsData };
				var needsToBeSaved = false;

				if (Array.isArray(loadedLocationsObject.locations) && loadedLocationsObject.locations.length > 0)
				{
					loadedLocationsData.locations = [];
					let currentLocationExists = false;

					for (const location of loadedLocationsObject.locations)
					{
						if (isLocationItemValid(location))
						{
							if (location.isCurrent && currentLocationExists) location.isCurrent = false;
							else if (location.isCurrent && !currentLocationExists) currentLocationExists = true;

							loadedLocationsData.locations.push(location);
						}
						else needsToBeSaved = true;
					}

					if (!currentLocationExists) loadedLocationsData.locations[0].isCurrent = true;

					if (loadedLocationsData.locations.length === 0)
					{
						loadedLocationsData.locations = [initialLocation];
						needsToBeSaved = true;
					}
				}
				else needsToBeSaved = true;

				if (needsToBeSaved) await saveLocationsToFile(loadedLocationsData);
				return loadedLocationsData;
			}
			catch (e)
			{
				console.error("Error loading locations from file:", e);
				return initialLocationsData;
			}
		};

		const locationsDataToSave = locationsFileExists ? await readLocationsFile() : initialLocationsData;

		setLocations(locationsDataToSave.locations, false);
		if (!locationsFileExists) await saveLocationsToFile(locationsDataToSave);
	};

	const saveLocationsToFile = async (newLocationsData: StoredLocationsData) =>
		await writeTextFile(LOCATIONS_FILE_NAME, JSON.stringify(newLocationsData), { baseDir: BaseDirectory.AppConfig });

	return { loadLocationsFromFile, saveLocationsToFile };
}