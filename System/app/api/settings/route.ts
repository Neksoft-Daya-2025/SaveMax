/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import Organization from '@/models/Organization';
import { auth } from '@/auth';
import { checkPermission } from '@/lib/rbac';
import { getTenantContext } from '@/lib/tenant';

// GET /api/settings - Get organization/store settings
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { session, organizationId, isSuperAdmin } = await getTenantContext(request);

        // If unauthenticated, return public fallback data
        if (!session) {
            let settings: any = await Settings.findOne().lean();
            return NextResponse.json({
                success: true,
                data: {
                    storeName: settings?.storeName || 'SaveMAX',
                    logoUrl: settings?.logoUrl || '',
                    address: settings?.address || '',
                    phone: settings?.phone || '',
                    email: settings?.email || '',
                    website: settings?.website || '',
                    businessHours: settings?.businessHours || 'Mon-Fri: 9:00 AM - 6:00 PM',
                    currency: settings?.currency || 'USD',
                    timezone: settings?.timezone || 'UTC',
                }
            });
        }

        // Check settings view permission
        const permissionError = await checkPermission(request, 'settings', 'view');
        if (permissionError) return permissionError;

        // If user belongs to an organization, fetch organization-specific settings
        if (organizationId) {
            const org: any = await Organization.findById(organizationId).lean();
            if (org && org.settings) {
                return NextResponse.json({
                    success: true,
                    data: {
                        ...org.settings,
                        storeName: org.settings.storeName || org.name,
                        currency: org.settings.currency || org.subscription?.currency || 'USD',
                        email: org.settings.email || org.email,
                        phone: org.settings.phone || org.phone,
                        address: org.settings.address || org.address,
                        logoUrl: org.settings.logoUrl || org.logoUrl || '',
                    }
                });
            }
        }

        // Fallback global settings
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                storeName: 'SaveMAX',
                currency: 'USD',
                timezone: 'UTC',
                taxRate: 0
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT /api/settings - Update organization/store settings
export async function PUT(request: NextRequest) {
    try {
        const { session, organizationId } = await getTenantContext(request);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'settings', 'edit');
        if (permissionError) return permissionError;

        const body = await request.json();

        // If organization tenant user, update organization settings
        if (organizationId) {
            const org = await Organization.findById(organizationId);
            if (org) {
                org.settings = {
                    ...org.settings,
                    ...body,
                };
                if (body.storeName) org.name = body.storeName;
                if (body.email) org.email = body.email;
                if (body.phone) org.phone = body.phone;
                if (body.address) org.address = body.address;
                if (body.logoUrl) org.logoUrl = body.logoUrl;
                await org.save();

                return NextResponse.json({ success: true, data: org.settings });
            }
        }

        // Global fallback settings
        const settings = await Settings.findOneAndUpdate(
            {},
            body,
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
