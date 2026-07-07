import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const admin = getSupabaseAdmin();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (!createError) {
      return NextResponse.json({ success: true, userId: created.user?.id });
    }

    // Usuário já existe (ex: conta criada pelo fluxo antigo de magic-link) - realinha a senha
    const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw listError;

    const existing = list.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (!existing) throw createError;

    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, userId: existing.id });
  } catch (error: any) {
    console.error('Erro em ensure-user:', error.message);
    return NextResponse.json({ error: error.message || 'Erro ao processar login' }, { status: 500 });
  }
}
