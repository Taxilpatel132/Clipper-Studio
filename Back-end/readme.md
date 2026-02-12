# ◆ Clipper Studio — Backend API

REST API for the **Clipper Studio** video editor. Built with Express 5, MongoDB (Mongoose 9), and FFmpeg for video processing.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see Environment Variables below)

# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000` by default.

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/clipper-studio?retryWrites=true&w=majority"
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
```

## 🏗️ Architecture

### Boot Sequence

```
dotenv.config() → connectDB() → app.listen(PORT)
```

| File          | Role                                         |
| ------------- | -------------------------------------------- |
| `server.js`   | Entry point — loads env, connects DB, starts |
| `app.js`      | Express config — middleware, routes, CORS    |
| `database.js` | MongoDB connection via Mongoose              |

### Project Structure

```
src/
├── app.js                    # Express app configuration
├── server.js                 # Entry point (boot sequence)
│
├── config/
│   └── database.js           # MongoDB connection
│
├── controllers/              # Request handlers
│   ├── auth.controller.js    # Signup, login, refresh, logout
│   ├── project.controller.js # Save & load projects
│   ├── render.controller.js  # Render project + upload preview frames
│   └── frame.controller.js   # Extract timeline frames (per project)
│
├── services/                 # Business logic
│   ├── auth.service.js       # User auth, token rotation, sessions
│   ├── project.service.js    # Project CRUD
│   ├── rander.service.js     # FFmpeg trim + concat rendering
│   └── frame.service.js      # FFmpeg frame extraction
│
├── models/                   # Mongoose schemas
│   ├── user.model.js         # User + embedded refreshTokens[]
│   └── project.model.js      # Project + embedded clips[]
│
├── routes/                   # Express routers
│   ├── auth.routes.js        # /api/auth/*
│   ├── project.routes.js     # /api/projects/*
│   ├── render.routes.js      # /api/render/*
│   └── frame.routes.js       # /api/frames/*
│
├── middlewares/
│   └── auth.middleware.js    # JWT Bearer token verification
│
└── utils/
    └── token.js              # Generate access + refresh JWT pair

uploads/                      # Multer upload destination
└── temp/                     # Temporary uploaded videos

outputs/                      # FFmpeg output destination
├── frames/                   # Extracted frame images
└── *.mp4                     # Rendered project videos
```

## 📡 API Reference

### Auth — `/api/auth`

No authentication required.

| Method | Endpoint   | Body                        | Description                            |
| ------ | ---------- | --------------------------- | -------------------------------------- |
| POST   | `/signup`  | `{ name, email, password }` | Register new user                      |
| POST   | `/login`   | `{ email, password }`       | Login, returns access + refresh token  |
| POST   | `/refresh` | Cookie: `refreshToken`      | Rotate refresh token, new access token |
| POST   | `/logout`  | Cookie: `refreshToken`      | Invalidate current session             |

**Token strategy:**

- Access token: JWT, 15 min expiry, sent in response body
- Refresh token: JWT, 7 day expiry, stored in `httpOnly` cookie
- Refresh rotation: old token invalidated, new pair issued
- Reuse detection: if a used token is replayed, ALL sessions are revoked

### Projects — `/api/projects` 🔒

All routes require `Authorization: Bearer <accessToken>`.

| Method | Endpoint      | Body                                 | Description    |
| ------ | ------------- | ------------------------------------ | -------------- |
| POST   | `/save`       | `{ projectName, clips[], timeline }` | Save a project |
| GET    | `/:projectId` | —                                    | Load a project |

### Render — `/api/render`

| Method | Endpoint             | Auth | Body / File                | Description                       |
| ------ | -------------------- | ---- | -------------------------- | --------------------------------- |
| POST   | `/:projectId/render` | 🔒   | —                          | Trim + concat clips → output MP4  |
| POST   | `/upload-preview`    | ❌   | `multipart: video` + `fps` | Upload video → extract frame JPGs |

### Frames — `/api/frames` 🔒

| Method | Endpoint             | Body      | Description                        |
| ------ | -------------------- | --------- | ---------------------------------- |
| POST   | `/:projectId/frames` | `{ fps }` | Extract frames from project's clip |

## 📦 Data Models

### User

```javascript
{
  name:          String,        // required, trimmed
  email:         String,        // unique, lowercase
  password:      String,        // argon2 hashed (select: false)
  refreshTokens: [{            // embedded array
    token:     String,
    device:    String,
    createdAt: Date
  }]
}
```

### Project

```javascript
{
  user:        ObjectId → User,  // owner
  projectName: String,           // required
  clips: [{                      // embedded array
    clipId:    String,
    sourceUrl: String,           // path to source video
    trim: {
      start: Number,             // default 0
      end:   Number
    },
    volume: Number               // default 1
  }],
  timeline:  Object,             // full timeline state from frontend
  status:    "draft" | "rendering" | "completed"
}
```

## 🎬 FFmpeg Processing

### Frame Extraction (`frame.service.js`)

Extracts JPEG frames from a video at a given FPS:

```
ffmpeg -i <input> -vf fps=<fps> -y outputs/frames/<tempId>/frame_%03d.jpg
```

Used for both:

- Project-based extraction (`POST /api/frames/:projectId/frames`)
- No-auth upload preview (`POST /api/render/upload-preview`)

### Render Pipeline (`rander.service.js`)

Trims each clip then concatenates into a final MP4:

```
1. For each clip:
   ffmpeg -ss <start> -i <source> -t <duration> -c:v libx264 -preset fast → trim<i>.mp4

