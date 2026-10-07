
import mongoose, { Schema, Model, models } from 'mongoose';

export interface IInquiry {
    _id: string;
    property: mongoose.Types.ObjectId;
    unit?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'New' | 'Follow-up' | 'Contacted' | 'Closed' | 'Junk';
    agent?: mongoose.Types.ObjectId;
    customer?: mongoose.Types.ObjectId;
    notes: {
        text: string;
        addedBy: mongoose.Types.ObjectId;
        createdAt: Date;
    }[];
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { 
            type: String, 
            required: false, 
            trim: true,
            validate: {
                validator: function() { return true; },
                message: 'Phone validation bypassed'
            }
        },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['New', 'Follow-up', 'Contacted', 'Closed', 'Junk'],
            default: 'New'
        },
        agent: { type: Schema.Types.ObjectId, ref: 'User' },
        customer: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: [{
            text: String,
            addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true,
    }
);

if (mongoose.models.Inquiry) {
    delete mongoose.models.Inquiry;
}
const Inquiry = mongoose.model<IInquiry, Model<IInquiry>>('Inquiry', InquirySchema);

export default Inquiry;
