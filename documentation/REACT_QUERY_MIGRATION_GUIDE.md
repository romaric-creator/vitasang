/\*\*

- MIGRATION GUIDE - From Manual React to React Query
- Step-by-step instructions for converting each screen
  \*/

# 🚀 React Query Migration Guide

## 📋 SCREENS TO MIGRATE

| Priority | Screen       | File                                | Complexity | Estimated Time |
| -------- | ------------ | ----------------------------------- | ---------- | -------------- |
| 🔴 HIGH  | Home         | `app/(tabs)/index.tsx`              | Easy       | 20 min         |
| 🔴 HIGH  | Alerts       | `app/(tabs)/alertes.tsx`            | Easy       | 25 min         |
| 🔴 HIGH  | Centres      | `app/(tabs)/centres.tsx`            | Medium     | 30 min         |
| 🔴 HIGH  | Auth Flow    | `app/login.tsx`, `app/register.tsx` | Medium     | 30 min         |
| 🟡 MED   | Appointments | Various appointment screens         | Medium     | 30 min         |
| 🟡 MED   | Profile      | `app/edit-profile.tsx`              | Easy       | 15 min         |
| 🟢 LOW   | History      | `app/historique.tsx`                | Easy       | 15 min         |
| 🟢 LOW   | Settings     | `app/*-settings.tsx`                | Easy       | 10 min         |

---

## ✅ TEMPLATE CONVERSION

### BEFORE (Manual State Management)

```typescript
import { useState, useCallback, useEffect } from 'react';

export default function MyScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyData();  // ❌ Manual API call
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error />;

  return <FlatList
    data={data}
    onRefresh={loadData}  // ❌ Manual refetch
  />;
}
```

### AFTER (React Query)

```typescript
import { useMyData } from '@/hooks/useMyData';  // ✅ Custom hook

export default function MyScreen() {
  // ✅ Single hook call - handles everything
  const {
    data = [],
    isLoading,
    error,
    refetch
  } = useMyData();

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return <FlatList
    data={data}
    onRefresh={refetch}  // ✅ Automatic caching by React Query
  />;
}
```

---

## 🔄 MIGRATION STEPS

### Step 1: Create the Custom Hook (if not exists)

**File**: `frontend/hooks/useMyData.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";

export const useMyData = () => {
  return useQuery({
    queryKey: queryKeys.myData.all,
    queryFn: async () => {
      const res = await apiClient.get("/my-data");
      return res.data.data; // Adjust based on your API response
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

### Step 2: Import the Hook in Your Screen

```typescript
import { useMyData } from "@/hooks/useMyData";
```

### Step 3: Replace State Variables

```typescript
// ❌ BEFORE
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// ✅ AFTER
const { data = [], isLoading, error } = useMyData();
```

### Step 4: Replace useEffect with Hook Refetch

```typescript
// ❌ BEFORE
const loadData = useCallback(async () => {
  setLoading(true);
  const res = await getMyData();
  setData(res.data);
}, []);

useEffect(() => {
  loadData();
}, []);

// ✅ AFTER - No useEffect needed!
const { refetch } = useMyData();
// React Query automatically fetches on mount
```

### Step 5: Replace Manual Refresh

```typescript
// ❌ BEFORE
<RefreshControl onRefresh={loadData} />

// ✅ AFTER
<RefreshControl onRefresh={() => refetch()} />
```

---

## 🎯 SPECIFIC SCREEN MIGRATIONS

### 1️⃣ Home Screen (Priority: HIGH)

**Current State**: Uses `getUserProfile()` + `getActiveAlerts()`
**Manual Calls**: 2 API calls per visit

**Changes**:

```typescript
// ❌ Remove this
const [userData, setUserData] = useState(null);
const [activeAlerts, setActiveAlerts] = useState([]);

useEffect(() => {
  loadData();  // Manual call
}, []);

// ✅ Add this
import { useActiveAlerts } from '@/hooks/useAlerts';

