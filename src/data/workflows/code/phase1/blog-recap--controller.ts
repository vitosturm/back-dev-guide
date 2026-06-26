export const code = `import { BlogPost } from '#models';
import type { RequestHandler } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// GET /posts/:id
export const getPostById: RequestHandler = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    throw new Error('Post not found', { cause: { status: 404 } });
    //                                          ↑ error handler reads cause.status
  }

  res.json(post);
};

// POST /posts
export const createPost: RequestHandler = async (req, res) => {
  const { title, content, author } = req.body; // validated by validateBodyZod
  const image = req.file;                       // set by upload.single('image')

  const newPost = await BlogPost.create({
    title,
    content,
    author,
    image_url:        image?.path,      // Cloudinary CDN URL  (path ≠ local path here)
    image_public_id:  image?.filename,  // Cloudinary public ID for future deletion
  });

  res.status(201).json({ message: 'Post created', newPost });
};

// PUT /posts/:id
export const updatePost: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { title, content, author } = req.body;
  const image = req.file;

  const post = await BlogPost.findById(id);
  if (!post) throw new Error('Post not found', { cause: { status: 404 } });

  if (image) {
    if (post.image_public_id) {
      await cloudinary.uploader.destroy(post.image_public_id); // delete old image first
    }
    post.image_url        = image.path;
    post.image_public_id  = image.filename;
  }

  post.title   = title;
  post.content = content;
  post.author  = author;

  const updated = await post.save(); // save() triggers Mongoose validators
  res.json({ message: 'Post updated', updated });
};

// DELETE /posts/:id
export const deletePost: RequestHandler = async (req, res) => {
  const deleted = await BlogPost.findByIdAndDelete(req.params.id);
  if (!deleted) throw new Error('Post not found', { cause: { status: 404 } });

  if (deleted.image_public_id) {
    await cloudinary.uploader.destroy(deleted.image_public_id);
  }

  res.json({ message: \`Post \${req.params.id} deleted\` });
};
`
