import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useContext } from "react";
import { initialLocation, initialLocationsData, LocationItem, StoredLocationsData } from "../../misc/locations";
import LocationContext from "../../context/LocationsContext";

const LOCATIONS_FILE_NAME = 'locations.json';

export default function useLocationsLoader()
{
	const { setCurrentLocationIndex, setLocations } = useContext(LocationContext);

	const isLocationItemValid = (item: any): item is LocationItem =>
		typeof item === "object" && item !== null &&
		typeof item.name === "string" && item.name.length > 0 &&
		typeof item.latitude === "number" && Number.isFinite(item.latitude) &&
		typeof item.longitude === "number" && Number.isFinite(item.longitude) &&
		typeof item.timezone === "string" && item.timezone.length > 0 &&
		(item.country === undefined || typeof item.country === "string");

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
				var loadedFieldsCount = 0;
				const fieldsCount = Object.keys(initialLocationsData).length;

				if (Array.isArray(loadedLocationsObject.locations) && loadedLocationsObject.locations.length > 0)
				{
					loadedLocationsData.locations = [];

					for (const location of loadedLocationsObject.locations)
					{
						if (isLocationItemValid(location))
							loadedLocationsData.locations.push(location);
					}

					if (loadedLocationsData.locations.length > 0) loadedFieldsCount++;
					else loadedLocationsData.locations = [initialLocation];
				}

				if (typeof loadedLocationsObject.currentLocationIndex === "number" && Number.isFinite(loadedLocationsObject.currentLocationIndex) &&
					loadedLocationsObject.currentLocationIndex >= 0)
				{
					loadedLocationsData.currentLocationIndex = (loadedFieldsCount === 1 && loadedLocationsObject.currentLocationIndex >= loadedLocationsObject.locations.length) || loadedLocationsObject.currentLocationIndex < 0 ?
						0 :
						loadedLocationsObject.currentLocationIndex;

					loadedFieldsCount++;
				}

				if (loadedFieldsCount < fieldsCount)
					await saveLocationsToFile(loadedLocationsData);

				return loadedLocationsData;
			}
			catch (e) { return initialLocationsData; }
		};

		const settingsToSave = locationsFileExists ? await readLocationsFile() : initialLocationsData;

		setLocations(settingsToSave.locations);
		setCurrentLocationIndex(settingsToSave.currentLocationIndex);
		if (!locationsFileExists) await saveLocationsToFile(settingsToSave);
	};

	const saveLocationsToFile = async (newLocationsData: StoredLocationsData) => await writeTextFile(LOCATIONS_FILE_NAME, JSON.stringify(newLocationsData), { baseDir: BaseDirectory.AppConfig });

	return { loadLocationsFromFile, saveLocationsToFile };
}