import { useEffect, useRef } from "react";
import { lerp } from "../misc/utils";

const leftInset = 15, rightInset = 85, scrollEdgeThreshold = 0.005, scrollStopThreshold = 0.05;

const getScrollXProgress = (element: HTMLElement): number => element.scrollLeft / (element.scrollWidth - element.clientWidth);

export function useScrollOverflowMask(elementRef: React.RefObject<HTMLElement | null>)
{
	const animationIdRef = useRef<number | null>(null);

	useEffect(() =>
	{
		const element = elementRef.current;
		if (!element) return;

		element.style.setProperty('--mask-left-stop', '0%');
		element.style.setProperty('--mask-right-stop', '85%');
		element.style.maskImage = `linear-gradient(to right, #0000, #000 var(--mask-left-stop), #000 var(--mask-right-stop), #0000)`;

		const updateStops = () =>
		{
			if (!element.isConnected)
			{
				if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
				return;
			}

			const currentScrollXProgress = getScrollXProgress(element);

			const currentLeftStop = Number.parseFloat(element.style.getPropertyValue('--mask-left-stop')) || 0;
			const currentRightStop = Number.parseFloat(element.style.getPropertyValue('--mask-right-stop')) || 0;

			const targetLeftStop = currentScrollXProgress <= scrollEdgeThreshold ? 0 : leftInset;
			const targetRightStop = currentScrollXProgress >= 1 - scrollEdgeThreshold ? 100 : rightInset;

			if (currentLeftStop !== targetLeftStop || currentRightStop !== targetRightStop)
			{
				const newLeftStop = Math.abs(currentLeftStop - targetLeftStop) > scrollStopThreshold ?
					Math.round(lerp(currentLeftStop, targetLeftStop, 0.1) * 10) / 10 : targetLeftStop;

				const newRightStop = Math.abs(currentRightStop - targetRightStop) > scrollStopThreshold ?
					Math.round(lerp(currentRightStop, targetRightStop, 0.1) * 10) / 10 : targetRightStop;

				element.style.setProperty('--mask-left-stop', newLeftStop + '%');
				element.style.setProperty('--mask-right-stop', newRightStop + '%');

				if (newLeftStop !== targetLeftStop || newRightStop !== targetRightStop)
					animationIdRef.current = requestAnimationFrame(updateStops);
			}
		};

		const handleScroll = () =>
		{
			if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
			animationIdRef.current = requestAnimationFrame(updateStops);
		};

		element.addEventListener('scroll', handleScroll);

		return () =>
		{
			element.removeEventListener('scroll', handleScroll)
			if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
		};
	}, []);
}