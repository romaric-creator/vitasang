# QA Checklist - VitaSang Application

## 🎯 Objectif
Vérifier que toutes les corrections apportées fonctionnent correctement avant déploiement en production.

---

## ✅ SECTION 1: Logging & Monitoring

### Winston Logger Configuration
- [ ] Vérifier que `backend/config/logger.js` existe
- [ ] Confirmer que les logs sont créés dans `backend/logs/`
- [ ] Vérifier existence des fichiers:
  - [ ] `logs/error.log` (erreurs uniquement)
  - [ ] `logs/combined.log` (tous les logs)
- [ ] Tester la rotation journalière des logs
  ```bash
  # Attendre 24h ou simulator avec logrotate
  ```
- [ ] Confirmer format timestamp dans logs (YYYY-MM-DD HH:mm:ss)

### Logger Replacements in Code
- [ ] `backend/controllers/users.controller.js`:
  - [ ] Line ~120: `logger.error` in `addUser()`
  - [ ] Line ~160: `logger.error` in `login()`
  - [ ] Line ~200: `logger.error` in `searchUsers()`
  
- [ ] `backend/controllers/alerts.controller.js`:
  - [ ] Line ~80: `logger.error` in `createAlertAndNotify()`
  - [ ] Line ~150: `logger.error` in `getAlertStatus()`
  - [ ] Line ~200: `logger.error` in `getUserAlerts()`
  - [ ] Line ~250: `logger.error` in `updateAlert()`

**Test Command**:
```bash
# Trigger une erreur et vérifier logs
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Vérifier les logs
tail -f backend/logs/error.log
```

---

## ✅ SECTION 2: Validation Backend (Joi)

### Schema Validation Tests
Run the validation test suite:
```bash
cd backend
npm test -- schemas.test.js
```

**Verify Output**:
- [ ] All 10+ schema tests pass ✅
- [ ] Phone number validation works (+237 6XXXXXXXX or 2XXXXXXXX)
- [ ] Password strength validated
- [ ] Blood type enum enforced (A+, A-, B+, B-, AB+, AB-, O+, O-)
- [ ] Coordinates validation (-90 to 90 latitude, -180 to 180 longitude)

### Middleware Validation
Test each schema endpoint:

#### Register Endpoint
```bash
# Valid request
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+237612345678",
    "mot_de_passe": "SecurePass123",
    "groupe_sanguin": "O+"
  }'
# Expected: 201 Created ✅

# Invalid phone
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "telephone": "invalid",
    "mot_de_passe": "Pass123",
    "groupe_sanguin": "O+"
  }'
# Expected: 400 Bad Request with phone error ✅
```

- [ ] Register validates all required fields
- [ ] Login requires telephone + mot_de_passe
- [ ] Alert creation validates coordinates
- [ ] Search validates radius (1-100km)

---

## ✅ SECTION 3: Validation Frontend (Formik + Yup)

### Login Screen
Navigate to login on iOS/Android device or emulator:
```bash
# Clear cache and rebuild
cd frontend
npm start -- --clear
```

