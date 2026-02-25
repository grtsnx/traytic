"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// ── Design tokens ───────────────────────────────────────────────────────────────
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
	red: "oklch(0.65 0.2 25)",
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

function StepIndicator({ current, label, n }: { current: boolean; label: string; n: number }) {
	return (
		<div className="flex items-center gap-2.5">
			<div
				className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
				style={{
					backgroundColor: current ? C.accent : C.surface,
					color: current ? "#fff" : C.textMuted,
					border: `1px solid ${current ? C.accent : C.border}`,
					fontFamily: C.mono,
				}}>
				{n}
			</div>
			<span className="text-[13px]" style={{ color: current ? C.text : C.textMuted, fontFamily: C.sans }}>
				{label}
			</span>
		</div>
	);
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	const copy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<button
			onClick={copy}
			className="text-[11px] px-2.5 py-1 rounded-md transition-all"
			style={{
				fontFamily: C.mono,
				backgroundColor: copied ? `oklch(0.72 0.17 145 / 15%)` : C.surface,
				color: copied ? C.green : C.textMuted,
				border: `1px solid ${copied ? `oklch(0.72 0.17 145 / 30%)` : C.border}`,
				cursor: "pointer",
			}}>
			{copied ? "Copied!" : "Copy"}
		</button>
	);
}

