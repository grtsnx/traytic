import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	// Standalone output: self-contained Node.js server, ideal for Docker
	output: "standalone",
	// Trace files from the monorepo root so workspace packages are included
	outputFileTracingRoot: path.join(__dirname, "../../"),

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
};

export default nextConfig;
