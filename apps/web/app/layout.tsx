import type { Metadata } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/lib";
import { Toaster } from "sonner";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"] as const, variable: "--font-sans" });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"] as const,
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
			className={publicSans.variable}>
			<body
				className={`${geistMono.variable} min-h-screen bg-background scroll-smooth antialiased`}>
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
