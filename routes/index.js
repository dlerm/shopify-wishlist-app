import express from 'express';
import wishlist from './wishlist/index.js';

const { Router } = express;
const router = Router();

router
  .get('/', (req, res) => res.status(403).json({ authorized: false }))
  .use('/wishlist', wishlist);

export default router;