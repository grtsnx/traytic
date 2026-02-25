"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

const C = {
	bg: "oklch(0.08 0.006 265)",
	surface: "oklch(0.115 0.008 265)",
	border: "oklch(1 0 0 / 7%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentText: "oklch(0.74 0.15 265)",
	accentBg: "oklch(0.62 0.22 265 / 8%)",
	accentBorder: "oklch(0.62 0.22 265 / 28%)",
	green: "oklch(0.72 0.17 145)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<rect width="24" height="24" rx="7" fill={C.accent} />
			<path d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="19.5" cy="8.5" r="1.5" fill={C.green} />
		</svg>
	);
}

export default function BillingSuccess() {
	const router = useRouter();
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown((n) => {
				if (n <= 1) {
					clearInterval(interval);
					router.push("/onboarding");
				}
				return n - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [router]);

	return (
		<div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }}>
			<header style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: `${C.bg}ee`, backdropFilter: "blur(12px)" }}>
				<div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
					<Link
						href="/"
						style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: C.textMuted, transition: "color 0.15s" }}>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
						<span style={{ fontFamily: C.sans, fontSize: "13px" }}>Back</span>
					</Link>
					<div style={{ width: "1px", height: "18px", backgroundColor: C.border }} />
					<Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
						<LogoMark size={24} />
						<span className="text-[14px] font-semibold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
							Traytic
						</span>
					</Link>
				</div>
			</header>

			<main className="flex-1 flex items-center justify-center px-6">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
					className="text-center max-w-md">

					{/* Animated check */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
						className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
						style={{ backgroundColor: `oklch(0.72 0.17 145 / 15%)`, border: `1px solid oklch(0.72 0.17 145 / 30%)` }}>
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.4 }}
						className="text-[28px] font-bold tracking-tight mb-3"
						style={{ color: C.text, fontFamily: C.display }}>
						You&apos;re all set!
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.28, duration: 0.4 }}
						className="text-[15px] mb-8"
						style={{ color: C.textMuted, fontFamily: C.sans }}>
						Your subscription is active. Now add your first site and install the SDK.
					</motion.p>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="flex flex-col items-center gap-4">
						<Link
							href="/onboarding"
							className="px-6 py-3 text-[14px] font-semibold rounded-lg transition-opacity hover:opacity-90"
							style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
							Set up your site →
						</Link>
						<p className="text-[12px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
							Redirecting in {countdown}s…
						</p>
					</motion.div>
				</motion.div>
			</main>
		</div>
	);
}
