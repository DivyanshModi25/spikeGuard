// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/', '/login', '/signup'];

// const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch (err) {
    return null; // Invalid token
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;

  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  let session = null;
  if (token) {
    session = await verifyJWT(token); // will be null if token is invalid
  }

  if (isProtectedRoute && session==null) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isPublicRoute && session!=null) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
