export const code = `// A self-descriptive REST response
// — the client discovers next actions from the links (HATEOAS)
{
  "id": 123,
  "title": "RESTful APIs and Their Anatomy",
  "author": {
    "id": 456,
    "name": "Jane Smith"
  },
  "links": [
    { "rel": "self",     "href": "/posts/123" },
    { "rel": "author",   "href": "/authors/456" },
    { "rel": "comments", "href": "/posts/123/comments" }
  ]
}

// Stateless — every request carries all context it needs:
// GET /orders/567
// Authorization: Bearer <token>   ← re-sent every time, server stores no session
`
