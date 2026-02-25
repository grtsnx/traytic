"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

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

// ── API types ──────────────────────────────────────────────────────────────────

type SiteData = { id: string; name: string; domain: string; apiKey: string; orgId: string };
type OverviewData = { visitors: string; pageviews: string; avg_duration_ms: string; bounce_rate: string };
type TimeseriesRow = { date: string; visitors: string; pageviews: string };
type PageRow = { path: string; pageviews: string; visitors: string };
type SourceRow = { source: string; visitors: string };
type DeviceRow = { device_type: string; visitors: string };
type CountryRow = { country: string; visitors: string };

const SOURCE_COLORS = [C.accentText, C.green, C.orange, "#1DA1F2", "#FF6600", C.textMuted, "#FF4500", C.accent, C.red];

// ── Chart helpers ──────────────────────────────────────────────────────────────

function makeSmoothPath(data: number[], w: number, h: number, padX = 0, padY = 12) {
	if (data.length === 0) return { line: "", area: "", gridYValues: [] as string[], lastPt: { x: 0, y: h } };
	const usableW = w - padX * 2;
	const usableH = h - padY * 2;
	const max = Math.max(...data) * 1.12 || 1;
	const pts = data.map((v, i) => ({
		x: padX + (i / Math.max(data.length - 1, 1)) * usableW,
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
	if (data.length < 2) return "";
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

function fmtDuration(ms: number): string {
	const totalSec = Math.round(ms / 1000);
	const m = Math.floor(totalSec / 60);
	const s = totalSec % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Utility components ─────────────────────────────────────────────────────────

function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<rect width="24" height="24" rx="7" fill={C.accent} />
			<path d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="19.5" cy="8.5" r="1.5" fill={C.green} />
		</svg>
	);
}

function Spinner({ size = 16 }: { size?: number }) {
	return (
		<svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
			<circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
			<path d="M12 2a10 10 0 0 1 10 10" />
		</svg>
	);
}

function Sparkline({ data, color, up }: { data: number[]; color: string; up: boolean }) {
	const path = makeSparkPath(data, 60, 24);
	if (!path) return null;
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

function EmptyState({ message }: { message: string }) {
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			padding: "60px 20px",
			textAlign: "center",
		}}>
			<div style={{
				width: "56px",
				height: "56px",
				borderRadius: "50%",
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				marginBottom: "16px",
			}}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round">
					<path d="M3 3v18h18" />
					<path d="M7 16l4-4 4 4 5-6" />
				</svg>
			</div>
			<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, maxWidth: "300px", lineHeight: 1.5 }}>
				{message}
			</p>
		</div>
	);
}

// ── Realtime counter ───────────────────────────────────────────────────────────

function RealtimeCounter({ count }: { count: number }) {
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
	sparkData,
	unit,
	delay,
}: {
	label: string;
	value: string;
	sparkData: number[];
	unit?: string;
	delay: number;
}) {
	const up = sparkData.length >= 2 ? sparkData[sparkData.length - 1] >= sparkData[0] : true;
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
				{sparkData.length >= 2 && (
					<Sparkline data={sparkData} color={up ? C.green : C.red} up={up} />
				)}
			</div>
			<div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
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
		</motion.div>
	);
}

// ── Main chart ─────────────────────────────────────────────────────────────────

