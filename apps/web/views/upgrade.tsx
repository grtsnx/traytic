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
