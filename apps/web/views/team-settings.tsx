"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const C = {
	bg: "oklch(0.08 0.006 265)",
	bgDeep: "oklch(0.055 0.008 265)",
	surface: "oklch(0.115 0.008 265)",
	surfaceHover: "oklch(0.135 0.010 265)",
	border: "oklch(1 0 0 / 7%)",
	borderEl: "oklch(1 0 0 / 11%)",
	text: "oklch(0.93 0 0)",
	textMuted: "oklch(0.54 0 0)",
	textFaint: "oklch(0.32 0 0)",
	accent: "oklch(0.62 0.22 265)",
	accentDim: "oklch(0.50 0.18 265)",
	accentText: "oklch(0.74 0.15 265)",
	accentBg: "oklch(0.62 0.22 265 / 8%)",
	accentBorder: "oklch(0.62 0.22 265 / 25%)",
	green: "oklch(0.72 0.17 145)",
	greenBg: "oklch(0.72 0.17 145 / 10%)",
	greenBorder: "oklch(0.72 0.17 145 / 22%)",
	greenText: "oklch(0.76 0.15 145)",
	red: "oklch(0.65 0.2 25)",
	redBg: "oklch(0.65 0.2 25 / 10%)",
	redBorder: "oklch(0.65 0.2 25 / 20%)",
	redText: "oklch(0.70 0.18 25)",
	orange: "oklch(0.78 0.16 55)",
	orangeBg: "oklch(0.78 0.16 55 / 10%)",
	orangeBorder: "oklch(0.78 0.16 55 / 22%)",
	orangeText: "oklch(0.80 0.14 55)",
	mono: "var(--font-geist-mono)",
	sans: "var(--font-sans)",
	display: "var(--font-display)",
} as const;

type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

type OrgListItem = {
	id: string;
	name: string;
	slug: string;
	memberCount: number;
	plan: string | null;
	role: OrgRole;
};

type Member = {
	id: string;
	userId: string;
	orgId: string;
	role: OrgRole;
	createdAt: string;
	user: { id: string; name: string | null; email: string; image: string | null };
};

type Invitation = {
	id: string;
	email: string;
	role: OrgRole;
	createdAt: string;
	expiresAt: string;
};

// ── Utility components ──────────────────────────────────────────────────────

function LogoMark({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<rect width="24" height="24" rx="7" fill={C.accent} />
			<path d="M4.5 15.5 L8 15.5 L10 12 L12.5 17 L15 9 L17 13 L19.5 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="19.5" cy="8.5" r="1.5" fill={C.green} />
		</svg>
	);
}

function Spinner({ size = 16 }: { size?: number }) {
	return (
		<svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
			<circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
			<path d="M12 2a10 10 0 0 1 10 10" />
		</svg>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span
			style={{
				fontFamily: C.mono,
				fontSize: "11px",
				color: C.textMuted,
				textTransform: "uppercase",
				letterSpacing: "0.08em",
			}}>
			{children}
		</span>
	);
}

function RoleBadge({ role }: { role: OrgRole }) {
	const config = {
		OWNER: { bg: C.orangeBg, border: C.orangeBorder, color: C.orangeText, label: "Owner" },
		ADMIN: { bg: C.accentBg, border: C.accentBorder, color: C.accentText, label: "Admin" },
		MEMBER: { bg: C.surface, border: C.border, color: C.textMuted, label: "Member" },
	}[role];

	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				fontSize: "10px",
				fontFamily: C.mono,
				fontWeight: "600",
				padding: "2px 8px",
				borderRadius: "5px",
				backgroundColor: config.bg,
				color: config.color,
				border: `1px solid ${config.border}`,
				textTransform: "uppercase",
				letterSpacing: "0.06em",
			}}>
			{config.label}
		</span>
	);
}

