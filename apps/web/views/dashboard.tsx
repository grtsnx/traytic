"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
	bg: "oklch(0.08 0.006 265)",
	bgDeep: "oklch(0.055 0.008 265)",
	surface: "oklch(0.115 0.008 265)",
	surfaceHover: "oklch(0.135 0.010 265)",
	border: "oklch(1 0 0 / 7%)",
	borderEl: "oklch(1 0 0 / 11%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	textFaint: "oklch(0.32 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentDim: "oklch(0.50 0.18 265)",
	accentText: "oklch(0.74 0.15 265)",
	accentBg: "oklch(0.62 0.22 265 / 8%)",
	accentBorder: "oklch(0.62 0.22 265 / 25%)",
	green: "oklch(0.72 0.17 145)",
	greenBg: "oklch(0.72 0.17 145 / 10%)",
	greenBorder: "oklch(0.72 0.17 145 / 22%)",
	greenText: "oklch(0.76 0.15 145)",
	red: "oklch(0.65 0.2 25)",
	redBg: "oklch(0.65 0.2 25 / 10%)",
	redText: "oklch(0.70 0.18 25)",
	orange: "oklch(0.78 0.16 55)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

// ── Mock data ──────────────────────────────────────────────────────────────────

const VISITORS_30D = [
	1240, 1180, 1580, 1320, 1890, 2100, 1760, 2340, 2180, 2670,
	2450, 2890, 3100, 2780, 3240, 3010, 3560, 3290, 3780, 4100,
	3850, 4320, 4010, 4580, 4290, 4870, 5100, 4760, 5380, 5640,
];

const PAGEVIEWS_30D = VISITORS_30D.map((v, i) => Math.round(v * (3.0 + Math.sin(i * 0.7) * 0.4)));

const PREV_VISITORS = VISITORS_30D.slice(0, 15).reduce((a, b) => a + b, 0);
const CURR_VISITORS = VISITORS_30D.slice(15).reduce((a, b) => a + b, 0);

const TOP_PAGES = [
	{ path: "/", title: "Home", visitors: 8420, pageviews: 12840, bounce: 38 },
	{ path: "/pricing", title: "Pricing", visitors: 3280, pageviews: 4120, bounce: 52 },
	{ path: "/docs", title: "Documentation", visitors: 2940, pageviews: 6780, bounce: 24 },
	{ path: "/blog/getting-started", title: "Getting Started", visitors: 1840, pageviews: 2190, bounce: 61 },
	{ path: "/changelog", title: "Changelog", visitors: 1290, pageviews: 1780, bounce: 44 },
	{ path: "/blog/privacy-analytics", title: "Privacy Analytics", visitors: 980, pageviews: 1240, bounce: 58 },
	{ path: "/integrations", title: "Integrations", visitors: 740, pageviews: 980, bounce: 47 },
];

const TOP_SOURCES = [
	{ source: "Direct", visitors: 9840, pct: 35.2, color: C.accentText },
	{ source: "google.com", visitors: 7230, pct: 25.9, color: C.green },
	{ source: "github.com", visitors: 3410, pct: 12.2, color: C.orange },
	{ source: "twitter.com", visitors: 2180, pct: 7.8, color: "#1DA1F2" },
	{ source: "news.ycombinator.com", visitors: 1920, pct: 6.9, color: "#FF6600" },
	{ source: "dev.to", visitors: 1240, pct: 4.4, color: C.textMuted },
	{ source: "reddit.com", visitors: 980, pct: 3.5, color: "#FF4500" },
];

const DEVICES = [
	{ name: "Desktop", pct: 67, color: C.accent },
	{ name: "Mobile", pct: 28, color: C.green },
	{ name: "Tablet", pct: 5, color: C.orange },
];

const COUNTRIES = [
	{ name: "United States", flag: "🇺🇸", visitors: 8420, pct: 30.1 },
	{ name: "United Kingdom", flag: "🇬🇧", visitors: 3280, pct: 11.7 },
	{ name: "Germany", flag: "🇩🇪", visitors: 2940, pct: 10.5 },
	{ name: "India", flag: "🇮🇳", visitors: 2180, pct: 7.8 },
	{ name: "Canada", flag: "🇨🇦", visitors: 1840, pct: 6.6 },
	{ name: "Nigeria", flag: "🇳🇬", visitors: 1290, pct: 4.6 },
	{ name: "France", flag: "🇫🇷", visitors: 980, pct: 3.5 },
];

// ── Chart helpers ──────────────────────────────────────────────────────────────

function makeSmoothPath(data: number[], w: number, h: number, padX = 0, padY = 12) {
	const usableW = w - padX * 2;
	const usableH = h - padY * 2;
	const max = Math.max(...data) * 1.12;
	const pts = data.map((v, i) => ({
		x: padX + (i / (data.length - 1)) * usableW,
		y: padY + usableH - (v / max) * usableH,
	}));
	const line = pts.reduce((acc: string, p, i) => {
		if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
		const prev = pts[i - 1];
		const cpx = ((prev.x + p.x) / 2).toFixed(1);
		return `${acc} C${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
	}, "");
	const bottomY = (padY + usableH).toFixed(1);
	const area = `${line} L${(padX + usableW).toFixed(1)},${bottomY} L${padX.toFixed(1)},${bottomY} Z`;
	const gridYValues = [0, 0.25, 0.5, 0.75, 1].map((p) => (padY + usableH - p * usableH).toFixed(1));
	const lastPt = pts[pts.length - 1];
	return { line, area, gridYValues, lastPt };
}

function makeSparkPath(data: number[], w: number, h: number): string {
	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;
	const pts = data.map((v, i) => ({
		x: (i / (data.length - 1)) * w,
		y: h - ((v - min) / range) * h * 0.9 - h * 0.05,
	}));
	return pts.reduce((acc: string, p, i) => {
		if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
		const prev = pts[i - 1];
		const cpx = ((prev.x + p.x) / 2).toFixed(1);
		return `${acc} C${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
	}, "");
}

function fmt(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return String(n);
}

// ── Utility components ─────────────────────────────────────────────────────────

function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<rect width="24" height="24" rx="6" fill={C.accent} />
			<rect x="4" y="14.5" width="4" height="5" rx="1" fill="white" fillOpacity="0.55" />
			<rect x="10" y="11" width="4" height="8.5" rx="1" fill="white" fillOpacity="0.8" />
			<rect x="16" y="7.5" width="4" height="12" rx="1" fill="white" />
			<circle cx="18" cy="6.5" r="1.2" fill={C.green} />
		</svg>
	);
}

