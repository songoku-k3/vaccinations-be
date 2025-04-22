# Vaccination Management System Backend

A comprehensive backend system for managing vaccinations, built with modern technologies and best practices.

## Project Overview

This project is a RESTful API backend service for managing vaccination records, appointments, and related healthcare services. It provides features such as:

- 💉 Vaccination management and tracking
- 👥 User authentication and authorization
- 📅 Appointment scheduling
- 💳 Payment integration with MOMO
- 📧 Email notifications
- 🗄️ File storage with AWS S3
- 📱 QR code generation for vaccination records

## Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="nestjs" />
  <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
  <img src="https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgresql" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="prisma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="docker" />
</div>

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker and Docker Compose
- Node.js (v18 or higher) - for local development
- npm (Node Package Manager)

## Getting Started

### Running with Docker (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd vaccinations-be
```

2. Set up environment variables:

```bash
# Copy the example env file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

3. Build and run the Docker container:

```bash
# Build the container
docker-compose build

# Run the container
docker-compose up -d
```

The API will be available at http://localhost:3001/api

To view logs:

```bash
docker-compose logs -f
```

To stop the container:

```bash
docker-compose down
```

### Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (same as Docker setup)

3. Run the development server:

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3001
DATABASE_URL=          # PostgreSQL connection URL
ACCESS_TOKEN_KEY=      # JWT access token secret
REFRESH_TOKEN_KEY=     # JWT refresh token secret
MAIL_TRANSPORT=        # SMTP transport URL
MAIL_FROM=            # Sender email address
JWT_SECRET=           # JWT secret key
AWS_REGION=           # AWS region for S3
AWS_ACCESS_KEY_ID=    # AWS access key
AWS_SECRET_ACCESS_KEY= # AWS secret key
AWS_S3_BUCKET_NAME=   # S3 bucket name
MOMO_YOUR_SECRET_KEY= # MOMO payment secret key
MOMO_PARTNER_CODE=    # MOMO partner code
MOMO_ACCESS_KEY=      # MOMO access key
MOMO_REDIRECT_URL=    # Payment redirect URL
MOMO_IPN_URL=        # Payment IPN URL
```

## API Documentation

The API documentation is available through Swagger UI at:

- Local: http://localhost:3001/api
- Development: [Your-Dev-URL]/api
- Production: [Your-Production-URL]/api

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── auth/           # Authentication & authorization
├── common/         # Shared utilities, guards, decorators
├── config/         # Configuration modules
├── modules/        # Feature modules
│   ├── users/
│   ├── vaccinations/
│   ├── appointments/
│   └── payments/
├── prisma/        # Database schema and migrations
└── main.ts        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
