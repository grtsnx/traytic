"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { cn } from "@/lib/utils";

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
	bg: "oklch(0.08 0.006 265)",
	surface: "oklch(0.115 0.008 265)",
	surfaceElevated: "oklch(0.138 0.010 265)",
	border: "oklch(1 0 0 / 7%)",
	borderHover: "oklch(1 0 0 / 18%)",
	borderAccent: "oklch(0.62 0.22 265 / 28%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	textDim: "oklch(0.36 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentHover: "oklch(0.55 0.22 265)",
	accentText: "oklch(0.74 0.15 265)",
	accentBg: "oklch(0.62 0.22 265 / 8%)",
	accentBorder: "oklch(0.62 0.22 265 / 28%)",
	green: "oklch(0.72 0.17 145)",
	greenBg: "oklch(0.72 0.17 145 / 10%)",
	greenBorder: "oklch(0.72 0.17 145 / 28%)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

// ── Data ──────────────────────────────────────────────────────────────────────
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
		code: `$ npm install @traytic/analytics`,
	},
	{
		n: "02",
		title: "Add to your layout",
		desc: "Drop the component into your root layout. Configure your site ID and you're live.",
		code: `import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics siteId="YOUR_SITE_ID" />
      </body>
    </html>
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

const CHART_PTS = [28, 44, 32, 58, 72, 65, 91, 84, 108, 96, 124, 115, 142, 131, 158, 147, 172, 165, 186, 201, 194, 218, 209, 234];

// ── Live event feed data ───────────────────────────────────────────────────────
const LIVE_CITIES = ["San Francisco", "Lagos", "London", "Berlin", "Tokyo", "São Paulo", "Sydney", "Toronto", "Amsterdam", "Singapore", "Nairobi", "Dubai"];
const LIVE_PAGES = ["/dashboard", "/pricing", "/features", "/", "/docs", "/blog", "/changelog"];

function makeEvent() {
	return {
		id: Math.random(),
		city: LIVE_CITIES[Math.floor(Math.random() * LIVE_CITIES.length)],
		page: LIVE_PAGES[Math.floor(Math.random() * LIVE_PAGES.length)],
	};
}

// ── Components ─────────────────────────────────────────────────────────────────
function FadeIn({
	children,
	delay = 0,
	className,
	style,
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
	style?: React.CSSProperties;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: "-50px" });
	return (
		<motion.div
			ref={ref}
			className={className}
			style={style}
			initial={{ opacity: 0, y: 20 }}
			animate={inView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}>
			{children}
		</motion.div>
	);
}

function Tag({ children, green }: { children: string; green?: boolean }) {
	return (
		<span
			className="inline-block text-[10px] font-medium px-2.5 py-1 rounded-full tracking-widest uppercase"
			style={{
				backgroundColor: green ? C.greenBg : C.accentBg,
				color: green ? C.green : C.accentText,
				fontFamily: C.mono,
				border: `1px solid ${green ? C.greenBorder : C.accentBorder}`,
			}}>
			{children}
		</span>
	);
}

function GitHubIcon({ size = 14 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor">
			<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke={C.accent}
			strokeWidth="2.5"
			className="mt-0.5 shrink-0">
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

// ── Analytics chart ────────────────────────────────────────────────────────────
function AnalyticsChart() {
	const ref = useRef<SVGSVGElement>(null);
	const inView = useInView(ref, { once: true });

	const W = 560, H = 148;
	const PAD = { t: 12, r: 8, b: 28, l: 36 };
	const iW = W - PAD.l - PAD.r;
	const iH = H - PAD.t - PAD.b;
	const max = Math.max(...CHART_PTS);
	const min = Math.min(...CHART_PTS);
	const range = max - min;

	const pts = CHART_PTS.map((v, i) => ({
		x: PAD.l + (i / (CHART_PTS.length - 1)) * iW,
		y: PAD.t + (1 - (v - min) / range) * iH,
		v,
	}));

	const linePath = pts.reduce((p, pt, i) => {
		if (i === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
		const pr = pts[i - 1];
		const cp = (pt.x - pr.x) / 2;
		return `${p} C${(pr.x + cp).toFixed(1)},${pr.y.toFixed(1)} ${(pt.x - cp).toFixed(1)},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
	}, "");

	const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.t + iH} L${pts[0].x},${PAD.t + iH} Z`;
	const last = pts[pts.length - 1];
	const yTicks = [0, 0.5, 1].map((t) => ({ v: Math.round(min + t * range), y: PAD.t + (1 - t) * iH }));

	return (
		<svg
			ref={ref}
			viewBox={`0 0 ${W} ${H}`}
			className="w-full h-auto overflow-visible">
			<defs>
				<linearGradient
					id="aG"
					x1="0"
					y1="0"
					x2="0"
					y2="1">
					<stop
						offset="0%"
						stopColor="oklch(0.62 0.22 265)"
						stopOpacity="0.22"
					/>
					<stop
						offset="100%"
						stopColor="oklch(0.62 0.22 265)"
						stopOpacity="0"
					/>
				</linearGradient>
				<filter
					id="lg"
					x="-5%"
					y="-60%"
					width="110%"
					height="220%">
					<feGaussianBlur
						stdDeviation="2"
						result="b"
					/>
					<feMerge>
						<feMergeNode in="b" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			{yTicks.map((t, i) => (
				<g key={i}>
					<line
						x1={PAD.l}
						y1={t.y}
						x2={PAD.l + iW}
						y2={t.y}
						stroke="white"
						strokeOpacity="0.05"
						strokeWidth="1"
						strokeDasharray="3 3"
					/>
					<text
						x={PAD.l - 6}
						y={t.y + 4}
						textAnchor="end"
						fill="oklch(0.42 0 0)"
						fontSize="9"
						fontFamily={C.mono}>
						{t.v}
					</text>
				</g>
			))}
			{["Dec 1", "Dec 8", "Dec 15", "Dec 24"].map((label, i) => (
				<text
					key={i}
					x={PAD.l + (i / 3) * iW}
					y={H - 4}
					textAnchor="middle"
					fill="oklch(0.38 0 0)"
					fontSize="9"
					fontFamily={C.mono}>
					{label}
				</text>
			))}
			<motion.path
				d={areaPath}
				fill="url(#aG)"
				initial={{ opacity: 0 }}
				animate={inView ? { opacity: 1 } : {}}
				transition={{ duration: 0.8, delay: 0.7 }}
			/>
			<motion.path
				d={linePath}
				fill="none"
				stroke="oklch(0.64 0.22 265)"
				strokeWidth="1.75"
				strokeLinecap="round"
				filter="url(#lg)"
				initial={{ pathLength: 0, opacity: 0 }}
				animate={inView ? { pathLength: 1, opacity: 1 } : {}}
				transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
			/>
			<motion.circle
				cx={last.x}
				cy={last.y}
				r="3.5"
				fill="oklch(0.64 0.22 265)"
				filter="url(#lg)"
				initial={{ scale: 0, opacity: 0 }}
				animate={inView ? { scale: 1, opacity: 1 } : {}}
				transition={{ duration: 0.35, delay: 1.6, type: "spring", stiffness: 300 }}
			/>
			<motion.g
				initial={{ opacity: 0, y: 5 }}
				animate={inView ? { opacity: 1, y: 0 } : {}}
				transition={{ duration: 0.3, delay: 1.8 }}>
				<rect
					x={last.x - 26}
					y={last.y - 30}
					width="52"
					height="20"
					rx="5"
					fill="oklch(0.62 0.22 265)"
				/>
				<text
					x={last.x}
					y={last.y - 16}
					textAnchor="middle"
					fill="white"
					fontSize="9.5"
					fontWeight="600"
					fontFamily={C.mono}>
					234 pvs
				</text>
			</motion.g>
		</svg>
	);
}

// ── Live event feed ────────────────────────────────────────────────────────────
function LiveFeed() {
	const [events, setEvents] = useState(() => Array.from({ length: 4 }, makeEvent));

	useEffect(() => {
		const timer = setInterval(() => {
			setEvents((prev) => [makeEvent(), ...prev.slice(0, 3)]);
		}, 2200);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="space-y-1.5 mt-3">
			<AnimatePresence
				initial={false}
				mode="popLayout">
				{events.map((event) => (
					<motion.div
						key={event.id}
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, x: 12 }}
						transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
						className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
						style={{ backgroundColor: "oklch(1 0 0 / 4%)", border: `1px solid oklch(1 0 0 / 5%)` }}>
						<span
							className="text-[11px] truncate max-w-[110px]"
							style={{ color: C.textMuted, fontFamily: C.mono }}>
							{event.city}
						</span>
						<span
							className="text-[11px] ml-2"
							style={{ color: C.accentText, fontFamily: C.mono }}>
							{event.page}
						</span>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

// ── Bento card wrapper ─────────────────────────────────────────────────────────
function BentoCard({
	children,
	className,
	style,
	glow,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	glow?: boolean;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			className={cn("relative rounded-2xl p-6 flex flex-col transition-all duration-300 overflow-hidden", className)}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${hovered ? C.borderHover : C.border}`,
				boxShadow: hovered
					? glow
						? `0 0 0 1px ${C.accentBorder}, 0 8px 40px oklch(0.62 0.22 265 / 12%)`
						: `0 0 0 1px oklch(1 0 0 / 12%), 0 8px 32px oklch(0 0 0 / 35%)`
					: "none",
				...style,
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}>
			{/* Inner top glow line */}
			<div
				className="absolute inset-x-0 top-0 h-px pointer-events-none transition-opacity duration-300"
				style={{
					background: `linear-gradient(90deg, transparent, ${hovered ? C.accentBorder : "oklch(1 0 0 / 6%)"}, transparent)`,
					opacity: hovered ? 1 : 0.6,
				}}
			/>
			{children}
		</div>
	);
}

