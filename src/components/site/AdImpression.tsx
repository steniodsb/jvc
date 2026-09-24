"use client";

import { useEffect } from "react";
import { browserClient } from "@/lib/supabase/browser";

/** Registra a impressão do banner quando ele é exibido */
export default function AdImpression({ id }: { id: string }) {
  useEffect(() => {
    browserClient().rpc("register_ad_impressions", { ids: [id] }).then(() => {});
  }, [id]);
  return null;
}
