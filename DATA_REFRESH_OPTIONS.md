# Data Refresh Options for Monitor Pages

## Current Implementation ✅

The monitor pages use **Inertia's `router.reload()`** which:
- Refreshes only specified data props
- Preserves page state and scroll position
- No full page reload
- No font/asset re-downloading
- Smooth updates every 2 seconds

```javascript
router.reload({ 
    only: ['match', 'court'],
    preserveScroll: true,
    preserveState: true 
});
```

## Alternative Options

### Option 1: Current (Inertia Reload) ✅ RECOMMENDED
**What we're using now**

**Pros:**
- ✅ Automatic - works with Inertia framework
- ✅ Type-safe - uses existing controller methods
- ✅ Simple - one line of code
- ✅ Consistent with rest of app
- ✅ Handles errors automatically
- ✅ CSRF protection built-in

**Cons:**
- ❌ Slightly less efficient than raw API calls
- ❌ Always makes server request (no caching)

**Use when:** You want simple, reliable, framework-integrated updates

---

### Option 2: Axios Polling
**Manual API calls**

```javascript
import axios from 'axios';

useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const response = await axios.get(`/api/courts/${courtId}/match`);
            setMatch(response.data);
        } catch (error) {
            console.error('Failed to fetch match data', error);
        }
    }, 2000);
    return () => clearInterval(interval);
}, [courtId]);
```

**Pros:**
- ✅ More control over request/response
- ✅ Can add custom caching logic
- ✅ Can handle partial updates
- ✅ Slightly faster (no Inertia overhead)

**Cons:**
- ❌ Need to create separate API endpoints
- ❌ Need to manually handle errors
- ❌ Need to manually manage state
- ❌ Need to handle CSRF tokens
- ❌ More code to maintain

**Use when:** You need maximum control and have complex caching needs

---

### Option 3: WebSockets / Laravel Echo
**Real-time push updates**

```javascript
import Echo from 'laravel-echo';

useEffect(() => {
    window.Echo.channel(`court.${courtId}`)
        .listen('MatchUpdated', (e) => {
            setMatch(e.match);
        });
    
    return () => {
        window.Echo.leaveChannel(`court.${courtId}`);
    };
}, [courtId]);
```

**Pros:**
- ✅ Instant updates (no polling delay)
- ✅ Server pushes only when data changes
- ✅ More efficient (no unnecessary requests)
- ✅ Scalable for many concurrent users
- ✅ Real-time experience

**Cons:**
- ❌ Requires WebSocket server setup
- ❌ More complex infrastructure
- ❌ Need Redis/Pusher for broadcasting
- ❌ Harder to debug
- ❌ Requires significant backend changes

**Use when:** You need true real-time updates and have many concurrent users

---

### Option 4: Server-Sent Events (SSE)
**One-way server push**

```javascript
useEffect(() => {
    const eventSource = new EventSource(`/courts/${courtId}/stream`);
    
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMatch(data.match);
    };
    
    return () => eventSource.close();
}, [courtId]);
```

**Pros:**
- ✅ Server pushes updates only when needed
- ✅ Simpler than WebSockets
- ✅ Built into browsers
- ✅ Auto-reconnects on disconnect
- ✅ Good for one-way data flow

**Cons:**
- ❌ One-way only (server → client)
- ❌ Limited browser support (IE/old browsers)
- ❌ Requires server implementation
- ❌ Connection limits per domain

**Use when:** You want push updates but don't need client → server communication

---

## Performance Comparison

| Method | Request Size | Latency | Server Load | Complexity |
|--------|--------------|---------|-------------|------------|
| **Inertia Reload** | ~5 KB | Low | Low | ⭐ Simple |
| Axios Polling | ~3 KB | Very Low | Low | ⭐⭐ Medium |
| WebSockets | ~0.5 KB | Instant | Medium | ⭐⭐⭐ Complex |
| SSE | ~1 KB | Near-instant | Medium | ⭐⭐ Medium |

## Our Recommendation: Stay with Inertia Reload ✅

For your use case, **Inertia's `router.reload()`** is the best choice because:

1. **Simple & Reliable**
   - One line of code
   - Works out of the box
   - No additional setup needed

2. **Good Performance**
   - Only 5 KB per request
   - 2-second interval is fine for sports scores
   - No noticeable lag

3. **Maintains Consistency**
   - Uses same authentication/authorization
   - Same error handling
   - Same data structure
   - Same middleware

4. **Easy to Maintain**
   - No extra API endpoints
   - No separate WebSocket server
   - No additional dependencies

## When to Consider Alternatives

### Switch to WebSockets if:
- ✅ You have 50+ concurrent viewers per court
- ✅ You need instant updates (< 100ms)
- ✅ You're willing to set up Redis/Pusher
- ✅ You need two-way communication

### Switch to Axios if:
- ✅ You need custom caching logic
- ✅ You want to reduce requests during inactivity
- ✅ You need to batch multiple API calls

## Optimization Without Changing Method

You can optimize the current Inertia approach:

### 1. Conditional Refresh
Only refresh when match is active:

```javascript
useEffect(() => {
    // Don't poll if match isn't in progress
    if (match?.status !== 'in_progress' && match?.status !== 'warmup') {
        return;
    }
    
    const interval = setInterval(() => {
        router.reload({ only: ['match'], preserveScroll: true, preserveState: true });
    }, 2000);
    return () => clearInterval(interval);
}, [match?.status]);
```

### 2. Adaptive Polling
Slow down when nothing is happening:

```javascript
const getRefreshInterval = (match) => {
    if (match.status === 'in_progress') return 2000;  // 2 seconds during play
    if (match.status === 'warmup') return 5000;       // 5 seconds during warmup
    return 10000;                                     // 10 seconds otherwise
};

useEffect(() => {
    const interval = setInterval(() => {
        router.reload({ only: ['match'], preserveScroll: true, preserveState: true });
    }, getRefreshInterval(match));
    return () => clearInterval(interval);
}, [match?.status]);
```

### 3. Smart Caching
Only update if data actually changed:

```javascript
const [lastUpdate, setLastUpdate] = useState(null);

useEffect(() => {
    const interval = setInterval(() => {
        router.reload({ 
            only: ['match'],
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const newMatch = page.props.match;
                // Only trigger re-render if score changed
                if (JSON.stringify(newMatch) !== JSON.stringify(lastUpdate)) {
                    setLastUpdate(newMatch);
                }
            }
        });
    }, 2000);
    return () => clearInterval(interval);
}, []);
```

## Testing Data Refresh

### Check Network Activity
```bash
# Open DevTools → Network tab
# Filter: XHR
# Should see requests every 2 seconds with ~5KB size
```

### Check Console
```javascript
// Add logging to see refresh activity
router.reload({ 
    only: ['match'],
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => console.log('Match data refreshed'),
    onError: () => console.error('Failed to refresh')
});
```

### Monitor Performance
```javascript
// Track refresh performance
let refreshCount = 0;
setInterval(() => {
    console.log(`Refreshes per minute: ${refreshCount * 30}`);
    refreshCount = 0;
}, 60000);
```

## Summary

✅ **Current implementation is optimal for your needs:**
- Uses Inertia `router.reload()`
- Refreshes data only (not full page)
- Every 2 seconds
- ~5 KB per request
- No flickering
- Simple and reliable

❌ **Don't change unless:**
- You need < 100ms updates (use WebSockets)
- You have 100+ concurrent users per court (use WebSockets)
- You have very specific caching needs (use Axios)

Your current setup is perfect! 🎉

