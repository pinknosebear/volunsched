# Setup Guide - Volunteer Scheduling System

This guide will help you get the application running locally.

## Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- PostgreSQL 12+ (optional for production, SQLite used for development by default)

## Backend Setup

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create environment file

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
- `JWT_SECRET_KEY`: Change to a secure random string
- `DATABASE_URL`: For development, the default SQLite will work, or specify PostgreSQL

### 5. Initialize the database

```bash
# Create database tables
python3 -c "from app import create_app; app = create_app(); app.app_context().push()"
```

### 6. (Optional) Create a test coordinator account

```bash
python3 << EOF
from app import create_app, db
from app.models import User, Volunteer

app = create_app()
with app.app_context():
    # Create a test volunteer/coordinator
    vol = Volunteer(name='Test Coordinator', phone='+12125551234')
    db.session.add(vol)
    db.session.flush()

    user = User(username='coordinator', volunteer_id=vol.id, role='coordinator')
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()

    print("Coordinator created: username='coordinator', password='password123'")
EOF
```

### 7. Run the Flask development server

```bash
python3 run.py
```

The API will be available at `http://localhost:5000`

### API Documentation

Key endpoints:
- `POST /api/auth/register` - Register new volunteer
- `POST /api/auth/login` - Login
- `GET /api/shifts` - Get available shifts
- `POST /api/signups` - Sign up for a shift (with validation)
- `POST /api/signups/validate` - Pre-validate signup
- `GET /api/volunteers/:id/stats` - Get volunteer stats
- `GET /api/coordinator/dashboard` - Coordinator overview
- `GET /api/coordinator/shifts/fill-status` - Shift fill status

## Frontend Setup

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
```

The default configuration should work if running backend on `localhost:5000`.

### 4. Run the development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing the Application

### 1. Access the application

Navigate to http://localhost:3000

### 2. Create a volunteer account

- Click "Sign Up"
- Fill in the form with:
  - Username: `testvolunteer`
  - Password: `password123`
  - Name: `Test Volunteer`
  - Phone: `+11234567890` (include country code)
  - Email: `test@example.com`

### 3. Test the volunteer flow

- Log in with your new account
- You should see the Volunteer Dashboard
- Check your current stats (should show 0/2 Kakad, 0/4 Total, 0/2 Thursday)

### 4. Create shifts (coordinator only)

Use the coordinator account created above to log in and create shifts:

```bash
curl -X POST http://localhost:5000/api/shifts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-20",
    "shift_type": "Kakad",
    "capacity": 1
  }'
```

### 5. Test signup validation

The system will:
- ✓ Allow signup if volunteer hasn't exceeded limits
- ✓ Reject if Kakad limit (2) is exceeded
- ✓ Reject if total limit (4) is exceeded
- ✓ Reject if Thursday limit (2) is exceeded
- ✓ Reject if shift is at capacity
- ✓ Show real-time stats updates

## Testing Specific Rules

### Test Kakad Limit (Max 2)

1. Sign up volunteer for Kakad shift 1
2. Sign up same volunteer for Kakad shift 2
3. Attempt signup for Kakad shift 3 → Should fail with "Maximum Kakad signups (2) reached"

### Test Total Limit (Max 4)

1. Sign up for 2 Kakad shifts
2. Sign up for 2 Robes shifts
3. Attempt 5th signup → Should fail with "Maximum total signups (4) reached"

### Test Thursday Limit (Max 2)

1. Create Kakad shift on Thursday Jan 15
2. Create Robes shift on Thursday Jan 15
3. Sign up volunteer for both → Thursday count = 2
4. Create Kakad shift on Thursday Jan 22
5. Attempt signup → Should fail with "Maximum Thursday signups (2) reached"
6. Create Robes shift on Friday Jan 16
7. Sign up volunteer → Should succeed (non-Thursday)

### Test Same-Day Kakad + Robes

1. Create Kakad shift on Jan 20
2. Create Robes shift on Jan 20
3. Sign up volunteer for both → Should both succeed (they don't conflict)

## Twilio Integration (Optional)

To enable WhatsApp notifications:

1. Get Twilio credentials from https://www.twilio.com/console
2. Update `.env` with:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```
3. Restart the Flask server

Without credentials, notifications will be logged to console.

## Database Migrations

When you update models, create a new migration:

```bash
cd backend
flask db migrate -m "Description of changes"
flask db upgrade
```

## Troubleshooting

### Port already in use

Flask uses 5000, React uses 3000. If these ports are in use:

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change Flask port in backend/run.py
```

### CORS errors

Make sure both frontend and backend are running. The frontend proxy in `vite.config.js` should handle `/api` routes.

### Database errors

Delete `volunsched.db` (if using SQLite) and restart:

```bash
rm backend/volunsched.db
python3 run.py
```

### Login issues

Check that the token is being saved. In browser DevTools, go to Application → Local Storage and verify `access_token` is present.

## Next Steps

1. **Production deployment**: Update configs for PostgreSQL, add environment-specific secrets
2. **Additional features**: Substitute finder, automated reminders, reporting
3. **Testing**: Run `pytest tests/` in backend directory
4. **UI polish**: Add Tailwind CSS or Material-UI for better styling

## Support

Refer to:
- Backend docs: See `/backend` README (can be created)
- Frontend docs: See `/frontend` README (can be created)
- Full plan: See `/CLAUDE.md` for architecture overview
- Implementation plan: See `/CLAUDE.md` plans directory
