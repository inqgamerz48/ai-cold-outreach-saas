import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

const authOptions: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    // Call our backend API to verify credentials
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        })
                    })

                    const user = await res.json()

                    if (res.ok && user) {
                        return {
                            id: user.id.toString(),
                            email: user.email,
                            name: user.name,
                            tenantId: user.tenantId,
                            role: user.role
                        }
                    }

                    return null
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id
                token.tenantId = (user as { tenantId?: number }).tenantId ?? 0
                token.role = (user as { role?: string }).role ?? ''
            }
            return token
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.tenantId = token.tenantId as number
                session.user.role = token.role as string
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const { handlers } = NextAuth(authOptions)

export const { GET, POST } = handlers
