import { useEffect, useState } from 'react';
import { names, SVG } from '../SVG';
import styles from './TextBox.module.scss';

interface Props
{
	type?: "text" | "number";
	svgIconName?: typeof names[number];
	placeholder?: string;
	min?: number;
	max?: number;
	maxLength?: number;
	disabled?: boolean;
	value?: string | number;
	name: string;
	onInput?: (...args: any[]) => any;
	onEditingEnded?: (...args: any[]) => any;
}

export function TextBox(props: Props)
{
	const validateNumberValue = (value: number) =>
	{
		if (props.min !== undefined && value < props.min) return props.min;
		if (props.max !== undefined && value > props.max) return props.max;
		return value;
	}

	const onInput = (e: React.InputEvent<HTMLInputElement>) =>
	{
		const inputValue = props.type === "number" ? validateNumberValue((e.target as HTMLInputElement).valueAsNumber) : (e.target as HTMLInputElement).value;
		setValue(inputValue);
		props.onInput?.(e);
	};

	const onEditingEnded = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		const inputValue = props.type === "number" ? validateNumberValue((e.target as HTMLInputElement).valueAsNumber) : (e.target as HTMLInputElement).value;
		setValue(inputValue);
		props.onEditingEnded?.(e);
	};

	const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
	{
		if (e.key === 'Enter') (e.target as HTMLElement).blur();
	};

	const [value, setValue] = useState<typeof props.value>(props.value || "");

	useEffect(() =>
	{
		setValue(props.type === "number" ? validateNumberValue(props.value as number) : props.value || "");
	}, [props.value]);

	return (
		<div className={styles.container}>
			{ props.svgIconName && <SVG className={styles.icon} name={props.svgIconName}/> }
			<input
				className={`${styles.textBox} ${props.svgIconName ? styles.withIcon : ""}`}
				type={props.type || "text"}
				placeholder={props.placeholder}
				{...props.type === "number" && props.min !== undefined ? { min: props.min } : {}}
				{...props.type === "number" && props.max !== undefined ? { max: props.max } : {}}
				maxLength={props.maxLength || 50}
				autoCapitalize='false'
				autoComplete='false'
				autoCorrect='false'
				autoSave='false'
				onInput={onInput}
				onBlur={onEditingEnded}
				onKeyDown={onEnterKeyDown}
				disabled={props.disabled}
				value={value}
				name={props.name}/>
		</div>);
}