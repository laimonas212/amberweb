import React, { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
	const [isVisible, setIsVisible] = useState(false);
	const buttonRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | null>(null);

	useEffect(() => {
		const updateScrollState = () => {
			animationFrameRef.current = null;
			const scrollTop = window.scrollY;
			const scrollableHeight =
				document.documentElement.scrollHeight -
				document.documentElement.clientHeight;
			const progress =
				scrollableHeight > 0
					? Math.min((scrollTop / scrollableHeight) * 100, 100)
					: 0;

			buttonRef.current?.style.setProperty("--scroll-progress", progress + "%");
			setIsVisible((currentlyVisible) => {
				const shouldBeVisible = scrollTop > 300;
				return currentlyVisible === shouldBeVisible
					? currentlyVisible
					: shouldBeVisible;
			});
		};

		const handleScroll = () => {
			if (animationFrameRef.current === null) {
				animationFrameRef.current = window.requestAnimationFrame(updateScrollState);
			}
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (animationFrameRef.current !== null) {
				window.cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div
			ref={buttonRef}
			className={"z-20 fixed bottom-8 right-8 flex items-center justify-center rounded-full transition-all duration-500 transform " + (isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none")}
			style={{
				width: "50px",
				height: "50px",
				background: "conic-gradient(#00f0ff 0%, #9D00FF var(--scroll-progress, 0%), transparent var(--scroll-progress, 0%))",
				visibility: isVisible ? "visible" : "hidden",
			}}
		>
			<div
				className="absolute inset-0 rounded-full"
				style={{
					backgroundColor: "rgba(255, 255, 255, 0.1)",
					backdropFilter: "blur(5px)",
					WebkitBackdropFilter: "blur(5px)",
				}}
			/>
			<div className="relative w-11 h-11 bg-dark-surface rounded-full flex items-center justify-center text-electric-blue shadow-lg">
				<button
					type="button"
					onClick={scrollToTop}
					className="w-full h-full rounded-full flex items-center justify-center"
					aria-label="Grįžti į puslapio viršų"
				>
					<ChevronUp className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
};

export default ScrollToTopButton;
