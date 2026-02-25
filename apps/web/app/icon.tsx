import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
					borderRadius: "9px",
				}}>
				<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
