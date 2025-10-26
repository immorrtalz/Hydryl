import styles from './CurrentWeatherDetailsItem.module.scss';

interface Props
{
	title: string;
	content: string;
}

export function CurrentWeatherDetailsItem(props: Props)
{
	return (
		<div className={styles.container}>
			<p className={styles.titleText}>{props.title}</p>
			<p className={styles.contentText}>{props.content}</p>
		</div>
	);
}