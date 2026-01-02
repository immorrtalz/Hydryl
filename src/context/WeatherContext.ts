import { createContext } from 'react';
import { initialWeatherData, WeatherData } from '../misc/weather';

/** `weatherFetchStatus` possible values:
`0` - neither fetched nor error,
`1` - fetched,
`-1` - error
*/
const WeatherContext = createContext<[WeatherData, (weather: WeatherData, weatherFetchStatus: 0 | 1 | -1) => void, number, (weatherFetchStatus: 0 | 1 | -1) => void]>([initialWeatherData, () => {}, 0, () => {}]);

export default WeatherContext;