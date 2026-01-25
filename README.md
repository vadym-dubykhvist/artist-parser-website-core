# artist-parser-website-core

Backend application for artists parser website

## Description

[NestJS](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
$ cp .env.example .env
```

Update the following variables in `.env`:
- `DB_HOST` - Database host (default: postgres for Docker, localhost for local)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_NAME` - Database name (default: artist_parser_db)
- `POSTGRES_USER` - PostgreSQL username for Docker (default: postgres)
- `POSTGRES_PASSWORD` - PostgreSQL password for Docker (default: postgres)
- `POSTGRES_DB` - Database name for Docker (default: artist_parser_db)
- `POSTGRES_PORT` - PostgreSQL port for Docker (default: 5432)
- `APP_PORT` - Application port (default: 3000)

## Running with Docker

### Production

```bash
# Build and start all services
$ docker-compose up -d

# View logs
$ docker-compose logs -f app

# Stop services
$ docker-compose down
```

### Development

```bash
# Start development environment with hot reload
$ docker-compose -f docker-compose.dev.yml up

# TypeORM will auto-sync schema in development mode (synchronize: true)
# The database schema will be automatically updated based on your entities
```

### Database Migrations

TypeORM uses migrations for production database schema management:

```bash
# Generate a new migration (run locally or in dev container)
$ npm run migration:generate -- src/migrations/MigrationName

# Run pending migrations
$ npm run migration:run

# Revert last migration
$ npm run migration:revert
```

**Note:** In development mode, TypeORM auto-syncs the schema. In production, always use migrations.

## Running the app (Local)

```bash
# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
