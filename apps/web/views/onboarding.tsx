"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
	bg: "oklch(0.08 0.006 265)",
	bgDeep: "oklch(0.055 0.008 265)",
	surface: "oklch(0.115 0.008 265)",
	surfaceEl: "oklch(0.135 0.010 265)",
	border: "oklch(1 0 0 / 7%)",
	borderEl: "oklch(1 0 0 / 12%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	textFaint: "oklch(0.30 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentText: "oklch(0.74 0.15 265)",
	accentBg: "oklch(0.62 0.22 265 / 8%)",
	accentBorder: "oklch(0.62 0.22 265 / 28%)",
	green: "oklch(0.72 0.17 145)",
	greenBg: "oklch(0.72 0.17 145 / 10%)",
	greenBorder: "oklch(0.72 0.17 145 / 25%)",
	red: "oklch(0.65 0.2 25)",
	redBg: "oklch(0.65 0.2 25 / 10%)",
	redBorder: "oklch(0.65 0.2 25 / 20%)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Step = "account" | "site" | "install";

interface Site {
	id: string;
	name: string;
	domain: string;
	apiKey: string;
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

function Spinner() {
	return (
		<svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
			<circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
			<path d="M12 2a10 10 0 0 1 10 10" />
		</svg>
	);
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}}
			style={{
				fontFamily: C.mono,
				backgroundColor: copied ? C.greenBg : C.surfaceEl,
				color: copied ? C.green : C.textMuted,
				border: `1px solid ${copied ? C.greenBorder : C.borderEl}`,
				cursor: "pointer",
				fontSize: "11px",
				padding: "4px 10px",
				borderRadius: "6px",
				transition: "all 0.15s",
				flexShrink: 0,
			}}>
			{copied ? "Copied!" : "Copy"}
		</button>
	);
}

// ── Step progress ──────────────────────────────────────────────────────────────

