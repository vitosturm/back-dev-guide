export const code = `import { model, Schema } from 'mongoose';

const blogPostSchema = new Schema(
  {
    title:            { type: String, required: true },
    content:          { type: String, required: true },
    author:           { type: String, required: true }, // plain string, not an ObjectId ref
    image_url:        { type: String },                 // Cloudinary CDN URL
    image_public_id:  { type: String },                 // Cloudinary public ID (needed to delete)
  },
  { timestamps: true },
);

const BlogPost = model('Blogpost', blogPostSchema);
export { BlogPost };
`