function MainChart({ timeseries }: { timeseries: TimeseriesRow[] }) {
	const visitors = timeseries.map((r) => Number(r.visitors));
	const pageviews = timeseries.map((r) => Number(r.pageviews));

	if (visitors.length === 0) {
		return (
			<div style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "16px",
				padding: "22px 24px",
			}}>
				<EmptyState message="No data yet. Once your tracking snippet captures events, the chart will appear here." />
			</div>
		);
	}

	const w = 800;
	const h = 200;
	const { line: visLine, area: visArea, gridYValues, lastPt } = makeSmoothPath(visitors, w, h);
	const { line: pvLine } = makeSmoothPath(pageviews, w, h);

	const labelCount = Math.min(timeseries.length, 6);
	const step = Math.max(1, Math.floor(timeseries.length / labelCount));
	const labels = timeseries.filter((_, i) => i % step === 0 || i === timeseries.length - 1).map((r) => {
		const d = new Date(r.date);
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	});

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
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "20px",
				}}>
				<div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<span style={{ width: "10px", height: "3px", borderRadius: "2px", backgroundColor: C.accent, display: "inline-block" }} />
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>Visitors</span>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<span style={{ width: "10px", height: "3px", borderRadius: "2px", backgroundColor: C.accentDim, display: "inline-block", opacity: 0.5 }} />
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>Pageviews</span>
					</div>
				</div>
			</div>

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

					{gridYValues.map((y) => (
						<line key={y} x1="0" y1={y} x2={w} y2={y} stroke="oklch(1 0 0 / 5%)" strokeWidth="1" />
					))}

					{pvLine && (
						<>
							<path d={pvLine + ` L${w},${h} L0,${h} Z`} fill="url(#pvGrad)" clipPath="url(#chartClip)" />
							<path d={pvLine} fill="none" stroke={C.accentDim} strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" clipPath="url(#chartClip)" />
						</>
					)}

					<path d={visArea} fill="url(#visGrad)" clipPath="url(#chartClip)" />

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

					<circle cx={lastPt.x} cy={lastPt.y} r="4" fill={C.accent} />
					<circle cx={lastPt.x} cy={lastPt.y} r="8" fill={C.accent} fillOpacity="0.15">
						<animate attributeName="r" values="5;12;5" dur="3s" repeatCount="indefinite" />
						<animate attributeName="fill-opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
					</circle>
				</svg>

				<div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
					{labels.map((l, i) => (
						<span key={`${l}-${i}`} style={{ fontFamily: C.mono, fontSize: "10px", color: C.textFaint }}>
							{l}
						</span>
					))}
				</div>
			</div>
		</motion.div>
	);
}

// ── Top pages table ────────────────────────────────────────────────────────────

function TopPagesTable({ pages }: { pages: PageRow[] }) {
	if (pages.length === 0) return null;
	const maxVisitors = Math.max(...pages.map((p) => Number(p.visitors)));
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
				<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
					Top pages
				</span>
				<div style={{ display: "flex", gap: "16px" }}>
					{["Visitors", "Views"].map((h) => (
						<span key={h} style={{ fontFamily: C.mono, fontSize: "10px", color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>
							{h}
						</span>
					))}
				</div>
			</div>
			<div>
				{pages.map((page, i) => (
					<div
						key={page.path}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "11px 20px",
							borderBottom: i < pages.length - 1 ? `1px solid ${C.border}` : "none",
							gap: "12px",
						}}>
						<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
							<div
								style={{
									position: "absolute",
									inset: 0,
									backgroundColor: C.accentBg,
									borderRadius: "3px",
									width: `${(Number(page.visitors) / maxVisitors) * 100}%`,
									transition: "width 0.6s ease",
								}}
							/>
							<div style={{ position: "relative", padding: "4px 0" }}>
								<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.text }}>{page.path}</span>
							</div>
						</div>
						<span style={{ fontFamily: C.mono, fontSize: "13px", color: C.text, fontWeight: "600", minWidth: "52px", textAlign: "right" }}>
							{fmt(Number(page.visitors))}
						</span>
						<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, minWidth: "48px", textAlign: "right" }}>
							{fmt(Number(page.pageviews))}
						</span>
					</div>
				))}
			</div>
		</motion.div>
	);
}

// ── Top sources table ──────────────────────────────────────────────────────────

