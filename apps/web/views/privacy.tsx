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
			<rect width="24" height="24" rx="7" fill={C.accent} />
			<path d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="19.5" cy="8.5" r="1.5" fill={C.green} />
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
		title: "The short version",
		body: [
			"We built Traytic because we were tired of analytics tools that treat your visitors like products. Here's the deal: we collect the bare minimum to show you useful analytics, we never sell or share your data with third parties, and we don't use cookies. If you self-host, we don't see your data at all. That's it. You can stop reading here if you want — but our lawyers said we need the rest of this page.",
		],
	},
	{
		title: "What we collect (and what we don't)",
		body: [
			"When a visitor hits a page on your site, we collect: the page URL, referrer, browser type, operating system, device type, and country (derived from IP). That's it. No names, no emails, no browsing history, no fingerprinting across sites, no \"anonymous\" IDs that are somehow not anonymous.",
			"We generate a daily visitor hash using SHA-256 of the site ID + visitor IP + user-agent + the current date. This hash rotates every 24 hours and cannot be reversed to identify anyone. It's like a guest count at a restaurant — we know 47 people came in, but we don't know who ordered the pasta.",
			"We never collect: names, email addresses, IP addresses (they're hashed and discarded), payment information beyond what's necessary for billing, or anything that could identify a specific human being.",
		],
	},
	{
		title: "Cookies",
		body: [
			"We don't use them. Not analytics cookies. Not tracking cookies. Not even the delicious kind. The Traytic tracking script stores zero cookies on your visitors' browsers. This means you don't need a cookie consent banner for Traytic. Your visitors (and your designer) will thank you.",
			"Our dashboard application uses a session cookie to keep you logged in. That's a strictly necessary first-party cookie, not a tracking mechanism — it just remembers that you're you.",
		],
	},
	{
		title: "How we use your data",
		body: [
			"We use the analytics data to power your dashboard. We use your email to send you account-related communications and, if you opt in, usage alerts. We don't use your data for advertising, profiling, or training machine learning models. We don't sell it. We don't \"anonymize\" it and then sell it. We don't share it with partners, affiliates, or anyone whose job title contains the word \"growth.\"",
		],
	},
	{
		title: "Self-hosted instances",
		body: [
			"If you self-host Traytic, your analytics data never touches our servers. It lives entirely on your own infrastructure. We have no access to it, can't read it, and wouldn't want to. The only data we see from self-hosted users is what you voluntarily share (like if you open a support ticket and include logs).",
		],
	},
	{
		title: "Data retention",
		body: [
			"For cloud-hosted accounts: Free plans retain data for 6 months. Pro plans retain data for 1 year. Team plans retain data based on your configuration. When data ages out, it's permanently deleted — not archived, not \"retained for research purposes,\" deleted.",
			"If you delete your account, we delete all your data within 30 days. If you remove a site, its analytics data is deleted immediately. We don't keep backups of deleted data because, frankly, that would defeat the purpose.",
		],
	},
	{
		title: "Third-party services",
		body: [
			"For cloud-hosted instances, we use: hosting infrastructure (to run the servers), a payment processor (Stripe for international payments, Paystack for African markets) for billing, and a transactional email service for password resets and alerts. None of these services have access to your analytics data.",
		],
	},
	{
		title: "GDPR, CCPA, and friends",
		body: [
			"Traytic is designed to be compliant with GDPR (Europe), CCPA (California), PECR (UK), and similar privacy regulations by default. Because we don't collect personal data from your visitors, most of these regulations' requirements around consent, data subject access requests, and right to deletion simply don't apply to visitor-side data.",
			"For your account data (email, name, billing info): you can export it, update it, or delete it at any time from your account settings.",
		],
	},
	{
		title: "Children's privacy",
		body: [
			"Traytic is a business tool designed for website operators. We don't knowingly collect information from children under 13. If you're under 13 and somehow reading a privacy policy for web analytics software, we're impressed by your diligence but please go play outside.",
		],
	},
	{
		title: "Changes to this policy",
		body: [
			"If we make meaningful changes to this policy, we'll notify you via email and update the date at the top. We won't suddenly start tracking your visitors and bury the change in paragraph 47 of a revised policy. That's not how we operate.",
		],
	},
	{
		title: "Contact",
		body: [
			"Questions, concerns, or just want to say hi? Email us at privacy@traytic.com. We read every message. Yes, even the ones that start with \"I have a few questions about your privacy policy.\"",
		],
	},
];

export default function Privacy() {
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
						Privacy Policy
					</h1>
					<p
						className="text-[17px] leading-relaxed mb-16"
						style={{ color: C.textMuted, fontFamily: C.sans }}>
						A privacy policy from an analytics company that actually respects privacy. Novel concept, we know.
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

				{/* Bottom divider + link to terms */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-20 pt-8"
					style={{ borderTop: `1px solid ${C.border}` }}>
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<p className="text-[13px]" style={{ color: C.textMuted, fontFamily: C.sans }}>
							See also:{" "}
							<Link href="/terms" style={{ color: C.accentText, textDecoration: "none" }}>
								Terms of Service
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
