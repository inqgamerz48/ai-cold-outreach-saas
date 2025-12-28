import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to extract and validate tenant context from request
 * In a production app, this would validate JWT tokens
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
    // For now, we'll use a header or default to tenant 1
    // In production, this would come from the JWT token
    const tenantIdHeader = req.headers['x-tenant-id'];

    if (tenantIdHeader) {
        req.tenantId = parseInt(tenantIdHeader as string, 10);
    } else {
        // Default to tenant 1 for backward compatibility
        req.tenantId = 1;
    }

    next();
}

/**
 * Middleware to ensure user is authenticated
 * In production, this would validate JWT tokens
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // For now, we'll skip auth validation
    // In production, validate JWT from Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        // For development, allow unauthenticated access
        // In production, return 401
        req.userId = 1; // Default user
        req.tenantId = 1; // Default tenant
    } else {
        // Parse JWT and extract userId and tenantId
        // For now, just default
        req.userId = 1;
        req.tenantId = 1;
    }

    next();
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            tenantId?: number;
        }
    }
}
