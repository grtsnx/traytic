"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type SessionState = {
	loggedIn: boolean;
	hasSites: boolean;
	ctaHref: string;
	ctaLabel: string;
	ctaLabelShort: string;
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
	bg: "oklch(0.08 0.006 265)",
	surface: "oklch(0.115 0.008 265)",
	border: "oklch(1 0 0 / 7%)",
	borderHover: "oklch(1 0 0 / 18%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentHover: "oklch(0.55 0.22 265)",
	accentText: "oklch(0.74 0.15 265)",
	accentBg: "oklch(0.62 0.22 265 / 8%)",
	accentBorder: "oklch(0.62 0.22 265 / 28%)",
	green: "oklch(0.72 0.17 145)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

// ── Data ───────────────────────────────────────────────────────────────────────
type Plan = {
	name: string;
	price: string;
	priceNGN: string;
	period: string;
	desc: string;
	features: string[];
	siteLimit: string;
	cta: string;
	ctaHref: string;
	highlight: boolean;
};

const PLANS: Plan[] = [
	{
		name: "Free",
		price: "0",
		priceNGN: "0",
		period: "forever",
		desc: "Everything you need to understand your traffic. One site, full dashboard, zero catches.",
		features: ["1 site", "50,000 events / month", "Real-time dashboard", "6-month data retention", "Community support"],
		siteLimit: "1 site",
		cta: "Get started free",
		ctaHref: "/onboarding",
		highlight: false,
	},
	{
		name: "Pro",
		price: "5",
		priceNGN: "7,900",
		period: "/ month",
		desc: "For growing products. More sites, longer retention, and we handle the infrastructure.",
		features: ["Up to 10 sites", "1M events / month", "1-year data retention", "Email & Slack alerts", "Priority support"],
		siteLimit: "Up to 10 sites",
		cta: "Start free trial",
		ctaHref: "/upgrade?plan=pro",
		highlight: true,
	},
	{
		name: "Team",
		price: "19",
		priceNGN: "29,900",
		period: "/ month",
		desc: "For teams that need scale. Unlimited sites, team seats, and advanced features.",
		features: ["Unlimited sites", "10M events / month", "Everything in Pro", "Unlimited team seats", "Custom goals & funnels"],
		siteLimit: "Unlimited sites",
		cta: "Start free trial",
		ctaHref: "/upgrade?plan=team",
		highlight: false,
	},
];

type Step = { n: string; title: string; desc: string };
const STEPS: Step[] = [
	{
		n: "01",
		title: "Install the package",
		desc: "Grab the SDK or use the CLI to scaffold everything. Works with npm, yarn, pnpm, or bun.",
	},
	{
		n: "02",
		title: "Add the tag",
		desc: "Pick your framework, drop in the component. No props, no config files needed.",
	},
	{
		n: "03",
		title: "Ship and watch",
		desc: "Deploy your app and open the dashboard. Pageviews, referrers, devices, and countries — all in real-time.",
	},
];

const NAV_LINKS: Array<{ label: string; href: string }> = [
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Pricing", href: "#pricing" },
];

const PROOF_ITEMS: string[] = ["Zero-config", "GDPR compliant", "Self-hostable"];
const FOOTER_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
	{ label: "Docs", href: "#how-it-works" },
	{ label: "GitHub", href: "https://github.com/traytic/traytic", external: true },
	{ label: "Twitter", href: "https://twitter.com/traytic", external: true },
	{ label: "Privacy", href: "/privacy" },
	{ label: "Terms", href: "/terms" },
];

// ── FadeIn ─────────────────────────────────────────────────────────────────────
function FadeIn({
	children,
	delay = 0,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true });
	return (
		<motion.div
			ref={ref}
			className={className}
			initial={{ opacity: 0, y: 18 }}
			animate={inView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}>
			{children}
		</motion.div>
	);
}

// ── Logo ───────────────────────────────────────────────────────────────────────
function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="24" height="24" rx="7" fill={C.accent} />
			{/* Rising pulse line */}
			<path
				d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5"
				stroke="white"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Live dot at the tip */}
			<circle cx="19.5" cy="8.5" r="1.5" fill={C.green} />
		</svg>
	);
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function GitHubIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" className="mt-0.5 shrink-0">
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

