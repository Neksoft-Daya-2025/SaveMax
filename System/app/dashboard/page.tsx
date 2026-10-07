import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { MessageSquare, Calendar, DollarSign, FileText, Building, Users, Wrench, DoorOpen, Activity, Percent } from 'lucide-react';
import { connectToDB } from '@/lib/mongodb';
import { Property, Inquiry, Booking, Contract, Payment, Unit, Maintenance, Organization } from '@/lib/initModels';
import Settings from '@/models/Settings';
import { getFirstAccessiblePath } from '@/lib/rbac';
import { applyTenantFilter } from '@/lib/tenant';

export default async function DashboardPage() {
    const session: any = await auth();

    if (!session) {
        redirect('/login');
    }

    const { permissions, role, id, email, isSuperAdmin, organizationId } = session.user as any;

    // SuperAdmin should land on the SuperAdmin panel
    if (isSuperAdmin) {
        redirect('/superadmin');
    }

    if (!permissions?.dashboard?.view) {
        const target = await getFirstAccessiblePath();
        redirect(target);
    }

    await connectToDB();

    const isCustomer = role === 'Customer';
    const tenantFilter = applyTenantFilter(session, {});

    const customerFilter = isCustomer ? {
        ...tenantFilter,
        $or: [
            { customer: id },
            { email: email?.toLowerCase().trim() },
            { "client": id },
            { "parties.client": id },
            { "requestedBy": id }
        ]
    } : tenantFilter;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        totalProperties,
        pendingInquiries,
        todaysBookings,
        activeLeases,
        totalRevenueArray,
        propertyStatusDistribution,
        orgDoc,
        settingsDoc,
        totalUnits,
        occupiedUnits,
        monthlyPayments,
        activeTenantsCount,
        openMaintenance,
        urgentMaintenance
    ] = await Promise.all([
        isCustomer ? 0 : Property.countDocuments(tenantFilter),
        Inquiry.countDocuments({
            ...customerFilter,
            status: 'New',
        }),
        Booking.countDocuments({
            ...customerFilter,
            visitDate: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lte: new Date().setHours(23, 59, 59, 999)
            },
        }),
        Contract.countDocuments({
            ...customerFilter,
            status: 'Active',
        }),
        Payment.aggregate([
            {
                $match: {
                    ...customerFilter,
                    status: 'Completed',
                }
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]),
        isCustomer ? [] : Property.aggregate([
            { $match: tenantFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        organizationId ? Organization.findById(organizationId).lean() : null,
        Settings.findOne().lean(),
        isCustomer ? 0 : Unit.countDocuments(tenantFilter),
        isCustomer ? 0 : Unit.countDocuments({ ...tenantFilter, status: 'Rented' }),
        isCustomer ? [] : Payment.aggregate([
            { $match: { ...tenantFilter, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, totalDue: { $sum: "$totalAmount" }, totalCollected: { $sum: "$receivedAmount" } } }
        ]),
        isCustomer ? 0 : Contract.distinct('parties.client', { ...tenantFilter, status: 'Active', type: { $in: ['Rent', 'Lease'] } }).then(res => res.length),
        isCustomer ? 0 : Maintenance.countDocuments({ ...tenantFilter, status: { $in: ['Pending', 'In Progress'] } }),
        isCustomer ? 0 : Maintenance.countDocuments({ ...tenantFilter, status: { $in: ['Pending', 'In Progress'] }, priority: 'Emergency' })
    ]);

    const occupancyRate = totalUnits ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0.0';
    const vacantUnits = totalUnits - occupiedUnits;
    const vacancyRate = totalUnits ? ((vacantUnits / totalUnits) * 100).toFixed(1) : '0.0';

    const monthTotalDue = monthlyPayments[0]?.totalDue || 0;
    const monthTotalCollected = monthlyPayments[0]?.totalCollected || 0;
    const collectionRate = monthTotalDue ? ((monthTotalCollected / monthTotalDue) * 100).toFixed(1) : '0.0';

    const currency = (orgDoc as any)?.settings?.currency || (orgDoc as any)?.subscription?.currency || (settingsDoc as any)?.currency || 'USD';
    const formatCurrency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format;

    const totalRevenue = totalRevenueArray[0]?.total || 0;

    const statusChartData = propertyStatusDistribution.map((item: any) => ({
        name: item._id || 'Unknown',
        value: item.count
    }));

    if (statusChartData.length === 0 && !isCustomer) {
        statusChartData.push({ name: 'No Data', value: 0 });
    }

    // Fetch monthly revenue for SalesChart scoped to tenant
    const monthlyRevenue = await Payment.aggregate([
        {
            $match: {
                ...customerFilter,
                status: 'Completed',
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                total: { $sum: "$totalAmount" }
            }
        },
        { $sort: { "_id": 1 } },
        { $limit: 7 }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = monthlyRevenue.length > 0
        ? monthlyRevenue.map(item => ({
            name: monthNames[item._id - 1],
            sales: item.total
        }))
        : (isCustomer ? [] : [
            { name: 'Mon', sales: 4000 },
            { name: 'Tue', sales: 3000 },
            { name: 'Wed', sales: 2000 },
            { name: 'Thu', sales: 2780 },
            { name: 'Fri', sales: 1890 },
            { name: 'Sat', sales: 2390 },
            { name: 'Sun', sales: 3490 },
        ]);

    const recentInquiries = await Inquiry.find(
        customerFilter
    ).sort({ createdAt: -1 }).limit(5).populate('property', 'title');

    const formattedActivity = recentInquiries.map(inq => ({
        id: inq._id.toString(),
        type: "sale" as const,
        product: `${inq.name} - ${(inq.property as any)?.title || 'General'}`,
        quantity: 1,
        time: new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const orgName = (orgDoc as any)?.name || (session.user as any)?.organization?.name;
    const planName = (orgDoc as any)?.subscription?.plan === 'yearly' ? 'Enterprise Annual' : 'Professional Monthly';

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {orgName && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 uppercase tracking-wider">
                                {orgName}
                            </span>
                        )}
                        {!isCustomer && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {planName}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{isCustomer ? 'My Tenant Portal' : 'Organization Dashboard'}</h1>
                    <p className="text-gray-500 text-sm">Welcome back, {session.user?.name || 'User'}! Here is your organization overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-900 text-white shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {!isCustomer && (
                    <>
                        <StatCard
                            title="Total Properties"
                            value={totalProperties.toString()}
                            icon={Building}
                            color="blue"
                            trend="Active properties in portfolio"
                            trendUp={true}
                        />
                        <StatCard
                            title="Occupancy Rate"
                            value={`${occupancyRate}%`}
                            icon={Percent}
                            color="green"
                            trend={`${occupiedUnits} of ${totalUnits} units occupied`}
                            trendUp={parseFloat(occupancyRate) >= 50}
                        />
                        <StatCard
                            title="Collection Rate"
                            value={`${collectionRate}%`}
                            icon={DollarSign}
                            color="blue"
                            trend="Invoices due this month collected"
                            trendUp={parseFloat(collectionRate) >= 50}
                        />
                        <StatCard
                            title="Active Tenants"
                            value={activeTenantsCount.toString()}
                            icon={Users}
                            color="purple"
                            trend={`${pendingInquiries} pending applications`}
                            trendUp={true}
                        />
                        <StatCard
                            title="Open Maintenance"
                            value={openMaintenance.toString()}
                            icon={Wrench}
                            color="orange"
                            trend={`${urgentMaintenance} urgent`}
                            trendUp={false}
                        />
                        <StatCard
                            title="Vacant Units"
                            value={vacantUnits.toString()}
                            icon={DoorOpen}
                            color="red"
                            trend={`${vacancyRate}% vacancy rate`}
                            trendUp={false}
                        />
                    </>
                )}
                <StatCard
                    title={isCustomer ? "Total Paid" : "Total Revenue"}
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    color="green"
                    trend={isCustomer ? "Payments" : "Lifetime"}
                    trendUp={true}
                />
                {isCustomer && (
                    <>
                        <StatCard
                            title={isCustomer ? "My Inquiries" : "New Inquiries"}
                            value={pendingInquiries.toString()}
                            icon={MessageSquare}
                            color="blue"
                            trend={isCustomer ? "Total" : "Pending Action"}
                            trendUp={pendingInquiries > 0}
                        />
                        <StatCard
                            title={isCustomer ? "Scheduled Visits" : "Visits Scheduled"}
                            value={todaysBookings.toString()}
                            icon={Calendar}
                            color="purple"
                            trend={isCustomer ? "Upcoming" : "Today"}
                            trendUp={todaysBookings > 0}
                        />
                    </>
                )}
                <StatCard
                    title={isCustomer ? "My Contracts" : "Active Leases"}
                    value={activeLeases.toString()}
                    icon={FileText}
                    color="orange"
                    trend="Active"
                    trendUp={true}
                />
            </div>

            {/* Charts Section */}
            <DashboardCharts salesData={chartData} statusData={statusChartData} />

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Inquiries</h3>
                <RecentActivity activities={formattedActivity} />
            </div>
        </div>
    );
}