function Sparkline({ data, color, up }: { data: number[]; color: string; up: boolean }) {
	const path = makeSparkPath(data, 60, 24);
	return (
		<svg width="60" height="24" viewBox="0 0 60 24" style={{ display: "block" }}>
			<path
				d={path}
				fill="none"
				stroke={color || (up ? C.green : C.red)}
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function TrendBadge({ value, good }: { value: string; good: boolean }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "3px",
				fontSize: "11px",
				fontFamily: C.mono,
				fontWeight: "600",
				padding: "2px 7px",
				borderRadius: "5px",
				backgroundColor: good ? C.greenBg : C.redBg,
				color: good ? C.greenText : C.redText,
				border: `1px solid ${good ? C.greenBorder : C.redBg}`,
			}}>
			{good ? "↑" : "↓"} {value}
		</span>
	);
}

// ── Realtime counter ───────────────────────────────────────────────────────────

function RealtimeCounter() {
	const [count, setCount] = useState(47);
	useEffect(() => {
		const t = setInterval(() => {
			setCount((c) => Math.max(1, c + Math.floor(Math.random() * 5) - 2));
		}, 3200);
		return () => clearInterval(t);
	}, []);
	return (
		<motion.span
			key={count}
			initial={{ y: -8, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			style={{
				fontFamily: C.mono,
				fontSize: "20px",
				fontWeight: "700",
				color: C.text,
				letterSpacing: "-0.04em",
				display: "inline-block",
			}}>
			{count}
		</motion.span>
	);
}

// ── Metric card ────────────────────────────────────────────────────────────────

function MetricCard({
	label,
	value,
	change,
	good,
	sparkData,
	unit,
	delay,
}: {
	label: string;
	value: string;
	change: string;
	good: boolean;
	sparkData: number[];
	unit?: string;
	delay: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "14px",
				padding: "20px 22px",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
			}}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<span
					style={{
						fontFamily: C.mono,
						fontSize: "10px",
						color: C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.08em",
					}}>
					{label}
				</span>
				<Sparkline data={sparkData} color={good ? C.green : C.red} up={good} />
			</div>
			<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px" }}>
				<div>
					<span
						style={{
							fontFamily: C.mono,
							fontSize: "28px",
							fontWeight: "700",
							color: C.text,
							letterSpacing: "-0.05em",
							lineHeight: "1",
						}}>
						{value}
					</span>
					{unit && (
						<span style={{ fontFamily: C.mono, fontSize: "13px", color: C.textMuted, marginLeft: "4px" }}>
							{unit}
						</span>
					)}
				</div>
				<TrendBadge value={change} good={good} />
			</div>
			<div
				style={{
					fontFamily: C.mono,
					fontSize: "10px",
					color: C.textFaint,
					textTransform: "uppercase",
					letterSpacing: "0.06em",
				}}>
				vs previous 15 days
			</div>
		</motion.div>
	);
}

