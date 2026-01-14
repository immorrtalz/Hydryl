export interface WeatherData
{
	current:
	{
		time: Date;
		is_day: boolean;
		weather_code: number;
		temperature_2m: number;
		surface_pressure: number;
		wind_speed_10m: number;
		wind_direction_10m: number;
		wind_gusts_10m: number;
		relative_humidity_2m: number;
		precipitation: number;
		precipitation_probability: number;
		visibility: number;
		cloud_cover: number;
		uv_index: number;
	};
	hourly:
	{
		time: Date[];
		is_day: boolean[];
		weather_code: number[];
		temperature_2m: number[];
		precipitation_probability: number[];
	};
	daily:
	{
		time: Date[];
		weather_code: number[];
		temperature_2m_min: number[];
		temperature_2m_max: number[];
		wind_direction_10m_dominant: number[];
		wind_speed_10m_max: number[];
		sunrise: Date[];
		sunset: Date[];
		precipitation_probability_max: number[];
	};
}

export const initialWeatherData: WeatherData =
{
	current:
	{
		time: new Date(),
		is_day: true,
		weather_code: 0,
		temperature_2m: 0,
		surface_pressure: 0,
		wind_speed_10m: 0,
		wind_direction_10m: 0,
		wind_gusts_10m: 0,
		relative_humidity_2m: 0,
		precipitation: 0,
		precipitation_probability: 0,
		visibility: 0,
		cloud_cover: 0,
		uv_index: 0
	},
	hourly:
	{
		time: Array(25).fill(new Date()),
		is_day: Array(25).fill(true),
		weather_code: Array(25).fill(0),
		temperature_2m: Array(25).fill(0),
		precipitation_probability: Array(25).fill(0)
	},
	daily:
	{
		time: Array(6).fill(new Date()),
		weather_code: Array(6).fill(0),
		temperature_2m_min: Array(6).fill(0),
		temperature_2m_max: Array(6).fill(0),
		wind_direction_10m_dominant: Array(6).fill(0),
		wind_speed_10m_max: Array(6).fill(0),
		sunrise: Array(6).fill(new Date()),
		sunset: Array(6).fill(new Date()),
		precipitation_probability_max: Array(6).fill(0)
	}
};