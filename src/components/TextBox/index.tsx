import { names, SVG } from '../SVG';
import styles from './TextBox.module.scss';

interface Props
{
	svgIconName?: typeof names[number];
	placeholder?: string;
	maxLength?: number;
	disabled?: boolean;
	onInput?: (...args: any[]) => any;
	onEditingEnded?: (...args: any[]) => any;
}

export function TextBox(props: Props)
{
	const onInput = (e: React.ChangeEvent<HTMLInputElement>) => props.onInput?.(e);
	const onEditingEnded = (e: React.ChangeEvent<HTMLInputElement>) => props.onEditingEnded?.(e);

	const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
	{
		if (e.key === 'Enter') (e.target as HTMLElement).blur();
	};

	return (
		<div className={styles.container}>
			{ props.svgIconName && <SVG className={styles.icon} name={props.svgIconName}/> }
			<input className={`${styles.textBox} ${props.svgIconName ? styles.withIcon : ""}`} type="text" placeholder={props.placeholder} maxLength={props.maxLength || 50}
				onInput={onInput} onBlur={onEditingEnded} onKeyDown={onEnterKeyDown} disabled={props.disabled}/>
		</div>);
}