# New App Spec: AI-Importable Student Scheduler

## Goal

Build a fresh React/TypeScript/Vite/Tailwind app for planning a student's busy life. It should also work for general personal planning, but the first use case is students balancing school, test prep, college apps, extracurriculars, workouts, projects, and personal goals.

The app is **AI-assisted, not AI-powered**: users can generate a schedule JSON with Claude/ChatGPT/Gemini/etc. outside the app, then upload that JSON. The app itself should not include AI chat or require an AI API.

This is a loose spec, not a rigid implementation plan. Claude or any future implementation agent may improve the data model, UX, library choices, and build order if it finds a better approach.

## Core Product Principles

- **Weekly calendar first:** the week view is the main interface for understanding and editing the schedule.
- **Planning objects underneath:** the app should model high-level items like habits, projects, courses, and deadlines, not only raw calendar events.
- **Human editable:** imported/generated schedules must be easy to edit, move, resize, delete, complete, and reorganize.
- **Forgiving import:** vague or incomplete items should produce warnings, go to an inbox, or ask for user choice rather than failing the whole import.
- **Schedule reality check:** warn about conflicts, tight transitions, missing durations, workload overload, and impossible plans.

## Example User Input for External AI

Users may paste messy notes like this into their preferred AI model:

```text
- SAT prep everyday
- DRIVING!
- Find a mini-internship? Volunteer?
- Common app work
- Read recreate book (should finish quickly)
- Prep for AP classes next yr (overview maybe first couple of chapters)
- Musical prep (practicing a couple of songs?) + voice lessons
- Investing
- Dance class
- Working out (upper lower rest)
- Stanford classes (4-6 pm)
- Think of good songs for dance next yr
- Reach out abt harkerdev
```

The generated JSON should separate fixed commitments, recurring habits, projects, vague/maybe items, deadlines, and scheduled sessions.

## Main Concepts to Support

The implementation can choose exact schemas/types, but should support these concepts:

- **Fixed events:** strict-time commitments such as classes, dance, voice lessons, appointments, or driving lessons.
- **Flexible tasks:** tasks that need time but not an exact time, such as outreach, investing research, or application work.
- **Habits:** recurring flexible routines such as SAT prep, practice, reading, or workouts.
- **Routine cycles:** patterns like `upper / lower / rest` for workouts.
- **Projects:** multi-step goals such as Common App work, AP prep, internship search, or finishing a book.
- **Courses/classes:** generalized containers for school classes or self-guided study areas. A course can contain tasks, projects, events, and study sessions.
- **Deadlines:** due dates or target finish dates.
- **Availability windows:** times the scheduler may use; optional, with sensible defaults if missing.
- **Protected time:** sleep, meals, family time, school, or other unavailable time; include editable default sleep/protected time.
- **Maybe/inbox items:** vague ideas not ready for the calendar.
- **Categories/areas:** school, test prep, college apps, fitness, performing arts, career, personal, etc.; colors should be automatic and user-editable.
- **Multiple plans:** support plans like Summer Plan, School Year, College App Sprint, Balanced Week, etc.

## Master Items vs Scheduled Instances

Distinguish high-level planning items from calendar instances.

Example:

- Master item: `SAT prep daily`.
- Scheduled instances: `SAT Prep Monday 9:00-10:00`, `SAT Prep Tuesday 10:00-11:00`.

Scheduled sessions should trace back to source items for editing, progress, rescheduling, and explanation.

## JSON Import Requirements

JSON import is a primary feature.

The uploaded JSON may include:

- High-level planning items.
- Exact scheduled sessions/events.
- Categories.
- Availability/protected time.
- Multiple plans or planning horizon.
- Timezone.
- Assumptions/notes from the external AI.
- Warnings/conflicts.

### Import Flow

1. User uploads JSON.
2. App validates/parses it.
3. App shows a preview before applying changes.
4. Preview shows items, events, categories, assumptions, warnings, conflicts, missing fields, and estimated workload.
5. User can include/exclude specific imported items.
6. App merges selected data into the active plan.

Do not silently import without preview.

### Validation Philosophy

Use a structured schema if helpful, such as Zod, but keep the UX forgiving:

- Import valid parts when possible.
- Send incomplete/vague items to inbox.
- Warn for missing duration, missing priority, impossible recurrence, conflicts, or invalid dates.
- Allow multiple imports over time.
- Merge rather than replacing by default.
- Attempt duplicate detection using source IDs plus title/date similarity.
- Store import history; rollback is optional later.

Imported items do **not** need AI badges. The app is simply importing structured data.

## Prompt Template Feature

Include a screen/button that gives users a copyable prompt for their preferred AI model. The prompt should ask the model to output valid JSON for this app.

Suggested prompt content:

```text
You are creating a schedule JSON file for a planning app.

The app supports fixed events, flexible tasks, habits, routine cycles, projects, subtasks, deadlines, courses/classes, availability, protected time, categories, scheduled sessions, assumptions, and warnings.

Convert my messy notes into structured JSON.
- Separate fixed-time events from flexible tasks.
- Include exact scheduled sessions when enough information is available.
- Mark vague items as maybe or needing clarification.
- Include duration and priority for schedulable tasks.
- Include recurrence, deadlines, categories, timezone, assumptions, and warnings.
- Do not silently invent important facts.
- Return only valid JSON.

Timezone: [TIMEZONE]
Planning horizon: [START DATE] to [END DATE]
Fixed commitments: [PASTE]
Availability/protected time: [PASTE OR UNKNOWN]
Messy goals/tasks: [PASTE]
```

