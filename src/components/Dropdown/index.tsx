import { useEffect, useState } from 'react';
import styles from './Dropdown.module.scss';
import { SVG } from '../SVG';
import { AnimatePresence, motion } from 'motion/react';

interface DropdownOption
{
	title: string;
	value: string;
}

interface Props
{
	options: DropdownOption[];
	currentOptionIndex?: number;
	disabled?: boolean;
	onClick?: (...args: any[]) => any;
	onOptionClick?: (...args: any[]) => any;
}

export function Dropdown(props: Props)
{
	if (props.options.length == 0) return (<></>);

	const [currentOptionIndex, setCurrentOptionIndex] = useState(props.currentOptionIndex ?? 0);
	const [isOpen, setIsOpen] = useState(false);

	function onClick(_e: React.MouseEvent<HTMLElement> | null = null)
	{
		setIsOpen(!isOpen);
		props.onClick?.();
	};

	function onOptionClick(e: React.MouseEvent<HTMLElement>)
	{
		e.stopPropagation();
		const target = e.target as HTMLElement;

		setCurrentOptionIndex(Array.from(target.parentElement!.children).indexOf(target));
		onClick();
	};

	useEffect(() => props.disabled ? undefined : props.onOptionClick?.(props.options[currentOptionIndex].value), [currentOptionIndex]);

	return (
		<>
			<AnimatePresence>
				{ isOpen &&
					<motion.span className={styles.optionsBg} onClick={onClick}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.66, 0, 0.34, 1] }}/> }
			</AnimatePresence>

			<div className={`${styles.dropdown} ${props.disabled ? styles.disabled : ''} ${isOpen ? styles.open : ''}`}
				onClick={props.disabled ? undefined : onClick}>
				<p className={styles.currentValueTitle}>{props.options[currentOptionIndex].title}</p>
				<SVG name="chevronDown"/>
			</div>

			<AnimatePresence>
				{
					isOpen &&
						<motion.div className={styles.options} onClick={e => e.stopPropagation()}
							initial={{ opacity: 0, transform: "translateY(16px)" }}
							animate={{ opacity: 1, transform: "translateY(0)" }}
							exit={{ opacity: 0, transform: "translateY(16px)" }}
							transition={{ duration: 0.2, ease: [0.66, 0, 0.34, 1] }}>
							{
								props.options.map((option, index) =>
									<div key={`${option.title}-${option.value}-${index}`}
										className={`${styles.option} ${index == currentOptionIndex ? styles.current : ''}`}
										onClick={props.disabled ? undefined : onOptionClick}>
										<p className={styles.optionTitle}>{option.title}</p>
									</div>)
							}
						</motion.div>
				}
			</AnimatePresence>
		</>
	);
}