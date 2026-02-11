import { ReactElement, useEffect, useRef } from 'react';
import styles from './ReorderableList.module.scss';
import './ReorderableList.global.scss';

interface Props
{
	children?: ReactElement[];
	className?: string;
	ghostItemClassName?: string;
	onReorder?: (newOrder: number[]) => void;
}

export function ReorderableList(props: Props)
{
	const placeholderRef = useRef<HTMLDivElement>(null);
	const listContainerRef = useRef<HTMLDivElement>(null);

	const handlersRef = useRef<Map<HTMLElement, { dragstart: (e: DragEvent) => void; dragend: () => void }>>(new Map());
	const pendingOrderRef = useRef<number[] | null>(null);
	const onReorderRef = useRef(props.onReorder);
	onReorderRef.current = props.onReorder;

	const movePlaceholder = (e: React.DragEvent<HTMLElement>) =>
	{
		if (!e.dataTransfer.types.includes("reorderable") || listContainerRef.current === null) return;
		e.preventDefault();

		const items = Array.from(listContainerRef.current.querySelectorAll(`.${styles.reorderableItem}`));
		const placeholder = placeholderRef.current!;

		let prevRect: DOMRect | null = null;
		let currentRect: DOMRect | null = null;
		let nextRect: DOMRect | null = null;

		for (let i = 0; i < items.length; i++)
		{
			const isFirstIteration = i === 0;
			const isLastIteration = i === items.length - 1;

			prevRect = isFirstIteration ? null : currentRect;
			currentRect = isFirstIteration ? items[i].getBoundingClientRect() : nextRect;
			nextRect = isLastIteration ? null : items[i + 1].getBoundingClientRect();

			if (items[i].id === "draggedItem" || (!isLastIteration && items[i + 1].id === "draggedItem"))
			{
				const isInIgnoreZone = (prevRect === null || (prevRect !== null && e.clientY >= prevRect.top + prevRect.height * 0.5)) &&
					(nextRect === null || (nextRect !== null && e.clientY <= nextRect.top + nextRect.height * 0.5));

				if (isInIgnoreZone)
				{
					placeholder.style.display = "";
					break;
				}
			}

			const isInFirstZone = isFirstIteration && e.clientY <= currentRect!.top + currentRect!.height * 0.5;
			const isInLastZone = isLastIteration && e.clientY >= currentRect!.top + currentRect!.height * 0.5;
			const isInMiddleZone = nextRect && e.clientY >= currentRect!.top + currentRect!.height * 0.5 && e.clientY <= nextRect.top + nextRect.height * 0.5;

			if (isInFirstZone || isInLastZone || isInMiddleZone)
			{
				listContainerRef.current.insertBefore(placeholder, isInLastZone ? null : items[isInFirstZone ? i : i + 1]);
				placeholder.style.display = "block";
				break;
			}
		}
	};

	const onDragStart = (item: HTMLElement, e: DragEvent) =>
	{
		const dragZone = item.querySelector('.dragZone') as HTMLElement;
		const dragZoneRect = dragZone.getBoundingClientRect();

		if (e.dataTransfer && e.clientY >= dragZoneRect.top && e.clientY <= dragZoneRect.bottom && e.clientX >= dragZoneRect.left && e.clientX <= dragZoneRect.right)
		{
			item.id = "draggedItem";
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("reorderable", "");

			let prevMaxIndex = -1;
			const ghosts = listContainerRef.current!.querySelectorAll(".draggedItemGhost");

			ghosts.forEach(ghost =>
			{
				const ghostIndex = parseInt(ghost.getAttribute('data-ghost-index') ?? '0');
				prevMaxIndex = Math.max(ghostIndex, prevMaxIndex);
			});

			const newGhostIndex = prevMaxIndex + 1;
			const ghost = document.createElement("div");

			ghost.className += ` draggedItemGhost ${props.ghostItemClassName ?? ''}`;
			ghost.style.height = "0";
			ghost.style.display = "none";
			ghost.style.transition = "all 0s";

			item.setAttribute('data-ghost-index', newGhostIndex.toString());
			ghost.setAttribute('data-ghost-index', newGhostIndex.toString());
			listContainerRef.current!.insertBefore(ghost, item);
		}
		else e.preventDefault();
	};

	const onDragEnd = (item: HTMLElement) =>
	{
		if (!listContainerRef.current) return;

		const itemHeight = item.getBoundingClientRect().height;
		const itemGhostIndex = parseInt(item.getAttribute('data-ghost-index') ?? '0');

		listContainerRef.current.style.pointerEvents = "none";
		item.removeAttribute("id");
		item.removeAttribute("data-ghost-index");
		item.style.transition = "all 0.2s, height 0s";
		item.style.height = "0";

		const ghostIndex = itemGhostIndex;
		const ghost = listContainerRef.current.querySelector(`.draggedItemGhost[data-ghost-index="${ghostIndex}"]`) as HTMLElement;

		if (!ghost) return;

		ghost.style.height = `${itemHeight}px`;
		ghost.style.display = "block";
		ghost.style.transition = "all 0.2s, height 0s";

		setTimeout(() =>
		{
			item.style.transition = "";
			item.style.height = "";

			ghost.style.transition = "";
			ghost.style.height = "0";
		}, 1);

		setTimeout(() =>
		{
			ghost.remove();
			listContainerRef.current!.style.pointerEvents = "";

			if (pendingOrderRef.current !== null)
			{
				onReorderRef.current?.(pendingOrderRef.current);
				pendingOrderRef.current = null;
			}
		}, 200);
	};

	const onDragOver = (e: React.DragEvent<HTMLElement>) =>
	{
		if (e.dataTransfer?.types.includes("reorderable"))
			e.preventDefault();
		movePlaceholder(e);
	};

	const onDragLeave = (e: React.DragEvent<HTMLElement>) =>
	{
		const relatedTarget = e.relatedTarget as Node | null;

		if (relatedTarget === null || !listContainerRef.current!.contains(relatedTarget))
			placeholderRef.current!.style.display = "";
	};

	const onDrop = (e: React.DragEvent<HTMLElement>) =>
	{
		if (listContainerRef.current === null) return;
		e.preventDefault();

		const draggedItem = document.getElementById("draggedItem")!;
		listContainerRef.current.insertBefore(draggedItem as Node, placeholderRef.current!);
		placeholderRef.current!.style.display = "";

		const items = Array.from(listContainerRef.current.querySelectorAll(`.${styles.reorderableItem}`));
		const newOrder = items.map(item => parseInt(item.getAttribute('data-original-index') ?? '0'));

		pendingOrderRef.current = newOrder;

		for (let i = 0; i < items.length; i++)
		{
			if (!items[i].classList.contains(styles.placeholder))
				items[i].setAttribute('data-original-index', i.toString());
		}
	};

	useEffect(() =>
	{
		const items = listContainerRef.current ? Array.from(listContainerRef.current.children) as HTMLElement[] : [];
		const handlers = handlersRef.current;

		handlers.forEach((h, item) =>
		{
			item.removeEventListener("dragstart", h.dragstart);
			item.removeEventListener("dragend", h.dragend);
		});
		handlers.clear();

		let originalIndex = 0;

		items.forEach(item =>
		{
			if (!item.classList.contains(styles.placeholder))
			{
				item.className += ` ${styles.reorderableItem}`;
				item.draggable = true;
				item.setAttribute('data-original-index', originalIndex.toString());
				originalIndex++;

				const dragstartHandler = (e: DragEvent) => onDragStart(item, e);
				const dragendHandler = () => onDragEnd(item);

				item.addEventListener("dragstart", dragstartHandler);
				item.addEventListener("dragend", dragendHandler);

				handlers.set(item, { dragstart: dragstartHandler, dragend: dragendHandler });
			}
		});

		return () =>
		{
			handlers.forEach((h, item) =>
			{
				item.removeEventListener("dragstart", h.dragstart);
				item.removeEventListener("dragend", h.dragend);
			});

			handlers.clear();
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