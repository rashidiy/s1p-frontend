# Prompt Template for Complete Implementation

## 📝 Copy and Edit This Prompt

When you're ready for me to implement everything correctly, copy the text below, edit it as needed, and send it to me:

---

**PROMPT START**

I need you to build a complete Multi-Tenant CRM Platform based on the requirements in `PROJECT_REQUIREMENTS.md`.

## What I Need

### Phase 1: Setup and Foundation ✅
1. Install all dependencies
2. Set up environment configuration
3. Fix any TypeScript errors in existing files
4. Create reusable components (DataTable, EmptyState, LoadingSpinner, etc.)
5. Set up form validation with React Hook Form + Zod
6. Add toast notification system

### Phase 2: Authentication System
1. **Owner Authentication:**
   - `/owner/register` - Complete registration form with validation
   - `/owner/login` - Complete login form with error handling
   - Proper token storage and user state management

2. **Company User Authentication:**
   - `/login` - Company user login with role detection
   - `/register` - Company user registration
   - Proper token storage and user state management

3. **Protected Routes:**
   - Implement ProtectedRoute component properly
   - Initialize auth in root layout
   - Test role-based access control
   - Auto-redirect based on user type

### Phase 3: Owner Portal
1. **Dashboard** (`/owner/dashboard`):
   - Platform-wide metrics cards (companies, users, calls, revenue)
   - Recent activity feed from all companies
   - Quick actions
   - Charts showing trends

2. **Company Management** (`/owner/companies`):
   - List all companies with search, filters, pagination
   - Create new company form with provider configuration
   - View company details
   - Edit company (name, subdomain, provider config)
   - Activate/deactivate companies
   - Delete company with confirmation

3. **Analytics** (`/owner/analytics`):
   - Platform-wide statistics
   - Per-company breakdown
   - Top performing companies
   - Revenue trends

### Phase 4: Company Portal - Contacts Module
1. **List Page** (`/contacts`):
   - Data table with pagination
   - Search by name, email, phone
   - Filter options
   - Bulk actions
   - Show activity counts (leads, deals, calls)

2. **Create Page** (`/contacts/new`):
   - Form with validation
   - Fields: first_name*, last_name*, email, phone, company, position, address, tags, custom_fields
   - Success notification and redirect

3. **View Page** (`/contacts/[id]`):
   - Contact details
   - Activity timeline (calls, notes, tasks)
   - Related leads and deals
   - Edit and delete buttons

4. **Edit Page** (`/contacts/[id]/edit`):
   - Pre-filled form
   - Update functionality
   - Success notification

### Phase 5: Company Portal - Leads Module
1. **List Page** (`/leads`):
   - Pipeline view (Kanban board by stage)
   - Table view option
   - Search and filters (status, stage, assigned_to, value range)
   - Show: title, contact, status, stage, value, assigned user

2. **Create Page** (`/leads/new`):
   - Form with validation
   - Fields: title*, contact, status, pipeline_stage, estimated_value, probability, assigned_to, source, tags
   - Contact selection dropdown
   - Success notification

3. **View Page** (`/leads/[id]`):
   - Lead details
   - Contact information card
   - Activity timeline
   - Related tasks
   - Actions: Edit, Delete, Convert to Deal, Assign

4. **Edit Page** (`/leads/[id]/edit`):
   - Pre-filled form
   - Stage progression
   - Update functionality

5. **Convert Lead Feature**:
   - Dialog to confirm conversion
   - Option to create deal automatically
   - Mark as converted

### Phase 6: Company Portal - Deals Module
1. **List Page** (`/deals`):
   - Stage view (Kanban board)
   - Table view option
   - Pipeline summary (totals by stage)
   - Search and filters (stage, assigned_to, amount range, status)

2. **Create Page** (`/deals/new`):
   - Form with validation
   - Fields: title*, contact, lead, stage, probability, amount, expected_close_date, assigned_to
   - Pre-fill from lead if coming from lead conversion

3. **View Page** (`/deals/[id]`):
   - Deal details
   - Contact and lead info
   - Stage progression history
   - Activity timeline
   - Revenue tracking
   - Actions: Edit, Delete, Mark Won, Mark Lost

4. **Edit Page** (`/deals/[id]/edit`):
   - Pre-filled form
   - Stage movement
   - Update functionality

5. **Win/Lost Marking**:
   - Dialog for win reason
   - Dialog for loss reason
   - Final amount input for won deals

### Phase 7: Company Portal - Tasks Module
1. **List Page** (`/tasks`):
   - List view with checkboxes
   - Filter: my tasks, all tasks, completed, by priority, by due date
   - Sort options
   - Show overdue tasks highlighted

2. **Create Page** (`/tasks/new`):
   - Form with validation
   - Fields: title*, description, due_date, priority, assigned_to
   - Link to contact, lead, or deal
   - Success notification

3. **View Page** (`/tasks/[id]`):
   - Task details
   - Related entity information
   - Comments section
   - Actions: Edit, Delete, Mark Complete

4. **Edit Page** (`/tasks/[id]/edit`):
   - Pre-filled form
   - Update functionality

5. **Quick Complete**:
   - Checkbox in list to mark complete
   - Strike-through completed tasks

### Phase 8: Company Portal - Calls Module
1. **List Page** (`/calls`):
   - Call history table
   - Show: direction, phone numbers, duration, status, operator, timestamp, outcome
   - Show linked entities (contact, lead, deal)
   - Filters: direction, outcome, operator, date range, my_calls
   - Search by phone number

