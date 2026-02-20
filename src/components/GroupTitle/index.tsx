import styles from './GroupTitle.module.scss';

interface Props { children: string; }

export function GroupTitle(props: Props) { return <p className={styles.groupTitleText}>{props.children}</p>; }