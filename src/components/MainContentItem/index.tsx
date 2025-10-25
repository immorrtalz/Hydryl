import styles from './MainContentItem.module.scss';

interface Props
{
	title: string;
	content: string;
}

export function MainContentItem(props: Props)
{
	return (
		<div className={styles.container}>
			<p className={styles.titleText}>{props.title}</p>
			<p className={styles.contentText}>{props.content}</p>
		</div>
	);
}