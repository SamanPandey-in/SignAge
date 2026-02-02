# Phase 2: API Layer Unification

## Overview

Phase 2 consolidates all API calls into a unified, production-grade API layer with proper error handling, request deduplication, loading state management, and response formatting.

## Architecture

```
Components
    ↓
useAPI / useAPIWithRedux Hooks
    ↓
apiService (Unified Interface)
    ↓
apiClient (Axios with Interceptors)
    ↓
Firebase Auth Token Injection
    ↓
Backend API
```

## Core Components

### 1. **apiService** (`src/services/apiService.js`)

Unified API service with all endpoint methods.

**Features:**
- Request deduplication (prevents duplicate in-flight requests)
- Automatic auth token injection from Firebase
- Centralized error handling with error types
- Automatic retry logic for network errors (max 2 retries with exponential backoff)
- Normalized response format
- Request queue tracking

**Error Types:**
```javascript
API_ERROR_TYPES = {
  NETWORK_ERROR,      // No internet / connection failed
  AUTH_ERROR,         // 401 Unauthorized
  VALIDATION_ERROR,   // 400 Bad Request
  NOT_FOUND,          // 404 Not Found
  SERVER_ERROR,       // 500 Internal Server Error
  TIMEOUT_ERROR,      // Request timeout
  UNKNOWN_ERROR,      // Other errors
}
```

**Response Format:**
```javascript
{
  success: boolean,
  data: any,           // Response data (null if error)
  error: string,       // Error message (null if success)
  errorType: string,   // Error type from API_ERROR_TYPES
  timestamp: string,   // ISO timestamp
}
```

**Usage:**
```javascript
import apiService from '@services/apiService';

const result = await apiService.getAllLessons();
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error, result.errorType);
}
```

### 2. **useAPI Hook** (`src/hooks/useAPI.js`)

Simple hook for API calls with basic loading state management.

**Features:**
- Automatic loading state
- Error state management
- Integrated error notifications
- Automatic retry for network errors
- Success/error callbacks
- No Redux dependency

**Usage:**
```javascript
import { useAPI } from '@hooks/useAPI';

function MyComponent() {
  const { execute, loading, error } = useAPI(
    () => apiService.getAllLessons(),
    {
      showNotification: true,
      successMessage: 'Lessons loaded!',
      onSuccess: (data) => console.log(data),
      onError: (error, errorType) => console.error(error),
    }
  );

  return (
    <>
      <button onClick={execute} disabled={loading}>
        {loading ? 'Loading...' : 'Load Lessons'}
      </button>
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

### 3. **useAPIWithRedux Hook** (`src/hooks/useAPIWithRedux.js`)

Advanced hook integrating API calls with Redux state.

**Features:**
- Redux-backed loading/error states
- Global endpoint state tracking
- Request queuing at Redux level
- Cache metadata tracking
- Persistent state across re-renders
- Better for complex scenarios

**Usage:**
```javascript
import { useAPIWithRedux } from '@hooks/useAPIWithRedux';

