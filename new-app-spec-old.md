# New App Spec: AI-Importable Student Life Scheduler

## Purpose

This document is a loose product and project specification for a fresh reimplementation of the current scheduling app idea. It is not intended to be a rigid blueprint or a final technical architecture. The implementation agent should use this document to understand the product vision, user needs, and important feature expectations, but it should feel free to improve the design while building if it finds a better approach.

The app should be designed as a better scheduler for students and busy people managing many overlapping responsibilities. It should support classes, self-guided learning, test prep, extracurriculars, workouts, projects, deadlines, habits, and one-time tasks. A major feature is the ability to upload a specially structured JSON file generated outside the app by the user's preferred AI model. The app itself should not include an AI chat or built-in AI API in the initial version.

The intended implementation should start fully fresh. Do not assume the old codebase will be provided or reused.

## High-Level Product Identity

The app should be both:

- A student life scheduler.
- A more general planner for busy people.

The first target audience is students, especially high school students managing school, college applications, test prep, extracurriculars, and personal goals. However, the concepts should be general enough to work for anyone who wants to plan multiple areas of life.

The product should feel somewhat like a combination of:

- A calendar app, because the weekly schedule should be visual and central.
- A database/list-based planner, because the app needs to manage tasks, habits, projects, categories, warnings, and unscheduled items.

The app's core value is not just showing calendar events. It should help transform messy goals and commitments into an organized, editable schedule.

## Product Principles

### 1. Calendar as the Main Visual Interface

The calendar should be the main place where the user understands their week. Users should be able to drag, resize, inspect, and edit scheduled sessions/events directly on the calendar.

### 2. Planning Engine Under the Hood

The app should not be purely calendar-first. It should also understand higher-level planning objects, such as habits, projects, flexible tasks, deadlines, and courses/classes. A scheduled calendar block should often be an instance of a higher-level item.

Example:

- High-level item: `SAT prep every day`.
- Scheduled instances: `SAT Prep, Monday 9:00 AM`, `SAT Prep, Tuesday 10:00 AM`, etc.

### 3. AI-Assisted, Not AI-Powered

The app should support workflows where users use Claude, ChatGPT, Gemini, or another model outside the app to generate schedule JSON. The app should then import, validate, preview, and schedule from that JSON.

The app itself should not have an AI chat experience in the initial version, and it should not depend on an AI API. It can provide a prompt template that users copy into their preferred AI model.

### 4. Human Editable

Anything imported or generated should be editable. The app should never make the schedule feel locked or mysterious. Users should be able to move, resize, delete, complete, and reorganize items.

### 5. Flexible and Forgiving

Users may have vague inputs. The app should support unclear or incomplete items by placing them into an inbox, showing warnings, or asking the user what to do during import.

### 6. Better Than a Todo List

The app should encourage users to turn intentions into time blocks. It should help with the question: “When am I actually doing this?”

## Example User Input for AI JSON Generation

A user may give an external AI model messy input like this:

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

Some items are recurring, some are one-time, some are vague, some are fixed, and some are strict schedule commitments. The external AI should be able to turn that kind of input into structured JSON that this app can import.

## Main Data Concepts

The implementation may choose its own exact data structures, but the app should conceptually support the following object types.

### Fixed Events

Strict time commitments that should appear on the calendar at specific times.

Examples:

- Stanford classes from 4–6 PM.
- Dance class.
- Voice lessons.
- Driving lesson.
- Doctor appointment.

Fixed events may be recurring or one-time.

### Flexible Tasks

Tasks that need to happen but do not have an exact time.

Examples:

- Investing research.
- Think of good songs for dance next year.
- Reach out about HarkerDev.
- Work on an application section.

Flexible tasks usually need a duration before they can be scheduled.

### Habits

Recurring flexible routines.

Examples:

- SAT prep every day.
- Workout routine.
- Musical practice.
- Reading habit.

Habits should support recurrence and possibly routine cycles.

### Routine Cycles

Some habits follow patterns rather than simple daily/weekly recurrence.

Example:

- Workout cycle: upper, lower, rest, repeat.

The app should support routine cycles in a simple but useful way.

### Projects

Multi-step goals with subtasks.

Examples:

- Common App work.
- Prep for AP classes next year.
- Find a mini-internship or volunteer opportunity.
- Finish a book quickly.

Projects should be able to contain subtasks, deadlines, estimated durations, priorities, and scheduled sessions.

### Courses / Classes

Courses/classes should exist conceptually, but they should be generalized. A course is not only a school class with fixed lectures. It can also be a self-guided learning area.

Example:

A math course could organize:

- Chapter 1 reading.
- Chapter 1 practice.
- Chapter 2 overview.
- Review session.
- Practice test.

