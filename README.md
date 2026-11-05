# StudioSpace – Backend API

A RESTful backend API for **StudioSpace**, a creative studio booking platform where users can discover studios, list their own creative spaces, and manage studio bookings.

Built with Node.js, Express.js, and MongoDB.

## 🚀 Technologies Used

- **Node.js** – JavaScript runtime environment
- **Express.js** – Backend web framework
- **MongoDB** – NoSQL database
- **JWT (JOSE)** – Authentication token verification
- **Better Auth** – Authentication integration
- **CORS** – Cross-origin resource sharing
- **dotenv** – Environment variable management
- **Nodemon** – Development server auto-restart

## ✨ Core Features

### Studio Management
- Create new studio listings.
- Retrieve all available studios.
- Filter studios by category.
- Retrieve featured studios.
- View individual studio details.
- View studios hosted by the logged-in user.
- Update existing studio information.
- Delete studio listings.
- Validate studio information before saving.

### Booking Management
- Create studio bookings.
- Prevent overlapping bookings for the same studio and date.
- Calculate booking duration and total price automatically.
- View personal bookings.
- View bookings received by studio hosts.
- Cancel pending bookings.
- Confirm pending bookings (host only).
- Track booking status: Pending, Confirmed, and Cancelled.

### Authentication & Security
- Better Auth integration with JWT verification.
- Secure API endpoints.
- Internal API key verification.
- User identity verification.
- Studio ownership verification.
- Request validation and error handling.

## 📁 Project Structure

```text
studiospace-server/
│
├── config/
│   └── db.js
│
├── data/
│   └── studios.js
│
├── middleware/
│   └── verifyAuth.js
│
├── routes/
│   ├── studioRoutes.js
│   └── bookingRoutes.js
│
├── .env
├── .gitignore
├── index.js
├── seed.js
├── package.json
└── package-lock.json
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jewelranadev/studiospace-server.git
```

### 2. Navigate to the Project Directory

```bash
cd studiospace-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:3000

BETTER_AUTH_URL=your_better_auth_base_url

INTERNAL_API_SECRET=your_internal_api_secret
```

**Environment Variables:**

| Variable | Description |
|---|---|
| PORT | Backend server port |
| MONGODB_URI | MongoDB connection string |
| CLIENT_URL | Frontend application URL |
| BETTER_AUTH_URL | Better Auth application URL |
| INTERNAL_API_SECRET | Shared secret for trusted internal API requests |

**Important:** Never commit your `.env` file or expose your internal API secret in client-side code.

### 5. Run the Development Server

```bash
npm run dev
```

The server will start at:

```text
http://localhost:5000
```

### 6. Run in Production

```bash
npm start
```

### 7. Seed the Database (Optional)

To insert the initial studio data into MongoDB:

```bash
npm run seed
```

Run the seed command only when you need to insert the initial sample data.

## 🔗 API Endpoints

Base URL:

```text
http://localhost:5000
```

### Studio APIs

Base Route: `/api/studios`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/studios` | Get all studios |
| GET | `/api/studios?category=Photo Studios` | Filter studios by category |
| GET | `/api/studios/featured` | Get featured studios |
| GET | `/api/studios/:id` | Get a single studio |
| POST | `/api/studios` | Create a new studio |
| GET | `/api/studios/mine` | Get logged-in user's studios |
| PUT | `/api/studios/:id` | Update a studio |
| DELETE | `/api/studios/:id` | Delete a studio |

### Booking APIs

Base Route: `/api/bookings`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my-bookings` | Get user's bookings |
| GET | `/api/bookings/host-bookings` | Get host's bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a pending booking |
| PATCH | `/api/bookings/:id/confirm` | Confirm a pending booking |

### Server Status

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check server status |
| GET | `/health` | Health check |

## 🗄️ Database Collections

The application uses MongoDB with the database name:

```text
studiospace
```

### Studios Collection

Stores studio listing information, including:

- Studio title
- Category
- Hourly rate
- Security deposit
- Maximum capacity
- Location
- Image
- Amenities
- Overview
- Host name and email
- Rating
- Creation date

### Bookings Collection

Stores booking information, including:

- Studio ID
- Studio title
- User email
- Host email
- Booking date
- Start time
- End time
- Total hours
- Total price
- Booking status
- Creation date

## 🔐 Authentication

StudioSpace uses Better Auth for user authentication.

The Express backend verifies authentication using JWT and Better Auth's JWKS endpoint.

Protected operations also use an internal API secret to validate trusted requests between the frontend server and backend.

Authorization checks ensure that:

- Only authenticated users can create studio listings.
- Users can manage their own studio listings.
- Users can cancel their own pending bookings.
- Only the studio owner can confirm a booking.

## 📡 API Response Format

Successful API responses generally follow this structure:

```json
{
  "success": true,
  "message": "Studios fetched successfully",
  "data": []
}
```

Error responses generally follow this structure:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

## 🌐 Related Project

**Frontend Repository:**  
https://github.com/jewelranadev/studiospace

## 👨‍💻 Author

**Jewel Rana**

GitHub: https://github.com/jewelranadev

---

⭐ If you find this project interesting, feel free to explore the repository!
