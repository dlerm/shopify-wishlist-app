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

router.deleteAsync('/:id?', async (req, res, next) => {
  setHeaders(res);

  validateRequestOrigin(req);

  const { id } = getRequestParameters(req, ['id']);

  const env = getEnvironmentVariables();

  const config = getShopifyConfig(env);

  const shopify = new Shopify(config);

  const metafieldWishlistQuery = generateMetafieldsQueryPackage(id);

  const metafields = await shopify.metafield
    .list(metafieldWishlistQuery)
    .catch(catchShopifyAPIError);

  const [field = null] = metafields;

  const metafield = field
    ? await shopify.metafield
      .delete(field.id)
      .catch(catchShopifyAPIError)
    : null;

  res.json({
    metafield,
    status,
  });
});

export default router;
