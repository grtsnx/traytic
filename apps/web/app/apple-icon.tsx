import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		(
			<div
				style={{
					background: "#0d0d14",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: "40px",
				}}>
				{/* Bar chart — ascending left to right */}
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						gap: "14px",
						height: "110px",
					}}>
					<div
						style={{
							width: "26px",
							height: "44px",
							background: "#5b6ef5",
							borderRadius: "6px 6px 0 0",
						}}
					/>
					<div
						style={{
							width: "26px",
							height: "72px",
							background: "#5b6ef5",
							borderRadius: "6px 6px 0 0",
						}}
					/>
					<div
						style={{
							width: "26px",
							height: "56px",
							background: "#5b6ef5",
							borderRadius: "6px 6px 0 0",
						}}
					/>
					<div
						style={{
							width: "26px",
							height: "110px",
							background: "#5b6ef5",
							borderRadius: "6px 6px 0 0",
						}}
					/>
				</div>
			</div>
		),
		{ ...size },
	);
}
