/* Developed by RUDRA via NEKLLM */
import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface IReview extends Document {
    author: string;
    role: string;
    company?: string;
    units?: string;
    content: string;
    rating: number; // 1-5
    avatarUrl?: string;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        author: {
            type: String,
            required: [true, 'Author name is required'],
            trim: true,
        },
        role: {
            type: String,
            required: [true, 'Role or designation is required'],
            trim: true,
        },
        company: {
            type: String,
            default: '',
            trim: true,
        },
        units: {
            type: String,
            default: '',
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Review content/quote is required'],
            trim: true,
        },
        rating: {
            type: Number,
            default: 5,
            min: 1,
            max: 5,
        },
        avatarUrl: {
            type: String,
            default: '',
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
        isFeatured: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

ReviewSchema.index({ order: 1, createdAt: -1 });

const Review = (models.Review as Model<IReview>) || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
