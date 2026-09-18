/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Role from "@/models/Role";

export async function GET() {
    try {
        await connectToDB();

        const fullPermissions = {
            dashboard: { view: true },
            properties: { view: 'all', create: true, edit: true, delete: true },
            bookings: { view: 'all', create: true, edit: true, delete: true },
            inquiries: { view: 'all', create: true, edit: true, delete: true },
            maintenance: { view: 'all', create: true, edit: true, delete: true },
            payroll: { view: 'all', create: true, edit: true, delete: true },
            rent: { view: 'all', create: true, edit: true, delete: true },
            contracts: { view: 'all', create: true, edit: true, delete: true },
            agents: { view: 'all', create: true, edit: true, delete: true },
            owners: { view: 'all', create: true, edit: true, delete: true },
            customers: { view: 'all', create: true, edit: true, delete: true },
            expenses: { view: 'all', create: true, edit: true, delete: true },
            payments: { view: 'all', create: true, edit: true, delete: true },
            staff: { view: 'all', create: true, edit: true, delete: true },
            users: { view: 'all', create: true, edit: true, delete: true },
            roles: { view: 'all', create: true, edit: true, delete: true },
            cms: { view: 'all', create: true, edit: true, delete: true },
            aiReports: { view: true },
            propertyAssistant: { view: true },
            settings: { view: true, edit: true },
            financialReports: { view: 'all', create: true, edit: true, delete: true },
            units: { view: 'all', create: true, edit: true, delete: true },
        };

        const rolesToSeed = [
            { name: "Super Admin", description: "Full system access", permissions: fullPermissions, isSystem: true },
            { name: "Admin", description: "Administrator access", permissions: fullPermissions, isSystem: true },
            {
                name: "Agent",
                description: "Property Agent",
                permissions: {
                    ...fullPermissions,
                    users: { view: 'none', create: false, edit: false, delete: false },
                    roles: { view: 'none', create: false, edit: false, delete: false },
                    settings: { view: false, edit: false },
                    properties: { view: 'own', create: true, edit: true, delete: false },
                },
                isSystem: true
            },
            {
                name: "Owner",
                description: "Property Owner",
                permissions: {
                    dashboard: { view: true },
                    properties: { view: 'own', create: true, edit: true, delete: false },
                },
                isSystem: true
            },
            {
                name: "Customer",
                description: "General Customer/Buyer/Tenant",
                permissions: {
                    dashboard: { view: true },
                    properties: { view: 'all', create: false, edit: false, delete: false },
                    contracts: { view: 'own', create: false, edit: false, delete: false },
                    units: { view: 'all', create: false, edit: false, delete: false },
                    agents: { view: 'all', create: false, edit: false, delete: false },
                },
                isSystem: true
            }
        ];

        for (const roleData of rolesToSeed) {
            await Role.findOneAndUpdate(
                { name: roleData.name },
                { $set: roleData },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ success: true, message: "Roles and permissions seeded successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
