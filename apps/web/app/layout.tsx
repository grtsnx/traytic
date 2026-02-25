import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/lib";
import { Toaster } from "sonner";
import "./globals.css";

// TODO: Replace with Acorn font when .otf files are available in public/fonts/Acorn/
const acorn = Plus_Jakarta_Sans({
	subsets: ["latin"] as const,
	weight: ["400", "500", "600", "700"] as const,
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
	icons: { icon: "/icon", apple: "/apple-icon" },
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