2. **View Page** (`/calls/[id]`):
   - Call details
   - Recording player (if available)
   - Transcription (if available)
   - Outcome and notes
   - Linked CRM entities
   - Actions: Set Outcome, Link to CRM

3. **Set Outcome Dialog**:
   - Outcome field
   - Notes field
   - Disposition dropdown
   - Follow-up actions

4. **Link to CRM Dialog**:
   - Search for contact
   - Search for lead
   - Search for deal
   - Create new contact option

### Phase 9: Company Portal - Analytics
1. **My Analytics** (`/analytics/me`):
   - Personal performance metrics
   - Calls statistics
   - Leads statistics
   - Deals statistics
   - Tasks statistics
   - Productivity score
   - Trends over time (charts)

2. **Team Analytics** (`/analytics/team`) (Manager/Admin only):
   - Team overview
   - Top performers
   - Activity distribution
   - Conversion rates
   - Team metrics
   - Individual operator cards with quick stats

3. **Operator Analytics** (`/analytics/operators/[id]`) (Manager/Admin only):
   - Individual operator detailed metrics
   - Performance trends
   - Comparison to team average

### Phase 10: Company Portal - User Management (Admin Only)
1. **List Page** (`/users`):
   - Team members table
   - Show: name, email, role, status, activity counts
   - Filter by role and status
   - Actions: Invite, View, Edit, Activate/Deactivate

2. **Invite Page** (`/users/invite`):
   - Invitation form
   - Fields: email*, first_name*, last_name*, role*
   - Send invitation
   - Success notification

3. **View Page** (`/users/[id]`):
   - User details
   - Activity summary
   - Performance metrics
   - Actions: Edit, Activate/Deactivate, Delete

4. **Edit Page** (`/users/[id]/edit`):
   - Update profile
   - Change role (admin only)
   - Update status

### Phase 11: Settings Pages
1. **Company Settings** (`/settings`) (Admin only):
   - Company information
   - Integration configuration
   - User preferences
   - Notification settings

2. **Owner Settings** (`/owner/settings`):
   - Owner profile
   - Platform settings
   - Billing information

### Phase 12: Polish and Testing
1. Add loading states to all pages
2. Add error boundaries
3. Add toast notifications for all actions
4. Add confirmation dialogs for destructive actions
5. Add breadcrumbs for navigation
6. Add empty states with helpful messages
7. Test all user flows end-to-end
8. Fix any bugs found during testing

## Requirements

### Technical Stack
- Next.js 15 with App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod for forms
- Axios for API calls
- Zustand for state management
- Toast notifications (sonner or react-hot-toast)

### Code Quality
- Type-safe throughout
- Reusable components
- Clean, readable code
- Proper error handling
- Loading states everywhere
- Responsive design
- Accessibility considerations

### Testing Checklist
After implementation, I need to test:
- [ ] Owner registration and login
- [ ] Company creation with SIPUNI/Binotel config
- [ ] Company user registration and login
- [ ] Role-based navigation (Owner, Admin, Manager, Operator)
- [ ] Contacts full CRUD
- [ ] Leads full CRUD and conversion
- [ ] Deals full CRUD and win/lost
- [ ] Tasks full CRUD and completion
- [ ] Calls viewing and linking
- [ ] Analytics dashboards (all levels)
- [ ] User invitation and management
- [ ] Token refresh on 401
- [ ] Protected routes blocking unauthorized access

## Important Notes

1. **Use existing types and API client**: Don't recreate these, they're already in `/src/types/api.ts` and `/src/lib/api.ts`

2. **Follow the file structure** in `PROJECT_REQUIREMENTS.md`

3. **Implement role-based permissions** properly:
   - Owners can only access `/owner/*` routes
   - Company users can only access company routes
   - Operators cannot see Analytics or Team
   - Managers can see Analytics but not Team
   - Admins have full company access

4. **Use reusable components** to avoid duplication:
   - DataTable for all list pages
   - FormField for form inputs
   - EmptyState for empty lists
   - LoadingSpinner for loading states

5. **Add proper error handling**:
   - Try-catch blocks in all API calls
   - Show error toast on failures
   - Show success toast on success
   - Form validation errors

6. **Make it production-ready**:
   - No console.logs in production code
   - Proper loading states
   - Proper error states
   - Mobile responsive
   - Fast performance

## Priorities

**MUST HAVE:**
- Authentication (owner + company)
- Protected routes with proper role checks
- Contacts, Leads, Deals full CRUD
- Role-based sidebar navigation
- Basic analytics dashboards

**NICE TO HAVE:**
- Advanced filtering
- Bulk operations
- Export features
- Advanced charts
- Real-time updates

## Questions Before Starting

1. Do you want me to install dependencies first, or assume they're installed?
2. Should I create all pages at once, or phase by phase?
3. Do you want me to use a specific toast notification library?
4. Any specific charting library preference? (recharts, chart.js, etc.)
5. Should I create database migrations or just frontend?

**PROMPT END**

---

## How to Use This Prompt

1. **Read through the entire prompt above**
2. **Edit any sections** you want to change:
   - Remove features you don't need
   - Add features you want
   - Change priorities
   - Adjust technical requirements
3. **Answer the questions** at the bottom
4. **Copy the edited prompt** and send it to me
5. **I'll implement everything** following your specifications

## Alternative: Phased Approach

If you prefer a phased approach, you can ask me to do one section at a time:

**Example:**
> "Start with Phase 1 and Phase 2 only. Set up the foundation and authentication system. Stop after that so I can test."

Then after testing:
> "Now do Phase 3 - Owner Portal"

And continue phase by phase.

---

**This gives you full control over what gets built and how.**