function Avatar({ name, email, image, size = 32 }: { name: string | null; email: string; image: string | null; size?: number }) {
	const initial = (name?.[0] ?? email[0]).toUpperCase();
	if (image) {
		return (
			<img
				src={image}
				alt={name ?? email}
				style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
			/>
		);
	}
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				backgroundColor: C.accentBg,
				border: `1px solid ${C.accentBorder}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}>
			<span style={{ fontFamily: C.mono, fontSize: size * 0.38, fontWeight: "700", color: C.accentText }}>
				{initial}
			</span>
		</div>
	);
}

// ── Invite form ─────────────────────────────────────────────────────────────

function InviteForm({ orgId, canInvite, onInvited }: { orgId: string; canInvite: boolean; onInvited: () => void }) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<OrgRole>("MEMBER");
	const [loading, setLoading] = useState(false);
	const [focused, setFocused] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email.trim() || !canInvite) return;
		setLoading(true);
		try {
			const res = await fetch(`${API}/orgs/${orgId}/invitations`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email: email.trim(), role }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to invite");
			}
			const data = (await res.json()) as { added?: boolean; invited?: boolean };
			if (data.added) {
				toast.success(`${email} has been added to the team`);
			} else {
				toast.success(`Invitation sent to ${email}`);
			}
			setEmail("");
			onInvited();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to invite");
		} finally {
			setLoading(false);
		}
	}

	if (!canInvite) return null;

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
			<div style={{ flex: 1 }}>
				<label
					style={{
						fontFamily: C.mono,
						fontSize: "10px",
						color: focused ? C.accentText : C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
						display: "block",
						marginBottom: "5px",
						transition: "color 0.15s",
					}}>
					Email address
				</label>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					placeholder="teammate@company.com"
					required
					style={{
						width: "100%",
						padding: "9px 12px",
						borderRadius: "8px",
						fontSize: "13px",
						fontFamily: C.sans,
						backgroundColor: C.bgDeep,
						border: `1.5px solid ${focused ? C.accent : C.border}`,
						color: C.text,
						outline: "none",
						transition: "border-color 0.15s, box-shadow 0.15s",
						boxShadow: focused ? `0 0 0 3px oklch(0.62 0.22 265 / 10%)` : "none",
					}}
				/>
			</div>
			<div>
				<label
					style={{
						fontFamily: C.mono,
						fontSize: "10px",
						color: C.textMuted,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
						display: "block",
						marginBottom: "5px",
					}}>
					Role
				</label>
				<select
					value={role}
					onChange={(e) => setRole(e.target.value as OrgRole)}
					style={{
						padding: "9px 12px",
						borderRadius: "8px",
						fontSize: "13px",
						fontFamily: C.sans,
						backgroundColor: C.bgDeep,
						border: `1.5px solid ${C.border}`,
						color: C.text,
						outline: "none",
						cursor: "pointer",
						minWidth: "100px",
					}}>
					<option value="MEMBER">Member</option>
					<option value="ADMIN">Admin</option>
					<option value="OWNER">Owner</option>
				</select>
			</div>
			<button
				type="submit"
				disabled={loading || !email.trim()}
				style={{
					padding: "9px 18px",
					borderRadius: "8px",
					fontSize: "13px",
					fontWeight: "600",
					fontFamily: C.sans,
					backgroundColor: C.accent,
					color: "#fff",
					border: "none",
					cursor: loading ? "not-allowed" : "pointer",
					opacity: loading ? 0.7 : 1,
					transition: "opacity 0.15s",
					whiteSpace: "nowrap",
					display: "flex",
					alignItems: "center",
					gap: "6px",
				}}>
				{loading && <Spinner />}
				Invite
			</button>
		</form>
	);
}

// ── Members table ───────────────────────────────────────────────────────────

function MembersTable({
	members,
	currentUserId,
	currentUserRole,
	orgId,
	onUpdate,
}: {
	members: Member[];
	currentUserId: string;
	currentUserRole: OrgRole;
	orgId: string;
	onUpdate: () => void;
}) {
	const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
	const [changingRole, setChangingRole] = useState<string | null>(null);
	const [removing, setRemoving] = useState<string | null>(null);

	async function handleChangeRole(memberId: string, newRole: OrgRole) {
		setChangingRole(memberId);
		try {
			const res = await fetch(`${API}/orgs/${orgId}/members/${memberId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ role: newRole }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to update role");
			}
			toast.success("Role updated");
			onUpdate();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to update");
		} finally {
			setChangingRole(null);
		}
	}

	async function handleRemove(memberId: string, memberName: string) {
		if (!confirm(`Remove ${memberName} from the team?`)) return;
		setRemoving(memberId);
		try {
			const res = await fetch(`${API}/orgs/${orgId}/members/${memberId}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to remove");
			}
			toast.success(`${memberName} removed`);
			onUpdate();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to remove");
		} finally {
			setRemoving(null);
		}
	}

	return (
		<div>
			{members.map((m, i) => {
				const isCurrentUser = m.userId === currentUserId;
				return (
					<div
						key={m.id}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "12px 20px",
							borderBottom: i < members.length - 1 ? `1px solid ${C.border}` : "none",
							gap: "12px",
						}}>
						<Avatar name={m.user.name} email={m.user.email} image={m.user.image} />
						<div style={{ flex: 1, minWidth: 0 }}>
							<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<span
									style={{
										fontFamily: C.sans,
										fontSize: "13px",
										fontWeight: "500",
										color: C.text,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}>
									{m.user.name ?? m.user.email.split("@")[0]}
								</span>
								{isCurrentUser && (
									<span
										style={{
											fontFamily: C.mono,
											fontSize: "9px",
											color: C.textMuted,
											padding: "1px 5px",
											borderRadius: "4px",
											backgroundColor: C.surface,
											border: `1px solid ${C.border}`,
										}}>
										YOU
									</span>
								)}
							</div>
							<span
								style={{
									fontFamily: C.mono,
									fontSize: "11px",
									color: C.textMuted,
									display: "block",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}>
								{m.user.email}
							</span>
						</div>
						{canManage && !isCurrentUser ? (
							<select
								value={m.role}
								onChange={(e) => handleChangeRole(m.id, e.target.value as OrgRole)}
								disabled={changingRole === m.id}
								style={{
									padding: "5px 8px",
									borderRadius: "6px",
									fontSize: "11px",
									fontFamily: C.mono,
									backgroundColor: C.bgDeep,
									border: `1px solid ${C.border}`,
									color: C.text,
									outline: "none",
									cursor: changingRole === m.id ? "wait" : "pointer",
									opacity: changingRole === m.id ? 0.6 : 1,
								}}>
								<option value="OWNER">Owner</option>
								<option value="ADMIN">Admin</option>
								<option value="MEMBER">Member</option>
							</select>
						) : (
							<RoleBadge role={m.role} />
						)}
						{canManage && !isCurrentUser && (
							<button
								onClick={() => handleRemove(m.id, m.user.name ?? m.user.email)}
								disabled={removing === m.id}
								aria-label="Remove member"
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: "28px",
									height: "28px",
									borderRadius: "6px",
									backgroundColor: "transparent",
									border: `1px solid ${C.border}`,
									color: C.textMuted,
									cursor: removing === m.id ? "wait" : "pointer",
									transition: "all 0.12s",
									flexShrink: 0,
									opacity: removing === m.id ? 0.5 : 1,
								}}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
}

// ── Pending invitations ─────────────────────────────────────────────────────

function PendingInvitations({
	invitations,
	orgId,
	canManage,
	onUpdate,
}: {
	invitations: Invitation[];
	orgId: string;
	canManage: boolean;
	onUpdate: () => void;
}) {
	const [revoking, setRevoking] = useState<string | null>(null);

	async function handleRevoke(id: string, email: string) {
		setRevoking(id);
		try {
			const res = await fetch(`${API}/orgs/${orgId}/invitations/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to revoke");
			}
			toast.success(`Invitation to ${email} revoked`);
			onUpdate();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to revoke");
		} finally {
			setRevoking(null);
		}
	}

	if (invitations.length === 0) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.border}`,
				borderRadius: "14px",
				overflow: "hidden",
			}}>
			<div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
				<SectionLabel>Pending invitations</SectionLabel>
			</div>
			{invitations.map((inv, i) => (
				<div
					key={inv.id}
					style={{
						display: "flex",
						alignItems: "center",
						padding: "11px 20px",
						borderBottom: i < invitations.length - 1 ? `1px solid ${C.border}` : "none",
						gap: "12px",
					}}>
					<div
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							backgroundColor: C.bgDeep,
							border: `1px dashed ${C.border}`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textFaint} strokeWidth="2" strokeLinecap="round">
							<path d="M22 2L11 13" />
							<path d="M22 2L15 22 11 13 2 9z" />
						</svg>
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<span
							style={{
								fontFamily: C.sans,
								fontSize: "13px",
								color: C.text,
								display: "block",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}>
							{inv.email}
						</span>
						<span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textFaint }}>
							Expires {new Date(inv.expiresAt).toLocaleDateString()}
						</span>
					</div>
					<RoleBadge role={inv.role} />
					{canManage && (
						<button
							onClick={() => handleRevoke(inv.id, inv.email)}
							disabled={revoking === inv.id}
							style={{
								padding: "4px 10px",
								borderRadius: "6px",
								fontSize: "11px",
								fontFamily: C.mono,
								backgroundColor: "transparent",
								color: C.textMuted,
								border: `1px solid ${C.border}`,
								cursor: revoking === inv.id ? "wait" : "pointer",
								opacity: revoking === inv.id ? 0.5 : 1,
								transition: "opacity 0.12s",
							}}>
							Revoke
						</button>
					)}
				</div>
			))}
		</motion.div>
	);
}

// ── Org details form ────────────────────────────────────────────────────────

function OrgDetailsForm({
	org,
	canEdit,
	onUpdate,
}: {
	org: OrgListItem;
	canEdit: boolean;
	onUpdate: () => void;
}) {
	const [name, setName] = useState(org.name);
	const [slug, setSlug] = useState(org.slug);
	const [saving, setSaving] = useState(false);
	const isDirty = name !== org.name || slug !== org.slug;

	useEffect(() => {
		setName(org.name);
		setSlug(org.slug);
	}, [org.name, org.slug]);

	async function handleSave() {
		if (!canEdit || !isDirty) return;
		setSaving(true);
		try {
			const res = await fetch(`${API}/orgs/${org.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name, slug }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to update");
			}
			toast.success("Organization updated");
			onUpdate();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to update");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px" }}>
			<div style={{ display: "flex", gap: "12px" }}>
				<div style={{ flex: 1 }}>
					<label
						style={{
							fontFamily: C.mono,
							fontSize: "10px",
							color: C.textMuted,
							textTransform: "uppercase",
							letterSpacing: "0.06em",
							display: "block",
							marginBottom: "5px",
						}}>
						Organization name
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={!canEdit}
						style={{
							width: "100%",
							padding: "9px 12px",
							borderRadius: "8px",
							fontSize: "13px",
							fontFamily: C.sans,
							backgroundColor: C.bgDeep,
							border: `1.5px solid ${C.border}`,
							color: C.text,
							outline: "none",
							opacity: canEdit ? 1 : 0.6,
						}}
					/>
				</div>
				<div style={{ flex: 1 }}>
					<label
						style={{
							fontFamily: C.mono,
							fontSize: "10px",
							color: C.textMuted,
							textTransform: "uppercase",
							letterSpacing: "0.06em",
							display: "block",
							marginBottom: "5px",
						}}>
						Slug
					</label>
					<input
						type="text"
						value={slug}
						onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
						disabled={!canEdit}
						style={{
							width: "100%",
							padding: "9px 12px",
							borderRadius: "8px",
							fontSize: "13px",
							fontFamily: C.mono,
							backgroundColor: C.bgDeep,
							border: `1.5px solid ${C.border}`,
							color: C.text,
							outline: "none",
							opacity: canEdit ? 1 : 0.6,
						}}
					/>
				</div>
			</div>
			{canEdit && isDirty && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					style={{ display: "flex", justifyContent: "flex-end" }}>
					<button
						onClick={handleSave}
						disabled={saving}
						style={{
							padding: "8px 18px",
							borderRadius: "8px",
							fontSize: "13px",
							fontWeight: "600",
							fontFamily: C.sans,
							backgroundColor: C.accent,
							color: "#fff",
							border: "none",
							cursor: saving ? "not-allowed" : "pointer",
							opacity: saving ? 0.7 : 1,
							display: "flex",
							alignItems: "center",
							gap: "6px",
						}}>
						{saving && <Spinner />}
						Save changes
					</button>
				</motion.div>
			)}
		</div>
	);
}

