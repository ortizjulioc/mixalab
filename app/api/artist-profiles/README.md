# Artist Profile API CRUD

## Endpoints

### GET /api/artist-profiles
Fetch all artist profiles with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10) - Items per page
- `search` (string, optional) - Search by stage name
- `userId` (string, optional) - Filter by user ID

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "stageName": "string",
      "bio": "string | null",
      "website": "string | null",
      "socials": "object | null",
      "mixaPoints": 0,
      "deleted": false,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "user": {
        "id": "uuid",
        "email": "string",
        "name": "string"
      },
      "genres": [
        {
          "id": "uuid",
          "artistId": "uuid",
          "genreId": "uuid",
          "genre": {
            "id": "uuid",
            "name": "string"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

### POST /api/artist-profiles
Create a new artist profile.

**Request Body:**
```json
{
  "userId": "uuid",
  "stageName": "string",
  "bio": "string (optional)",
  "website": "string (optional)",
  "socials": "object (optional)",
  "genreIds": ["uuid", "uuid"] (optional)
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "userId": "uuid",
  "stageName": "string",
  "bio": "string | null",
  "website": "string | null",
  "socials": "object | null",
  "mixaPoints": 0,
  "deleted": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  },
  "genres": [...]
}
```

---

### GET /api/artist-profiles/{id}
Fetch a single artist profile by ID.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "stageName": "string",
  "bio": "string | null",
  "website": "string | null",
  "socials": "object | null",
  "mixaPoints": 0,
  "deleted": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  },
  "genres": [...]
}
```

---

### PUT /api/artist-profiles/{id}
Update an artist profile.

**Request Body:**
```json
{
  "stageName": "string (optional)",
  "bio": "string (optional)",
  "website": "string (optional)",
  "socials": "object (optional)",
  "mixaPoints": number (optional),
  "genreIds": ["uuid", "uuid"] (optional - replaces existing genres)
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "stageName": "string",
  "bio": "string | null",
  "website": "string | null",
  "socials": "object | null",
  "mixaPoints": 0,
  "deleted": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  },
  "genres": [...]
}
```

---

### DELETE /api/artist-profiles/{id}
Soft delete an artist profile (sets deleted flag to true).

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "stageName": "string",
  "bio": "string | null",
  "website": "string | null",
  "socials": "object | null",
  "mixaPoints": 0,
  "deleted": true,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  },
  "genres": [...]
}
```

---

## Frontend Hook Usage

Import the `useArtistProfiles` hook in your components:

```javascript
'use client';

import useArtistProfiles from '@/hooks/useArtistProfiles';

export default function ArtistsPage() {
  const {
    artistProfiles,
    artistProfile,
    loading,
    error,
    pagination,
    filters,
    handleChangeFilter,
    fetchArtistProfileById,
    createArtistProfile,
    updateArtistProfile,
    deleteArtistProfile,
  } = useArtistProfiles();

  // Fetch specific profile
  const handleFetchProfile = async (id) => {
    await fetchArtistProfileById(id);
  };

  // Create new profile
  const handleCreate = async () => {
    try {
      await createArtistProfile({
        userId: 'user-uuid',
        stageName: 'DJ Cool',
        bio: 'I make awesome beats',
        website: 'https://example.com',
        socials: { twitter: '@djcool', instagram: '@djcool' },
        genreIds: ['genre-uuid-1', 'genre-uuid-2'],
      });
    } catch (err) {
      console.error('Failed to create profile', err);
    }
  };

  // Update profile
  const handleUpdate = async (id) => {
    try {
      await updateArtistProfile(id, {
        stageName: 'DJ Cool 2.0',
        bio: 'Updated bio',
      });
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  // Delete profile
  const handleDelete = async (id) => {
    try {
      await deleteArtistProfile(id);
    } catch (err) {
      console.error('Failed to delete profile', err);
    }
  };

  // Search functionality
  const handleSearch = (value) => {
    handleChangeFilter('search', value);
  };

  // Pagination
  const handlePageChange = (page) => {
    handleChangeFilter('page', page);
  };

  return (
    <div>
      {/* Your component JSX here */}
    </div>
  );
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (e.g., profile already exists for user)
- `500` - Server Error

---

## Features

✅ **Pagination Support** - All list endpoints support page/limit parameters
✅ **Filtering** - Filter by search term (stageName) and userId
✅ **Soft Delete** - Profiles are soft-deleted (deleted flag set to true)
✅ **Genre Management** - Associate genres with artist profiles
✅ **Validation** - Input validation on all endpoints
✅ **Error Handling** - Comprehensive error messages
✅ **Frontend Hook** - React hook for easy API integration
