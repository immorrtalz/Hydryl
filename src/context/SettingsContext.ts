import { createContext, useContext } from 'react';
import { Locale } from "../hooks/useTranslate";

export interface Settings
{
	locale: Locale;
}

export const initialSettings: Settings =
{
	locale: 'en',
};

const SettingsContext = createContext<[Settings, (settings: Settings) => void]>([initialSettings, () => {}]);

export default SettingsContext;