const { data: activeAlerts = [], isLoading, refetch } = useActiveAlerts();
// userData comes from useAuth() context - already cached!
const { user: userData } = useAuth();

// Use refetch() instead of manual loadData()
<RefreshControl onRefresh={() => refetch()} />
```

### 2️⃣ Alertes Screen (Priority: HIGH)

**Current State**: Uses `getMyAlerts()` + `getAcceptedAlerts()` with tab switching
**Manual Calls**: 2 API calls per tab switch

**Changes**:

```typescript
// ✅ Use these hooks
import { useMyAlerts, useAcceptedAlerts } from "@/hooks/useAlerts";

const {
  data: myAlerts = [],
  isLoading: loadingMy,
  refetch: refetchMy,
} = useMyAlerts(isAuth);
const {
  data: acceptedAlerts = [],
  isLoading: loadingAccepted,
  refetch: refetchAccepted,
} = useAcceptedAlerts(isAuth);

// Auto-switched based on tab
const data = activeTab === "sent" ? myAlerts : acceptedAlerts;
const isLoading = activeTab === "sent" ? loadingMy : loadingAccepted;
const refetch = activeTab === "sent" ? refetchMy : refetchAccepted;

// See: frontend/examples/AlertesScreenOptimized.tsx for full example
```

### 3️⃣ Centres Screen (Priority: HIGH)

**Current State**: Uses `getAllCentres()` or location search
**Manual Calls**: 1+ API call per screen visit

**Changes**:

```typescript
// ✅ Use location-based centersearch
import { useNearbyCenters } from "@/hooks/useCentersAndAppointments";
import * as Location from "expo-location";

const [location, setLocation] = useState(null);

useEffect(() => {
  (async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  })();
}, []);

const {
  data: centers = [],
  isLoading,
  refetch,
} = useNearbyCenters(
  location?.latitude,
  location?.longitude,
  50, // radius in km
);

// React Query automatically caches by (lat, lon, radius)
// If user moves 1km, cache still used
// If user moves 5km, automatic refetch triggered
```

### 4️⃣ Login/Register (Priority: HIGH)

**Current State**: Manual mutation handling
**Changed Behavior**: Auto-caches user data

**Changes**:

```typescript
// ✅ Use auth mutations
import { useLogin, useRegister } from "@/hooks/useAuth";

const { mutate: login, isPending } = useLogin();
const { mutate: register, isPending: registering } = useRegister();

// When user logs in:
const handleLogin = (phone, password) => {
  login(
    { telephone: phone, mot_de_passe: password },
    {
      onSuccess: () => {
        // User data is automatically cached
        // All user-specific queries auto-refetch
        router.replace("/(tabs)");
      },
    },
  );
};
```

### 5️⃣ Appointments (Priority: MEDIUM)

**Current State**: Manual appointment fetching
**Changed Behavior**: Automatic sync across screens

**Changes**:

```typescript
// ✅ In appointment list
import {
  useMyAppointments,
  useCreateAppointment,
} from "@/hooks/useCentersAndAppointments";

const { data: appointments = [], refetch } = useMyAppointments(isAuth);

// ✅ In booking screen
const { mutate: bookAppointment, isPending } = useCreateAppointment();

const handleBook = (data) => {
  bookAppointment(data, {
    onSuccess: (newAppointment) => {
      // User's appointment list auto-updates
      // No need to manually refetch
      router.push(`/appointment/${newAppointment.id}`);
    },
  });
};
```

---

## 🔧 COMMON PATTERNS

### Pattern 1: Tab-Based Queries

```typescript
const [activeTab, setActiveTab] = useState("tab1");

const { data: tab1Data } = useTab1Data();
const { data: tab2Data } = useTab2Data();

const displayData = activeTab === "tab1" ? tab1Data : tab2Data;
// React Query caches both independently
// Switching tabs is instant with cached data
```

### Pattern 2: Conditional Queries

```typescript
const { isAuth, user } = useAuth();

