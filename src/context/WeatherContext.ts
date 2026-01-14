import { createContext } from 'react';
import { initialWeatherData, WeatherData } from '../misc/weather';

export enum WeatherFetchStatus
{
	Error = -1,
	NotFetched = 0,
	Fetched = 1,
	Fetching = 2
}

const WeatherContext = createContext<[WeatherData, (weather: WeatherData, weatherFetchStatus: WeatherFetchStatus) => void, number, (weatherFetchStatus: WeatherFetchStatus) => void]>([initialWeatherData, () => {}, 0, () => {}]);

export default WeatherContext;