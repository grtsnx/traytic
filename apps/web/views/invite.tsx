"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const C = {
	bg: "oklch(0.08 0.006 265)",
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
	redText: "oklch(0.70 0.18 25)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

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

function Spinner({ size = 20 }: { size?: number }) {
	return (
		<svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
			<circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
			<path d="M12 2a10 10 0 0 1 10 10" />
		</svg>
	);
}

type InviteState = "loading" | "success" | "already-member" | "needs-auth" | "error";

export default function Invite() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [state, setState] = useState<InviteState>("loading");
	const [orgName, setOrgName] = useState<string>("");
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (!token) {
			setState("error");
			setError("No invitation token provided.");
			return;
		}

		async function accept() {
			try {
				const sessionRes = await fetch(`${API}/api/auth/get-session`, { credentials: "include" });
				if (!sessionRes.ok) {
					setState("needs-auth");
					return;
				}

				const sessionData = (await sessionRes.json()) as { user?: { id: string } } | null;
				if (!sessionData?.user) {
					setState("needs-auth");
					return;
				}

				const res = await fetch(`${API}/orgs/invitations/accept`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ token }),
				});

				if (!res.ok) {
					const d = (await res.json()) as { message?: string };
					throw new Error(d.message ?? "Failed to accept invitation");
				}

				const data = (await res.json()) as { orgName?: string; alreadyMember?: boolean };
				setOrgName(data.orgName ?? "the organization");

				if (data.alreadyMember) {
					setState("already-member");
				} else {
					setState("success");
				}

				setTimeout(() => {
					window.location.href = "/dashboard";
				}, 2500);
			} catch (err: unknown) {
				setState("error");
				setError(err instanceof Error ? err.message : "Something went wrong");
			}
		}

		accept();
	}, [token]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
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

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
				style={{
					position: "relative",
					zIndex: 1,
					maxWidth: "420px",
					width: "100%",
					padding: "40px 32px",
					backgroundColor: C.surface,
					border: `1px solid ${C.border}`,
					borderRadius: "16px",
					textAlign: "center",
				}}>
				<div style={{ marginBottom: "24px" }}>
					<LogoMark size={36} />
				</div>

				{state === "loading" && (
					<>
						<div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: C.textMuted }}>
							<Spinner size={28} />
						</div>
						<h2 style={{ fontFamily: C.display, fontSize: "20px", fontWeight: "700", color: C.text, marginBottom: "8px", letterSpacing: "-0.02em" }}>
							Accepting invitation...
						</h2>
						<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted }}>
							Please wait while we process your invitation.
						</p>
					</>
				)}

				{state === "success" && (
					<>
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
						<h2 style={{ fontFamily: C.display, fontSize: "20px", fontWeight: "700", color: C.text, marginBottom: "8px", letterSpacing: "-0.02em" }}>
							Welcome to {orgName}!
						</h2>
						<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "20px" }}>
							You've been added to the team. Redirecting to your dashboard...
						</p>
						<Link
							href="/dashboard"
							style={{
								display: "inline-block",
								padding: "10px 24px",
								borderRadius: "10px",
								backgroundColor: C.accent,
								color: "#fff",
								fontFamily: C.sans,
								fontSize: "14px",
								fontWeight: "600",
								textDecoration: "none",
							}}>
							Go to dashboard
						</Link>
					</>
				)}

				{state === "already-member" && (
					<>
						<h2 style={{ fontFamily: C.display, fontSize: "20px", fontWeight: "700", color: C.text, marginBottom: "8px", letterSpacing: "-0.02em" }}>
							Already a member
						</h2>
						<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "20px" }}>
							You're already a member of {orgName}. Redirecting...
						</p>
						<Link
							href="/dashboard"
							style={{
								display: "inline-block",
								padding: "10px 24px",
								borderRadius: "10px",
								backgroundColor: C.accent,
								color: "#fff",
								fontFamily: C.sans,
								fontSize: "14px",
								fontWeight: "600",
								textDecoration: "none",
							}}>
							Go to dashboard
						</Link>
					</>
				)}

				{state === "needs-auth" && (
					<>
						<h2 style={{ fontFamily: C.display, fontSize: "20px", fontWeight: "700", color: C.text, marginBottom: "8px", letterSpacing: "-0.02em" }}>
							Sign in to continue
						</h2>
						<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.textMuted, marginBottom: "20px" }}>
							You need to sign in or create an account before accepting this invitation.
						</p>
						<Link
							href={`/onboarding?redirect=${encodeURIComponent(`/invite?token=${token}`)}`}
							style={{
								display: "inline-block",
								padding: "10px 24px",
								borderRadius: "10px",
								backgroundColor: C.accent,
								color: "#fff",
								fontFamily: C.sans,
								fontSize: "14px",
								fontWeight: "600",
								textDecoration: "none",
							}}>
							Sign in
						</Link>
					</>
				)}

				{state === "error" && (
					<>
						<div
							style={{
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								backgroundColor: C.redBg,
								border: `1px solid ${C.redBorder}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 16px",
							}}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</div>
						<h2 style={{ fontFamily: C.display, fontSize: "20px", fontWeight: "700", color: C.text, marginBottom: "8px", letterSpacing: "-0.02em" }}>
							Invitation failed
						</h2>
						<p style={{ fontFamily: C.sans, fontSize: "14px", color: C.redText, marginBottom: "20px" }}>
							{error}
						</p>
						<Link
							href="/dashboard"
							style={{
								display: "inline-block",
								padding: "10px 24px",
								borderRadius: "10px",
								backgroundColor: C.surface,
								color: C.textMuted,
								fontFamily: C.sans,
								fontSize: "14px",
								fontWeight: "500",
								textDecoration: "none",
								border: `1px solid ${C.border}`,
							}}>
							Go to dashboard
						</Link>
					</>
				)}
			</motion.div>
		</div>
	);
}
