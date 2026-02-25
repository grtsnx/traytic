"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

// ── Design tokens (shared with home.tsx) ───────────────────────────────────────
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
	red: "oklch(0.65 0.2 25)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const PLAN_INFO = {
	pro: {
		name: "Pro",
		priceUSD: "$5",
		priceNGN: "₦7,900",
		period: "/ month",
		sites: "Up to 10 sites",
		events: "1M events / month",
		features: ["Up to 10 sites", "1M events / month", "1-year data retention", "Email & Slack alerts", "Priority support"],
	},
	team: {
		name: "Team",
		priceUSD: "$19",
		priceNGN: "₦29,900",
		period: "/ month",
		sites: "Unlimited sites",
		events: "10M events / month",
		features: ["Unlimited sites", "10M events / month", "Everything in Pro", "Unlimited team seats", "Custom goals & funnels"],
	},
} as const;

type PlanKey = keyof typeof PLAN_INFO;

function CheckIcon() {
	return (
		<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" className="mt-0.5 shrink-0">
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

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

// Rough country → ISO code detection via Intl timezone
function detectCountryCode(): string {
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const africaMap: Record<string, string> = {
			"Africa/Lagos": "NG",
			"Africa/Accra": "GH",
			"Africa/Nairobi": "KE",
			"Africa/Johannesburg": "ZA",
			"Africa/Kigali": "RW",
			"Africa/Dar_es_Salaam": "TZ",
			"Africa/Kampala": "UG",
			"Africa/Abidjan": "CI",
			"Africa/Cairo": "EG",
		};
		return africaMap[tz] ?? "US";
	} catch {
		return "US";
	}
}

export default function Upgrade() {
	const params = useSearchParams();
	const planKey = (params.get("plan") ?? "pro") as PlanKey;
	const plan = PLAN_INFO[planKey] ?? PLAN_INFO.pro;

	const [tab, setTab] = useState<"signup" | "signin">("signup");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [checkingSession, setCheckingSession] = useState(true);
	const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);

	async function signInWithSocial(provider: "github" | "google") {
		setSocialLoading(provider);
		setError("");
		try {
			const res = await fetch(`${API}/api/auth/sign-in/social`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ provider, callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/billing/success` }),
			});
			if (!res.ok) {
				const d = await res.json() as { message?: string };
				throw new Error(d.message ?? "OAuth failed");
			}
			const d = await res.json() as { url?: string };
			if (d.url) window.location.href = d.url;
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "OAuth error");
			setSocialLoading(null);
		}
	}

	// If already logged in, go straight to checkout
	useEffect(() => {
		const check = async () => {
			try {
				const res = await fetch(`${API}/api/auth/get-session`, { credentials: "include" });
				if (res.ok) {
					const data = await res.json() as { user?: { id: string } };
					if (data?.user) await initiateCheckout();
				}
			} catch {
				// not logged in
			} finally {
				setCheckingSession(false);
			}
		};
		check();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function initiateCheckout() {
		const countryCode = detectCountryCode();
		const res = await fetch(`${API}/api/billing/checkout`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ plan: planKey, countryCode }),
		});
		if (!res.ok) {
			const data = await res.json() as { message?: string };
			throw new Error(data.message ?? "Checkout failed");
		}
		const { url } = await res.json() as { url: string };
		window.location.href = url;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const authEndpoint = tab === "signup" ? "sign-up/email" : "sign-in/email";
			const body = tab === "signup"
				? { email, password, name }
				: { email, password };

			const authRes = await fetch(`${API}/api/auth/${authEndpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(body),
			});

			if (!authRes.ok) {
				const data = await authRes.json() as { message?: string };
				throw new Error(data.message ?? "Authentication failed");
			}

			await initiateCheckout();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (checkingSession) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
				<Spinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: C.bg }}>
			{/* Nav */}
			<header style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: `${C.bg}ee`, backdropFilter: "blur(12px)" }}>
				<div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-2">
					<a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
						<LogoMark size={24} />
						<span className="text-[14px] font-semibold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
							Traytic
						</span>
					</a>
				</div>
			</header>

			<main className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
				{/* Left: plan summary */}
				<motion.div
					initial={{ opacity: 0, x: -16 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
					<p className="text-[11px] font-medium tracking-widest uppercase mb-4" style={{ color: C.accentText, fontFamily: C.mono }}>
						You&apos;re upgrading to
					</p>
					<h1 className="text-[36px] font-bold tracking-tight mb-2" style={{ color: C.text, fontFamily: C.display }}>
						{plan.name}
					</h1>

					<div className="flex items-baseline gap-2 mb-1">
						<span className="text-[32px] font-bold" style={{ color: C.text, fontFamily: C.display }}>
							{plan.priceUSD}
						</span>
						<span className="text-[14px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
							{plan.period}
						</span>
					</div>
					<p className="text-[12px] mb-8" style={{ color: C.textMuted, fontFamily: C.mono }}>
						{plan.priceNGN} / month for NG · GH · KE · ZA
					</p>

					<ul className="flex flex-col gap-3">
						{plan.features.map((f) => (
							<li key={f} className="flex items-start gap-2.5 text-[14px]" style={{ color: C.text, fontFamily: C.sans }}>
								<CheckIcon />
								{f}
							</li>
						))}
					</ul>

					<div
						className="mt-8 p-4 rounded-xl text-[12px] leading-relaxed"
						style={{ backgroundColor: C.accentBg, border: `1px solid ${C.accentBorder}`, color: C.accentText, fontFamily: C.mono }}>
						14-day free trial · Cancel anytime · No credit card stored
					</div>
				</motion.div>

				{/* Right: auth form */}
				<motion.div
					initial={{ opacity: 0, x: 16 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
					className="p-6 rounded-2xl"
					style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>

					{/* Social auth */}
					<div className="flex flex-col gap-2.5 mb-6">
						<button
							type="button"
							onClick={() => signInWithSocial("github")}
							disabled={socialLoading !== null || loading}
							className="w-full py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 disabled:opacity-50"
							style={{ backgroundColor: C.bg, color: C.text, border: `1px solid ${C.border}`, fontFamily: C.sans, cursor: "pointer" }}>
							{socialLoading === "github" ? <Spinner /> : (
								<svg width="16" height="16" viewBox="0 0 24 24" fill={C.text}>
									<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
								</svg>
							)}
							Continue with GitHub
						</button>
						<button
							type="button"
							onClick={() => signInWithSocial("google")}
							disabled={socialLoading !== null || loading}
							className="w-full py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 disabled:opacity-50"
							style={{ backgroundColor: C.bg, color: C.text, border: `1px solid ${C.border}`, fontFamily: C.sans, cursor: "pointer" }}>
							{socialLoading === "google" ? <Spinner /> : (
								<svg width="16" height="16" viewBox="0 0 24 24">
									<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
									<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
									<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
									<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
								</svg>
							)}
							Continue with Google
						</button>
					</div>

					{/* Divider */}
					<div className="flex items-center gap-3 mb-6">
						<div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
						<span className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.mono }}>or</span>
						<div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
					</div>

					{/* Tab switcher */}
					<div className="flex mb-6 rounded-lg p-1" style={{ backgroundColor: C.bg }}>
						{(["signup", "signin"] as const).map((t) => (
							<button
								key={t}
								onClick={() => { setTab(t); setError(""); }}
								className="flex-1 py-2 rounded-md text-[13px] font-medium transition-all"
								style={{
									fontFamily: C.sans,
									backgroundColor: tab === t ? C.surface : "transparent",
									color: tab === t ? C.text : C.textMuted,
									border: tab === t ? `1px solid ${C.border}` : "1px solid transparent",
									cursor: "pointer",
								}}>
								{t === "signup" ? "Create account" : "Sign in"}
							</button>
						))}
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<AnimatePresence mode="wait">
							{tab === "signup" && (
								<motion.div
									key="name"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.15 }}>
									<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>
										Name
									</label>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
										required={tab === "signup"}
										className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none transition-all"
										style={{
											backgroundColor: C.bg,
											border: `1px solid ${C.border}`,
											color: C.text,
											fontFamily: C.sans,
										}}
									/>
								</motion.div>
							)}
						</AnimatePresence>

						<div>
							<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
								className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none transition-all"
								style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
							/>
						</div>

						<div>
							<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="At least 8 characters"
								minLength={8}
								required
								className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none transition-all"
								style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
							/>
						</div>

						<AnimatePresence>
							{error && (
								<motion.p
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									className="text-[12px] px-3 py-2 rounded-lg"
									style={{ color: C.red, backgroundColor: `oklch(0.65 0.2 25 / 10%)`, border: `1px solid oklch(0.65 0.2 25 / 20%)`, fontFamily: C.mono }}>
									{error}
								</motion.p>
							)}
						</AnimatePresence>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 rounded-lg text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
							style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
							{loading && <Spinner />}
							{loading ? "Redirecting to checkout…" : `Continue to ${plan.name} →`}
						</button>
					</form>

					<p className="mt-4 text-center text-[12px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
						You&apos;ll be redirected to a secure payment page.
					</p>
				</motion.div>
			</main>
		</div>
	);
}
