import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes only accessible by admin and manager (not viewer)
const adminManagerRoutes = [
  "/inventory",
  "/categories",
  "/suppliers",
  "/movements",
  "/alerts",
  "/orders",
  "/analytics",
  "/ai/forecast",
  "/ai/optimize",
];

// Routes only for viewers (shoppers)
const viewerOnlyRoutes = ["/shop", "/my-orders"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const publicRoutes = ["/", "/login", "/register", "/auth/callback"];
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route);

  // Not logged in → redirect to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const pathname = request.nextUrl.pathname;

    // Already logged in → redirect away from auth pages
    if (pathname === "/login" || pathname === "/register") {
      // Fetch user's role to redirect appropriately
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const url = request.nextUrl.clone();
      url.pathname = profile?.role === "viewer" ? "/shop" : "/dashboard";
      return NextResponse.redirect(url);
    }

    // Role-based route protection
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "viewer";

    // Viewers can't access admin/manager routes
    if (role === "viewer") {
      const isAdminRoute = adminManagerRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );
      if (isAdminRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/shop";
        return NextResponse.redirect(url);
      }
      // Redirect viewer from /dashboard to /shop
      if (pathname === "/dashboard") {
        const url = request.nextUrl.clone();
        url.pathname = "/shop";
        return NextResponse.redirect(url);
      }
    }

    // Admin/manager shouldn't access viewer-only routes (optional, but keep them accessible)
    // Actually admins might want to see the shop too, so we won't block them
  }

  return supabaseResponse;
}
