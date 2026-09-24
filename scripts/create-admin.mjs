// Cria (ou promove) um usuário administrador do painel.
// Uso: npm run create-admin -- email@exemplo.com "Senha forte" "Nome"
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const [email, password, name = "Administrador"] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: npm run create-admin -- email@exemplo.com "senha" "Nome"');
  process.exit(1);
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let userId;
const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name, role: "admin" },
});
if (error) {
  if (!/already/i.test(error.message)) {
    console.error("✖", error.message);
    process.exit(1);
  }
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  userId = list.users.find((u) => u.email === email.toLowerCase())?.id;
  await admin.auth.admin.updateUserById(userId, { password });
  console.log("Usuário já existia: senha atualizada.");
} else {
  userId = data.user.id;
}

const { error: pErr } = await admin.from("profiles").upsert({ id: userId, name, email: email.toLowerCase(), role: "admin" });
if (pErr) {
  console.error("✖ Não foi possível gravar o perfil (o schema já foi aplicado?):", pErr.message);
  process.exit(1);
}
console.log(`✔ Administrador pronto: ${email}`);
