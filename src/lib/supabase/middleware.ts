import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function resolveComingSoonSource(pathname: string): string | null {
  if (pathname === "/auth/login") {
    return "signin";
  }

  if (pathname === "/auth/signup") {
    return "get-started";
  }

  if (pathname.startsWith("/auth")) {
    return "auth";
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const comingSoonSource = resolveComingSoonSource(request.nextUrl.pathname);
  if (comingSoonSource) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.searchParams.set("from", comingSoonSource);
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return response;
}
