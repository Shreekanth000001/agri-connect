# 📜 API Contracts — FastAPI Backend

This document defines the complete REST API contract for the new FastAPI backend. It serves as the specification that both the FastAPI backend and Next.js frontend teams build against.

## General Information

### Common Headers
- `Authorization`: `Bearer <token>` (for authenticated endpoints)
- `Content-Type`: `application/json` (unless specified otherwise)

### Pagination Format
When an endpoint returns paginated results, the response follows this standard format:
```json
{
  "items": [], // Array of items of type T
  "total": 0,  // Total number of items
  "page": 1,   // Current page number
  "pages": 1   // Total number of pages
}
```

### Error Format
Errors return a standard JSON object containing a `detail` string, along with the appropriate HTTP status code.
```json
{
  "detail": "Error message description",
  "status_code": 400
}
```

### Versioning
All routes are prefixed with `/api/v1/`.

---

## 1. Authentication (`/api/v1/auth`)

### POST `/api/v1/auth/register`
- **Auth Requirement**: Public
- **Notes**: Registers a new user with either a FARMER or BUYER role.

**Request Body**
| Field | Type | Description |
| --- | --- | --- |
| `uname` | string | Full name |
| `uemail` | string | Email address |
| `password` | string | Password |
| `uphone` | string | Phone number |
| `ugeo` | string | Physical address |
| `uloc` | string | GPS coordinates |
| `role` | string | `'FARMER'` or `'BUYER'` |

**Response Codes**
- **201 Created**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": {
      "uid": "integer",
      "uname": "string",
      "uemail": "string",
      "role": "string"
    }
  }
  ```
- **409 Conflict**: `{ "detail": "Email already registered" }`
- **422 Unprocessable Entity**: Validation error

### POST `/api/v1/auth/login`
- **Auth Requirement**: Public
- **Notes**: Authenticates a user and returns a JWT token.

**Request Body**
| Field | Type | Description |
| --- | --- | --- |
| `uemail` | string | User's email |
| `password` | string | User's password |

**Response Codes**
- **200 OK**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": {
      "uid": "integer",
      "uname": "string",
      "role": "string"
    }
  }
  ```
- **401 Unauthorized**: `{ "detail": "Invalid credentials" }`

### GET `/api/v1/auth/me`
- **Auth Requirement**: Authenticated
- **Notes**: Retrieves the current logged-in user's profile.

**Response Codes**
- **200 OK**:
  ```json
  {
    "uid": "integer",
    "uname": "string",
    "uemail": "string",
    "uphone": "string",
    "ugeo": "string",
    "uloc": "string",
    "role": "string",
    "ujoinedAt": "string (ISO 8601 datetime)"
  }
  ```
- **401 Unauthorized**: `{ "detail": "Not authenticated" }`

---

## 2. Auctions (`/api/v1/auctions`)

### GET `/api/v1/auctions`
- **Auth Requirement**: Public
- **Notes**: Lists paginated product auctions.

**Query Parameters**
| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `category` | string | optional | Filter by category |
| `status` | string | `'OPEN'` | Filter by status |
| `sort_by` | string | `'date'` | `'price'`, `'date'`, or `'ending_soon'` |

**Response Codes**
- **200 OK**: Returns paginated `AuctionSummary` format.
  ```json
  {
    "items": [
      {
        "ProdAucId": "integer",
        "title": "string",
        "startingBid": "float",
        "category": "string",
        "auctionStatus": "string",
        "thumbnail": "string (first imageUrl)",
        "startTime": "string (ISO 8601)",
        "endTime": "string (ISO 8601)",
        "farmer": {
          "uid": "integer",
          "uname": "string",
          "uloc": "string"
        }
      }
    ],
    "total": "integer",
    "page": "integer",
    "pages": "integer"
  }
  ```

### GET `/api/v1/auctions/{id}`
- **Auth Requirement**: Public
- **Notes**: Retrieves full details of a specific auction.

**Response Codes**
- **200 OK**:
  ```json
  {
    "ProdAucId": "integer",
    "title": "string",
    "description": "string",
    "startingBid": "float",
    "category": "string",
    "auctionStatus": "string",
    "imageUrl": ["string"],
    "startTime": "string",
    "endTime": "string",
    "CreatedAt": "string",
    "farmer": {
      "uid": "integer",
      "uname": "string",
      "ugeo": "string",
      "uloc": "string"
    },
    "bids": ["BidSummary array"],
    "bid_count": "integer",
    "highest_bid": "float | null"
  }
  ```
- **404 Not Found**: `{ "detail": "Auction not found" }`

### POST `/api/v1/auctions`
- **Auth Requirement**: Farmer-only
- **Notes**: Creates a new auction (max 5 images).