// ── Main chart ─────────────────────────────────────────────────────────────────

function MainChart({ period }: { period: string }) {
	const w = 800;
	const h = 200;
	const { line: visLine, area: visArea, gridYValues, lastPt } = makeSmoothPath(VISITORS_30D, w, h);
	const { line: pvLine } = makeSmoothPath(PAGEVIEWS_30D, w, h);

	const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
	const labels: string[] = [];
	const now = new Date();
	for (let i = days - 1; i >= 0; i -= Math.ceil(days / 6)) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "16px",
				padding: "22px 24px",
			}}>
			{/* Chart header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "20px",
				}}>
				<div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<span
							style={{
								width: "10px",
								height: "3px",
								borderRadius: "2px",
								backgroundColor: C.accent,
								display: "inline-block",
							}}
						/>
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>Visitors</span>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<span
							style={{
								width: "10px",
								height: "3px",
								borderRadius: "2px",
								backgroundColor: C.accentDim,
								display: "inline-block",
								opacity: 0.5,
							}}
						/>
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>Pageviews</span>
					</div>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span
						style={{
							width: "6px",
							height: "6px",
							borderRadius: "50%",
							backgroundColor: C.green,
							boxShadow: `0 0 8px ${C.green}`,
							display: "inline-block",
						}}
					/>
					<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.green }}>
						Last updated just now
					</span>
				</div>
			</div>

			{/* SVG Chart */}
			<div style={{ position: "relative", width: "100%" }}>
				<svg
					viewBox={`0 0 ${w} ${h}`}
					width="100%"
					height="200"
					preserveAspectRatio="none"
					style={{ display: "block", overflow: "visible" }}>
					<defs>
						<linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={C.accent} stopOpacity="0.22" />
							<stop offset="100%" stopColor={C.accent} stopOpacity="0.01" />
						</linearGradient>
						<linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={C.accentDim} stopOpacity="0.08" />
							<stop offset="100%" stopColor={C.accentDim} stopOpacity="0.0" />
						</linearGradient>
						<clipPath id="chartClip">
							<rect x="0" y="0" width={w} height={h} />
						</clipPath>
					</defs>

					{/* Horizontal grid */}
					{gridYValues.map((y) => (
						<line
							key={y}
							x1="0"
							y1={y}
							x2={w}
							y2={y}
							stroke="oklch(1 0 0 / 5%)"
							strokeWidth="1"
						/>
					))}

					{/* Pageviews area (behind) */}
					<path d={pvLine + ` L${w},${h} L0,${h} Z`} fill="url(#pvGrad)" clipPath="url(#chartClip)" />
					<path d={pvLine} fill="none" stroke={C.accentDim} strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" clipPath="url(#chartClip)" />

					{/* Visitors area */}
					<path d={visArea} fill="url(#visGrad)" clipPath="url(#chartClip)" />

					{/* Visitors line — animates in */}
					<motion.path
						d={visLine}
						fill="none"
						stroke={C.accent}
						strokeWidth="2"
						strokeLinecap="round"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
						clipPath="url(#chartClip)"
					/>

					{/* Live dot at end */}
					<circle cx={lastPt.x} cy={lastPt.y} r="4" fill={C.accent} />
					<circle cx={lastPt.x} cy={lastPt.y} r="8" fill={C.accent} fillOpacity="0.15">
						<animate attributeName="r" values="5;12;5" dur="3s" repeatCount="indefinite" />
						<animate attributeName="fill-opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
					</circle>
				</svg>

				{/* X-axis labels */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginTop: "8px",
						paddingLeft: "0",
					}}>
					{labels.map((l) => (
						<span key={l} style={{ fontFamily: C.mono, fontSize: "10px", color: C.textFaint }}>
							{l}
						</span>
					))}
				</div>
			</div>
		</motion.div>
	);
}

