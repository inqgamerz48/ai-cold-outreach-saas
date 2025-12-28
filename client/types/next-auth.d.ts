import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            tenantId: number
            role: string
        }
    }

    interface User {
        id: string
        email: string
        name?: string | null
        tenantId: number
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        tenantId: number
        role: string
    }
}