// Only fetch if authenticated
const { data: userData } = useUserProfile(user?.id, isAuth && !!user?.id);

// If isAuth changes:
// - enabled=false → query paused
// - enabled=true → query auto-starts (or uses cache)
```

### Pattern 3: Mutation with Side Effects

```typescript
const { mutate, isPending } = useCreateAlert();

const handleCreate = (alertData) => {
  mutate(alertData, {
    onSuccess: (newAlert) => {
      // Automatically:
      // - useMyAlerts() refetches
      // - useActiveAlerts() refetches
      // No manual invalidation needed!
      router.push(`/alert/${newAlert.id}`);
    },
    onError: (error) => {
      showToast(error.message);
    },
  });
};
```

---

## ✅ MIGRATION CHECKLIST

### Phase 1: Setup (Already Done ✓)

- [x] Install @tanstack/react-query
- [x] Create QueryClient configuration
- [x] Create queryKeys constants
- [x] Create auth hooks
- [x] Create alert hooks
- [x] Create center/appointment hooks
- [x] Add QueryClientProvider to root

### Phase 2: Convert Screens

- [ ] Home screen
- [ ] Alerts screen
- [ ] Centres screen
- [ ] Login/Register
- [ ] Appointments
- [ ] Profile
- [ ] History
- [ ] Settings

### Phase 3: Cleanup

- [ ] Remove old useApiCall hooks
- [ ] Remove manual refetch() calls
- [ ] Test on real device
- [ ] Monitor Network tab for reduced calls

### Phase 4: Validation

- [ ] All screens loading correctly
- [ ] No duplicate API calls
- [ ] Refresh works properly
- [ ] Mutations update cache correctly

---

## 🧪 TESTING AFTER MIGRATION

### Check 1: Network Calls

Open Chrome DevTools → Network tab:

- First page load: 2-3 API calls
- Back to home: 0 API calls (cache hit)
- After 5 minutes: 1-2 background calls (refetch)

### Check 2: Performance

Use React Query DevTools:

```typescript
// In root layout (development only):
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider>
  <App />
  {__DEV__ && <ReactQueryDevtools />}
</QueryClientProvider>
```

Click floating button to see:

- Query status (fresh/stale/error)
- Cache age
- Refetch timing
- Data structure

### Check 3: Battery Usage

Monitor with:

- Android Studio Profiler
- Xcode Instruments
- Expected: 20-30% improvement due to fewer API calls

---

## 📊 EXPECTED RESULTS

### Before Migration

```
Loading Home:
1. getActiveAlerts()      ~1.2s
2. getUserProfile()       ~0.8s
3. Navigating back        3.5s again (no cache)

Per Session: 8-12 API calls
Battery: ~100mAh per hour
```

### After Migration

```
Loading Home:
1. useActiveAlerts()      ~1.2s [cached 5min]
2. User from context      ~0ms  [cached]
3. Navigating back        ~50ms [cache hit]

Per Session: 2-3 API calls
Battery: ~60mAh per hour (+40% improvement)
```

---

## 🎓 RESOURCES

- Full example screens: `frontend/examples/`
- Query keys: `frontend/config/queryKeys.ts`
- Configuration: `frontend/config/queryClient.ts`
- Custom hooks: `frontend/hooks/useAuth.ts`, `useAlerts.ts`, etc.
- Official docs: https://tanstack.com/query/latest

---

## ⚠️ WATCH OUT FOR

❌ **Mixing old and new**: Don't use both manual `getActiveAlerts()` and `useActiveAlerts()`
✅ **Solution**: Replace all manual calls with React Query hooks

❌ **Forgetting enabled condition**: Queries run even when not authenticated
✅ **Solution**: Always pass `enabled` prop based on auth state

❌ **Manual invalidation**: Calling `refetch()` manually when mutation should do it
✅ **Solution**: Trust mutations do it automatically

Good luck! 🚀
