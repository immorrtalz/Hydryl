export interface WeatherData
{
	current:
	{
		time: Date;
		isDay: boolean;
		weatherCode: number;
		temperature: number;
		surfacePressure: number;
		windSpeed: number;
		windDirection: number;
		windGusts: number;
		relativeHumidity: number;
		precipitation: number;
		precipitationProbability: number;
		visibility: number;
		cloudCover: number;
		uvIndex: number;
	};
	hourly:
	{
		time: Date[];
		isDay: boolean[];
		weatherCode: number[];
		temperature: number[];
		precipitationProbability: number[];
	};
	daily:
	{
		time: Date[];
		weatherCode: number[];
		temperatureMin: number[];
		temperatureMax: number[];
		windDirectionDominant: number[];
		windSpeedMax: number[];
		sunrise: Date[];
		sunset: Date[];
		precipitationProbabilityMax: number[];
	};
}

export enum WeatherFetchStatus
{
	Error = -1,
	NotFetched = 0,
	Fetched = 1,
	Fetching = 2
}

export const initialWeatherData: WeatherData =
{
	current:
	{
		time: new Date(),
		isDay: true,
		weatherCode: 0,
		temperature: 0,
		surfacePressure: 0,
		windSpeed: 0,
		windDirection: 0,
		windGusts: 0,
		relativeHumidity: 0,
		precipitation: 0,
		precipitationProbability: 0,
		visibility: 0,
		cloudCover: 0,
		uvIndex: 0
	},
	hourly:
	{
		time: Array(25).fill(new Date()),
		isDay: Array(25).fill(true),
		weatherCode: Array(25).fill(0),
		temperature: Array(25).fill(0),
		precipitationProbability: Array(25).fill(0)
	},
	daily:
	{
		time: Array(6).fill(new Date()),
		weatherCode: Array(6).fill(0),
		temperatureMin: Array(6).fill(0),
		temperatureMax: Array(6).fill(0),
		windDirectionDominant: Array(6).fill(0),
		windSpeedMax: Array(6).fill(0),
		sunrise: Array(6).fill(new Date()),
		sunset: Array(6).fill(new Date()),
		precipitationProbabilityMax: Array(6).fill(0)
	}
};

export interface WeatherContextValue
{
	weather: WeatherData;
	setWeather: (weather: WeatherData) => void;
	weatherFetchStatus: WeatherFetchStatus;
	setWeatherFetchStatus: (status: WeatherFetchStatus) => void;
}

export const initialWeatherContextValue: WeatherContextValue =
{
	weather: initialWeatherData,
	setWeather: () => {},
	weatherFetchStatus: WeatherFetchStatus.NotFetched,
	setWeatherFetchStatus: () => {}
};