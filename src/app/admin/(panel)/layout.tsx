import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/types";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel JCV" }, robots: { index: false } };

async function signOut() {
  "use server";
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStaff();
  return (
    <div className="min-h-screen bg-paper-2">
      <AdminNav isAdmin={profile.role === "admin"} name={profile.name || profile.email || ""} role={ROLES[profile.role!]} signOut={signOut} />
      <div className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
