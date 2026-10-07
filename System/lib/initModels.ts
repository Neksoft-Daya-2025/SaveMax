
// This file ensures all Mongoose models are imported and registered
// Import this in API routes that use populate() to avoid MissingSchemaError

import Settings from '@/models/Settings';
import User from '@/models/User';
import Role from '@/models/Role';
import Property from '@/models/Property';
import Expense from '@/models/Expense';
import Payroll from '@/models/Payroll';
import Inquiry from '@/models/Inquiry';
import Booking from '@/models/Booking';
import Contract from '@/models/Contract';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import BlogPost from '@/models/BlogPost';
import Staff from '@/models/Staff';
import Customer from '@/models/Customer';
import Supplier from '@/models/Supplier';
import Unit from '@/models/Unit';
import Deposit from '@/models/Deposit';
import Maintenance from '@/models/Maintenance';
import Amenity from '@/models/Amenity';
import Organization from '@/models/Organization';
import SaaSSettings from '@/models/SaaSSettings';
import FAQ from '@/models/FAQ';
import Review from '@/models/Review';

// Export all models for convenience
export {
    Settings,
    User,
    Role,
    Property,
    Expense,
    Payroll,
    Inquiry,
    Booking,
    Contract,
    Payment,
    Commission,
    BlogPost,
    Staff,
    Customer,
    Supplier,
    Unit,
    Deposit,
    Maintenance,
    Amenity,
    Organization,
    SaaSSettings,
    FAQ,
    Review,
};

// This function can be called to ensure models are loaded
export function initModels() {
    // Models are loaded via imports above
    return {
        Settings,
        User,
        Role,
        Property,
        Expense,
        Payroll,
        Inquiry,
        Booking,
        Contract,
        Payment,
        Commission,
        BlogPost,
        Staff,
        Customer,
        Supplier,
        Unit,
        Deposit,
        Maintenance,
        Amenity,
        Organization,
        SaaSSettings,
        FAQ,
        Review,
    };
}
