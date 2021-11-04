import express from '@awaitjs/express';
import Shopify from 'shopify-api-node';
import {
  setHeaders,
  validateRequestOrigin,
  getRequestParameters,
  getRequestBodyParameters,
  getEnvironmentVariables,
  getShopifyConfig,
  generateMetafieldsQueryPackage,
  generateMetafieldPackage,
  statusSuccess as status,
  catchShopifyAPIError,
} from './handlers.js';

const { Router } = express;
const router = Router();

router.postAsync('/:id?', async (req, res, next) => {
  setHeaders(res);

  validateRequestOrigin(req);

  const { id } = getRequestParameters(req, ['id']);

  const { handle } = getRequestBodyParameters(req, ['handle']);

  const env = getEnvironmentVariables();

  const config = getShopifyConfig(env);

  const shopify = new Shopify(config);

  const metafieldWishlistQuery = generateMetafieldsQueryPackage(id);

  const metafields = await shopify.metafield
    .list(metafieldWishlistQuery)
    .catch(catchShopifyAPIError);

  const payload = generateMetafieldPackage(metafields, id, handle);

  let metafield = {};

  switch(payload.type) {
    case 'create':
      metafield = await shopify.customer
        .update(payload.customer.id, payload.body)
        .then(() => payload.body.metafields[0])
        .catch(catchShopifyAPIError);
      break;
    case 'update':
      metafield = await shopify.metafield
        .update(payload.metafield.id, payload.body)
        .catch(catchShopifyAPIError);
      break;
    case 'delete':
      metafield = await shopify.metafield
        .delete(payload.metafield.id)
        .catch(catchShopifyAPIError);
      break;
    default: break;
  };

  res.json({
    metafield,
    status,
  });
});

export default router;
