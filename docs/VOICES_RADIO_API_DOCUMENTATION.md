# Voices Radio API Documentation

## Base URL
```
https://api.voicesradio.co.uk
```

## Authentication
Most endpoints require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <token>
```

> **Token Lifetimes**
> - **Access token**: 1 hour
> - **Refresh token**: 30 days
>
> Use `POST /api/auth/refresh` to exchange a refresh token for a new access token before it expires.

## User Roles & Types
- `user`: Regular app users
- `presenter`: Radio show presenters who can manage their artist profiles
- `admin`: System administrators with full access

### User Types
- `app_user`: Regular application users (default)
- `artist`: Users who are linked to artist profiles
- `admin`: System administrators (info@voicesradio.co.uk)

---

## MongoDB Collections

### 1. users
User accounts and authentication data
```javascript
{
  _id: ObjectId,
  email: String (unique, optional — may be null for Apple Sign-In users),
  password: String (hashed, required for local auth),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['user', 'presenter', 'admin'], default: 'user'),
  userType: String (enum: ['admin', 'artist', 'app_user'], default: 'app_user'),
  artistsSubscribed: [String],
  newsletters: Boolean,
  notificationPreferences: {
    artistAlerts: Boolean,
    eventAlerts: Boolean
  },
  location: {
    city: String,
    country: String
  },
  deviceTokens: [String],
  isVerified: Boolean (default: false),
  verificationToken: String,
  verificationTokenExpires: Date,
  createdAt: Date,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  authProvider: String (enum: ['local', 'apple'], default: 'local'),
  appleId: String
}
```

### 2. artists
Radio show presenters and artist information
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  userId: ObjectId (ref: 'User', for presenter link),
  bio: String,
  imageUrl: String,
  bannerUrl: String,
  genres: [String],
  aliases: [String],
  matching_patterns: [String],
  platforms: {
    mixcloud: {
      username: String,
      verified: Boolean (default: false)
    },
    soundcloud: {
      pattern: String,
      verified: Boolean (default: false)
    }
  },
  mixcloudUsername: String,
  soundcloudUsername: String,
  isActive: Boolean (default: true),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date,
  lastSyncedAt: Date,
  socialLinks: {
    instagram: String,
    twitter: String,
    facebook: String,
    website: String
  }
}
```

### 3. shows
Radio show episodes from various platforms
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  date: Date,
  show_date: Date,
  duration: Number,
  mixcloudUrl: String,
  soundcloudUrl: String,
  imageUrl: String,
  playCount: Number (default: 0),
  featured: Boolean (default: false),
  artistId: ObjectId (ref: 'Artist'),
  mixcloudKey: String,
  soundcloudId: String,
  platform: String (enum: ['mixcloud', 'soundcloud']),
  platform_id: String,
  url: String,
  upload_date: Date,
  discovered_date: Date,
  matching_status: String (enum: ['matched', 'pending', 'manual']),
  matching_confidence: Number (0-100),
  matching_suggestions: [{
    artist_id: ObjectId (ref: 'Artist'),
    artist_name: String,
    confidence: Number (0-100),
    match_type: String (enum: ['exact', 'alias', 'fuzzy', 'custom'])
  }],
  metadata: {
    genre: String,
    tags: [String],
    artwork_url: String,
    play_count: Number
  },
  date_extraction_info: {
    pattern: String,
    match: String,
    extracted_at: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 4. featured_shows
Curated featured shows
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String,
  iframeUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. archived_shows
Archive of previously featured shows
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String,
  iframeUrl: String,
  originalCreatedAt: Date,
  archivedAt: Date
}
```

### 6. sync_jobs
Platform synchronization job tracking
```javascript
{
  _id: ObjectId,
  platform: String (enum: ['soundcloud', 'mixcloud']),
  last_sync: Date,
  last_successful_sync: Date,
  shows_discovered: Number (default: 0),
  shows_matched: Number (default: 0),
  shows_pending: Number (default: 0),
  errors: [String],
  sync_duration: Number,
  status: String (enum: ['running', 'completed', 'failed']),
  created_at: Date,
  updated_at: Date
}
```

### 7. venues
Gig venues and locations
```javascript
{
  _id: ObjectId,
  name: String (required),
  location: {
    address: String,
    city: String,
    county: String,
    postcode: String,
    country: String (default: 'UK')
  },
  capacity: Number,
  contact: {
    name: String,
    email: String,
    phone: String
  },
  description: String,
  techSpec: String,
  totalBookings: Number (default: 0),
  isVerified: Boolean (default: false),
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: 'User'),
  addedBy: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

