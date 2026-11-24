import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ParticlesBackground: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;
		const particlesCount = isSmallScreen ? 320 : 700;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		const renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: false,
			powerPreference: "low-power",
		});

		const updateRendererSize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
			renderer.setSize(width, height, false);
		};

		updateRendererSize();

		const particlesGeometry = new THREE.BufferGeometry();
		const positions = new Float32Array(particlesCount * 3);

		for (let i = 0; i < positions.length; i++) {
			positions[i] = (Math.random() - 0.5) * 5;
		}

		particlesGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, 3),
		);

		const particlesMaterial = new THREE.PointsMaterial({
			size: isSmallScreen ? 0.009 : 0.007,
			color: "#00F0FF",
			transparent: true,
			opacity: 0.65,
		});
		const particlesMesh = new THREE.Points(
			particlesGeometry,
			particlesMaterial,
		);
		scene.add(particlesMesh);
		camera.position.z = 3;

		let animationFrameId: number | null = null;
		let isInViewport = false;
		let isPageVisible = !document.hidden;
		let isDisposed = false;

		const renderFrame = () => {
			if (isDisposed) return;
			particlesMesh.rotation.y += 0.001;
			renderer.render(scene, camera);
			if (!prefersReducedMotion && isInViewport && isPageVisible) {
				animationFrameId = window.requestAnimationFrame(renderFrame);
			}
		};

		const stopAnimation = () => {
			if (animationFrameId !== null) {
				window.cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
		};

		const syncAnimation = () => {
			stopAnimation();
			if (isDisposed) return;
			if (isInViewport && isPageVisible) {
				if (prefersReducedMotion) {
					renderer.render(scene, camera);
				} else {
					animationFrameId = window.requestAnimationFrame(renderFrame);
				}
			}
		};

		const intersectionObserver = new IntersectionObserver(([entry]) => {
			isInViewport = entry.isIntersecting;
			syncAnimation();
		});
		intersectionObserver.observe(canvas);

		const handleVisibilityChange = () => {
			isPageVisible = !document.hidden;
			syncAnimation();
		};
		const handleResize = () => {
			updateRendererSize();
			renderer.render(scene, camera);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("resize", handleResize, { passive: true });
		renderer.render(scene, camera);

		return () => {
			isDisposed = true;
			stopAnimation();
			intersectionObserver.disconnect();
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange,
			);
			window.removeEventListener("resize", handleResize);
			particlesGeometry.dispose();
			particlesMaterial.dispose();
			renderer.dispose();
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 h-full w-full"
			style={{ pointerEvents: "none" }}
			aria-hidden="true"
		/>
	);
};

export default ParticlesBackground;
