/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { SaaSSettings } from '@/lib/initModels';

// GET /api/superadmin/website-settings - Get SaaS landing page website settings
export async function GET(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();

        let settings = await SaaSSettings.findOne();
        if (!settings) {
            settings = await SaaSSettings.create({});
        }

        return NextResponse.json({
            success: true,
            data: {
                landingPage: settings.landingPage,
                platformName: settings.platformName,
                supportEmail: settings.supportEmail,
                phone: settings.phone,
                address: settings.address,
                currency: settings.currency,
                timezone: settings.timezone,
            },
        });
    } catch (error: any) {
        console.error('Error fetching website settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT /api/superadmin/website-settings - Update SaaS landing page website settings
export async function PUT(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();

        let settings = await SaaSSettings.findOne();
        if (!settings) {
            settings = await SaaSSettings.create(body);
        } else {
            if (body.landingPage) {
                settings.landingPage = {
                    ...settings.landingPage,
                    ...body.landingPage,
                };
            }
            if (body.platformName !== undefined) settings.platformName = body.platformName;
            if (body.supportEmail !== undefined) settings.supportEmail = body.supportEmail;
            if (body.phone !== undefined) settings.phone = body.phone;
            if (body.address !== undefined) settings.address = body.address;

            await settings.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Website and landing page settings updated successfully',
            data: settings,
        });
    } catch (error: any) {
        console.error('Error updating website settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
