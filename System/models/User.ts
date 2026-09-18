/* Developed by RUDRA via NEKLLM */

import mongoose, { Schema, Model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    _id: string;
    name?: string;
    email: string;
    password: string;
    phone?: string;
    profileImage?: string;
    role?: mongoose.Types.ObjectId;
    isSuperAdmin?: boolean;
    organization?: mongoose.Types.ObjectId;
    status: 'Active' | 'Inactive' | 'Pending';
    emailVerified: boolean;

    // Agent Specific
    agentDetails?: {
        commissionType: 'percentage' | 'fixed';
        commissionValue: number;
        specialization: string[];
        experience: number;
    };

    // Owner Specific
    ownerDetails?: {
        companyName?: string;
        taxId?: string;
    };

    // Customer Specific
    customerDetails?: {
        address?: string;
        notes?: string;
        totalPurchases?: number;
        assignedAgents?: mongoose.Types.ObjectId[];
    };

    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            // Email is optional for some user types (e.g. agents created without login access),
            // so we deliberately do not enforce required/format validation here.
        },
        password: {
            type: String,
            required: false,
            // Remove minlength validation so agents/users can be created without
            // hitting Mongoose validation errors for short or empty passwords.
            select: false,
        },
        phone: { type: String, trim: true },
        profileImage: { type: String },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
        },
        isSuperAdmin: {
            type: Boolean,
            default: false,
            index: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Pending'],
            default: 'Active'
        },
        emailVerified: { type: Boolean, default: false },

        agentDetails: {
            commissionType: { type: String, enum: ['percentage', 'fixed'] },
            commissionValue: { type: Number },
            specialization: [String],
            experience: { type: Number }
        },

        ownerDetails: {
            companyName: { type: String },
            taxId: { type: String }
        },

        customerDetails: {
            address: { type: String },
            notes: { type: String },
            totalPurchases: { type: Number },
            assignedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (this: any) {
    if (!this.isModified('password') || !this.password) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
    this: any,
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// In Next.js, models are often cached. This can cause issues in development if the schema changes.
// We check if the model exists and only create it if it doesn't.
const User = (models.User as UserModel) || mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
