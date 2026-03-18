import { createContext } from 'react';
import { WeatherContextValue, initialWeatherContextValue } from '../misc/weather';

const WeatherContext = createContext<WeatherContextValue>(initialWeatherContextValue);

export default WeatherContext;