// ── Top pages table ────────────────────────────────────────────────────────────

function TopPagesTable() {
	const maxVisitors = TOP_PAGES[0].visitors;
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "16px",
				overflow: "hidden",
			}}>
			<div
				style={{
					padding: "18px 20px",
					borderBottom: `1px solid ${C.border}`,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}>
				<span
					style={{
						fontFamily: C.mono,
						fontSize: "11px",
						color: C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.08em",
					}}>
					Top pages
				</span>
				<div style={{ display: "flex", gap: "16px" }}>
					{["Visitors", "Bounce"].map((h) => (
						<span
							key={h}
							style={{
								fontFamily: C.mono,
								fontSize: "10px",
								color: C.textFaint,
								textTransform: "uppercase",
								letterSpacing: "0.06em",
							}}>
							{h}
						</span>
					))}
				</div>
			</div>
			<div>
				{TOP_PAGES.map((page, i) => (
					<div
						key={page.path}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "11px 20px",
							borderBottom: i < TOP_PAGES.length - 1 ? `1px solid ${C.border}` : "none",
							gap: "12px",
						}}>
						{/* Bar */}
						<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
							<div
								style={{
									position: "absolute",
									inset: 0,
									backgroundColor: C.accentBg,
									borderRadius: "3px",
									width: `${(page.visitors / maxVisitors) * 100}%`,
									transition: "width 0.6s ease",
								}}
							/>
							<div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "1px", padding: "4px 0" }}>
								<span style={{ fontFamily: C.sans, fontSize: "13px", color: C.text, fontWeight: "500" }}>
									{page.title}
								</span>
								<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted }}>{page.path}</span>
							</div>
						</div>
						{/* Visitors */}
						<span
							style={{
								fontFamily: C.mono,
								fontSize: "13px",
								color: C.text,
								fontWeight: "600",
								minWidth: "52px",
								textAlign: "right",
							}}>
							{fmt(page.visitors)}
						</span>
						{/* Bounce */}
						<span
							style={{
								fontFamily: C.mono,
								fontSize: "12px",
								color: page.bounce > 50 ? C.redText : C.textMuted,
								minWidth: "40px",
								textAlign: "right",
							}}>
							{page.bounce}%
						</span>
					</div>
				))}
			</div>
		</motion.div>
	);
}

// ── Top sources table ──────────────────────────────────────────────────────────

