# TanStack Query Implementation

This directory contains the TanStack Query (React Query) setup for efficient data fetching, caching, and state management in the Fakaba mobile app.

## 🚀 Overview

TanStack Query provides powerful data synchronization with automatic caching, background updates, and optimistic UI updates. This replaces the previous AsyncStorage-based caching system with a more robust solution.

## 📁 File Structure

```
lib/query/
├── README.md           # This file
├── queryClient.tsx     # QueryClient configuration and provider
├── useListings.ts      # Hooks for listings queries
└── useFavorites.ts     # Hooks for favorites mutations
```

## ⚙️ Configuration

### Query Client Setup (`queryClient.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // Data fresh for 5 minutes
      gcTime: 10 * 60 * 1000,        // Cache persists for 10 minutes
      retry: 2,                       // Retry failed requests twice
      refetchOnWindowFocus: true,     // Refetch when app foregrounds
      refetchOnReconnect: true,       // Refetch on network reconnect
      refetchOnMount: true,           // Refetch on component mount
    },
  },
});
```

## 🎣 Available Hooks

### Listings Hooks (`useListings.ts`)

#### `useListings()`
Fetches all active listings with automatic caching.

```typescript
const { data: listings, isLoading, error, refetch } = useListings();
```

**Features:**
- ✅ Automatic caching (5 minutes)
- ✅ Background refetching
- ✅ Deduplication (multiple calls = 1 request)
- ✅ Loading and error states

**Example:**
```typescript
function HomeScreen() {
  const { data: listings = [], isLoading } = useListings();
  
  if (isLoading) return <Spinner />;
  
  return (
    <View>
      {listings.map(listing => (
        <ListingCard key={listing.id} item={listing} />
      ))}
    </View>
  );
}
```

#### `useListing(id: string)`
Fetches a single listing by ID.

```typescript
const { data: listing, isLoading } = useListing(listingId);
```

**Features:**
- ✅ Only runs when ID exists
- ✅ Longer cache time (10 minutes)
- ✅ Automatic refetching

#### `useListingsByUser(userId: string)`
Fetches all listings for a specific user.

```typescript
const { data: userListings } = useListingsByUser(userId);
```

#### `useRefetchListings()`
Manually invalidates and refetches listings.

```typescript
const refetchListings = useRefetchListings();

// Later...
refetchListings(); // Forces fresh data
```

#### `usePrefetchListing()`
Prefetches a listing for optimistic navigation.

```typescript
const prefetchListing = usePrefetchListing();

// Prefetch on hover or before navigation
<Link onPress={() => prefetchListing(listing.id)}>
  View Details
</Link>
```

### Favorites Hooks (`useFavorites.ts`)

#### `useFavorites()`
Fetches user's favorite listing IDs.

```typescript
const { data: favorites = [] } = useFavorites();
```

**Features:**
- ✅ Automatically fetches when user is authenticated
- ✅ Returns empty array when user is null
- ✅ Shorter cache time (1 minute)

#### `useAddToFavorites()`
Adds a listing to favorites with optimistic updates.

```typescript
const addToFavorites = useAddToFavorites();

addToFavorites.mutate(listingId, {
  onSuccess: () => console.log('Added to favorites'),
  onError: (error) => console.error('Failed', error),
});
```

**Features:**
- ✅ Optimistic updates (UI updates immediately)
- ✅ Automatic rollback on failure
- ✅ Cache invalidation on success

#### `useRemoveFromFavorites()`
Removes a listing from favorites with optimistic updates.

```typescript
const removeFromFavorites = useRemoveFromFavorites();

removeFromFavorites.mutate(listingId);
```

#### `useToggleFavorite()`
High-level hook for toggling favorite status.

```typescript
const { toggleFavorite, isFavorited, isLoading } = useToggleFavorite();

// Toggle favorite
<Button onPress={() => toggleFavorite(listing.id)}>
  <Heart fill={isFavorited(listing.id) ? 'red' : 'transparent'} />
</Button>
```

**Benefits:**
- ✅ Simple API
- ✅ Checks current favorite status
- ✅ Handles add/remove logic automatically
- ✅ Loading state included

## 🎯 Query Keys

Query keys are used for cache management and invalidation.

```typescript
// Listings keys
listingsKeys.all           // ['listings']
listingsKeys.lists()       // ['listings', 'list']
listingsKeys.detail(id)    // ['listings', 'detail', id]
listingsKeys.byUser(id)    // ['listings', 'user', id]

// Favorites keys
favoritesKeys.all          // ['favorites']
favoritesKeys.user(id)     // ['favorites', userId]
```

## 📊 Cache Flow

### Initial Request
```
Component mounts
     ↓
Check cache
     ↓
No cache exists
     ↓
Fetch from Firestore
     ↓
Save to cache
     ↓
Return data to component
```

### Subsequent Request (within staleTime)
```
Component mounts
     ↓
