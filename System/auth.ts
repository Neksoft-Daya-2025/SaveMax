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

                try {
                    await dbConnect();
                    const { User, Organization } = initModels();

                    // The Save Max deployment shares a database with another site.
                    // Resolve its own organization first so equal email addresses
                    // cannot authenticate as a user from the other deployment.
                    const saveMaxDeployment = (() => {
                        try {
                            return new URL(process.env.NEXTAUTH_URL || '').hostname.endsWith('savemax.ro');
                        } catch {
                            return false;
                        }
                    })();
                    const organization = saveMaxDeployment
                        ? await Organization.findOne({ slug: 'save-max' }).select('_id')
                        : null;
                    if (saveMaxDeployment && !organization) {
                        throw new Error('Save Max organization is unavailable');
                    }

                    // Find user and include password field, role & organization
                    const user: any = await User.findOne({
                        email: (credentials.email as string).toLowerCase().trim(),
                        ...(organization ? { organization: organization._id } : {}),
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

            // Refresh from DB if specifically requested via trigger
            if (trigger === "update" && session?.permissions) {
                token.permissions = session.permissions;
            } else if (trigger === "update" && token.roleId) {
                try {
                    await dbConnect();
                    const { Role, Organization } = await import("@/lib/initModels");
                    const role = await Role.findById(token.roleId);
                    if (role) {
                        token.role = role.name;
                        token.permissions = role.permissions;
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
                    console.error("Error refreshing JWT callback:", error);
                }
            }

            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.id as string;
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