function TopSourcesTable({ sources }: { sources: SourceRow[] }) {
	if (sources.length === 0) return null;
	const total = sources.reduce((a, s) => a + Number(s.visitors), 0);
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
				<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
					Top sources
				</span>
				<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>
					Visitors
				</span>
			</div>
			<div>
				{sources.map((src, i) => {
					const pct = total > 0 ? ((Number(src.visitors) / total) * 100).toFixed(1) : "0";
					const color = SOURCE_COLORS[i % SOURCE_COLORS.length];
					return (
						<div
							key={src.source || "direct"}
							style={{
								display: "flex",
								alignItems: "center",
								padding: "12px 20px",
								borderBottom: i < sources.length - 1 ? `1px solid ${C.border}` : "none",
								gap: "12px",
							}}>
							<span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
							<div style={{ flex: 1, position: "relative" }}>
								<div
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										bottom: 0,
										width: `${pct}%`,
										backgroundColor: `${color}14`,
										borderRadius: "3px",
									}}
								/>
								<span style={{ position: "relative", fontFamily: C.sans, fontSize: "13px", color: C.text, fontWeight: "500" }}>
									{src.source || "Direct / None"}
								</span>
							</div>
							<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, minWidth: "38px", textAlign: "right" }}>
								{pct}%
							</span>
							<span style={{ fontFamily: C.mono, fontSize: "13px", color: C.text, fontWeight: "600", minWidth: "48px", textAlign: "right" }}>
								{fmt(Number(src.visitors))}
							</span>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
}

// ── Devices breakdown ──────────────────────────────────────────────────────────

