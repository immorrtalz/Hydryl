import { createContext } from 'react';
import { initialSettings, Settings } from '../misc/settings';

const SettingsContext = createContext<[Settings, (settings: Settings) => void]>([initialSettings, () => {}]);

export default SettingsContext;