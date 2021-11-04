import express from '@awaitjs/express';
import Shopify from 'shopify-api-node';

import {
  setHeaders,
  validateRequestOrigin,
  getRequestParameters,
  getEnvironmentVariables,
  getShopifyConfig,
  generateMetafieldsQueryPackage,
  statusSuccess as status,
  catchShopifyAPIError,
} from './handlers.js';

const { Router } = express;
const router = Router();

router.getAsync('/:id?', async (req, res, next) => {
  setHeaders(res);

  validateRequestOrigin(req);

  const { id } = getRequestParameters(req, ['id']);

  const { format } = req.query;

  const env = getEnvironmentVariables();

  const config = getShopifyConfig(env);

  const shopify = new Shopify(config);

  const payload = generateMetafieldsQueryPackage(id);

  const metafields = await shopify.metafield
    .list(payload)
    .catch(catchShopifyAPIError);

  const [ metafield = {} ] = metafields;

  const { value = false } = metafield;

  const wishlist = !!value
    ? format === 'product'
      ? await shopify.product
        .list({ handle: value })
        .catch(catchShopifyAPIError)
      : value.split(',')
    : [];

  res.json({
    id,
    wishlist,
    metafield,
    status,
  });
});

export default router;
