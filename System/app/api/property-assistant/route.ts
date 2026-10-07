
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Property } from "@/lib/initModels";
import Settings from "@/models/Settings";

export async function GET() {
    try {
        await connectToDB();
        const properties = await Property.find({}, 'title _id location price propertyType purpose');
        return NextResponse.json({ success: true, data: properties });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { prompt, propertyId, history = [] } = await request.json();

        // 1. Fetch AI Settings
        const settings = await Settings.findOne({});
        if (!settings?.aiEnabled || !settings?.openaiApiKey) {
            return NextResponse.json({
                success: false,
                error: "AI is not enabled or API key is missing. Please check your settings."
            }, { status: 400 });
        }

        // 2. Fetch Property Context if ID is provided
        let propertyContext = "";
        if (propertyId) {
            const property = await Property.findById(propertyId);
            if (property) {
                propertyContext = `
Specific Property Details:
Title: ${property.title}
Price: $${property.price}
Type: ${property.propertyType}
Purpose: ${property.purpose}
Status: ${property.status}
Area: ${property.areaSize} ${property.areaUnit}
Bedrooms: ${property.bedrooms || 'N/A'}
Bathrooms: ${property.bathrooms || 'N/A'}
Location: ${property.location.address}, ${property.location.city}, ${property.location.country}
Description: ${property.description}
Amenities: ${property.amenities.join(', ')}
                `;
            }
        }

        // 3. Prepare OpenAI messages
        const messages = [
            {
                role: "system",
                content: `You are a Senior Asset Manager and Strategic Investment Advisor. 
                Your goal is to provide institutional-grade property analysis and investment intelligence.

                CRITICAL REPORT STRUCTURE:
                Your response MUST follow this exact Markdown structure:
                # PROPERTY INTELLIGENCE REPORT: [Asset Title]
                
                ## EXECUTIVE SUMMARY
                [Formal high-level overview of the asset's potential]

                ## ASSET VALUATION & PERFORMANCE
                [Analysis of price, rental yield potential, and market positioning]

                ## INVESTMENT RISK PROFILE
                [Technical assessment of risks including liquidity, market stability, and asset condition]

                ## STRATEGIC RECOMMENDATIONS
                [Highly professional, actionable advice for the owner/investor]

                ${propertyContext ? `You are currently focusing on the following property:\n${propertyContext}` : "Provide general institutional real estate market insights."}
                TONE: Formal, analytical, institutional, and objective. Use financial terminology where appropriate.`
            },
            ...history,
            {
                role: "user",
                content: prompt
            }
        ];

        // 4. Call OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${settings.openaiApiKey}`
            },
            body: JSON.stringify({
                model: settings.openaiModel || "gpt-4o",
                messages,
                temperature: 0.7
            })
        });

        const aiData = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: aiData.error?.message || "Failed to communicate with OpenAI"
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            message: aiData.choices[0].message.content,
            usage: aiData.usage
        });

    } catch (error: any) {
        console.error("Property Assistant Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
