# FreeLo Forms Module (Pragmatic Clean Architecture)

> **Goal:** Build the Forms module in a way that is simple, maintainable, and fast to develop.
>
> We are **not** implementing full Domain-Driven Design (DDD), Event-Driven Architecture (EDA), Hexagonal Architecture, or CQRS.
>
> Our priority is to **ship the product** while keeping the code clean enough to evolve later.

---

# Philosophy

The Forms module should be:

- Easy to understand
- Easy to debug
- Easy to extend
- Organized by feature
- Framework independent as much as possible
- Free from unnecessary abstractions

Business rules belong inside **services**.

Database logic belongs inside **repositories**.

HTTP belongs inside **controllers** and **routes**.

---

# Folder Structure

```text
modules/
└── forms/
    ├── routes.ts
    ├── controller.ts
    ├── service.ts
    ├── repository.ts
    ├── schema.ts
    ├── types.ts
    ├── errors.ts
    ├── constants.ts
    └── index.ts
```

---

# File Responsibilities

## routes.ts

Registers HTTP endpoints only.

Responsibilities:

- Define routes
- Apply middleware
- Call controllers

Never:

- Access the database
- Implement business logic
- Validate business rules

Example:

```
POST /forms/default

↓

controller.createDefaultForm()
```

---

## controller.ts

Controllers translate HTTP requests into service calls.

Responsibilities:

- Read params
- Read request body
- Read query parameters
- Call service
- Return HTTP response

Controllers should remain very small.

Example:

```ts
const result = await formService.publish(formId);

return c.json(result);
```

Never:

- Write SQL
- Use Drizzle directly
- Implement business rules

---

## service.ts

The service is the heart of the module.

This is where business logic lives.

Responsibilities:

- Implement use cases
- Enforce business rules
- Validate business conditions
- Coordinate repositories
- Throw business errors

Typical methods:

```ts
createDefaultForm()

updateSettings()

addField()

updateField()

removeField()

reorderFields()

publish()

getPublicForm()

submit()
```

Almost all module logic should exist here.

---

## repository.ts

Responsible only for persistence.

Responsibilities:

- Read database
- Insert records
- Update records
- Delete records

Example methods:

```ts
findById()

findBySlug()

create()

update()

createSubmission()

createAnswers()

deleteField()
```

Repositories know Drizzle.

Services do not.

Repositories never decide business rules.

---

## schema.ts

Contains Zod validation.

Responsibilities:

- Request validation
- DTO validation

Example:

```ts
createFieldSchema

updateFieldSchema

publishFormSchema

submitFormSchema
```

No business logic belongs here.

---

## types.ts

Contains shared interfaces used by the module.

Example:

```ts
Form

FormField

Submission

Answer

FormSettings

ValidationRules
```

Keep them simple.

No classes.

No inheritance.

---

## errors.ts

Contains business errors.

Example:

```ts
FormNotFoundError

FormAlreadyPublishedError

FieldAlreadyExistsError

InvalidSubmissionError
```

Services throw these errors.

Controllers convert them into HTTP responses.

---

## constants.ts

Contains module constants.

Example:

```ts
DEFAULT_FORM_TITLE

DEFAULT_SUCCESS_MESSAGE

MAX_FIELDS
```

---

## index.ts

Exports everything the module exposes.

Example:

```ts
export * from "./routes";
export * from "./service";
export * from "./repository";
```

---

# Request Flow

```
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

```
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

# Where Business Logic Lives

Everything related to business belongs inside the service.

Examples:

✅ Generate slug

✅ Ensure slug uniqueness

✅ Prevent publishing an empty form

✅ Validate submissions

✅ Create default fields

✅ Prevent duplicate field positions

Services own these decisions.

Repositories never do.

---

# Repository Rules

Repositories answer questions like:

- Find a Form
- Save a Form
- Update a Form
- Delete a Field
- Store a Submission

Repositories never answer:

- Can this Form be published?
- Is this submission valid?
- Is this Organization allowed?

Those are business decisions.

---

# Controllers Stay Thin

Bad:

```ts
if (!form.fields.length) {
    throw new Error(...)
}

await db.insert(...)
```

Good:

```ts
await formService.publish(formId);
```

Controllers should mostly move data between HTTP and services.

---

# Communication Between Modules

For the MVP, modules communicate directly through services.

Example:

```
LeadService

↓

ProjectService.create()
```

No Event Bus.

No Domain Events.

If the project grows and this becomes difficult to maintain, we can introduce events later.

---

# Refactoring Strategy

When a service becomes too large:

```
Service

↓

Extract helper

↓

Extract validator

↓

Extract utility

↓

Extract business object (only if needed)
```

We only introduce complexity when it solves a real problem.

---

# Development Priorities

Our priorities are:

1. Ship the MVP.
2. Keep modules organized.
3. Keep services clean.
4. Avoid overengineering.
5. Refactor when real problems appear.

---

# Why This Architecture?

This architecture gives us:

- Fast development
- Easy debugging
- Simple onboarding for new developers
- Clear separation of responsibilities
- A clean codebase that can gradually evolve toward DDD if the product eventually requires it

We are intentionally optimizing for **shipping a successful SaaS**, not for implementing every advanced architectural pattern from day one.