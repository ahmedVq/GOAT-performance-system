# GOAT Management System

# Master System Prompt

## Version 1.0

## Part 2 --- Database, Google Sheets Integration & Assessment Engine

# 16. Database Strategy

Design the database to preserve every student's complete journey.

## Core Entities

-   Users
-   Roles
-   Students
-   Admins
-   Branches
-   Levels
-   Martial Arts (Boxing, Kickboxing)
-   Assessment Templates
-   Assessment Sessions
-   Assessment Results
-   Assessment Criteria
-   Criterion Scores
-   Google Sheet Sync Logs
-   Leaderboards

Use UUID primary keys where appropriate while maintaining a unique
**Student ID** as the academy identifier.

Never delete historical assessment records.

# 17. Student Model

Each student should include:

-   Student ID (unique)
-   Full Name
-   Email
-   Level (Beginner, Intermediate, Advanced)
-   Branch
-   Join Date
-   Active Status
-   Linked User Account

Students authenticate with email/password and can only access their own
information.

# 18. Assessment Model

Assessments occur weekly.

Each assessment represents a snapshot of a student's performance.

Store:

-   Assessment Date
-   Martial Art
-   Assessment Template Version
-   Raw Scores
-   Calculated Scores
-   Coach Notes
-   Final Percentage

Do not overwrite previous assessments.

# 19. Assessment Engine

The assessment engine must be isolated from the UI.

Responsibilities:

-   Read synchronized assessment data.
-   Validate input.
-   Calculate criterion totals.
-   Calculate category scores.
-   Calculate weighted final score.
-   Store immutable assessment history.
-   Compare against previous assessments.
-   Calculate percentage improvement.

The scoring formula will be provided later. Build the engine so formulas
can be encapsulated in dedicated services.

# 20. Google Sheets Integration

Google Sheets is the source of assessment data.

Workflow:

1.  Admin updates the Google Sheet.
2.  Backend detects changes automatically.
3.  Synchronize data.
4.  Match students using Student ID.
5.  Create a new assessment history record.
6.  Recalculate analytics.
7.  Refresh dashboards.

Synchronization requirements:

-   Automatic
-   Idempotent
-   Fault tolerant
-   Logged
-   Transactional

# 21. Validation Rules

Reject or flag:

-   Missing Student ID
-   Duplicate Student IDs in the same import
-   Invalid assessment dates
-   Missing required scores
-   Invalid score ranges

Log validation failures without crashing synchronization.

# 22. Progress Tracking

For every student calculate:

-   Current Score
-   Previous Score
-   Difference
-   Percentage Improvement
-   Historical Trend
-   Highest Score
-   Lowest Score
-   Average Score
-   Total Assessments Completed

Display these values visually in dashboards.

# 23. Leaderboard

Primary ranking:

-   Biggest Improvement

Secondary options (future-ready):

-   Highest Final Score
-   Most Consistent Performance

Support filtering by:

-   Branch
-   Level
-   Martial Art
-   Date Range

# 24. Analytics

Generate academy-wide metrics:

-   Grade Distribution
-   Average Score
-   Weekly Trends
-   Improvement Distribution
-   Top Improvers
-   Assessment Completion Rate

Use optimized database queries for aggregation.

# 25. Business Rules

-   Student ID is immutable.
-   Historical assessments are never deleted.
-   Every synchronized assessment creates a permanent history record.
-   Calculated fields must originate from the assessment engine.
-   UI must never perform business calculations.

# 26. Error Handling

All synchronization failures should:

-   Roll back partial database changes.
-   Produce meaningful logs.
-   Return descriptive API responses.
-   Preserve existing assessment history.

# 27. Acceptance Criteria

The implementation is complete only if:

-   Automatic Google Sheets synchronization functions correctly.
-   Assessment history is preserved.
-   Final scores are calculated correctly.
-   Progress is tracked across all assessments.
-   Leaderboards update automatically.
-   Analytics reflect the latest synchronized data.
-   No historical data is lost.

------------------------------------------------------------------------

**End of Master Prompt -- Part 2**

Part 3 will define the frontend architecture, UI/UX standards, dashboard
layouts, branding implementation, charts, responsive behavior, and
student/admin experience.
