export interface LocationItem
{
	name: string;
	latitude: number;
	longitude: number;
	timezone: string;
	country?: string;
};

export interface StoredLocationsData
{
	currentLocationIndex: number;
	locations: LocationItem[];
}

export const initialLocation: LocationItem =
{
	name: "London",
	latitude: 51.5074,
	longitude: -0.1278,
	timezone: "Europe/London",
	country: "United Kingdom"
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