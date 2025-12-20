# Service Requests API Documentation

## Overview
This document describes the Service Request API endpoints for the MIXA LAB platform. Service requests allow artists to request services from creators (mixing, mastering, or recording).

## Schema Reference

### ServiceRequest Model
```prisma
model ServiceRequest {
  id          String      @id @default(uuid())
  userId      String
  creatorId   String
  projectName String
  artistName  String
  projectType ProjectType
  tier        TierName
  services    ServiceType
  description String?
  status      RequestStatus        @default(PENDING)
  creatorStatus CreatorRequestStatus @default(PENDING)
  
  user    User                  @relation(fields: [userId], references: [id])
  creator CreatorProfile        @relation(fields: [creatorId], references: [id])
  files   File[]
  genres  ServiceRequestGenre[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Enums
- **ProjectType**: `SINGLE`, `EP`, `ALBUM`
- **TierName**: `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`
- **ServiceType**: `MIXING`, `MASTERING`, `RECORDING`
- **RequestStatus**: `PENDING`, `IN_REVIEW`, `IN_PROGRESS`, `DELIVERED`, `CANCELLED`
- **CreatorRequestStatus**: `PENDING`, `ACCEPTED`, `REJECTED`

---

## API Endpoints

### 1. Create Service Request
**POST** `/api/service-requests`

Creates a new service request from an artist to a creator.

#### Authentication
Required - User must be authenticated

#### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| creatorId | String | Yes | ID of the creator profile |
| projectName | String | Yes | Name of the project |
| artistName | String | Yes | Name of the artist |
| projectType | String | Yes | Type of project: `SINGLE`, `EP`, or `ALBUM` |
| tier | String | Yes | Service tier: `BRONZE`, `SILVER`, `GOLD`, or `PLATINUM` |
| services | String | Yes | Service type: `MIXING`, `MASTERING`, or `RECORDING` |
| description | String | No | Additional description or notes |
| genres | String (JSON) | No | JSON array of genre IDs, e.g., `["uuid1", "uuid2"]` |
| files | File(s) | No | Any number of files to attach to the request |

#### Response (201 Created)
```json
{
  "message": "Service request created successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "creatorId": "uuid",
    "projectName": "My New Single",
    "artistName": "Artist Name",
    "projectType": "SINGLE",
    "tier": "GOLD",
    "services": "MIXING",
    "description": "Need professional mixing",
    "status": "PENDING",
    "creatorStatus": "PENDING",
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com"
    },
    "creator": {
      "id": "uuid",
      "brandName": "Creator Brand",
      "user": {
        "id": "uuid",
        "name": "Creator Name",
        "email": "creator@example.com"
      }
    },
    "files": [...],
    "createdAt": "2025-12-19T22:00:00.000Z",
    "updatedAt": "2025-12-19T22:00:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized**: User not authenticated
- **400 Bad Request**: Missing required fields or invalid enum values
- **404 Not Found**: Creator not found
- **500 Internal Server Error**: Server error

---

### 2. Get Service Request by ID
**GET** `/api/service-requests/:id`

Retrieves a specific service request by ID.

#### Authentication
Required - User must be either the requester or the creator

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Service request ID |

#### Response (200 OK)
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "creatorId": "uuid",
    "projectName": "My New Single",
    "artistName": "Artist Name",
    "projectType": "SINGLE",
    "tier": "GOLD",
    "services": "MIXING",
    "description": "Need professional mixing",
    "status": "PENDING",
    "creatorStatus": "PENDING",
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "image": "url"
    },
    "creator": {
      "id": "uuid",
      "brandName": "Creator Brand",
      "country": "US",
      "user": {
        "id": "uuid",
        "name": "Creator Name",
        "email": "creator@example.com",
        "image": "url"
      }
    },
    "files": [...],
    "genres": [
      {
        "id": "uuid",
        "serviceRequestId": "uuid",
        "genreId": "uuid",
        "genre": {
          "id": "uuid",
          "name": "Hip Hop"
        }
      }
    ],
    "createdAt": "2025-12-19T22:00:00.000Z",
    "updatedAt": "2025-12-19T22:00:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User doesn't have access to this request
- **404 Not Found**: Service request not found
- **500 Internal Server Error**: Server error

---

### 3. Get Creator's Service Requests
**GET** `/api/creator/service-requests`

Retrieves all service requests for the authenticated creator with pagination and filtering.

#### Authentication
Required - User must be a creator

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number for pagination |
| limit | Number | 10 | Number of items per page |
| status | String | - | Filter by RequestStatus: `PENDING`, `IN_REVIEW`, `IN_PROGRESS`, `DELIVERED`, `CANCELLED` |
| creatorStatus | String | - | Filter by CreatorRequestStatus: `PENDING`, `ACCEPTED`, `REJECTED` |
| projectType | String | - | Filter by ProjectType: `SINGLE`, `EP`, `ALBUM` |
| services | String | - | Filter by ServiceType: `MIXING`, `MASTERING`, `RECORDING` |

