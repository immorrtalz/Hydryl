import { ReactElement, useEffect, useRef } from 'react';
import styles from './TopBar.module.scss';

interface Props
{
	children?: ReactElement[];
	className?: string;
	useBgBlur?: boolean;
	useSolidBg?: boolean;
}

export function TopBar(props: Props)
{
	const topBarRef = useRef<HTMLDivElement | null>(null);

	const onPageScroll = () =>
	{
		if (topBarRef.current !== null)
		{
			if (document.documentElement.scrollTop > 0)
				topBarRef.current.classList.add(styles.scrolledTopBar);
			else topBarRef.current.classList.remove(styles.scrolledTopBar);

			if (props.useBgBlur === true)
			{
				if (document.documentElement.scrollTop > window.innerHeight * 0.5 - topBarRef.current.offsetHeight - 24)
					topBarRef.current.classList.add(styles.useSolidBg);
				else topBarRef.current.classList.remove(styles.useSolidBg);
			}
		}
	};

	useEffect(() =>
	{
		onPageScroll();

		document.addEventListener("scroll", onPageScroll);
		return () => document.removeEventListener("scroll", onPageScroll);
	}, []);

	return (
		<div className={`${styles.topBar} ${props.className || ''} ${props.useBgBlur === true ? styles.useBgBlur : styles.useSolidBg} ${props.useSolidBg === true && props.useBgBlur === false ? styles.useSolidBg : ''}`} ref={topBarRef}>
			{props.children}
		</div>
	);
}