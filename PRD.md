# MEENDUM - Product Requirements Document

## Executive Summary

**Meendum** (மீண்டும் - meaning "again" in Tamil) is a rehabilitation management and tracking application designed specifically for stroke recovery patients and their caregivers. The app enables structured, guided physical rehabilitation exercises through a dual-interface system that separates the patient experience (Appa) from the caregiver monitoring interface (Amma). The application combines intuitive task sequencing, real-time progress tracking, emergency response capabilities, and multi-session scheduling to support consistent recovery routines in a culturally relevant Tamil-language environment.

---

## Product Overview

### Vision

To empower stroke recovery patients and their families with accessible, digitally-guided rehabilitation through structured exercises, real-time progress monitoring, and emergency support features, all delivered in their native language.

### Core Value Proposition

1. **Structured Recovery Path** - Clear, sequenced rehabilitation exercises organized by time of day
2. **Real-Time Progress Visibility** - Caregivers can instantly see what was completed, skipped, and why
3. **Cultural and Linguistic Accessibility** - Fully Tamil-language interface matching patient and caregiver preferences
4. **Emergency Support** - SOS/rest mode enabling caregivers to immediately pause activity if patient experiences distress
5. **Compliance Tracking** - Accurate logging of exercise completion and reasons for skipping enable clinical insights

---

## Target Users

### Primary Users

**Patient (Appa)**
- Stroke recovery patients requiring supervised rehabilitation
- Post-acute phase individuals (weeks to months post-stroke)
- Patients with varying levels of mobility and cognitive function
- Non-English speakers preferring Tamil interface
- Users with hemiparesis or partial paralysis requiring visual motivation and guided exercise cues

**Caregiver (Amma)**
- Family members (typically spouse, adult children) responsible for supervising rehabilitation
- Decision-makers controlling exercise schedules and task configuration
- Primary monitors of compliance and progress
- Emergency responders who can activate rest mode when patient experiences pain or fatigue

### Secondary Users

- Clinical therapists (physical or occupational therapists) who may review completion logs
- Healthcare providers monitoring recovery progress
- Family members tracking daily achievements for motivation

---

## Key Features

### 1. Dual-Interface Navigation System

#### Landing Page
- **Purpose**: Route users to their appropriate interface based on role
- **Components**:
  - "மீண்டும்" (Meendum) header in Tamil
  - Two prominent action buttons: "அப்பா" (Father/Patient) and "அம்மா" (Mother/Caregiver)
  - Role selection emoji (👨 for patient, 👩 for caregiver)
  - Warm, accessible color scheme (amber-to-orange gradient background)
  - Large, accessible button design with 36rem height (touch-friendly)

#### Session-Time Gating
- **Purpose**: Prevent out-of-hours exercise attempts; ensure patient safety
- **Behavior**:
  - Current implementation: Sessions active 6 AM–9 PM
  - Displays "🌙 இப்போது பயிற்சி நேரம் இல்லை" (Now is not exercise time) outside session windows
  - Encourages rest with "ஓய்வு எடுங்கள்" (Take rest) message
  - Protects patients from unscheduled exercise prompts

### 2. Patient Interface (Appa Screen)

#### Core Exercise Flow

**Idle State** (Ready to Start)
- Displays current task with:
  - Visual hemiparesis figure (animated representation of the body part involved)
  - Task name in Tamil (e.g., "கை பயிற்சி செய்யுங்கள்" - Hand Exercise)
  - Repetition/time target (e.g., "10 முறை" - 10 times)
  - Posture badge (indicating current session: Morning/Afternoon/Evening)
- **Two Actions**:
  - "தொடங்கு ▶️" (Start) - Initiates timer and transitions to active state
  - "தவிர்க்க" (Skip) - Allows patient to skip exercise (triggers skip-reason flow)

**Active/Timer State** (Exercise in Progress)
- Displays:
  - Same task information as idle state
  - Breathing animation (calm, paced visual guide to sync breathing during exercise)
  - Repetition target reminder
  - Elapsed time tracked (from start button press)
- **Single Action**:
  - "முடிந்தது ✅" (Done) - Records completion with duration and advances to next task
