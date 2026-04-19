import { clamp } from "./utils";

export interface LocationItem
{
	isCurrent: boolean;
	name: string;
	latitude: number;
	longitude: number;
};

export interface StoredLocationsData
{
	locations: LocationItem[];
}

export interface LocationSearchResultItem
{
	name: string;
	latitude: number;
	longitude: number;
	country?: "United Kingdom";
	admin1?: string;
};

export const initialLocation: LocationItem =
{
	isCurrent: true,
	name: "London",
	latitude: 51.5074,
	longitude: -0.1278
};

export const initialLocationsData: StoredLocationsData =
{
	locations: [initialLocation]
};

export interface LocationsContextValue
{
	locations: LocationItem[];
	setLocations: (locations: LocationItem[], saveToFile: boolean) => void;
}

export const initialLocationsContextValue: LocationsContextValue =
{
	locations: [initialLocation],
	setLocations: () => {}
};

export const isLocationItemValid = (locationItem: LocationItem): boolean =>
	locationItem.name.trim() !== ''
		&& !isNaN(locationItem.latitude)
		&& Math.abs(locationItem.latitude) <= 90
		&& !isNaN(locationItem.longitude)
		&& Math.abs(locationItem.longitude) <= 180;

export const validateLocationItem = (locationItem: LocationItem, nameForReplacement: string = ''): LocationItem =>
{
	return { ...locationItem,
		name: nameForReplacement === '' ? locationItem.name.trim() : nameForReplacement,
		latitude: clamp(locationItem.latitude, -90, 90),
		longitude: clamp(locationItem.longitude, -180, 180)};
};