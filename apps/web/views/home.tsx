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
		desc: "Zero dollars, zero catches. One site, full analytics. Your accountant will be confused.",
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
		desc: "More sites, more data. We handle infra so you don't have to wake up at 3 AM.",
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
		desc: "For teams that need scale. Unlimited everything, because limits are for consent banners.",
		features: ["Unlimited sites", "10M events / month", "Everything in Pro", "Unlimited team seats", "Custom goals & funnels"],
		siteLimit: "Unlimited sites",
		cta: "Start free trial",
		ctaHref: "/upgrade?plan=team",
		highlight: false,
	},
];

type Step = { n: string; title: string; desc: string; code: string | null };
const STEPS: Step[] = [
	{
		n: "01",
		title: "Install the SDK",
		desc: "One command. Sub-3kb gzipped. Smaller than most favicons. Works with npm, yarn, pnpm, or bun.",
		code: "npm install @traytic/analytics",
	},
	{
		n: "02",
		title: "Add to your layout",
		desc: "Drop the component into your root layout. Configure your site ID. That's it. No, really. That's it.",
		code: `import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Analytics
        siteId="YOUR_SITE_ID"
        endpoint="https://your-api.example.com/collect"
      />
    </body></html>
  )
}`,
	},
	{
		n: "03",
		title: "See it live",
		desc: "Open the dashboard. Real-time data streams in the moment your first visitor lands. Go on, refresh the page.",
		code: null,
	},
];

type Feature = { icon: string; title: string; desc: string; tag: string };
const FEATURES: Feature[] = [
	{
		icon: "⬡",
		title: "No cookies. No consent banners.",
		desc: "Privacy fingerprinting via SHA-256 hash of site ID, IP, user-agent, and date. Your lawyers can finally take a vacation. Fully GDPR, CCPA, and PECR compliant.",
		tag: "Privacy-first",
	},
	{
		icon: "◎",
		title: "Real-time, sub-second updates.",
		desc: "SSE-powered live dashboard via RxJS. See every pageview the moment it happens — no polling, no delay, no \"data will be available in 24 hours.\"",
		tag: "Real-time",
	},
	{
		icon: "▣",
		title: "Self-hostable in one command.",
		desc: "Run on your own infra with Docker. Postgres + ClickHouse + Redis. MIT licensed. Your data stays where you put it.",
		tag: "Self-hostable",
	},
	{
		icon: "◈",
		title: "Open source, forever.",
		desc: "Every line of code is public on GitHub. Audit it, fork it, contribute to it. We have nothing to hide (unlike your current analytics provider).",
		tag: "Open source",
	},
];

