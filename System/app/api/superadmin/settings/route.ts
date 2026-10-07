import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { SaaSSettings } from '@/lib/initModels';

// GET /api/superadmin/settings - Get SaaS platform settings & subscription plans
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
            data: settings,
        });
    } catch (error: any) {
        console.error('Error fetching SaaS settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT /api/superadmin/settings - Update SaaS platform settings & subscription plans
export async function PUT(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();

        const updatedSettings = await SaaSSettings.findOneAndUpdate(
            {},
            body,
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            message: 'SaaS Platform settings updated successfully',
            data: updatedSettings,
        });
    } catch (error: any) {
        console.error('Error updating SaaS settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
