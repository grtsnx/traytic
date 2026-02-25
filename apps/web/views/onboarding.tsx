"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

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

type Step = "auth" | "create-org" | "invite-team" | "add-site" | "verify";

type OrgData = { id: string; name: string; slug: string };

type SiteData = {
	id: string;
	name: string;
	domain: string;
	apiKey: string;
};

// ── Utility components ─────────────────────────────────────────────────────────

function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<rect width="24" height="24" rx="7" fill={C.accent} />
			<path
				d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5"
				stroke="white"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
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

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "36px" }}>
			{steps.map((label, i) => (
				<React.Fragment key={label}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<div
							style={{
								width: "24px",
								height: "24px",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "11px",
								fontFamily: C.mono,
								fontWeight: "700",
								backgroundColor: i < current ? C.green : i === current ? C.accent : C.surface,
								color: i <= current ? "#fff" : C.textMuted,
								border: i > current ? `1.5px solid ${C.border}` : "none",
								transition: "all 0.3s",
							}}>
							{i < current ? (
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							) : (
								i + 1
							)}
						</div>
						<span
							className="hidden sm:inline"
							style={{
								fontFamily: C.sans,
								fontSize: "12px",
								color: i === current ? C.text : C.textMuted,
								fontWeight: i === current ? "500" : "400",
								whiteSpace: "nowrap",
							}}>
							{label}
						</span>
					</div>
					{i < steps.length - 1 && (
						<div
							style={{
								flex: 1,
								height: "1px",
								margin: "0 12px",
								backgroundColor: i < current ? C.green : C.border,
								minWidth: "12px",
								transition: "background-color 0.3s",
							}}
						/>
					)}
				</React.Fragment>
			))}
		</div>
	);
}

function Field({
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	required,
	minLength,
	hint,
	rightSlot,
}: {
	label: string;
	type?: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	required?: boolean;
	minLength?: number;
	hint?: string;
	rightSlot?: React.ReactNode;
}) {
	const [focused, setFocused] = useState(false);
	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
				<label
					style={{
						fontFamily: C.mono,
						fontSize: "11px",
						color: focused ? C.accentText : C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
						transition: "color 0.15s",
					}}>
					{label}
				</label>
				{rightSlot}
			</div>
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
					backgroundColor: C.bgDeep,
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

function PrimaryBtn({
	children,
	disabled,
	onClick,
	type = "button",
	variant = "accent",
}: {
	children: React.ReactNode;
	disabled?: boolean;
	onClick?: () => void;
	type?: "button" | "submit";
	variant?: "accent" | "ghost";
}) {
	const isGhost = variant === "ghost";
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			style={{
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
				backgroundColor: isGhost ? "transparent" : C.accent,
				color: isGhost ? C.textMuted : "#fff",
				border: isGhost ? `1.5px solid ${C.border}` : "none",
				cursor: disabled ? "not-allowed" : "pointer",
				opacity: disabled ? 0.65 : 1,
				transition: "opacity 0.15s",
			}}>
			{children}
		</button>
	);
}

