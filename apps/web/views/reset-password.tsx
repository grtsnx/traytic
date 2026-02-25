"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const C = {
	bg: "oklch(0.08 0.006 265)",
	bgDeep: "oklch(0.055 0.008 265)",
	surface: "oklch(0.115 0.008 265)",
	border: "oklch(1 0 0 / 7%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentText: "oklch(0.74 0.15 265)",
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

function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<rect width="24" height="24" rx="7" fill={C.accent} />
			<path d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="19.5" cy="8.5" r="1.5" fill={C.green} />
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

function Field({
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	required,
	minLength,
}: {
	label: string;
	type?: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	required?: boolean;
	minLength?: number;
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
					backgroundColor: C.bgDeep,
					border: `1.5px solid ${focused ? C.accent : C.border}`,
					color: C.text,
					transition: "border-color 0.15s, box-shadow 0.15s",
					boxSizing: "border-box",
					boxShadow: focused ? `0 0 0 3px oklch(0.62 0.22 265 / 12%)` : "none",
				}}
			/>
		</div>
	);
}

function ResetPasswordForm({ token }: { token: string }) {
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (password !== confirm) {
			toast.error("Passwords don't match");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${API}/api/auth/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, newPassword: password }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to reset password");
			}
			setDone(true);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (done) {
		return (
			<div style={{ textAlign: "center", padding: "28px 0" }}>
				<div
					style={{
						width: "48px",
						height: "48px",
						borderRadius: "50%",
						backgroundColor: C.greenBg,
						border: `1px solid ${C.greenBorder}`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 16px",
					}}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5">
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</div>
				<h2 style={{ fontFamily: C.display, fontSize: "22px", fontWeight: "800", color: C.text, marginBottom: "8px", letterSpacing: "-0.03em" }}>
					Password updated
				</h2>
				<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "28px", lineHeight: 1.6 }}>
					Your password has been reset successfully.
				</p>
				<Link
					href="/onboarding"
					style={{
						display: "inline-flex",
						alignItems: "center",
						padding: "11px 24px",
						borderRadius: "10px",
						fontSize: "14px",
						fontWeight: "600",
						fontFamily: C.sans,
						backgroundColor: C.accent,
						color: "#fff",
						textDecoration: "none",
					}}>
					Sign in →
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
			<Field label="New password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required minLength={8} />
			<Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" required minLength={8} />
			<button
				type="submit"
				disabled={loading}
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
					backgroundColor: C.accent,
					color: "#fff",
					border: "none",
					cursor: loading ? "not-allowed" : "pointer",
					opacity: loading ? 0.65 : 1,
					transition: "opacity 0.15s",
					marginTop: "4px",
				}}>
				{loading && <Spinner />}
				{loading ? "Updating…" : "Set new password"}
			</button>
		</form>
	);
}

export default function ResetPassword() {
	const params = useSearchParams();
	const token = params.get("token") ?? "";

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
			{/* Background dot grid */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `radial-gradient(oklch(1 0 0 / 4%) 1px, transparent 1px)`,
					backgroundSize: "28px 28px",
					pointerEvents: "none",
				}}
			/>

			{/* Ambient glow */}
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
					<span style={{ fontFamily: C.display, fontSize: "15px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em" }}>
						Traytic
					</span>
				</Link>
			</header>

			<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 1 }}>
				<div style={{ maxWidth: "400px", width: "100%" }}>
					{!token ? (
						<div
							style={{
								textAlign: "center",
								padding: "28px 24px",
								borderRadius: "14px",
								backgroundColor: C.surface,
								border: `1px solid oklch(0.65 0.2 25 / 20%)`,
							}}>
							<h2 style={{ fontFamily: C.display, fontSize: "20px", fontWeight: "700", color: C.text, marginBottom: "8px" }}>
								Invalid reset link
							</h2>
							<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "20px" }}>
								This link is missing a token. Request a new one.
							</p>
							<Link
								href="/onboarding"
								style={{ fontFamily: C.sans, fontSize: "13px", color: C.accentText, textDecoration: "none" }}>
								← Back to sign in
							</Link>
						</div>
					) : (
						<div
							style={{
								padding: "36px 32px",
								borderRadius: "14px",
								backgroundColor: C.surface,
								border: `1px solid ${C.border}`,
							}}>
							<h1
								style={{
									fontFamily: C.display,
									fontSize: "24px",
									fontWeight: "800",
									color: C.text,
									letterSpacing: "-0.03em",
									marginBottom: "6px",
								}}>
								Set new password
							</h1>
							<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "24px" }}>
								Choose a strong password for your account.
							</p>
							<ResetPasswordForm token={token} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