// ── Home ───────────────────────────────────────────────────────────────────────
export default function Home() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handler = () => setScrolled(window.scrollY > 24);
		window.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	}, []);

	return (
		<div
			style={{
				backgroundColor: C.bg,
				color: C.text,
				fontFamily: C.sans,
				minHeight: "100vh",
			}}>
			{/* ── Navbar ──────────────────────────────────────────────────────── */}
			<header
				className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300")}
				style={
					scrolled
						? {
								backgroundColor: "oklch(0.08 0.006 265 / 88%)",
								borderBottom: `1px solid ${C.border}`,
								backdropFilter: "blur(14px)",
							}
						: { borderBottom: "1px solid transparent" }
				}>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
					<div className="flex items-center gap-8">
						{/* Logo */}
						<a
							href="/"
							className="flex items-center gap-2.5">
							<span
								className="h-6 w-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white"
								style={{ backgroundColor: C.accent }}>
								T
							</span>
							<span
								className="text-[15px] font-semibold tracking-tight"
								style={{ color: C.text, fontFamily: C.display }}>
								Traytic
							</span>
						</a>
						{/* Nav links */}
						<nav className="hidden md:flex items-center">
							{["Features", "How it works", "Pricing"].map((item) => (
								<a
									key={item}
									href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
									className="px-3 py-2 text-[13px] transition-colors rounded-md"
									style={{ color: C.textMuted }}
									onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
									onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
									{item}
								</a>
							))}
						</nav>
					</div>
					{/* Right actions */}
					<div className="flex items-center gap-2">
						<a
							href="https://github.com/traytic/traytic"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all"
							style={{ borderColor: C.border, color: C.textMuted }}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = C.borderHover;
								e.currentTarget.style.color = C.text;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = C.border;
								e.currentTarget.style.color = C.textMuted;
							}}>
							<GitHubIcon />
							GitHub
						</a>
						<button
							className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all text-white"
							style={{ backgroundColor: C.accent }}
							onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.accentHover)}
							onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.accent)}>
							Get started
						</button>
					</div>
				</div>
			</header>

			{/* ── Hero ────────────────────────────────────────────────────────── */}
			<section className="relative pt-28 pb-16 overflow-hidden">
				{/* Grid background */}
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						backgroundImage: `linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)`,
						backgroundSize: "52px 52px",
					}}
				/>
				{/* Top glow */}
				<div
					className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
					style={{
						width: "900px",
						height: "480px",
						background: "radial-gradient(ellipse at center top, oklch(0.62 0.22 265 / 13%) 0%, transparent 62%)",
					}}
				/>

				<div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					{/* Badge */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45 }}
						className="inline-flex mb-6">
						<span
							className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border"
							style={{
								borderColor: C.accentBorder,
								color: C.accentText,
								backgroundColor: C.accentBg,
							}}>
							<span className="relative flex h-1.5 w-1.5">
								<span
									className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
									style={{ backgroundColor: C.accent }}
								/>
								<span
									className="relative inline-flex rounded-full h-1.5 w-1.5"
									style={{ backgroundColor: C.accent }}
								/>
							</span>
							Open source · MIT license · v0.1.0
						</span>
					</motion.div>

					{/* Headline — Acorn font */}
					<motion.h1
						initial={{ opacity: 0, y: 22 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.08 }}
						className="text-4xl sm:text-5xl lg:text-[3.875rem] font-bold tracking-tight leading-[1.08] mb-5"
						style={{ fontFamily: C.display }}>
						Analytics that respect
						<br />
						<span style={{ color: C.accent }}>your users&apos; privacy.</span>
					</motion.h1>

					{/* Subline */}
					<motion.p
						initial={{ opacity: 0, y: 22 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.16 }}
						className="max-w-lg mx-auto text-[15px] leading-relaxed mb-8"
						style={{ color: C.textMuted }}>
						Open-source, self-hostable analytics powered by ClickHouse. No cookies, no consent banners, no GDPR headaches. A true alternative to Vercel Analytics.
					</motion.p>

					{/* CTAs */}
					<motion.div
						initial={{ opacity: 0, y: 22 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.24 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
						<button
							className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all"
							style={{ backgroundColor: C.accent }}
							onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.accentHover)}
							onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.accent)}>
							Get started free →
						</button>
						<a
							href="https://github.com/traytic/traytic"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg border transition-all"
							style={{
								borderColor: C.border,
								color: C.textMuted,
								backgroundColor: "oklch(1 0 0 / 2%)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = C.borderHover;
								e.currentTarget.style.color = C.text;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = C.border;
								e.currentTarget.style.color = C.textMuted;
							}}>
							<GitHubIcon size={15} />
							View on GitHub
						</a>
					</motion.div>

					{/* Dashboard preview */}
					<motion.div
						initial={{ opacity: 0, y: 40, scale: 0.975 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.75, delay: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
						className="relative mx-auto max-w-3xl rounded-xl border overflow-hidden"
						style={{
							borderColor: C.border,
							backgroundColor: "oklch(0.115 0.008 265)",
							boxShadow: `0 0 0 1px oklch(1 0 0 / 4%), 0 24px 64px oklch(0 0 0 / 65%), 0 0 80px oklch(0.62 0.22 265 / 8%)`,
						}}>
						{/* Window chrome */}
						<div
							className="flex items-center gap-1.5 px-4 py-3 border-b"
							style={{ borderColor: C.border, backgroundColor: "oklch(0.10 0.006 265)" }}>
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: "oklch(0.65 0.21 27)" }}
							/>
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: "oklch(0.75 0.18 85)" }}
							/>
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: "oklch(0.65 0.22 145)" }}
							/>
							<div
								className="flex-1 mx-4 h-5 rounded text-[11px] flex items-center justify-center"
								style={{ backgroundColor: "oklch(1 0 0 / 4%)", color: "oklch(0.38 0 0)", fontFamily: C.mono }}>
								app.traytic.dev/sites/my-app
							</div>
							<div className="flex items-center gap-1.5">
								<span
									className="h-1.5 w-1.5 rounded-full"
									style={{ backgroundColor: "oklch(0.65 0.22 145)" }}
								/>
								<span
									className="text-[11px]"
									style={{ color: "oklch(0.45 0 0)", fontFamily: C.mono }}>
									4 live
								</span>
							</div>
						</div>

						{/* Stats + chart */}
						<div className="p-5">
							<div className="grid grid-cols-4 gap-2.5 mb-4">
								{[
									{ label: "Pageviews", value: "12,483", delta: "+18%", up: true },
									{ label: "Visitors", value: "4,291", delta: "+12%", up: true },
									{ label: "Bounce rate", value: "38.2%", delta: "−3.1%", up: false },
									{ label: "Avg. session", value: "2m 14s", delta: "+0:22", up: true },
								].map((stat, i) => (
									<div
										key={i}
										className="p-3 rounded-lg border"
										style={{ borderColor: C.border, backgroundColor: "oklch(0.138 0.010 265)" }}>
										<div
											className="text-[10px] mb-1 truncate"
											style={{ color: "oklch(0.42 0 0)", fontFamily: C.mono }}>
											{stat.label}
										</div>
										<div
											className="text-[15px] font-semibold"
											style={{ color: C.text, fontFamily: C.mono }}>
											{stat.value}
										</div>
										<div
											className="text-[10px] mt-0.5"
											style={{
												color: stat.up ? "oklch(0.65 0.18 145)" : "oklch(0.65 0.2 27)",
												fontFamily: C.mono,
											}}>
											{stat.delta}
										</div>
									</div>
								))}
							</div>

							{/* Chart card */}
							<div
								className="rounded-lg border p-4"
								style={{ borderColor: C.border, backgroundColor: "oklch(0.10 0.006 265)" }}>
								<div className="flex items-center justify-between mb-3">
									<span
										className="text-xs font-medium"
										style={{ color: "oklch(0.62 0 0)" }}>
										Pageviews — December 2024
									</span>
									<div className="flex items-center gap-1">
										{["7d", "30d", "90d"].map((t, i) => (
											<button
												key={t}
												className="text-[10px] px-2 py-0.5 rounded transition-colors"
												style={
													i === 1
														? {
																backgroundColor: "oklch(0.62 0.22 265 / 18%)",
																color: C.accentText,
																fontFamily: C.mono,
															}
														: { color: "oklch(0.38 0 0)", fontFamily: C.mono }
												}>
												{t}
											</button>
										))}
									</div>
								</div>
								<AnalyticsChart />
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* ── Features Bento Grid ──────────────────────────────────────────── */}
			<section
				id="features"
				className="py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<FadeIn className="text-center mb-14">
						<p
							className="text-xs uppercase tracking-widest mb-3"
							style={{ color: C.textDim, fontFamily: C.mono }}>
							Why Traytic
						</p>
						<h2
							className="text-3xl sm:text-4xl font-bold tracking-tight"
							style={{ fontFamily: C.display }}>
							Analytics the way it should be.
						</h2>
					</FadeIn>

					{/* Bento Grid */}
					<FadeIn>
						<div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
							style={{ gridAutoRows: "minmax(210px, auto)" }}>

							{/* ── Privacy (2×2) ──────────────────────────────────────── */}
							<BentoCard
								glow
								className="lg:col-span-2 lg:row-span-2"
								style={{ minHeight: "420px" }}>
								{/* Background shield watermark */}
								<div
									className="absolute -bottom-6 -right-6 pointer-events-none select-none"
									style={{ opacity: 0.035 }}>
									<svg
										width="220"
										height="220"
										viewBox="0 0 24 24"
										fill={C.accent}>
										<path d="M12 2L3 6v7c0 6 9 11 9 11s9-5 9-11V6L12 2z" />
									</svg>
								</div>

								<Tag>Privacy</Tag>

								{/* Shield visual */}
								<div className="flex items-start gap-5 mt-5 mb-5">
									<div className="relative shrink-0">
										<div
											className="absolute inset-0 rounded-2xl"
											style={{
												background: `radial-gradient(circle, ${C.accent} 0%, transparent 70%)`,
												opacity: 0.18,
												filter: "blur(16px)",
												transform: "scale(1.4)",
											}}
										/>
										<div
											className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
											style={{ backgroundColor: C.accentBg, border: `1px solid ${C.accentBorder}` }}>
											<svg
												width="26"
												height="26"
												viewBox="0 0 24 24"
												fill="none"
												stroke={C.accent}
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round">
												<path d="M12 2L3 6v7c0 6 9 11 9 11s9-5 9-11V6L12 2z" />
												<polyline
													points="9 12 11 14 15 10"
													strokeWidth="1.75"
												/>
											</svg>
										</div>
									</div>
									<div>
										<h3
											className="text-xl font-semibold leading-snug mb-2"
											style={{ color: C.text, fontFamily: C.display }}>
											No cookies.
											<br />
											No consent banners.
										</h3>
										<p
											className="text-[13px] leading-relaxed"
											style={{ color: C.textMuted }}>
											Privacy-first fingerprinting via daily-rotating SHA-256 hash of siteId + IP + UA. Visitor identity is ephemeral by design.
										</p>
									</div>
								</div>

								{/* Hash visualization */}
								<div
									className="rounded-xl p-3.5 mb-5 overflow-hidden"
									style={{ backgroundColor: "oklch(0.09 0.006 265)", border: `1px solid ${C.border}` }}>
									<div
										className="text-[10px] mb-2"
										style={{ color: C.textDim, fontFamily: C.mono }}>
										visitor_id = SHA256(siteId + ip + ua + date)
									</div>
									<div
										className="text-[11px] font-medium break-all leading-relaxed"
										style={{ color: C.accentText, fontFamily: C.mono }}>
										a3f8c2e1d4b7920f5e3a1c8d2b4f6e9a3c1d5b7e2f4a8c0d3b5f7e1a9c2d4b6
									</div>
									<div
										className="text-[10px] mt-2"
										style={{ color: C.textDim, fontFamily: C.mono }}>
										↳ rotates every 24h · never stored with PII
									</div>
								</div>

								{/* Compliance badges */}
								<div className="flex flex-wrap gap-2 mt-auto">
									{[
										{ label: "GDPR", text: "compliant" },
										{ label: "CCPA", text: "compliant" },
										{ label: "PECR", text: "compliant" },
									].map((badge) => (
										<span
											key={badge.label}
											className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium"
											style={{
												backgroundColor: C.greenBg,
												color: C.green,
												border: `1px solid ${C.greenBorder}`,
												fontFamily: C.mono,
											}}>
											<svg
												width="7"
												height="7"
												viewBox="0 0 8 8">
												<circle
													cx="4"
													cy="4"
													r="3"
													fill="currentColor"
												/>
											</svg>
											{badge.label} {badge.text}
										</span>
									))}
								</div>
							</BentoCard>

							{/* ── Real-time (1×2 tall) ────────────────────────────────── */}
							<BentoCard
								className="lg:row-span-2"
								style={{ minHeight: "420px" }}>
								<div className="flex items-center justify-between mb-4">
									<Tag>Real-time</Tag>
									{/* Live indicator */}
									<span
										className="flex items-center gap-1.5 text-[11px]"
										style={{ color: C.green, fontFamily: C.mono }}>
										<span className="relative flex h-1.5 w-1.5">
											<span
												className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
												style={{ backgroundColor: C.green }}
											/>
											<span
												className="relative inline-flex rounded-full h-1.5 w-1.5"
												style={{ backgroundColor: C.green }}
											/>
										</span>
										4 live
									</span>
								</div>

								<h3
									className="text-lg font-semibold leading-snug mb-1"
									style={{ color: C.text, fontFamily: C.display }}>
									Sub-second updates.
								</h3>
								<p
									className="text-[13px] leading-relaxed mb-4"
									style={{ color: C.textMuted }}>
									SSE pushes data the moment it hits the collector. No polling, no refresh.
								</p>

								{/* Live event stream */}
								<div
									className="flex-1 rounded-xl p-3 overflow-hidden"
									style={{ backgroundColor: "oklch(0.09 0.006 265)", border: `1px solid ${C.border}` }}>
									<div
										className="text-[10px] mb-2.5 flex items-center gap-1.5"
										style={{ color: C.textDim, fontFamily: C.mono }}>
										<span
											className="h-1 w-1 rounded-full"
											style={{ backgroundColor: C.green }}
										/>
										live stream
									</div>
									<LiveFeed />
								</div>

								{/* SSE badge */}
								<div
									className="mt-4 text-[11px] px-3 py-2 rounded-lg text-center"
									style={{ backgroundColor: C.accentBg, color: C.accentText, fontFamily: C.mono, border: `1px solid ${C.accentBorder}` }}>
									powered by Server-Sent Events + RxJS
								</div>
							</BentoCard>

							{/* ── Self-host (1×1) ─────────────────────────────────────── */}
							<BentoCard>
								<Tag>Self-hostable</Tag>
								<h3
									className="text-[15px] font-semibold mt-3 mb-1"
									style={{ color: C.text, fontFamily: C.display }}>
									Your infra. Your data.
								</h3>
								<p
									className="text-[12px] leading-relaxed mb-3"
									style={{ color: C.textMuted }}>
									One command to spin up the full stack.
								</p>

								{/* Docker code block */}
								<div
									className="rounded-lg p-3 text-[11px] mt-auto"
									style={{
										backgroundColor: "oklch(0.07 0.005 265)",
										border: `1px solid ${C.border}`,
										fontFamily: C.mono,
									}}>
									<div style={{ color: C.accentText }}>$ docker compose up -d</div>
									<div className="mt-2 space-y-1">
										{[
											{ name: "postgres", color: C.green },
											{ name: "clickhouse", color: C.green },
											{ name: "redis", color: C.green },
										].map((s) => (
											<div
												key={s.name}
												className="flex items-center gap-2">
												<span style={{ color: s.color }}>✓</span>
												<span style={{ color: C.textMuted }}>{s.name}</span>
												<span
													className="ml-auto"
													style={{ color: C.textDim }}>
													running
												</span>
											</div>
										))}
									</div>
								</div>
							</BentoCard>

							{/* ── Open Source (1×1) ───────────────────────────────────── */}
							<BentoCard>
								<Tag>Open source</Tag>
								<h3
									className="text-[15px] font-semibold mt-3 mb-1"
									style={{ color: C.text, fontFamily: C.display }}>
									MIT licensed. Audit everything.
								</h3>
								<p
									className="text-[12px] leading-relaxed"
									style={{ color: C.textMuted }}>
									Full source on GitHub. No telemetry, no hidden calls home.
								</p>

								<div className="flex items-center gap-2 mt-auto pt-3">
									<div
										className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
										style={{
											backgroundColor: "oklch(1 0 0 / 4%)",
											border: `1px solid ${C.border}`,
											color: C.textMuted,
											fontFamily: C.mono,
										}}>
										<GitHubIcon size={12} />
										traytic/traytic
									</div>
									<span
										className="text-[10px] px-2 py-1 rounded"
										style={{ backgroundColor: C.accentBg, color: C.accentText, fontFamily: C.mono }}>
										MIT
									</span>
								</div>
							</BentoCard>

							{/* ── ClickHouse (1×1) ────────────────────────────────────── */}
							<BentoCard>
								{/* Background watermark */}
								<div
									className="absolute inset-0 flex items-end justify-end p-4 pointer-events-none select-none"
									style={{ opacity: 0.04 }}>
									<svg
										width="80"
										height="80"
										viewBox="0 0 24 24"
										fill={C.accent}>
										<ellipse
											cx="12"
											cy="5"
											rx="9"
											ry="3"
										/>
										<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
										<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
									</svg>
								</div>
								<Tag>ClickHouse</Tag>
								{/* Big metric */}
								<div className="flex-1 flex flex-col justify-center text-center py-3">
									<div
										className="text-5xl font-bold tabular-nums leading-none mb-1"
										style={{ color: C.text, fontFamily: C.display }}>
										&lt;1ms
									</div>
									<div
										className="text-xs"
										style={{ color: C.textMuted }}>
										average query time at p99
									</div>
								</div>
								<p
									className="text-[12px] leading-relaxed"
									style={{ color: "oklch(0.44 0 0)" }}>
									Columnar storage purpose-built for analytics. Billions of events, instant GROUP BY.
								</p>
							</BentoCard>

							{/* ── SDK (full width 3×1) ────────────────────────────────── */}
							<BentoCard
								className="lg:col-span-3"
								glow>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
									<div className="flex items-center gap-3">
										<Tag>SDK</Tag>
										<span
											className="text-[11px] px-2.5 py-1 rounded-full font-medium"
											style={{
												backgroundColor: C.greenBg,
												color: C.green,
												border: `1px solid ${C.greenBorder}`,
												fontFamily: C.mono,
											}}>
											&lt;3kb gzip
										</span>
									</div>
									<div className="flex gap-2">
										{["Next.js", "React", "Edge Runtime"].map((f) => (
											<span
												key={f}
												className="text-[10px] px-2 py-0.5 rounded"
												style={{
													backgroundColor: "oklch(1 0 0 / 4%)",
													color: C.textMuted,
													border: `1px solid ${C.border}`,
													fontFamily: C.mono,
												}}>
												{f} ✓
											</span>
										))}
									</div>
								</div>

								<h3
									className="text-[15px] font-semibold mb-4"
									style={{ color: C.text, fontFamily: C.display }}>
									One import, then you&apos;re done.
								</h3>

								{/* Two-column code layout */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{/* Install */}
									<div>
										<div
											className="text-[10px] mb-1.5 uppercase tracking-wider"
											style={{ color: C.textDim, fontFamily: C.mono }}>
											Install
										</div>
										<div
											className="rounded-lg p-3"
											style={{
												backgroundColor: "oklch(0.07 0.005 265)",
												border: `1px solid ${C.border}`,
												fontFamily: C.mono,
											}}>
											<span
												className="text-[12px]"
												style={{ color: C.accentText }}>
												$ npm install @traytic/analytics
											</span>
										</div>
									</div>
									{/* Usage */}
									<div>
										<div
											className="text-[10px] mb-1.5 uppercase tracking-wider"
											style={{ color: C.textDim, fontFamily: C.mono }}>
											Usage
										</div>
										<div
											className="rounded-lg p-3"
											style={{
												backgroundColor: "oklch(0.07 0.005 265)",
												border: `1px solid ${C.border}`,
												fontFamily: C.mono,
											}}>
											<pre
												className="text-[11px] leading-relaxed"
												style={{ color: "oklch(0.70 0 0)" }}>
												{`import { Analytics } from '@traytic/analytics/next'
// Add to your root layout:
<Analytics siteId="YOUR_SITE_ID" />`}
											</pre>
										</div>
									</div>
								</div>
							</BentoCard>
						</div>
					</FadeIn>
				</div>
			</section>

			{/* ── How it works ────────────────────────────────────────────────── */}
			<section
				id="how-it-works"
				className="py-24 border-y"
				style={{ borderColor: C.border, backgroundColor: "oklch(0.105 0.007 265)" }}>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<FadeIn className="text-center mb-14">
						<p
							className="text-xs uppercase tracking-widest mb-3"
							style={{ color: C.textDim, fontFamily: C.mono }}>
							Setup in minutes
						</p>
						<h2
							className="text-3xl sm:text-4xl font-bold tracking-tight"
							style={{ fontFamily: C.display }}>
							From zero to live in 3 steps.
						</h2>
					</FadeIn>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						{STEPS.map((step, i) => (
							<FadeIn
								key={i}
								delay={i * 0.1}>
								<div
									className="p-6 rounded-xl border h-full"
									style={{ borderColor: C.border, backgroundColor: C.surface }}>
									<div className="flex items-center gap-3 mb-3">
										<span
											className="text-sm font-bold tabular-nums"
											style={{ color: C.accent, fontFamily: C.mono }}>
											{step.n}
										</span>
										<h3
											className="text-sm font-semibold"
											style={{ color: "oklch(0.86 0 0)", fontFamily: C.display }}>
											{step.title}
										</h3>
									</div>
									<p
										className="text-[13px] leading-relaxed mb-4"
										style={{ color: C.textMuted }}>
										{step.desc}
									</p>
									{step.code && (
										<div
											className="rounded-lg p-3 text-[12px] overflow-x-auto"
											style={{
												backgroundColor: "oklch(0.07 0.005 265)",
												border: `1px solid ${C.border}`,
												fontFamily: C.mono,
												color: "oklch(0.72 0 0)",
												whiteSpace: "pre",
												lineHeight: "1.65",
											}}>
											{step.code}
										</div>
									)}
									{!step.code && (
										<div
											className="rounded-lg p-4 flex items-center justify-center gap-2.5"
											style={{ backgroundColor: "oklch(0.07 0.005 265)", border: `1px solid ${C.border}` }}>
											<span className="relative flex h-2 w-2">
												<span
													className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
													style={{ backgroundColor: C.accent }}
												/>
												<span
													className="relative inline-flex rounded-full h-2 w-2"
													style={{ backgroundColor: C.accent }}
												/>
											</span>
											<span
												className="text-xs"
												style={{ color: C.accentText, fontFamily: C.mono }}>
												Live data streaming...
											</span>
										</div>
									)}
								</div>
							</FadeIn>
						))}
					</div>
				</div>
			</section>

			{/* ── Pricing ─────────────────────────────────────────────────────── */}
			<section
				id="pricing"
				className="py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<FadeIn className="text-center mb-14">
						<p
							className="text-xs uppercase tracking-widest mb-3"
							style={{ color: C.textDim, fontFamily: C.mono }}>
							Pricing
						</p>
						<h2
							className="text-3xl sm:text-4xl font-bold tracking-tight"
							style={{ fontFamily: C.display }}>
							No surprises. No lock-in.
						</h2>
						<p
							className="mt-3 text-sm"
							style={{ color: C.textMuted }}>
							Self-host forever for free, or use our managed cloud.
						</p>
					</FadeIn>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{PLANS.map((plan, i) => (
							<FadeIn
								key={i}
								delay={i * 0.08}>
								<div
									className="relative flex flex-col p-6 rounded-xl border h-full"
									style={{
										borderColor: plan.highlight ? C.accentBorder : C.border,
										backgroundColor: plan.highlight ? "oklch(0.62 0.22 265 / 5%)" : C.surface,
										boxShadow: plan.highlight ? `0 0 48px oklch(0.62 0.22 265 / 10%)` : undefined,
									}}>
									{/* Top glow line on highlighted plan */}
									{plan.highlight && (
										<div
											className="absolute inset-x-0 top-0 h-px"
											style={{
												background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
												opacity: 0.6,
											}}
										/>
									)}
									{plan.highlight && (
										<div
											className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[11px] font-medium rounded-full text-white"
											style={{ backgroundColor: C.accent }}>
											Most popular
										</div>
									)}

									<div className="mb-5">
										<div
											className="text-[11px] font-semibold uppercase tracking-wider mb-3"
											style={{
												color: plan.highlight ? C.accentText : C.textMuted,
												fontFamily: C.mono,
											}}>
											{plan.name}
										</div>
										<div className="flex items-baseline gap-1 mb-1.5">
											<span
												className="text-[32px] font-bold tabular-nums leading-none"
												style={{ color: C.text, fontFamily: C.display }}>
												${plan.price}
											</span>
											<span
												className="text-sm"
												style={{ color: C.textDim }}>
												{plan.period}
											</span>
										</div>
										<p
											className="text-[13px] leading-relaxed"
											style={{ color: "oklch(0.46 0 0)" }}>
											{plan.desc}
										</p>
									</div>

									<ul className="flex-1 space-y-2.5 mb-6">
										{plan.features.map((f, j) => (
											<li
												key={j}
												className="flex items-start gap-2 text-[13px]"
												style={{ color: "oklch(0.62 0 0)" }}>
												<CheckIcon />
												{f}
											</li>
										))}
									</ul>

									<button
										className="w-full py-2 text-sm font-medium rounded-lg border transition-all"
										style={
											plan.highlight
												? { backgroundColor: C.accent, borderColor: C.accent, color: "white" }
												: { borderColor: C.border, color: "oklch(0.68 0 0)", backgroundColor: "transparent" }
										}
										onMouseEnter={(e) => {
											if (plan.highlight) {
												e.currentTarget.style.backgroundColor = C.accentHover;
											} else {
												e.currentTarget.style.borderColor = C.borderHover;
												e.currentTarget.style.color = C.text;
											}
										}}
										onMouseLeave={(e) => {
											if (plan.highlight) {
												e.currentTarget.style.backgroundColor = C.accent;
											} else {
												e.currentTarget.style.borderColor = C.border;
												e.currentTarget.style.color = "oklch(0.68 0 0)";
											}
										}}>
										{plan.cta}
									</button>
								</div>
							</FadeIn>
						))}
					</div>

					<FadeIn
						delay={0.3}
						className="mt-5 text-center text-xs"
						style={{ color: C.textDim }}>
						All cloud plans include a 14-day free trial. No credit card required. Cancel anytime.
						<br />
						<span style={{ color: "oklch(0.4 0 0)" }}>NGN / GHS / KES / ZAR pricing available via Paystack for African markets.</span>
					</FadeIn>
				</div>
			</section>

			{/* ── CTA banner ──────────────────────────────────────────────────── */}
			<section
				className="py-20 border-t"
				style={{ borderColor: C.border }}>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<FadeIn>
						<div
							className="relative rounded-2xl p-10 sm:p-14 text-center overflow-hidden"
							style={{
								backgroundColor: C.surface,
								border: `1px solid ${C.border}`,
							}}>
							{/* Glow */}
							<div
								className="absolute inset-0 pointer-events-none"
								style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.62 0.22 265 / 10%) 0%, transparent 55%)" }}
							/>
							<div
								className="absolute inset-x-0 top-0 h-px"
								style={{ background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, opacity: 0.4 }}
							/>

							<div className="relative">
								<h2
									className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
									style={{ fontFamily: C.display }}>
									Ready to drop the consent banner?
								</h2>
								<p
									className="text-sm mb-8"
									style={{ color: C.textMuted }}>
									Start tracking in minutes. Your first 1M events are always free.
								</p>
								<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
									<button
										className="px-6 py-2.5 text-sm font-medium rounded-lg text-white transition-all"
										style={{ backgroundColor: C.accent }}
										onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.accentHover)}
										onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.accent)}>
										Get started free →
									</button>
									<a
										href="https://github.com/traytic/traytic"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 text-sm transition-colors"
										style={{ color: "oklch(0.5 0 0)" }}
										onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.75 0 0)")}
										onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.5 0 0)")}>
										<GitHubIcon size={14} />
										Star on GitHub
									</a>
								</div>
							</div>
						</div>
					</FadeIn>
				</div>
			</section>

			{/* ── Footer ──────────────────────────────────────────────────────── */}
			<footer
				className="py-8 border-t"
				style={{ borderColor: C.border }}>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2.5">
						<span
							className="h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center text-white"
							style={{ backgroundColor: C.accent }}>
							T
						</span>
						<span
							className="text-[15px] font-semibold"
							style={{ color: "oklch(0.55 0 0)", fontFamily: C.display }}>
							Traytic
						</span>
						<span
							className="text-xs"
							style={{ color: C.textDim }}>
							· Open source analytics
						</span>
					</div>
					<div
						className="flex items-center gap-5 text-xs"
						style={{ color: C.textDim }}>
						{["Docs", "GitHub", "Twitter", "Privacy"].map((link) => (
							<a
								key={link}
								href="#"
								className="transition-colors"
								onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.68 0 0)")}
								onMouseLeave={(e) => (e.currentTarget.style.color = C.textDim)}>
								{link}
							</a>
						))}
					</div>
					<div
						className="text-xs"
						style={{ color: "oklch(0.33 0 0)", fontFamily: C.mono }}>
						MIT license · © {new Date().getFullYear()} Traytic
					</div>
				</div>
			</footer>
		</div>
	);
}
