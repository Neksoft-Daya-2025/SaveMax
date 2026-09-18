/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { Review } from '@/lib/initModels';

// GET /api/superadmin/reviews - Get all customer reviews/testimonials
export async function GET(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();

        const reviews = await Review.find().sort({ order: 1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: reviews,
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/superadmin/reviews - Create a new review
export async function POST(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();

        if (!body.author?.trim() || !body.role?.trim() || !body.content?.trim()) {
            return NextResponse.json({ success: false, error: 'Author, role, and review content are required' }, { status: 400 });
        }

        const count = await Review.countDocuments();
        const review = await Review.create({
            author: body.author.trim(),
            role: body.role.trim(),
            company: body.company?.trim() || '',
            units: body.units?.trim() || '',
            content: body.content.trim(),
            rating: body.rating !== undefined ? Number(body.rating) : 5,
            avatarUrl: body.avatarUrl?.trim() || '',
            order: body.order !== undefined ? Number(body.order) : count,
            isActive: body.isActive !== undefined ? body.isActive : true,
            isFeatured: body.isFeatured !== undefined ? body.isFeatured : true,
        });

        return NextResponse.json({
            success: true,
            message: 'Review created successfully',
            data: review,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
