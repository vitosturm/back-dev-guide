export const code = `// REST route conventions — resource: /users
//
// GET    /users          → list all users
// POST   /users          → create a user
// GET    /users/:id      → get one user
// PUT    /users/:id      → replace entire user
// PATCH  /users/:id      → partial update
// DELETE /users/:id      → remove a user

// Nested resource — posts that belong to a user
// GET  /users/:userId/posts      → all posts by user
// POST /users/:userId/posts      → create post for that user

// Status codes that go with each action
// 200 OK         → successful GET, PUT, PATCH
// 201 Created    → successful POST (return the new resource)
// 204 No Content → successful DELETE (body is empty)
// 404 Not Found  → resource does not exist
// 400 Bad Request → invalid input from client
`
