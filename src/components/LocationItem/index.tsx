import styles from './LocationItem.module.scss';
import './LocationItem.global.scss';
import { SVG } from '../SVG';

interface Props
{
	isCurrentLocation: boolean;
	locationName: string;
	isInEditMode?: boolean;
	onClick?: (...args: any[]) => any;
}

export function LocationItem(props: Props)
{
	const onClick = (e: React.MouseEvent<HTMLElement>) => props.onClick?.(e);

	return (
		<div className={styles.outerContainer}>

				<span className="dragZone"/>
				<span className="actionZone" onClick={onClick}/>

				<div className={styles.mainContainer}>
					<SVG name="drag"/>

				<div className={styles.locationNameContainer}>
					<p>{props.locationName}</p>
					{ props.currentTime && <p>{props.currentTime}</p> }
				</div>
			</div>
			</div> */}
		</div>
	);
}