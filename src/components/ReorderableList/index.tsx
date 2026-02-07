import { ReactElement, useEffect, useRef } from 'react';
import styles from './ReorderableList.module.scss';
import './ReorderableList.global.scss';

interface Props
{
	children?: ReactElement[];
	className?: string;
}

export function ReorderableList(props: Props)
{
	const placeholderRef = useRef<HTMLDivElement>(null);
	const listContainerRef = useRef<HTMLDivElement>(null);

	const movePlaceholder = (e: React.DragEvent<HTMLElement>) =>
	{
		if (!e.dataTransfer.types.includes("reorderableitem") || listContainerRef.current === null) return;
		e.preventDefault();

		const items = Array.from(listContainerRef.current.querySelectorAll(`.${styles.reorderableItem}`));
		const placeholder = placeholderRef.current!;

		for (let i = 0; i < items.length; i++)
		{
			const prevItemRect = i !== 0 ? items[i - 1].getBoundingClientRect() : null;
			const currentItemRect = items[i].getBoundingClientRect();
			const nextItemRect = i !== items.length - 1 ? items[i + 1].getBoundingClientRect() : null;

			if (items[i].id === "draggedItem" || (i != items.length - 1 && items[i + 1].id === "draggedItem"))
			{
				const isInIgnoreZone = (prevItemRect === null || (prevItemRect !== null && e.clientY >= prevItemRect.top + prevItemRect.height * 0.5)) &&
					(nextItemRect === null || (nextItemRect !== null && e.clientY <= nextItemRect.top + nextItemRect.height * 0.5));

				if (isInIgnoreZone)
				{
					placeholder.style.display = "";
					break;
				}
			}

			const isInFirstZone = i === 0 && e.clientY <= currentItemRect.top + currentItemRect.height * 0.5;
			const isInLastZone = i === items.length - 1 && e.clientY >= currentItemRect.top + currentItemRect.height * 0.5;
			const isInMiddleZone = nextItemRect && e.clientY >= currentItemRect.top + currentItemRect.height * 0.5 &&
				e.clientY <= nextItemRect.top + nextItemRect.height * 0.5;

			if (isInFirstZone || isInLastZone || isInMiddleZone)
			{
				listContainerRef.current.insertBefore(placeholder, isInLastZone ? null : items[isInFirstZone ? i : i + 1]);
				placeholder.style.display = "block";
				break;
			}
		}
	}

	const onDragOver = (e: React.DragEvent<HTMLElement>) =>
	{
		if (e.dataTransfer?.types.includes("reorderableitem"))
			e.preventDefault();
		movePlaceholder(e);
	};

	const onDragLeave = (e: React.DragEvent<HTMLElement>) =>
	{
		const relatedTarget = e.relatedTarget as Node | null;
		if (!relatedTarget || !listContainerRef.current!.contains(relatedTarget))
			placeholderRef.current!.style.display = "";
	};

	const onDrop = (e: React.DragEvent<HTMLElement>) =>
	{
		if (listContainerRef.current === null) return;
		e.preventDefault();

		const draggedItem = document.getElementById("draggedItem")!;
		listContainerRef.current.insertBefore(draggedItem as Node, placeholderRef.current!);
		placeholderRef.current!.style.display = "";
	};

	useEffect(() =>
	{
		const items = listContainerRef.current ? Array.from(listContainerRef.current.children) as HTMLElement[] : [];

		items.forEach(item =>
		{
			if (!item.classList.contains(styles.placeholder))
			{
				item.className += ` ${styles.reorderableItem}`;
				item.draggable = true;

				item.addEventListener("dragstart", e =>
				{
					const dragZone = item.querySelector('.dragZone') as HTMLElement;
					const dragZoneRect = dragZone.getBoundingClientRect();

					if (e.dataTransfer && e.clientY >= dragZoneRect.top && e.clientY <= dragZoneRect.bottom && e.clientX >= dragZoneRect.left && e.clientX <= dragZoneRect.right)
					{
						item.id = "draggedItem";
						e.dataTransfer.effectAllowed = "move";
						e.dataTransfer.setData("reorderableitem", "");
					}
					else e.preventDefault();
				});

				item.addEventListener("dragend", () => item.removeAttribute("id"));
			}
		});

		return () =>
		{
			items.forEach(item =>
			{
				item.removeEventListener("dragstart", () => {});
				item.removeEventListener("dragend", () => {});
			});
		};
	}, [props.children]);

	return (
		<div className={`${styles.listContainer} ${props.className ?? ''}`}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			ref={listContainerRef}>
			<span className={styles.placeholder} ref={placeholderRef}/>
			{props.children}
		</div>
	);
}