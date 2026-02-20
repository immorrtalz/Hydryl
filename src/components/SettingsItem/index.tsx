import { Dropdown, DropdownOption } from '../Dropdown';
import styles from './SettingsItem.module.scss';

interface Props
{
	titleText: string;
	descriptionText?: string;
	onChange?: (...args: any[]) => any;
	options?: DropdownOption[];
	defaultValue?: any;
	children?: React.ReactNode;
}

export function SettingsItem(props: Props)
{
	const texts = props.descriptionText === undefined ?
		<p className={styles.settingsItemTitleText}>{props.titleText}</p> :
		<div className={styles.settingsItemTextsContainer}>
			<p className={styles.settingsItemTitleText}>{props.titleText}</p>
			<p className={styles.settingsItemDescriptionText}>{props.descriptionText}</p>
		</div>;

	return <div className={styles.settingsItem}>
				{texts}
				{
					props.options &&
						<Dropdown onOptionClick={value => props.onChange?.(value)}
							options={props.options}
							defaultOptionIndex={props.options.findIndex(option => option.value === props.defaultValue)}/>
				}
				{props.children}
			</div>;
}