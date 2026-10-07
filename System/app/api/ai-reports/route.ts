
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import {
    Booking,
    Contract,
    Payment,
    Expense,
    Property,
    Staff,
    Payroll,
    Inquiry
} from "@/lib/initModels";
import Settings from "@/models/Settings";
import { startOfMonth, endOfMonth, subDays } from "date-fns";

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { prompt, timeRange = '30d' } = await request.json();

        // 1. Fetch AI Settings
        const settings = await Settings.findOne({});
        if (!settings?.aiEnabled || !settings?.openaiApiKey) {
            return NextResponse.json({
                success: false,
                error: "AI is not enabled or API key is missing. Please check your settings."
            }, { status: 400 });
        }

        // 2. Aggregate Data for Context
        const end = new Date();
        const start = subDays(end, parseInt(timeRange) || 30);

        // Revenue & Expense Data
        const payments = await Payment.find({ date: { $gte: start, $lte: end } });
        const expenses = await Expense.find({ date: { $gte: start, $lte: end } });
        const contracts = await Contract.find({ 'details.startDate': { $gte: start, $lte: end } });

        const totalRevenue = payments.reduce((sum, pay) => sum + pay.amount, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalContractValue = contracts.reduce((sum, con) => sum + (con.details?.amount || 0), 0);

        // Property Stats
        const totalProperties = await Property.countDocuments();
        const activeListings = await Property.countDocuments({ status: 'Available' });

        // Context for AI
        const context = {
            businessName: settings.storeName,
            timeRange: `${timeRange} days`,
            financials: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                contractVolume: totalContractValue,
                netCashFlow: totalRevenue - totalExpenses
            },
            inventory: {
                totalProperties,
                activeListings,
                occupancyRate: totalProperties > 0 ? ((totalProperties - activeListings) / totalProperties * 100).toFixed(2) + '%' : '0%'
            },
            overallStats: {
                totalPayments: payments.length,
                totalNewContracts: contracts.length
            }
        };

        // 3. Call OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${settings.openaiApiKey}`
            },
            body: JSON.stringify({
                model: settings.openaiModel || "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are a Senior Strategic Advisor and Financial Analyst for ${settings.storeName}. 
                        Your objective is to provide executive-level property intelligence and market analysis.

                        CRITICAL REPORT STRUCTURE:
                        Your response MUST follow this exact Markdown structure:
                        # INVESTMENT INTELLIGENCE REPORT: [Project Name/Property Title]
                        
                        ## EXECUTIVE SUMMARY
                        [3-4 sentences of high-level overview and strategic outlook]

                        ## 1. MARKET VALUATION & CAPITAL GROWTH
                        [Detailed analysis of pricing, trends, and market positioning]

                        ## 2. OPERATIONAL & RENTAL PERFORMANCE
                        [Yield analysis, occupancy potential, and income optimization]

                        ## 3. RISK ASSESSMENT & MITIGATION
                        [Identification of structural, financial, or market risks]

                        ## STRATEGIC RECOMMENDATIONS
                        [3-4 specific, actionable professional steps]

                        TONE: Highly formal, analytical, data-focused, and objective. Avoid enthusiastic or casual language.`
                    },
                    {
                        role: "user",
                        content: `User Question: ${prompt || "Give me a general performance report and recommendations."}\n\nData Context:\n${JSON.stringify(context, null, 2)}`
                    }
                ],
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
            analysis: aiData.choices[0].message.content,
            context,
            usage: aiData.usage
        });

    } catch (error: any) {
        console.error("AI Report Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
