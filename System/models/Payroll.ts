import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
    staff: mongoose.Types.ObjectId;
    month: number; // 1-12
    year: number;
    baseSalary: number;
    totalCommission: number;
    totalTips: number;
    bonuses: number;
    deductions: number;
    totalAmount: number;
    status: 'draft' | 'approved' | 'paid';
    paidDate?: Date;
    paymentMethod?: string;
    notes?: string;
    breakdown: {
        bookings: {
            bookingId: mongoose.Types.ObjectId;
            date: Date;
            status: string;
            commission: number;
        }[];
    };
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'Staff',
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        baseSalary: {
            type: Number,
            required: true,
            default: 0,
        },
        totalCommission: {
            type: Number,
            default: 0,
        },
        totalTips: {
            type: Number,
            default: 0,
        },
        bonuses: {
            type: Number,
            default: 0,
        },
        deductions: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'approved', 'paid'],
            default: 'draft',
        },
        paidDate: Date,
        paymentMethod: String,
        notes: String,
        breakdown: {
            bookings: [{
                bookingId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Booking',
                },
                date: Date,
                status: String,
                commission: Number,
            }],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique payroll per staff per month
PayrollSchema.index({ staff: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);

export default Payroll;
