export const code = `// MongoDB Shell — products collection
use('mydb')

// Insert a single document
db.products.insertOne({
  name: 'T-Shirt',
  price: 19.99,
  stock: 50,
  tags: ['clothing', 'unisex'],
  created_at: new Date(),
})

// Insert many at once
db.products.insertMany([
  { name: 'Hoodie', price: 34.99, stock: 30, tags: ['clothing', 'winter'], created_at: new Date() },
  { name: 'Sneakers', price: 59.99, stock: 20, tags: ['shoes', 'sport'],   created_at: new Date() },
  { name: 'Cap',     price: 14.99, stock: 100, tags: ['accessory'],        created_at: new Date() },
])
`