export default function Onboarding() {
	const [step, setStep] = useState<Step>("account");
	const [site, setSite] = useState<Site | null>(null);

	// Account step state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authTab, setAuthTab] = useState<"signup" | "signin">("signup");
	const [accountError, setAccountError] = useState("");
	const [accountLoading, setAccountLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);

	// If already logged in, skip straight to site step
	useEffect(() => {
		fetch(`${API}/api/auth/get-session`, { credentials: "include" })
			.then((r) => r.ok ? r.json() : null)
			.then((d: { user?: { id: string } } | null) => {
				if (d?.user) setStep("site");
			})
			.catch(() => undefined);
	}, []);

	async function signInWithSocial(provider: "github" | "google") {
		setSocialLoading(provider);
		setAccountError("");
		try {
			const res = await fetch(`${API}/api/auth/sign-in/social`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ provider, callbackURL: `${window.location.origin}/onboarding` }),
			});
			if (!res.ok) {
				const d = await res.json() as { message?: string };
				throw new Error(d.message ?? "OAuth failed");
			}
			const d = await res.json() as { url?: string };
			if (d.url) window.location.href = d.url;
		} catch (err: unknown) {
			setAccountError(err instanceof Error ? err.message : "OAuth error");
			setSocialLoading(null);
		}
	}

	// Site step state
	const [siteName, setSiteName] = useState("");
	const [domain, setDomain] = useState("");
	const [siteError, setSiteError] = useState("");
	const [siteLoading, setSiteLoading] = useState(false);

	async function handleAccount(e: React.FormEvent) {
		e.preventDefault();
		setAccountError("");
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
				const d = await res.json() as { message?: string };
				throw new Error(d.message ?? "Authentication failed");
			}
			setStep("site");
		} catch (err: unknown) {
			setAccountError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setAccountLoading(false);
		}
	}

	async function handleSite(e: React.FormEvent) {
		e.preventDefault();
		setSiteError("");
		setSiteLoading(true);
		try {
			// Normalize domain: strip protocol and trailing slash
			const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
			const res = await fetch(`${API}/api/sites`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name: siteName, domain: cleanDomain }),
			});
			if (!res.ok) {
				const d = await res.json() as { message?: string };
				throw new Error(d.message ?? "Failed to create site");
			}
			const created = await res.json() as Site;
			setSite(created);
			setStep("install");
		} catch (err: unknown) {
			setSiteError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setSiteLoading(false);
		}
	}

	const installCode = site
		? `import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Analytics siteId="${site.id}" />
    </body></html>
  )
}`
		: "";

	const npmInstall = "npm install @traytic/analytics";

	return (
		<div className="min-h-screen" style={{ backgroundColor: C.bg }}>
			{/* Nav */}
			<header style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: `${C.bg}ee`, backdropFilter: "blur(12px)" }}>
				<div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-2">
					<a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
						<LogoMark size={24} />
						<span className="text-[14px] font-semibold tracking-tight" style={{ color: C.text, fontFamily: C.display }}>
							Traytic
						</span>
					</a>
				</div>
			</header>

			<main className="max-w-3xl mx-auto px-6 py-12">
				{/* Step indicators */}
				<div className="flex items-center gap-6 mb-10">
					<StepIndicator current={step === "account"} n={1} label="Create account" />
					<div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
					<StepIndicator current={step === "site"} n={2} label="Add your site" />
					<div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
					<StepIndicator current={step === "install"} n={3} label="Install SDK" />
				</div>

				<AnimatePresence mode="wait">
					{/* ── Step 1: Account ───────────────────────────────────────────── */}
					{step === "account" && (
						<motion.div
							key="account"
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -16 }}
							transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
							className="p-8 rounded-2xl"
							style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
							<h1 className="text-[24px] font-bold tracking-tight mb-1" style={{ color: C.text, fontFamily: C.display }}>
								Create your account
							</h1>
							<p className="text-[14px] mb-6" style={{ color: C.textMuted, fontFamily: C.sans }}>
								Free plan · 1 site · 50,000 events / month · No credit card
							</p>

							{/* Social auth */}
							<div className="flex flex-col gap-2.5 mb-6">
								<button
									type="button"
									onClick={() => signInWithSocial("github")}
									disabled={socialLoading !== null}
									className="w-full py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 disabled:opacity-50"
									style={{ backgroundColor: C.surface, color: C.text, border: `1px solid ${C.border}`, fontFamily: C.sans, cursor: "pointer" }}>
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
									disabled={socialLoading !== null}
									className="w-full py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 disabled:opacity-50"
									style={{ backgroundColor: C.surface, color: C.text, border: `1px solid ${C.border}`, fontFamily: C.sans, cursor: "pointer" }}>
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
										onClick={() => { setAuthTab(t); setAccountError(""); }}
										className="flex-1 py-2 rounded-md text-[13px] font-medium transition-all"
										style={{
											fontFamily: C.sans,
											backgroundColor: authTab === t ? C.surface : "transparent",
											color: authTab === t ? C.text : C.textMuted,
											border: authTab === t ? `1px solid ${C.border}` : "1px solid transparent",
											cursor: "pointer",
										}}>
										{t === "signup" ? "Sign up" : "Sign in"}
									</button>
								))}
							</div>

							<form onSubmit={handleAccount} className="flex flex-col gap-4">
								<AnimatePresence mode="wait">
									{authTab === "signup" && (
										<motion.div
											key="name-field"
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
												required={authTab === "signup"}
												className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
												style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
											/>
										</motion.div>
									)}
								</AnimatePresence>

								<div>
									<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>Email</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										required
										className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
										style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
									/>
								</div>

								<div>
									<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>Password</label>
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="At least 8 characters"
										minLength={8}
										required
										className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
										style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
									/>
								</div>

								<AnimatePresence>
									{accountError && (
										<motion.p
											initial={{ opacity: 0, y: -4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0 }}
											className="text-[12px] px-3 py-2 rounded-lg"
											style={{ color: C.red, backgroundColor: `oklch(0.65 0.2 25 / 10%)`, border: `1px solid oklch(0.65 0.2 25 / 20%)`, fontFamily: C.mono }}>
											{accountError}
										</motion.p>
									)}
								</AnimatePresence>

								<button
									type="submit"
									disabled={accountLoading}
									className="w-full py-3 rounded-lg text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
									style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, border: "none", cursor: accountLoading ? "not-allowed" : "pointer" }}>
									{accountLoading && <Spinner />}
									{accountLoading ? "Creating account…" : "Continue →"}
								</button>
							</form>
						</motion.div>
					)}

					{/* ── Step 2: Site ──────────────────────────────────────────────── */}
					{step === "site" && (
						<motion.div
							key="site"
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -16 }}
							transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
							className="p-8 rounded-2xl"
							style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
							<h2 className="text-[24px] font-bold tracking-tight mb-1" style={{ color: C.text, fontFamily: C.display }}>
								Add your site
							</h2>
							<p className="text-[14px] mb-6" style={{ color: C.textMuted, fontFamily: C.sans }}>
								Free plan includes 1 site. You can upgrade anytime to add more.
							</p>

							<form onSubmit={handleSite} className="flex flex-col gap-4">
								<div>
									<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>
										Site name
									</label>
									<input
										type="text"
										value={siteName}
										onChange={(e) => setSiteName(e.target.value)}
										placeholder="My Startup"
										required
										className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
										style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
									/>
								</div>

								<div>
									<label className="block text-[12px] mb-1.5" style={{ color: C.textMuted, fontFamily: C.mono }}>
										Domain
									</label>
									<input
										type="text"
										value={domain}
										onChange={(e) => setDomain(e.target.value)}
										placeholder="mystartup.com"
										required
										className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
										style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.sans }}
									/>
									<p className="mt-1 text-[11px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
										Without https:// — e.g. mystartup.com
									</p>
								</div>

								<AnimatePresence>
									{siteError && (
										<motion.p
											initial={{ opacity: 0, y: -4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0 }}
											className="text-[12px] px-3 py-2 rounded-lg"
											style={{ color: C.red, backgroundColor: `oklch(0.65 0.2 25 / 10%)`, border: `1px solid oklch(0.65 0.2 25 / 20%)`, fontFamily: C.mono }}>
											{siteError}
											{siteError.includes("Upgrade") && (
												<a href="/upgrade?plan=pro" style={{ color: C.accentText, textDecoration: "underline", marginLeft: 6 }}>
													Upgrade →
												</a>
											)}
										</motion.p>
									)}
								</AnimatePresence>

								<button
									type="submit"
									disabled={siteLoading}
									className="w-full py-3 rounded-lg text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
									style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, border: "none", cursor: siteLoading ? "not-allowed" : "pointer" }}>
									{siteLoading && <Spinner />}
									{siteLoading ? "Creating site…" : "Create site →"}
								</button>
							</form>
						</motion.div>
					)}

					{/* ── Step 3: Install ───────────────────────────────────────────── */}
					{step === "install" && site && (
						<motion.div
							key="install"
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -16 }}
							transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
							{/* Success badge */}
							<div
								className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase"
								style={{ border: `1px solid oklch(0.72 0.17 145 / 30%)`, backgroundColor: `oklch(0.72 0.17 145 / 10%)`, color: C.green, fontFamily: C.mono }}>
								<span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green, boxShadow: `0 0 6px ${C.green}` }} />
								Site created — {site.domain}
							</div>

							<h2 className="text-[24px] font-bold tracking-tight mb-1" style={{ color: C.text, fontFamily: C.display }}>
								Install the SDK
							</h2>
							<p className="text-[14px] mb-8" style={{ color: C.textMuted, fontFamily: C.sans }}>
								Two steps. Under 5 minutes. Sub-3kb, no performance impact.
							</p>

							{/* Step 01 */}
							<div className="mb-6">
								<p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
									01 — Install package
								</p>
								<div
									className="flex items-center justify-between px-4 py-3 rounded-xl"
									style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
									<code className="text-[13px]" style={{ color: C.accentText, fontFamily: C.mono }}>
										{npmInstall}
									</code>
									<CopyButton text={npmInstall} />
								</div>
							</div>

							{/* Step 02 */}
							<div className="mb-8">
								<p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: C.accentText, fontFamily: C.mono }}>
									02 — Add to your root layout
								</p>
								<div
									className="relative rounded-xl overflow-hidden"
									style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
									<div className="absolute top-3 right-3">
										<CopyButton text={installCode} />
									</div>
									<pre
										className="p-4 text-[12px] leading-relaxed overflow-x-auto"
										style={{ color: C.accentText, fontFamily: C.mono, whiteSpace: "pre" }}>
										{installCode}
									</pre>
								</div>
							</div>

							{/* Site ID callout */}
							<div
								className="p-4 rounded-xl mb-8"
								style={{ backgroundColor: C.accentBg, border: `1px solid ${C.accentBorder}` }}>
								<p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: C.accentText, fontFamily: C.mono }}>
									Your site ID
								</p>
								<div className="flex items-center justify-between gap-4">
									<code className="text-[13px] break-all" style={{ color: C.text, fontFamily: C.mono }}>
										{site.id}
									</code>
									<CopyButton text={site.id} />
								</div>
							</div>

							<div className="flex flex-wrap gap-3">
								<a
									href="/"
									className="px-5 py-2.5 text-[13px] font-medium rounded-lg transition-opacity hover:opacity-90"
									style={{ backgroundColor: C.accent, color: "#fff", fontFamily: C.sans, textDecoration: "none" }}>
									Go to home →
								</a>
								<a
									href="/upgrade?plan=pro"
									className="px-5 py-2.5 text-[13px] font-medium rounded-lg transition-opacity hover:opacity-80"
									style={{ color: C.text, fontFamily: C.sans, border: `1px solid ${C.border}`, textDecoration: "none" }}>
									Upgrade for more sites
								</a>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
}
