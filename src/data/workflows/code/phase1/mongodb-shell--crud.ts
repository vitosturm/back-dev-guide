export const code = `// READ — query operators
db.products.find()                                   // all documents
db.products.find({ tags: 'clothing' })               // exact match in array
db.products.find({ price: { $gte: 10, $lte: 40 } }) // range with $gte / $lte

// UPDATE
db.products.updateOne(
  { name: 'T-Shirt' },          // filter
  { $set: { stock: 45 } }       // $set merges — only replaces the listed fields
)
db.products.updateMany(
  { tags: 'clothing' },
  { $addToSet: { tags: 'sale' } } // $addToSet appends only if not already present
)

// DELETE
db.products.deleteOne({ name: 'Cap' })
db.products.deleteMany({ stock: { $lte: 0 } }) // remove all out-of-stock
`
