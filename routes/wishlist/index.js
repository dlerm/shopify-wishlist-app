
import express from 'express';
import _get from './get.js';
import _post from './post.js';
import _delete from './delete.js';
import _options from './options.js';

const { Router } = express;
const router = Router();

router
  .get('/:id?', _get)
  .post('/:id?', _post)
  .delete('/:id?', _delete)
  .options('*', _options);

export default router;