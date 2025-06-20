// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify ,importSPKI} from 'jose';
import { PUBLIC_KEY } from './lib/public';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/', '/login', '/signup'];

// const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = PUBLIC_KEY;

async function verifyJWT(token) {
  try {
    const encoder = new TextEncoder();
    const key = await importSPKI(PUBLIC_KEY, 'RS256'); // 👈 THIS is correct for RS256
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (err) {
    return null;
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
