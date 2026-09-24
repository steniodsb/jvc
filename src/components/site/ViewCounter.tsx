"use client";

import { useEffect } from "react";
import { browserClient } from "@/lib/supabase/browser";

/** Conta uma visualização por sessão do navegador */
export default function ViewCounter({ id }: { id: string }) {
  useEffect(() => {
    const key = `jcv:view:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    browserClient().rpc("increment_post_view", { p_id: id }).then(() => {});
  }, [id]);
  return null;
}