function SmallCheckIcon() {
	return (
		<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3">
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

function HeartIcon() {
	return (
		<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

function SponsorButton({ variant = "nav" }: { variant?: "nav" | "footer" | "sheet" }) {
	const isFooter = variant === "footer";
	const isSheet = variant === "sheet";
	return (
		<a
			href="https://github.com/sponsors/grtsnx"
			target="_blank"
			rel="noopener noreferrer"
			className={`flex items-center gap-1.5 font-medium transition-opacity hover:opacity-90 ${
				isFooter
					? "px-4 py-2 text-[13px] rounded-lg"
					: isSheet
						? "px-3 py-3 text-[14px] rounded-lg"
						: "px-3 py-1.5 text-[13px] rounded-md"
			}`}
			style={{
				color: "oklch(0.82 0.14 10)",
				backgroundColor: "oklch(0.65 0.18 10 / 12%)",
				border: "1px solid oklch(0.65 0.18 10 / 25%)",
				fontFamily: C.sans,
				textDecoration: "none",
			}}>
			<HeartIcon />
			Sponsor
		</a>
	);
}

// ── YC Logo ────────────────────────────────────────────────────────────────────
// Official Y Combinator logo — exact paths from the public SVG asset.
// viewBox 0 0 32 32: orange square + white "Y" letterform.
function YCIcon({ size = 18 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			{/* Orange background */}
			<path d="M0 0h32v32H0z" fill="#F26625" />
			{/* White Y letterform */}
			<path
				d="M14.933 18.133L9.387 7.787h2.56l3.2 6.507c0 .107.107.213.213.32s.107.213.213.427l.107.107v.107c.107.213.107.32.213.533.107.107.107.32.213.427.107-.32.32-.533.427-.96.107-.32.32-.64.533-.96l3.2-6.507h2.347L17.067 18.24v6.613h-2.133z"
				fill="#fff"
			/>
		</svg>
	);
}

// ── CloseIcon ──────────────────────────────────────────────────────────────────
function CloseIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	);
}

// ── Nav ────────────────────────────────────────────────────────────────────────
function Nav({ session }: { session: SessionState }) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<header
				className="fixed top-0 left-0 right-0 z-50"
				style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: `${C.bg}ee`, backdropFilter: "blur(12px)" }}>
				<div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
						<LogoMark size={24} />
						<span className="text-[14px] font-semibold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
							Traytic
						</span>
					</Link>

					<nav className="hidden md:flex items-center gap-1">
						{NAV_LINKS.map((item: { label: string; href: string }) => (
							<a
								key={item.href}
								href={item.href}
								className="px-3 py-1.5 text-[13px] rounded-md transition-colors"
								style={{ color: C.textMuted, fontFamily: C.sans, textDecoration: "none" } as React.CSSProperties}>
								{item.label}
							</a>
						))}
						<a
							href="https://github.com/traytic/traytic"
							target="_blank"
							rel="noopener noreferrer"
							className="px-3 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-1.5"
							style={{ color: C.textMuted, fontFamily: C.sans, textDecoration: "none" }}>
							<GitHubIcon /> GitHub
						</a>
						<SponsorButton variant="nav" />
					</nav>

					<div className="flex items-center gap-2">
						<Link
							href={session.loggedIn ? session.ctaHref : "#pricing"}
							className="hidden sm:inline-flex px-4 py-1.5 text-[13px] font-medium rounded-md transition-opacity hover:opacity-90"
							style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
							{session.loggedIn ? session.ctaLabelShort : "Get started"}
						</Link>

						{/* Hamburger — mobile only */}
						<button
							className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-md"
							onClick={() => setOpen((v) => !v)}
							aria-label="Toggle menu"
							style={{ background: "none", border: `1px solid ${C.border}`, cursor: "pointer", padding: 0 }}>
							<motion.span animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-4 h-px" style={{ backgroundColor: C.text }} />
							<motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="block w-4 h-px mt-1" style={{ backgroundColor: C.text }} />
							<motion.span animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-4 h-px mt-1" style={{ backgroundColor: C.text }} />
						</button>
					</div>
				</div>
			</header>

			{/* Mobile Sheet */}
			<AnimatePresence>
				{open && (
					<>
						{/* Backdrop */}
						<motion.div
							className="fixed inset-0 z-55 md:hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => setOpen(false)}
							style={{ backgroundColor: "oklch(0 0 0 / 65%)" }}
						/>

						{/* Sheet panel — full screen */}
						<motion.div
							className="fixed inset-0 z-60 md:hidden flex flex-col"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							style={{ backgroundColor: C.surface }}>

							{/* Sheet header */}
							<div className="flex items-center justify-between px-6 h-14 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
								<div className="flex items-center gap-2">
									<LogoMark size={24} />
									<span className="text-[14px] font-semibold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
										Traytic
									</span>
								</div>
								<button
									onClick={() => setOpen(false)}
									className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
									aria-label="Close menu"
									style={{ color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>
									<CloseIcon />
								</button>
							</div>

							{/* Nav links — centered */}
							<nav className="flex flex-col items-center justify-center gap-2 flex-1">
								{NAV_LINKS.map((item: { label: string; href: string }) => (
									<a
										key={item.href}
										href={item.href}
										onClick={() => setOpen(false)}
										className="px-4 py-3 text-[18px] font-medium rounded-lg"
										style={{ color: C.text, fontFamily: C.sans, textDecoration: "none" }}>
										{item.label}
									</a>
								))}
								<div className="my-2 w-16" style={{ height: 1, backgroundColor: C.border }} />
								<a
									href="https://github.com/traytic/traytic"
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => setOpen(false)}
									className="flex items-center gap-2.5 px-4 py-3 text-[18px] font-medium rounded-lg"
									style={{ color: C.text, fontFamily: C.sans, textDecoration: "none" }}>
									<GitHubIcon /> GitHub
								</a>
								<SponsorButton variant="sheet" />
							</nav>

							{/* Sheet CTA */}
							<div className="px-6 pb-8 shrink-0">
								<Link
									href={session.loggedIn ? session.ctaHref : "/onboarding"}
									onClick={() => setOpen(false)}
									className="flex items-center justify-center w-full py-3.5 text-[15px] font-semibold rounded-lg transition-opacity hover:opacity-90"
									style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
									{session.loggedIn ? session.ctaLabel : "Get started free →"}
								</Link>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero({ session }: { session: SessionState }) {
	return (
		<section className="pt-32 pb-24 px-6">
			<div className="max-w-3xl mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
					className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide"
					style={{
						border: `1px solid ${C.accentBorder}`,
						backgroundColor: C.accentBg,
						color: C.accentText,
						fontFamily: C.mono,
					}}>
					<YCIcon size={18} />
					Not backed by YC — just open source.
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
					className="text-[34px] sm:text-[48px] md:text-[60px] font-bold leading-[1.08] tracking-tight mb-5"
					style={{ color: C.text, fontFamily: C.display }}>
				Analytics that
				<br />
				<span style={{ color: C.accent }}>just works.</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
					className="text-[17px] leading-relaxed mb-10 max-w-xl mx-auto"
					style={{ color: C.textMuted, fontFamily: C.sans }}>
				One import. No cookies. No config.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
					className="flex flex-wrap items-center justify-center gap-3">
					<Link
						href={session.loggedIn ? session.ctaHref : "/onboarding"}
						className="px-6 py-3 text-[14px] font-semibold rounded-lg transition-opacity hover:opacity-90"
						style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
					{session.loggedIn ? session.ctaLabel : "Get started free →"}
				</Link>
					<a
						href="https://github.com/traytic/traytic"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 px-6 py-3 text-[14px] font-medium rounded-lg transition-opacity hover:opacity-80"
						style={{
							color: C.text,
							fontFamily: C.sans,
							border: `1px solid ${C.border}`,
							backgroundColor: "transparent",
							textDecoration: "none",
						}}>
						<GitHubIcon /> View on GitHub
					</a>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-10 flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[12px] overflow-x-auto"
					style={{ color: C.textMuted, fontFamily: C.mono, scrollbarWidth: "none" }}>
					{PROOF_ITEMS.map((item: string) => (
						<span key={item} className="flex items-center gap-1.5">
							<SmallCheckIcon />
							{item}
						</span>
					))}
				</motion.div>
			</div>
		</section>
	);
}

// ── Step visuals ──────────────────────────────────────────────────────────────

const PKG_ICONS: Record<string, React.ReactNode> = {
	npm: (
		<svg width="16" height="16" viewBox="0 0 256 256"><rect width="256" height="256" fill="#C12127" /><path d="M48 48v160h80V88h40v120h40V48H48z" fill="#fff" /></svg>
	),
	yarn: (
		<svg width="16" height="16" viewBox="0 0 256 256"><rect width="256" height="256" rx="40" fill="#2C8EBB" /><path d="M203 170c-6-3-12-4-17-4-4 0-13 3-23 7-12 4-25 8-33 8-2 0-4 0-6-1l-3-1-3 1c-2 1-8 2-13 2-10 0-16-3-19-6-1-1-2-3-2-5 0 0 1-2 2-4l4-6c3-4 6-9 7-14 1-3 0-6-2-9-5-7-8-15-9-21 0-3 1-9 5-16 4-6 12-14 27-18 0 0 1 0 1 0 1 0 3-1 3-3 0-2-1-3-3-4-11-3-15-11-14-18 1-5 5-9 9-11 5-2 10-2 13 0 4 3 6 7 5 13 0 2 1 3 3 4 2 0 3-1 4-3 1-10-4-18-12-22-6-4-14-4-21-1-6 2-11 7-13 13-2 8 2 18 14 23-14 5-23 13-28 21-5 7-7 14-7 20 1 8 5 17 10 25 1 1 1 3 1 4-1 4-4 8-7 13l-4 6c-2 3-3 6-3 9 1 6 4 10 8 13 5 4 12 6 21 6 5 0 11-1 14-2l1 0c2 1 4 1 6 1 9 0 23-5 34-9 10-3 18-6 22-6 4 0 9 1 14 3 2 1 4 0 5-2 1-2 0-4-2-5z" fill="#fff" /></svg>
	),
	pnpm: (
		<svg width="16" height="16" viewBox="0 0 256 256"><rect width="256" height="256" fill="#F9AD00" /><rect x="16" y="16" width="68" height="68" fill="#4E4E4E" /><rect x="94" y="16" width="68" height="68" fill="#4E4E4E" /><rect x="172" y="16" width="68" height="68" fill="#4E4E4E" /><rect x="172" y="94" width="68" height="68" fill="#4E4E4E" /><rect x="94" y="94" width="68" height="68" fill="#4E4E4E" /><rect x="172" y="172" width="68" height="68" fill="#4E4E4E" /><rect x="94" y="172" width="68" height="68" fill="#4E4E4E" /></svg>
	),
	bun: (
		<svg width="16" height="16" viewBox="0 0 256 256"><rect width="256" height="256" rx="40" fill="#FBF0DF" /><ellipse cx="128" cy="155" rx="80" ry="65" fill="#FBF0DF" stroke="#3B2314" strokeWidth="8" /><ellipse cx="128" cy="164" rx="56" ry="28" fill="#F9D89C" /><circle cx="105" cy="140" r="6" fill="#3B2314" /><circle cx="151" cy="140" r="6" fill="#3B2314" /><circle cx="103" cy="138" r="2" fill="#fff" /><circle cx="149" cy="138" r="2" fill="#fff" /><ellipse cx="128" cy="154" rx="5" ry="3" fill="#E8847C" /><path d="M108 86c-8-30 6-52 6-52s10 18 4 46" fill="#87A96B" /><path d="M128 80c0-32 14-50 14-50s6 20-4 48" fill="#87A96B" /><path d="M148 86c8-30-2-52-2-52s-8 18-6 46" fill="#87A96B" /></svg>
	),
	cli: (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="3" stroke={C.accentText} strokeWidth="1.5" /><path d="M7 9l3 3-3 3" stroke={C.accentText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 15h4" stroke={C.accentText} strokeWidth="1.5" strokeLinecap="round" /></svg>
	),
};

function MarqueeInstall() {
	const cmds = [
		{ mgr: "npm", cmd: "npm install @traytic/analytics" },
		{ mgr: "yarn", cmd: "yarn add @traytic/analytics" },
		{ mgr: "pnpm", cmd: "pnpm add @traytic/analytics" },
		{ mgr: "bun", cmd: "bun add @traytic/analytics" },
		{ mgr: "cli", cmd: "npx traytic init" },
	];
	const doubled = [...cmds, ...cmds];
	return (
		<div
			className="rounded-lg overflow-hidden relative"
			style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, height: 140 }}>
			<div
				className="absolute inset-x-0 top-0 h-6 z-10 pointer-events-none"
				style={{ background: `linear-gradient(to bottom, ${C.bg}, transparent)` }}
			/>
			<div
				className="absolute inset-x-0 bottom-0 h-6 z-10 pointer-events-none"
				style={{ background: `linear-gradient(to top, ${C.bg}, transparent)` }}
			/>
			<motion.div
				className="flex flex-col gap-2.5 px-3 py-2"
				animate={{ y: [0, -(cmds.length * 40)] }}
				transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
				{doubled.map((c, i) => (
					<div
						key={`${c.mgr}-${i}`}
						className="flex items-center gap-3 rounded-md px-2.5 py-2 shrink-0"
						style={{ height: 32, fontFamily: C.mono, fontSize: 11 }}>
						<span className="shrink-0 flex items-center">{PKG_ICONS[c.mgr]}</span>
						<span style={{ color: C.accentText }}>{c.cmd}</span>
					</div>
				))}
			</motion.div>
		</div>
	);
}

const FRAMEWORK_SNIPPETS: { id: string; label: string; icon: React.ReactNode; code: string }[] = [
	{
		id: "next",
		label: "Next.js",
		icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.54 0 4.894-.79 6.834-2.135L8.56 6.27A.75.75 0 0 1 9.75 5.5h.5v8.06l6.63-8.81A9.96 9.96 0 0 1 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2a9.96 9.96 0 0 1 6.38 2.287l-.926 1.232A8.46 8.46 0 0 0 12 3.5 8.5 8.5 0 1 0 20.5 12c0-1.8-.56-3.47-1.516-4.846L13.25 15.04V5.5h.5a.75.75 0 0 1 .596 1.21l-1.096 1.456V5.5h.5" /></svg>,
		code: `import { Analytics } from\n  "@traytic/analytics/next"\n\n// app/layout.tsx\n<Analytics />`,
	},
	{
		id: "react",
		label: "React",
		icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#61DAFB"><path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9s-1.17 0-1.71.03c-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03s1.17 0 1.71-.03c.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26s-1.18-1.63-3.28-2.26c-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26s1.18 1.63 3.28 2.26c.25-.76.55-1.51.89-2.26m9 2.26-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-9.82 1.12c.17.47.37.93.58 1.37.34.08.7.14 1.08.19-.23-.37-.44-.75-.65-1.14l-1.01-.42m1.02-6.76c-.38.05-.74.11-1.08.19-.21.44-.41.9-.58 1.37l1.01-.42c.21-.39.43-.77.65-1.14m7.88 6.76 1.01.42c-.17-.47-.37-.93-.58-1.37-.34-.08-.7-.14-1.08-.19.23.37.44.75.65 1.14M15.9 7.62c.38-.05.74-.11 1.08-.19.21-.44.41-.9.58-1.37l-1.01.42c-.21.39-.43.77-.65 1.14"/></svg>,
		code: `import { Analytics } from\n  "@traytic/analytics/react"\n\n// App.tsx\n<Analytics />`,
	},
	{
		id: "remix",
		label: "Remix",
		icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.511 18.508c.216 2.773.216 4.073.216 5.492H15.31c0-.309.006-.592.013-.878.018-.711.036-1.441-.014-2.613-.073-1.636-.756-2.007-1.956-2.007H2v-4.327h11.696c1.419 0 2.393-.625 2.393-1.965 0-1.2-.832-1.999-2.393-1.999H2V6h12.46c3.713 0 5.936 2.031 5.936 5.282 0 2.363-1.456 3.901-3.387 4.291 1.713.476 2.393 1.563 2.502 2.935M2 19.51V24H8.168a2.16 2.16 0 0 0-.049-.456c-.112-.654-.452-1.074-1.413-1.074H2v-2.96"/></svg>,
		code: `import { Analytics } from\n  "@traytic/analytics/remix"\n\n// root.tsx\n<Analytics />`,
	},
	{
		id: "astro",
		label: "Astro",
		icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.074 16.86c-.72.616-2.157 1.035-3.812 1.035-2.032 0-3.735-.632-4.187-1.483-.161.488-.198 1.046-.198 1.402 0 0-.106 1.75 1.111 2.968a1.027 1.027 0 0 1 1.027-1.027c.97 0 .97.846.97 1.026v.104a2.07 2.07 0 0 0 1.131 1.846c-.48-.847-.136-1.846.703-2.072.744-.2 1.504.083 2.19-.403a2.07 2.07 0 0 0 .862-1.684 2.1 2.1 0 0 0-.797-1.712M6.431 4.562l-3.18 9.266a.48.48 0 0 0 .344.614l3.461.866.007.002a23 23 0 0 1 1.163-3.095L10.5 7.03a.344.344 0 0 1 .645 0l2.274 5.185a23 23 0 0 1 1.163 3.095l.007-.002 3.461-.866a.48.48 0 0 0 .344-.614l-3.18-9.266a.534.534 0 0 0-.497-.36H6.928a.534.534 0 0 0-.497.36"/></svg>,
		code: `---\nimport Analytics from\n  "@traytic/analytics/astro"\n---\n\n<Analytics />`,
	},
	{
		id: "script",
		label: "Script",
		icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
		code: `<script\n  defer\n  src="https://cdn.traytic.com\n  /script.js"\n/>`,
	},
];

function TypewriterCode() {
	const [active, setActive] = useState(0);
	const snippet = FRAMEWORK_SNIPPETS[active]!;

	return (
		<div
			className="rounded-lg overflow-hidden"
			style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
			<div className="flex gap-0 overflow-x-auto" style={{ borderBottom: `1px solid ${C.border}` }}>
				{FRAMEWORK_SNIPPETS.map((fw, i) => (
					<button
						key={fw.id}
						type="button"
						onClick={() => setActive(i)}
						className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium shrink-0 transition-colors"
						style={{
							fontFamily: C.mono,
							color: i === active ? C.text : C.textMuted,
							backgroundColor: i === active ? C.surface : "transparent",
							borderBottom: i === active ? `2px solid ${C.accent}` : "2px solid transparent",
						}}>
						<span className="flex items-center">{fw.icon}</span>
						{fw.label}
					</button>
				))}
			</div>
			<AnimatePresence mode="wait">
				<motion.div
					key={snippet.id}
					initial={{ opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -4 }}
					transition={{ duration: 0.15 }}
					className="p-4 text-[12px] leading-[20px]"
					style={{ fontFamily: C.mono, whiteSpace: "pre-wrap", color: C.accentText }}>
					{snippet.code}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

function AnimatedDashboard() {
	const bars = [28, 42, 36, 55, 48, 62, 45, 70, 58, 50, 40, 65];
	return (
		<div
			className="rounded-lg overflow-hidden"
			style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
			<div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
				<div className="flex gap-1.5">
					<span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "oklch(0.65 0.2 25)" }} />
					<span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "oklch(0.75 0.16 85)" }} />
					<span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: C.green }} />
				</div>
				<span className="text-[9px] ml-1" style={{ color: C.textMuted, fontFamily: C.mono }}>traytic — dashboard</span>
			</div>

			<div className="grid grid-cols-3 gap-px px-3 pt-2.5 pb-1.5">
				{[
					{ label: "Visitors", value: "2,847" },
					{ label: "Pageviews", value: "8,421" },
					{ label: "Bounce", value: "34%" },
				].map((m) => (
					<div key={m.label} className="text-center">
						<p className="text-[7px] uppercase tracking-wider" style={{ color: C.textMuted, fontFamily: C.mono }}>{m.label}</p>
						<p className="text-[13px] font-bold" style={{ color: C.text, fontFamily: C.display }}>{m.value}</p>
					</div>
				))}
			</div>

			<div className="px-3 pb-1.5">
				<div className="flex items-end gap-[3px]" style={{ height: 56 }}>
					{bars.map((h, i) => {
						const h2 = bars[(i + 4) % bars.length]!;
						return (
							<motion.div
								key={i}
								className="flex-1 rounded-sm"
								style={{ backgroundColor: C.accent }}
								animate={{
									height: [`${h}%`, `${h2}%`, `${h}%`],
									opacity: [0.5 + h / 140, 0.5 + h2 / 140, 0.5 + h / 140],
								}}
								transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
							/>
						);
					})}
				</div>
			</div>

			<div className="flex items-center gap-2 px-3 pb-2">
				<motion.span
					className="w-[6px] h-[6px] rounded-full"
					style={{ backgroundColor: C.green }}
					animate={{ boxShadow: [`0 0 4px ${C.green}`, `0 0 10px ${C.green}`, `0 0 4px ${C.green}`] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
				<span className="text-[9px]" style={{ color: C.green, fontFamily: C.mono }}>12 online now</span>
			</div>
		</div>
	);
}

