import { requestPermissions, getCurrentPosition } from '@tauri-apps/plugin-geolocation';
import useTranslations from './useTranslations';

export default function useGeoLocation()
{
	const { translate } = useTranslations();

	const getCurrentGeoLocation = async (): Promise<{ latitude: number; longitude: number; }> =>
	{
		const permissions = await requestPermissions(['coarseLocation']);

		if (permissions.coarseLocation === 'granted' || permissions.location === 'granted')
		{
			const pos = await getCurrentPosition({ enableHighAccuracy: false, timeout: 0, maximumAge: 600000 }); // 10 minutes cache is acceptable
			return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
		}
		else return Promise.reject(translate('location_permission_not_granted'));
	}

	return { getCurrentGeoLocation };
}