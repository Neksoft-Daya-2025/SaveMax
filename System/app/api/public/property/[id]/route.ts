/* Developed by RUDRA via NEKLLM */
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Settings from "@/models/Settings";
import { initModels } from "@/lib/initModels";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.isObjectIdOrHexString(id)) {
            return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
        }
        await connectToDB();
        initModels();
        const property = await Property.findById(id).lean();
        if (!property) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const settings = await Settings.findOne().lean();

        return NextResponse.json({
            success: true,
            data: {
                property,
                settings: settings ? {
                    storeName: (settings as any).storeName,
                    address: (settings as any).address,
                    phone: (settings as any).phone,
                    email: (settings as any).email,
                    currency: (settings as any).currency,
                } : null,
            }
        });
    } catch (error: any) {
        console.error('Public property lookup failed:', error);
        return NextResponse.json({ success: false, error: 'Unable to load property' }, { status: 500 });
    }
}
