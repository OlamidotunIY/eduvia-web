# Eduvia Architecture & Engineering Rules

This document establishes the mandatory architectural rules, folder structure standards, typing policies, and conventions for the Eduvia codebase. All features and contributions must adhere strictly to these rules.

---

## 1. Feature Folder Structure (3-Layer Architecture)

Every feature in `src/features/<feature-name>` must strictly follow this directory and file layout:

```
src/features/<feature-name>/
├── application/
│   ├── queries/
│   │   ├── use-<query-1>.query.ts      # Exactly 1 query hook per file
│   │   ├── use-<query-2>.query.ts
│   │   └── index.ts                    # Re-exports all query hooks
│   ├── mutations/
│   │   ├── use-<mutation-1>.mutation.ts # Exactly 1 mutation hook per file
│   │   ├── use-<mutation-2>.mutation.ts
│   │   └── index.ts                    # Re-exports all mutation hooks
│   └── index.ts                        # Re-exports ./queries and ./mutations
├── infrastructure/
│   ├── rest/
│   │   ├── <feature>.api.ts            # HTTP API client functions
│   │   └── index.ts
│   ├── repository/
│   │   ├── <feature>.repository.ts     # Implements the repository interface
│   │   └── index.ts
│   └── index.ts                        # Re-exports repository and rest
├── presentation/
│   ├── components/                     # Feature-specific UI components
│   │   └── index.ts
│   ├── pages/                          # Feature route/page components
│   │   └── index.ts
│   └── index.ts                        # Re-exports components and pages
└── index.ts                            # Re-exports application and presentation
```

### Prohibited in Features:
- **NO `domain/` folder inside any feature.** Domain logic and entities belong strictly in `src/shared/domain/<feature-name>`.
- **NO monolithic query or mutation files.** Every single query hook and mutation hook must reside in its own dedicated file.
- **NO direct API calls from components or hooks.** All data fetching and mutations must go through the repository pattern via the application hooks.

---

## 2. Typing Policy: Generated Types vs. Domain Entities

### Strict Rule: Zero Custom Input or Response Types
1. **Never invent custom DTOs, request body types, or input interfaces on the frontend.**
   - All input types for queries and mutations (e.g. `CreateQuestionDto`, `UpdateQuestionDto`, `SendInvitationDto`, `ChangeMemberRoleDto`, `CreateClassroomDto`, `CreateSubjectDto`, `CompleteUserOnboardingDto`) must be imported **directly** from `@/shared/api/generated`.
2. **If an API input or response type is missing, incomplete, or untyped in `@/shared/api/generated`:**
   - **Do NOT create a workaround custom type or interface.**
   - The backend Swagger/OpenAPI definition (NestJS controllers and DTOs) must be updated first with `@ApiProperty`, `@ApiResponse`, or `@ApiOkResponse`.
   - The OpenAPI spec is deployed/regenerated via `@hey-api/openapi-ts` into `src/shared/api/generated/`.
   - The frontend consumes the freshly generated types directly.

---

## 3. Domain Entities: Rich Classes, Not Anemic Interfaces

1. **Entities must be Classes with Methods:**
   - Domain entities living in `src/shared/domain/<feature>/entities/` are domain models, **not** just anemic TypeScript `interface` or `type` aliases.
   - They must be implemented as TypeScript classes with:
     - Properties initialized through a constructor or props object.
     - Domain methods and getters needed by the application and presentation layers (e.g., `fullName`, `isActive()`, `formattedSchedule()`, `isEnrolled()`, `displayLabel()`, etc.).
     - Static factory methods (e.g., `fromRecord(data: unknown)` or `fromDto(dto: SomeDto)`).
2. **Entity Location:**
   - All domain entity classes must reside in `src/shared/domain/<feature>/entities/`.
   - Repository interfaces must reside in `src/shared/domain/<feature>/repositories/`.

---

## 4. Repositories: Strict Encapsulation

1. **Repositories must be Classes:**
   - Every feature repository must be a class implementing its corresponding `I<Feature>Repository` interface.
2. **No Functions Outside the Class:**
   - **All** mapping, parsing, transformation, data validation, and formatting functions (such as `toClassroom()`, `mapBackendMessageToDomain()`, `formatTimestamp()`, `toOrganizationRole()`, `readString()`, etc.) **must be `private` methods inside the repository class**.
   - A repository file must contain **only** the class definition and its singleton export (e.g., `export const questionRepository = new QuestionRepository();`). Standalone functions outside the class are strictly prohibited.
