# FreeLo Backend Architecture (Pragmatic Clean Architecture)

> **Goal:** Ship the product as quickly as possible while keeping the codebase clean, maintainable, and easy to scale.
>
> We are **not** implementing full DDD, Hexagonal Architecture, or CQRS. Those can be introduced later if the project actually needs them.

---

# Core Principles

1. Organize code by **feature (module)**, not by file type.
2. Keep business logic inside **services**.
3. Controllers handle HTTP only.
4. Repositories handle database access only.
5. Routes only register endpoints.
6. Each module owns its own files.
7. Avoid unnecessary abstractions.
8. Optimize for shipping, not architectural purity.

---

# Folder Structure

```text
src/
│
├── app/
│
├── db/
│
├── lib/
│
├── middleware/
│
├── modules/
│   │
│   ├── auth/
│   │
│   ├── onboarding/
│   │
│   ├── forms/
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── schema.ts
│   │   ├── constants.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   │
│   ├── leads/
│   │
│   ├── clients/
│   │
│   ├── projects/
│   │
│   ├── tasks/
│   │
│   ├── proposals/
│   │
│   ├── invoices/
│   │
│   └── ...
│
└── index.ts
```

---

# Responsibilities

## routes.ts

Responsible for:

- Registering HTTP endpoints
- Applying middleware
- Calling controllers

Should NOT:

- Validate business rules
- Query the database
- Contain business logic

Example:

```
POST /forms

↓

controller.create()
```

---

## controller.ts

Responsible for:

- Receiving request
- Reading params/body/query
- Calling service
- Returning response

Should NOT:

- Write SQL
- Know Drizzle
- Contain business rules

Think of controllers as translators between HTTP and your application.

---

## service.ts

This is the heart of each module.

Responsible for:

- Business rules
- Validation that belongs to the business
- Calling repositories
- Coordinating multiple repositories
- Throwing business errors

Examples:

- Publish form
- Submit form
- Create lead
- Accept proposal
- Archive project

Most of your code will live here.

---

## repository.ts

Responsible for database access only.

Examples:

- findById()
- create()
- update()
- delete()
- findBySlug()

Repositories should know Drizzle.

Services should NOT.

---

## schema.ts

Contains:

- Zod schemas
- Request validation
- DTO validation

Nothing else.

---

## types.ts

Contains:

- Shared interfaces
- Request/Response types
- Internal module types

No business logic.

---

## index.ts

Exports everything needed by the module.

Example:

```ts
export * from "./routes";
export * from "./service";
```

---

# Request Flow

```text
HTTP Request

↓

Route

↓

Controller

↓

Service

↓

Repository

↓

Database
```

Response:

```text
Database

↑

Repository

↑

Service

↑

Controller

↑

HTTP Response
```

---

# Example

Creating a form:

```text
POST /forms

↓

routes.ts

↓

controller.create()

↓

service.create()

↓

repository.create()

↓

PostgreSQL
```

---

# Where Business Logic Lives

Everything business-related belongs inside the service.

Example:

✅ Generate slug

✅ Prevent duplicate slug

✅ Validate publishing rules

✅ Create default fields

✅ Archive instead of deleting

❌ Not inside routes

❌ Not inside repositories

---

# Repository Rules

Repositories should only answer questions like:

- Find a form
- Save a form
- Delete a form

They should never decide:

- Can this form be published?
- Can this proposal be accepted?

Those are business decisions.

Business decisions belong to services.

---

# Controllers Stay Thin

Bad:

```ts
if (form.fields.length === 0) {
    throw ...
}

await db.insert(...)
```

Good:

```ts
await formService.publish(id);
```

Controllers should usually be only a few lines long.

---

# Module Independence

Every module owns itself.

Example:

```
modules/forms/

controller
service
repository
schema
types
routes
```

Nothing outside the module should need to know how Forms works internally.

---

# Events (Later)

We are NOT implementing Event-Driven Architecture right now.

Modules will communicate directly through services.

Example:

```
LeadService

↓

ProjectService.create()
```

If, in the future, we find that many modules react to the same action, we can introduce domain events.

For now, direct service calls are simpler and easier to debug.

---

# Future Growth

If a service becomes too large:

```
service.ts

↓

extract helper

↓

extract validator

↓

extract domain object
```

We will refactor only when needed.

No premature abstractions.

---

# Development Philosophy

Our priorities are:

1. Ship the MVP.
2. Keep the code readable.
3. Keep modules independent.
4. Refactor when real problems appear.
5. Introduce advanced patterns only when they solve an existing problem.

This architecture gives us a clean, modular backend without the complexity of full DDD, while still leaving the door open to evolve toward DDD in the future if the project grows.