function CodeBlock({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	function handleCopy() {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div style={{ position: "relative" }}>
			<pre
				style={{
					backgroundColor: C.bgDeep,
					border: `1px solid ${C.border}`,
					borderRadius: "10px",
					padding: "16px 18px",
					fontSize: "12px",
					fontFamily: C.mono,
					color: C.accentText,
					overflow: "auto",
					lineHeight: "1.7",
					whiteSpace: "pre",
					margin: 0,
				}}>
				{code}
			</pre>
			<button
				type="button"
				onClick={handleCopy}
				style={{
					position: "absolute",
					top: "10px",
					right: "10px",
					padding: "4px 10px",
					borderRadius: "6px",
					fontSize: "11px",
					fontFamily: C.mono,
					backgroundColor: copied ? C.greenBg : C.surface,
					color: copied ? C.green : C.textMuted,
					border: `1px solid ${copied ? C.greenBorder : C.border}`,
					cursor: "pointer",
					transition: "all 0.15s",
				}}>
				{copied ? "Copied" : "Copy"}
			</button>
		</div>
	);
}

// ── Auth step ──────────────────────────────────────────────────────────────────

function AuthStep({ onComplete }: { onComplete: () => void }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authTab, setAuthTab] = useState<"signup" | "signin">("signup");
	const [accountLoading, setAccountLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);
	const [showForgot, setShowForgot] = useState(false);
	const [forgotEmail, setForgotEmail] = useState("");
	const [forgotLoading, setForgotLoading] = useState(false);
	const [forgotSent, setForgotSent] = useState(false);
	const [providers, setProviders] = useState<{ github: boolean; google: boolean } | null>(null);

	useEffect(() => {
		fetch(`${API}/api/auth/providers`)
			.then((r) => (r.ok ? r.json() : null))
			.then((d: { github: boolean; google: boolean } | null) => {
				if (d) setProviders(d);
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
				body: JSON.stringify({ provider, callbackURL: `${window.location.origin}/onboarding?step=create-org` }),
			});
			if (res.status === 404) {
				const label = provider === "github" ? "GitHub" : "Google";
				throw new Error(`${label} OAuth not configured — add ${label}_CLIENT_ID to the API .env`);
			}
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
			onComplete();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setAccountLoading(false);
		}
	}

	async function handleForgot(e: React.FormEvent) {
		e.preventDefault();
		setForgotLoading(true);
		try {
			const res = await fetch(`${API}/api/auth/forget-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: forgotEmail, redirectTo: `${window.location.origin}/reset-password` }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to send reset email");
			}
			setForgotSent(true);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setForgotLoading(false);
		}
	}

	const SOCIAL_PROVIDERS: { p: "github" | "google"; label: string; icon: React.ReactNode }[] = [
		{
			p: "github",
			label: "GitHub",
			icon: (
				<svg width="16" height="16" viewBox="0 0 24 24" fill={C.text}>
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
				</svg>
			),
		},
		{
			p: "google",
			label: "Google",
			icon: (
				<svg width="16" height="16" viewBox="0 0 24 24">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
				</svg>
			),
		},
	];

	const visibleProviders = providers
		? SOCIAL_PROVIDERS.filter(({ p }) => providers[p])
		: SOCIAL_PROVIDERS;

	return (
		<AnimatePresence mode="wait">
			{showForgot ? (
				<motion.div
					key="forgot"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -12 }}
					transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
					{forgotSent ? (
						<div style={{ textAlign: "center", paddingTop: "28px" }}>
							<div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: C.greenBg, border: `1px solid ${C.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
							</div>
							<h3 style={{ fontFamily: C.display, fontSize: "22px", fontWeight: "800", color: C.text, marginBottom: "8px", letterSpacing: "-0.03em" }}>Check your email</h3>
							<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px", lineHeight: 1.6 }}>
								We sent a reset link to{" "}
								<strong style={{ color: C.text, fontWeight: "500" }}>{forgotEmail}</strong>
							</p>
							<button
								type="button"
								onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); setAuthTab("signin"); }}
								style={{ background: "none", border: "none", color: C.accentText, cursor: "pointer", fontFamily: C.sans, fontSize: "13px", fontWeight: "500", padding: 0 }}>
								← Back to sign in
							</button>
						</div>
					) : (
						<>
							<h1 style={{ fontFamily: C.display, fontSize: "26px", fontWeight: "800", color: C.text, letterSpacing: "-0.03em", marginBottom: "6px" }}>
								Reset password
							</h1>
							<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
								Enter your email and we&apos;ll send you a reset link.
							</p>
							<form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
								<Field label="Email" type="email" value={forgotEmail} onChange={setForgotEmail} placeholder="you@example.com" required />
								<PrimaryBtn type="submit" disabled={forgotLoading}>
									{forgotLoading && <Spinner />}
									{forgotLoading ? "Sending…" : "Send reset link"}
								</PrimaryBtn>
								<button
									type="button"
									onClick={() => setShowForgot(false)}
									style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontFamily: C.sans, fontSize: "13px", padding: "4px 0", textAlign: "center" }}>
									← Back to sign in
								</button>
							</form>
						</>
					)}
				</motion.div>
			) : (
				<motion.div
					key="auth"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -12 }}
					transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
					<h1 style={{ fontFamily: C.display, fontSize: "26px", fontWeight: "800", color: C.text, letterSpacing: "-0.03em", marginBottom: "6px" }}>
						{authTab === "signup" ? "Create your account" : "Welcome back"}
					</h1>
					<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
						{authTab === "signup"
							? "Free · 1 site · 50K events/mo · No card needed"
							: "Sign in to continue to your dashboard"}
					</p>

					{visibleProviders.length > 0 && (
						<div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "22px" }}>
							{visibleProviders.map(({ p, label, icon }) => (
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
					)}

					<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
						<div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>or</span>
						<div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
					</div>

					<form onSubmit={handleAccount} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
						<AnimatePresence mode="wait">
							{authTab === "signup" && (
								<motion.div
									key="name"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.15 }}>
									<Field label="Name" value={name} onChange={setName} placeholder="Your name" required={authTab === "signup"} />
								</motion.div>
							)}
						</AnimatePresence>

						<Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
						<div>
							<Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required minLength={8} />
							{authTab === "signin" && (
								<div style={{ textAlign: "right", marginTop: "6px" }}>
									<button
										type="button"
										onClick={() => { setShowForgot(true); setForgotSent(false); }}
										style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontFamily: C.sans, fontSize: "12px", padding: 0, lineHeight: 1 }}>
										Forgot password?
									</button>
								</div>
							)}
						</div>

						<PrimaryBtn type="submit" disabled={accountLoading}>
							{accountLoading && <Spinner />}
							{accountLoading
								? (authTab === "signup" ? "Creating account…" : "Signing in…")
								: (authTab === "signup" ? "Continue →" : "Sign in →")}
						</PrimaryBtn>

						{authTab === "signup" ? (
							<p style={{ textAlign: "center", fontFamily: C.sans, fontSize: "13px", color: C.textMuted, margin: "2px 0 0" }}>
								Already have an account?{" "}
								<button type="button" onClick={() => setAuthTab("signin")} style={{ background: "none", border: "none", color: C.accentText, cursor: "pointer", fontFamily: C.sans, fontSize: "13px", fontWeight: "500", padding: 0 }}>
									Sign in
								</button>
							</p>
						) : (
							<p style={{ textAlign: "center", fontFamily: C.sans, fontSize: "13px", color: C.textMuted, margin: "2px 0 0" }}>
								No account?{" "}
								<button type="button" onClick={() => setAuthTab("signup")} style={{ background: "none", border: "none", color: C.accentText, cursor: "pointer", fontFamily: C.sans, fontSize: "13px", fontWeight: "500", padding: 0 }}>
									Create Account
								</button>
							</p>
						)}
					</form>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ── Create org step ────────────────────────────────────────────────────────────

