import ApplicationError from '../../errors/ApplicationError.js';

const {
  METAFIELD_NAMESPACE = 'shopify_wishlist_app',
  METAFIELD_KEY = 'wishlist',
} = process.env;

export const setHeaders = (res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.set('Content-Type', 'application/json');
};

export const validateRequestOrigin = (req) => {
  const { ALLOWED_ORIGINS = '', NODE_ENV = '' } = process.env;
  const { origin = false } = req.headers;
  const isLocal = NODE_ENV === 'development';
  const isAllowedOrigin = !!origin && ALLOWED_ORIGINS.includes(origin);

  if (isAllowedOrigin && !isLocal) throw new ApplicationError('Unauthorized request origin', 401, 'AuthorizationError');
};

export const getRequestParameters = (req, required = []) => {
  if (!required.length) return null;

  const parameters = {};
  const missing = [];

  required.forEach((requiredParameterName, index) => {
    const parameter = req.params[requiredParameterName];
    if (!parameter) missing.push(requiredParameterName);
    parameters[requiredParameterName] = parameter;
  });

  if (missing.length)
    throw new ApplicationError(`Cannot complete the request. Missing request parameters: ${missing.join(', ')}`, 400, 'AuthorizationError');
  
  return parameters;
};

export const getRequestBodyParameters = (req, required = []) => {
  if (!required.length) return null;

  const parameters = {};
  const missing = [];

  required.forEach((requiredParameterName, index) => {
    const parameter = req.body[requiredParameterName];
    if (!parameter) missing.push(requiredParameterName);
    parameters[requiredParameterName] = parameter;
  });

  if (missing.length)
    throw new ApplicationError(`Cannot complete the request. Missing request body parameters: ${missing.join(', ')}`, 400, 'AuthorizationError');
  
  return parameters;
};

export const getEnvironmentVariables = () => {
  const { API_KEY = false , API_PASSWORD = false, SHOPIFY_DOMAIN = false } = process.env;
  const missing = [];
  if (!API_KEY) missing.push('API_KEY');
  if (!API_PASSWORD) missing.push('API_PASSWORD');
  if (!SHOPIFY_DOMAIN) missing.push('SHOPIFY_DOMAIN');

  if (missing.length)
    throw new ApplicationError(`Cannot initialize Shopify API Library. Missing values for: ${missing.join(', ')}`, 401, 'AuthorizationError');

  return  { API_KEY, API_PASSWORD, SHOPIFY_DOMAIN };
};

export const getShopifyConfig = ({ API_KEY: apiKey , API_PASSWORD: password, SHOPIFY_DOMAIN: shopName }) => ({
  shopName,
  apiKey,
  password,
});

export const generateMetafieldsQueryPackage = (ownerId) => ({
  metafield: {
    owner_resource: 'customer',
    owner_id: ownerId,
    namespace: METAFIELD_NAMESPACE,
    key: METAFIELD_KEY,
  },
});

export const generateNewMetafieldPackage = (customerId, productHandle) => ({
  type: 'create',
  customer: {
    id: customerId,
  },
  body: {
    metafields: [
      {
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEY,
        value_type: 'string',
        value: productHandle,
      },
    ],
  },
});

export const generateMetafieldUpdatePackage = (metafields, productHandle) => {
  const [ metafield ] = metafields;
  const  { id, value } = metafield;

  let wishlist = value.split(',');
  const itemIndex = wishlist.indexOf(productHandle);
  const removeItem = itemIndex !== -1;

  if (removeItem) wishlist.splice(itemIndex, 1);
  else wishlist.push(productHandle);

  // Delete
  if (!wishlist.length)
    return {
      type: 'delete',
      metafield: {
        id,
      },
    };
  
  // Update
  wishlist = wishlist.join(',');
  return {
    type: 'update',
    metafield: {
      id,
    },
    body: {
      id,
      value_type: 'string',
      value: wishlist,
    },
  }; 
};

export const generateMetafieldDeletePackage = (metafield = []) => {
  if (!metafield.length) return null;

  return {
    delete: true,
    metafield: {
      id: metafield[0].id,
    },
  };
};

export const generateMetafieldPackage = (metafields = [], customerId, productHandle) => {
  if (metafields.length) return generateMetafieldUpdatePackage(metafields, productHandle);
  return generateNewMetafieldPackage(customerId, productHandle);
};

export const catchShopifyAPIError = (error) => {
  const { statusCode, statusMessage } = error;
  throw new ApplicationError(statusMessage, statusCode, error.name, {
    source: 'ShopifyAPI',
    ...error,
  });
};

export const customerPackage = {
  fields: 'id',
};

export const statusSuccess = {
  message: 'OK',
  code: 200,
};

export default {
  setHeaders,
  validateRequestOrigin,
  getShopifyConfig,
  generateMetafieldsQueryPackage,
  generateNewMetafieldPackage,
  generateMetafieldUpdatePackage,
  generateMetafieldDeletePackage,
  generateMetafieldPackage,
};
