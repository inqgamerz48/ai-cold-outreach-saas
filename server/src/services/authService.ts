import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthUser {
    id: number;
    email: string;
    name: string | null;
    tenantId: number;
    role: string;
}

export class AuthService {
    /**
     * Register a new user and create a tenant for them
     */
    async register(email: string, password: string, name?: string, tenantName?: string): Promise<AuthUser> {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            throw new Error('User already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create tenant and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName || `${name || email}'s Workspace`
                }
            });

            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    tenantId: tenant.id,
                    role: 'ADMIN' // First user is admin
                }
            });

            return { user, tenant };
        });

        return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            tenantId: result.user.tenantId,
            role: result.user.role
        };
    }

    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<AuthUser | null> {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            role: user.role
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<AuthUser | null> {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            role: user.role
        };
    }
}
