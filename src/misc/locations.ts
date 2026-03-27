export interface LocationItem
{
	name: string;
	latitude: number;
	longitude: number;
};

export interface StoredLocationsData
{
	currentLocationIndex: number;
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
	name: "London",
	latitude: 51.5074,
	longitude: -0.1278
};

export const initialLocationsData: StoredLocationsData =
{
	currentLocationIndex: 0,
	locations: [initialLocation]
};

export interface LocationsContextValue
{
	currentLocationIndex: number;
	setCurrentLocationIndex: (index: number) => void;
	locations: LocationItem[];
	setLocations: (locations: LocationItem[]) => void;
}

export const initialLocationsContextValue: LocationsContextValue =
{
	currentLocationIndex: 0,
	setCurrentLocationIndex: () => {},
	locations: [initialLocation],
	setLocations: () => {}
};