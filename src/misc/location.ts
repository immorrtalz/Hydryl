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