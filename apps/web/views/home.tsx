"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

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
	period: string;
	desc: string;
	features: string[];
	cta: string;
	highlight: boolean;
};

const PLANS: Plan[] = [
	{
		name: "Free",
		price: "0",
		period: "forever",
		desc: "Self-host on your own servers. Full control, zero cost, MIT licensed.",
		features: ["Unlimited events", "Unlimited sites", "Real-time dashboard", "Full REST API", "Community support"],
		cta: "Start self-hosting",
		highlight: false,
	},
	{
		name: "Pro",
		price: "9",
		period: "/ month",
		desc: "Managed cloud. We handle infra, uptime, and backups. You ship products.",
		features: ["Everything in Free", "Managed cloud hosting", "5M events / month", "Email & Slack alerts", "Priority email support"],
		cta: "Start free trial",
		highlight: true,
	},
	{
		name: "Team",
		price: "29",
		period: "/ month",
		desc: "For teams that need scale, more seats, and dedicated support.",
		features: ["Everything in Pro", "Unlimited team seats", "50M events / month", "Custom goals & funnels", "Dedicated support"],
		cta: "Start free trial",
		highlight: false,
	},
];

type Step = { n: string; title: string; desc: string; code: string | null };
const STEPS: Step[] = [
	{
		n: "01",
		title: "Install the SDK",
		desc: "One command. Sub-3kb gzipped. Works with npm, yarn, pnpm, or bun.",
		code: "npm install @traytic/analytics",
	},
	{
		n: "02",
		title: "Add to your layout",
		desc: "Drop the component into your root layout. Configure your site ID and you're done.",
		code: `import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Analytics siteId="YOUR_SITE_ID" />
    </body></html>
  )
}`,
	},
	{
		n: "03",
		title: "See it live",
		desc: "Open the dashboard. Real-time data streams in the moment your first visitor lands.",
		code: null,
	},
];

type Feature = { icon: string; title: string; desc: string; tag: string };
const FEATURES: Feature[] = [
	{
		icon: "⬡",
		title: "No cookies. No consent banners.",
		desc: "Privacy fingerprinting via SHA-256 hash of site ID, IP, user-agent, and date. Fully GDPR, CCPA, and PECR compliant.",
		tag: "Privacy-first",
	},
	{
		icon: "◎",
		title: "Real-time, sub-second updates.",
		desc: "SSE-powered live dashboard via RxJS. See every pageview the moment it happens — no polling, no delay.",
		tag: "Real-time",
	},
	{
		icon: "▣",
		title: "Self-hostable in one command.",
		desc: "Run on your own infra with Docker. Postgres + ClickHouse + Redis. MIT licensed. You own your data.",
		tag: "Self-hostable",
	},
	{
		icon: "◈",
		title: "Open source, forever.",
		desc: "Every line of code is public on GitHub. Audit it, fork it, contribute to it. No black boxes.",
		tag: "Open source",
	},
];

