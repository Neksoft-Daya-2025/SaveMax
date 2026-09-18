/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { Review } from '@/lib/initModels';

// GET /api/superadmin/reviews/[id] - Get single review
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;

        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: review });
    } catch (error: any) {
        console.error('Error fetching review:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT /api/superadmin/reviews/[id] - Update review
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const review = await Review.findByIdAndUpdate(
            id,
            {
                ...(body.author !== undefined && { author: body.author.trim() }),
                ...(body.role !== undefined && { role: body.role.trim() }),
                ...(body.company !== undefined && { company: body.company.trim() }),
                ...(body.units !== undefined && { units: body.units.trim() }),
                ...(body.content !== undefined && { content: body.content.trim() }),
                ...(body.rating !== undefined && { rating: Number(body.rating) }),
                ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl.trim() }),
                ...(body.order !== undefined && { order: Number(body.order) }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
                ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
            },
            { new: true, runValidators: true }
        );

        if (!review) {
            return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    } catch (error: any) {
        console.error('Error updating review:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/superadmin/reviews/[id] - Delete review
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;

        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
