declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'consumer' | 'producer' | 'admin';
      };
    }
  }
}

export {};