This means a course can act as an organizing container for events, tasks, projects, and study sessions.

### Deadlines

Due dates or target completion dates.

Examples:

- Submit application by a date.
- Finish a book by Friday.
- Email someone by the end of the week.

### Availability Windows

Times when the app may schedule flexible work.

The user does not need to define these perfectly. If no custom availability exists, the app should use sensible default waking hours.

### Protected Time

Time that should generally not be scheduled over.

Examples:

- Sleep.
- Meals.
- Family commitments.
- School.
- Existing fixed events.

The app should include a default sleep/protected-time concept that users can edit.

### Maybe Items

Ideas that are not fully committed yet.

Examples:

- Find a mini-internship?
- Volunteer?
- Think about songs for dance next year.

Maybe items may stay in an inbox until the user decides whether to schedule them.

### Categories / Areas of Life

The app should support categories or areas such as:

- School.
- Test prep.
- College apps.
- Fitness.
- Performing arts.
- Career.
- Personal.

Categories should support colors. The app may provide automatic colors, and users should also be able to choose colors.

## Master Items and Scheduled Instances

The app should distinguish between a master planning item and a scheduled calendar instance.

Example:

- Master item: `Common App Work` project.
- Subtask: `Brainstorm essay topics`.
- Scheduled instance: `Brainstorm essay topics on Tuesday from 10:00–10:45`.

Scheduled sessions should be traceable back to their source items. This is important for editing, progress tracking, rescheduling, and understanding why something is on the calendar.

## JSON Import Workflow

JSON import is one of the most important features.

### Required Import Behavior

The app should support uploading a JSON file that can contain both:

- High-level planning items.
- Exact scheduled sessions/events.

The external AI model may generate the full proposed schedule, not just a task list. The app should still validate, preview, and allow selective import.

### Import Flow

1. User clicks an import button.
2. User uploads a JSON file.
3. App validates the file.
4. App shows an import preview before making changes.
5. Preview shows items, events, categories, warnings, assumptions/notes, conflicts, invalid fields, and estimated workload.
6. User can include or exclude specific imported items.
7. User confirms import.
8. App merges the import into the current plan.

The app should not immediately import without preview.

### Validation Philosophy

The JSON format should be structured enough to validate reliably, but the importer should be forgiving in practice.

Ideal behavior:

- Valid parts can be imported.
- Invalid or missing pieces produce warnings.
- Ambiguous items can be placed in an inbox.
- The user can decide what to include or exclude.

The implementation may use a schema validation library such as Zod, but the exact library is not mandatory.

### Multiple Imports

Users should be able to upload multiple JSON files over time. Each import should merge with the existing schedule rather than replacing everything.

The app should attempt duplicate detection using source item IDs plus title/date similarity. Exact technical details are flexible.

### Import History

The app should store import history and show previous imports. Rollback would be nice later, but it is not required immediately.

### Assumptions and Notes

Imported JSON may include assumptions or notes from the external AI model.

Example:

> Assumed SAT prep means 60 minutes daily.

These should be shown prominently during import preview. Even though the app is not AI-powered internally, users need to understand what assumptions were made by the external AI that generated the JSON.

### No AI Badge Required

Imported items do not need special “AI” visual markers in the main app. The app is not presenting itself as AI-powered. It is simply able to import structured schedule data.

## Prompt Template Feature

The app should include a feature that helps users generate a schedule JSON using their favorite AI model.

This could be a “Copy AI Prompt” or “Generate JSON Prompt” screen. It should provide instructions the user can paste into Claude, ChatGPT, Gemini, or another model.

The prompt should tell the AI to:

- Convert messy schedule notes into the app’s JSON format.
- Separate fixed events from flexible tasks.
- Include exact scheduled sessions when enough information is available.
- Use assumptions when necessary and list those assumptions.
- Put vague items into a maybe/inbox-friendly form.
- Include durations, priorities, categories, recurrence, deadlines, availability, and protected time when available.
- Return only valid JSON.

## Export Workflow

The app should also support exporting the current schedule and planning data as JSON.

This helps with:

- Backup.
- Debugging.
- Re-importing.
- Sending the current plan back to an external AI model for revision.

## Scheduling Engine

The app should include its own scheduling capability while also accepting fully scheduled JSON from an external model.

The external AI can interpret messy user input and propose a schedule. The app should validate that schedule and should also be able to regenerate or adjust schedules without needing AI.

### Expected Scheduling Features

The scheduler should eventually support:

- Fixed events.
- Flexible tasks.
- Habits.
- Projects and subtasks.
- Deadlines.
- Recurrence.
- Routine cycles.
- User availability.
- Protected time.
- Simple energy levels.
- Simple daily workload limits.
- Conflict warnings.
- Exact-time scheduling or loose suggestions.

