/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { FAQ } from '@/lib/initModels';

// GET /api/superadmin/faqs/[id] - Get single FAQ
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;

        const faq = await FAQ.findById(id);
        if (!faq) {
            return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: faq });
    } catch (error: any) {
        console.error('Error fetching FAQ:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT /api/superadmin/faqs/[id] - Update FAQ
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const faq = await FAQ.findByIdAndUpdate(
            id,
            {
                ...(body.question !== undefined && { question: body.question.trim() }),
                ...(body.answer !== undefined && { answer: body.answer.trim() }),
                ...(body.category !== undefined && { category: body.category.trim() }),
                ...(body.order !== undefined && { order: body.order }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            },
            { new: true, runValidators: true }
        );

        if (!faq) {
            return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'FAQ updated successfully',
            data: faq,
        });
    } catch (error: any) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/superadmin/faqs/[id] - Delete FAQ
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;

        const faq = await FAQ.findByIdAndDelete(id);
        if (!faq) {
            return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'FAQ deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