function StepProgress({ current }: { current: Step }) {
	const steps: { key: Step; label: string }[] = [
		{ key: "account", label: "Account" },
		{ key: "site", label: "Add site" },
		{ key: "install", label: "Install SDK" },
	];
	const currentIdx = steps.findIndex((s) => s.key === current);

	return (
		<div style={{ display: "flex", alignItems: "center" }}>
			{steps.map((s, i) => {
				const done = i < currentIdx;
				const active = i === currentIdx;
				return (
					<React.Fragment key={s.key}>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<div
								style={{
									width: "26px",
									height: "26px",
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "11px",
									fontWeight: "700",
									fontFamily: C.mono,
									flexShrink: 0,
									transition: "all 0.3s",
									backgroundColor: done || active ? C.accent : "transparent",
									color: done || active ? "#fff" : C.textMuted,
									border: `2px solid ${done || active ? C.accent : C.border}`,
								}}>
								{done ? (
									<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								) : (
									i + 1
								)}
							</div>
							<span
								style={{
									fontFamily: C.sans,
									fontSize: "13px",
									fontWeight: active ? "600" : "400",
									color: active ? C.text : C.textMuted,
									transition: "all 0.3s",
								}}>
								{s.label}
							</span>
						</div>
						{i < steps.length - 1 && (
							<div
								style={{
									flex: 1,
									height: "2px",
									margin: "0 12px",
									backgroundColor: done ? C.accent : C.border,
									borderRadius: "1px",
									transition: "background-color 0.4s",
									minWidth: "28px",
								}}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
}

// ── Form field ─────────────────────────────────────────────────────────────────

function Field({
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	required,
	minLength,
	hint,
}: {
	label: string;
	type?: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	required?: boolean;
	minLength?: number;
	hint?: string;
}) {
	const [focused, setFocused] = useState(false);
	return (
		<div>
			<label
				style={{
					display: "block",
					fontFamily: C.mono,
					fontSize: "11px",
					color: focused ? C.accentText : C.textMuted,
					marginBottom: "6px",
					textTransform: "uppercase",
					letterSpacing: "0.06em",
					transition: "color 0.15s",
				}}>
				{label}
			</label>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				placeholder={placeholder}
				required={required}
				minLength={minLength}
				style={{
					width: "100%",
					padding: "10px 14px",
					borderRadius: "10px",
					fontSize: "14px",
					outline: "none",
					fontFamily: C.sans,
					backgroundColor: C.bg,
					border: `1.5px solid ${focused ? C.accent : C.border}`,
					color: C.text,
					transition: "border-color 0.15s, box-shadow 0.15s",
					boxSizing: "border-box",
					boxShadow: focused ? `0 0 0 3px oklch(0.62 0.22 265 / 12%)` : "none",
				}}
			/>
			{hint && (
				<p style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>{hint}</p>
			)}
		</div>
	);
}

// ── Right panel chart ──────────────────────────────────────────────────────────

const CHART_RAW = [
	1240, 1580, 1320, 1890, 2100, 1760, 2340, 2180, 2670, 2450,
	2890, 3100, 2780, 3240, 3010, 3560, 3290, 3780, 4100, 3850,
	4320, 4010, 4580, 4290, 4870, 5100, 4760, 5380, 5120, 5640,
];

function makeLinePath(data: number[], w: number, h: number) {
	const max = Math.max(...data) * 1.1;
	const pts = data.map((v, i) => ({
		x: (i / (data.length - 1)) * w,
		y: h - (v / max) * h * 0.85 - h * 0.06,
	}));
	const line = pts.reduce((acc, p, i) => {
		if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
		const prev = pts[i - 1];
		const cpx = ((prev.x + p.x) / 2).toFixed(1);
		return `${acc} C${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
	}, "");
	const last = pts[pts.length - 1];
	return { line, area: `${line} L${w},${h} L0,${h} Z`, last };
}

const STEP_CONTENT = {
	account: {
		tag: "Privacy-first analytics",
		headline: "Know your users.\nProtect their\nprivacy.",
		sub: "Real-time analytics with zero personal data stored. GDPR compliant out of the box.",
		badges: ["Open Source", "GDPR Ready", "Zero PII", "Self-hostable"],
	},
	site: {
		tag: "Own your data",
		headline: "Your domain.\nYour data.\nYour rules.",
		sub: "Each site gets its own isolated analytics pipeline. No cross-site tracking, ever.",
		badges: ["Isolated per site", "Custom events", "Goal tracking", "API access"],
	},
	install: {
		tag: "Developer-first",
		headline: "3 lines of code.\nInfinite insights.",
		sub: "Sub-3kb. Zero config. Works with Next.js, React, Vue, Svelte, and any framework.",
		badges: ["< 3kb gzipped", "Tree-shakeable", "TypeScript", "SSR ready"],
	},
};

function RightPanel({ step }: { step: Step }) {
	const [tick, setTick] = useState(0);
	const content = STEP_CONTENT[step];

	useEffect(() => {
		const t = setInterval(() => setTick((n) => n + 1), 3000);
		return () => clearInterval(t);
	}, []);

	const windowSize = 22;
	const start = (tick * 2) % (CHART_RAW.length - windowSize);
	const visible = CHART_RAW.slice(start, start + windowSize);
	const { line, area, last } = makeLinePath(visible, 380, 110);

	return (
		<div
			style={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				height: "100%",
				backgroundColor: C.bgDeep,
				borderLeft: `1px solid ${C.border}`,
			}}>
			{/* Grid pattern */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `
						linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px),
						linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)
					`,
					backgroundSize: "40px 40px",
					pointerEvents: "none",
				}}
			/>
			{/* Glow */}
			<div
				style={{
					position: "absolute",
					top: "35%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "500px",
					height: "500px",
					background: `radial-gradient(circle, oklch(0.62 0.22 265 / 10%) 0%, transparent 65%)`,
					pointerEvents: "none",
				}}
			/>
			{/* Watermark logo */}
			<div
				style={{
					position: "absolute",
					bottom: "-60px",
					right: "-60px",
					opacity: 0.025,
					pointerEvents: "none",
				}}>
				<LogoMark size={340} />
			</div>

			{/* Content */}
			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					height: "100%",
					padding: "48px 44px",
				}}>
				{/* Step-specific copy */}
				<AnimatePresence mode="wait">
					<motion.div
						key={step}
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -24 }}
						transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
						{/* Tag */}
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
								marginBottom: "28px",
								padding: "5px 14px",
								borderRadius: "20px",
								backgroundColor: C.accentBg,
								border: `1px solid ${C.accentBorder}`,
							}}>
							<span
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									backgroundColor: C.accent,
									flexShrink: 0,
								}}
							/>
							<span
								style={{
									fontFamily: C.mono,
									fontSize: "11px",
									color: C.accentText,
									letterSpacing: "0.06em",
									textTransform: "uppercase",
									fontWeight: "600",
								}}>
								{content.tag}
							</span>
						</div>

						{/* Headline */}
						<h2
							style={{
								fontFamily: C.display,
								fontSize: "clamp(26px, 2.8vw, 40px)",
								fontWeight: "800",
								color: C.text,
								lineHeight: "1.1",
								letterSpacing: "-0.035em",
								marginBottom: "18px",
								whiteSpace: "pre-line",
							}}>
							{content.headline}
						</h2>

						{/* Sub */}
						<p
							style={{
								fontFamily: C.sans,
								fontSize: "14px",
								color: C.textMuted,
								lineHeight: "1.65",
								maxWidth: "340px",
								marginBottom: "28px",
							}}>
							{content.sub}
						</p>

						{/* Feature badges */}
						<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
							{content.badges.map((b) => (
								<span
									key={b}
									style={{
										fontFamily: C.mono,
										fontSize: "11px",
										color: C.textMuted,
										backgroundColor: C.surface,
										border: `1px solid ${C.border}`,
										borderRadius: "6px",
										padding: "4px 10px",
									}}>
									{b}
								</span>
							))}
						</div>
					</motion.div>
				</AnimatePresence>

				{/* Analytics preview widget */}
				<div>
					{/* Mini stats */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: "10px",
							marginBottom: "14px",
						}}>
						{[
							{ v: "5,640", l: "Today" },
							{ v: "87.3K", l: "This month" },
							{ v: "+18.4%", l: "Growth" },
						].map(({ v, l }) => (
							<div
								key={l}
								style={{
									backgroundColor: "oklch(0.08 0.006 265 / 70%)",
									border: `1px solid ${C.borderEl}`,
									borderRadius: "10px",
									padding: "10px 14px",
									backdropFilter: "blur(16px)",
								}}>
								<div
									style={{
										fontFamily: C.mono,
										fontSize: "18px",
										fontWeight: "700",
										color: C.text,
										letterSpacing: "-0.04em",
										lineHeight: "1",
										marginBottom: "4px",
									}}>
									{v}
								</div>
								<div
									style={{
										fontFamily: C.mono,
										fontSize: "10px",
										color: C.textMuted,
										textTransform: "uppercase",
										letterSpacing: "0.08em",
									}}>
									{l}
								</div>
							</div>
						))}
					</div>

					{/* Chart card */}
					<div
						style={{
							backgroundColor: C.surface,
							border: `1px solid ${C.borderEl}`,
							borderRadius: "14px",
							padding: "16px 18px",
							overflow: "hidden",
						}}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: "12px",
							}}>
							<span
								style={{
									fontFamily: C.mono,
									fontSize: "10px",
									color: C.textMuted,
									textTransform: "uppercase",
									letterSpacing: "0.08em",
								}}>
								Visitors — Last 30 days
							</span>
							<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
								<span
									style={{
										width: "6px",
										height: "6px",
										borderRadius: "50%",
										backgroundColor: C.green,
										boxShadow: `0 0 8px ${C.green}`,
									}}
								/>
								<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.green }}>Live</span>
							</div>
						</div>

						<AnimatePresence mode="wait">
							<motion.div
								key={tick}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.6 }}>
								<svg
									width="100%"
									viewBox="0 0 380 110"
									preserveAspectRatio="none"
									style={{ display: "block" }}>
									<defs>
										<linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={C.accent} stopOpacity="0.3" />
											<stop offset="100%" stopColor={C.accent} stopOpacity="0.01" />
										</linearGradient>
									</defs>
									{[0.25, 0.5, 0.75].map((v) => (
										<line
											key={v}
											x1="0"
											y1={110 * v}
											x2="380"
											y2={110 * v}
											stroke="oklch(1 0 0 / 5%)"
											strokeWidth="1"
										/>
									))}
									<path d={area} fill="url(#panelGrad)" />
									<path d={line} fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" />
									<circle cx={last.x} cy={last.y} r="3" fill={C.accent} />
									<circle cx={last.x} cy={last.y} r="6" fill={C.accent} fillOpacity="0.2">
										<animate attributeName="r" values="4;9;4" dur="2.5s" repeatCount="indefinite" />
										<animate attributeName="fill-opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite" />
									</circle>
								</svg>
							</motion.div>
						</AnimatePresence>

						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginTop: "6px",
							}}>
							{["01", "08", "15", "22", "30"].map((d) => (
								<span key={d} style={{ fontFamily: C.mono, fontSize: "9px", color: C.textFaint }}>
									{d}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// ── Main Onboarding component ──────────────────────────────────────────────────

export default function Onboarding() {
	const [step, setStep] = useState<Step>("account");
	const [site, setSite] = useState<Site | null>(null);

	// Account step
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authTab, setAuthTab] = useState<"signup" | "signin">("signup");
	const [accountLoading, setAccountLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);

	// Site step
	const [siteName, setSiteName] = useState("");
	const [domain, setDomain] = useState("");
	const [siteLoading, setSiteLoading] = useState(false);

	useEffect(() => {
		fetch(`${API}/api/auth/get-session`, { credentials: "include" })
			.then((r) => (r.ok ? r.json() : null))
			.then((d: { user?: { id: string } } | null) => {
				if (d?.user) setStep("site");
			})
			.catch(() => undefined);
	}, []);

	async function signInWithSocial(provider: "github" | "google") {
		setSocialLoading(provider);
		try {
			const res = await fetch(`${API}/api/auth/sign-in/social`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ provider, callbackURL: `${window.location.origin}/onboarding` }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "OAuth failed");
			}
			const d = (await res.json()) as { url?: string };
			if (d.url) window.location.href = d.url;
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "OAuth error");
			setSocialLoading(null);
		}
	}

	async function handleAccount(e: React.FormEvent) {
		e.preventDefault();
		setAccountLoading(true);
		try {
			const endpoint = authTab === "signup" ? "sign-up/email" : "sign-in/email";
			const body = authTab === "signup" ? { email, password, name } : { email, password };
			const res = await fetch(`${API}/api/auth/${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Authentication failed");
			}
			setStep("site");
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setAccountLoading(false);
		}
	}

	async function handleSite(e: React.FormEvent) {
		e.preventDefault();
		setSiteLoading(true);
		try {
			const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
			const res = await fetch(`${API}/api/sites`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name: siteName, domain: cleanDomain }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to create site");
			}
			const created = (await res.json()) as Site;
			setSite(created);
			setStep("install");
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setSiteLoading(false);
		}
	}

	const installCode = site
		? `import { Analytics } from '@traytic/analytics/next'\n\nexport default function RootLayout({ children }) {\n  return (\n    <html><body>\n      {children}\n      <Analytics siteId="${site.id}" />\n    </body></html>\n  )\n}`
		: "";
	const npmInstall = "npm install @traytic/analytics";

	const btnStyle = (disabled: boolean): React.CSSProperties => ({
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		width: "100%",
		padding: "12px",
		borderRadius: "10px",
		fontSize: "14px",
		fontWeight: "600",
		fontFamily: C.sans,
		backgroundColor: C.accent,
		color: "#fff",
		border: "none",
		cursor: disabled ? "not-allowed" : "pointer",
		opacity: disabled ? 0.65 : 1,
		transition: "opacity 0.15s",
	});

	return (
		<div
			style={{
				display: "flex",
				minHeight: "100vh",
				backgroundColor: C.bg,
			}}>
			{/* ── LEFT: Form panel ─────────────────────────────────────────────── */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "min(500px, 100vw)",
					flexShrink: 0,
					borderRight: `1px solid ${C.border}`,
				}}>
				{/* Logo bar */}
				<div
					style={{
						padding: "18px 36px",
						borderBottom: `1px solid ${C.border}`,
						display: "flex",
						alignItems: "center",
						gap: "10px",
						backgroundColor: C.bg,
					}}>
					<a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
						<LogoMark size={28} />
						<span
							style={{
								fontFamily: C.display,
								fontSize: "16px",
								fontWeight: "700",
								color: C.text,
								letterSpacing: "-0.02em",
							}}>
							Traytic
						</span>
					</a>
				</div>

				{/* Scrollable form area */}
				<div style={{ flex: 1, overflowY: "auto", padding: "40px 36px" }}>
					{/* Step progress */}
					<div style={{ marginBottom: "40px" }}>
						<StepProgress current={step} />
					</div>

					<AnimatePresence mode="wait">
						{/* ── Step 1: Account ──────────────────────────────────────── */}
						{step === "account" && (
							<motion.div
								key="account"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}>
								<h1
									style={{
										fontFamily: C.display,
										fontSize: "28px",
										fontWeight: "800",
										color: C.text,
										letterSpacing: "-0.035em",
										marginBottom: "6px",
									}}>
									{authTab === "signup" ? "Create your account" : "Welcome back"}
								</h1>
								<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
									{authTab === "signup"
										? "Free · 1 site · 50K events/mo · No card needed"
										: "Sign in to continue to your dashboard"}
								</p>

								{/* OAuth */}
								<div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
									{(
										[
											{
												p: "github" as const,
												label: "Continue with GitHub",
												icon: (
													<svg width="16" height="16" viewBox="0 0 24 24" fill={C.text}>
														<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
													</svg>
												),
											},
											{
												p: "google" as const,
												label: "Continue with Google",
												icon: (
													<svg width="16" height="16" viewBox="0 0 24 24">
														<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
														<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
														<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
														<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
													</svg>
												),
											},
										] as { p: "github" | "google"; label: string; icon: React.ReactNode }[]
									).map(({ p, label, icon }) => (
										<button
											key={p}
											type="button"
											onClick={() => signInWithSocial(p)}
											disabled={socialLoading !== null}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												gap: "10px",
												width: "100%",
												padding: "11px 16px",
												borderRadius: "10px",
												fontSize: "14px",
												fontWeight: "500",
												fontFamily: C.sans,
												backgroundColor: C.surface,
												color: C.text,
												border: `1.5px solid ${C.border}`,
												cursor: socialLoading ? "not-allowed" : "pointer",
												opacity: socialLoading ? 0.6 : 1,
												transition: "all 0.15s",
											}}>
											{socialLoading === p ? <Spinner /> : icon}
											{label}
										</button>
									))}
								</div>

								{/* Divider */}
								<div
									style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
									<div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
									<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>or</span>
									<div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
								</div>

								{/* Tabs */}
								<div
									style={{
										display: "flex",
										backgroundColor: C.bgDeep,
										borderRadius: "10px",
										padding: "4px",
										marginBottom: "20px",
										border: `1px solid ${C.border}`,
									}}>
									{(["signup", "signin"] as const).map((t) => (
										<button
											key={t}
											onClick={() => {
												setAuthTab(t);
												setAccountError("");
											}}
											style={{
												flex: 1,
												padding: "8px",
												borderRadius: "7px",
												fontSize: "13px",
												fontWeight: authTab === t ? "600" : "400",
												fontFamily: C.sans,
												backgroundColor: authTab === t ? C.surface : "transparent",
												color: authTab === t ? C.text : C.textMuted,
												border: authTab === t ? `1px solid ${C.border}` : "1px solid transparent",
												cursor: "pointer",
												transition: "all 0.15s",
											}}>
											{t === "signup" ? "Sign up" : "Sign in"}
										</button>
									))}
								</div>

								<form onSubmit={handleAccount} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
									<AnimatePresence mode="wait">
										{authTab === "signup" && (
											<motion.div
												key="name"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.15 }}>
												<Field
													label="Name"
													value={name}
													onChange={setName}
													placeholder="Your name"
													required={authTab === "signup"}
												/>
											</motion.div>
										)}
									</AnimatePresence>

									<Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
									<Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required minLength={8} />


									<button type="submit" disabled={accountLoading} style={btnStyle(accountLoading)}>
										{accountLoading && <Spinner />}
										{accountLoading ? "Creating account…" : "Continue →"}
									</button>
								</form>
							</motion.div>
						)}

						{/* ── Step 2: Site ─────────────────────────────────────────── */}
						{step === "site" && (
							<motion.div
								key="site"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}>
								<h2
									style={{
										fontFamily: C.display,
										fontSize: "28px",
										fontWeight: "800",
										color: C.text,
										letterSpacing: "-0.035em",
										marginBottom: "6px",
									}}>
									Add your site
								</h2>
								<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "32px" }}>
									Free plan includes 1 site. Upgrade anytime to add more.
								</p>

								<form onSubmit={handleSite} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
									<Field
										label="Site name"
										value={siteName}
										onChange={setSiteName}
										placeholder="My Startup"
										required
									/>
									<Field
										label="Domain"
										value={domain}
										onChange={setDomain}
										placeholder="mystartup.com"
										required
										hint="Without https:// — e.g. mystartup.com"
									/>


									<button type="submit" disabled={siteLoading} style={btnStyle(siteLoading)}>
										{siteLoading && <Spinner />}
										{siteLoading ? "Creating site…" : "Create site →"}
									</button>
								</form>
							</motion.div>
						)}

						{/* ── Step 3: Install ──────────────────────────────────────── */}
						{step === "install" && site && (
							<motion.div
								key="install"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}>
								{/* Success badge */}
								<div
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "8px",
										marginBottom: "20px",
										padding: "6px 14px",
										borderRadius: "20px",
										backgroundColor: C.greenBg,
										border: `1px solid ${C.greenBorder}`,
									}}>
									<span
										style={{
											width: "6px",
											height: "6px",
											borderRadius: "50%",
											backgroundColor: C.green,
											boxShadow: `0 0 8px ${C.green}`,
											flexShrink: 0,
										}}
									/>
									<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.green }}>
										Site created — {site.domain}
									</span>
								</div>

								<h2
									style={{
										fontFamily: C.display,
										fontSize: "28px",
										fontWeight: "800",
										color: C.text,
										letterSpacing: "-0.035em",
										marginBottom: "6px",
									}}>
									Install the SDK
								</h2>
								<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
									Two steps. Under 5 minutes. Sub-3kb, no performance impact.
								</p>

								{/* 01 */}
								<div style={{ marginBottom: "16px" }}>
									<p
										style={{
											fontFamily: C.mono,
											fontSize: "10px",
											color: C.accentText,
											textTransform: "uppercase",
											letterSpacing: "0.1em",
											fontWeight: "700",
											marginBottom: "8px",
										}}>
										01 — Install package
									</p>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											padding: "12px 16px",
											borderRadius: "10px",
											backgroundColor: C.bgDeep,
											border: `1px solid ${C.border}`,
										}}>
										<code style={{ fontFamily: C.mono, fontSize: "13px", color: C.accentText }}>{npmInstall}</code>
										<CopyButton text={npmInstall} />
									</div>
								</div>

								{/* 02 */}
								<div style={{ marginBottom: "16px" }}>
									<p
										style={{
											fontFamily: C.mono,
											fontSize: "10px",
											color: C.accentText,
											textTransform: "uppercase",
											letterSpacing: "0.1em",
											fontWeight: "700",
											marginBottom: "8px",
										}}>
										02 — Add to root layout
									</p>
									<div
										style={{
											position: "relative",
											borderRadius: "10px",
											backgroundColor: C.bgDeep,
											border: `1px solid ${C.border}`,
											overflow: "hidden",
										}}>
										<div style={{ position: "absolute", top: "10px", right: "10px" }}>
											<CopyButton text={installCode} />
										</div>
										<pre
											style={{
												padding: "14px 16px",
												fontSize: "12px",
												color: C.accentText,
												fontFamily: C.mono,
												overflowX: "auto",
												whiteSpace: "pre",
												margin: 0,
												lineHeight: "1.65",
											}}>
											{installCode}
										</pre>
									</div>
								</div>

								{/* Site ID */}
								<div
									style={{
										padding: "14px 16px",
										borderRadius: "10px",
										backgroundColor: C.accentBg,
										border: `1px solid ${C.accentBorder}`,
										marginBottom: "28px",
									}}>
									<p
										style={{
											fontFamily: C.mono,
											fontSize: "10px",
											color: C.accentText,
											textTransform: "uppercase",
											letterSpacing: "0.1em",
											fontWeight: "700",
											marginBottom: "8px",
										}}>
										Your site ID
									</p>
									<div
										style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
										<code style={{ fontFamily: C.mono, fontSize: "12px", color: C.text, wordBreak: "break-all" }}>
											{site.id}
										</code>
										<CopyButton text={site.id} />
									</div>
								</div>

								<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
									<a
										href="/dashboard"
										style={{
											display: "inline-flex",
											alignItems: "center",
											padding: "11px 22px",
											borderRadius: "10px",
											fontSize: "14px",
											fontWeight: "600",
											fontFamily: C.sans,
											backgroundColor: C.accent,
											color: "#fff",
											textDecoration: "none",
										}}>
										Go to dashboard →
									</a>
									<a
										href="/upgrade?plan=pro"
										style={{
											display: "inline-flex",
											alignItems: "center",
											padding: "11px 22px",
											borderRadius: "10px",
											fontSize: "14px",
											fontWeight: "500",
											fontFamily: C.sans,
											color: C.text,
											border: `1px solid ${C.border}`,
											textDecoration: "none",
										}}>
										Upgrade for more sites
									</a>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Footer */}
				<div
					style={{
						padding: "14px 36px",
						borderTop: `1px solid ${C.border}`,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexShrink: 0,
					}}>
					<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textFaint }}>
						© {new Date().getFullYear()} Traytic
					</span>
					<a href="/" style={{ fontFamily: C.sans, fontSize: "12px", color: C.textMuted, textDecoration: "none" }}>
						← Back to home
					</a>
				</div>
			</div>

			{/* ── RIGHT: Visual panel (hidden on mobile) ───────────────────────── */}
			<div className="hidden lg:flex flex-1">
				<RightPanel step={step} />
			</div>
		</div>
	);
}
