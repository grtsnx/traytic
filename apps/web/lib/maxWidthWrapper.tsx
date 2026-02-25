"use client";

import { ReactNode } from "react";
import { cn } from "./utils";

export function MaxWidthWrapper({ className, children }: { className?: string; children: ReactNode }) {
	return <main className={cn("container mx-auto max-w-screen px-4 sm:px-10 lg:px-28 py-3 sm:py-6 lg:py-4", className)}>{children}</main>;
}
