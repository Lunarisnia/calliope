import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/login']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (publicRoutes.includes(path)) return NextResponse.next()

  const token = req.cookies.get('session')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.nextUrl))

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.otf$).*)'],
}