## Export

Support exporting the current plan/schedule as JSON for backup, debugging, re-importing, or sending back to an external AI for revision.

## Scheduling Engine

The app should accept fully scheduled imports, but also include its own scheduling logic for flexible items.

Expected behavior:

- Preserve fixed events.
- Respect protected time.
- Use user availability when defined, or default waking hours otherwise.
- Schedule by priority, deadline, recurrence, and available space.
- Support exact auto-scheduling or looser suggestions.
- Warn when something cannot fit.
- Warn about overbooking and tight transitions.
- Do not automatically insert buffers by default.
- Do not automatically roll unfinished tasks forward; user should choose to reschedule.
- Strict locking is not required as a core concept; fixed events should be treated carefully but remain editable.

## Recurrence

Support at least:

- Daily.
- Weekly on selected days.
- Every N days/weeks.
- Weekday/weekend patterns.
- Simple cycles such as `upper / lower / rest`.

Advanced RRULE support is optional if it makes implementation easier, but the user-facing UX should stay simple.

## Priorities and Durations

- Every schedulable task should have a priority, either imported or chosen by the user.
- A task may be imported without duration, but it should not be scheduled until duration exists.
- Missing duration should create an inbox item or warning.

## Required Views

### Weekly Calendar

Must support:

- Seven-day time grid.
- Fixed events, flexible sessions, habits, project sessions, and course sessions.
- Dragging, resizing, editing, and deleting events.
- Completion checkboxes for task sessions, not necessarily fixed events.
- Conflict indicators.
- Subtle distinction between fixed, flexible, generated, and manually edited sessions.

### Collapsible Sidebar

Should show:

- Unscheduled tasks.
- Projects.
- Habits.
- Import warnings.

### Item Inbox

Should contain:

- Unscheduled items.
- Vague/maybe items.
- Missing-duration items.
- Items that could not be scheduled.
- Import warnings needing user action.

### Import Preview

Should show:

- Items to create.
- Events to add.
- Categories to add.
- Assumptions/notes.
- Warnings/conflicts.
- Invalid/missing fields.
- Estimated workload.
- Include/exclude controls.

### Settings

Should include:

- Timezone.
- Default waking hours.
- Sleep/protected time.
- Default task duration.
- Daily workload limit.
- Time format.
- Week start preference if easy.
- Import/export controls.

## Constraints and Preferences

- Availability is optional; use defaults if absent.
- Protected time should include editable sleep defaults.
- Support simple energy levels: high, medium, low. These should guide scheduling but not be overly rigid.
- Support simple daily workload warnings.
- Support locations/commute if practical; at minimum warn about tight transitions between different locations.
- Support local-first persistence with no accounts required initially. The implementation may use localStorage, IndexedDB, or another local persistence approach.
- Architecture should leave room for backend/cloud sync later.
- Timezones should be handled carefully so imported fixed events do not shift unexpectedly.

## Visual and Interaction Expectations

The exact visual style is undecided. Choose a clean, modern, student-friendly productivity design.

Prioritize polish for:

- JSON upload/import.
- Import preview.
- Calendar drag/drop.
- Calendar resizing.
- Event editing.
- Conflict warnings.
- Overall visual design.

Avoid visual clutter and avoid making the app feel childish. Use color to clarify categories and urgency.

## Technical Direction

Preferred stack:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.

The implementation agent may choose libraries for state, dates, drag/drop, validation, persistence, and tests. Automated tests are especially useful for JSON validation and scheduling logic, but the exact test plan is flexible.

Sample JSON and import-format documentation are useful, but the exact schema can be designed during implementation.

## Sample Classification Guidance

The app should naturally support interpretations like:

- `SAT prep everyday` -> habit.
- `DRIVING!` -> project, flexible task, fixed lesson, or needs clarification.
- `Find a mini-internship? Volunteer?` -> maybe item or project.
- `Common app work` -> project.
- `Read recreate book` -> project or deadline task.
- `Prep for AP classes next yr` -> project or course plan.
- `Musical prep` -> habit/project; `voice lessons` -> fixed events.
- `Investing` -> habit or flexible task.
- `Dance class` -> fixed event if time is known.
- `Working out upper/lower/rest` -> habit with routine cycle.
- `Stanford classes 4-6 pm` -> fixed events once days are known.
- `Think of good songs for dance next yr` -> flexible or maybe item.
- `Reach out about HarkerDev` -> deadline or flexible task.

## Non-Negotiables

1. Student-friendly multi-area scheduler/planner.
2. Strong weekly calendar experience.
3. Higher-level planning items, not only raw events.
4. Import externally generated JSON from any AI/tool.
5. Validate and preview imports before applying.
6. No built-in AI chat/API requirement initially.
7. Support fixed events, flexible tasks, habits, projects, courses, deadlines, availability, protected time, categories, warnings, and multiple plans.
8. Users stay in control and can manually edit the schedule.