const NAV_LINKS: Array<{ label: string; href: string }> = [
	{ label: "Features", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Pricing", href: "#pricing" },
];

const PROOF_ITEMS: string[] = ["No cookies", "GDPR compliant", "Self-hostable", "<3kb SDK"];
const FOOTER_LINKS: string[] = ["Docs", "GitHub", "Twitter", "Privacy"];

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

// ── Nav ────────────────────────────────────────────────────────────────────────
function Nav() {
	return (
		<header
			className="fixed top-0 left-0 right-0 z-50"
			style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: `${C.bg}ee`, backdropFilter: "blur(12px)" }}>
			<div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
				<a href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
					<div
						className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold"
						style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.mono }}>
						T
					</div>
					<span className="text-[14px] font-semibold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
						Traytic
					</span>
				</a>

				<nav className="hidden md:flex items-center gap-1">
					{NAV_LINKS.map((item: { label: string; href: string }) => (
						<a
							key={item.href}
							href={item.href}
							className="px-3 py-1.5 text-[13px] rounded-md transition-colors"
							style={{
								color: C.textMuted,
								fontFamily: C.sans,
								textDecoration: "none",
								// CSS var trick — hover handled via Tailwind arbitrary
								"--hover-text": C.text,
							} as React.CSSProperties}>
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
				</nav>

				<a
					href="#pricing"
					className="px-4 py-1.5 text-[13px] font-medium rounded-md transition-opacity hover:opacity-90"
					style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
					Get started
				</a>
			</div>
		</header>
	);
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
	return (
		<section className="pt-32 pb-24 px-6">
			<div className="max-w-3xl mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
					className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase"
					style={{
						border: `1px solid ${C.accentBorder}`,
						backgroundColor: C.accentBg,
						color: C.accentText,
						fontFamily: C.mono,
					}}>
					<span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green, boxShadow: `0 0 6px ${C.green}` }} />
					Open source · MIT license · v0.1.0
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
					className="text-[48px] sm:text-[60px] font-bold leading-[1.08] tracking-tight mb-5"
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
					Privacy-first, real-time web analytics. No cookies, no consent banners, no tracking scripts.
					Self-hostable and open source.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
					className="flex flex-wrap items-center justify-center gap-3">
					<a
						href="#pricing"
						className="px-6 py-3 text-[14px] font-semibold rounded-lg transition-opacity hover:opacity-90"
						style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
						Get started free →
					</a>
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
					className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[12px]"
					style={{ color: C.textMuted, fontFamily: C.mono }}>
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
function Pricing() {
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
						14-day free trial on all paid plans. No credit card required.
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
									<div className="flex items-baseline gap-1.5 mb-3">
										<span className="text-[40px] font-bold leading-none" style={{ color: C.text, fontFamily: C.display }}>
											${plan.price}
										</span>
										<span className="text-[13px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
											{plan.period}
										</span>
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

								<a
									href="#"
									className="w-full py-2.5 text-[13px] font-semibold rounded-lg transition-opacity hover:opacity-90 text-center"
									style={{
										backgroundColor: plan.highlight ? C.accent : "transparent",
										color: plan.highlight ? "#fff" : C.text,
										border: `1px solid ${plan.highlight ? C.accent : C.border}`,
										fontFamily: C.sans,
										textDecoration: "none",
										display: "block",
									}}>
									{plan.cta}
								</a>
							</div>
						</FadeIn>
					))}
				</div>

				<FadeIn delay={0.3}>
					<p className="mt-6 text-center text-[12px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
						African markets (NG/GH/KE/ZA): plans available in NGN, GHS, KES, ZAR via Paystack.
					</p>
				</FadeIn>
			</div>
		</section>
	);
}

// ── CTA Banner ─────────────────────────────────────────────────────────────────
function CTABanner() {
	return (
		<section
			className="py-20 px-6 text-center"
			style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
			<div className="max-w-2xl mx-auto">
				<FadeIn>
					<h2 className="text-[36px] font-bold tracking-tight mb-4" style={{ color: C.text, fontFamily: C.display }}>
						Ready to drop the consent banner?
					</h2>
					<p className="text-[15px] mb-8" style={{ color: C.textMuted, fontFamily: C.sans }}>
						Start tracking in minutes. Your first 1M events are always free.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<a
							href="#pricing"
							className="px-6 py-3 text-[14px] font-semibold rounded-lg transition-opacity hover:opacity-90"
							style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
							Get started free →
						</a>
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
					<div
						className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
						style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.mono }}>
						T
					</div>
					<span className="text-[13px] font-medium" style={{ color: C.textMuted, fontFamily: C.display }}>
						Traytic · Open source analytics
					</span>
				</div>

				<div className="flex items-center gap-4">
					{FOOTER_LINKS.map((link) => (
						<a
							key={link}
							href="#"
							className="text-[12px] transition-opacity hover:opacity-80"
							style={{ color: C.textMuted, fontFamily: C.sans, textDecoration: "none" }}>
							{link}
						</a>
					))}
				</div>

				<p className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
					MIT license · © 2026 Traytic
				</p>
			</div>
		</footer>
	);
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Home() {
	return (
		<div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
			<Nav />
			<main>
				<Hero />
				<Features />
				<HowItWorks />
				<Pricing />
				<CTABanner />
			</main>
			<Footer />
		</div>
	);
}