**Validation Tests**:
- [ ] Empty phone field shows "Téléphone requis"
- [ ] Invalid phone format shows error message
- [ ] Empty password shows "Mot de passe requis"
- [ ] Short password (< 6 chars) shows error
- [ ] Form disables submit button until all fields valid
- [ ] Error text color is red (#FF0000)

### Register Screen
Navigate to register screen:
- [ ] All 5 validations work (nom, prenom, phone, password, blood type)
- [ ] Password confirmation matches validated
- [ ] Blood type dropdown enforces selection
- [ ] Can proceed only when all fields valid

### Create Alert Screen
Navigate to create alert:
- [ ] Latitude bounds checked (-90 to 90)
- [ ] Longitude bounds checked (-180 to 180)
- [ ] Radius validation (1-100 km)
- [ ] Urgence selection required
- [ ] Quantity (1-100) enforced

**Validation Console Check**:
```javascript
// In browser DevTools, test Yup schemas:
import { loginValidationSchema } from './frontend/validation/ValidationSchemas';

loginValidationSchema.validate({
  telephone: '+237612345678',
  mot_de_passe: 'TestPass123'
}).then(valid => console.log(valid));
```

---

## ✅ SECTION 4: Error Handling & Components

### LoadingSpinner Component
Test in any screen:
- [ ] Appears when API call starts (loading = true)
- [ ] Has semi-transparent dark background (rgba(0,0,0,0.5))
- [ ] Spinner is centered on screen
- [ ] Size variants work (small/large)
- [ ] Custom colors supported
- [ ] Disappears when loading = false

**Visual Check**:
```typescript
// In a test screen
const [loading, setLoading] = useState(false);

return (
  <>
    <LoadingSpinner visible={loading} size="large" />
    <Button onPress={() => {
      setLoading(true);
      setTimeout(() => setLoading(false), 3000);
    }}>
      Show Loading
    </Button>
  </>
);
```

- [ ] ✅ Spinner appears for 3 seconds

### ErrorAlert Component
Test display of different error types:

```typescript
const [alert, setAlert] = useState({
  visible: false,
  title: '',
  message: '',
  type: 'error' // error | warning | info
});

return (
  <>
    <ErrorAlert
      visible={alert.visible}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      onDismiss={() => setAlert({ ...alert, visible: false })}
      onRetry={() => console.log('Retry')}
    />
    <Button onPress={() => setAlert({
      visible: true,
      title: 'Error Title',
      message: 'Error message',
      type: 'error'
    })}>
      Show Error
    </Button>
  </>
);
```

**Visual Tests**:
- [ ] Red border (#FF6B6B) for type="error"
- [ ] Amber border (#FFA500) for type="warning"
- [ ] Cyan border (#00CED1) for type="info"
- [ ] Title displays at top
- [ ] Message displays in middle
- [ ] Retry button shown when provided
- [ ] OK button always shown
- [ ] Modal blocks interaction with background

### Error Boundary
Test component error handling:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <BuggyComponent />
</ErrorBoundary>
```

- [ ] Component errors are caught
- [ ] Fallback UI displays
- [ ] No white screen of death
- [ ] User can navigate away

### useApiCall Hook
Test retry mechanism:
```typescript
const { execute, loading, error, reset } = useApiCall();

const testRetry = async () => {
  try {
    await execute(async () => {
      throw new Error('Simulated API failure');
    });
  } catch (e) {
    console.log('Failed after retries');
  }
};
```

- [ ] Hook retries 3 times on failure
- [ ] Exponential backoff timing: 1s, 2s, 4s
- [ ] Timeout after 10 seconds
- [ ] onSuccess callback fired on success
- [ ] onError callback fired on final failure
- [ ] Loading state updates correctly
- [ ] Reset clears error state

---

## ✅ SECTION 5: Environment Configuration

### Backend .env Files
Check that files exist:
- [ ] `backend/.env.example` - Template with placeholders
- [ ] `backend/.env.production` - Production setup notes

**Content Verification**:
```bash
cd backend
grep -E "DB_HOST|JWT_SECRET|LOG_LEVEL" .env.example
# Should output all required variables
```

- [ ] DB_HOST configured
- [ ] DB_USER configured
- [ ] DB_PASSWORD configured (⚠️ not in repo)
- [ ] JWT_SECRET configured (⚠️ strong secret)
- [ ] LOG_LEVEL set (debug for dev, info for prod)
- [ ] CORS_ORIGIN configured
- [ ] RATE_LIMIT settings present

### Frontend .env Files
Check that files exist:
- [ ] `frontend/.env.example` - Template
- [ ] `frontend/.env.production` - Production values

**Content Verification**:
```bash
cd frontend
grep -E "API_BASE_URL|TIMEOUT|LOG_LEVEL" .env.example
```

- [ ] EXPO_PUBLIC_API_BASE_URL configured
- [ ] EXPO_PUBLIC_TIMEOUT set (10000ms)
- [ ] EXPO_PUBLIC_LOG_LEVEL set
- [ ] EXPO_PUBLIC_DEBUG_MODE set to false in production

### Environment Loading
Test that env vars are loaded:
```bash
# Backend
node -e "console.log(process.env.JWT_SECRET)" # Should print value

# Frontend - check in app initialization
console.log(process.env.EXPO_PUBLIC_API_BASE_URL);
```

---

## ✅ SECTION 6: Test Suite Execution

### Backend Tests
```bash
cd backend
npm test
```

**Expected Output**:
```
PASS  __tests__/unit/auth.middleware.test.js
PASS  __tests__/unit/geoHelpers.test.js
PASS  __tests__/unit/validation.test.js
PASS  __tests__/unit/schemas.test.js
PASS  __tests__/unit/rateLimiter.test.js
PASS  __tests__/integration/users.test.js
PASS  __tests__/integration/alerts.test.js
PASS  __tests__/integration/rendezvous.test.js
PASS  __tests__/integration/centres.test.js
PASS  __tests__/integration/auth.error.test.js

Tests: 50+ passed
```

**Checklist**:
- [ ] All tests pass (0 failures)
- [ ] No timeout warnings
- [ ] Coverage report generated
- [ ] All 50+ tests included

### Frontend Tests
```bash
cd frontend
npm test
```

**Expected Output**:
```
PASS  __tests__/hooks/useApiCall.test.ts (10 tests)
PASS  __tests__/components/UI.test.ts (15 tests)

Tests: 25+ passed
```

**Checklist**:
- [ ] Hook tests pass (retry, timeout, callbacks)
- [ ] Component tests pass (LoadingSpinner, ErrorAlert)
- [ ] No React Native warnings
- [ ] Coverage adequate

### Test Coverage Report
```bash
# Backend
cd backend
npm test -- --coverage
# Should show:
# - Statements: > 70%
# - Branches: > 65%  
# - Functions: > 70%
# - Lines: > 70%
```

- [ ] Coverage thresholds met
- [ ] Critical paths covered (auth, validation, errors)
- [ ] No uncovered branches in core logic

---

## ✅ SECTION 7: API Endpoint Testing

### Health Check
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```
- [ ] ✅ Endpoint responds
- [ ] ✅ Status is "ok"
- [ ] ✅ Timestamp present

### Authentication Flow
```bash
# 1. Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "telephone": "+237612345678",
    "mot_de_passe": "TestPass123",
    "groupe_sanguin": "O+"
  }'
# Response: 201, includes token

# 2. Login with same credentials
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+237612345678",
    "mot_de_passe": "TestPass123"
  }'
# Response: 200, includes token

# 3. Use token to access protected endpoint
TOKEN="eyJhbGciOiJIUzI1NiIs..." # From response above
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users
# Response: 200, user data
```

**Checklist**:
- [ ] Register returns 201 + token
- [ ] Login returns 200 + token
- [ ] Protected endpoint requires Authorization header
- [ ] Invalid token returns 401
- [ ] Missing token returns 401

### Validation Error Testing
```bash
# Missing required field
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"nom": "Test"}'
# Expected: 400 with error details
```

- [ ] 400 returned for invalid data
- [ ] Error object includes field names
- [ ] Error messages in French
- [ ] System doesn't crash

### Rate Limiting
```bash
# Make 101 requests in short time
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"telephone":"+237600000000","mot_de_passe":"test"}' &
done
wait

# 100th+ request should return 429
```

- [ ] Rate limit enforced (100 requests / 15 minutes)
- [ ] 429 status code returned
- [ ] Error message indicates rate limit exceeded
- [ ] Counter resets after time window

---

## ✅ SECTION 8: Database

### Connection
```bash
mysql -u vitasang_dev -p vitasang_dev
show tables;
# Should list: utilisateurs, profil_donneur, alerte, rendezvous, etc.
```

- [ ] Database accessible
- [ ] All tables present
- [ ] Data integrity intact

### Migrations
```bash
cd backend
npx sequelize-cli db:migrate:status
# Should show all migrations as "up"
```

- [ ] All migrations completed
- [ ] No pending migrations
- [ ] Schema matches current code

### Seed Data
```bash
npm run seed
# Should populate data
```

- [ ] Centres créated (minimum 5)
- [ ] Test users created
- [ ] No duplicate errors

---

## ✅ SECTION 9: Security Checks

### Password Hashing
```bash
# In database, verify passwords are hashed
mysql> SELECT telephone, mot_de_passe FROM utilisateurs LIMIT 1;
# Password should be: $2a$10$...lS4...aW (bcrypt hash, not plain text)
```

- [ ] Passwords hashed with bcryptjs
- [ ] No plain text passwords in DB
- [ ] Hash starts with `$2a$` (bcrypt indicator)

### JWT Tokens
```bash
# Decode a token (in browser console)
jwt_decode(token);
# Should show exp, iat, userId fields
```

- [ ] Tokens have expiry (2024-01-XX)
- [ ] Tokens contain user ID
- [ ] Tokens signed with JWT_SECRET

### CORS Configuration
```bash
# Test CORS headers
curl -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3000/api/users
```

- [ ] CORS headers present in response
- [ ] Only allowed origins accepted
- [ ] Preflight requests work

### SQL Injection Prevention
```bash
# Try SQL injection in login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "123\"; DROP TABLE utilisateurs; --",
    "mot_de_passe": "test"
  }'
# Should return 400 (validation error), not execute SQL
```

- [ ] Injection attempts rejected
- [ ] Parameterized queries used
- [ ] No raw SQL in user inputs

---

## ✅ SECTION 10: Documentation

### Swagger API Docs
Navigate to: `http://localhost:3000/api-docs`

- [ ] Swagger UI loads without errors
- [ ] All 15+ endpoints listed
- [ ] Can expand each endpoint
- [ ] Request/response schemas shown
- [ ] Try it out works for public endpoints

### Endpoint Documentation Checklist
For each endpoint, verify:

#### POST /api/users/register
- [ ] Description present
- [ ] Request body schema defined
- [ ] All parameters documented
- [ ] 201 response documented
- [ ] 400 validation error documented
- [ ] Example values shown

#### POST /api/users/login
- [ ] Description present
- [ ] Request/response documented
- [ ] 401 error documented
- [ ] 404 not found documented

#### Protected Endpoints
- [ ] Bearer token requirement shown
- [ ] "Security" section indicates BearerAuth
- [ ] 401 Unauthorized response documented

---

## ✅ SECTION 11: Performance

### API Response Times
```bash
time curl http://localhost:3000/api/health
# Real time should be < 100ms
```

- [ ] Health check < 100ms
- [ ] Login < 500ms
- [ ] Search nearby users < 1000ms (with geolocation)

### Database Query Performance
```bash
# In MySQL, check slow query log
tail -f /var/log/mysql/slow.log
```

- [ ] No queries taking > 1 second
- [ ] Indexes used for frequent queries
- [ ] No full table scans

### Frontend Performance
```bash
# Check APK/IPA size
ls -lh frontend/build/*.apk
# Should be < 50MB
```

- [ ] APK < 50MB
- [ ] App launches < 2 seconds
- [ ] List scrolling is smooth (60 FPS)

---

## ✅ SECTION 12: Cross-Platform Testing

### iOS Testing
- [ ] App installs on iPhone/iPad
- [ ] All screens render correctly
- [ ] Forms validation works
- [ ] Navigation functional
- [ ] Camera/location permissions requested
- [ ] Push notifications received

### Android Testing
- [ ] App installs on Android 9+ devices
- [ ] All screens render correctly
- [ ] Tablets supported (landscape mode)
- [ ] Back button navigation works
- [ ] Permissions system works

### Responsive Design
- [ ] Portrait mode: all content visible
- [ ] Landscape mode: layout adapts
- [ ] Small screens (4.7"): readable
- [ ] Large screens (6.9"): good spacing

---

## ✅ SECTION 13: Error Scenarios

### Network Errors
```typescript
// Simulate offline
// In app: disable WiFi/mobile data
```

- [ ] User sees helpful error message
- [ ] Retry button available
- [ ] App doesn't crash

### API Errors
```bash
# Kill backend server mid-request
pkill -f "node index.js"
```

- [ ] Request timeout after 10s
- [ ] Error component displays
- [ ] Retry available
- [ ] User guided to resolution

### Database Errors
```bash
# Stop MySQL service
sudo systemctl stop mysql
```

- [ ] API returns 500 error
- [ ] Error logged to logs/error.log
- [ ] User sees generic error (no DB details)
- [ ] Doesn't expose system info

---

## ✅ SECTION 14: Data Integrity

### Duplicate Prevention
```bash
# Try registering same phone twice
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{...same data as before...}'
# Should return 409 Conflict
```

- [ ] Returns 409 Conflict
- [ ] Error message: "User already exists"
- [ ] No duplicate entries in DB

### Transaction Integrity
```bash
# Create alert with invalid centre ID
# Should fail atomically without partial data
```

- [ ] Alert not created on error
- [ ] Notifications not sent if alert fails
- [ ] Database remains consistent

### Data Validation
```bash
# Check DB values
mysql> SELECT GROUP_CONCAT(groupe_sanguin) 
       FROM utilisateurs GROUP BY groupe_sanguin;
# Should show: A+, A-, B+, B-, AB+, AB-, O+, O-
# No invalid values
```

- [ ] Only valid blood types in DB
- [ ] No negative quantities
- [ ] Coordinates within bounds (-90 to 90, -180 to 180)

---

## 📋 SIGN-OFF

### QA Testing Completed By
- Name: ________________________
- Date: ________________________
- Signature: ________________________

### Issues Found
- [ ] No critical issues
- [ ] Issues: (describe below)

```
Issue #1:
Severity: [Critical | High | Medium | Low]
Description: 
Steps to Reproduce:
Expected: 
Actual:
```

### Approval
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Some tests failed - Needs fixes before production

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: After major changes
