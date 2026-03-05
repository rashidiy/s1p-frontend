# S1P - Multi-Tenant CRM Platform Requirements

## 📋 PROJECT OVERVIEW

Build a complete **Multi-Tenant Call Center CRM Platform** with two separate portals:

1. **Owner Portal** - Platform administrators manage multiple companies
2. **Company Portal** - Company staff (Admin, Manager, Operator) manage their CRM

---

## 🏗️ ARCHITECTURE

### Multi-Tenant Structure
```
OWNER (Platform Level)
├── Company A
│   ├── Admin Users
│   ├── Manager Users
│   └── Operator Users
├── Company B
│   ├── Admin Users
│   ├── Manager Users
│   └── Operator Users
└── Company C
    └── ... (same structure)
```

### User Roles & Permissions

**OWNER (Platform Level)**
- Full access to platform
- Can create/manage multiple companies
- View platform-wide analytics across all companies
- Configure company settings and providers

**COMPANY ADMIN**
- Full access to their company's CRM
- Manage team members (invite, activate, deactivate)
- Access all CRM modules
- View team analytics
- Configure company settings

**COMPANY MANAGER**
- Access all CRM modules (Contacts, Leads, Deals, Tasks, Calls)
- View team analytics
- Cannot manage team members
- Cannot access settings

**COMPANY OPERATOR**
- Access CRM modules (Contacts, Leads, Deals, Tasks, Calls)
- Cannot view analytics
- Cannot manage team members
- Cannot access settings

---

## 🎯 FUNCTIONAL REQUIREMENTS

### 1. OWNER PORTAL

#### Authentication
- **Registration** `/owner/register`
  - Email, password, first name, last name, phone
  - Creates platform owner account

- **Login** `/owner/login`
  - Email and password
  - Returns JWT token
  - Stores user_type as "owner"

#### Dashboard `/owner/dashboard`
- **Platform-wide metrics:**
  - Total companies (active/inactive)
  - Total users across all companies
  - Total calls across all companies
  - Total revenue from all deals
  - Recent activity feed from all companies

#### Company Management `/owner/companies`
- **List all companies** with:
  - Company name, subdomain
  - Provider type (SIPUNI/Binotel)
  - Active/Inactive status
  - User count, call count, deal count
  - Created date

- **Create company** `/owner/companies/new`
  - Company name
  - Subdomain (optional)
  - Provider type: SIPUNI or Binotel
  - Provider configuration (JSON):
    - For SIPUNI: `{cabinet_id, api_key, user_id}`
    - For Binotel: `{api_key, secret_key}`
  - Company settings (optional JSON)

- **View company details** `/owner/companies/[id]`
  - Company info
  - Provider configuration
  - User list
  - Activity summary

- **Edit company** `/owner/companies/[id]/edit`
  - Update name, subdomain
  - Update provider config
  - Update settings

- **Activate/Deactivate company**
  - POST `/api/v1/owner/companies/{id}/activate`
  - POST `/api/v1/owner/companies/{id}/deactivate`

#### Analytics `/owner/analytics`
- Platform-wide statistics
- Per-company breakdown
- Trends over time
- Top performing companies

---

### 2. COMPANY PORTAL

#### Authentication
- **Registration** `/register`
  - Email, password, first name, last name, phone
  - Role assignment (handled by admin invite)
  - Creates company user account

- **Login** `/login`
  - Email and password
  - Returns JWT token
  - Stores user_type as "company_user"

#### Dashboard `/dashboard`
- **Role-based dashboard:**

  **For Operators:**
  - My tasks today
  - My recent calls
  - My leads/deals summary
  - Personal productivity score

  **For Managers & Admins:**
  - Team overview
  - Team performance metrics
  - Recent team activity
  - Top performers

#### Contacts Module `/contacts`
- **List contacts** with pagination, search, filters
  - Show: name, email, phone
  - Show activity counts: leads, deals, calls
  - Filter by: has_leads, has_deals, created date range

- **Create contact** `/contacts/new`
  - First name, last name (required)
  - Email, phone, company, position
  - Address, tags, custom fields