Check cache
     ↓
Cache exists & fresh
     ↓
Return cached data (instant!)
     ↓
(Background refetch if configured)
```

### After staleTime
```
Component mounts
     ↓
Check cache
     ↓
Cache exists but stale
     ↓
Return stale data (instant!)
     ↓
Fetch fresh data in background
     ↓
Update cache & component
```

## 🔄 Optimistic Updates

Optimistic updates provide instant feedback before server confirmation.

### How it works:
1. User clicks favorite button
2. UI updates immediately (heart turns red)
3. Request sent to Firebase
4. If successful: cache stays updated
5. If failed: UI reverts to previous state

**Example in `useFavorites.ts`:**
```typescript
onMutate: async (listingId) => {
  // Cancel outgoing queries
  await queryClient.cancelQueries({ queryKey: favoritesKeys.user(userId) });
  
  // Save current state
  const previousFavorites = queryClient.getQueryData(favoritesKeys.user(userId));
  
  // Optimistically update
  queryClient.setQueryData(favoritesKeys.user(userId), (old) => 
    [...old, listingId]
  );
  
  // Return context for rollback
  return { previousFavorites };
},
onError: (err, variables, context) => {
  // Rollback on error
  queryClient.setQueryData(favoritesKeys.user(userId), context.previousFavorites);
},
```

## 🎨 Usage Examples

### Basic Listing Display
```typescript
function ListingsPage() {
  const { data: listings = [], isLoading, error } = useListings();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <FlatList
      data={listings}
      renderItem={({ item }) => <ListingCard item={item} />}
    />
  );
}
```

### Pull to Refresh
```typescript
function HomeScreen() {
  const { data: listings = [], refetch } = useListings();
  const { refetch: refetchFavorites } = useFavorites();
  
  const handleRefresh = () => {
    refetch();
    refetchFavorites();
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={handleRefresh} />
      }
    >
      {/* Content */}
    </ScrollView>
  );
}
```

### Favorite Toggle
```typescript
function ListingCard({ listing }) {
  const { toggleFavorite, isFavorited } = useToggleFavorite();
  
  return (
    <Card>
      <Image src={listing.imageUrl} />
      <Button onPress={() => toggleFavorite(listing.id)}>
        <Heart 
          fill={isFavorited(listing.id) ? 'red' : 'transparent'}
          color={isFavorited(listing.id) ? 'red' : 'gray'}
        />
      </Button>
    </Card>
  );
}
```

### Listing Details with Prefetch
```typescript
function ListingsList() {
  const { data: listings = [] } = useListings();
  const prefetchListing = usePrefetchListing();
  
  return (
    <FlatList
      data={listings}
      renderItem={({ item }) => (
        <Link 
          href={`/listings/${item.id}`}
          onMouseEnter={() => prefetchListing(item.id)} // Prefetch on hover
        >
          <ListingCard item={item} />
        </Link>
      )}
    />
  );
}
```

## 🚀 Benefits Over AsyncStorage

### AsyncStorage (Old)
- ❌ Manual cache management
- ❌ Manual expiration logic
- ❌ No background updates
- ❌ No request deduplication
- ❌ Complex loading states
- ❌ Manual error handling
- ❌ No optimistic updates

### TanStack Query (New)
- ✅ Automatic cache management
- ✅ Built-in expiration (staleTime, gcTime)
- ✅ Background refetching
- ✅ Automatic deduplication
- ✅ Built-in loading/error states
- ✅ Automatic error handling
- ✅ Optimistic updates out of the box
- ✅ DevTools for debugging
- ✅ Much less code
- ✅ Better performance

## 🐛 Debugging

### Enable DevTools (development only)

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  {__DEV__ && <ReactQueryDevtools />}
</QueryClientProvider>
```

### Common Issues

**Stale data showing:**
- Check `staleTime` configuration
- Force refetch: `refetch()`
- Invalidate queries: `queryClient.invalidateQueries()`

**Not refetching:**
- Check `refetchOnMount`, `refetchOnWindowFocus` settings
- Ensure query is not disabled
- Check network connectivity

**Cache not persisting:**
- TanStack Query cache is in-memory by default
- For persistent cache, add `@tanstack/react-query-persist-client`

## 📈 Performance Tips

1. **Use appropriate staleTime:** Longer for static data, shorter for dynamic
2. **Prefetch on hover:** Improves perceived performance
3. **Use optimistic updates:** Instant feedback
4. **Set proper gcTime:** Balance memory vs refetch frequency
5. **Enable background refetching:** Keeps data fresh automatically

## 🔮 Future Enhancements

- [ ] Add query persistence with AsyncStorage
- [ ] Implement infinite scroll for listings
- [ ] Add pagination support
- [ ] Create mutation hooks for creating/updating listings
- [ ] Add search/filter queries
- [ ] Implement real-time updates with WebSockets
- [ ] Add offline support with cache fallbacks

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)