/* Developed by RUDRA via NEKLLM */

import mongoose, { Schema, Model, models } from 'mongoose';

export interface IPermission {
    view: 'all' | 'own' | 'none';
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface IRole {
    _id: string;
    name: string;
    description?: string;
    organization?: mongoose.Types.ObjectId;
    permissions: {
        dashboard: { view: boolean };
        properties: IPermission;
        bookings: IPermission;
        inquiries: IPermission;
        maintenance: IPermission;
        payroll: IPermission;
        rent: IPermission;
        contracts: IPermission;
        propertyAssistant: { view: boolean };
        agents: IPermission;
        owners: IPermission;
        customers: IPermission;
        expenses: IPermission;
        payments: IPermission;
        dueCollection: IPermission;
        staff: IPermission;
        users: IPermission;
        roles: IPermission;
        cms: IPermission;
        aiReports: { view: boolean };
        settings: { view: boolean; edit: boolean };
        financialReports: IPermission;
        units: IPermission;
        [key: string]: any;
    };
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            trim: true,
        },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isSystem: {
            type: Boolean,
            default: false,
        },
        permissions: {
            type: Schema.Types.Mixed,
            default: {
                dashboard: { view: true },
                properties: { view: 'none', create: false, edit: false, delete: false },
                bookings: { view: 'none', create: false, edit: false, delete: false },
                inquiries: { view: 'none', create: false, edit: false, delete: false },
                maintenance: { view: 'none', create: false, edit: false, delete: false },
                payroll: { view: 'none', create: false, edit: false, delete: false },
                rent: { view: 'none', create: false, edit: false, delete: false },
                contracts: { view: 'none', create: false, edit: false, delete: false },
                propertyAssistant: { view: false },
                agents: { view: 'none', create: false, edit: false, delete: false },
                owners: { view: 'none', create: false, edit: false, delete: false },
                customers: { view: 'none', create: false, edit: false, delete: false },
                expenses: { view: 'none', create: false, edit: false, delete: false },
                payments: { view: 'none', create: false, edit: false, delete: false },
                dueCollection: { view: 'none', create: false, edit: false, delete: false },
                staff: { view: 'none', create: false, edit: false, delete: false },
                users: { view: 'none', create: false, edit: false, delete: false },
                roles: { view: 'none', create: false, edit: false, delete: false },
                cms: { view: 'none', create: false, edit: false, delete: false },
                aiReports: { view: false },
                settings: { view: false, edit: false },
                financialReports: { view: 'none', create: false, edit: false, delete: false },
                units: { view: 'none', create: false, edit: false, delete: false }
            }
        }
    },
    {
        timestamps: true,
    }
);

const Role = (models.Role as Model<IRole>) || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
