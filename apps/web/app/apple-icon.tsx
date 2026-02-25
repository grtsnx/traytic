import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		(
			<div
				style={{
					background: "#7c3aed",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: "40px",
				}}>
				<svg width="140" height="140" viewBox="0 0 24 24" fill="none">
					<path
						d="M2.5 15.5 L5.5 15.5 L7.5 12 L10 17 L13 9 L15 13 L17.5 8.5"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<circle cx="17.5" cy="8.5" r="1.8" fill="#4ade80" />
				</svg>
			</div>
		),
		{ ...size },
	);
}