### MVP Scheduling Behavior

The scheduling engine should be useful, but it does not need to be perfect. It can start by:

1. Preserving fixed events.
2. Respecting protected time.
3. Using availability windows when defined, or default waking hours otherwise.
4. Scheduling flexible sessions by priority, deadline, and recurrence.
5. Warning if there is not enough space.
6. Warning about tight transitions instead of automatically inserting buffers.

### Buffers

The app should not automatically insert buffers between events by default. However, it should warn when the schedule is too tight or when two events are back-to-back in a way that may be unrealistic.

### Locking

The app does not need a strict event-locking system as a core concept. Users should be able to edit imported or scheduled events. Fixed events should be treated carefully, but the app should avoid making too much feel immovable.

### Unfinished Tasks

The app should not automatically roll unfinished tasks forward without user action. The user should manually reschedule unfinished work or choose a reschedule action.

### Overbooking

The app may allow overbooking, but it should warn clearly when conflicts exist.

## Recurrence Requirements

The app should support more than only basic recurrence.

It should support at least:

- Daily recurrence.
- Weekly recurrence on selected days.
- Every N days/weeks.
- Weekday/weekend-style recurrence.
- Simple routine cycles such as upper/lower/rest.

Advanced RRULE-style recurrence can be supported if the implementation naturally chooses that route, but the product goal is usability, not exposing complicated recurrence syntax to the user.

## Priorities and Durations

### Priority

Every schedulable task should have a priority. Since the app itself is not AI-powered, priority should either come from the imported JSON or be chosen by the user.

### Duration

A task may be imported without a duration, but it should not be automatically scheduled until it has a duration. Missing duration should produce a warning or place the item in the inbox.

## Views and UI

The MVP should include these main views:

1. Weekly calendar view.
2. Item inbox.
3. JSON import preview.
4. Settings/preferences.

The app should also be designed so later versions can add daily focus, project detail, analytics, and template views.

### Weekly Calendar View

The weekly calendar should support:

- Seven-day week view.
- Time grid.
- Fixed events.
- Flexible sessions.
- Habits/project sessions.
- Dragging events.
- Resizing events.
- Editing event details.
- Completion checkboxes for task sessions, but not necessarily for fixed events.
- Conflict indicators.
- Subtle visual distinction between fixed, flexible, generated, and manually edited sessions.

Visual distinction should be helpful but not overwhelming. Fixed and flexible items should be recognizable, but the design should avoid making the calendar visually chaotic.

### Sidebar

The app should have a collapsible sidebar.

The sidebar should show:

- Unscheduled tasks.
- Projects.
- Habits.
- Import warnings.

It may later include categories, today’s priorities, a mini calendar, or other navigation.

### Item Inbox

The item inbox should contain:

- Unscheduled tasks.
- Vague items needing clarification.
- Missing-duration items.
- Maybe items.
- Items that could not be scheduled.
- Import warnings that need user action.

The inbox is important because the app should not force vague or incomplete items directly onto the calendar.

### Import Preview

The import preview should show:

- Items to be created.
- Events to be added.
- Categories to be added.
- Assumptions/notes.
- Warnings.
- Conflicts.
- Invalid or missing fields.
- Estimated workload.

The preview should allow users to include or exclude specific imported items before confirming.

A before/after calendar preview would be useful later, but it is not required.

### Settings / Preferences

Settings should include at least:

- Timezone.
- Default waking hours.
- Sleep/protected time.
- Default task duration.
- Daily workload limit.
- Time format.
- Week start preference if easy.
- Import/export controls.

## Constraints and Preferences

### Availability

Availability should be optional. If the user defines availability, the scheduler should prefer or respect it. If the user does not define availability, the app should use default waking hours.

### Protected Time

The app should include editable default protected time, especially sleep.

### Energy Levels

The app should support simple energy levels, but they should not be overly strict.

Example energy levels:

- High.
- Medium.
- Low.

High-energy tasks can prefer high-energy windows, but the app should not make this rigid unless the user explicitly wants that.

### Daily Workload Limits

The app should support simple daily workload warnings.

Example:

- “This day has 6.5 hours of focused work, which exceeds your target of 5 hours.”

This should help users detect unrealistic schedules.

### Locations and Commute

The app should support locations and commute/travel time from the beginning if practical.

Examples:

- Dance class has a location.
- Driving lesson has a location.
- Voice lesson may be online.

Commute handling can start simple. The app can warn about impossible or tight transitions between locations rather than automatically solving all travel logistics.

## Multiple Plans

The app should support multiple schedules/plans from the beginning.

Examples:

- Summer Plan.
- School Year Plan.
- College App Sprint.
- Light Week.
- Balanced Week.

