import { Suspense } from "react";
import { Upgrade } from "@/views";

export const metadata = {
	title: "Upgrade — Traytic",
	description: "Upgrade your Traytic plan to add more sites and unlock higher limits.",
};

export default function UpgradePage() {
	return (
		<Suspense>
			<Upgrade />
		</Suspense>
	);
}
