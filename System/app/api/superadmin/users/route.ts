import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { User } from '@/lib/initModels';
import { escapeRegex } from '@/lib/security';

export async function GET(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const search = searchParams.get('search') || '';
        const organizationId = searchParams.get('organizationId');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        const query: any = {};

        if (search) {
            const safe = escapeRegex(search);
            query.$or = [
                { name: { $regex: safe, $options: 'i' } },
                { email: { $regex: safe, $options: 'i' } },
            ];
        }

        if (organizationId) {
            query.organization = organizationId;
        }

        if (status) {
            query.status = status;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .populate('role', 'name')
                .populate('organization', 'name slug status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        });
    } catch (error: any) {
        console.error('Error fetching global users:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
