import { Suspense } from "react";
import { Invite } from "@/views";

export const metadata = {
	title: "Accept Invitation — Traytic",
	description: "Accept your team invitation.",
};

export default function InvitePage() {
	return (
		<Suspense>
			<Invite />
		</Suspense>
	);
}
