import { checkPermissions, requestPermissions, getCurrentPosition } from '@tauri-apps/plugin-geolocation';

export function useGeoLocation()
{
	const getGeoLocation = async (): Promise<{ latitude: number; longitude: number; } | null> =>
	{
		let permissions = await checkPermissions();

		if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') permissions = await requestPermissions(['location']);

		if (permissions.location === 'granted')
		{
			const pos = await getCurrentPosition({ enableHighAccuracy: false, timeout: 0, maximumAge: 0 });
			console.log(pos);
			return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
		}
		else return null;
	}

	return { getGeoLocation };
}