const NAV_LINKS: Array<{ label: string; href: string }> = [
	{ label: "Features", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Pricing", href: "#pricing" },
];

const PROOF_ITEMS: string[] = ["No cookies", "GDPR compliant", "Self-hostable", "<3kb SDK"];
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
			<rect width="24" height="24" rx="6" fill={C.accent} />
			{/* Three ascending bars — shared baseline at y=19.5 */}
			<rect x="4" y="14.5" width="4" height="5" rx="1" fill="white" fillOpacity="0.55" />
			<rect x="10" y="11" width="4" height="8.5" rx="1" fill="white" fillOpacity="0.8" />
			<rect x="16" y="7.5" width="4" height="12" rx="1" fill="white" />
			{/* Trend dot on tallest bar */}
			<circle cx="18" cy="6.5" r="1.2" fill={C.green} />
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
					Not backed by YC. Open source.
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
					className="text-[34px] sm:text-[48px] md:text-[60px] font-bold leading-[1.08] tracking-tight mb-5"
					style={{ color: C.text, fontFamily: C.display }}>
					Analytics that respect
					<br />
					<span style={{ color: C.accent }}>your users&apos; privacy.</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
					className="text-[17px] leading-relaxed mb-10 max-w-xl mx-auto"
					style={{ color: C.textMuted, fontFamily: C.sans }}>
				Privacy-first, real-time web analytics. No cookies, no consent banners, no creepy tracking scripts following your users around the internet.
				Self-hostable and open source.
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

// ── Features ───────────────────────────────────────────────────────────────────
function Features() {
	return (
		<section id="features" className="py-20 px-6" style={{ borderTop: `1px solid ${C.border}` }}>
			<div className="max-w-5xl mx-auto">
				<FadeIn className="mb-12 text-center">
					<p className="text-[11px] font-medium tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
						Features
					</p>
					<h2 className="text-[32px] font-bold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
						Everything you need. Nothing you don&apos;t.
					</h2>
				</FadeIn>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{FEATURES.map((f: Feature, i: number) => (
						<FadeIn key={f.title} delay={i * 0.07}>
							<div
								className="p-6 rounded-xl h-full transition-colors hover:border-white/20"
								style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
								<div className="flex items-start gap-4">
									<span className="text-[22px] mt-0.5 shrink-0" style={{ color: C.accent, fontFamily: C.mono }}>
										{f.icon}
									</span>
									<div>
										<h3 className="text-[15px] font-semibold mb-2" style={{ color: C.text, fontFamily: C.display }}>
											{f.title}
										</h3>
										<p className="text-[13px] leading-relaxed" style={{ color: C.textMuted, fontFamily: C.sans }}>
											{f.desc}
										</p>
										<span
											className="inline-block mt-3 text-[10px] font-medium px-2 py-0.5 rounded-full tracking-widest uppercase"
											style={{
												backgroundColor: C.accentBg,
												color: C.accentText,
												border: `1px solid ${C.accentBorder}`,
												fontFamily: C.mono,
											}}>
											{f.tag}
										</span>
									</div>
								</div>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}

// ── How it works ───────────────────────────────────────────────────────────────
function HowItWorks() {
	return (
		<section id="how-it-works" className="py-20 px-6" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
			<div className="max-w-5xl mx-auto">
				<FadeIn className="mb-12 text-center">
					<p className="text-[11px] font-medium tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
						How it works
					</p>
					<h2 className="text-[32px] font-bold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
						From zero to live in 3 steps.
					</h2>
				</FadeIn>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{STEPS.map((step: Step, i: number) => (
						<FadeIn key={step.n} delay={i * 0.1}>
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-3">
									<span className="text-[13px] font-bold tabular-nums" style={{ color: C.accent, fontFamily: C.mono }}>
										{step.n}
									</span>
									<div className="h-px flex-1" style={{ backgroundColor: C.border }} />
								</div>

								<h3 className="text-[16px] font-semibold" style={{ color: C.text, fontFamily: C.display }}>
									{step.title}
								</h3>
								<p className="text-[13px] leading-relaxed" style={{ color: C.textMuted, fontFamily: C.sans }}>
									{step.desc}
								</p>

								{step.code ? (
									<div
										className="rounded-lg p-4 text-[12px] leading-relaxed overflow-x-auto"
										style={{
											backgroundColor: C.bg,
											border: `1px solid ${C.border}`,
											color: C.accentText,
											fontFamily: C.mono,
											whiteSpace: "pre",
										}}>
										{step.code}
									</div>
								) : (
									<div
										className="rounded-lg p-4 flex items-center gap-3"
										style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
										<span
											className="w-2.5 h-2.5 rounded-full shrink-0"
											style={{ backgroundColor: C.green, boxShadow: `0 0 8px ${C.green}` }}
										/>
										<span className="text-[13px]" style={{ color: C.green, fontFamily: C.mono }}>
											Live — data streaming in real-time
										</span>
									</div>
								)}
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
		<section id="pricing" className="py-20 px-6" style={{ borderTop: `1px solid ${C.border}` }}>
			<div className="max-w-5xl mx-auto">
				<FadeIn className="mb-12 text-center">
					<p className="text-[11px] font-medium tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
						Pricing
					</p>
					<h2 className="text-[32px] font-bold tracking-tight mb-3" style={{ color: C.text, fontFamily: C.display }}>
						Simple, honest pricing.
					</h2>
					<p className="text-[14px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
						Start free with 1 site. Add more when you&apos;re ready — from $5/mo.
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
						NGN/GHS/KES/ZAR pricing via Paystack for NG · GH · KE · ZA markets.
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
			style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
			<div className="max-w-2xl mx-auto">
				<FadeIn>
					<h2 className="text-[26px] sm:text-[36px] font-bold tracking-tight mb-4" style={{ color: C.text, fontFamily: C.display }}>
						Ready to drop the consent banner?
					</h2>
					<p className="text-[15px] mb-8" style={{ color: C.textMuted, fontFamily: C.sans }}>
						Start tracking in minutes. Free plan — 1 site, 50K events, no credit card. Your users will thank you. Silently. Because we don&apos;t track that.
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

				<p className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
					MIT license · © 2026 Traytic
				</p>
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

				const sitesRes = await fetch(`${API}/sites`, { credentials: "include" });
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
				<Features />
				<HowItWorks />
				<Pricing session={session} />
				<CTABanner session={session} />
			</main>
			<Footer />
		</div>
	);
}
