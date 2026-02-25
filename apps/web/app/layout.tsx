import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/lib";
import { Toaster } from "sonner";
import "./globals.css";

const acorn = localFont({
	src: [
		{
			path: "../public/fonts/Acorn/Acorn-Regular.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/Acorn/Acorn-Medium.otf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../public/fonts/Acorn/Acorn-SemiBold.otf",
			weight: "600",
			style: "normal",
		},
		{
			path: "../public/fonts/Acorn/Acorn-Bold.otf",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-display",
	display: "swap",
});

const publicSans = Public_Sans({
	subsets: ["latin"] as const,
	variable: "--font-sans",
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"] as const,
	display: "swap",
});

export const metadata: Metadata = {
	title: "Traytic — Open Source Analytics",
	description:
		"Privacy-first, real-time analytics for developers. Self-hostable alternative to Vercel Analytics.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${acorn.variable} ${publicSans.variable} ${geistMono.variable}`}>
			<body className="min-h-screen bg-background scroll-smooth antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange>
					{children}
					<Toaster
						position="top-right"
						expand={false}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
