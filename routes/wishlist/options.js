import express from 'express';
import { setHeaders } from './handlers.js';

const { Router } = express;
const router = Router();

router.options('*', (req, res, next) => {
  setHeaders(res);
  res.sendStatus(200);
});

export default router;