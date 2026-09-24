import PageHeader from "@/components/admin/PageHeader";
import { requireStaff } from "@/lib/auth";
import type { Category, City } from "@/lib/types";
import PostForm from "../PostForm";

export const metadata = { title: "Nova matéria" };

export default async function NewPostPage() {
  const { supabase } = await requireStaff();
  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from("categories").select("*").order("sort").order("name"),
    supabase.from("cities").select("*").order("name"),
  ]);
  return (
    <>
      <PageHeader title="Nova matéria" />
      <PostForm categories={(categories ?? []) as Category[]} cities={(cities ?? []) as City[]} />
    </>
  );
}
