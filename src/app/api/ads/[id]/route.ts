import { NextResponse } from "next/server";
import { publicClient } from "@/lib/supabase/public";

// Registra o clique no banner e redireciona para o anunciante
export async function GET(req: Request, ctx: RouteContext<"/api/ads/[id]">) {
  const { id } = await ctx.params;
  const { data } = await publicClient().rpc("register_ad_click", { a_id: id });
  const target = typeof data === "string" && /^https?:\/\//.test(data) ? data : "/";
  return NextResponse.redirect(new URL(target, req.url), 302);
}
