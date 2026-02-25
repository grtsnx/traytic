import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
					borderRadius: "7px",
				}}>
				{/* Bar chart — ascending left to right */}
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						gap: "3px",
						height: "20px",
					}}>
					<div
						style={{
							width: "5px",
							height: "8px",
							background: "#5b6ef5",
							borderRadius: "1.5px 1.5px 0 0",
						}}
					/>
					<div
						style={{
							width: "5px",
							height: "13px",
							background: "#5b6ef5",
							borderRadius: "1.5px 1.5px 0 0",
						}}
					/>
					<div
						style={{
							width: "5px",
							height: "10px",
							background: "#5b6ef5",
							borderRadius: "1.5px 1.5px 0 0",
						}}
					/>
					<div
						style={{
							width: "5px",
							height: "20px",
							background: "#5b6ef5",
							borderRadius: "1.5px 1.5px 0 0",
						}}
					/>
				</div>
			</div>
		),
		{ ...size },
	);
}