function TopSourcesTable() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "16px",
				overflow: "hidden",
			}}>
			<div
				style={{
					padding: "18px 20px",
					borderBottom: `1px solid ${C.border}`,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}>
				<span
					style={{
						fontFamily: C.mono,
						fontSize: "11px",
						color: C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.08em",
					}}>
					Top sources
				</span>
				<span
					style={{
						fontFamily: C.mono,
						fontSize: "10px",
						color: C.textFaint,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
					}}>
					Visitors
				</span>
			</div>
			<div>
				{TOP_SOURCES.map((src, i) => (
					<div
						key={src.source}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "12px 20px",
							borderBottom: i < TOP_SOURCES.length - 1 ? `1px solid ${C.border}` : "none",
							gap: "12px",
						}}>
						{/* Color dot */}
						<span
							style={{
								width: "7px",
								height: "7px",
								borderRadius: "50%",
								backgroundColor: src.color,
								flexShrink: 0,
							}}
						/>
						{/* Source name + bar */}
						<div style={{ flex: 1, position: "relative" }}>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									bottom: 0,
									width: `${src.pct}%`,
									backgroundColor: `${src.color}14`,
									borderRadius: "3px",
								}}
							/>
							<span
								style={{
									position: "relative",
									fontFamily: C.sans,
									fontSize: "13px",
									color: C.text,
									fontWeight: "500",
								}}>
								{src.source}
							</span>
						</div>
						{/* Pct */}
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, minWidth: "38px", textAlign: "right" }}>
							{src.pct}%
						</span>
						{/* Count */}
						<span style={{ fontFamily: C.mono, fontSize: "13px", color: C.text, fontWeight: "600", minWidth: "48px", textAlign: "right" }}>
							{fmt(src.visitors)}
						</span>
					</div>
				))}
			</div>
		</motion.div>
	);
}

// ── Devices breakdown ──────────────────────────────────────────────────────────