- **View contact** `/contacts/[id]`
  - Contact details
  - Activity timeline (calls, notes, tasks)
  - Related leads and deals
  - Recent interactions

- **Edit contact** `/contacts/[id]/edit`
  - Update all fields

- **Delete contact**
  - With confirmation

- **Bulk create contacts**
  - Import from CSV/JSON

#### Leads Module `/leads`
- **List leads** with pipeline view
  - Show: title, contact name, status, stage, value
  - Show: assigned user, created date
  - Filter by: status, stage, assigned_to, value range, date range
  - Sort by: created_at, estimated_value, updated_at

- **Create lead** `/leads/new`
  - Title (required)
  - Contact (link to existing contact)
  - Status, pipeline stage
  - Estimated value, probability
  - Assigned to (user)
  - Source, tags

- **View lead** `/leads/[id]`
  - Lead details
  - Contact information
  - Activity timeline
  - Related tasks
  - Conversion status

- **Edit lead** `/leads/[id]/edit`
  - Update all fields
  - Move through pipeline stages

- **Convert lead**
  - Convert lead to deal
  - Option to create deal automatically
  - Mark as converted

- **Assign lead**
  - Assign to team member

#### Deals Module `/deals`
- **List deals** with stage view
  - Show: title, contact name, stage, amount
  - Show: assigned user, probability, close date
  - Filter by: stage, assigned_to, amount range, date range, status
  - Sort by: created_at, amount, close_date

- **Create deal** `/deals/new`
  - Title (required)
  - Contact (link to existing contact)
  - Lead (optional, if converted from lead)
  - Stage, probability
  - Amount, expected close date
  - Assigned to

- **View deal** `/deals/[id]`
  - Deal details
  - Contact and lead information
  - Stage progression history
  - Activity timeline
  - Revenue tracking

- **Edit deal** `/deals/[id]/edit`
  - Update all fields
  - Move through stages

- **Mark as Won**
  - Close deal as won
  - Record win reason
  - Final amount

- **Mark as Lost**
  - Close deal as lost
  - Record loss reason

- **Pipeline summary**
  - GET `/api/v1/company/deals/pipeline-summary`
  - Shows deals by stage with totals

#### Tasks Module `/tasks`
- **List tasks** with filters
  - Show: title, description, due date, priority
  - Show: assigned user, status, related entity
  - Filter by: assigned_to, is_completed, priority, due date range
  - Sort by: due_date, priority, created_at

- **Create task** `/tasks/new`
  - Title, description
  - Due date, priority (high/medium/low)
  - Assigned to
  - Link to: contact, lead, or deal

- **View task** `/tasks/[id]`
  - Task details
  - Related entity info
  - Comments/notes

- **Edit task** `/tasks/[id]/edit`
  - Update all fields

- **Complete task**
  - Mark as completed
  - Record completion notes

- **My tasks today**
  - GET `/api/v1/company/tasks/my-tasks-today`
  - Quick view of today's tasks

#### Calls Module `/calls`
- **Call history** `/calls`
  - Show: direction, phone numbers, duration, status
  - Show: operator name, timestamp, outcome
  - Show: linked contact/lead/deal
  - Filter by: direction, outcome, operator, date range, contact, lead, deal
  - Option: my_calls (only my calls)

- **View call** `/calls/[id]`
  - Call details
  - Recording playback (if available)
  - Transcription (if available)
  - Outcome and notes
  - Linked CRM entities

- **Set call outcome**
  - Update call with outcome
  - Add notes and disposition
  - Set follow-up actions

- **Link call to CRM**
  - Link to existing contact
  - Link to existing lead
  - Link to existing deal

- **Make call** (if supported by provider)
  - Initiate outbound call
  - Select from number
  - Call tracking

#### Analytics Module `/analytics` (Manager & Admin only)
- **My performance** `/analytics/me`
  - Personal metrics
  - Calls, leads, deals, tasks statistics
  - Productivity score
  - Trends over time

- **Team performance** `/analytics/team` (Admin/Manager)
  - Team overview
  - Top performers
  - Activity distribution
  - Conversion rates