- **Features**:
  - Automatic timer measurement from start to done (duration_seconds captured)
  - Audio chime plays on completion (auditory feedback)
  - Smooth state transition to next task

**Skip-Reason Selection State** (When Skip Button Pressed)
- Displays:
  - Confirmation prompt: "காரணம் என்ன?" (What is the reason?)
  - Two skip reason options:
    - "🤕 வலி" (Pain) - Red-themed button
    - "🥱 சோர்வு" (Fatigue) - Blue-themed button
- **Purpose**: Collect clinical context for skipped exercises
- **Behavior**: Records skip with reason and advances to next task

**Completion State** (All Tasks Done)
- Displays:
  - "🎉 இந்த நேரத்தின் பயிற்சிகள் முடிந்தது!" (This session's exercises are complete!)
  - Celebration emoji and posture badge
  - Navigation button to Amma screen
- **Purpose**: Positive reinforcement and clear session conclusion

#### Session Concept
- Three daily sessions organized by time:
  - **Morning (காலை)**: 6 AM–12 PM tasks
  - **Afternoon (மதியம்)**: 12 PM–5 PM tasks
  - **Evening (மாலை)**: 5 PM–9 PM tasks
- Each session contains a filtered subset of tasks
- Patient completes available tasks in sequence within each session
- New session begins automatically on time boundary

#### Visual and Behavioral Elements
- **Hemiparesis Figure**: Animated representation showing the affected body part relevant to current exercise (arm, leg, etc.)
- **Breathing Animation**: Paced visual guide (4-7-8 breathing or similar rhythm) to help patient sync exercise with proper breathing
- **Posture Badge**: Corner indicator showing current session time (Morning/Afternoon/Evening) for orientation
- **Large Typography**: All text 24px–48px for accessibility
- **Tap/Touch Feedback**: Active:scale-95 on buttons for immediate haptic and visual response
- **Warm Color Palette**: Yellow background (bg-yellow-50) creates calming, non-medical feel

### 3. Caregiver Interface (Amma Screen)

#### Dashboard Overview
- **Header Section**:
  - "இன்று: X முடிந்தது ✅" (Today: X completed) - Real-time count of completed exercises
  - Navigation button to Appa screen
  - Amber background (bg-amber-100) for visual distinction

#### Emergency Response: SOS/Rest Mode Button

**Purpose**: Immediate pause mechanism for clinical emergencies (pain flare-up, fatigue, medical event)

**Behavior**:
- **At Rest**: Red button labeled "🆘 SOS - ஓய்வு" (SOS - Rest) with solid background
- **In Rest Mode**: Green button labeled "✅ ஓய்வு முடிந்தது" (Rest complete) with checked icon
- **On Click**:
  - Sets app_state.mode to 'rest'
  - When Appa screen detects mode='rest', shows RestScreen instead of exercise flow
  - All Appa-side exercise controls are hidden/disabled
  - Amma can toggle back to 'task' mode when patient is ready

**Rest Screen Display** (shown to patient):
- Full-screen rest prompt: "ஓய்வு எடுங்கள்" (Take rest)
- Indicates external control: caregiver has initiated rest mode
- No exercise options available until caregiver resumes

#### Daily Progress Tracking

**Visual Progress Display**:
- Organizes completions by session (Morning/Afternoon/Evening)
- Per-task status indicators:
  - "✅" (green) - Task completed (status='completed')
  - "⬜" (gray) - Task pending
  - "🤕" (red) - Skipped due to pain
  - "🥱" (blue) - Skipped due to fatigue
- **Data Shown**:
  - Task name in Tamil
  - Task icon (emoji)
  - Status badge
  - Skip reason (if applicable)
- **Real-Time Updates**: Refreshes when patient completes or skips task (RTC via Supabase polling or real-time subscriptions)

#### Task Configuration Panel

**Collapsible Dropdown**: "⚙️ பயிற்சிகளை அமைக்கவும்" (Configure exercises)

**Configuration Capabilities**:
- **Edit Task Library**:
  - Add new rehabilitation tasks
  - Remove existing tasks
  - Reorder task sequence (order_index)
  - Assign session times (morning/afternoon/evening)
  - Set repetition or duration targets (reps_or_time_target)
  - Attach audio guides (audio_url - cloud-hosted MP3)
  - Add/change task icons
  - Update Tamil text descriptions

- **Session Assignment**:
  - Assign each task to morning, afternoon, or evening session
  - Configure exact scheduled_time (HH:MM format)
  - System auto-converts scheduled_time into session_type
  - Session windows:
    - Morning: before 12:00 PM
    - Afternoon: 12:00 PM – 5:00 PM
    - Evening: 5:00 PM or later

- **Persistence**: All changes immediately saved to Supabase tasks table

#### Real-Time Data Refresh
- Completions auto-refresh on Amma screen when:
  - Patient completes or skips a task
  - Daily completions counter updates
  - Task order/sequence changes in config
- Uses Supabase real-time subscriptions or polling

### 4. Data Recording and Logging

#### Completion Record Structure
```
{
  id: UUID (auto-generated)
  task_id: UUID (foreign key to tasks)
  date: DATE (YYYY-MM-DD, local timezone date)
  status: 'completed' | 'skipped'
  duration_seconds: INT (only for status='completed', measured from Start to Done button press)
  skip_reason: 'pain' | 'fatigue' | NULL (only for status='skipped')
  completed_at: TIMESTAMPTZ (server timestamp of record creation)
}
```

#### Clinical Data Points Captured
1. **Completion Status**: Tracks which exercises were performed
2. **Duration**: Measures actual exercise time (seconds)
3. **Skip Patterns**: Records when and why exercises were skipped
4. **Date Tracking**: Enables daily, weekly, and longitudinal analysis
5. **Session Performance**: Breaks down completion by time-of-day sessions

#### Compliance Insights
- Caregiver can analyze:
  - Daily completion rate (X of Y exercises completed)
  - Most common skip reasons (pain vs. fatigue trends)
  - Exercise duration patterns (improving endurance over time?)
  - Session-specific performance (morning vs. afternoon struggles)

### 5. Database Schema and Data Model

#### Tables

**tasks** Table
```
Column                Type        Description
─────────────────────────────────────────────────────────
id                   UUID        Primary key
tamil_text           TEXT        Exercise name in Tamil
icon                 TEXT        Emoji or icon identifier
audio_url            TEXT        Optional: cloud-hosted MP3
scheduled_time       TIME        Suggested exercise time (HH:MM)
order_index          INT         Sequence order (1, 2, 3...)
session_type         TEXT        'morning'|'afternoon'|'evening'
reps_or_time_target  INT         Repetitions or duration target
```

**app_state** Table (Singleton)
```
Column             Type        Description
──────────────────────────────────────────────
id                 TEXT        Always 'singleton'
mode               TEXT        'task' (normal) | 'rest' (emergency)
current_task_id    UUID        Foreign key to tasks (unused in current design)
updated_at         TIMESTAMPTZ Last update timestamp
```

**completions** Table
```
Column             Type        Description
──────────────────────────────────────────────
id                 UUID        Primary key
task_id            UUID        Foreign key to tasks
date               DATE        Local date (YYYY-MM-DD)
status             TEXT        'completed' | 'skipped'
duration_seconds   INT         Exercise duration (null if skipped)
skip_reason        TEXT        'pain' | 'fatigue' | null
completed_at       TIMESTAMPTZ Server timestamp
```

#### Row Level Security (RLS)
- All tables have RLS enabled
- Current MVP: Public read/write access (TO anon)
  - Future: Implement authenticated user policies
  - Policies: SELECT, INSERT, UPDATE, DELETE per role/ownership
- Constraints:
  - session_type CHECK: must be NULL or one of 'morning'/'afternoon'/'evening'
  - status CHECK: must be 'completed' or 'skipped'
  - skip_reason CHECK: must be NULL or one of 'pain'/'fatigue'
  - Unique index: completions(task_id, date) WHERE status='completed' (prevents duplicate completion records)

#### Data Integrity
- Foreign key constraints ensure referential integrity (completions → tasks)
- Defaults ensure consistent data population:
  - tasks.order_index: 0
  - app_state.mode: 'task'
  - app_state.updated_at: now()
  - completions.date: CURRENT_DATE
  - completions.completed_at: now()

---

## User Workflows

### Workflow 1: Daily Exercise Session (Patient - Appa)

1. **Initial Load**: Patient navigates to app or lands on home page
2. **Role Selection**: Clicks "அப்பா" button to enter patient interface
3. **Session Check**: System verifies current time is within session window
   - If outside (before 6 AM or after 9 PM): Display rest screen
   - If inside: Show first incomplete task for the session
4. **Task Presentation**: Screen shows:
   - Hemiparesis figure (body part visualization)
   - Task name in Tamil
   - Repetition target
   - "தொடங்கு ▶️" (Start) and "தவிர்க்க" (Skip) buttons
5. **Patient Initiates Exercise**: Clicks "தொடங்கு ▶️"
   - Start time recorded (Date.now())
   - Screen transitions to active state
   - Breathing animation begins
   - "முடிந்தது ✅" button becomes primary action
6. **Patient Completes Exercise**: Clicks "முடிந்தது ✅"
   - Duration calculated: (now() - startTime) / 1000 (in seconds)
   - Completion record inserted: {task_id, date, status='completed', duration_seconds}
   - Audio chime plays (positive feedback)
   - Next task automatically loads (or session completion screen if all done)
7. **Repeat Steps 4–6** for all tasks in session
8. **Session Complete**: Shows celebration screen "🎉 இந்த நேரத்தின் பயிற்சிகள் முடிந்தது!"
   - Posture badge visible
   - Option to navigate to Amma screen

### Workflow 2: Skip Exercise (Patient - Appa)

1. **From Idle State**: Patient not ready to exercise, clicks "தவிர்க்க" (Skip)
2. **Skip Reason Selection**: Screen transitions to reason picker
3. **Select Reason**: Patient (or caregiver on their behalf) selects:
   - "🤕 வலி" (Pain) - Red option
   - "🥱 சோர்வு" (Fatigue) - Blue option
4. **Skip Recorded**: Completion record inserted: {task_id, date, status='skipped', skip_reason}
5. **Next Task Loads**: UI returns to idle state for next task
6. **Caregiver Visibility**: Amma screen immediately updates to show skipped status with reason

### Workflow 3: Emergency Rest (Caregiver - Amma)

1. **Patient Exercising**: Appa screen active, patient in middle of session
2. **Emergency Event**: Patient experiences pain flare, dizziness, or fatigue
3. **Caregiver Response**: Amma clicks SOS button on Amma screen
   - Button changes from "🆘 SOS - ஓய்வு" to "✅ ஓய்வு முடிந்தது"
   - app_state.mode set to 'rest'
4. **Patient-Side Impact**: Appa screen immediately shows RestScreen
   - "ஓய்வு எடுங்கள்" (Take rest) message
   - All exercise controls hidden
   - Exercise flow paused
5. **Resumption**: Caregiver clicks SOS button again when patient recovers
   - app_state.mode set back to 'task'
   - Appa screen returns to active exercise flow

### Workflow 4: Monitor Daily Progress (Caregiver - Amma)

1. **Amma Screen Load**: Displays header "இன்று: X முடிந்தது ✅" showing completed task count
2. **Check Daily Progress**: Caregiver scrolls to "DailyProgress" section
3. **View by Session**:
   - **Morning (காலை)**: Shows tasks completed between 6 AM–12 PM
   - **Afternoon (மதியம்)**: Shows tasks completed between 12 PM–5 PM
   - **Evening (மாலை)**: Shows tasks completed between 5 PM–9 PM
4. **Assess Task Status**:
   - Green checkmark ✅: Completed (with duration shown if available)
   - Red emoji 🤕: Skipped due to pain
   - Blue emoji 🥱: Skipped due to fatigue
   - Gray square ⬜: Not yet attempted today
5. **Identify Patterns**:
   - Multiple pain skips → discuss with clinician about pain management
   - Afternoon fatigue skips → consider lighter afternoon load
   - Improving durations → positive recovery progress
6. **Real-Time Updates**: Progress section auto-refreshes as patient completes tasks

### Workflow 5: Configure Exercise Tasks (Caregiver - Amma)

1. **Open Config Panel**: Amma clicks "⚙️ பயிற்சிகளை அமைக்கவும்" (Configure exercises)
2. **Expand Form**: TaskConfigForm component displays with all tasks
3. **Edit or Add Task**:
   - **Modify existing**: Edit tamil_text, scheduled_time, reps_or_time_target, icon, etc.
   - **Add new**: Create new task entry with all fields
   - **Delete**: Remove task (task deleted, associated completions cascaded if configured)
4. **Assign Session Time**:
   - Set scheduled_time (e.g., "08:00" for morning task)
   - System auto-determines session_type based on time:
     - < 12:00 → morning
     - < 17:00 → afternoon
     - >= 17:00 → evening
5. **Set Target**: Define reps_or_time_target (e.g., 10 for hand exercise = 10 repetitions)
6. **Save Changes**: Form submission updates Supabase tasks table
7. **Immediate Effect**: Appa screen updates with new task sequence on next page load

---

## User Experience (UX) Design Principles

### Design Language
- **Color Palette**:
  - Primary: Green (#059669) - Action buttons, completion states
  - Secondary: Amber/Orange (#B45309, #92400e) - Caregiver interface, navigation
  - Accent: Yellow (#FEF3C7) - Background, calming atmosphere
  - Status: Red (pain), Blue (fatigue), Gray (pending)
  - Warm, non-medical aesthetic to reduce anxiety

- **Typography**:
  - Large, accessible font sizes: 24px–48px
  - Bold weights for emphasis and CTAs
  - Tamil script supported (all text fully in Tamil)
  - 150% line-height for readability

- **Spacing & Layout**:
  - 8px grid system (Tailwind default)
  - Large buttons (h-40, h-36) for easy touch targets
  - Ample whitespace to reduce cognitive load
  - Max-width constraints (max-w-sm) for focus

- **Visual Feedback**:
  - Buttons: hover:brightness changes, active:scale-95 (press feedback)
  - Disabled states: opacity-50, cursor-not-allowed
  - Animations: Smooth breathing animation, transitions on mode changes
  - Audio: Chime on completion (playChime() function)

### Accessibility
- **Motor Accessibility**: Large touch targets (36–40px height), high contrast
- **Cognitive Accessibility**: Tamil language, simple language, emoji support, clear sequential flow
- **Visual Accessibility**: Readable color contrast, no color-only information, icons + text
- **Mobile-First**: Responsive design, works on phones/tablets, landscape/portrait
- **Error Handling**: Clear error messages in Tamil, retry buttons, no silent failures

### Responsive Design
- **Mobile (375px–480px)**: Full-screen layout, single-column, large buttons
- **Tablet (768px–1024px)**: Centered content, similar single-column (design not optimized for wide screens yet)
- **Desktop**: Centered content, similar experience

---

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v7 (SPA with three routes: /, /appa, /amma)
- **Styling**: Tailwind CSS v3 with PostCSS
- **Build Tool**: Vite (fast dev server, optimized production build)
- **State Management**: React hooks (useState, useEffect, useRef, useContext in future)
- **Client Library**: @supabase/supabase-js v2.57+
- **Icons**: Lucide React (alternative to emoji where needed)

### Backend & Database
- **Database**: Supabase (PostgreSQL-based)
- **RLS**: Row Level Security policies (currently public, future: authenticated)
- **Real-Time**: Supabase real-time subscriptions (polling fallback for compatibility)
- **Authentication**: Future: Supabase Auth (currently MVP without auth)

### Custom Hooks
- **useAppState()**: Fetches/manages app_state singleton (mode, current_task_id)
- **useCurrentSession()**: Determines active session window (morning/afternoon/evening)
- **useSessionTasks()**: Filters tasks for current session, manages refetch
- **useCompletions()**: Fetches completions for today, enables real-time updates

### Core Components
- **LandingPage**: Role selection (Appa/Amma)
- **AppaScreen**: Patient exercise interface with flow state machine
- **AmmaScreen**: Caregiver monitoring & config dashboard
- **HemiparesisFigure**: Visual representation of affected body part
- **BreathingAnimation**: Paced breathing guide during exercise
- **DailyProgress**: Session-grouped completion tracking
- **SOSButton**: Emergency rest toggle
- **TaskConfigForm**: CRUD interface for task library
- **RestScreen**: Emergency rest mode display
- **PostureBadge**: Current session indicator

### Utilities & Constants
- **supabase.ts**: Singleton Supabase client, helper functions (playChime, getLocalToday)
- **database.ts**: TypeScript types (Task, Completion, AppState, SessionType, etc.)

---

## Data Privacy and Security

### Current MVP (Development/Testing)
- **Public Access**: All data readable/writable by anonymous users (RLS TO anon)
- **No Authentication**: No user accounts, no session tokens
- **Use Case**: Single-device, in-home testing, trusted network
- **Data**: No sensitive PII (no names, addresses, medical IDs—only Tamil task descriptions and completion logs)

### Future Production Deployment
- **Implement User Authentication**:
  - Patient account with login
  - Caregiver account(s) tied to patient(s)
  - Role-based access control (RBAC): patient sees only their tasks, amma sees only their patients
  
- **RLS Policies** (post-auth):
  - Patient can only read/write their own completions
  - Caregiver can manage their assigned patients' tasks/completions
  - No cross-patient data leakage
  
- **Encryption**:
  - HTTPS for all API calls (Supabase SSL)
  - Consider HIPAA compliance if used in clinical setting
  - Audit logs for compliance

- **Data Retention**:
  - Define retention policies (e.g., 2 years of completion logs)
  - Anonymization for research use

---

## Success Metrics and KPIs

### Primary Metrics
1. **Daily Task Completion Rate**: % of prescribed exercises completed per day
   - Target: > 80% for engaged patients
   - Tracked: completions.status = 'completed' / total tasks

2. **Session Adherence**: Does patient start and complete all scheduled sessions?
   - Target: > 3 sessions per day (morning, afternoon, evening)
   - Tracked: app login frequency, session duration

3. **Skip Reason Trends**: Are skips due to pain, fatigue, or other?
   - Target: Identify pain vs. fatigue patterns for clinical adjustment
   - Tracked: completions.skip_reason counts over time

4. **Exercise Duration**: Does patient spend appropriate time on exercises?
   - Target: Duration within clinician-expected range
   - Tracked: completions.duration_seconds histogram

### Secondary Metrics
5. **Caregiver Engagement**: Does caregiver check progress daily?
   - Tracked: Amma screen access frequency

6. **SOS Event Frequency**: When are emergency rest events triggered?
   - Tracked: app_state.mode changes, frequency of 'rest' periods

7. **Task Completion Velocity**: Is recovery progressing? (durations decreasing, completions increasing?)
   - Tracked: Week-over-week completion rate, average duration trends

8. **User Retention**: Do patients continue using app daily?
   - Tracked: Daily active users (DAU), weekly active users (WAU)

---

## Future Enhancements and Roadmap

### Phase 1 (Current MVP)
- [x] Dual-interface (Appa/Amma) design
- [x] Session-time gating
- [x] Exercise sequencing and completion logging
- [x] Skip reason tracking
- [x] Emergency SOS/rest mode
- [x] Daily progress visualization
- [x] Task configuration panel
- [x] Tamil language interface

### Phase 2 (Post-MVP: Month 1–2)
- [ ] User authentication (Supabase Auth)
- [ ] Multi-patient support (one caregiver, multiple patients)
- [ ] Audio guides for exercises (MP3 playback)
- [ ] Caregiver notifications (push or email on missed sessions)
- [ ] Weekly and monthly progress reports
- [ ] Integration with physical therapist dashboard (read-only access)
- [ ] Photo/video capability (patient demonstrates exercise for caregiver review)

### Phase 3 (Months 3–6)
- [ ] Predictive analytics (flagging low adherence)
- [ ] Personalized exercise recommendations based on skip patterns
- [ ] Integration with wearables (heart rate, step count during exercise)
- [ ] Telemedicine consultation links (video call with therapist)
- [ ] Gamification (streaks, badges, leaderboards for motivation)
- [ ] Multi-language support (English, Tamil, other regional languages)
- [ ] Offline mode (complete exercises without internet, sync later)

### Phase 4 (Months 6–12)
- [ ] Clinical outcomes tracking (NIHSS, Fugl-Meyer, etc.)
- [ ] Integration with electronic health records (EHR) systems
- [ ] AI-powered form feedback (computer vision for exercise correctness)
- [ ] Caregiver support community (forums, peer group)
- [ ] Health insurance integration (tracking for coverage/billing)
- [ ] Export reports for clinical research

---

## Assumptions and Constraints

### Assumptions
1. **Single Device Per Pair**: Patient and caregiver share one device (or same user account initially)
2. **Stable Internet**: Assumes reliable WiFi or cellular connection
3. **Supervised Rehabilitation**: Caregiver is always present or reachable during exercise
4. **Motivated Patient**: Patient complies with exercise routine (app is tool, not enforcement)
5. **Clinical Guidance Exists**: Therapist or doctor has already prescribed specific exercises
6. **Tamil Language Preference**: Users prefer Tamil interface over English

### Technical Constraints
1. **No Offline Capability** (MVP): Requires internet connection
2. **No Real-Time Subscriptions** (Initial): Uses polling for progress updates
3. **No Audio Playback** (MVP): audio_url column exists but not yet implemented
4. **No Video** (MVP): Only text, emoji, and SVG visualizations
5. **Single Time Zone**: Assumes local device timezone; no multi-timezone support

### Regulatory/Clinical Constraints
1. **Not a Medical Device** (MVP): Marketed as wellness/organization tool, not clinical device
2. **No Diagnostic Features**: Does not diagnose or predict medical conditions
3. **No Prescription Management**: Does not manage medication or change medical advice
4. **Supervised Use**: Intended for use under caregiver/therapist supervision, not independent

---

## Glossary and Terminology

| Term | Tamil | Definition |
|------|-------|-----------|
| Meendum | மீண்டும் | "Again" – App name symbolizing repetition in rehab |
| Appa | அப்பா | "Father" – Patient interface role |
| Amma | அம்மா | "Mother" – Caregiver interface role |
| Session | நேரம் | Morning, Afternoon, or Evening time block |
| Task | பயிற்சி | Individual exercise (e.g., hand exercise, breathing) |
| Completion | முடிவு | Exercise successfully finished (status='completed') |
| Skip | தவிர்க்க | Exercise deliberately not performed (status='skipped') |
| Hemiparesis | ஒருபுறமை | Weakness/paralysis on one side of body (common post-stroke) |
| RLS | RLS | Row Level Security – Database access control layer |
| UUID | UUID | Universally Unique Identifier for database records |

---

## Appendix: API Reference (Frontend <-> Supabase)

### Sample Queries

#### Fetch Tasks for Current Session
```typescript
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('session_type', 'morning')
  .order('order_index', { ascending: true });
```

#### Insert Completion Record
```typescript
const { error } = await supabase.from('completions').insert({
  task_id: 'abc-123',
  date: '2026-04-28',
  status: 'completed',
  duration_seconds: 45
});
```

#### Fetch Today's Completions
```typescript
const { data } = await supabase
  .from('completions')
  .select('*')
  .eq('date', '2026-04-28');
```

#### Update App State to Rest Mode
```typescript
const { error } = await supabase
  .from('app_state')
  .update({ mode: 'rest', updated_at: new Date().toISOString() })
  .eq('id', 'singleton');
```

#### Fetch App State
```typescript
const { data } = await supabase
  .from('app_state')
  .select('*')
  .eq('id', 'singleton')
  .maybeSingle();
```

---

## End of Document

**Document Version**: 1.0  
**Last Updated**: 2026-04-28  
**Status**: Product Ready for MVP Testing  
**Owner**: Product Team  
**Contributors**: Engineering, UX, Clinical Advisory (implied)

---

### Sign-Off

This PRD comprehensively describes the Meendum stroke rehabilitation app, its purpose, features, user workflows, technical architecture, and future roadmap. The document is intended for:
- Development team (implementation reference)
- Clinical stakeholders (validation of medical appropriateness)
- Investors/stakeholders (business context and vision)
- Future team members (onboarding and context)

Questions, feedback, or updates should be tracked in a centralized issue tracker and reflected in updated PRD versions.
