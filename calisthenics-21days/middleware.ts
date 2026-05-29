import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificar se é uma rota pública
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se há um cookie de sessão
  const session = request.cookies.get("sb-session");

  // Se não há sessão e tenta acessar rota privada, redireciona para /auth
  if (!session && !path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