function CreateOrgStep({ onComplete }: { onComplete: (org: OrgData) => void }) {
	const [orgName, setOrgName] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!orgName.trim()) return;
		setLoading(true);
		try {
			const res = await fetch(`${API}/api/orgs`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name: orgName.trim() }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to create organization");
			}
			const org = (await res.json()) as OrgData;
			onComplete(org);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
			<h1 style={{ fontFamily: C.display, fontSize: "26px", fontWeight: "800", color: C.text, letterSpacing: "-0.03em", marginBottom: "6px" }}>
				Create your organization
			</h1>
			<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
				This is where your team&apos;s sites and analytics live. You can rename it later.
			</p>

			<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<Field
					label="Organization name"
					value={orgName}
					onChange={setOrgName}
					placeholder="e.g. My Company, Personal, Acme Corp"
					required
				/>
				<PrimaryBtn type="submit" disabled={loading || !orgName.trim()}>
					{loading && <Spinner />}
					{loading ? "Creating…" : "Continue →"}
				</PrimaryBtn>
			</form>
		</motion.div>
	);
}

// ── Invite team step ───────────────────────────────────────────────────────────

function InviteTeamStep({ org, onComplete }: { org: OrgData; onComplete: () => void }) {
	const [emails, setEmails] = useState<string[]>([""]);
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(0);

	function addRow() {
		setEmails((prev) => [...prev, ""]);
	}

	function updateEmail(i: number, value: string) {
		setEmails((prev) => prev.map((e, idx) => (idx === i ? value : e)));
	}

	function removeRow(i: number) {
		setEmails((prev) => prev.filter((_, idx) => idx !== i));
	}

	async function handleInvite() {
		const validEmails = emails.filter((e) => e.trim() && e.includes("@"));
		if (validEmails.length === 0) {
			onComplete();
			return;
		}
		setLoading(true);
		let successCount = 0;
		for (const email of validEmails) {
			try {
				const res = await fetch(`${API}/api/orgs/${org.id}/invitations`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ email: email.trim() }),
				});
				if (res.ok) successCount++;
			} catch {
				// continue with remaining
			}
		}
		setSent(successCount);
		setLoading(false);
		if (successCount > 0) {
			toast.success(`${successCount} invitation${successCount > 1 ? "s" : ""} sent`);
		}
		setTimeout(onComplete, 800);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
			<h1 style={{ fontFamily: C.display, fontSize: "26px", fontWeight: "800", color: C.text, letterSpacing: "-0.03em", marginBottom: "6px" }}>
				Invite your team
			</h1>
			<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
				Invite teammates to <strong style={{ color: C.text, fontWeight: "500" }}>{org.name}</strong>. They&apos;ll get an email with a link to join. You can always do this later.
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
				{emails.map((email, i) => (
					<div key={i} style={{ display: "flex", gap: "8px" }}>
						<div style={{ flex: 1 }}>
							<input
								type="email"
								value={email}
								onChange={(e) => updateEmail(i, e.target.value)}
								placeholder="teammate@company.com"
								style={{
									width: "100%",
									padding: "10px 14px",
									borderRadius: "10px",
									fontSize: "14px",
									outline: "none",
									fontFamily: C.sans,
									backgroundColor: C.bgDeep,
									border: `1.5px solid ${C.border}`,
									color: C.text,
									boxSizing: "border-box",
								}}
							/>
						</div>
						{emails.length > 1 && (
							<button
								type="button"
								onClick={() => removeRow(i)}
								style={{
									width: "38px",
									height: "38px",
									borderRadius: "10px",
									border: `1px solid ${C.border}`,
									backgroundColor: "transparent",
									color: C.textMuted,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
									marginTop: "1px",
								}}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						)}
					</div>
				))}
			</div>

			<button
				type="button"
				onClick={addRow}
				style={{
					background: "none",
					border: "none",
					color: C.accentText,
					cursor: "pointer",
					fontFamily: C.sans,
					fontSize: "13px",
					fontWeight: "500",
					padding: 0,
					marginBottom: "24px",
					display: "flex",
					alignItems: "center",
					gap: "6px",
				}}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				Add another
			</button>

			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				<PrimaryBtn onClick={handleInvite} disabled={loading}>
					{loading && <Spinner />}
					{loading ? `Sending ${sent > 0 ? `(${sent} sent)` : ""}…` : "Send invitations & continue →"}
				</PrimaryBtn>
				<PrimaryBtn variant="ghost" onClick={onComplete} disabled={loading}>
					Skip for now →
				</PrimaryBtn>
			</div>
		</motion.div>
	);
}

