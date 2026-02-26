import { useTranslations } from '../../hooks/useTranslations';
import { names } from '../SVG';
import { TextBox } from '../TextBox';
import styles from './SearchBox.module.scss';
import { SearchResultItem } from './SearchResultItem';

interface Props
{
	svgIconName?: typeof names[number];
	placeholder?: string;
	maxLength?: number;
	disabled?: boolean;
	onInput?: (...args: any[]) => any;
	onEditingEnded?: (...args: any[]) => any;
	children?: React.ReactNode | React.ReactNode[];
}

export function SearchBox(props: Props)
{
	const { translate } = useTranslations();

	return (
		<div className={styles.container}>
			<TextBox svgIconName={props.svgIconName} placeholder={props.placeholder} maxLength={props.maxLength} disabled={props.disabled}
				onInput={props.onInput} onEditingEnded={props.onEditingEnded}/>
			
			<div className={styles.searchResultsContainer}>
				{props.children || <SearchResultItem name={translate("no_results_found")} disabled/>}
			</div>
		</div>);
}