// ── Danger zone ─────────────────────────────────────────────────────────────

function DangerZone({
	org,
	currentUserRole,
	onLeave,
	onDelete,
}: {
	org: OrgListItem;
	currentUserRole: OrgRole;
	onLeave: () => void;
	onDelete: () => void;
}) {
	const [leaving, setLeaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	async function handleLeave() {
		if (!confirm(`Leave ${org.name}? You'll lose access to all sites in this organization.`)) return;
		setLeaving(true);
		try {
			const res = await fetch(`${API}/orgs/${org.id}/leave`, {
				method: "POST",
				credentials: "include",
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to leave");
			}
			toast.success(`Left ${org.name}`);
			onLeave();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to leave");
		} finally {
			setLeaving(false);
		}
	}

	async function handleDelete() {
		const confirmation = prompt(`Type "${org.slug}" to confirm deletion:`);
		if (confirmation !== org.slug) {
			if (confirmation !== null) toast.error("Confirmation did not match");
			return;
		}
		setDeleting(true);
		try {
			const res = await fetch(`${API}/orgs/${org.id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to delete");
			}
			toast.success(`${org.name} deleted`);
			onDelete();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to delete");
		} finally {
			setDeleting(false);
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
			style={{
				backgroundColor: C.surface,
				border: `1px solid ${C.redBorder}`,
				borderRadius: "14px",
				overflow: "hidden",
			}}>
			<div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
				<SectionLabel>Danger zone</SectionLabel>
			</div>
			<div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<div>
						<span style={{ fontFamily: C.sans, fontSize: "13px", color: C.text, fontWeight: "500", display: "block" }}>
							Leave organization
						</span>
						<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>
							You will lose access to all sites in this organization.
						</span>
					</div>
					<button
						onClick={handleLeave}
						disabled={leaving}
						style={{
							padding: "7px 14px",
							borderRadius: "7px",
							fontSize: "12px",
							fontWeight: "600",
							fontFamily: C.sans,
							backgroundColor: "transparent",
							color: C.redText,
							border: `1px solid ${C.redBorder}`,
							cursor: leaving ? "not-allowed" : "pointer",
							opacity: leaving ? 0.6 : 1,
							display: "flex",
							alignItems: "center",
							gap: "6px",
							flexShrink: 0,
						}}>
						{leaving && <Spinner />}
						Leave
					</button>
				</div>
				{currentUserRole === "OWNER" && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							paddingTop: "12px",
							borderTop: `1px solid ${C.border}`,
						}}>
						<div>
							<span style={{ fontFamily: C.sans, fontSize: "13px", color: C.text, fontWeight: "500", display: "block" }}>
								Delete organization
							</span>
							<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted }}>
								Permanently deletes all sites, data, and members. This cannot be undone.
							</span>
						</div>
						<button
							onClick={handleDelete}
							disabled={deleting}
							style={{
								padding: "7px 14px",
								borderRadius: "7px",
								fontSize: "12px",
								fontWeight: "600",
								fontFamily: C.sans,
								backgroundColor: C.redBg,
								color: C.redText,
								border: `1px solid ${C.redBorder}`,
								cursor: deleting ? "not-allowed" : "pointer",
								opacity: deleting ? 0.6 : 1,
								display: "flex",
								alignItems: "center",
								gap: "6px",
								flexShrink: 0,
							}}>
							{deleting && <Spinner />}
							Delete
						</button>
					</div>
				)}
			</div>
		</motion.div>
	);
}

// ── Create org modal ────────────────────────────────────────────────────────

function CreateOrgModal({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [focused, setFocused] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		setLoading(true);
		try {
			const res = await fetch(`${API}/orgs`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name: name.trim() }),
			});
			if (!res.ok) {
				const d = (await res.json()) as { message?: string };
				throw new Error(d.message ?? "Failed to create");
			}
			toast.success("Organization created");
			onCreated();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to create");
		} finally {
			setLoading(false);
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.15 }}
			onClick={onClose}
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 50,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "oklch(0 0 0 / 60%)",
				backdropFilter: "blur(8px)",
			}}>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
				onClick={(e) => e.stopPropagation()}
				style={{
					width: "100%",
					maxWidth: "400px",
					backgroundColor: C.surface,
					border: `1px solid ${C.border}`,
					borderRadius: "16px",
					padding: "28px 24px",
				}}>
				<h3 style={{ fontFamily: C.display, fontSize: "18px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em", marginBottom: "16px" }}>
					New organization
				</h3>
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					<div>
						<label
							style={{
								fontFamily: C.mono,
								fontSize: "10px",
								color: focused ? C.accentText : C.textMuted,
								textTransform: "uppercase",
								letterSpacing: "0.06em",
								display: "block",
								marginBottom: "5px",
								transition: "color 0.15s",
							}}>
							Organization name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onFocus={() => setFocused(true)}
							onBlur={() => setFocused(false)}
							placeholder="My Company"
							required
							autoFocus
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "10px",
								fontSize: "14px",
								fontFamily: C.sans,
								backgroundColor: C.bgDeep,
								border: `1.5px solid ${focused ? C.accent : C.border}`,
								color: C.text,
								outline: "none",
								transition: "border-color 0.15s, box-shadow 0.15s",
								boxShadow: focused ? `0 0 0 3px oklch(0.62 0.22 265 / 12%)` : "none",
							}}
						/>
					</div>
					<div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
						<button
							type="button"
							onClick={onClose}
							style={{
								padding: "9px 16px",
								borderRadius: "8px",
								fontSize: "13px",
								fontFamily: C.sans,
								backgroundColor: "transparent",
								color: C.textMuted,
								border: `1px solid ${C.border}`,
								cursor: "pointer",
							}}>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || !name.trim()}
							style={{
								padding: "9px 18px",
								borderRadius: "8px",
								fontSize: "13px",
								fontWeight: "600",
								fontFamily: C.sans,
								backgroundColor: C.accent,
								color: "#fff",
								border: "none",
								cursor: loading ? "not-allowed" : "pointer",
								opacity: loading ? 0.7 : 1,
								display: "flex",
								alignItems: "center",
								gap: "6px",
							}}>
							{loading && <Spinner />}
							Create
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
}

// ── Main component ──────────────────────────────────────────────────────────

export default function TeamSettings() {
	const [orgs, setOrgs] = useState<OrgListItem[]>([]);
	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const selectedOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;
	const currentUserRole = selectedOrg?.role ?? "MEMBER";
	const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

	const fetchOrgs = useCallback(async () => {
		try {
			const res = await fetch(`${API}/orgs`, { credentials: "include" });
			if (!res.ok) return;
			const data = (await res.json()) as OrgListItem[];
			setOrgs(data);
			if (data.length > 0 && !selectedOrgId) {
				setSelectedOrgId(data[0].id);
			} else if (data.length > 0 && !data.find((o) => o.id === selectedOrgId)) {
				setSelectedOrgId(data[0].id);
			}
		} catch {
			// ignore
		}
	}, [selectedOrgId]);

	const fetchMembers = useCallback(async () => {
		if (!selectedOrgId) return;
		try {
			const res = await fetch(`${API}/orgs/${selectedOrgId}/members`, { credentials: "include" });
			if (res.ok) setMembers((await res.json()) as Member[]);
		} catch {
			// ignore
		}
	}, [selectedOrgId]);

	const fetchInvitations = useCallback(async () => {
		if (!selectedOrgId) return;
		try {
			const res = await fetch(`${API}/orgs/${selectedOrgId}/invitations`, { credentials: "include" });
			if (res.ok) setInvitations((await res.json()) as Invitation[]);
		} catch {
			// ignore
		}
	}, [selectedOrgId]);

	const fetchSession = useCallback(async () => {
		try {
			const res = await fetch(`${API}/api/auth/get-session`, { credentials: "include" });
			if (res.ok) {
				const data = (await res.json()) as { user?: { id: string } } | null;
				if (data?.user) setCurrentUserId(data.user.id);
			}
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		async function init() {
			setLoading(true);
			await fetchSession();
			await fetchOrgs();
			setLoading(false);
		}
		init();
	}, [fetchSession, fetchOrgs]);

	useEffect(() => {
		if (selectedOrgId) {
			fetchMembers();
			fetchInvitations();
		}
	}, [selectedOrgId, fetchMembers, fetchInvitations]);

	function handleRefresh() {
		fetchOrgs();
		fetchMembers();
		fetchInvitations();
	}

	function handleLeaveOrDelete() {
		setSelectedOrgId(null);
		fetchOrgs();
	}

	if (loading) {
		return (
			<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: C.bg }}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: C.textMuted }}>
					<Spinner size={24} />
					<span style={{ fontFamily: C.mono, fontSize: "13px" }}>Loading team settings...</span>
				</div>
			</div>
		);
	}

	return (
		<div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
			{/* Header */}
			<div
				style={{
					position: "sticky",
					top: 0,
					zIndex: 10,
					backgroundColor: `${C.bg}e8`,
					backdropFilter: "blur(16px)",
					borderBottom: `1px solid ${C.border}`,
					padding: "14px 28px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}>
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
						<LogoMark size={26} />
						<span
							style={{
								fontFamily: C.display,
								fontSize: "15px",
								fontWeight: "700",
								color: C.text,
								letterSpacing: "-0.02em",
							}}>
							Traytic
						</span>
					</Link>
					<span style={{ color: C.textFaint, fontSize: "14px" }}>/</span>
					<h1
						style={{
							fontFamily: C.display,
							fontSize: "16px",
							fontWeight: "700",
							color: C.text,
							letterSpacing: "-0.02em",
						}}>
						Team settings
					</h1>
				</div>
				<Link
					href="/dashboard"
					style={{
						padding: "7px 14px",
						borderRadius: "8px",
						fontSize: "13px",
						fontFamily: C.sans,
						color: C.textMuted,
						textDecoration: "none",
						border: `1px solid ${C.border}`,
						transition: "all 0.12s",
					}}>
					Back to dashboard
				</Link>
			</div>

			{/* Content */}
			<div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>
				{/* Org picker */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
						marginBottom: "24px",
					}}>
					{orgs.length > 1 ? (
						<select
							value={selectedOrgId ?? ""}
							onChange={(e) => setSelectedOrgId(e.target.value)}
							style={{
								flex: 1,
								padding: "10px 14px",
								borderRadius: "10px",
								fontSize: "14px",
								fontFamily: C.sans,
								fontWeight: "500",
								backgroundColor: C.surface,
								border: `1.5px solid ${C.border}`,
								color: C.text,
								outline: "none",
								cursor: "pointer",
							}}>
							{orgs.map((o) => (
								<option key={o.id} value={o.id}>
									{o.name} ({o.memberCount} member{o.memberCount !== 1 ? "s" : ""})
								</option>
							))}
						</select>
					) : selectedOrg ? (
						<div style={{ flex: 1 }}>
							<span style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: "500", color: C.text }}>
								{selectedOrg.name}
							</span>
							<span style={{ fontFamily: C.mono, fontSize: "11px", color: C.textMuted, marginLeft: "8px" }}>
								{selectedOrg.memberCount} member{selectedOrg.memberCount !== 1 ? "s" : ""}
								{selectedOrg.plan && ` · ${selectedOrg.plan} plan`}
							</span>
						</div>
					) : null}
					<button
						onClick={() => setShowCreateModal(true)}
						style={{
							padding: "9px 16px",
							borderRadius: "8px",
							fontSize: "13px",
							fontWeight: "600",
							fontFamily: C.sans,
							backgroundColor: C.accent,
							color: "#fff",
							border: "none",
							cursor: "pointer",
							whiteSpace: "nowrap",
							display: "flex",
							alignItems: "center",
							gap: "6px",
						}}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
						New org
					</button>
				</motion.div>

				{selectedOrg && (
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						{/* Org details */}
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
							style={{
								backgroundColor: C.surface,
								border: `1px solid ${C.border}`,
								borderRadius: "14px",
								overflow: "hidden",
							}}>
							<div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
								<SectionLabel>Organization</SectionLabel>
							</div>
							<OrgDetailsForm org={selectedOrg} canEdit={canManage} onUpdate={handleRefresh} />
						</motion.div>

						{/* Invite form */}
						{canManage && (
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
								style={{
									backgroundColor: C.surface,
									border: `1px solid ${C.border}`,
									borderRadius: "14px",
									overflow: "hidden",
								}}>
								<div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
									<SectionLabel>Invite teammate</SectionLabel>
								</div>
								<div style={{ padding: "16px 20px" }}>
									<InviteForm orgId={selectedOrg.id} canInvite={canManage} onInvited={handleRefresh} />
								</div>
							</motion.div>
						)}

						{/* Members */}
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
							style={{
								backgroundColor: C.surface,
								border: `1px solid ${C.border}`,
								borderRadius: "14px",
								overflow: "hidden",
							}}>
							<div
								style={{
									padding: "16px 20px",
									borderBottom: `1px solid ${C.border}`,
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}>
								<SectionLabel>Members ({members.length})</SectionLabel>
							</div>
							<MembersTable
								members={members}
								currentUserId={currentUserId}
								currentUserRole={currentUserRole}
								orgId={selectedOrg.id}
								onUpdate={handleRefresh}
							/>
						</motion.div>

						{/* Pending invitations */}
						<PendingInvitations
							invitations={invitations}
							orgId={selectedOrg.id}
							canManage={canManage}
							onUpdate={handleRefresh}
						/>

						{/* Danger zone */}
						<DangerZone
							org={selectedOrg}
							currentUserRole={currentUserRole}
							onLeave={handleLeaveOrDelete}
							onDelete={handleLeaveOrDelete}
						/>
					</div>
				)}

				{orgs.length === 0 && (
					<div style={{ textAlign: "center", paddingTop: "60px" }}>
						<p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textMuted, marginBottom: "16px" }}>
							You don't belong to any organization yet.
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							style={{
								padding: "10px 20px",
								borderRadius: "10px",
								fontSize: "14px",
								fontWeight: "600",
								fontFamily: C.sans,
								backgroundColor: C.accent,
								color: "#fff",
								border: "none",
								cursor: "pointer",
							}}>
							Create your first organization
						</button>
					</div>
				)}
			</div>

			{/* Create org modal */}
			<AnimatePresence>
				{showCreateModal && (
					<CreateOrgModal
						onCreated={() => {
							setShowCreateModal(false);
							fetchOrgs();
						}}
						onClose={() => setShowCreateModal(false)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
