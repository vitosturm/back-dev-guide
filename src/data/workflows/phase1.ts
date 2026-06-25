import type { WorkflowTree } from './types'

export const nodeTsSetupWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Entry point. package.json's \"imports\" field maps the #utils alias to ./src/utils/index.ts — Node's native subpath imports, no bundler needed. tsx runs this file directly without a separate compile step.",
    code: `// TypeScript in Node.js — from WBS SE-6 live session
// Uses #utils alias defined in package.json "imports" field
import { pickRandom } from '#utils'

console.log(pickRandom([1, 2, 3, 4, 5]))
console.log(pickRandom(['apple', 'banana', 'cherry']))
console.log(pickRandom([true, false, true]))
console.log(pickRandom(['red', 'green', 'blue', 'yellow']))
`,
    children: [
      {
        id: 'utils-index',
        kind: 'file',
        filePath: 'src/utils/index.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'A generic function: pickRandom<T> works on an array of any type and returns an element of that same type (or undefined for an empty array) — the relationship between input and output type is enforced by the generic, not hardcoded to one type.',
        code: `// Generic utility — T[] → random element or undefined
export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  const index: number = Math.floor(Math.random() * arr.length)
  return arr[index]
}
`,
      },
    ],
  },
]

export const nodeHttpWorkflow: WorkflowTree = [
  {
    id: 'server',
    kind: 'file',
    filePath: 'src/server.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      'Raw Node.js http.createServer with no framework. The single requestHandler reads req.method and req.url manually to route between /posts and /posts/:id, and createResponse centralizes setting the JSON content-type header and ending the response — this is exactly the boilerplate Express (next topic) eliminates.',
    code: `// Raw Node.js HTTP Server — from WBS SE-6 live session
import http, { type RequestListener } from 'node:http'

const createResponse = (
  res: http.ServerResponse,
  statusCode: number,
  message: unknown,
) => {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  return res.end(
    typeof message === 'string'
      ? JSON.stringify({ message })
      : JSON.stringify(message),
  )
}

// /posts → GET + POST
// /posts/:id → GET, PUT, DELETE
const requestHandler: RequestListener = (req, res) => {
  const { method, url } = req

  if (url === '/posts') {
    if (method === 'GET') return createResponse(res, 200, 'GET /posts')
    if (method === 'POST') return createResponse(res, 201, 'POST /posts')
    return createResponse(res, 405, 'Method not allowed')
  }

  if (url?.startsWith('/posts/')) {
    if (method === 'GET') return createResponse(res, 200, \`GET \${url}\`)
    if (method === 'PUT') return createResponse(res, 200, \`PUT \${url}\`)
    if (method === 'DELETE') return createResponse(res, 200, \`DELETE \${url}\`)
    return createResponse(res, 405, 'Method not allowed')
  }

  return createResponse(res, 404, 'Not found')
}

const port = 3000
const server = http.createServer(requestHandler)
server.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`))
`,
  },
]

export const expressIntroWorkflow: WorkflowTree = [
  {
    id: 'app',
    kind: 'file',
    filePath: 'src/app.ts',
    icon: 'typescript',
    language: 'typescript',
    explanation:
      "Express app: app.get registers a handler for one route, app.all handles every HTTP method on /test and branches on req.method manually. req.params.id arrives as a string even though the data's id field is a number — Number(id) bridges that.",
    code: `// Express Basics — from WBS SE-6 live session
import { products } from '#data'
import express from 'express'

const app = express()
const port = 3000

// GET all products
app.get('/products', (req, res) => res.json(products))

// GET single product by id
app.get('/products/:id', (req, res) => {
  const { id } = req.params
  const product = products.find((p) => p.id === Number(id))
  if (!product)
    return res.status(404).json({ message: \`Product \${id} not found\` })
  res.json(product)
})

// Multi-method handler
app.all('/test', (req, res) => {
  const { method } = req
  if (method === 'GET') return res.json({ message: 'GET /test' })
  if (method === 'POST') return res.status(201).json({ message: 'POST /test' })
  return res.status(405).json({ message: 'Method not allowed' })
})

app.listen(port, () =>
  console.log(\`Server running at http://localhost:\${port}\`),
)
`,
    children: [
      {
        id: 'data-index',
        kind: 'file',
        filePath: 'src/data/index.ts',
        icon: 'typescript',
        language: 'typescript',
        explanation:
          'Static in-memory data the routes serve — no database yet (that arrives in the next phase with Mongoose/MongoDB).',
        code: `// Sample product data (truncated — full list in SE-6/Frontend)
export const products = [
  {
    id: 1,
    title: 'Fjallraven Backpack',
    price: 109.95,
    category: "men's clothing",
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 2,
    title: 'Mens Casual Slim Fit T-Shirts',
    price: 22.3,
    category: "men's clothing",
    rating: { rate: 4.1, count: 259 },
  },
  {
    id: 3,
    title: 'Mens Cotton Jacket',
    price: 55.99,
    category: "men's clothing",
    rating: { rate: 4.7, count: 500 },
  },
]
`,
      },
    ],
  },
]
