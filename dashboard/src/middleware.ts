import { NextRequest, NextResponse } from "next/server";


export function middleware( request: NextRequest){
  console.log("middileware checkimg path:" , request.nextUrl.pathname);
  const token = request.cookies.get("auth_token")?.value;

  const { pathname } = request.nextUrl;

  // If no token exists and user is trying to hit /dashboard, force redirect to /login
 if(pathname.startsWith("/dashboard") && !token){
  return NextResponse.redirect(new URL("/login", request.url));
 }

 // If token exists and user tries to hit login/signup, send them to dashboard
if(token && (pathname === "/login" || pathname === "/signup")){
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

return NextResponse.next();
}

// Only run this middleware on dashboard, login, and signup routes

export const config = {
  matcher:["/dashboard/:path*", "/login", "/signup"],
};