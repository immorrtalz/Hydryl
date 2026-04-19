import { useState } from 'react';
import styles from './LocationItem.module.scss';
import './LocationItem.global.scss';
import { SVG } from '../SVG';
import { Button, ButtonType } from '../Button';
import { TextBox } from '../TextBox';
import useTranslations from "../../hooks/useTranslations";

interface Props
{
	isCurrentLocation: boolean;
	locationName: string;
	isInEditMode?: boolean;
	isInBulkSelectionMode?: boolean;
	onClick?: (...args: any[]) => any;
	onHold?: (...args: any[]) => any;
	onEdit?: (...args: any[]) => any;
	onEditComplete?: (...args: any[]) => any;
}

export function LocationItem(props: Props)
{
	const { translate } = useTranslations();

	const onClick = (e: React.MouseEvent<HTMLElement>) => props.onClick?.(e);
	const onHold = (e: React.MouseEvent<HTMLElement>) => props.onHold?.(e);
	const onEdit = (e: React.MouseEvent<HTMLElement>) => props.onEdit?.(e);
	const onEditComplete = () => props.onEditComplete?.(editingLocationName);

	const [editingLocationName, setEditingLocationName] = useState('');

	return (
		<div className={styles.outerContainer}>
			<div onContextMenu={onHold}
				className={`${styles.locationItem} ${props.isCurrentLocation ? styles.currentLocationItem : ''} ${props.isInBulkSelectionMode ? styles.bulkSelected : ''}`}>

				<span className="dragZone"/>
				<span className="actionZone" onClick={onClick}/>

				<div className={styles.mainContainer}>
					<SVG name="drag"/>

					<div className={styles.locationNameContainer}>
					{ props.isInEditMode ?
						<TextBox
							type="text"
							placeholder={translate('input_incentive')}
							maxLength={256}
							disabled={false}
							value={props.locationName}
							name={`locationName-${props.locationName}`}
							onInput={e => setEditingLocationName((e.target as HTMLInputElement).value)}
							onEditingEnded={e => setEditingLocationName((e.target as HTMLInputElement).value)}/>
						: <p>{props.locationName}</p>
					}
					</div>

					{ props.isInEditMode !== undefined &&
						<Button type={ButtonType.Secondary} square onClick={props.isInEditMode ? onEditComplete : onEdit}>
							<SVG name={props.isInEditMode ? 'checkmark' : 'edit'}/>
						</Button>
					}
				</div>
			</div>
		</div>
	);
}