#### Response (200 OK)
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "creatorId": "uuid",
      "projectName": "My New Single",
      "artistName": "Artist Name",
      "projectType": "SINGLE",
      "tier": "GOLD",
      "services": "MIXING",
      "description": "Need professional mixing",
      "status": "PENDING",
      "creatorStatus": "PENDING",
      "user": {
        "id": "uuid",
        "name": "User Name",
        "email": "user@example.com",
        "image": "url"
      },
      "files": [...],
      "genres": [...],
      "createdAt": "2025-12-19T22:00:00.000Z",
      "updatedAt": "2025-12-19T22:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Error Responses
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User is not a creator
- **500 Internal Server Error**: Server error

---

### 4. Accept Service Request
**PATCH** `/api/service-requests/:id/accept`

Allows a creator to accept a service request assigned to them.

#### Authentication
Required - User must be a creator and the request must be assigned to them

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Service request ID |

#### Response (200 OK)
```json
{
  "message": "Service request accepted successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "creatorId": "uuid",
    "projectName": "My New Single",
    "artistName": "Artist Name",
    "projectType": "SINGLE",
    "tier": "GOLD",
    "services": "MIXING",
    "description": "Need professional mixing",
    "status": "IN_REVIEW",
    "creatorStatus": "ACCEPTED",
    "user": {...},
    "creator": {...},
    "files": [...],
    "genres": [...],
    "createdAt": "2025-12-19T22:00:00.000Z",
    "updatedAt": "2025-12-19T22:05:00.000Z"
  }
}
```

#### Business Logic
- Updates `creatorStatus` to `ACCEPTED`
- Updates `status` to `IN_REVIEW`
- Cannot accept if already accepted or rejected

#### Error Responses
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User is not a creator or request not assigned to them
- **404 Not Found**: Service request not found
- **400 Bad Request**: Request already accepted/rejected
- **500 Internal Server Error**: Server error

---

### 5. Reject Service Request
**PATCH** `/api/service-requests/:id/reject`

Allows a creator to reject a service request assigned to them.

#### Authentication
Required - User must be a creator and the request must be assigned to them

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Service request ID |

#### Response (200 OK)
```json
{
  "message": "Service request rejected successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "creatorId": "uuid",
    "projectName": "My New Single",
    "artistName": "Artist Name",
    "projectType": "SINGLE",
    "tier": "GOLD",
    "services": "MIXING",
    "description": "Need professional mixing",
    "status": "CANCELLED",
    "creatorStatus": "REJECTED",
    "user": {...},
    "creator": {...},
    "files": [...],
    "genres": [...],
    "createdAt": "2025-12-19T22:00:00.000Z",
    "updatedAt": "2025-12-19T22:05:00.000Z"
  }
}
```

#### Business Logic
- Updates `creatorStatus` to `REJECTED`
- Updates `status` to `CANCELLED`
- Cannot reject if already accepted or rejected

#### Error Responses
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User is not a creator or request not assigned to them
- **404 Not Found**: Service request not found
- **400 Bad Request**: Request already accepted/rejected
- **500 Internal Server Error**: Server error

---

## Usage Examples

### Example 1: Create a Service Request with Files

```javascript
const formData = new FormData();
formData.append('creatorId', 'creator-uuid-123');
formData.append('projectName', 'My New Album');
formData.append('artistName', 'John Doe');
formData.append('projectType', 'ALBUM');
formData.append('tier', 'PLATINUM');
formData.append('services', 'MIXING');
formData.append('description', 'Need professional mixing for my album');
formData.append('genres', JSON.stringify(['genre-uuid-1', 'genre-uuid-2']));

// Attach files
formData.append('demo', demoFile);
formData.append('reference', referenceFile);

const response = await fetch('/api/service-requests', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### Example 2: Get Creator's Pending Requests

```javascript
const response = await fetch(
  '/api/creator/service-requests?creatorStatus=PENDING&page=1&limit=20'
);
const { items, pagination } = await response.json();
```

### Example 3: Accept a Service Request

```javascript
const response = await fetch('/api/service-requests/request-uuid-123/accept', {
  method: 'PATCH'
});
const result = await response.json();
```

---

## Status Flow

### Normal Flow
1. **PENDING** (initial state)
   - `status`: PENDING
   - `creatorStatus`: PENDING

2. **ACCEPTED** (creator accepts)
   - `status`: IN_REVIEW
   - `creatorStatus`: ACCEPTED

3. **IN_PROGRESS** (work begins)
   - `status`: IN_PROGRESS
   - `creatorStatus`: ACCEPTED

4. **DELIVERED** (work completed)
   - `status`: DELIVERED
   - `creatorStatus`: ACCEPTED

### Rejection Flow
1. **PENDING** (initial state)
   - `status`: PENDING
   - `creatorStatus`: PENDING

2. **REJECTED** (creator rejects)
   - `status`: CANCELLED
   - `creatorStatus`: REJECTED

---

## Notes

- All endpoints require authentication via NextAuth
- File uploads are handled using multipart/form-data
- Files are uploaded to the storage system and linked to the service request
- Creators can only accept/reject requests assigned to them
- Users can only view requests they created or are assigned to
- Pagination is available on the list endpoint with default limit of 10 items