A user should be able to switch between plans. Each plan may contain its own imported data, events, items, settings, or schedule horizon.

## Timezones

The app should support timezones. Imported JSON should be able to specify a timezone. The app should be careful with date/time interpretation so that fixed events and scheduled sessions do not shift unexpectedly.

## Persistence

For the current version, the app should not require accounts. It should work locally first.

The implementation can use local storage, IndexedDB, or another local persistence approach. The architecture should leave room for backend/cloud sync later, but accounts and cloud sync are not required now.

## Visual Design Direction

The exact visual vibe is undecided. The implementation should choose a clean, modern, pleasant design suitable for students and general productivity users.

Design guidance:

- Avoid looking childish.
- Avoid overwhelming visual clutter.
- Use color to make categories understandable.
- Make import warnings and conflicts easy to notice.
- Make drag-and-drop calendar editing feel polished.
- Keep the interface approachable for users who are overwhelmed.

Events do not need an AI badge or sparkle marker just because they came from imported JSON.

## Polished Interaction Expectations

The following should feel especially polished:

- JSON upload/import flow.
- Import preview.
- Calendar drag/drop.
- Calendar resizing.
- Event editing.
- Conflict warnings.
- Overall visual design.

## Technical Direction

Preferred stack:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.

The implementation agent may choose libraries and internal architecture as needed. It may use schema validation tools, state management libraries, date libraries, drag-and-drop libraries, and testing tools if they help.

Automated tests are welcome, especially for import validation and scheduling logic, but the exact testing strategy is flexible.

The app should include sample JSON and documentation for the import format if useful, but this spec does not require exact TypeScript interfaces or a full formal JSON schema in advance. The implementation agent may design those while building.

## Suggested External AI Prompt Template

The app should include something like the following prompt that users can copy into their preferred AI model.

```text
You are helping me create a structured schedule JSON file for a scheduling app.

The app can import high-level planning items and exact scheduled calendar sessions. It supports fixed events, flexible tasks, habits, routine cycles, projects, subtasks, deadlines, courses/classes, availability windows, protected time, categories, warnings, and assumptions.

Your job:
- Convert my messy notes into structured JSON for the app.
- Separate strict fixed-time events from flexible tasks.
- Include exact scheduled sessions when enough information is available.
- For vague items, mark them as maybe or needing clarification.
- Include durations for schedulable tasks whenever possible.
- Include priority for every schedulable task.
- Include recurrence rules for repeating items.
- Include deadlines where known.
- Include categories and colors where helpful.
- Include assumptions and warnings for anything unclear.
- Do not invent important facts silently. If you assume something, list it in assumptions.
- Return only valid JSON.

My timezone is: [TIMEZONE]
My planning horizon is: [START DATE] to [END DATE]
My fixed commitments are:
[PASTE FIXED COMMITMENTS]

My availability/protected time is:
[PASTE AVAILABILITY OR SAY UNKNOWN]

My messy goals/tasks are:
[PASTE TASK LIST]
```

The actual app-specific JSON format can be documented by the implementation agent.

## Sample Classification Guidance

The implementation does not need to hard-code this exact sample, but the product should handle examples like these naturally:

- `SAT prep everyday` should usually become a habit.
- `DRIVING!` may become a project, flexible task, fixed lesson, or needs-clarification item.
- `Find a mini-internship? Volunteer?` may become a maybe item or project.
- `Common app work` should usually become a project.
- `Read recreate book` may become a project or deadline task.
- `Prep for AP classes next yr` should usually become a project or course-related plan.
- `Musical prep` may become a habit or project, while `voice lessons` may be fixed events.
- `Investing` may become a habit or flexible task.
- `Dance class` should usually become a fixed event if a time is known.
- `Working out upper/lower/rest` should become a habit with a routine cycle.
- `Stanford classes 4-6 pm` should become fixed events once days are known.
- `Think of good songs for dance next yr` may become a flexible task or maybe item.
- `Reach out about HarkerDev` should become a deadline task or flexible task.

## Implementation Freedom

This spec should guide the project, not trap it. If the implementation agent has a better idea for data modeling, UI, scheduling behavior, import format, or feature ordering, it should use its judgment.

The most important non-negotiable product ideas are:

1. The app is a student-friendly multi-area scheduler and planner.
2. The app has a strong weekly calendar experience.
3. The app supports higher-level planning items, not just raw calendar events.
4. The app imports externally generated JSON from any AI model or tool.
5. The app previews and validates imports before applying them.
6. The app has no built-in AI chat/API requirement for the initial version.
7. The app supports flexible tasks, fixed events, habits, projects, courses, deadlines, availability, protected time, categories, warnings, and multiple plans.
8. Users remain in control and can edit the schedule manually.
