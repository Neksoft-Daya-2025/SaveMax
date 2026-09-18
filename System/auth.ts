/* Developed by RUDRA via NEKLLM */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please provide email and password");
                }
                // Public demo credentials are for the local development site only.
                if (process.env.NODE_ENV !== 'development' &&
                    /^demo\.(superadmin|admin|customer|agent)@savemax\.example$/i.test(String(credentials.email).trim())) {
                    return null;
                }

                try {
                    await dbConnect();
                    const { User } = initModels();

                    // Find user and include password field, role & organization
                    const user: any = await User.findOne({
                        email: (credentials.email as string).toLowerCase().trim()
                    }).select('+password').populate('role').populate('organization');

                    if (!user) {
                        throw new Error("Invalid email or password");
                    }

                    // Check if account is active
                    if (user.status === 'Inactive') {
                        throw new Error("This account is inactive. Please contact your administrator.");
                    }

                    // Check if organization is suspended
                    if (user.organization && user.organization.status === 'suspended') {
                        throw new Error("Your organization account is currently suspended. Please contact support.");
                    }

                    // Check password
                    const isPasswordValid = await user.comparePassword(
                        credentials.password as string
                    );

                    if (!isPasswordValid) {
                        throw new Error("Invalid email or password");
                    }

                    const isSuperAdmin = Boolean(
                        user.isSuperAdmin || 
                        user.role?.name === 'Super Admin' || 
                        user.role?.name === 'SuperAdmin'
                    );

                    // Non-superadmin users must have an assigned role
                    if (!isSuperAdmin && !user.role) {
                        console.error(`Login failed: User ${user.email} has no role assigned.`);
                        throw new Error("Access denied: No role assigned. Please contact administrator.");
                    }

                    // Return user object for session
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        role: user.role,
                        isSuperAdmin,
                        organizationId: user.organization ? user.organization._id.toString() : null,
                        organization: user.organization ? {
                            id: user.organization._id.toString(),
                            name: user.organization.name,
                            slug: user.organization.slug,
                            status: user.organization.status,
                            subscription: user.organization.subscription,
                            logoUrl: user.organization.logoUrl,
                        } : null,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    throw error;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.phone = (user as any).phone;
                token.isSuperAdmin = (user as any).isSuperAdmin;
                token.organizationId = (user as any).organizationId;
                token.organization = (user as any).organization;
                if (user.role) {
                    token.role = user.role.name;
                    token.permissions = user.role.permissions;
                    token.roleId = user.role._id?.toString() || user.role.toString();
                } else if ((user as any).isSuperAdmin) {
                    token.role = 'Super Admin';
                }
            }

            // Keep existing sessions in sync with saved profile changes, including
            // sessions opened before the profile-refresh fix was installed.
            if (!user && token.id) {
                try {
                    await dbConnect();
                    const { User } = await import("@/lib/initModels");
                    const currentUser = await User.findById(token.id).select('name email phone');
                    if (currentUser) {
                        token.name = currentUser.name;
                        token.email = currentUser.email;
                        token.phone = currentUser.phone;
                    }
                } catch (error) {
                    console.error("Error refreshing session profile:", error);
                }
            }

            // Refresh permissions only from the database on an explicit update.
            if (trigger === "update" && token.id) {
                try {
                    await dbConnect();
                    const { Role, Organization } = await import("@/lib/initModels");
                    const role = token.roleId ? await Role.findById(token.roleId) : null;
                    if (role) {
                        token.role = role.name;
                        token.permissions = role.permissions;
                    } else {
                        token.permissions = {};
                    }
                    if (token.organizationId) {
                        const org = await Organization.findById(token.organizationId);
                        if (org) {
                            token.organization = {
                                id: org._id.toString(),
                                name: org.name,
                                slug: org.slug,
                                status: org.status,
                                subscription: org.subscription,
                                logoUrl: org.logoUrl,
                            };
                        }
                    }
                } catch (error) {
                    token.permissions = {};
                    console.error("Error refreshing JWT callback:", error);
                }
            }

            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions;
                session.user.phone = token.phone as any;
                session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
                session.user.organizationId = token.organizationId as string | null;
                session.user.organization = token.organization as any;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
