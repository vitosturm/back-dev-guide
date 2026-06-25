import type { FileSystemTree } from '@webcontainer/api'

// ── node-ts-setup ─────────────────────────────────────────────────────────────
// Demonstrates native TypeScript in Node.js with package.json #import aliases.
// Mirrors SE-6/Backend/19-MongoDB/01_Running_TS_in_NodeJS
export const nodeTsSetupFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'node-ts-setup',
          type: 'module',
          imports: {
            '#utils': './src/utils/index.ts',
          },
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
          },
          scripts: {
            dev: 'tsx watch src/app.ts',
            start: 'tsx src/app.ts',
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      'app.ts': {
        file: {
          contents: `// TypeScript in Node.js — from WBS SE-6 live session
// Uses #utils alias defined in package.json "imports" field
import { pickRandom } from '#utils'

console.log(pickRandom([1, 2, 3, 4, 5]))
console.log(pickRandom(['apple', 'banana', 'cherry']))
console.log(pickRandom([true, false, true]))
console.log(pickRandom(['red', 'green', 'blue', 'yellow']))
`,
        },
      },
      utils: {
        directory: {
          'index.ts': {
            file: {
              contents: `// Generic utility — T[] → random element or undefined
export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  const index: number = Math.floor(Math.random() * arr.length)
  return arr[index]
}
`,
            },
          },
        },
      },
    },
  },
}

// ── node-http ─────────────────────────────────────────────────────────────────
// Demonstrates raw Node.js HTTP server with method+URL routing.
// Mirrors SE-6/Backend/20-RESTful_APIs/01_Node_HTTP (the 3.ts final version)
export const nodeHttpFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'node-http',
          type: 'module',
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
          },
          scripts: {
            dev: 'tsx watch src/server.ts',
            start: 'tsx src/server.ts',
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      'server.ts': {
        file: {
          contents: `// Raw Node.js HTTP Server — from WBS SE-6 live session
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
      },
    },
  },
}

// ── express-intro ─────────────────────────────────────────────────────────────
// Demonstrates Express 5 with route handlers, URL params, and JSON responses.
// Mirrors SE-6/Backend/20-RESTful_APIs/03_Express_Intro
// Note: uses package.json "imports" field to alias #data → ./src/data/index.ts
export const expressIntroFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        {
          name: 'express-intro',
          type: 'module',
          imports: {
            '#data': './src/data/index.ts',
          },
          devDependencies: {
            tsx: '^4.19.0',
            typescript: '^5.8.0',
            '@types/node': '^22.0.0',
            '@types/express': '^5.0.6',
          },
          dependencies: { express: '^5.2.1' },
          scripts: {
            dev: 'tsx watch src/app.ts',
            start: 'tsx src/app.ts',
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      'app.ts': {
        file: {
          contents: `// Express Basics — from WBS SE-6 live session
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
        },
      },
      data: {
        directory: {
          'index.ts': {
            file: {
              contents: `// Sample product data (truncated — full list in SE-6/Frontend)
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
          },
        },
      },
    },
  },
}