**Request Body**
| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Auction title |
| `description` | string | Detailed description |
| `startingBid` | float | Starting price |
| `startTime` | string (ISO) | Start time |
| `endTime` | string (ISO) | End time |
| `category` | string | Product category |
| `imageUrls` | string[] | Array of image URLs (max 5) |

**Response Codes**
- **201 Created**: Returns the created auction object (similar to AuctionDetail).
- **403 Forbidden**: `{ "detail": "Only farmers can create auctions" }`

### PATCH `/api/v1/auctions/{id}/cancel`
- **Auth Requirement**: Farmer-only (owner)
- **Notes**: Cancels an active auction.

**Response Codes**
- **200 OK**: Returns updated auction with `auctionStatus: 'CANCELLED'`.
- **403/404 Error**: `{ "detail": "Not authorized or Not found" }`

### GET `/api/v1/auctions/search`
- **Auth Requirement**: Public
- **Notes**: Searches for auctions based on a query.

**Query Parameters**
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `q` | string | Yes | Search query |
| `page` | integer | No | Page number |
| `limit` | integer | No | Items per page |

**Response Codes**
- **200 OK**: Returns the same paginated format as `GET /api/v1/auctions`.

---

## 3. Bids (`/api/v1/bids`)

### POST `/api/v1/auctions/{id}/bids`
- **Auth Requirement**: Buyer-only
- **Notes**: Places a bid on a specific auction. One bid per buyer per auction. Bid amount must be > starting bid.

**Request Body**
| Field | Type | Description |
| --- | --- | --- |
| `bidAmount` | float | Bid amount |
| `deliveryDate` | string (ISO) | Optional proposed delivery date |

**Response Codes**
- **201 Created**: Returns the created bid object.
- **400 Bad Request**: `{ "detail": "Bid must be higher than starting bid" }`
- **403 Forbidden**: `{ "detail": "Only buyers can place bids" }`
- **409 Conflict**: `{ "detail": "You have already bid on this auction" }`

### PATCH `/api/v1/bids/{id}/accept`
- **Auth Requirement**: Farmer-only (auction owner)
- **Notes**: Accepts a bid, rejects all other PENDING bids on the same auction, and closes the auction.

**Response Codes**
- **200 OK**:
  ```json
  {
    "bid": "accepted bid details",
    "auction_status": "CLOSED"
  }
  ```

### PATCH `/api/v1/bids/{id}/reject`
- **Auth Requirement**: Farmer-only (auction owner)
- **Notes**: Rejects a specific bid.

**Response Codes**
- **200 OK**: Returns the rejected bid object details.

---

## 4. Users (`/api/v1/users`)

### GET `/api/v1/users/me`
- **Auth Requirement**: Authenticated
- **Notes**: Alias for `/api/v1/auth/me`.

### PUT `/api/v1/users/me`
- **Auth Requirement**: Authenticated
- **Notes**: Updates the user profile.

**Request Body**
| Field | Type | Description |
| --- | --- | --- |
| `uphone` | string | Optional updated phone number |
| `ugeo` | string | Optional updated physical address |
| `uloc` | string | Optional updated GPS coordinates |

**Response Codes**
- **200 OK**: Returns the updated user profile.

---

## 5. Dashboard (`/api/v1/dashboard`)

### GET `/api/v1/dashboard/farmer`
- **Auth Requirement**: Farmer-only
- **Notes**: Retrieves stats and auctions for the farmer's dashboard.

**Response Codes**
- **200 OK**:
  ```json
  {
    "auctions": ["AuctionWithBids array"],
    "stats": {
      "total_auctions": "integer",
      "open_auctions": "integer",
      "total_bids_received": "integer",
      "accepted_bids": "integer"
    }
  }
  ```

### GET `/api/v1/dashboard/buyer`
- **Auth Requirement**: Buyer-only
- **Notes**: Retrieves stats and bids for the buyer's dashboard.

**Response Codes**
- **200 OK**:
  ```json
  {
    "bids": ["BidWithAuction array"],
    "stats": {
      "total_bids": "integer",
      "pending": "integer",
      "accepted": "integer",
      "rejected": "integer"
    }
  }
  ```

---

## 6. Contact (`/api/v1/contact`)

### POST `/api/v1/contact`
- **Auth Requirement**: Public
- **Notes**: Submits a contact message.

**Request Body**
| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Sender's name |
| `email` | string | Sender's email |
| `message` | string | Message content |

**Response Codes**
- **201 Created**:
  ```json
  {
    "msgId": "integer",
    "message": "Message received"
  }
  ```

---

## 7. Upload (`/api/v1/upload`)

### POST `/api/v1/upload/image`
- **Auth Requirement**: Authenticated
- **Notes**: Uploads an image.

**Request format**: `multipart/form-data` with `file` field.

**Response Codes**
- **200 OK**:
  ```json
  {
    "url": "string (Cloudinary secure_url)",
    "public_id": "string"
  }
  ```
