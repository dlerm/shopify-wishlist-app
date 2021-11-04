
# Shopify Wishlist App

A Shopify Wishlist App that can be used seamlessly with the [Shopify Wishlist](https://github.com/dlerm/shopify-wishlist) theme files.

### Overview
This is a back-end solution meant for usage as a Shopify private app. The app saves customer wishlists into metafields to avoid the need for an external data store.

### How It Works
The app creates & updates a customer metafield that stores a string list of product handles (comma separated).

|Metafield | Value |
|----------|-------|
|customer.metafields.shopify_wishlist_app.wishlist|"product-handle-1,product-handle2,..."

The front-end can make requests to the app's endpoints to fetch, create, update or delete a wishlist. The primary information needed to make the requests is a unique Shopify customer ID. Each request type may have extra data needed to fulfill the request, see below.

### How To Use

All endpoints require a single `:id` parameter in the URL which should represent a unique Shopify customer ID.

##### GET `/wishlist/:id`
---
**Query Parameters**
|Name|Required|Description|
|----:|:----:|----|
|format|optional|The format of the wishlist items to be returned. <br/><br/> Supported value: `product` <br/><br/> By default the wishlist will be returned as an `Array<string>` representing the product handles. Supplying the value `product` will return the wishlist as an `Array<object>` representing the full Shopify product JSON. |

**Response (Default)**
```
{
    "id": <customer-id>,
    "wishlist": [
        "<product-handle>",
        "<product-handle>",
        ...
    ],
    "metafield": {
        "id": <metafield-id>,
        "namespace": "shopify_wishlist_app",
        "key": "wishlist",
        "value": "<product-handle>,<product-handle>,...",
        "value_type": "string",
        "description": null,
        "owner_id": <customer-id>,
        "created_at": <date>,
        "updated_at": <date>
        "owner_resource": "customer",
        "admin_graphql_api_id": "gid://shopify/Metafield/<metafield-id>"
    },
    "status": {
        "message": "OK",
        "code": 200
    }
}
```
**Response (Format: `product`)**

[Only displaying the `wishlist` response key for brevity]
```
{
    "wishlist": [
        { <shopify-product-JSON> },
        { <shopify-product-JSON> },
        ...
    ],
    ...
}
```

##### POST `/wishlist/:id`
---
**Body Parameters**
|Name|Required|Description|
|----:|:----:|----|
|handle|required|The Shopify product handle that should be added/removed from the wishlist. <br/><br/> This endpoint acts as a toggle. If the requested handle does not currently exist in the wishlist, add it, otherwise remove it.|

**Response**
```
{
    "metafield": {
        "namespace": "shopify_wishlist_app",
        "key": "wishlist",
        "value_type": "string",
        "value": "<new-product-handle>,<product-handle>,..."
    },
    "status": {
        "message": "OK",
        "code": 200
    }
}
```
##### DELETE `/wishlist/:id`
---
**Parameters** - None

**Response**
```
{
    "metafield": {},
    "status": {
        "message": "OK",
        "code": 200
    }
}
```