function DevicesBreakdown() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "16px",
				padding: "20px",
			}}>
			<span
				style={{
					fontFamily: C.mono,
					fontSize: "11px",
					color: C.textMuted,
					textTransform: "uppercase",
					letterSpacing: "0.08em",
					display: "block",
					marginBottom: "20px",
				}}>
				Devices
			</span>
			<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
				{DEVICES.map((d) => (
					<div key={d.name}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "6px",
							}}>
							<span style={{ fontFamily: C.sans, fontSize: "13px", color: C.text }}>{d.name}</span>
							<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, fontWeight: "600" }}>
								{d.pct}%
							</span>
						</div>
						<div
							style={{
								height: "5px",
								backgroundColor: C.bg,
								borderRadius: "3px",
								overflow: "hidden",
							}}>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${d.pct}%` }}
								transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
								style={{
									height: "100%",
									backgroundColor: d.color,
									borderRadius: "3px",
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</motion.div>
	);
}

// ── Countries breakdown ────────────────────────────────────────────────────────

function CountriesBreakdown() {
	const max = COUNTRIES[0].pct;
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "16px",
				overflow: "hidden",
			}}>
			<div
				style={{
					padding: "18px 20px",
					borderBottom: `1px solid ${C.border}`,
				}}>
				<span
					style={{
						fontFamily: C.mono,
						fontSize: "11px",
						color: C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.08em",
					}}>
					Countries
				</span>
			</div>
			<div>
				{COUNTRIES.map((c, i) => (
					<div
						key={c.name}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "10px 20px",
							borderBottom: i < COUNTRIES.length - 1 ? `1px solid ${C.border}` : "none",
							gap: "10px",
						}}>
						<span style={{ fontSize: "14px", flexShrink: 0 }}>{c.flag}</span>
						<div style={{ flex: 1, position: "relative" }}>
							<div
								style={{
									position: "absolute",
									inset: 0,
									backgroundColor: C.accentBg,
									borderRadius: "3px",
									width: `${(c.pct / max) * 100}%`,
								}}
							/>
							<span
								style={{
									position: "relative",
									fontFamily: C.sans,
									fontSize: "12px",
									color: C.text,
									display: "block",
									padding: "2px 0",
								}}>
								{c.name}
							</span>
						</div>
						<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, minWidth: "34px", textAlign: "right" }}>
							{c.pct}%
						</span>
						<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.text, fontWeight: "600", minWidth: "44px", textAlign: "right" }}>
							{fmt(c.visitors)}
						</span>
					</div>
				))}
			</div>
		</motion.div>
	);
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ id: "overview", label: "Overview", icon: "▦" },
	{ id: "realtime", label: "Realtime", icon: "◉", live: true },
	{ id: "pages", label: "Pages", icon: "⊟" },
	{ id: "sources", label: "Sources", icon: "⊞" },
	{ id: "devices", label: "Devices", icon: "⊡" },
	{ id: "goals", label: "Goals", icon: "◎" },
];

function Sidebar({
	active,
	onNav,
	liveCount,
	onLogout,
	onClose,
}: {
	active: string;
	onNav: (id: string) => void;
	liveCount: number;
	onLogout: () => void;
	onClose?: () => void;
}) {
	return (
		<div
			style={{
				width: "220px",
				flexShrink: 0,
				backgroundColor: C.bgDeep,
				borderRight: `1px solid ${C.border}`,
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				position: "sticky",
				top: 0,
				overflowY: "auto",
			}}>
		{/* Logo */}
		<div
			style={{
				padding: "20px 20px",
				borderBottom: `1px solid ${C.border}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}>
			<Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
				<LogoMark size={28} />
				<span
					style={{
						fontFamily: C.display,
						fontSize: "15px",
						fontWeight: "700",
						color: C.text,
						letterSpacing: "-0.02em",
					}}>
					Traytic
				</span>
			</Link>
			{onClose && (
				<button
					onClick={onClose}
					aria-label="Close menu"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "28px",
						height: "28px",
						borderRadius: "6px",
						background: "none",
						border: `1px solid ${C.border}`,
						color: C.textMuted,
						cursor: "pointer",
					}}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			)}
		</div>

			{/* Site selector */}
			<div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "8px 10px",
						borderRadius: "8px",
						backgroundColor: C.surface,
						border: `1px solid ${C.border}`,
						cursor: "pointer",
					}}>
					<div
						style={{
							width: "18px",
							height: "18px",
							borderRadius: "4px",
							backgroundColor: C.accent,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}>
						<span style={{ fontSize: "8px", color: "#fff", fontWeight: "700" }}>M</span>
					</div>
					<span
						style={{
							fontFamily: C.sans,
							fontSize: "12px",
							color: C.text,
							flex: 1,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}>
						mystartup.com
					</span>
					<span style={{ color: C.textMuted, fontSize: "10px" }}>▾</span>
				</div>
			</div>

			{/* Live count */}
			<div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
					<span
						style={{
							width: "7px",
							height: "7px",
							borderRadius: "50%",
							backgroundColor: C.green,
							boxShadow: `0 0 8px ${C.green}`,
							flexShrink: 0,
						}}
					/>
					<span
						style={{
							fontFamily: C.mono,
							fontSize: "10px",
							color: C.green,
							textTransform: "uppercase",
							letterSpacing: "0.08em",
						}}>
						Live right now
					</span>
				</div>
				<RealtimeCounter />
				<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted, marginTop: "2px", display: "block" }}>
					active visitors
				</span>
			</div>

			{/* Nav */}
			<nav style={{ padding: "10px 10px", flex: 1 }}>
				{NAV_ITEMS.map((item) => (
					<button
						key={item.id}
						onClick={() => onNav(item.id)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							width: "100%",
							padding: "9px 12px",
							borderRadius: "8px",
							backgroundColor: active === item.id ? C.surface : "transparent",
							border: active === item.id ? `1px solid ${C.border}` : "1px solid transparent",
							color: active === item.id ? C.text : C.textMuted,
							fontFamily: C.sans,
							fontSize: "13px",
							fontWeight: active === item.id ? "500" : "400",
							cursor: "pointer",
							transition: "all 0.12s",
							textAlign: "left",
							marginBottom: "2px",
						}}>
						<span style={{ fontSize: "12px", opacity: 0.7, flexShrink: 0 }}>{item.icon}</span>
						<span style={{ flex: 1 }}>{item.label}</span>
						{item.live && (
							<span
								style={{
									fontSize: "9px",
									backgroundColor: C.greenBg,
									color: C.greenText,
									border: `1px solid ${C.greenBorder}`,
									padding: "1px 5px",
									borderRadius: "4px",
									fontFamily: C.mono,
									textTransform: "uppercase",
									letterSpacing: "0.06em",
								}}>
								Live
							</span>
						)}
					</button>
				))}
			</nav>

		{/* Upgrade CTA */}
		<div
			style={{
				padding: "14px",
				margin: "0 10px 14px",
				borderRadius: "10px",
				backgroundColor: C.accentBg,
				border: `1px solid ${C.accentBorder}`,
			}}>
			<p
				style={{
					fontFamily: C.sans,
					fontSize: "12px",
					color: C.accentText,
					marginBottom: "10px",
					lineHeight: "1.5",
				}}>
				Add more sites and unlock higher limits.
			</p>
			<Link
				href="/upgrade?plan=pro"
				style={{
					display: "block",
					padding: "7px 12px",
					borderRadius: "7px",
					backgroundColor: C.accent,
					color: "#fff",
					fontFamily: C.sans,
					fontSize: "12px",
					fontWeight: "600",
					textDecoration: "none",
					textAlign: "center",
				}}>
				Upgrade to Pro →
			</Link>
		</div>

		{/* Logout */}
		<div style={{ padding: "0 10px 14px" }}>
			<button
				onClick={onLogout}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					width: "100%",
					padding: "9px 12px",
					borderRadius: "8px",
					backgroundColor: "transparent",
					border: `1px solid ${C.border}`,
					color: C.textMuted,
					fontFamily: C.sans,
					fontSize: "13px",
					cursor: "pointer",
					transition: "all 0.12s",
					textAlign: "left",
				}}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
					<polyline points="16 17 21 12 16 7" />
					<line x1="21" y1="12" x2="9" y2="12" />
				</svg>
				Log out
			</button>
		</div>
	</div>
	);
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

