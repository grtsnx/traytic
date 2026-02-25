"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";

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

const LAST_UPDATED = "February 25, 2026";

type Section = {
	title: string;
	body: string[];
};

const SECTIONS: Section[] = [
	{
		title: "The human version",
		body: [
			"These terms govern your use of Traytic — our analytics platform, APIs, SDKs, and related services. By creating an account or using the service, you agree to these terms. We tried to write them in plain language because nobody enjoys deciphering legalese at 2 AM.",
		],
	},
	{
		title: "1. Your account",
		body: [
			"You need an account to use Traytic. You're responsible for keeping your login credentials secure. If someone gains access to your account because your password is \"password123,\" that's on you. Please use a strong password. We believe in you.",
			"You must be at least 16 years old to create an account. You must provide accurate information. One person or entity per account. You may not share account credentials with others (team plans get their own seats for a reason).",
		],
	},
	{
		title: "2. What you can do",
		body: [
			"With a Traytic account, you can: install our tracking snippet on websites you own or operate, view analytics data through our dashboard, use our APIs to access your data programmatically, and export your data at any time. Your data is yours.",
			"If you're on a free plan, you get 1 site and 50,000 events per month. Paid plans get more, as outlined on our pricing page. If you exceed your plan's limits, we'll let you know — we won't silently drop your data or charge overage fees. That's just rude.",
		],
	},
	{
		title: "3. What you can't do",
		body: [
			"Don't use Traytic to: track websites you don't own or have authorization to track, attempt to reverse-engineer our visitor hashing to identify individuals, send us malicious traffic or attempt to overwhelm our infrastructure, resell or redistribute the service without permission, or do anything illegal. Standard stuff.",
			"Don't abuse our free tier by creating multiple accounts to circumvent limits. We'll notice, and we'll be disappointed. Not angry, just disappointed.",
		],
	},
	{
		title: "4. Self-hosting",
		body: [
			"Traytic is MIT licensed. You can self-host it on your own infrastructure, modify it, fork it, or build on top of it. When self-hosting, you're responsible for your own infrastructure, security, backups, and compliance. We provide the software; you provide the ops.",
			"Self-hosted instances are not covered by our cloud SLA, support agreements, or managed backups. If your self-hosted instance goes down at 3 AM, that's between you and your server.",
		],
	},
	{
		title: "5. Payments and billing",
		body: [
			"Paid plans are billed monthly. Prices are listed on our pricing page and may change with 30 days' notice. We process payments through Stripe (international) and Paystack (African markets). We don't store your full credit card number.",
			"You can cancel anytime. When you cancel, your plan remains active until the end of the current billing period. We don't do refunds for partial months, but we also don't charge early termination fees because this isn't a cell phone contract from 2005.",
			"Free trial periods, if offered, give you full access to paid features. If you don't upgrade before the trial ends, you'll be moved to the free plan. No surprise charges.",
		],
	},
	{
		title: "6. Uptime and reliability",
		body: [
			"We aim for 99.9% uptime for our cloud-hosted service. We don't guarantee it, because the internet is a wild place and servers sometimes have bad days, but we take reliability seriously. If we experience significant downtime, we'll communicate openly about what happened and what we're doing about it.",
			"We reserve the right to perform maintenance that may temporarily affect availability. We'll give advance notice when possible, and we'll try to do it when most of you are asleep.",
		],
	},
	{
		title: "7. Data and ownership",
		body: [
			"You own your data. The analytics collected through your sites belongs to you. We don't claim any ownership or license to it beyond what's needed to provide the service (i.e., storing it and showing it to you).",
			"You can export your data at any time. If you close your account, we delete your data within 30 days. We don't hold your data hostage to keep you as a customer.",
		],
	},
	{
		title: "8. Intellectual property",
		body: [
			"The Traytic name, logo, and brand assets are ours. The open-source code is MIT licensed — use it freely within the license terms. The design of our cloud dashboard, marketing site, and documentation are copyrighted, but since the code is open source, you can see how everything works.",
			"If you build something cool with Traytic, it's yours. We'd love to hear about it, but you don't owe us anything.",
		],
	},
	{
		title: "9. Termination",
		body: [
			"You can close your account at any time from your account settings. We can suspend or terminate accounts that violate these terms, engage in abusive behavior, or pose a security risk. We'll try to warn you first unless the situation is urgent.",
			"Upon termination, your access to the dashboard stops and your data is deleted within 30 days.",
		],
	},
	{
		title: "10. Limitation of liability",
		body: [
			"Traytic is provided \"as is.\" We work hard to make it reliable and useful, but we can't guarantee it will be perfect, uninterrupted, or error-free. We're not liable for indirect, incidental, or consequential damages arising from your use of the service.",
			"Our total liability is limited to the amount you've paid us in the 12 months preceding the claim. For free users, that's zero — which, mathematically, makes this paragraph slightly awkward.",
		],
	},
	{
		title: "11. Changes to these terms",
		body: [
			"We may update these terms from time to time. Material changes will be communicated via email at least 30 days in advance. Continued use after changes take effect means you accept them. If you disagree with a change, you can close your account.",
		],
	},
	{
		title: "12. Governing law",
		body: [
			"These terms are governed by the laws of the jurisdiction in which Traytic operates. Any disputes will be resolved through good-faith negotiation first. If that doesn't work, through binding arbitration. We'd really prefer the negotiation route — lawyers are expensive.",
		],
	},
	{
		title: "13. Contact",
		body: [
			"Questions about these terms? Reach out at legal@traytic.com. We respond to every inquiry, usually within a few business days. If it's urgent, put \"urgent\" in the subject line and we'll bump it up.",
		],
	},
];