function MyComponent() {
  const { execute, loading, error, metadata } = useAPIWithRedux(
    '/lessons',  // endpoint identifier
    () => apiService.getAllLessons(),
    {
      showNotification: true,
      autoRetry: true,
      maxRetries: 2,
      successMessage: 'Lessons loaded!',
    }
  );

  useEffect(() => {
    execute();
  }, [execute]);

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      {/* content */}
    </div>
  );
}
```

### 4. **apiSlice** (`src/store/slices/apiSlice.js`)

Redux slice for managing API states globally.

**State Structure:**
```javascript
{
  loadingEndpoints: {},    // { '/lessons': true, '/progress': false }
  isLoading: false,        // Global loading flag
  errors: {},              // { '/lessons': { message, type, timestamp } }
  requestMetadata: {},     // { '/lessons': { retries, lastAttempt } }
  cacheMetadata: {},       // { '/lessons': { timestamp, ttl } }
}
```

**Redux Selectors:**
```javascript
selectEndpointLoading(state, endpoint)    // Get endpoint loading state
selectIsLoading(state)                    // Get global loading state
selectEndpointError(state, endpoint)      // Get endpoint error
selectAllErrors(state)                    // Get all errors
selectRequestMetadata(state, endpoint)    // Get request metadata
selectCacheMetadata(state, endpoint)      // Get cache metadata
```

## API Methods

All methods in `apiService` follow the same pattern:

### Lessons
```javascript
await apiService.getAllLessons()           // GET /lessons
await apiService.getLessonById(lessonId)   // GET /lessons/:id
await apiService.completeLesson(id, score) // POST /lessons/:id/complete
```

### Progress
```javascript
await apiService.getProgress()             // GET /progress
await apiService.updateProgress(data)      // POST /progress/update
```

### Streak
```javascript
await apiService.getStreak()               // GET /streak
await apiService.updateStreak()            // POST /streak/update
```

### ML
```javascript
await apiService.predictSign(frame, lessonId)  // POST /ml/predict (multipart/form-data)
```

### Utility
```javascript
await apiService.healthCheck()             // GET /health
apiService.clearRequestQueue()             // Clear deduplication queue
apiService.getQueueSize()                  // Get queue size (debugging)
```

## Request Deduplication

When identical requests are made while one is already in-flight, subsequent requests are automatically cancelled:

```javascript
// Only one actual API call made
await Promise.all([
  apiService.getAllLessons(),
  apiService.getAllLessons(),
  apiService.getAllLessons(),
]);
```

The request key is generated from: `METHOD:URL:DATA`

## Error Handling

### Global Error Handling

Errors are categorized by type for different handling strategies:

```javascript
const { execute } = useAPIWithRedux('/lessons', apiService.getAllLessons, {
  onError: (error, errorType) => {
    switch (errorType) {
      case API_ERROR_TYPES.AUTH_ERROR:
        // Redirect to login
        break;
      case API_ERROR_TYPES.NETWORK_ERROR:
        // Show retry button
        break;
      case API_ERROR_TYPES.SERVER_ERROR:
        // Show general error message
        break;
    }
  }
});
```

### Automatic Retry Logic

Network errors are automatically retried up to 2 times with exponential backoff:
- 1st retry: after 1 second
- 2nd retry: after 2 seconds

This can be controlled:
```javascript
const { execute } = useAPIWithRedux('/lessons', apiService.getAllLessons, {
  autoRetry: true,
  maxRetries: 3,
});
```

## Auth Token Injection

Firebase ID tokens are automatically injected into all requests:

```javascript
// This happens automatically in request interceptor:
Authorization: Bearer <firebase-id-token>
```

If user is not authenticated, the header is omitted.

## Cache Management

Cache metadata is stored in Redux for intelligent cache invalidation:

```javascript
// Manual cache invalidation (Phase 3)
dispatch(setCacheMetadata({
  endpoint: '/lessons',
  ttl: 300000,  // 5 minutes
}));

if (!selectCacheMetadata(state, '/lessons').isValid) {
  // Refetch data
}
```

## Interceptors

### Request Interceptor
1. Adds Firebase ID token to Authorization header
2. Prevents duplicate in-flight requests
3. Marks request for tracking

### Response Interceptor
1. Removes request from deduplication queue on success
2. Implements retry logic for network errors
3. Uses exponential backoff for retries

## Migration from Phase 1

Old way (per component):
```javascript
const result = await DatabaseService.getUserData(user.uid);
const result = await DatabaseService.getUserStats(user.uid);
const result = await DatabaseService.getCompletedLessons(user.uid);
```

New way (Phase 2):
```javascript
const result = await apiService.getAllLessons();
const result = await apiService.getProgress();
```

## Integration with Redux

Phase 2 integrates seamlessly with Phase 1:

```
userDataSlice (Redux - Data)
    ↑
useUserData (Hook - Phase 1)
    ↑
apiService (Unified API - Phase 2)
    ↓
apiSlice (Redux - Loading/Error States - Phase 2)
```

## Performance Optimizations

1. **Request Deduplication**: Prevents duplicate network calls
2. **Automatic Retry**: Handles transient network failures
3. **Error Categorization**: Enables smart error recovery
4. **Redux State**: Persists loading states across re-renders
5. **Timeout**: 30-second default timeout for all requests

## Testing

```javascript
// Clear request queue between tests
apiService.clearRequestQueue();

// Check queue size for debugging
console.log(apiService.getQueueSize());

// Health check
const result = await apiService.healthCheck();
```

## Best Practices

1. **Use useAPIWithRedux** for main data fetching (pages)
2. **Use useAPI** for isolated components
3. **Always handle error.errorType** for specific error recovery
4. **Use success/error callbacks** for side effects
5. **Avoid making duplicate requests** (deduplication is automatic, but awareness helps)

## Environment Configuration

Set in `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001
```

## Next Steps (Phase 3)

- Request caching with TTL validation
- Pagination support for list endpoints
- GraphQL layer (optional)
- API versioning strategy
- Rate limiting client-side