const PERIODS = ["7d", "30d", "90d"] as const;
type Period = (typeof PERIODS)[number];

export default function Dashboard() {
	const [activeNav, setActiveNav] = useState("overview");
	const [period, setPeriod] = useState<Period>("30d");
	const [liveCount] = useState(47);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);

	const handleLogout = useCallback(async () => {
		setLoggingOut(true);
		try {
			await fetch(`${API}/api/auth/sign-out`, {
				method: "POST",
				credentials: "include",
			});
		} catch {
			// proceed regardless
		}
		window.location.href = "/";
	}, []);

	const handleNav = useCallback((id: string) => {
		setActiveNav(id);
		setSidebarOpen(false);
	}, []);

	const visitorTotal = VISITORS_30D.reduce((a, b) => a + b, 0);
	const pvTotal = PAGEVIEWS_30D.reduce((a, b) => a + b, 0);
	const visChange = (((CURR_VISITORS - PREV_VISITORS) / PREV_VISITORS) * 100).toFixed(1);
	const sparkVisitors = VISITORS_30D.slice(-8);
	const sparkPV = PAGEVIEWS_30D.slice(-8);

	return (
		<div style={{ display: "flex", minHeight: "100vh", backgroundColor: C.bg }}>
			{/* Desktop sidebar */}
			<div className="hidden lg:flex" style={{ flexShrink: 0 }}>
				<Sidebar active={activeNav} onNav={setActiveNav} liveCount={liveCount} onLogout={handleLogout} />
			</div>

			{/* Mobile sidebar overlay */}
			<AnimatePresence>
				{sidebarOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => setSidebarOpen(false)}
							className="lg:hidden"
							style={{
								position: "fixed",
								inset: 0,
								zIndex: 40,
								backgroundColor: "oklch(0 0 0 / 60%)",
							}}
						/>
						<motion.div
							initial={{ x: -280 }}
							animate={{ x: 0 }}
							exit={{ x: -280 }}
							transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
							className="lg:hidden"
							style={{
								position: "fixed",
								top: 0,
								left: 0,
								bottom: 0,
								zIndex: 50,
							}}>
							<Sidebar
								active={activeNav}
								onNav={handleNav}
								liveCount={liveCount}
								onLogout={handleLogout}
								onClose={() => setSidebarOpen(false)}
							/>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Main */}
			<div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
				{/* Top bar */}
				<div
					className="px-4 sm:px-7"
					style={{
						position: "sticky",
						top: 0,
						zIndex: 10,
						backgroundColor: `${C.bg}e8`,
						backdropFilter: "blur(16px)",
						borderBottom: `1px solid ${C.border}`,
						padding: "14px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px",
					}}>
					{/* Hamburger for mobile */}
					<button
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden"
						aria-label="Open menu"
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "36px",
							height: "36px",
							borderRadius: "8px",
							backgroundColor: C.surface,
							border: `1px solid ${C.border}`,
							cursor: "pointer",
							flexShrink: 0,
						}}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round">
							<line x1="3" y1="6" x2="21" y2="6" />
							<line x1="3" y1="12" x2="21" y2="12" />
							<line x1="3" y1="18" x2="21" y2="18" />
						</svg>
					</button>

					<div style={{ minWidth: 0 }}>
						<h1
							style={{
								fontFamily: C.display,
								fontSize: "18px",
								fontWeight: "700",
								color: C.text,
								letterSpacing: "-0.025em",
								lineHeight: "1",
								marginBottom: "2px",
							}}>
							Overview
						</h1>
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>
							mystartup.com
						</span>
					</div>

					{/* Period selector */}
					<div
						style={{
							display: "flex",
							backgroundColor: C.bgDeep,
							borderRadius: "9px",
							padding: "3px",
							border: `1px solid ${C.border}`,
							flexShrink: 0,
						}}>
						{PERIODS.map((p) => (
							<button
								key={p}
								onClick={() => setPeriod(p)}
								className="px-2 sm:px-3.5"
								style={{
									paddingTop: "6px",
									paddingBottom: "6px",
									borderRadius: "7px",
									fontSize: "12px",
									fontWeight: period === p ? "600" : "400",
									fontFamily: C.mono,
									backgroundColor: period === p ? C.surface : "transparent",
									color: period === p ? C.text : C.textMuted,
									border: period === p ? `1px solid ${C.border}` : "1px solid transparent",
									cursor: "pointer",
									transition: "all 0.12s",
									letterSpacing: "0.02em",
								}}>
								{p}
							</button>
						))}
					</div>
				</div>

				{/* Content */}
				<div className="p-4 sm:p-7">
					{/* Metric cards */}
					<div
						className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
						<MetricCard
							label="Unique visitors"
							value={fmt(visitorTotal)}
							change={`${visChange}%`}
							good={parseFloat(visChange) > 0}
							sparkData={sparkVisitors}
							delay={0.05}
						/>
						<MetricCard
							label="Pageviews"
							value={fmt(pvTotal)}
							change="8.7%"
							good={true}
							sparkData={sparkPV}
							delay={0.1}
						/>
						<MetricCard
							label="Bounce rate"
							value="42.3"
							unit="%"
							change="3.2%"
							good={true}
							sparkData={[58, 54, 56, 52, 49, 46, 44, 42]}
							delay={0.15}
						/>
						<MetricCard
							label="Avg. session"
							value="2:47"
							change="0:18"
							good={true}
							sparkData={[148, 152, 155, 162, 158, 165, 170, 167]}
							delay={0.2}
						/>
					</div>

					{/* Main chart */}
					<div style={{ marginBottom: "20px" }}>
						<MainChart period={period} />
					</div>

					{/* Tables row */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
						<TopPagesTable />
						<TopSourcesTable />
					</div>

					{/* Breakdown row */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
						<DevicesBreakdown />
						<CountriesBreakdown />
					</div>
				</div>
			</div>

			{/* Logging out overlay */}
			<AnimatePresence>
				{loggingOut && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						style={{
							position: "fixed",
							inset: 0,
							zIndex: 100,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: `${C.bg}e8`,
							backdropFilter: "blur(8px)",
						}}>
						<span style={{ fontFamily: C.mono, fontSize: "14px", color: C.textMuted }}>
							Logging out…
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
