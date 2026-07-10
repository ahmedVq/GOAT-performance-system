# GOAT Management System

# Master System Prompt

## Version 1.0

## Part 3 --- Frontend Architecture, UI/UX & Branding Standards

# 28. Frontend Vision

The frontend is the public face of GOAT Martial Arts Academy. It must
communicate discipline, precision, performance, and professionalism.
Every screen should reinforce the academy's identity rather than
resemble a generic admin dashboard.

The application must be fully responsive for desktop, tablet, and mobile
devices.

# 29. Frontend Architecture

Use React with TypeScript and Vite.

Organize the project using feature-based architecture.

Example:

``` text
src/
├── assets/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
└── routes/
```

Separate reusable UI components from feature-specific components.

# 30. Layouts

Create dedicated layouts for:

-   Authentication
-   Admin Dashboard
-   Student Portal
-   Error Pages

Each layout should share consistent navigation, spacing, typography, and
branding.

# 31. Component Library

Build reusable components including:

-   Button
-   Input
-   Select
-   Checkbox
-   Modal
-   Dialog
-   Drawer
-   Card
-   Statistic Card
-   Data Table
-   Progress Bar
-   Leaderboard Table
-   Assessment Summary Card
-   Chart Container
-   Empty State
-   Loading Skeleton
-   Toast Notifications
-   Confirmation Dialog

All components should support accessibility and dark mode.

# 32. Admin Dashboard

The administrator homepage should display:

-   Total Students
-   Active Students
-   Weekly Assessments
-   Average Score
-   Highest Score
-   Lowest Score
-   Biggest Improvement
-   Grade Distribution
-   Recent Synchronizations
-   Assessment Trend Charts

Provide quick navigation to student management and assessment history.

# 33. Student Portal

Students should only access their own data.

Include:

-   Welcome Header
-   Current Level
-   Current Overall Percentage
-   Improvement Since Previous Assessment
-   Historical Assessment Timeline
-   Performance Charts
-   Category Breakdown
-   Leaderboard Position
-   Recent Assessment Details

The experience should motivate continued improvement without exposing
other students' private information.

# 34. Navigation

Navigation must be simple and intuitive.

Admin Navigation:

-   Dashboard
-   Students
-   Assessments
-   Analytics
-   Leaderboards
-   Settings

Student Navigation:

-   Dashboard
-   Progress
-   Assessment History
-   Leaderboard
-   Profile

# 35. Data Visualization

Use professional charts for:

-   Progress Over Time (Line)
-   Grade Distribution (Bar)
-   Category Performance (Radar)
-   Improvement Trend (Area)
-   Weekly Statistics (Column)

Charts must load efficiently and remain readable on smaller screens.

# 36. Branding Rules

Implement the GOAT identity consistently.

## Colors

-   Coal: #050505
-   Blood Red: #E11919
-   Blood Dark: #B90F16
-   Blood Deep: #7C0D12
-   Off White: #F5F5F5
-   Steel Gray: #9BA3A7

## Typography

Display:

-   Impact
-   Haettenschweiler
-   Arial Narrow

Body:

-   Inter

## Visual Language

-   Dark mode only.
-   Angular cards.
-   Slanted sections.
-   Subtle combat-grid texture.
-   Fine grain overlay.
-   Restrained red glow.
-   High contrast typography.

Avoid colorful gradients, playful illustrations, or generic SaaS
styling.

# 37. User Experience

Prioritize:

-   Fast navigation
-   Minimal clicks
-   Clear hierarchy
-   Readable tables
-   Smooth transitions
-   Immediate feedback
-   Accessible interactions

Loading states, empty states, and error states must all be intentionally
designed.

# 38. Responsive Design

The application must adapt seamlessly to:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Tables should support horizontal scrolling where appropriate.

Navigation should collapse gracefully into a mobile menu.

# 39. Performance

Frontend requirements:

-   Lazy load pages.
-   Code split large features.
-   Optimize images.
-   Cache API requests.
-   Minimize unnecessary re-renders.

Aim for excellent Lighthouse performance scores.

# 40. Accessibility

Ensure:

-   Keyboard navigation
-   Proper semantic HTML
-   ARIA labels where needed
-   Sufficient color contrast
-   Visible focus states

Accessibility is a requirement, not an afterthought.

# 41. Acceptance Criteria

The frontend is complete only when:

-   Branding matches GOAT guidelines.
-   Admin dashboard is fully functional.
-   Student portal is intuitive.
-   Charts render correctly.
-   Responsive behavior is verified.
-   Components are reusable.
-   Accessibility standards are met.

------------------------------------------------------------------------

**End of Master Prompt -- Part 3**

Part 4 will define development workflow, testing strategy, documentation
standards, deployment expectations, security requirements, and the rules
Claude Code must always follow throughout the project.
