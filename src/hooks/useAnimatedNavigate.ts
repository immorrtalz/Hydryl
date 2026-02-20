import { RefObject } from "react";
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

	const initialNavigateSetup = () =>
	{
		const fromDirection: NavigateDirection = (location.state as { fromDirection?: NavigateDirection })?.fromDirection ?? NavigateDirection.Left;
		pageRef.current?.classList.add(fromDirection === NavigateDirection.Left ? 'viewTransitionLeftSecond' : 'viewTransitionRightSecond');
	};

	const navigateTo = (path: string, direction: NavigateDirection) =>
	{
		pageRef.current?.classList.remove('viewTransitionLeftFirst', 'viewTransitionLeftSecond', 'viewTransitionRightFirst', 'viewTransitionRightSecond');
		pageRef.current?.classList.add(direction === NavigateDirection.Right ? 'viewTransitionLeftFirst' : 'viewTransitionRightFirst');

		navigate(path, { viewTransition: true, state: { fromDirection: direction } });
	};

	return { initialNavigateSetup, navigateTo };
}