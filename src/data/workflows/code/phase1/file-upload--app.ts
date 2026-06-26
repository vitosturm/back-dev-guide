export const code = `// File upload route — from WBS SE-6 live session
import express from 'express'
import { upload } from './upload/cloudinary'

const app = express()

// POST /upload — accepts multipart/form-data with an 'image' field
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

  res.json({
    message:  'Upload successful',
    url:      req.file.path,      // Cloudinary CDN URL
    publicId: req.file.filename,  // Cloudinary public_id
  })
})

app.listen(3000, () => console.log('Server running at http://localhost:3000'))
`
