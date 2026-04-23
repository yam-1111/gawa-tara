<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

You are a senior frontend systems designer and product engineer.

Your task is to generate a complete production-ready frontend architecture and UI implementation plan for a web application called **“Gawa Tara?”**.

You must follow the design system, constraints, schemas, and interaction rules below strictly.

No explanations. Output only structured implementation artifacts.

---

# NORTH STAR: “Rooted Warmth”

The system must feel:
calm, grounded, human, and natural.

Avoid sterile SaaS UI. Avoid neon. Avoid sharp industrial design.

---

# 1. DESIGN SYSTEM

## Colors (Earthy / Organic Palette)

* Primary: `#4a7c59` (forest green) → actions, navigation, active states
* Background: `#faf6f0` (warm cream) → base surface
* Accent: `#705c30` (warm amber) → highlights, badges, warnings

### Rules

* No pure black, pure white, or neon colors
* All grays must be warm-tinted
* Prefer tonal layering over shadows

---

## Typography

* Branding / H1 / Titles: **Playfair Display**
* Body / UI / Labels: **Manrope**
* Line height: ≥ 1.6 for readability

---

## Elevation

* Shadows: subtle only
  `0 4px 20px rgba(46, 50, 48, 0.06)`
* Prefer color layering instead of heavy shadowing
* Rounded corners: 12px default, 64px for layout containers

---

## Components

### Buttons

* Primary: green solid, large radius
* Secondary: cream background + green border/text

### Cards

* Warm cream surface
* Padding: 24px
* Rounded: 12px
* No harsh borders

### Inputs

* Cream background
* Soft green focus ring
* Rounded corners

---

# 2. TECH STACK

* Next.js (App Router)
* React
* TailwindCSS
* shadcn/ui
* Radix UI
* Lucide Icons
* Prisma (CRUD layer)
* Supabase (Auth + DB, Google OAuth)

---

# 3. BRANDING

* App name: **Gawa Tara**
* Logo: Lucide icon + text
* Font: Playfair Display

---

# 4. GLOBAL LAYOUT

## Sidebar (fixed left)

* Vertical center alignment
* Rounded: 64px
* Icons:

  * Create Task (Plus)
  * Home (Home)
  * Planner (Calendar)

### Profile section

* Circular avatar
* Spacing: 30px below menu

### Dropdown (on click)

* Task Archives
* User Settings

---

# 5. PAGES

---

## HOME

### Layout

* Bento-style dashboard
* Warm layered containers

---

### Header

* Logo (Lucide + “Gawa Tara” Playfair)

---

### Main Card

Left:

* Greeting: `Hi {USERNAME}!`
* Dynamic quote based on task count
* Quotes stored in `/data/quotes`

Right:

* Circular progress: completed / total tasks
* Click interaction updates progress + moves tasks to archive

---

### Task Section

Toggle:

* Card view
* List view

---

### Task Card

Top-right:

* Priority badge:

  * DO
  * SCHEDULE
  * URGENT
  * DELETE

Center:

* Task title

Bottom row:

Left:

* Kebab menu (Edit / Delete)

Right:

* Action icons:

  * X → Did Not Do
  * Dash → Snooze / Move Tomorrow
  * Check → Completed

All actions must include tooltips.

---

## CREATE TASK

Same layout as Home, replace main content with form.

### Fields

* Task Name
* Description
* Priority Level
* Tags
* Start Date (default: today)
* Due Date (optional)
* Recurrence:

  * NONE
  * WEEKLY
  * MONTHLY
  * YEARLY

Dynamic UI for recurrence options.

---

## PLANNER

* Calendar-based UI
* Displays ScheduleBlocks per day
* Click day → task breakdown
* Same layout system

---

## USER SETTINGS

* Profile picture upload (Supabase bucket: `profile_picture`)
* Editable username
* Read-only email
* Delete account:

  * red button
  * requires username confirmation

---

## EDIT TASK MODAL

* Same form as Create Task
* Pre-filled values
* Uses `/app/api`
* Modal (Radix Dialog)

---

# 6. DATA MODEL RULES

### Priority Enum

* DO → critical execution
* SCHEDULE → normal planned work
* URGENT → time-sensitive escalation
* DELETE → low-value tasks (excluded from planning)

### Status Enum

* PLANNED
* SKIP
* DONE

### Recurrence Enum

* NONE
* WEEKLY
* MONTHLY
* YEARLY

---

# 7. SCHEMA RULES

Include:

* User schema (auth + profile)
* Task schema (core logic + recurrence + priority)
* ScheduleBlock (execution instances)
* Tags + Junction table

---

# 8. ALGORITHM (SYSTEM LOGIC)

### Task Ordering

* filter active tasks (not deleted, not complete)
* sort by:

  * nearest due date
  * priority (DO > URGENT > SCHEDULE)
  * shortest duration

### Allocation

* fill daily schedule sequentially
* split tasks if needed
* overflow moves to next day

---

# 9. OUTPUT REQUIREMENT

Generate:

* folder structure
* reusable components
* page implementations
* UI system architecture
* API route structure (/app/api)
* Prisma schema definitions

---

No explanation. Only structured system output.
