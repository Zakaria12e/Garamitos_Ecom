# Garamitos E-Commerce

A full-stack e-commerce platform with a React storefront and a Node.js REST API backed by MongoDB.

## Tech Stack

| | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, MongoDB, JWT |
| **Deploy** | Vercel |

## Getting Started

**Frontend**
```bash
cd frontend && npm install && npm run dev
```

**Backend**
```bash
cd backend && npm install && npm run dev
```

**Frontend** requires a `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

**Backend** requires a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## License

MIT