- **Operator performance** `/analytics/operators/[id]` (Admin/Manager)
  - Individual operator metrics
  - Detailed breakdown

#### User Management `/users` (Admin only)
- **List team members**
  - Show: name, email, role, status
  - Show: activity counts
  - Filter by: role, is_active

- **Invite user** `/users/invite`
  - Email
  - First name, last name
  - Role (Admin/Manager/Operator)
  - Sends invitation email

- **View user** `/users/[id]`
  - User details
  - Activity summary
  - Performance metrics

- **Edit user** `/users/[id]/edit`
  - Update profile
  - Change role (Admin only)

- **Activate/Deactivate user**
  - Toggle user status

#### Settings `/settings` (Admin only)
- Company settings
- Integration configuration
- User preferences
- Notification settings

---

## 🎨 UI/UX REQUIREMENTS

### General
- Clean, modern design
- Responsive (desktop, tablet, mobile)
- Fast loading times
- Intuitive navigation
- Consistent styling with shadcn/ui

### Navigation
- **Sidebar** with role-based menu items
- **Role badge** showing user role (Owner/Admin/Manager/Operator)
- **User profile** in sidebar with avatar
- **Logout** button in sidebar

### Dashboard
- **Stat cards** with icons and trend indicators
- **Recent activity feed** with timestamps
- **Quick actions** for common tasks
- **Charts/graphs** for visual data representation

### Lists/Tables
- **Pagination** with page size options
- **Search bar** at top
- **Filters** in sidebar or dropdown
- **Sort options** in column headers
- **Bulk actions** where applicable
- **Empty states** with helpful messages

### Forms
- **Clear labels** and placeholder text
- **Validation** with error messages
- **Loading states** during submission
- **Success/error notifications**
- **Cancel** and **Save** buttons

### Detail Views
- **Header** with entity name and actions
- **Tabs** for different sections
- **Activity timeline** showing chronological events
- **Related entities** as clickable cards
- **Edit/Delete** actions where permitted

---

## 🔒 SECURITY & PERMISSIONS

### Authentication
- JWT token-based auth
- Automatic token refresh
- Secure password requirements
- Session timeout

### Authorization
- Role-based access control (RBAC)
- Owner routes require owner token
- Company routes require company user token
- Admin features require admin role
- Manager features require manager+ role
- Protected route wrapper component

### Data Access
- Owners see all companies' data
- Company users only see their company's data
- Operators only see their own data + team data
- Managers see team data
- Admins see all company data

---

## 📁 REQUIRED FILE STRUCTURE

