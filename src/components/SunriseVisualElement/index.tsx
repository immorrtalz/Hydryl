import { clamp, lerpHexColorsWithStops } from '../../misc/utils';

interface Props
{
	currentHours: number;
	daylightHours: number;
}

export function SunriseVisualElement(props: Props)
{
	const sunriseElementWidth = 96;
	const sunriseElementHeight = 40;
	const curvePoints = [];

	const xIncrement = Math.PI * 2 / 23;

	for (let x = -Math.PI * 0.5, i = 0; i < 24; x += xIncrement, i++)
	{
		const y = Math.sin(x);
		const scaledX = ((x + Math.PI * 0.5) / (Math.PI * 2)) * (sunriseElementWidth - 12) + 6;
		const scaledY = (1 - y) * 0.5 * (sunriseElementHeight - 12) + 6;
		curvePoints.push({ x: scaledX, y: scaledY });
	}

	const sunPointIndex = Math.round(props.currentHours);
	var gradientMidPointY = props.daylightHours / 24 * sunriseElementHeight;
	var gradientMidPointY01 = Math.round(gradientMidPointY / sunriseElementHeight * 100) / 100;

	const curveColors = [
	{
		'color': '#FFC859',
		'position': 0.05},
	{
		'color': `#FF9059`,
		'position': clamp(gradientMidPointY01 - 0.1, 0.1, 0.8)
	},
	{
		'color': `#5361A6`,
		'position': clamp(gradientMidPointY01 + 0.1, 0.2, 0.9)
	},
	{
		'color': '#6153A6',
		'position': 0.95
	}];

	const sunColor = lerpHexColorsWithStops(curveColors, curvePoints[sunPointIndex].y / sunriseElementHeight);

	const pathData = curvePoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
	const debugDots = curvePoints.map((point, index) => (<circle key={index} cx={point.x} cy={point.y} r="1.5" fill={index === sunPointIndex ? 'red' : 'red'}/>));

	return (
		<svg width={sunriseElementWidth} height={sunriseElementHeight} viewBox={`0 0 ${sunriseElementWidth} ${sunriseElementHeight}`} fill="none" xmlns="http://www.w3.org/2000/svg">
			{/* Horizon line */}
			<line x1={1.5 * 0.5} y1={gradientMidPointY} x2={sunriseElementWidth - 1.5 * 0.5} y2={gradientMidPointY}
				stroke="white" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round"/>

			{/* Main curve */}
			<path d={pathData} stroke="url(#paint0_linear_2222_3279)" strokeWidth="4" strokeLinecap="round" mask="url(#sun_mask_34638498)"/>

			{/* Sun */}
			<circle cx={curvePoints[sunPointIndex].x} cy={curvePoints[sunPointIndex].y} r="6" fill={sunColor}/>

			{/* {debugDots} */}

			<defs>
				<linearGradient id="paint0_linear_2222_3279" x1="0" y1="0" x2="0" y2={sunriseElementHeight} gradientUnits="userSpaceOnUse">
					<stop offset={curveColors[0].position} stopColor={curveColors[0].color}/>
					<stop offset={curveColors[1].position} stopColor={curveColors[1].color}/>
					<stop offset={curveColors[2].position} stopColor={curveColors[2].color}/>
					<stop offset={curveColors[3].position} stopColor={curveColors[3].color}/>
				</linearGradient>

				<mask id="sun_mask_34638498">
					<rect x="0" y="0" width={sunriseElementWidth} height={sunriseElementHeight} fill="white"/>
					<circle cx={curvePoints[sunPointIndex].x} cy={curvePoints[sunPointIndex].y} r="10" fill="black"/>
				</mask>
			</defs>
		</svg>
	);
}