2. Generate concat list:
   file 'trim0.mp4'
   file 'trim1.mp4'
   ...

3. Merge:
   ffmpeg -f concat -safe 0 -i input.txt -c:v libx264 -preset fast → <jobId>.mp4
```

Output: `outputs/<jobId>.mp4`

## 🛠️ Tech Stack

| Package       | Version | Purpose                      |
| ------------- | ------- | ---------------------------- |
| express       | 5.2     | HTTP framework               |
| mongoose      | 9.0     | MongoDB ODM                  |
| argon2        | 0.44    | Password hashing             |
| jsonwebtoken  | 9.0     | JWT access/refresh tokens    |
| ffmpeg-static | 5.3     | Bundled FFmpeg binary        |
| fluent-ffmpeg | 2.1     | FFmpeg wrapper (available)   |
| multer        | 2.0     | Multipart file uploads       |
| uuid          | 13.0    | Unique IDs for jobs/frames   |
| cookie-parser | 1.4     | Parse refresh token cookies  |
| cors          | 2.8     | Cross-origin requests        |
| dotenv        | 17.2    | Environment variable loading |
| nodemon       | 3.1     | Dev hot-reload               |

## 🔐 Auth Flow

```
┌─────────┐     POST /signup       ┌──────────┐
│  Client  │ ──────────────────────▸│  Server  │
│          │◂────────────────────── │          │
│          │  { accessToken }       │          │
│          │  Cookie: refreshToken  │          │
│          │                        │          │
│          │     POST /refresh      │          │
│          │ ──────────────────────▸│          │
│          │◂────────────────────── │          │
│          │  new accessToken       │          │
│          │  rotated refreshToken  │          │
│          │                        │          │
│          │  Authorization: Bearer │          │
│          │ ──────────────────────▸│ protect()│
│          │   Protected resource   │          │
└─────────┘                        └──────────┘
```

## 📋 Scripts

| Script        | Command                 | Description                  |
| ------------- | ----------------------- | ---------------------------- |
| `npm run dev` | `nodemon src/server.js` | Development with auto-reload |
| `npm start`   | `node src/server.js`    | Production start             |

## 🔮 Planned

- [ ] Serve extracted frames via static route (`GET /api/frames/serve/:tempId/:filename`)
- [ ] `logout-all` route (controller exists, route commented out)
- [ ] Video upload route (`/api/video` — import commented out in app.js)
- [ ] Streaming render progress via SSE or WebSocket
- [ ] Cloud storage integration (S3) for source videos and outputs
- [ ] Rate limiting and input validation middleware
