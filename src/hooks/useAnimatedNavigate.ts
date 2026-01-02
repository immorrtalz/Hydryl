import { RefObject, useState } from "react";
import { useNavigate, useLocation } from "react-router";

export enum NavigateDirection
{
	Left = 'left',
	Right = 'right'
}

export function useAnimatedNavigate(pageRef: RefObject<HTMLDivElement | null>, styles: CSSModuleClasses)
{
	const navigate = useNavigate();
	const location = useLocation();

	const [transitionedFromDirection, setTransitionedFromDirection] = useState<NavigateDirection>(NavigateDirection.Left);

	const initialNavigateSetup = () =>
	{
		const fromDirection: NavigateDirection = (location.state as { fromDirection?: NavigateDirection })?.fromDirection ?? NavigateDirection.Left;
		setTransitionedFromDirection(fromDirection);
		pageRef.current?.classList.add(fromDirection === NavigateDirection.Left ? styles.viewTransitionLeft : styles.viewTransitionRight);
		pageRef.current?.classList.remove(fromDirection === NavigateDirection.Right ? styles.viewTransitionLeft : styles.viewTransitionRight);
	};

	const navigateTo = (path: string, direction: NavigateDirection) =>
	{
		pageRef.current?.classList.add(direction === NavigateDirection.Left ? styles.viewTransitionLeft : styles.viewTransitionRight);
		pageRef.current?.classList.remove(direction === NavigateDirection.Right ? styles.viewTransitionLeft : styles.viewTransitionRight);

		navigate(path, { viewTransition: true, state: { fromDirection: direction } });
	};

	return { transitionedFromDirection, initialNavigateSetup, navigateTo };
}