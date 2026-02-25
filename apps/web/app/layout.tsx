import type { Metadata } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";
import { MaxWidthWrapper, ThemeProvider } from "@/lib";
import { Toaster } from "sonner";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Traytic — Open Source Analytics",
	description:
		"Privacy-first, real-time analytics for developers. Self-hostable alternative to Vercel Analytics.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={publicSans.variable}>
			<body
				className={`${geistMono.variable} m-auto min-h-screen bg-background bg-center bg-no-repeat scroll-smooth antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange>
					<MaxWidthWrapper>{children}</MaxWidthWrapper>
					<Toaster
						position="top-right"
						expand={false}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
