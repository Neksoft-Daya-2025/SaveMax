
import mongoose, { Schema, Model, models } from 'mongoose';

export interface IBlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnail?: string;
    author: mongoose.Types.ObjectId;
    category: string;
    tags: string[];
    status: 'Draft' | 'Published' | 'Archived';
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    isFeatured: boolean;
    organization?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true },
        organization: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        content: { type: String, required: true },
        excerpt: { type: String },
        thumbnail: { type: String },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: String, required: true },
        tags: [{ type: String }],
        status: {
            type: String,
            enum: ['Draft', 'Published', 'Archived'],
            default: 'Draft'
        },
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            keywords: [{ type: String }]
        },
        isFeatured: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug could be added here, but we'll handle it in the API for now.

const BlogPost = (models.BlogPost as Model<IBlogPost>) || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