### 8. gigs
Gig bookings and events
```javascript
{
  _id: ObjectId,
  title: String (required),
  eventDate: Date (required),
  startTime: String,
  endTime: String,
  status: String (enum: ['pending', 'open', 'assigned', 'confirmed', 'completed', 'invoiced', 'cancelled', 'filled'], default: 'pending'),
  venue: ObjectId (ref: 'Venue', required),
  paymentAmount: Number,
  description: String,
  notes: String,
  feedback: String,
  genre: [String],
  assignedTo: ObjectId (ref: 'User'), // Legacy field for backward compatibility
  assignments: [{
    userId: ObjectId (ref: 'User', required),
    assignedAt: Date (default: Date.now),
    assignedBy: ObjectId (ref: 'User', required),
    status: String (enum: ['assigned', 'confirmed', 'completed', 'cancelled'], default: 'assigned'),
    paymentAmount: Number (min: 0),
    notes: String,
    confirmedAt: Date,
    completedAt: Date
  }],
  createdBy: ObjectId (ref: 'User', required),
  isPublic: Boolean (default: true),
  gigSource: String (enum: ['voices_radio', 'talentbanq', 'direct'], default: 'voices_radio'),
  applicationsCount: Number (default: 0),
  applicationDeadline: Date,
  confirmedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. gig_applications
DJ applications for available gigs
```javascript
{
  _id: ObjectId,
  gigId: ObjectId (ref: 'Gig', required),
  applicantId: ObjectId (ref: 'User', required),
  status: String (enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending'),
  message: String,
  availabilityConfirmed: Boolean (default: false),
  availabilityNotes: String,
  experienceLevel: String (enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate'),
  preferredGenres: [String],
  experienceDescription: String,
  hasOwnEquipment: Boolean (default: false),
  equipmentList: [String],
  portfolioLinks: [String],
  previousGigs: String,
  specialRequests: String,
  appliedAt: Date (default: Date.now),
  respondedAt: Date,
  reviewedBy: ObjectId (ref: 'User'),
  adminNotes: String,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. invoices
Payment invoices submitted by DJs
```javascript
{
  _id: ObjectId,
  gigId: ObjectId (ref: 'Gig', required),
  djId: ObjectId (ref: 'User', required),
  totalAmount: Number (required, min: 0),
  status: String (enum: ['pending', 'paid', 'rejected', 'cancelled'], default: 'pending'),
  description: String,
  additionalNotes: String,
  djAddress: {
    line1: String,
    line2: String,
    city: String,
    postcode: String,
    country: String (default: 'UK')
  },
  adminAddress: {
    line1: String,
    line2: String,
    city: String,
    postcode: String,
    country: String (default: 'UK')
  },
  submittedAt: Date (default: Date.now),
  paidAt: Date,
  dueDate: Date,
  paymentMethod: String (enum: ['bank_transfer', 'paypal', 'stripe', 'cash', 'other'], default: 'bank_transfer'),
  paymentReference: String,
  rejectionReason: String,
  invoiceNumber: String (unique),
  taxRate: Number (default: 0),
  taxAmount: Number (default: 0),
  currency: String (default: 'GBP'),
  createdAt: Date,
  updatedAt: Date
}
```

### 11. user_roles
User role assignments and permissions
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  roleType: String (required, enum: ['dj', 'bar_employee', 'producer', 'admin']),
  isPrimary: Boolean (default: false),
  isActive: Boolean (default: true),
  assignedBy: ObjectId (ref: 'User'),
  assignedAt: Date (default: Date.now),
  permissions: [String],
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### 12. bar_employees
Bar staff profile information
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  name: String (required),
  email: String (required),
  phone: String,
  address: {
    line1: String,
    line2: String,
    city: String,
    postcode: String,
    country: String (default: 'UK')
  },
  startDate: Date,
  endDate: Date,
  hourlyRate: Number (min: 0),
  position: String (default: 'bartender'),
  bankDetails: {
    accountName: String,
    accountNumber: String,
    sortCode: String
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 13. bar_shifts
Bar work shift scheduling
```javascript
{
  _id: ObjectId,
  barId: ObjectId (ref: 'Venue', required),
  employeeId: ObjectId (ref: 'BarEmployee', required),
  date: Date (required),
  startTime: String (required),
  endTime: String (required),
  duration: Number, // Duration in minutes
  hourlyRate: Number (min: 0),
  totalPay: Number (min: 0),
  status: String (enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled'),
  notes: String,
  confirmedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 14. producers
Producer/studio manager profiles
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  name: String (required),
  email: String (required),
  phone: String,
  bio: String,
  specialties: [String],
  experienceYears: Number (min: 0),
  hasStudio: Boolean (default: false),
  equipmentList: [String],
  availability: {
    daysAvailable: [String],
    timeSlots: [String]
  },
  rates: {
    hourlyRate: Number (min: 0),
    projectRate: Number (min: 0)
  },
  portfolio: {
    sampleLinks: [String],
    productionCredits: [String]
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 15. producer_slots
Production session bookings
```javascript
{
  _id: ObjectId,
  producerId: ObjectId (ref: 'Producer', required),
  title: String (default: 'Production Session'),
  description: String,
  date: Date (required),
  startTime: String (required),
  endTime: String (required),
  duration: Number, // Duration in minutes
  sessionType: String (enum: ['recording', 'mixing', 'mastering', 'consultation', 'other']),
  client: {
    name: String,
    projectDetails: String
  },
  status: String (enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled'),
  rate: Number (min: 0),
  totalCost: Number (min: 0),
  notes: String,
  confirmedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 16. comments
Communication comments and notes
```javascript
{
  _id: ObjectId,
  content: String (required),
  authorId: ObjectId (ref: 'User', required),
  entityType: String (enum: ['gig', 'invoice', 'user', 'venue', 'producer', 'bar_employee', 'general']),
  entityId: ObjectId,
  isInternal: Boolean (default: false),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 17. messages
Internal messaging system
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required),
  recipientId: ObjectId (ref: 'User', required),
  subject: String,
  content: String (required),
  isRead: Boolean (default: false),
  readAt: Date,
  parentMessageId: ObjectId (ref: 'Message'),
  threadId: ObjectId,
  priority: String (enum: ['low', 'normal', 'high', 'urgent'], default: 'normal'),
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 18. artist_invitations
Artist profile invitation system
```javascript
{
  _id: ObjectId,
  artistId: ObjectId (ref: 'Artist', required),
  email: String (required, trim: true, lowercase: true),
  invitationToken: String (required, unique: true),
  status: String (enum: ['pending', 'accepted', 'expired'], default: 'pending'),
  expiresAt: Date (required),
  sentAt: Date (default: Date.now),
  acceptedAt: Date,
  acceptedBy: ObjectId (ref: 'User'),
  sentCount: Number (default: 1),
  lastSentAt: Date (default: Date.now),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
```javascript
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "newsletters": true,
  "notificationPreferences": {
    "artistAlerts": true,
    "eventAlerts": true
  }
}

// Response
{
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    // ... other user fields
  }
}
```

#### POST /api/auth/login
Login with email and password
```javascript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "jwt_access_token",         // 1 hour
  "refreshToken": "jwt_refresh_token", // 30 days
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    // ... other user fields
  }
}
```

#### POST /api/auth/apple-auth
Login/register with Apple ID
```javascript
// Request
{
  "identityToken": "apple_identity_token",
  "user": {
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "user@example.com"  // Optional — Apple only provides email on first sign-in
  }
}

// Response
{
  "token": "jwt_access_token",       // 1 hour
  "refreshToken": "jwt_refresh_token", // 30 days
  "user": {
    "_id": "...",
    "email": null,  // May be null for Apple users who didn't share email
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "authProvider": "apple"
  },
  "isNewUser": false
}
```

#### GET /api/auth/verify-email/:token
Verify email address via web link (redirects to verification page)

#### POST /api/auth/verify-email/:token
Verify email address from mobile app
```javascript
// Response (success)
{
  "message": "Email verified successfully",
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": { /* user object */ }
}
```

#### POST /api/auth/resend-verification
Resend email verification link
```javascript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "message": "Verification email sent"
}
```

#### POST /api/auth/refresh
Refresh access token using a valid refresh token
```javascript
// Request headers (either):
// Authorization: Bearer <refresh_token>
// OR x-auth-token: <refresh_token>

// Response
{
  "token": "new_jwt_access_token",       // 1 hour
  "refreshToken": "new_jwt_refresh_token" // 30 days (rotated)
}
```

#### GET /api/auth/validate
Validate the current access token and get basic user info
```javascript
// Request headers:
// Authorization: Bearer <access_token>

// Response
{
  "valid": true,
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "user"
  },
  "expiresAt": "2026-05-27T10:00:00.000Z"
}
```

#### GET /api/auth/validate-token/:token
Validate a deep-link token (email verification or password reset)
```javascript
// Query parameters:
// ?type=email_verification | password_reset  (required)

// Response (success)
{
  "valid": true,
  "type": "email_verification",
  "user": {
    "_id": "...",
    "email": "user@example.com"
  }
}

// Response (invalid/expired)
{
  "valid": false,
  "message": "Invalid or expired token"
}
```
> **Note**: Tokens have a 2-minute grace period to support web-to-mobile handoffs (e.g. the user taps a link in the browser and the app opens via deep link).

#### POST /api/auth/set-password-from-invitation
Set password using an invitation token (for users who were invited via email)
```javascript
// Request
{
  "token": "invitation_token",
  "password": "new_secure_password"
}

// Response
{
  "message": "Password set successfully",
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": { /* user object */ }
}
```

#### POST /api/auth/change-email
Change user email address (no authentication required — uses current password for verification)
```javascript
// Request
{
  "currentEmail": "old@example.com",
  "newEmail": "new@example.com",
  "password": "current_password"
}

// Response
{
  "message": "Email change initiated. Please check your new email for verification."
}
```

#### DELETE /api/auth/delete-account
Delete the authenticated user's account
```javascript
// Request headers: Authorization: Bearer <token>

// Request (optional — for extra security)
{
  "password": "current_password"
}

// Response
{
  "message": "Account deleted successfully"
}
```

#### POST /api/auth/forgot-password
Request password reset
```javascript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "message": "Password reset email sent"
}
```

#### POST /api/auth/reset-password
Reset password with token
```javascript
// Request
{
  "token": "reset_token",
  "password": "new_password123"
}

// Response
{
  "message": "Password reset successfully"
}
```

### User Endpoints

#### GET /api/users
Get all users (admin only, requires auth)
```javascript
// Query parameters:
// ?page=1 - pagination page
// ?limit=20 - results per page
// ?search=john - search by name or email
// ?role=user - filter by role (user, presenter, admin)
// ?userType=app_user - filter by userType (admin, artist, app_user)
// ?isVerified=true - filter by verification status
// ?sortBy=createdAt - sort field
// ?sortOrder=desc - sort direction (asc, desc)

// Response
{
  "users": [
    {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "userType": "app_user",
      "isVerified": true,
      "artistsSubscribed": ["artist1", "artist2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      // ... other user fields (password excluded)
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET /api/users/me
Get current user profile (requires auth)
```javascript
// Response
{
  "_id": "...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "userType": "app_user",
  "artistsSubscribed": ["artist1", "artist2"],
  // ... other user fields
}
```

#### PATCH /api/users/me
Update current user profile (requires auth)
```javascript
// Request
{
  "firstName": "John",
  "lastName": "Smith",
  "location": {
    "city": "London",
    "country": "UK"
  },
  "notificationPreferences": {
    "artistAlerts": false,
    "eventAlerts": true
  }
}

// Response
{
  "message": "Profile updated successfully.",
  "user": { /* updated user object */ }
}
```

#### GET /api/users/me/subscriptions
Get current user's artist subscriptions (requires auth)
```javascript
// Response
{
  "artistsSubscribed": ["artist_username_1", "artist_username_2"]
}
```

#### GET /api/users/me/artists-data
Get optimised data for the current user's subscribed artists (requires auth)
```javascript
// Response
{
  "artists": [
    {
      "_id": "...",
      "name": "Artist Name",
      "imageUrl": "https://...",
      "genres": ["House", "Techno"],
      "isActive": true
      // ... artist fields
    }
  ]
}
```

#### POST /api/users/subscribe/:identifier
Subscribe to an artist by username or ID (requires auth)
```javascript
// :identifier can be an artist username (string) or MongoDB ObjectId

// Response
{
  "message": "Subscribed successfully",
  "artistsSubscribed": ["artist1", "artist2", "newArtist"]
}
```

#### POST /api/users/unsubscribe/:identifier
Unsubscribe from an artist by username or ID (requires auth)
```javascript
// Response
{
  "message": "Unsubscribed successfully",
  "artistsSubscribed": ["artist1", "artist2"]
}
```

#### POST /api/users/update-timezone
Update the current user's timezone (requires auth)
```javascript
// Request
{
  "timezone": "Europe/London"
}

// Response
{
  "message": "Timezone updated successfully"
}
```

#### DELETE /api/users/:id
Delete a user account (admin only, requires auth)

#### POST /api/users/device-token
Register device token for push notifications (requires auth)
```javascript
// Request
{
  "token": "device_push_token"
}

// Response
{
  "message": "Device token registered successfully"
}
```

### Artist Endpoints

#### GET /api/artists
Get all artists
```javascript
// Response
[
  {
    "_id": "...",
    "name": "Artist Name",
    "bio": "Artist biography",
    "imageUrl": "https://...",
    "genres": ["House", "Techno"],
    "isActive": true,
    "featured": false,
    // ... other artist fields
  }
]
```

#### GET /api/artists/optimized
Get artists list — optimised response with 5-minute server-side cache (faster for list screens)
```javascript
// Query parameters: same as GET /api/artists

// Response: same shape as GET /api/artists
// Cache-Control: public, max-age=300
```

#### GET /api/artists/:id
Get artist by ID
```javascript
// Response
{
  "_id": "...",
  "name": "Artist Name",
  "bio": "Artist biography",
  "imageUrl": "https://...",
  "genres": ["House", "Techno"],
  // ... other artist fields
}
```

#### POST /api/artists
Create new artist (admin only, requires auth)
```javascript
// Request
{
  "name": "New Artist",
  "bio": "Artist biography",
  "imageUrl": "https://...",
  "genres": ["House", "Techno"],
  "mixcloudUsername": "username",
  "socialLinks": {
    "instagram": "@artist"
  }
}

// Response
{
  "_id": "...",
  "name": "New Artist",
  // ... created artist object
}
```

#### PUT /api/artists/:id
Update artist (admin only, requires auth)
```javascript
// Request
{
  "name": "Updated Artist Name",
  "bio": "Updated biography",
  "genres": ["House", "Techno", "Minimal"]
}

// Response
{
  "_id": "...",
  "name": "Updated Artist Name",
  // ... updated artist object
}
```

#### DELETE /api/artists/:id
Delete artist (admin only, requires auth)

#### GET /api/artists/presenter/:id
Get presenter's artist profile (presenter only, requires auth)
```javascript
// Response
{
  "_id": "...",
  "name": "Presenter Artist",
  "bio": "Biography",
  "userId": "presenter_user_id",
  // ... artist fields
}
```

#### PATCH /api/artists/presenter/:id
Update presenter's artist profile (presenter only, requires auth)
```javascript
// Request
{
  "bio": "Updated biography",
  "genres": ["House", "Techno"],
  "socialLinks": {
    "instagram": "@newhandle"
  }
}

// Response
{
  "_id": "...",
  "name": "Presenter Artist",
  // ... updated artist object
}
```

#### GET /api/artists/presenter/my-profile
Get current presenter's artist profile (presenter only, requires auth)
```javascript
// Response
{
  "_id": "...",
  "name": "Presenter Artist",
  "bio": "Biography",
  "userId": "presenter_user_id",
  // ... artist fields
}
```

#### PATCH /api/artists/presenter/my-profile
Update current presenter's artist profile (presenter only, requires auth)
```javascript
// Request
{
  "bio": "Updated biography",
  "genres": ["House", "Techno"],
  "socialLinks": {
    "instagram": "@newhandle"
  }
}

// Response
{
  "_id": "...",
  "name": "Presenter Artist",
  // ... updated artist object
}
```

#### POST /api/artists/:artistId/upload-image
Upload image for artist (requires auth)
- **Content-Type**: multipart/form-data
- **Field name**: "image"
- **File size limit**: 10MB
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Storage**: Vercel Blob storage (cloud) or local filesystem (development)

```javascript
// Request
// Form data with 'image' field containing the file

// Response
{
  "message": "Image uploaded successfully",
  "artist": {
    "id": "...",
    "name": "Artist Name",
    "imageUrl": "https://blob.vercel-storage.com/artists/artist_name_timestamp.jpg"
  }
}
```

#### GET /api/artists/:artistId/shows
Get shows for specific artist
```javascript
// Response
[
  {
    "_id": "...",
    "title": "Show Title",
    "date": "2024-01-01T00:00:00.000Z",
    "artistId": "...",
    // ... show fields
  }
]
```

#### GET /api/artists/featured/shows
Get all shows that have been marked as featured across all artists (public)
```javascript
// Response
[
  {
    "_id": "...",
    "title": "Show Title",
    "featured": true,
    "artistId": { /* populated artist object */ },
    // ... show fields
  }
]
```

#### POST /api/artists/:id/shows
Add a show to an artist (admin only, requires auth)
```javascript
// Request
{
  "title": "Show Title",
  "date": "2024-01-01T00:00:00.000Z",
  "url": "https://www.mixcloud.com/...",
  "platform": "mixcloud",
  "description": "Show description"
}

// Response
{ /* updated artist object with new show */ }
```

#### PUT /api/artists/:artistId/shows/:showId
Update a show linked to an artist (admin only, requires auth)
```javascript
// Request: partial show fields to update

// Response
{ /* updated show object */ }
```

#### DELETE /api/artists/:artistId/shows/:showId
Remove a show from an artist (admin only, requires auth)

#### PATCH /api/artists/:artistId/shows/:showId/featured
Toggle featured status of a show (admin only, requires auth)
```javascript
// Request
{
  "featured": true
}

// Response
{
  "message": "Show featured successfully",
  "show": { /* updated show object */ }
}
```

#### POST /api/artists/:id/sync
Sync shows for artist from platforms (admin only, requires auth)
```javascript
// Response
{
  "message": "Sync completed for Artist Name",
  "success": true,
  "artist_name": "Artist Name",
  "artist_id": "...",
  "mixcloud": {
    "username": "...",
    "shows_discovered": 5,
    "shows_matched": 3,
    "shows_pending": 2
  },
  "soundcloud": {
    "pattern": "...",
    "shows_discovered": 3,
    "shows_matched": 2,
    "shows_pending": 1
  },
  "total_shows_discovered": 8,
  "total_shows_matched": 5,
  "total_shows_pending": 3
}
```

### Artist Invitation Endpoints

#### GET /api/artist-invitations
Get all artist invitations (admin only, requires auth)
```javascript
// Query parameters:
// ?page=1 - pagination page
// ?limit=20 - results per page
// ?status=pending - filter by status (pending, accepted, expired)
// ?artistId=artistId - filter by artist

// Response
{
  "invitations": [
    {
      "_id": "...",
      "artistId": {
        "_id": "...",
        "name": "Artist Name",
        "imageUrl": "https://..."
      },
      "email": "artist@example.com",
      "status": "pending",
      "sentAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-08T00:00:00.000Z",
      "acceptedBy": null,
      // ... other invitation fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### POST /api/artist-invitations
Create and send artist invitation (admin only, requires auth)
```javascript
// Request
{
  "artistId": "artistId",
  "email": "artist@example.com"
}

// Response
{
  "message": "Invitation sent successfully",
  "invitation": {
    "_id": "...",
    "artistId": { /* populated artist object */ },
    "email": "artist@example.com",
    "status": "pending",
    "invitationToken": "unique_token",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

#### POST /api/artist-invitations/resend/:invitationId
Resend artist invitation (admin only, requires auth)
```javascript
// Response
{
  "message": "Invitation resent successfully",
  "invitation": {
    "_id": "...",
    "invitationToken": "new_unique_token",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "sentCount": 2
  }
}
```

#### GET /api/artist-invitations/validate/:token
Validate invitation token (public)
```javascript
// Response
{
  "valid": true,
  "invitation": {
    "_id": "...",
    "artistId": {
      "_id": "...",
      "name": "Artist Name",
      "imageUrl": "https://..."
    },
    "email": "artist@example.com",
    "status": "pending",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

#### POST /api/artist-invitations/claim/:token
Claim artist profile (public)
```javascript
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "password": "secure_password"
}

// Response
{
  "message": "Artist profile claimed successfully",
  "user": {
    "id": "...",
    "email": "artist@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "artist",
    "role": "presenter"
  },
  "artist": {
    "id": "...",
    "name": "Artist Name"
  },
  "token": "jwt_token_for_immediate_login"
}
```

#### DELETE /api/artist-invitations/:id
Cancel invitation (admin only, requires auth)
```javascript
// Response
{
  "message": "Invitation cancelled successfully"
}
```

### Show Endpoints

#### GET /api/shows
Get all shows with optional filtering
```javascript
// Query parameters:
// ?featured=true - only featured shows
// ?artist=artistId - shows by specific artist
// ?limit=10 - limit results
// ?skip=0 - pagination offset

// Response
[
  {
    "_id": "...",
    "title": "Show Title",
    "description": "Show description",
    "date": "2024-01-01T00:00:00.000Z",
    "artistId": "...",
    "platform": "mixcloud",
    "featured": false,
    // ... other show fields
  }
]
```

#### GET /api/shows/:id
Get show by ID
```javascript
// Response
{
  "_id": "...",
  "title": "Show Title",
  "description": "Show description",
  "date": "2024-01-01T00:00:00.000Z",
  "artistId": "...",
  // ... show fields
}
```

#### POST /api/shows
Create new show (admin only, requires auth)
```javascript
// Request
{
  "title": "New Show",
  "description": "Show description",
  "date": "2024-01-01T00:00:00.000Z",
  "artistId": "...",
  "platform": "mixcloud",
  "url": "https://..."
}

// Response
{
  "_id": "...",
  "title": "New Show",
  // ... created show object
}
```

#### PUT /api/shows/:id
Update show (admin only, requires auth)

#### DELETE /api/shows/:id
Delete show (admin only, requires auth)

#### GET /api/shows/featured
Get all featured shows
```javascript
// Response
[
  {
    "_id": "...",
    "title": "Featured Show",
    "featured": true,
    // ... show fields
  }
]
```

#### GET /api/shows/pending
Get shows pending artist matching (admin only, requires auth)
```javascript
// Response
{
  "shows": [
    {
      "_id": "...",
      "title": "Unmatched Show",
      "matching_status": "pending",
      "matching_suggestions": [
        {
          "artist_id": "...",
          "artist_name": "Suggested Artist",
          "confidence": 85,
          "match_type": "fuzzy"
        }
      ]
    }
  ],
  "total": 10,
  "page": 1,
  "totalPages": 2
}
```

#### POST /api/shows/:showId/match
Match show to artist (admin only, requires auth)
```javascript
// Request
{
  "artistId": "...",
  "confidence": 95
}

// Response
{
  "message": "Show matched successfully",
  "show": { /* updated show object */ }
}
```

### Featured Shows Endpoints

#### GET /api/featured-shows/getShows
Get all featured shows
```javascript
// Response
[
  {
    "_id": "...",
    "title": "Featured Show Title",
    "description": "Description",
    "imageUrl": "https://...",
    "iframeUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Cron Job Endpoints

#### GET /api/cron/check-upcoming-shows
Trigger upcoming shows check (internal use)
- **Schedule**: Runs every 5 minutes via Vercel CRON
- **Purpose**: Checks for shows starting in 5 minutes and sends push notifications to subscribed users
- **Response**: Shows found and notifications sent

#### GET /api/cron/test-check-upcoming
Test endpoint for debugging upcoming shows notifications
- **Purpose**: Manual testing of the notification system
- **Response**: Current time in UTC and London timezone, plus notification results

#### GET /api/cron/poll-platforms
Trigger platform polling (internal use)
- **Schedule**: Runs every 3 hours via Vercel CRON
- **Purpose**: Polls MixCloud and SoundCloud for new shows

#### GET /api/cron/poll-platforms-micro
Trigger micro platform polling (internal use)
- **Schedule**: Runs every 15 minutes via Vercel CRON
- **Purpose**: Light polling for latest content

#### GET /api/cron/rematch-pending
Trigger pending show rematching (internal use)
- **Schedule**: Runs daily at 3 AM via Vercel CRON
- **Purpose**: Re-matches shows that couldn't be automatically matched

#### GET /api/cron/cleanup-sync-jobs
Trigger sync job cleanup (internal use)
- **Schedule**: Runs weekly on Sundays at 4 AM via Vercel CRON
- **Purpose**: Cleans up old synchronization job records

---

## Invoicing System Endpoints

### Venue Endpoints

#### GET /api/venues
Get all venues with optional filtering
```javascript
// Query parameters:
// ?city=London - filter by city
// ?minCapacity=100 - minimum capacity
// ?maxCapacity=500 - maximum capacity
// ?isVerified=true - only verified venues
// ?search=club - search in name, description, or city
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "venues": [
    {
      "_id": "...",
      "name": "Venue Name",
      "location": {
        "address": "123 Main St",
        "city": "London",
        "county": "Greater London",
        "postcode": "SW1A 1AA",
        "country": "UK"
      },
      "capacity": 200,
      "contact": {
        "name": "Contact Person",
        "email": "contact@venue.com",
        "phone": "+44 123 456 7890"
      },
      "description": "Venue description",
      "techSpec": "Technical specifications",
      "isVerified": true,
      // ... other venue fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### GET /api/venues/:id
Get venue by ID
```javascript
// Response
{
  "_id": "...",
  "name": "Venue Name",
  "location": { /* location object */ },
  "capacity": 200,
  "contact": { /* contact object */ },
  // ... other venue fields
}
```

#### POST /api/venues
Create new venue (authenticated users)
```javascript
// Request
{
  "name": "New Venue",
  "location": {
    "address": "123 Main St",
    "city": "London",
    "county": "Greater London",
    "postcode": "SW1A 1AA",
    "country": "UK"
  },
  "capacity": 200,
  "contact": {
    "name": "Contact Person",
    "email": "contact@venue.com",
    "phone": "+44 123 456 7890"
  },
  "description": "Venue description",
  "techSpec": "Technical specifications for the venue"
}

// Response
{
  "_id": "...",
  "name": "New Venue",
  // ... created venue object
}
```

#### PUT /api/venues/:id
Update venue (admin only, requires auth)

#### DELETE /api/venues/:id
Delete venue (admin only, requires auth)

#### PUT /api/venues/:id/verify
Verify venue (admin only, requires auth)

#### GET /api/venues/stats
Get venue statistics (admin only, requires auth)

### Gig Endpoints

#### GET /api/gigs
Get all gigs with optional filtering
```javascript
// Query parameters:
// ?status=pending - filter by status
// ?venue=venueId - filter by venue
// ?dateFrom=2024-01-01 - filter by date range
// ?dateTo=2024-12-31
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "gigs": [
    {
      "_id": "...",
      "title": "Gig Title",
      "eventDate": "2024-01-01T00:00:00.000Z",
      "status": "pending",
      "venue": { /* populated venue object */ },
      "paymentAmount": 150,
      // ... other gig fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET /api/gigs/:id
Get gig by ID
```javascript
// Response
{
  "_id": "...",
  "title": "Gig Title",
  "eventDate": "2024-01-01T00:00:00.000Z",
  "venue": { /* populated venue object */ },
  "assignedTo": { /* populated user object */ },
  // ... other gig fields
}
```

#### POST /api/gigs
Create new gig (admin only, requires auth)
```javascript
// Request
{
  "title": "New Gig",
  "eventDate": "2024-01-01T00:00:00.000Z",
  "startTime": "20:00",
  "endTime": "02:00",
  "venue": "venueId",
  "paymentAmount": 150,
  "description": "Gig description",
  "genre": ["House", "Techno"],
  "requirements": {
    "experience": "intermediate",
    "equipment": ["CDJs", "Mixer"]
  }
}

// Response
{
  "_id": "...",
  "title": "New Gig",
  // ... created gig object
}
```

#### PUT /api/gigs/:id
Update gig (admin only, requires auth)

#### DELETE /api/gigs/:id
Delete gig (admin only, requires auth)

#### GET /api/gigs/:id/applications
Get applications for a gig (admin only, requires auth)

#### PUT /api/gigs/applications/:applicationId
Update gig application status (admin only, requires auth)

#### POST /api/gigs/:id/assign
Assign multiple DJs to a gig (admin only, requires auth)
```javascript
// Request
{
  "assignments": [
    {
      "userId": "userId1",
      "paymentAmount": 150,
      "notes": "Main DJ"
    },
    {
      "userId": "userId2", 
      "paymentAmount": 100,
      "notes": "Support DJ"
    }
  ]
}

// Response
{
  "message": "DJs assigned successfully",
  "gig": { /* updated gig object with assignments */ },
  "newAssignments": [ /* array of newly added assignments */ ]
}
```

#### PUT /api/gigs/:id/assignments/:assignmentId
Update gig assignment (admin only, requires auth)
```javascript
// Request
{
  "status": "confirmed",
  "paymentAmount": 175,
  "notes": "Updated notes"
}

// Response
{
  "message": "Assignment updated successfully",
  "assignment": { /* updated assignment object */ }
}
```

#### DELETE /api/gigs/:id/assignments/:assignmentId
Remove DJ assignment from gig (admin only, requires auth)
```javascript
// Response
{
  "message": "Assignment removed successfully"
}
```

#### GET /api/gigs/assigned-to-me
Get gigs assigned to current user (authenticated users)
```javascript
// Response
{
  "gigs": [
    {
      "_id": "...",
      "title": "Gig Title",
      "eventDate": "2024-01-01T00:00:00.000Z",
      "venue": { /* populated venue object */ },
      "assignments": [
        {
          "userId": { /* populated user object */ },
          "status": "assigned",
          "paymentAmount": 150,
          "notes": "Main DJ"
        }
      ]
    }
  ]
}
```

### Gig Application Endpoints

#### GET /api/gig-applications
Get all gig applications (admin only, requires auth)
```javascript
// Query parameters:
// ?status=pending - filter by status
// ?gigId=gigId - filter by gig
// ?applicantId=userId - filter by applicant
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "applications": [
    {
      "_id": "...",
      "gigId": { /* populated gig object */ },
      "applicantId": { /* populated user object */ },
      "status": "pending",
      "message": "I'm interested in this gig",
      // ... other application fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### GET /api/gig-applications/:id
Get single application
```javascript
// Response
{
  "_id": "...",
  "gigId": { /* populated gig object */ },
  "applicantId": { /* populated user object */ },
  "status": "pending",
  // ... other application fields
}
```

#### POST /api/gig-applications
Create new application (authenticated users)
```javascript
// Request
{
  "gigId": "gigId",
  "message": "I'm interested in this gig",
  "experienceLevel": "intermediate",
  "preferredGenres": ["House", "Techno"],
  "experienceDescription": "5 years of DJing experience",
  "hasOwnEquipment": true,
  "equipmentList": ["CDJs", "Mixer"]
}

// Response
{
  "_id": "...",
  "gigId": { /* populated gig object */ },
  "applicantId": { /* populated user object */ },
  // ... created application object
}
```

#### PUT /api/gig-applications/:id
Update application status (admin only, requires auth)

#### DELETE /api/gig-applications/:id
Delete application

#### GET /api/gig-applications/user/my-applications
Get user's applications (authenticated users)

### Invoice Endpoints

#### GET /api/invoices
Get all invoices with filtering
```javascript
// Query parameters:
// ?status=pending - filter by status
// ?djId=userId - filter by DJ
// ?gigId=gigId - filter by gig
// ?dateFrom=2024-01-01 - filter by date range
// ?dateTo=2024-12-31
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "invoices": [
    {
      "_id": "...",
      "gigId": { /* populated gig object */ },
      "djId": { /* populated user object */ },
      "totalAmount": 150,
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z",
      // ... other invoice fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 75,
    "pages": 4
  }
}
```

#### GET /api/invoices/:id
Get single invoice
```javascript
// Response
{
  "_id": "...",
  "gigId": { /* populated gig object */ },
  "djId": { /* populated user object */ },
  "totalAmount": 150,
  "status": "pending",
  // ... other invoice fields
}
```

#### POST /api/invoices
Create new invoice (authenticated users)
```javascript
// Request
{
  "gigId": "gigId",
  "totalAmount": 150,
  "description": "DJ services for event",
  "djAddress": {
    "line1": "123 Main St",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "UK"
  }
}

// Response
{
  "_id": "...",
  "gigId": { /* populated gig object */ },
  "djId": { /* populated user object */ },
  // ... created invoice object
}
```

#### PUT /api/invoices/:id
Update invoice

#### PUT /api/invoices/:id/pay
Mark invoice as paid (admin only, requires auth)
```javascript
// Request
{
  "paymentMethod": "bank_transfer",
  "paymentReference": "REF123456"
}

// Response
{
  "_id": "...",
  "status": "paid",
  "paidAt": "2024-01-01T00:00:00.000Z",
  // ... updated invoice object
}
```

#### PUT /api/invoices/:id/reject
Reject invoice (admin only, requires auth)
```javascript
// Request
{
  "rejectionReason": "Incorrect amount"
}

// Response
{
  "_id": "...",
  "status": "rejected",
  "rejectionReason": "Incorrect amount",
  // ... updated invoice object
}
```

#### DELETE /api/invoices/:id
Delete invoice

#### GET /api/invoices/stats
Get invoice statistics (admin only, requires auth)

### User Role Endpoints

#### GET /api/user-roles
Get all user roles (admin only, requires auth)
```javascript
// Query parameters:
// ?userId=userId - filter by user
// ?roleType=dj - filter by role type
// ?isActive=true - filter by active status
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "roles": [
    {
      "_id": "...",
      "userId": { /* populated user object */ },
      "roleType": "dj",
      "isPrimary": true,
      "isActive": true,
      // ... other role fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

#### GET /api/user-roles/user/:userId
Get roles for specific user

#### GET /api/user-roles/my-roles
Get current user's roles (authenticated users)

#### POST /api/user-roles
Assign role to user (admin only, requires auth)
```javascript
// Request
{
  "userId": "userId",
  "roleType": "dj",
  "isPrimary": true,
  "permissions": ["create_gigs", "view_invoices"]
}

// Response
{
  "_id": "...",
  "userId": { /* populated user object */ },
  "roleType": "dj",
  // ... created role object
}
```

#### PUT /api/user-roles/:id
Update user role (admin only, requires auth)

#### PUT /api/user-roles/:id/set-primary
Set role as primary (admin only, requires auth)

#### DELETE /api/user-roles/:id
Remove user role (admin only, requires auth)

#### PUT /api/user-roles/:id/deactivate
Deactivate user role (admin only, requires auth)

#### GET /api/user-roles/stats
Get user role statistics (admin only, requires auth)

### Bar Employee Endpoints

#### GET /api/bar-employees
Get all bar employees (admin only, requires auth)
```javascript
// Query parameters:
// ?isActive=true - filter by active status
// ?position=bartender - filter by position
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "employees": [
    {
      "_id": "...",
      "userId": { /* populated user object */ },
      "name": "Employee Name",
      "email": "employee@example.com",
      "position": "bartender",
      "hourlyRate": 12.50,
      "isActive": true,
      // ... other employee fields
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 50
}
```

#### GET /api/bar-employees/:id
Get single bar employee

#### POST /api/bar-employees
Create new bar employee (admin only, requires auth)
```javascript
// Request
{
  "userId": "userId",
  "name": "Employee Name",
  "email": "employee@example.com",
  "phone": "+44 123 456 7890",
  "position": "bartender",
  "hourlyRate": 12.50,
  "address": {
    "line1": "123 Main St",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "UK"
  }
}

// Response
{
  "_id": "...",
  "userId": { /* populated user object */ },
  "name": "Employee Name",
  // ... created employee object
}
```

#### PUT /api/bar-employees/:id
Update bar employee (admin only, requires auth)

#### DELETE /api/bar-employees/:id
Delete bar employee (admin only, requires auth)

#### GET /api/bar-employees/stats
Get bar employee statistics (admin only, requires auth)

### Bar Shift Endpoints

#### GET /api/bar-shifts
Get all bar shifts (admin only, requires auth)
```javascript
// Query parameters:
// ?status=scheduled - filter by status
// ?employeeId=employeeId - filter by employee
// ?barId=barId - filter by bar
// ?dateFrom=2024-01-01 - filter by date range
// ?dateTo=2024-12-31
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "shifts": [
    {
      "_id": "...",
      "employeeId": { /* populated employee object */ },
      "barId": { /* populated venue object */ },
      "date": "2024-01-01T00:00:00.000Z",
      "startTime": "18:00",
      "endTime": "02:00",
      "status": "scheduled",
      "totalPay": 96.00,
      // ... other shift fields
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 30
}
```

#### GET /api/bar-shifts/:id
Get single bar shift

#### POST /api/bar-shifts
Create new bar shift (admin only, requires auth)
```javascript
// Request
{
  "barId": "venueId",
  "employeeId": "employeeId",
  "date": "2024-01-01T00:00:00.000Z",
  "startTime": "18:00",
  "endTime": "02:00",
  "hourlyRate": 12.00,
  "notes": "Regular shift"
}

// Response
{
  "_id": "...",
  "barId": { /* populated venue object */ },
  "employeeId": { /* populated employee object */ },
  // ... created shift object
}
```

#### PUT /api/bar-shifts/:id
Update bar shift (admin only, requires auth)

#### PUT /api/bar-shifts/:id/confirm
Confirm shift

#### PUT /api/bar-shifts/:id/complete
Complete shift

#### DELETE /api/bar-shifts/:id
Delete bar shift (admin only, requires auth)

#### GET /api/bar-shifts/employee/:employeeId
Get shifts for specific employee

#### GET /api/bar-shifts/stats
Get bar shift statistics (admin only, requires auth)

### Producer Endpoints

#### GET /api/producers
Get all producers
```javascript
// Query parameters:
// ?isActive=true - filter by active status
// ?specialties=recording - filter by specialties
// ?hasStudio=true - filter by studio availability
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "producers": [
    {
      "_id": "...",
      "userId": { /* populated user object */ },
      "name": "Producer Name",
      "email": "producer@example.com",
      "specialties": ["recording", "mixing"],
      "hasStudio": true,
      "rates": {
        "hourlyRate": 50,
        "projectRate": 500
      },
      "isActive": true,
      // ... other producer fields
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 25
}
```

#### GET /api/producers/:id
Get single producer

#### POST /api/producers
Create new producer (admin only, requires auth)
```javascript
// Request
{
  "userId": "userId",
  "name": "Producer Name",
  "email": "producer@example.com",
  "bio": "Experienced producer with 10 years in the industry",
  "specialties": ["recording", "mixing", "mastering"],
  "experienceYears": 10,
  "hasStudio": true,
  "rates": {
    "hourlyRate": 50,
    "projectRate": 500
  }
}

// Response
{
  "_id": "...",
  "userId": { /* populated user object */ },
  "name": "Producer Name",
  // ... created producer object
}
```

#### PUT /api/producers/:id
Update producer (admin or own profile)

#### DELETE /api/producers/:id
Delete producer (admin only, requires auth)

#### GET /api/producers/stats
Get producer statistics (admin only, requires auth)

### Producer Slot Endpoints

#### GET /api/producer-slots
Get all producer slots
```javascript
// Query parameters:
// ?status=scheduled - filter by status
// ?producerId=producerId - filter by producer
// ?sessionType=recording - filter by session type
// ?dateFrom=2024-01-01 - filter by date range
// ?dateTo=2024-12-31
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "slots": [
    {
      "_id": "...",
      "producerId": { /* populated producer object */ },
      "title": "Recording Session",
      "date": "2024-01-01T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "14:00",
      "sessionType": "recording",
      "status": "scheduled",
      "totalCost": 200,
      // ... other slot fields
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 30
}
```

#### GET /api/producer-slots/:id
Get single producer slot

#### POST /api/producer-slots
Create new producer slot (admin only, requires auth)
```javascript
// Request
{
  "producerId": "producerId",
  "title": "Recording Session",
  "description": "Album recording session",
  "date": "2024-01-01T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "14:00",
  "sessionType": "recording",
  "rate": 50,
  "client": {
    "name": "Client Name",
    "projectDetails": "Album recording"
  }
}

// Response
{
  "_id": "...",
  "producerId": { /* populated producer object */ },
  "title": "Recording Session",
  // ... created slot object
}
```

#### PUT /api/producer-slots/:id
Update producer slot (admin or associated producer)

#### PUT /api/producer-slots/:id/confirm
Confirm slot

#### PUT /api/producer-slots/:id/complete
Complete slot

#### DELETE /api/producer-slots/:id
Delete producer slot (admin only, requires auth)

#### GET /api/producer-slots/producer/:producerId
Get slots for specific producer

#### GET /api/producer-slots/stats
Get producer slot statistics (admin only, requires auth)

### Comment Endpoints

#### GET /api/comments
Get all comments (admin only, requires auth)
```javascript
// Query parameters:
// ?entityType=gig - filter by entity type
// ?entityId=entityId - filter by entity
// ?isInternal=true - filter by internal status
// ?authorId=userId - filter by author
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "comments": [
    {
      "_id": "...",
      "content": "Comment text",
      "authorId": { /* populated user object */ },
      "entityType": "gig",
      "entityId": "entityId",
      "isInternal": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      // ... other comment fields
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 25
}
```

#### GET /api/comments/:id
Get single comment

#### POST /api/comments
Create new comment (authenticated users)
```javascript
// Request
{
  "content": "Comment text",
  "entityType": "gig",
  "entityId": "entityId",
  "isInternal": false,
  "tags": ["important", "urgent"]
}

// Response
{
  "_id": "...",
  "content": "Comment text",
  "authorId": { /* populated user object */ },
  // ... created comment object
}
```

#### PUT /api/comments/:id
Update comment (admin or author)

#### DELETE /api/comments/:id
Delete comment (admin or author)

#### GET /api/comments/entity/:entityType/:entityId
Get comments for specific entity
```javascript
// Response
{
  "comments": [ /* array of comments */ ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 5
}
```

#### GET /api/comments/stats
Get comment statistics (admin only, requires auth)

### Message Endpoints

#### GET /api/messages
Get user's messages (inbox, authenticated users)
```javascript
// Query parameters:
// ?isRead=false - filter by read status
// ?priority=high - filter by priority
// ?limit=10 - limit results
// ?page=1 - pagination

// Response
{
  "messages": [
    {
      "_id": "...",
      "senderId": { /* populated user object */ },
      "recipientId": { /* populated user object */ },
      "subject": "Message Subject",
      "content": "Message content",
      "isRead": false,
      "priority": "normal",
      "createdAt": "2024-01-01T00:00:00.000Z",
      // ... other message fields
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 30
}
```

#### GET /api/messages/sent
Get user's sent messages (authenticated users)

#### GET /api/messages/:id
Get single message (sender or recipient)

#### POST /api/messages
Send new message (authenticated users)
```javascript
// Request
{
  "recipientId": "recipientUserId",
  "subject": "Message Subject",
  "content": "Message content",
  "priority": "normal"
}

// Response
{
  "_id": "...",
  "senderId": { /* populated user object */ },
  "recipientId": { /* populated user object */ },
  // ... created message object
}
```

#### PUT /api/messages/:id
Update message (admin only, requires auth)

#### PUT /api/messages/:id/read
Mark message as read (recipient only)

#### DELETE /api/messages/:id
Delete message (sender, recipient, or admin)

#### GET /api/messages/thread/:threadId
Get messages in a thread

#### GET /api/messages/stats
Get message statistics (admin only, requires auth)

---

## Error Responses

All endpoints return consistent error responses:

```javascript
// 400 Bad Request
{
  "message": "Validation error message"
}

// 401 Unauthorized
{
  "message": "Authentication required"
}

// 403 Forbidden
{
  "message": "Insufficient permissions"
}

// 404 Not Found
{
  "message": "Resource not found"
}

// 500 Internal Server Error
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse. Standard limits:
- 100 requests per minute for authenticated users
- 50 requests per minute for unauthenticated requests

---

## File Upload

File uploads use multipart/form-data and are stored in Vercel Blob storage. Supported formats:
- Images: JPG, JPEG, PNG, GIF, WebP
- Maximum file size: 10MB

---

## Authentication Flow

1. Register (`POST /api/auth/register`) or login (`POST /api/auth/login`)
2. Receive **access token** (1 hour) and **refresh token** (30 days)
3. Include access token in `Authorization: Bearer <token>` header for protected endpoints
4. When access token expires, call `POST /api/auth/refresh` with the refresh token to get a new pair (refresh tokens rotate on each use)
5. Apple Sign-In users: `email` field may be `null` — design UI to handle this gracefully

### Token Storage (mobile)
- Store both `token` (access) and `refreshToken` in secure storage (e.g. iOS Keychain / Android Keystore)
- Proactively refresh before expiry; handle 401 responses by attempting one refresh then re-trying the original request

## Serverless Environment

### Database Connection
- **Auto-connect middleware**: Automatically ensures MongoDB connection for database-dependent routes
- **Connection optimization**: Configured for Vercel serverless environment with reduced timeouts
- **Connection pooling**: Optimized for serverless with single connection per function

### Timeout Handling
- **Function timeout**: 30 seconds maximum execution time
- **Database timeouts**: 
  - Server selection: 3 seconds
  - Socket timeout: 30 seconds
  - Connect timeout: 3 seconds
- **Request timeouts**: 25 seconds for artist creation operations

## Notification System

### Push Notifications
The API supports push notifications for:
- **Show Alerts**: Notifications sent 5 minutes before shows start for subscribed artists
- **Featured Show Updates**: When new shows are featured
- **Artist Announcements**: Important updates from artists

### Notification Timing
- **Show Reminders**: Sent exactly 5 minutes before show start time
- **CRON Schedule**: Checked every 5 minutes via Vercel CRON jobs
- **Timezone**: All times handled in Europe/London timezone

### Device Token Registration
Register device tokens via `/api/users/device-token` to receive notifications.

### Notification Preferences
Users can configure notification preferences:
```javascript
{
  "notificationPreferences": {
    "artistAlerts": true,    // Show starting notifications
    "eventAlerts": true      // Event and announcement notifications
  }
}
```

## Webhooks & Real-time Features

The API supports push notifications for:
- New shows from subscribed artists
- Featured show updates
- Artist announcements

Register device tokens via `/api/users/device-token` to receive notifications.

---

## Health Check Endpoints

> These endpoints are public (no auth required) and intended for uptime monitoring and debugging.

#### GET /api/health
Overall API and database health check
```javascript
// Response (healthy — 200)
{
  "status": "healthy",
  "timestamp": "2026-05-27T09:00:00.000Z",
  "message": "API is running",
  "version": "1.0.0",
  "database": "connected",
  "databaseState": 1,   // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  "environment": {
    "hasJwtSecret": true,
    "hasMongoUri": true,
    "nodeEnv": "production"
  }
}

// Response (unhealthy — 503)
{
  "status": "unhealthy",
  "message": "API is running but database is disconnected",
  "database": "disconnected",
  "databaseState": 0
}
```

#### GET /api/health/database
Detailed database connection diagnostics
```javascript
// Response
{
  "success": true,
  "database": { /* detailed connection health object */ },
  "timestamp": "2026-05-27T09:00:00.000Z"
}
```

#### POST /api/health/database/reconnect
Force a database reconnection (for use when the connection has dropped in a serverless context)
```javascript
// Response
{
  "success": true,
  "message": "Database reconnection initiated"
}
```

---

## Artist Upload Token Endpoints

> Used by the agency portal (`agency.voicesradio.co.uk`) to generate one-time upload links for artists.

#### POST /api/tokens
Create a one-time artist upload token (public)
```javascript
// Request
{
  "email": "artist@example.com",
  "artistName": "Artist Name"
}

// Response
{
  "token": "unique_upload_token",
  "uploadUrl": "https://agency.voicesradio.co.uk/artist-upload/<token>",
  "expiresAt": "2026-05-28T09:00:00.000Z"
}
```

#### GET /api/tokens/:token
Validate an upload token (public)
```javascript
// Response (valid)
{
  "valid": true,
  "email": "artist@example.com",
  "artistName": "Artist Name",
  "expiresAt": "2026-05-28T09:00:00.000Z"
}
```

#### PUT /api/tokens/:token/use
Mark an upload token as used after the artist completes their upload (public)
```javascript
// Response
{
  "message": "Token marked as used"
}
```

#### DELETE /api/tokens/cleanup
Delete all expired tokens (admin only, requires auth)

#### GET /api/tokens/stats
Get upload token statistics (admin only, requires auth)

#### GET /api/tokens
List all upload tokens — token values redacted (admin only, requires auth)
