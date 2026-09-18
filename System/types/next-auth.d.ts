/* Developed by RUDRA via NEKLLM */
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role?: string;
            permissions?: any;
            phone?: string;
            isSuperAdmin?: boolean;
            organizationId?: string | null;
            organization?: {
                id: string;
                name: string;
                slug: string;
                status: string;
                subscription?: any;
                logoUrl?: string;
            } | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role?: any;
        permissions?: any;
        phone?: string;
        isSuperAdmin?: boolean;
        organizationId?: string | null;
        organization?: any;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string;
        permissions?: any;
        roleId?: string;
        phone?: string;
        isSuperAdmin?: boolean;
        organizationId?: string | null;
        organization?: {
            id: string;
            name: string;
            slug: string;
            status: string;
            subscription?: any;
            logoUrl?: string;
        } | null;
    }
}
