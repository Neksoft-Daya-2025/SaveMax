/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { Organization, Property, Unit, User, SaaSSettings } from '@/lib/initModels';

export async function GET(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();

        const [
            totalOrgs,
            activeOrgs,
            trialOrgs,
            suspendedOrgs,
            monthlyPlanOrgs,
            yearlyPlanOrgs,
            totalProperties,
            totalUnits,
            totalUsers,
            recentOrganizations,
            saasSettings
        ] = await Promise.all([
            Organization.countDocuments(),
            Organization.countDocuments({ status: 'active' }),
            Organization.countDocuments({ 'subscription.status': 'trial' }),
            Organization.countDocuments({ status: 'suspended' }),
            Organization.countDocuments({ 'subscription.plan': 'monthly', status: 'active' }),
            Organization.countDocuments({ 'subscription.plan': 'yearly', status: 'active' }),
            Property.countDocuments(),
            Unit.countDocuments(),
            User.countDocuments(),
            Organization.find().sort({ createdAt: -1 }).limit(6).populate('adminUser', 'name email phone').lean(),
            SaaSSettings.findOne().lean()
        ]);

        const monthlyPrice = (saasSettings as any)?.plans?.monthly?.price || 49;
        const yearlyPrice = (saasSettings as any)?.plans?.yearly?.price || 490;

        // Estimated Monthly Recurring Revenue (MRR) & Annual Recurring Revenue (ARR)
        const estimatedMRR = (monthlyPlanOrgs * monthlyPrice) + Math.round((yearlyPlanOrgs * yearlyPrice) / 12);
        const estimatedARR = (estimatedMRR * 12);

        return NextResponse.json({
            success: true,
            data: {
                totalOrgs,
                activeOrgs,
                trialOrgs,
                suspendedOrgs,
                monthlyPlanOrgs,
                yearlyPlanOrgs,
                totalProperties,
                totalUnits,
                totalUsers,
                estimatedMRR,
                estimatedARR,
                currency: (saasSettings as any)?.currency || 'USD',
                recentOrganizations,
            }
        });
    } catch (error: any) {
        console.error('Error fetching SuperAdmin stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
