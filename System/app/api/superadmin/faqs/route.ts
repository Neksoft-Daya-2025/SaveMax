/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { FAQ } from '@/lib/initModels';

// GET /api/superadmin/faqs - Get all FAQs for SuperAdmin management
export async function GET(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();

        const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: faqs,
        });
    } catch (error: any) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/superadmin/faqs - Create a new FAQ
export async function POST(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();

        if (!body.question?.trim() || !body.answer?.trim()) {
            return NextResponse.json({ success: false, error: 'Question and answer are required' }, { status: 400 });
        }

        const count = await FAQ.countDocuments();
        const faq = await FAQ.create({
            question: body.question.trim(),
            answer: body.answer.trim(),
            category: body.category?.trim() || 'General',
            order: body.order !== undefined ? body.order : count,
            isActive: body.isActive !== undefined ? body.isActive : true,
        });

        return NextResponse.json({
            success: true,
            message: 'FAQ created successfully',
            data: faq,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
