import mongoose, { Schema, Model, models } from 'mongoose';

export interface IOrganization {
    _id: string;
    name: string;
    slug: string;
    email: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    website?: string;
    status: 'active' | 'suspended' | 'trial' | 'cancelled';
    subscription: {
        plan: 'monthly' | 'yearly';
        status: 'active' | 'trial' | 'past_due' | 'expired' | 'cancelled';
        billingCycle: 'monthly' | 'yearly';
        amount: number;
        currency: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
    };
    adminUser?: mongoose.Types.ObjectId;
    settings?: {
        storeName?: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        kvkNumber?: string;
        currency?: string;
        timezone?: string;
        taxRate?: number;
        logoUrl?: string;
        businessHours?: string;
        termsAndConditions?: string;
        smsEnabled?: boolean;
        twilioAccountSid?: string;
        twilioAuthToken?: string;
        twilioPhoneNumber?: string;
        emailEnabled?: boolean;
        smtpHost?: string;
        smtpPort?: number;
        smtpSecure?: boolean;
        smtpUser?: string;
        smtpPassword?: string;
        smtpFrom?: string;
        aiEnabled?: boolean;
        openaiApiKey?: string;
        openaiModel?: string;
    };
    stats?: {
        propertiesCount: number;
        unitsCount: number;
        tenantsCount: number;
        usersCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
    {
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Organization slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Organization email is required'],
            lowercase: true,
            trim: true,
        },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        logoUrl: { type: String, default: '' },
        website: { type: String, default: '' },
        status: {
            type: String,
            enum: ['active', 'suspended', 'trial', 'cancelled'],
            default: 'active',
            index: true,
        },
        subscription: {
            plan: {
                type: String,
                enum: ['monthly', 'yearly'],
                default: 'monthly',
            },
            status: {
                type: String,
                enum: ['active', 'trial', 'past_due', 'expired', 'cancelled'],
                default: 'active',
            },
            billingCycle: {
                type: String,
                enum: ['monthly', 'yearly'],
                default: 'monthly',
            },
            amount: { type: Number, default: 49 },
            currency: { type: String, default: 'USD' },
            startDate: { type: Date, default: Date.now },
            endDate: {
                type: Date,
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            autoRenew: { type: Boolean, default: true },
        },
        adminUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        settings: {
            storeName: { type: String, default: '' },
            address: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
            website: { type: String, default: '' },
            kvkNumber: { type: String, trim: true, default: '' },
            currency: { type: String, default: 'USD' },
            timezone: { type: String, default: 'UTC' },
            taxRate: { type: Number, default: 0 },
            logoUrl: { type: String, default: '' },
            businessHours: { type: String, default: 'Mon-Fri: 9:00 AM - 6:00 PM' },
            termsAndConditions: { type: String, default: '' },
            smsEnabled: { type: Boolean, default: false },
            twilioAccountSid: { type: String, default: '' },
            twilioAuthToken: { type: String, default: '' },
            twilioPhoneNumber: { type: String, default: '' },
            emailEnabled: { type: Boolean, default: false },
            smtpHost: { type: String, default: '' },
            smtpPort: { type: Number, default: 587 },
            smtpSecure: { type: Boolean, default: false },
            smtpUser: { type: String, default: '' },
            smtpPassword: { type: String, default: '' },
            smtpFrom: { type: String, default: '' },
            aiEnabled: { type: Boolean, default: false },
            openaiApiKey: { type: String, default: '' },
            openaiModel: { type: String, default: 'gpt-4o' },
        },
        stats: {
            propertiesCount: { type: Number, default: 0 },
            unitsCount: { type: Number, default: 0 },
            tenantsCount: { type: Number, default: 0 },
            usersCount: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

const Organization = (models.Organization as Model<IOrganization>) || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
