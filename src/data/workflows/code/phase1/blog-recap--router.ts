export const code = `import { upload, validateBodyZod } from '#middlewares';
import { blogPostInputSchema } from '#schemas';
import { Router } from 'express';
import {
  createPost, deletePost,
  getAllPosts, getPostById, updatePost,
} from '#controllers';

const blogPostRouter = Router();

blogPostRouter.get('/',    getAllPosts);
blogPostRouter.get('/:id', getPostById);

// upload.single → validateBodyZod → controller
// each middleware runs in order; if one fails, the rest are skipped
blogPostRouter.post(
  '/',
  upload.single('image'),              // parse multipart/form-data, upload to Cloudinary
  validateBodyZod(blogPostInputSchema), // validate JSON fields with Zod
  createPost,
);

blogPostRouter.put(
  '/:id',
  upload.single('image'),
  validateBodyZod(blogPostInputSchema),
  updatePost,
);

blogPostRouter.delete('/:id', deletePost);

export default blogPostRouter;
`
