# GOAT Management System

# Master System Prompt

## Version 1.0

## Part 4 --- Development Workflow, Security, Testing & Claude Code Rules

# 42. Development Workflow

Claude Code must build the project incrementally.

Do not generate the entire application in a single step.

Follow this order:

1.  Planning & Architecture
2.  Project Foundation
3.  Database
4.  Authentication
5.  Google Sheets Integration
6.  Assessment Engine
7.  Admin Dashboard
8.  Student Portal
9.  Analytics & Leaderboards
10. Branding & UI
11. Testing
12. Documentation

Each phase must be completed, reviewed, and verified before continuing.

------------------------------------------------------------------------

# 43. Code Quality Standards

Every line of code must be production-ready.

Requirements:

-   SOLID principles
-   DRY (Don't Repeat Yourself)
-   KISS (Keep It Simple)
-   Clean Architecture
-   Feature-based organization
-   Strong typing
-   Meaningful naming
-   Small reusable functions
-   Modular components
-   No duplicated business logic

Never leave TODOs or placeholder implementations unless explicitly
requested.

------------------------------------------------------------------------

# 44. Security Requirements

Security is mandatory.

Implement:

-   JWT Authentication
-   Password hashing
-   Role-based authorization
-   CSRF protection where applicable
-   Input validation
-   Output sanitization
-   Secure API endpoints
-   Environment variables for secrets
-   Rate limiting where appropriate

Never expose secrets in the frontend.

------------------------------------------------------------------------

# 45. Error Handling

Every layer must handle failures gracefully.

Requirements:

-   Friendly user messages
-   Detailed backend logs
-   Consistent API error responses
-   Validation before database writes
-   Graceful recovery where possible

Never expose stack traces to end users.

------------------------------------------------------------------------

# 46. Logging

Log important system events:

-   Login attempts
-   Google Sheets synchronization
-   Assessment imports
-   Critical errors
-   Authentication failures

Logs should support debugging while avoiding sensitive data exposure.

------------------------------------------------------------------------

# 47. Performance Standards

Backend:

-   Optimize database queries.
-   Avoid N+1 query problems.
-   Use indexes where appropriate.
-   Paginate large datasets.

Frontend:

-   Lazy loading
-   Code splitting
-   Efficient rendering
-   Optimized API calls
-   Image optimization

The application should remain responsive as the academy grows.

------------------------------------------------------------------------

# 48. Testing Strategy

Implement tests throughout the project.

Backend:

-   Unit Tests
-   Integration Tests
-   API Tests

Frontend:

-   Component Tests
-   Page Rendering Tests
-   User Flow Tests

Critical calculations in the assessment engine must always be covered by
automated tests.

------------------------------------------------------------------------

# 49. Documentation

Generate and maintain documentation including:

-   README
-   Installation Guide
-   Environment Configuration
-   Project Structure
-   API Documentation
-   Database Overview
-   Deployment Guide
-   User Guide (Admin & Student)

Documentation should stay synchronized with implementation.

------------------------------------------------------------------------

# 50. Deployment Expectations

The application should be deployable using environment variables.

Separate configurations for:

-   Development
-   Staging
-   Production

Do not hardcode environment-specific values.

------------------------------------------------------------------------

# 51. Acceptance Criteria

The system is considered complete only when:

-   Authentication is secure.
-   Google Sheets synchronization works automatically.
-   Weekly assessments are stored historically.
-   Final scores calculate correctly.
-   Progress tracking is accurate.
-   Admin dashboard functions correctly.
-   Student portal is complete.
-   Branding matches GOAT identity.
-   Responsive design works across devices.
-   Tests pass successfully.
-   Documentation is complete.

------------------------------------------------------------------------

# 52. Claude Code Rules

Claude Code must always:

-   Think before coding.
-   Design before implementing.
-   Build reusable solutions.
-   Keep business logic separate from UI.
-   Follow the provided architecture.
-   Respect the GOAT branding.
-   Preserve historical assessment data.
-   Keep code modular and maintainable.
-   Avoid assumptions not defined in the specifications.
-   Ask for clarification when requirements are ambiguous instead of
    inventing behavior.

Claude Code must never:

-   Delete assessment history.
-   Hardcode scoring logic outside the assessment engine.
-   Mix business logic with presentation.
-   Ignore validation errors.
-   Produce placeholder code as a final implementation.
-   Sacrifice maintainability for speed.

------------------------------------------------------------------------

# 53. Final Objective

The final deliverable is a production-ready web application that enables
GOAT Martial Arts Academy to manage students, synchronize assessment
data from Google Sheets, calculate performance accurately, visualize
progress over time, and provide a premium user experience aligned with
the GOAT brand.

The application should be scalable, maintainable, secure, performant,
and ready for real-world use.

------------------------------------------------------------------------

**End of Master System Prompt**

This document serves as the governing specification for all subsequent
development phases. Every future phase prompt must adhere to the
architectural principles, standards, and constraints defined in Parts
1--4.
