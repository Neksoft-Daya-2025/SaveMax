/* Developed by RUDRA via NEKLLM */
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SaaSSettings, FAQ, Review } from '@/lib/initModels';

const DEFAULT_FAQS = [
    {
        question: "How does multi-tenancy work in SaveMAX?",
        answer: "Each organization receives a completely isolated workspace with its own dedicated Admin, Agents, and Customers. Your properties, contracts, financial data, and team members are strictly partitioned and secure.",
        order: 0,
        category: "Architecture",
        isActive: true,
    },
    {
        question: "Can I switch between Monthly and Yearly billing?",
        answer: "Yes! You can upgrade or switch billing cycles anytime from your organization settings or by contacting the platform administrator.",
        order: 1,
        category: "Billing",
        isActive: true,
    },
    {
        question: "What roles are included with each organization?",
        answer: "When an organization is provisioned, 3 tailored role templates are automatically configured: Admin (full workspace control), Agent (property listings, bookings, inquiries), and Customer (tenant portal, contracts, payments).",
        order: 2,
        category: "Roles & Access",
        isActive: true,
    },
    {
        question: "Is there a free trial available?",
        answer: "Yes, new organizations receive a 14-day free trial to test all enterprise features with zero commitment.",
        order: 3,
        category: "General",
        isActive: true,
    },
    {
        question: "How secure is tenant data and financial records?",
        answer: "All data is encrypted in transit and at rest with bank-grade 256-bit SSL protocols. Database access is strictly bound by tenant-isolation middleware filters.",
        order: 4,
        category: "Security",
        isActive: true,
    }
];

const DEFAULT_REVIEWS = [
    {
        author: "Marcus Vance",
        role: "Managing Director",
        company: "Vance & Co Properties",
        units: "320 Units",
        content: "SaveMAX cut our overdue rent collections by 75% within the first two months. The automated reminders and tenant portal are absolute game-changers.",
        rating: 5,
        order: 0,
        isActive: true,
        isFeatured: true,
    },
    {
        author: "Elena Rostova",
        role: "Head of Operations",
        company: "Skyline Real Estate",
        units: "540 Units",
        content: "Having dedicated Admin, Agent, and Tenant access in one isolated organization workspace removed our communication bottlenecks completely.",
        rating: 5,
        order: 1,
        isActive: true,
        isFeatured: true,
    },
    {
        author: "David Chen",
        role: "Principal Asset Manager",
        company: "Keystone REIT",
        units: "1,200 Units",
        content: "The SuperAdmin architecture makes managing multi-tenant portfolios effortless. The AI reports give us actionable forecasting in seconds.",
        rating: 5,
        order: 2,
        isActive: true,
        isFeatured: true,
    }
];

// GET /api/public/website-settings - Aggregated public website configuration
export async function GET() {
    try {
        await connectDB();

        // 1. Get or create SaaSSettings
        let settings = await SaaSSettings.findOne().lean();
        if (!settings) {
            settings = await SaaSSettings.create({});
        }

        // 2. Auto-seed FAQs if none exist
        const faqCount = await FAQ.countDocuments();
        if (faqCount === 0) {
            await FAQ.insertMany(DEFAULT_FAQS);
        }

        // 3. Auto-seed Reviews if none exist
        const reviewCount = await Review.countDocuments();
        if (reviewCount === 0) {
            await Review.insertMany(DEFAULT_REVIEWS);
        }

        // 4. Fetch active FAQs & Reviews
        const [faqs, reviews] = await Promise.all([
            FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
            Review.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
        ]);

        const isDemo = (process.env.DEMO?.toLowerCase() === 'true' || process.env.NEXT_PUBLIC_DEMO?.toLowerCase() === 'true' || process.env.DEMO === '1');

        return NextResponse.json({
            success: true,
            data: {
                isDemo,
                platformName: settings.platformName || 'SaveMAX',
                supportEmail: settings.supportEmail,
                phone: settings.phone,
                address: settings.address,
                currency: settings.currency || 'USD',
                trialDays: settings.trialDays || 14,
                landingPage: settings.landingPage || {},
                plans: settings.plans || {},
                faqs: faqs.map(f => ({
                    _id: f._id,
                    q: f.question,
                    a: f.answer,
                    category: f.category,
                    order: f.order,
                })),
                reviews: reviews.map(r => ({
                    _id: r._id,
                    author: r.author,
                    role: r.role,
                    company: r.company,
                    units: r.units,
                    quote: r.content,
                    rating: r.rating,
                    avatarUrl: r.avatarUrl,
                })),
            },
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
            }
        });
    } catch (error: any) {
        console.error('Error loading public website settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
