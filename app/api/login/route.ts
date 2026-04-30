import { SignJWT } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (
    email !== process.env.AUTH_EMAIL ||
    password !== process.env.AUTH_PASSWORD
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(secret)

  return NextResponse.json({ token })
}
