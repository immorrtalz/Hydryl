import { animate } from "motion"
import { useMotionValue, useMotionValueEvent, useScroll } from "motion/react"
import { RefObject } from "react";

export function useScrollOverflowMask(elementRef: RefObject<HTMLElement | null>)
{
	const left = `0%`, right = `100%`, leftInset = `15%`, rightInset = `85%`, transparent = `#0000`, opaque = `#000`;

	const { scrollXProgress } = useScroll({ container: elementRef });
	const maskImage = useMotionValue(`linear-gradient(to right, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`);

	useMotionValueEvent(scrollXProgress, "change", (value) =>
	{
		if (value <= 0.005) animate(maskImage, `linear-gradient(to right, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`);
		else if (value >= 0.995) animate(maskImage, `linear-gradient(to right, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`);
		else if ((scrollXProgress.getPrevious() ?? 0) <= 0.005 || (scrollXProgress.getPrevious() ?? 0) >= 0.995)
			animate(maskImage, `linear-gradient(to right, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`);
	});

	return maskImage;
}