// ── How it works ───────────────────────────────────────────────────────────────
function HowItWorks() {
	return (
		<section id="how-it-works" className="py-20 px-6" style={{ backgroundColor: C.surface }}>
			<div className="max-w-5xl mx-auto">
				<FadeIn className="mb-12 text-center">
					<p className="text-[11px] font-medium tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
						How it works
					</p>
					<h2 className="text-[32px] font-bold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
						Three steps. Two minutes. Done.
					</h2>
				</FadeIn>

		<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
			{STEPS.map((step: Step, i: number) => (
				<FadeIn key={step.n} delay={i * 0.1} className="flex">
					<div className="flex flex-col gap-4 flex-1">
						<span className="text-[13px] font-bold tabular-nums" style={{ color: C.accent, fontFamily: C.mono }}>
							{step.n}
						</span>
						<h3 className="text-[16px] font-semibold" style={{ color: C.text, fontFamily: C.display }}>
							{step.title}
						</h3>
						<p className="text-[13px] leading-relaxed" style={{ color: C.textMuted, fontFamily: C.sans }}>
							{step.desc}
						</p>
						<div className="mt-auto">
							{step.n === "01" && <MarqueeInstall />}
							{step.n === "02" && <TypewriterCode />}
							{step.n === "03" && <AnimatedDashboard />}
						</div>
					</div>
				</FadeIn>
			))}
		</div>
			</div>
		</section>
	);
}

