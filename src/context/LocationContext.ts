import { createContext } from 'react';
import { initialLocation, LocationItem } from '../misc/location';

const LocationContext = createContext<[number, (currentLocationIndex: number) => void, LocationItem[], (locations: LocationItem[]) => void]>([0, () => {}, [initialLocation], () => {}]);

export default LocationContext;