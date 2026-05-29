import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificar se é uma rota pública
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow all requests for now - client-side auth check will handle redirects
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