// ── Pricing ────────────────────────────────────────────────────────────────────
function Pricing({ session }: { session: SessionState }) {
	return (
		<section id="pricing" className="py-20 px-6">
			<div className="max-w-5xl mx-auto">
				<FadeIn className="mb-12 text-center">
					<p className="text-[11px] font-medium tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
						Pricing
					</p>
					<h2 className="text-[32px] font-bold tracking-tight mb-3" style={{ color: C.text, fontFamily: C.display }}>
						Simple, honest pricing.
					</h2>
					<p className="text-[14px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
						Free forever for 1 site. Scale when you need to — no surprises.
					</p>
				</FadeIn>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{PLANS.map((plan: Plan, i: number) => (
						<FadeIn key={plan.name} delay={i * 0.08}>
							<div
								className="relative flex flex-col p-6 rounded-xl h-full"
								style={{
									backgroundColor: plan.highlight ? C.accentBg : C.surface,
									border: `1px solid ${plan.highlight ? C.accentBorder : C.border}`,
								}}>
								{plan.highlight && (
									<div
										className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full tracking-widest uppercase whitespace-nowrap"
										style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.mono }}>
										Most popular
									</div>
								)}

								<div className="mb-5">
									<h3 className="text-[13px] font-semibold tracking-wide uppercase mb-3" style={{ color: C.textMuted, fontFamily: C.mono }}>
										{plan.name}
									</h3>
									<div className="flex items-baseline gap-1.5 mb-1">
										<span className="text-[40px] font-bold leading-none" style={{ color: C.text, fontFamily: C.display }}>
											{plan.price === "0" ? "Free" : `$${plan.price}`}
										</span>
										{plan.price !== "0" && (
											<span className="text-[13px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
												{plan.period}
											</span>
										)}
									</div>
									{plan.price !== "0" && (
										<p className="text-[11px] mb-3" style={{ color: C.textMuted, fontFamily: C.mono }}>
											₦{plan.priceNGN} / month for NG · GH · KE · ZA
										</p>
									)}
									{plan.price === "0" && (
										<p className="text-[11px] mb-3" style={{ color: C.textMuted, fontFamily: C.mono }}>
											forever
										</p>
									)}
									<div
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold mb-3"
										style={{ backgroundColor: C.accentBg, color: C.accentText, border: `1px solid ${C.accentBorder}`, fontFamily: C.mono }}>
										{plan.siteLimit}
									</div>
									<p className="text-[13px] leading-relaxed" style={{ color: C.textMuted, fontFamily: C.sans }}>
										{plan.desc}
									</p>
								</div>

								<ul className="flex flex-col gap-2.5 mb-6 flex-1">
									{plan.features.map((feat: string) => (
										<li key={feat} className="flex items-start gap-2 text-[13px]" style={{ color: C.text, fontFamily: C.sans }}>
											<CheckIcon />
											{feat}
										</li>
									))}
								</ul>

								<Link
									href={session.loggedIn && plan.price === "0" ? session.ctaHref : plan.ctaHref}
									className="w-full py-2.5 text-[13px] font-semibold rounded-lg transition-opacity hover:opacity-90 text-center"
									style={{
										backgroundColor: plan.highlight ? C.accent : "transparent",
										color: plan.highlight ? "#fff" : C.text,
										border: `1px solid ${plan.highlight ? C.accent : C.border}`,
										fontFamily: C.sans,
										textDecoration: "none",
										display: "block",
									}}>
									{session.loggedIn && plan.price === "0" ? session.ctaLabelShort : plan.cta}
									</Link>
							</div>
						</FadeIn>
					))}
				</div>

				<FadeIn delay={0.3}>
					<p className="mt-6 text-center text-[12px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
						NGN/GHS/KES/ZAR pricing via Paystack.
					</p>
				</FadeIn>
			</div>
		</section>
	);
}

