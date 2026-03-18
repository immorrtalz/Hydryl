import { createContext } from 'react';
import { LocationsContextValue, initialLocationsContextValue } from '../misc/locations';

const LocationsContext = createContext<LocationsContextValue>(initialLocationsContextValue);

export default LocationsContext;