function DevicesBreakdown({ devices }: { devices: DeviceRow[] }) {
	if (devices.length === 0) return null;
	const total = devices.reduce((a, d) => a + Number(d.visitors), 0);
	const deviceColors: Record<string, string> = { Desktop: C.accent, Mobile: C.green, Tablet: C.orange };
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
				{devices.map((d) => {
					const pct = total > 0 ? Math.round((Number(d.visitors) / total) * 100) : 0;
					const color = deviceColors[d.device_type] || C.textMuted;
					return (
						<div key={d.device_type}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
								<span style={{ fontFamily: C.sans, fontSize: "13px", color: C.text }}>{d.device_type || "Unknown"}</span>
								<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, fontWeight: "600" }}>{pct}%</span>
							</div>
							<div style={{ height: "5px", backgroundColor: C.bg, borderRadius: "3px", overflow: "hidden" }}>
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${pct}%` }}
									transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
									style={{ height: "100%", backgroundColor: color, borderRadius: "3px" }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
}

// ── Countries breakdown ────────────────────────────────────────────────────────

function CountriesBreakdown({ countries }: { countries: CountryRow[] }) {
	if (countries.length === 0) return null;
	const total = countries.reduce((a, c) => a + Number(c.visitors), 0);
	const maxPct = total > 0 ? (Number(countries[0].visitors) / total) * 100 : 0;
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
			<div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
				<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
					Countries
				</span>
			</div>
			<div>
				{countries.slice(0, 10).map((c, i) => {
					const pct = total > 0 ? ((Number(c.visitors) / total) * 100).toFixed(1) : "0";
					return (
						<div
							key={c.country}
							style={{
								display: "flex",
								alignItems: "center",
								padding: "10px 20px",
								borderBottom: i < Math.min(countries.length, 10) - 1 ? `1px solid ${C.border}` : "none",
								gap: "10px",
							}}>
							<div style={{ flex: 1, position: "relative" }}>
								<div
									style={{
										position: "absolute",
										inset: 0,
										backgroundColor: C.accentBg,
										borderRadius: "3px",
										width: maxPct > 0 ? `${(Number(pct) / maxPct) * 100}%` : "0%",
									}}
								/>
								<span style={{ position: "relative", fontFamily: C.sans, fontSize: "12px", color: C.text, display: "block", padding: "2px 0" }}>
									{c.country}
								</span>
							</div>
							<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, minWidth: "34px", textAlign: "right" }}>
								{pct}%
							</span>
							<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.text, fontWeight: "600", minWidth: "44px", textAlign: "right" }}>
								{fmt(Number(c.visitors))}
							</span>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
}

// ── Site selector ──────────────────────────────────────────────────────────────

function SiteSelector({
	sites,
	activeSite,
	onSelect,
	onDelete,
}: {
	sites: SiteData[];
	activeSite: SiteData | null;
	onSelect: (site: SiteData) => void;
	onDelete: (site: SiteData) => void;
}) {
	const [open, setOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
				setConfirmDelete(null);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div ref={ref} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, position: "relative" }}>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					width: "100%",
					padding: "8px 10px",
					borderRadius: "8px",
					backgroundColor: C.surface,
					border: `1px solid ${C.border}`,
					cursor: "pointer",
					textAlign: "left",
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
					<span style={{ fontSize: "8px", color: "#fff", fontWeight: "700" }}>
						{activeSite?.name?.[0]?.toUpperCase() ?? "?"}
					</span>
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
					{activeSite?.domain ?? "Select site"}
				</span>
				<span style={{ color: C.textMuted, fontSize: "10px" }}>▾</span>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15 }}
						style={{
							position: "absolute",
							top: "100%",
							left: "14px",
							right: "14px",
							zIndex: 50,
							backgroundColor: C.surface,
							border: `1px solid ${C.borderEl}`,
							borderRadius: "10px",
							overflow: "hidden",
							boxShadow: "0 8px 24px oklch(0 0 0 / 30%)",
						}}>
						{sites.map((site) => (
							<div
								key={site.id}
								style={{
									display: "flex",
									alignItems: "center",
									padding: "10px 12px",
									borderBottom: `1px solid ${C.border}`,
									gap: "8px",
								}}>
								<button
									type="button"
									onClick={() => { onSelect(site); setOpen(false); setConfirmDelete(null); }}
									style={{
										flex: 1,
										display: "flex",
										alignItems: "center",
										gap: "8px",
										background: "none",
										border: "none",
										cursor: "pointer",
										padding: 0,
										textAlign: "left",
									}}>
									<div
										style={{
											width: "14px",
											height: "14px",
											borderRadius: "3px",
											backgroundColor: site.id === activeSite?.id ? C.accent : C.bg,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}>
										{site.id === activeSite?.id && (
											<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
												<polyline points="20 6 9 17 4 12" />
											</svg>
										)}
									</div>
									<div>
										<span style={{ fontFamily: C.sans, fontSize: "12px", color: C.text, display: "block" }}>
											{site.name}
										</span>
										<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted }}>
											{site.domain}
										</span>
									</div>
								</button>
								{confirmDelete === site.id ? (
									<div style={{ display: "flex", gap: "4px" }}>
										<button
											type="button"
											onClick={() => { onDelete(site); setConfirmDelete(null); setOpen(false); }}
											style={{
												padding: "3px 8px",
												borderRadius: "5px",
												fontSize: "10px",
												fontFamily: C.mono,
												backgroundColor: C.redBg,
												color: C.redText,
												border: "none",
												cursor: "pointer",
											}}>
											Confirm
										</button>
										<button
											type="button"
											onClick={() => setConfirmDelete(null)}
											style={{
												padding: "3px 6px",
												borderRadius: "5px",
												fontSize: "10px",
												fontFamily: C.mono,
												backgroundColor: "transparent",
												color: C.textMuted,
												border: `1px solid ${C.border}`,
												cursor: "pointer",
											}}>
											No
										</button>
									</div>
								) : (
									<button
										type="button"
										onClick={() => setConfirmDelete(site.id)}
										title="Delete site"
										style={{
											width: "24px",
											height: "24px",
											borderRadius: "5px",
											border: `1px solid ${C.border}`,
											backgroundColor: "transparent",
											color: C.textMuted,
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
											<path d="M3 6h18" />
											<path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
											<path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
										</svg>
									</button>
								)}
							</div>
						))}
						<Link
							href="/onboarding?step=add-site"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								padding: "10px 12px",
								fontFamily: C.sans,
								fontSize: "12px",
								color: C.accentText,
								textDecoration: "none",
								fontWeight: "500",
							}}>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							Add new site
						</Link>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
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
	{ id: "team", label: "Team", icon: "⊕", href: "/settings/team" },
];

function Sidebar({
	active,
	onNav,
	liveCount,
	sites,
	activeSite,
	onSelectSite,
	onDeleteSite,
	onLogout,
	onClose,
}: {
	active: string;
	onNav: (id: string) => void;
	liveCount: number;
	sites: SiteData[];
	activeSite: SiteData | null;
	onSelectSite: (site: SiteData) => void;
	onDeleteSite: (site: SiteData) => void;
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
					<span style={{ fontFamily: C.display, fontSize: "15px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em" }}>
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

			<SiteSelector
				sites={sites}
				activeSite={activeSite}
				onSelect={onSelectSite}
				onDelete={onDeleteSite}
			/>

			<div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
					<span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: C.green, boxShadow: `0 0 8px ${C.green}`, flexShrink: 0 }} />
					<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>
						Live right now
					</span>
				</div>
				<RealtimeCounter count={liveCount} />
				<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted, marginTop: "2px", display: "block" }}>
					active visitors
				</span>
			</div>

			<nav style={{ padding: "10px 10px", flex: 1 }}>
				{NAV_ITEMS.map((item) => {
					const navStyle: React.CSSProperties = {
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
						textAlign: "left" as const,
						marginBottom: "2px",
						textDecoration: "none",
					};
					const content = (
						<>
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
						</>
					);
					if (item.href) {
						return (
							<Link key={item.id} href={item.href} style={navStyle}>
								{content}
							</Link>
						);
					}
					return (
						<button key={item.id} onClick={() => onNav(item.id)} style={navStyle}>
							{content}
						</button>
					);
				})}
			</nav>

			<div
				style={{
					padding: "14px",
					margin: "0 10px 14px",
					borderRadius: "10px",
					backgroundColor: C.accentBg,
					border: `1px solid ${C.accentBorder}`,
				}}>
				<p style={{ fontFamily: C.sans, fontSize: "12px", color: C.accentText, marginBottom: "10px", lineHeight: "1.5" }}>
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

async function apiFetch<T>(path: string): Promise<T | null> {
	try {
		const res = await fetch(`${API}${path}`, { credentials: "include" });
		if (!res.ok) return null;
		return (await res.json()) as T;
	} catch {
		return null;
	}
}

export default function Dashboard() {
	const [activeNav, setActiveNav] = useState("overview");
	const [period, setPeriod] = useState<Period>("30d");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);
	const [loading, setLoading] = useState(true);

	const [sites, setSites] = useState<SiteData[]>([]);
	const [activeSite, setActiveSite] = useState<SiteData | null>(null);
	const [liveCount, setLiveCount] = useState(0);

	const [overview, setOverview] = useState<OverviewData | null>(null);
	const [timeseries, setTimeseries] = useState<TimeseriesRow[]>([]);
	const [pages, setPages] = useState<PageRow[]>([]);
	const [sources, setSources] = useState<SourceRow[]>([]);
	const [devices, setDevices] = useState<DeviceRow[]>([]);
	const [countries, setCountries] = useState<CountryRow[]>([]);

	const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		apiFetch<SiteData[]>("/api/sites").then((data) => {
			if (!data || data.length === 0) {
				window.location.href = "/onboarding";
				return;
			}
			setSites(data);
			setActiveSite(data[0]);
			setLoading(false);
		});
	}, []);

	const fetchDashboardData = useCallback(async (siteId: string, p: Period) => {
		const [ov, ts, pg, src, dev, ctry] = await Promise.all([
			apiFetch<OverviewData>(`/api/events/${siteId}/overview?period=${p}`),
			apiFetch<TimeseriesRow[]>(`/api/events/${siteId}/timeseries?period=${p}`),
			apiFetch<PageRow[]>(`/api/events/${siteId}/pages?period=${p}`),
			apiFetch<SourceRow[]>(`/api/events/${siteId}/sources?period=${p}`),
			apiFetch<DeviceRow[]>(`/api/events/${siteId}/devices?period=${p}`),
			apiFetch<CountryRow[]>(`/api/events/${siteId}/countries?period=${p}`),
		]);
		setOverview(ov);
		setTimeseries(ts ?? []);
		setPages(pg ?? []);
		setSources(src ?? []);
		setDevices(dev ?? []);
		setCountries(ctry ?? []);
	}, []);

	useEffect(() => {
		if (!activeSite) return;
		fetchDashboardData(activeSite.id, period);
	}, [activeSite, period, fetchDashboardData]);

	const fetchLive = useCallback(async () => {
		if (!activeSite) return;
		const count = await apiFetch<number>(`/api/events/${activeSite.id}/live`);
		if (count !== null) setLiveCount(count);
	}, [activeSite]);

	useEffect(() => {
		fetchLive();
		liveIntervalRef.current = setInterval(fetchLive, 10000);
		return () => {
			if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
		};
	}, [fetchLive]);

	const handleLogout = useCallback(async () => {
		setLoggingOut(true);
		try {
			await fetch(`${API}/api/auth/sign-out`, { method: "POST", credentials: "include" });
		} catch {
			// proceed regardless
		}
		window.location.href = "/";
	}, []);

	const handleNav = useCallback((id: string) => {
		setActiveNav(id);
		setSidebarOpen(false);
	}, []);

	const handleSelectSite = useCallback((site: SiteData) => {
		setActiveSite(site);
	}, []);

	const handleDeleteSite = useCallback(async (site: SiteData) => {
		try {
			const res = await fetch(`${API}/api/sites/${site.id}`, { method: "DELETE", credentials: "include" });
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to delete site");
			}
			toast.success(`${site.domain} deleted`);
			setSites((prev) => {
				const remaining = prev.filter((s) => s.id !== site.id);
				if (remaining.length === 0) {
					window.location.href = "/onboarding";
					return remaining;
				}
				if (activeSite?.id === site.id) {
					setActiveSite(remaining[0]);
				}
				return remaining;
			});
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		}
	}, [activeSite]);

	const visitors = timeseries.map((r) => Number(r.visitors));
	const pageviewsArr = timeseries.map((r) => Number(r.pageviews));
	const visitorTotal = overview ? Number(overview.visitors) : 0;
	const pvTotal = overview ? Number(overview.pageviews) : 0;
	const bounceRate = overview ? Number(overview.bounce_rate) : 0;
	const avgDuration = overview ? Number(overview.avg_duration_ms) : 0;

	if (loading) {
		return (
			<div style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
				backgroundColor: C.bg,
			}}>
				<Spinner size={24} />
			</div>
		);
	}

	return (
		<div style={{ display: "flex", minHeight: "100vh", backgroundColor: C.bg }}>
			<div className="hidden lg:flex" style={{ flexShrink: 0 }}>
				<Sidebar
					active={activeNav}
					onNav={setActiveNav}
					liveCount={liveCount}
					sites={sites}
					activeSite={activeSite}
					onSelectSite={handleSelectSite}
					onDeleteSite={handleDeleteSite}
					onLogout={handleLogout}
				/>
			</div>

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
							style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "oklch(0 0 0 / 60%)" }}
						/>
						<motion.div
							initial={{ x: -280 }}
							animate={{ x: 0 }}
							exit={{ x: -280 }}
							transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
							className="lg:hidden"
							style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}>
							<Sidebar
								active={activeNav}
								onNav={handleNav}
								liveCount={liveCount}
								sites={sites}
								activeSite={activeSite}
								onSelectSite={handleSelectSite}
								onDeleteSite={handleDeleteSite}
								onLogout={handleLogout}
								onClose={() => setSidebarOpen(false)}
							/>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
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
							{activeSite?.domain ?? ""}
						</span>
					</div>

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

				<div className="p-4 sm:p-7">
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
						<MetricCard
							label="Unique visitors"
							value={fmt(visitorTotal)}
							sparkData={visitors.slice(-8)}
							delay={0.05}
						/>
						<MetricCard
							label="Pageviews"
							value={fmt(pvTotal)}
							sparkData={pageviewsArr.slice(-8)}
							delay={0.1}
						/>
						<MetricCard
							label="Bounce rate"
							value={bounceRate.toFixed(1)}
							unit="%"
							sparkData={[]}
							delay={0.15}
						/>
						<MetricCard
							label="Avg. session"
							value={fmtDuration(avgDuration)}
							sparkData={[]}
							delay={0.2}
						/>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<MainChart timeseries={timeseries} />
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
						<TopPagesTable pages={pages} />
						<TopSourcesTable sources={sources} />
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
						<DevicesBreakdown devices={devices} />
						<CountriesBreakdown countries={countries} />
					</div>
				</div>
			</div>

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
