<h1 align="center">Instafix</h1>

<p align="center">
    AI-Powered Repair Matching Platform
</p>
</p>
<p>Instafix is an innovative platform that connects users with skilled freeancers who can fix various problems. Whether an item is broken, damaged, or needs maintenance, Instafix streamlines the process of finding the right repair professional through AI-powered assistance and real-time job matching.</p>

## <h3 name="snap-and-fix">📸&nbsp; Snap & Fix</h3>
- Users can take a photo of a broken or damaged object.
- The system analyzes the image to determine the issue.
- Instafix automatically matches the user with relevant freelancers who can fix the problem.

## <h3 name="ai-powered">🤖&nbsp; AI-Powered Problem Matching</h3>
- Instead of snapping a photo, users can describe their issue in a chat with an AI assistant.
- The AI understands the problem and finds the best freelancers based on expertise and availability.
- Users receive instant recommendations without needing to browse manually.

## <h3 name="real-time">📍&nbsp; Real-Time Freelancer Matching</h3>
- The platform connects users with nearby or remote freelancers based on job requirements.
- Freelancers can accept job requests in real-time and communicate directly with users.
- Users can compare freelancer profiles, reviews, and pricing before hiring.

## <h3 name="seamless-communication">💬&nbsp; Seamless Communication</h3>
- Built-in chat system to discuss repairs, pricing, and timelines.
- AI chatbot assists with troubleshooting before connecting to a freelancer.

## <h3 name="job-tracking">🔄&nbsp; Job Tracking & Completion</h3>
- Users can track progress of their repair requests.
- Once completed, users can leave ratings and reviews for freelancers.

<h2 name="monorepo-structure">🗂&nbsp; Monorepo Structure</h2>
<p>Instafix follows a monorepo architecture using Turborepo to efficiently manage multiple applications and shared packages. Below is an overview of the key directories:</p>
</p>
<details>
<summary><h3 name="snap-and-fix"> 📂 &nbsp; <code>apps/</code> Snap & Fix</h3></summary>
<p>This folder contains all the main applications that run the platform, including backend services and the frontend.</p>
</p>
<ul>
    <li><code>socket-server/</code> – Handles WebSocket communication for real-time updates and messaging.</li>
</ul>
<ul>
    <li><code>web/</code> – The Next.js frontend application that powers the Instafix user interface.</li>
</ul>
</details>

<details>
<summary><h3 name="shared-code"> 📦 &nbsp; <code>packages/</code> Shared Code & Utilities</h3></summary>
<p>Reusable modules that can be shared between <code>apps/</code>.</p>
<ul>
  <li><code>db/</code> – Database schema, migrations, and Prisma-related configurations.</li>
  <li><code>eslint-config/</code> – Custom ESLint rules shared across the monorepo for consistency.</li>
  <li><code>services/</code> – Backend services, API utilities, and shared logic.</li>
  <li><code>store/</code> – Global state management utilities (e.g., Recoil, Zustand, Redux).</li>
  <li><code>types/</code> – TypeScript types and interfaces for consistent type safety across the project.</li>
  <li><code>typescript-config/</code> – Centralized TypeScript configuration for consistency.</li>
  <li><code>ui/</code> – Shared UI components and styles used across different applications.</li>
</ul>

<h3 name="config-tooling"> ⚙️ &nbsp; Configuration & Tooling</h3>
<ul>
  <li><code>.turbo/</code> – Stores cache and build information for Turborepo.</li>
  <li><code>.vercel/</code> – Configuration files for deploying the Next.js frontend on Vercel.</li>
  <li><code>docker-compose.yml</code> – Defines services for running the project using Docker.</li>
  <li><code>pnpm-workspace.yaml</code> – Defines the monorepo workspace using PNPM.</li>
  <li><code>turbo.json</code> – Configuration for Turborepo task execution.</li>
</ul>
</details>

<h2 name="setup-options">⚙️ &nbsp; Setup Options</h2>
<p>Choose your preferred method to set up and run Instafix:</p>
<details>
<summary><h3 name="docker-setup">🐳 &nbsp; Docker Setup (Recommended)</h3></summary>
<h4 name="docker-prerequisites">Prerequisites</h4>
<ul>
  <li>Docker and Docker Compose</li>
  <li><code>.env</code> file (copy from <code>.env-example</code>)</li>
</ul>
<h4 name="docker-commands">Quick Commands</h4>
  
```bash
# Clone and enter project
git clone https://github.com/your-repo/instafix.git && cd instafix

# Configure environment
cp .env-example .env  # Edit as needed

# Start services
docker-compose up -d

# Verify running containers
docker ps  # Should see instafix-web, instafix-socket-server, instafix-redis

# Stop services
docker-compose down
```
<h4 name="docker-access">Access</h4>
<ul>
  <li>Web UI: <code>ws://localhost:3000</code></li>
  <li>Socket Server: <code>ws://localhost:3001</code></li>
</ul>
<h4 name="docker-logs">Logs</h4>

```bash
docker-compose logs -f web  # Replace with socket-server or redis as needed
```
</details>

<details>
<summary><h3 name="manual-setup">🛠️ &nbsp; Manual Setup</h3></summary>
<h4 name="manual-prerequisites">Prerequisites</h4>
<ul>
  <li>Node.js (v18+)</li>
  <li>PNPM (v9.0.0)</li>
  <li>Redis server</li>
</ul>
<h4 name="manual-commands">Quick Commands</h4>


```bash
# Clone and enter project
git clone https://github.com/your-repo/instafix.git && cd instafix

# Install dependencies
pnpm install

# Configure environment
cp .env-example .env  # Edit root .env
cp apps/web/.env-example apps/web/.env
cp apps/socket-server/.env-example apps/socket-server/.env

# Database setup
pnpm -F web db:generate
pnpm -F web db:migrate
pnpm -F web db:seed  # Optional

# Start all services (dev mode)
pnpm dev

# Start specific services
pnpm -F web dev  # Web app only
pnpm -F socket-server dev  # Socket server only

# Build for production
pnpm build  # All apps
pnpm -F web start  # Run web in production
pnpm -F socket-server start  # Run socket server in production
```

<h4 name="deployment">Deployment Options</h4>

```bash
# Vercel (Web App)
pnpm -F web deploy

# Cloudflare Pages
pnpm -F web preview  # Local preview
pnpm -F web deploy  # Deploy to Cloudflare
```
</details>

<br>

## 🤝&nbsp;&nbsp;Contributing

Contributions are always welcome!