```
src/
├── app/
│   ├── (company)/                    # Company user routes
│   │   ├── layout.tsx               # Protected company layout
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Company dashboard
│   │   ├── contacts/
│   │   │   ├── page.tsx            # List contacts
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create contact
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View contact
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit contact
│   │   ├── leads/
│   │   │   ├── page.tsx            # List leads
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create lead
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View lead
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit lead
│   │   ├── deals/
│   │   │   ├── page.tsx            # List deals
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create deal
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View deal
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit deal
│   │   ├── tasks/
│   │   │   ├── page.tsx            # List tasks
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create task
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View task
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit task
│   │   ├── calls/
│   │   │   ├── page.tsx            # Call history
│   │   │   └── [id]/
│   │   │       └── page.tsx        # View call
│   │   ├── analytics/
│   │   │   ├── page.tsx            # Analytics dashboard
│   │   │   ├── me/
│   │   │   │   └── page.tsx        # My analytics
│   │   │   ├── team/
│   │   │   │   └── page.tsx        # Team analytics
│   │   │   └── operators/
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Operator analytics
│   │   ├── users/
│   │   │   ├── page.tsx            # List users (Admin only)
│   │   │   ├── invite/
│   │   │   │   └── page.tsx        # Invite user (Admin only)
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View user
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit user
│   │   └── settings/
│   │       └── page.tsx            # Settings (Admin only)
│   │
│   ├── owner/                        # Owner portal routes
│   │   ├── layout.tsx               # Protected owner layout
│   │   ├── login/
│   │   │   └── page.tsx            # Owner login
│   │   ├── register/
│   │   │   └── page.tsx            # Owner register
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Owner dashboard
│   │   ├── companies/
│   │   │   ├── page.tsx            # List companies
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create company
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # View company
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit company
│   │   ├── analytics/
│   │   │   └── page.tsx            # Platform analytics
│   │   └── settings/
│   │       └── page.tsx            # Owner settings
│   │
│   ├── login/
│   │   └── page.tsx                # Company user login
│   ├── register/
│   │   └── page.tsx                # Company user register
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Route protection
│   ├── layout/
│   │   └── Sidebar.tsx             # Role-aware sidebar
│   ├── contacts/
│   │   ├── ContactForm.tsx         # Contact form
│   │   ├── ContactCard.tsx         # Contact card
│   │   └── ContactList.tsx         # Contact list
│   ├── leads/
│   │   ├── LeadForm.tsx            # Lead form
│   │   ├── LeadCard.tsx            # Lead card
│   │   └── LeadPipeline.tsx        # Pipeline view
│   ├── deals/
│   │   ├── DealForm.tsx            # Deal form
│   │   ├── DealCard.tsx            # Deal card
│   │   └── DealStages.tsx          # Stages view
│   ├── tasks/
│   │   ├── TaskForm.tsx            # Task form
│   │   ├── TaskCard.tsx            # Task card
│   │   └── TaskList.tsx            # Task list
│   ├── calls/
│   │   ├── CallCard.tsx            # Call card
│   │   └── CallPlayer.tsx          # Recording player
│   ├── analytics/
│   │   ├── StatCard.tsx            # Stat card
│   │   ├── Chart.tsx               # Chart component
│   │   └── ActivityFeed.tsx        # Activity feed
│   └── ui/                          # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       └── ... (other UI components)
│
├── lib/
│   ├── api.ts                       # API client with all endpoints
│   └── utils.ts                     # Utility functions
│
├── store/
│   └── auth.ts                      # Multi-tenant auth store
│
└── types/
    └── api.ts                       # TypeScript types from OpenAPI
```

---

## 🔌 API INTEGRATION

### Base URL
- Development: `http://localhost:8000`
- Production: Configure via environment variable

### Authentication Flow
1. User logs in (owner or company user)
2. Backend returns: `{ access: "token", refresh: "token" }`
3. Store tokens in localStorage
4. Store user data and user_type in localStorage
5. Attach access token to all requests via interceptor
6. Auto-refresh token on 401 errors

### API Client Organization
```typescript
class ApiClient {
  // Token Management
  setToken(access: string, refresh?: string)
  getToken()
  clearToken()
  refreshToken()

  // Company User Auth
  register(data)
  login(credentials)
  getProfile()

  // Owner Auth
  ownerRegister(data)
  ownerLogin(credentials)
  getOwnerProfile()

  // Owner - Companies
  getCompanies(filters)
  createCompany(data)
  getCompany(id)
  updateCompany(id, data)
  deleteCompany(id)
  activateCompany(id)
  deactivateCompany(id)

  // Owner - Analytics
  getOwnerDashboard()
  getOwnerAnalytics(period)

  // Company - Contacts
  getContacts(filters)
  createContact(data)
  getContact(id)
  updateContact(id, data)
  deleteContact(id)
  bulkCreateContacts(data)

  // Company - Leads
  getLeads(filters)
  createLead(data)
  getLead(id)
  updateLead(id, data)
  deleteLead(id)
  convertLead(id, createDeal)
  assignLead(id, userId)

  // Company - Deals
  getDeals(filters)
  createDeal(data)
  getDeal(id)
  updateDeal(id, data)
  deleteDeal(id)
  markDealWon(id, reason)
  markDealLost(id, reason)
  getPipelineSummary()

  // Company - Tasks
  getTasks(filters)
  createTask(data)
  getTask(id)
  updateTask(id, data)
  deleteTask(id)
  completeTask(id)
  getMyTasksToday()

  // Company - Calls
  getCalls(filters)
  getCall(id)
  setCallOutcome(id, data)
  linkCall(id, data)
  makeCall(data)
  getCallRecording(id)

  // Company - Analytics
  getMyDashboard()
  getAdminDashboard()
  getMyAnalytics(period)
  getTeamAnalytics(period)
  getOperatorAnalytics(operatorId, period)

  // Company - Users
  getUsers(filters)
  inviteUser(data)
  getUser(id)
  updateUser(id, data)
  deleteUser(id)
  activateUser(id)
  deactivateUser(id)
}
```