export default function Terms() {
	return (
		<div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
			{/* Nav */}
			<header
				className="sticky top-0 z-50"
				style={{
					borderBottom: `1px solid ${C.border}`,
					backgroundColor: `${C.bg}ee`,
					backdropFilter: "blur(12px)",
				}}>
				<div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
						<LogoMark size={24} />
						<span
							className="text-[14px] font-semibold tracking-tight"
							style={{ color: C.text, fontFamily: C.display }}>
							Traytic
						</span>
					</Link>
					<Link
						href="/"
						className="text-[13px] transition-opacity hover:opacity-80"
						style={{ color: C.textMuted, fontFamily: C.sans, textDecoration: "none" }}>
						← Back to home
					</Link>
				</div>
			</header>

			<main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
					<div
						className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide"
						style={{
							border: `1px solid ${C.accentBorder}`,
							backgroundColor: C.accentBg,
							color: C.accentText,
							fontFamily: C.mono,
						}}>
						Last updated: {LAST_UPDATED}
					</div>

					<h1
						className="text-[32px] sm:text-[44px] font-bold tracking-tight mb-4"
						style={{ color: C.text, fontFamily: C.display }}>
						Terms of Service
					</h1>
					<p
						className="text-[17px] leading-relaxed mb-16"
						style={{ color: C.textMuted, fontFamily: C.sans }}>
						The boring-but-important stuff. We kept it readable because life&apos;s too short for 40-page legal documents.
					</p>
				</motion.div>

				<div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
					{SECTIONS.map((section, i) => (
						<motion.section
							key={section.title}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.4,
								delay: 0.1 + i * 0.04,
								ease: [0.25, 0.1, 0.25, 1],
							}}>
							<h2
								className="text-[20px] font-bold tracking-tight mb-4"
								style={{ color: C.text, fontFamily: C.display }}>
								{section.title}
							</h2>
							<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
								{section.body.map((para, j) => (
									<p
										key={j}
										className="text-[15px] leading-[1.8]"
										style={{ color: C.textMuted, fontFamily: C.sans }}>
										{para}
									</p>
								))}
							</div>
						</motion.section>
					))}
				</div>

				{/* Bottom divider + link to privacy */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-20 pt-8"
					style={{ borderTop: `1px solid ${C.border}` }}>
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<p className="text-[13px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
							See also:{" "}
							<Link href="/privacy" style={{ color: C.accentText, textDecoration: "none" }}>
								Privacy Policy
							</Link>
						</p>
						<p className="text-[11px]" style={{ color: C.textMuted, fontFamily: C.mono }}>
							MIT license · © 2026 Traytic
						</p>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
