import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Unit from "@/models/Unit";
import Settings from "@/models/Settings";
import { initModels } from "@/lib/initModels";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDB();
        initModels();

        const { id } = await params;
        const unit = await Unit.findById(id).populate('property', 'title location propertyType purpose').lean();
        if (!unit) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const settings = await Settings.findOne().lean();

        return NextResponse.json({
            success: true,
            data: {
                unit,
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
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
