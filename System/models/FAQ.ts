import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface IFAQ extends Document {
    question: string;
    answer: string;
    category?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
    {
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
        },
        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true,
        },
        category: {
            type: String,
            default: 'General',
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

FAQSchema.index({ order: 1, createdAt: -1 });

const FAQ = (models.FAQ as Model<IFAQ>) || mongoose.model<IFAQ>('FAQ', FAQSchema);

export default FAQ;