// ── CTA Banner ─────────────────────────────────────────────────────────────────
function CTABanner({ session }: { session: SessionState }) {
	return (
		<section
			className="py-20 px-6 text-center"
			style={{ backgroundColor: C.surface }}>
			<div className="max-w-2xl mx-auto">
				<FadeIn>
					<h2 className="text-[26px] sm:text-[36px] font-bold tracking-tight mb-4" style={{ color: C.text, fontFamily: C.display }}>
						Ready when you are.
					</h2>
					<p className="text-[15px] mb-8" style={{ color: C.textMuted, fontFamily: C.sans }}>
						Install the SDK, add the tag, and your analytics is live.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Link
							href={session.loggedIn ? session.ctaHref : "/onboarding"}
							className="px-6 py-3 text-[14px] font-semibold rounded-lg transition-opacity hover:opacity-90"
							style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
							{session.loggedIn ? session.ctaLabel : "Get started free →"}
						</Link>
						<a
							href="https://github.com/traytic/traytic"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 px-6 py-3 text-[14px] font-medium rounded-lg transition-opacity hover:opacity-80"
							style={{
								color: C.text,
								fontFamily: C.sans,
								border: `1px solid ${C.border}`,
								backgroundColor: "transparent",
								textDecoration: "none",
							}}>
							<GitHubIcon /> Star on GitHub
						</a>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
	return (
		<footer className="py-8 px-6" style={{ borderTop: `1px solid ${C.border}` }}>
			<div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<LogoMark size={20} />
					<span className="text-[13px] font-medium" style={{ color: C.textMuted, fontFamily: C.display }}>
						Traytic · Open source analytics
					</span>
				</div>

			<div className="flex flex-wrap justify-center items-center gap-4">
				{FOOTER_LINKS.map((link: { label: string; href: string; external?: boolean }) =>
					link.external ? (
						<a
							key={link.label}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[12px] transition-opacity hover:opacity-80"
							style={{ color: C.textMuted, fontFamily: C.sans, textDecoration: "none" }}>
							{link.label}
						</a>
					) : (
						<Link
							key={link.label}
							href={link.href}
							className="text-[12px] transition-opacity hover:opacity-80"
							style={{ color: C.textMuted, fontFamily: C.sans, textDecoration: "none" }}>
							{link.label}
						</Link>
					)
				)}
			</div>

							<SponsorButton variant="footer" />
			</div>
		</footer>
	);
}

// ── Page ───────────────────────────────────────────────────────────────────────
const DEFAULT_SESSION: SessionState = {
	loggedIn: false,
	hasSites: false,
	ctaHref: "/onboarding",
	ctaLabel: "Get started free →",
	ctaLabelShort: "Get started",
};

export default function Home() {
	const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);

	useEffect(() => {
		(async () => {
			try {
				const authRes = await fetch(`${API}/api/auth/get-session`, { credentials: "include" });
				if (!authRes.ok) return;
				const authData = (await authRes.json()) as { user?: { id: string } } | null;
				if (!authData?.user) return;

				const sitesRes = await fetch(`${API}/api/sites`, { credentials: "include" });
				const sites = sitesRes.ok ? ((await sitesRes.json()) as { id: string }[]) : [];

				if (sites.length > 0) {
					setSession({
						loggedIn: true,
						hasSites: true,
						ctaHref: "/dashboard",
						ctaLabel: "Dashboard →",
						ctaLabelShort: "Dashboard",
					});
				} else {
					setSession({
						loggedIn: true,
						hasSites: false,
						ctaHref: "/onboarding?step=add-site",
						ctaLabel: "Add your site →",
						ctaLabelShort: "Add site",
					});
				}
			} catch {
				// not logged in, keep defaults
			}
		})();
	}, []);

	return (
		<div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
			<Nav session={session} />
			<main>
				<Hero session={session} />
				<HowItWorks />
				<Pricing session={session} />
				<CTABanner session={session} />
			</main>
			<Footer />
		</div>
	);
}