---

## ✅ ACCEPTANCE CRITERIA

### Owner Portal
- [ ] Owner can register and login
- [ ] Owner can create companies with provider config
- [ ] Owner can view list of all companies
- [ ] Owner can activate/deactivate companies
- [ ] Owner dashboard shows platform-wide metrics
- [ ] Owner can view analytics across all companies

### Company Portal - Authentication
- [ ] Company users can register and login
- [ ] Users are correctly assigned roles
- [ ] Role badge displays in sidebar
- [ ] Logout redirects to correct login page

### Company Portal - CRM Modules
- [ ] Contacts: Full CRUD operations work
- [ ] Leads: Can create, edit, convert to deals
- [ ] Deals: Can create, edit, mark won/lost
- [ ] Tasks: Can create, edit, mark complete
- [ ] Calls: Can view history, set outcomes, link to CRM

### Company Portal - Analytics
- [ ] Operators see personal dashboard
- [ ] Managers/Admins see team dashboard
- [ ] Analytics show correct metrics
- [ ] Charts and graphs render correctly

### Company Portal - User Management
- [ ] Admins can invite users with roles
- [ ] Admins can activate/deactivate users
- [ ] Non-admins cannot access user management
- [ ] Role-based permissions work correctly

### Navigation & UI
- [ ] Sidebar shows correct menu based on role
- [ ] All routes are protected appropriately
- [ ] Forms have validation
- [ ] Lists have pagination and search
- [ ] Empty states show helpful messages
- [ ] Loading states work correctly

### Security
- [ ] Tokens are stored securely
- [ ] Token refresh works automatically
- [ ] Unauthorized access is blocked
- [ ] Owner cannot access company routes
- [ ] Company users cannot access owner routes
- [ ] Operators cannot access admin features

---

## 🎯 SUCCESS METRICS

### Functional
- All CRUD operations work without errors
- All role-based permissions enforce correctly
- All analytics dashboards load with real data
- All forms validate and submit successfully

### Performance
- Pages load in < 2 seconds
- API calls complete in < 500ms
- No memory leaks
- Smooth navigation between pages

### User Experience
- Intuitive navigation
- Clear visual hierarchy
- Responsive on all devices
- Helpful error messages
- Consistent design language

---

## 📝 NOTES

### Current Issues to Fix
1. Install dependencies: `npm install`
2. Ensure all components import correctly
3. Fix TypeScript errors
4. Ensure all API endpoints match backend
5. Test all user flows end-to-end

### Priority Order
1. **HIGH**: Auth system (owner + company login/register)
2. **HIGH**: Role-based routing and permissions
3. **HIGH**: Core CRM modules (Contacts, Leads, Deals)
4. **MEDIUM**: Tasks and Calls modules
5. **MEDIUM**: Analytics dashboards
6. **MEDIUM**: User management
7. **LOW**: Advanced features (bulk import, exports, etc.)

### Environment Setup
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📞 SIPUNI/Binotel Integration

### SIPUNI Configuration
```json
{
  "cabinet_id": "string",
  "api_key": "string",
  "user_id": "string"
}
```

### Binotel Configuration
```json
{
  "api_key": "string",
  "secret_key": "string"
}
```

---

## 🚀 DEPLOYMENT

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Testing
- Test owner registration → company creation → user invitation flow
- Test all CRM CRUD operations
- Test role-based permissions
- Test analytics dashboards
- Test token refresh mechanism

---

**REVIEW THIS DOCUMENT CAREFULLY AND EDIT AS NEEDED BEFORE STARTING IMPLEMENTATION**
