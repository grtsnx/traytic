import { Suspense } from "react";
import { ResetPassword } from "@/views";

export const metadata = {
	title: "Reset password — Traytic",
};

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPassword />
		</Suspense>
	);
}
