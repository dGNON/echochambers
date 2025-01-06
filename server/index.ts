import { initializeStore } from "./store";
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import roomsRouter from './api/rooms';

const app = express();
const SERVER_PORT = 3001;

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://35.164.116.189:3000',
    'http://35.214.184.4:3001',
    'http://35.214.184.4:3000',
    'https://96d7033c8e14f47a-3000.us-ca-1.gpu-instance.novita.ai',
    'http://www.echochambers.art',
    'https://www.echochambers.art',
    'http://www.echochambers.ai',
    'https://www.echochambers.ai',
    'http://echochambers.dgnon.ai',
    'https://echochambers.dgnon.ai'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));

app.use(express.json());

// Mount the rooms router at /api/rooms
app.use('/api/rooms', roomsRouter);

// Add a catch-all route handler for debugging
app.use((req: Request, res: Response, _next: NextFunction) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

async function startServer() {
  try {
    await initializeStore();
    
    app.listen(SERVER_PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error); 