// ── Add site step ──────────────────────────────────────────────────────────────

function AddSiteStep({ onComplete }: { onComplete: (site: SiteData) => void }) {
	const [domain, setDomain] = useState("");
	const [siteName, setSiteName] = useState("");
	const [loading, setLoading] = useState(false);

	function cleanDomain(raw: string): string {
		let d = raw.trim().toLowerCase();
		d = d.replace(/^https?:\/\//, "");
		d = d.replace(/\/.*$/, "");
		d = d.replace(/^www\./, "");
		return d;
	}

	function deriveName(d: string): string {
		const clean = cleanDomain(d);
		if (!clean) return "";
		const parts = clean.split(".");
		return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const cleanedDomain = cleanDomain(domain);
		if (!cleanedDomain) {
			toast.error("Please enter a valid domain");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${API}/api/sites`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					name: siteName || deriveName(domain),
					domain: cleanedDomain,
				}),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to create site");
			}
			const site = (await res.json()) as SiteData;
			onComplete(site);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
			<h1 style={{ fontFamily: C.display, fontSize: "26px", fontWeight: "800", color: C.text, letterSpacing: "-0.03em", marginBottom: "6px" }}>
				Add your site
			</h1>
			<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px" }}>
				Enter the domain you want to track. We&apos;ll generate a tracking snippet for you.
			</p>

			<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<Field
					label="Domain"
					value={domain}
					onChange={(v) => {
						setDomain(v);
						if (!siteName) setSiteName("");
					}}
					placeholder="Enter just the domain, e.g. example.com"
					required
				/>
				<Field
					label="Site name"
					value={siteName || deriveName(domain)}
					onChange={setSiteName}
					placeholder="A friendly label for your dashboard, e.g. My Site"
				/>

				<PrimaryBtn type="submit" disabled={loading}>
					{loading && <Spinner />}
					{loading ? "Creating site…" : "Add site & continue →"}
				</PrimaryBtn>
			</form>
		</motion.div>
	);
}

// ── Verify / snippet step ──────────────────────────────────────────────────────

function VerifyStep({ site, onComplete }: { site: SiteData; onComplete: () => void }) {
	const [liveCount, setLiveCount] = useState<number | null>(null);
	const [checking, setChecking] = useState(true);
	const [detected, setDetected] = useState(false);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const attemptsRef = useRef(0);

	const checkLive = useCallback(async () => {
		try {
			const res = await fetch(`${API}/api/events/${site.id}/live`, {
				credentials: "include",
			});
			if (res.ok) {
				const count = (await res.json()) as number;
				setLiveCount(count);
				if (count > 0) {
					setDetected(true);
					setChecking(false);
					if (pollRef.current) clearInterval(pollRef.current);
				}
			}
		} catch {
			// network error, keep polling
		}
		attemptsRef.current++;
	}, [site.id]);

	useEffect(() => {
		checkLive();
		pollRef.current = setInterval(checkLive, 5000);
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, [checkLive]);

	const snippetNext = `import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}`;

	const snippetScript = `<script defer src="${API}/tracker.js"></script>`;

	const [tab, setTab] = useState<"next" | "script">("next");

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
			<h1 style={{ fontFamily: C.display, fontSize: "26px", fontWeight: "800", color: C.text, letterSpacing: "-0.03em", marginBottom: "6px" }}>
				Install the tracking snippet
			</h1>
			<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "24px" }}>
				Add the snippet to <strong style={{ color: C.text, fontWeight: "500" }}>{site.domain}</strong>, then visit your site. We&apos;ll detect events automatically.
			</p>

			<div style={{ display: "flex", gap: "2px", marginBottom: "14px", backgroundColor: C.bgDeep, borderRadius: "9px", padding: "3px", border: `1px solid ${C.border}` }}>
				{(["next", "script"] as const).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(t)}
						style={{
							flex: 1,
							padding: "7px 12px",
							borderRadius: "7px",
							fontSize: "12px",
							fontWeight: tab === t ? "600" : "400",
							fontFamily: C.mono,
							backgroundColor: tab === t ? C.surface : "transparent",
							color: tab === t ? C.text : C.textMuted,
							border: tab === t ? `1px solid ${C.border}` : "1px solid transparent",
							cursor: "pointer",
							transition: "all 0.12s",
						}}>
						{t === "next" ? "Next.js" : "Script tag"}
					</button>
				))}
			</div>

			<CodeBlock code={tab === "next" ? snippetNext : snippetScript} />

			<div
				style={{
					marginTop: "20px",
					padding: "16px 18px",
					borderRadius: "12px",
					backgroundColor: detected ? C.greenBg : C.surface,
					border: `1px solid ${detected ? C.greenBorder : C.border}`,
					display: "flex",
					alignItems: "center",
					gap: "12px",
					transition: "all 0.3s",
				}}>
				{detected ? (
					<>
						<div
							style={{
								width: "10px",
								height: "10px",
								borderRadius: "50%",
								backgroundColor: C.green,
								boxShadow: `0 0 10px ${C.green}`,
								flexShrink: 0,
							}}
						/>
						<div style={{ flex: 1 }}>
							<span style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: "600", color: C.green }}>
								Event detected!
							</span>
							<span style={{ fontFamily: C.mono, fontSize: "12px", color: C.textMuted, display: "block", marginTop: "2px" }}>
								{liveCount} active visitor{liveCount !== 1 ? "s" : ""} right now
							</span>
						</div>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</>
				) : (
					<>
						{checking && <Spinner size={18} />}
						<div style={{ flex: 1 }}>
							<span style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: "500", color: C.text }}>
								Waiting for first event…
							</span>
							<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, display: "block", marginTop: "2px" }}>
								Checking every 5 seconds · {attemptsRef.current > 0 ? `${attemptsRef.current} checks so far` : "starting…"}
							</span>
						</div>
					</>
				)}
			</div>

			<div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
				{detected ? (
					<PrimaryBtn onClick={onComplete}>
						Go to dashboard →
					</PrimaryBtn>
				) : (
					<PrimaryBtn variant="ghost" onClick={onComplete}>
						Skip for now — go to dashboard
					</PrimaryBtn>
				)}
			</div>
		</motion.div>
	);
}

// ── Main Onboarding component ──────────────────────────────────────────────────

const STEP_LABELS = ["Account", "Organization", "Invite team", "Add site", "Verify"];

function stepIndex(step: Step): number {
	return { auth: 0, "create-org": 1, "invite-team": 2, "add-site": 3, verify: 4 }[step];
}

export default function Onboarding() {
	const [step, setStep] = useState<Step>("auth");
	const [org, setOrg] = useState<OrgData | null>(null);
	const [site, setSite] = useState<SiteData | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlStep = params.get("step");

		fetch(`${API}/api/auth/get-session`, { credentials: "include" })
			.then((r) => (r.ok ? r.json() : null))
			.then(async (d: { user?: { id: string } } | null) => {
				if (d?.user) {
					const orgsRes = await fetch(`${API}/api/orgs`, { credentials: "include" });
					const orgs = orgsRes.ok ? ((await orgsRes.json()) as OrgData[]) : [];

					if (urlStep === "create-org" && orgs.length === 0) {
						setStep("create-org");
						return;
					}

					if (orgs.length === 0) {
						setStep("create-org");
						return;
					}

					setOrg(orgs[0]);

					const sitesRes = await fetch(`${API}/api/sites`, { credentials: "include" });
					const sites = sitesRes.ok ? ((await sitesRes.json()) as SiteData[]) : [];

					if (sites.length > 0) {
						window.location.href = "/dashboard";
					} else {
						setStep("add-site");
					}
				}
			})
			.catch(() => undefined);
	}, []);

	function handleAuthComplete() {
		setStep("create-org");
	}

	function handleOrgCreated(newOrg: OrgData) {
		setOrg(newOrg);
		setStep("invite-team");
	}

	function handleInviteComplete() {
		setStep("add-site");
	}

	function handleSiteCreated(newSite: SiteData) {
		setSite(newSite);
		setStep("verify");
	}

	function handleVerifyComplete() {
		window.location.href = "/dashboard";
	}

	async function handleLogout() {
		try {
			await fetch(`${API}/api/auth/sign-out`, {
				method: "POST",
				credentials: "include",
			});
		} catch {
			// proceed even if request fails
		}
		setStep("auth");
		setOrg(null);
		setSite(null);
		window.history.replaceState(null, "", "/onboarding");
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				backgroundColor: C.bg,
				position: "relative",
				overflow: "hidden",
			}}>

			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `radial-gradient(oklch(1 0 0 / 4%) 1px, transparent 1px)`,
					backgroundSize: "28px 28px",
					pointerEvents: "none",
				}}
			/>

			<div
				style={{
					position: "absolute",
					top: "-180px",
					left: "50%",
					transform: "translateX(-50%)",
					width: "720px",
					height: "520px",
					background: `radial-gradient(ellipse, oklch(0.62 0.22 265 / 10%) 0%, transparent 65%)`,
					pointerEvents: "none",
				}}
			/>

			<header
				style={{
					flexShrink: 0,
					padding: "0 40px",
					height: "60px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottom: `1px solid ${C.border}`,
					position: "relative",
					zIndex: 1,
					backgroundColor: `${C.bg}cc`,
					backdropFilter: "blur(12px)",
				}}>
				<Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
					<LogoMark size={26} />
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
				{step !== "auth" && (
					<button
						type="button"
						onClick={handleLogout}
						style={{
							background: "none",
							border: "none",
							fontFamily: C.sans,
							fontSize: "13px",
							color: C.textMuted,
							cursor: "pointer",
							padding: 0,
						}}>
						Log out
					</button>
				)}
			</header>

			<div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
				<div
					style={{
						maxWidth: "520px",
						width: "100%",
						margin: "0 auto",
						padding: "48px 24px 40px",
					}}>

					<StepIndicator
						current={stepIndex(step)}
						steps={STEP_LABELS}
					/>

					<AnimatePresence mode="wait">
						{step === "auth" && (
							<motion.div key="auth-step" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
								<AuthStep onComplete={handleAuthComplete} />
							</motion.div>
						)}
						{step === "create-org" && (
							<motion.div key="org-step" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
								<CreateOrgStep onComplete={handleOrgCreated} />
							</motion.div>
						)}
						{step === "invite-team" && org && (
							<motion.div key="invite-step" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
								<InviteTeamStep org={org} onComplete={handleInviteComplete} />
							</motion.div>
						)}
						{step === "add-site" && (
							<motion.div key="site-step" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
								<AddSiteStep onComplete={handleSiteCreated} />
							</motion.div>
						)}
						{step === "verify" && site && (
							<motion.div key="verify-step" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
								<VerifyStep site={site} onComplete={handleVerifyComplete} />
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
