# Personal Task & Finance Organizer — Implementation Plan

## 1. Project goal

Build a private, mobile-friendly personal life-management application that helps me manage:

- Work tasks and deadlines
- Bills, EMIs, debts, and repayments
- Income, expenses, budgets, and savings goals
- Career learning, courses, and job applications
- Personal routines and habits
- Notes, ideas, and things to remember

The app should help answer four questions each day:

1. What must I finish today?
2. What money do I need to pay, and when?
3. What should I learn or improve for my career?
4. What have I forgotten, delayed, or overspent on?

Build a useful MVP first, then add advanced features gradually.

---

## 2. Recommended technology stack

| Area | Choice | Purpose |
|---|---|---|
| Frontend | Next.js App Router + React + TypeScript | Responsive UI and client dashboard views |
| Backend | Python Django + Django REST Framework (DRF) | API routes, business logic, validation, and ORM |
| Database | PostgreSQL (`tododb`) | Relational storage for tasks, transactions, debts, habits, and user settings |
| Database Driver | `psycopg2-binary` / `psycopg` | High-performance PostgreSQL connection |
| Cloud Storage | Google Cloud Storage (GCS) | Cloud storage integration (`magnus-placement-test`) |
| Styling | Tailwind CSS + shadcn/ui | Responsive, consistent interface |
| Authentication | Django Auth / SimpleJWT / Session | Secure login and user session management |
| Scheduling | Celery / external cron / management command | Trigger reminder processing |
| Source control | GitHub | Version control and deployment workflow |
| PWA | Web app manifest and service worker | Install the app on a phone in a later phase |

### Database and Backend decision

The backend is built with **Python Django and PostgreSQL (`tododb`)**. PostgreSQL provides ACID compliance, strong decimal precision for currency amounts, relational integrity with foreign keys, and performant indexing for complex financial and task queries. Django REST Framework powers the REST API endpoints consumed by the Next.js frontend.

---

## 3. Main application modules

### 3.1 My Day — daily dashboard

- Overdue, due today, and upcoming tasks
- Work priorities and personal goals
- Quick-add task button
- Daily completion progress
- A short list of the most important tasks
- Upcoming financial commitments

### 3.2 My Money — finance and dues

- Income, such as salary and other earnings
- Fixed expenses: EMI, rent, subscriptions, and recurring bills
- Variable expenses: food, transport, shopping, gym, and miscellaneous spending
- Debt tracker: money owed or lent, remaining balance, repayment history, and due dates
- Savings goals: emergency fund and planned purchases
- Payment calendar
- Monthly spending breakdown and budget progress

**Important:** A payment reminder is not a transaction. Creating an EMI reminder must not automatically mark it as paid. Record the expense only when payment is confirmed. Track borrowed or lent money separately from ordinary expenses to avoid misleading reports.

### 3.3 My Growth — career and learning

- AI course lessons and assignments
- Python, Django, Next.js, and other learning goals
- Interview preparation
- Job applications and follow-ups
- Weekly learning hours
- Projects, achievements, and career milestones

### 3.4 My Schedule — calendar and routines

- Work deadlines and meetings
- Recurring bills and subscriptions
- Gym and personal routines
- Weekly planning
- Important dates

### 3.5 My Habits — consistency tracker

- Workout and study consistency
- Daily habits and personal goals
- Weekly streaks and completion history
- Optional habit reminders

### 3.6 My Inbox — quick capture

- Quick notes and ideas
- Tasks without a scheduled date
- Things to buy later
- Follow-ups and decisions to make

---

## 4. Finance dashboard

The dashboard should calculate totals from current settings and recorded transactions rather than relying on hard-coded amounts.

Previously discussed figures can be used as editable starting values, not assumed to be current:

| Item | Example starting value |
|---|---:|
| Monthly income | ₹15,000 |
| EMI commitment | ₹4,500 |
| Income after EMI | ₹10,500 |
| Savings target | ₹1,000 |

These figures do not account for other expenses or debts. Let the user update them in Settings.

### Finance features

- Income and expense tracking
- Monthly budgets by category
- EMI and recurring bill schedule
- Debt and repayment tracker
- Savings goals
- Payment status: upcoming, due, overdue, paid, or skipped
- Monthly totals and transaction history
- Optional planned-purchase tracker

Store amounts as integer paise (for example, ₹150.50 = `15050`) or use a carefully chosen decimal representation. Avoid floating-point arithmetic for money.

---

## 5. Data model (PostgreSQL & Django ORM)

Use normalized PostgreSQL tables with foreign keys and Django models. Avoid monolithic tables.

| Table / Model | Purpose |
|---|---|
| `users` (`User`) | User identity, timezone, and preferences |
| `tasks` (`Task`) | Work, personal, finance, and learning tasks |
| `recurring_rules` (`RecurringRule`) | Rules for repeating tasks and payment schedules |
| `finance_transactions` (`Transaction`) | Income, expenses, debt repayments, and transfers |
| `debts` (`Debt`) | Money owed or lent, counterparties, and repayment status |
| `budgets` (`Budget`) | Monthly budgets by category |
| `reminders` (`Reminder`) | Scheduled reminders, delivery status, and retry information |
| `habits` (`Habit`) | Habit definitions and targets |
| `learning_goals` (`LearningGoal`) | Career milestones and study hours |
| `job_applications` (`JobApplication`) | Job search pipeline and interview stages |
| `notes` (`Note`) | Quick notes, ideas, and inbox items |
| `user_settings` (`UserSettings`) | Dashboard defaults, monthly budgets, and currency settings |

### Example Django Task Model

```python
class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, choices=TaskCategory.choices, default=TaskCategory.PERSONAL)
    priority = models.CharField(max_length=20, choices=TaskPriority.choices, default=TaskPriority.MEDIUM)
    status = models.CharField(max_length=20, choices=TaskStatus.choices, default=TaskStatus.TODO)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_important = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Example Django Finance Transaction Model

```python
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100, default='OTHER')
    date = models.DateTimeField(default=timezone.now)
    is_recurring = models.BooleanField(default=False)
    related_debt = models.ForeignKey('Debt', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
```

### Data-model rules

- Every user-owned record is scoped by user relation (`user_id`).
- Scope every query to the authenticated user.
- Store recurring rules separately from individual occurrences.
- Use PostgreSQL DecimalField for financial transactions to guarantee exact monetary calculations.
- Store timestamps consistently in UTC in the database and display them in the user's timezone (`Asia/Kolkata`).
- Keep transaction records separate from task completion state.
- Add indexes on foreign keys, status, due dates, and reminder scheduled times.

---

## 6. Reminder system

### Suggested default reminders

| Item | Default reminder |
|---|---|
| Important task | 1 day before |
| Payment due | 3 days and 1 day before |
| Urgent task | 1 hour before |
| Morning summary | 8:00 AM IST |
| Overdue payment | Daily, with a configurable limit |

Allow the user to configure these defaults.

### Reminder processing flow

1. When a task or recurring payment is saved, calculate the required reminder times.
2. Store reminder records with a delivery status and timezone-aware schedule.
3. A scheduled endpoint queries reminders that are due and not yet sent.
4. Claim each reminder safely so overlapping scheduler runs cannot send duplicates.
5. Send the email or push notification.
6. Record success or failure and retry temporary failures safely.
7. When a recurring item is completed or paid, generate the next occurrence and its reminders according to the recurrence rule.

### Scheduling considerations

- Protect scheduled endpoints with a secret authorization header.
- Do not rely on an always-running `node-cron` process in a serverless deployment.
- Use an external scheduler or hosting plan that supports the required frequency.
- Check the current hosting provider's cron limits before choosing a deployment plan.
- Make processing idempotent to prevent duplicate notifications or financial records.
- Store times consistently and display them in `Asia/Kolkata` by default.

### Notification phases

1. **MVP:** In-app overdue indicators and email reminders.
2. **Phase 2:** Daily summary email.
3. **Phase 3:** PWA installation and browser/push notifications.

---

## 7. Pages and navigation

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/dashboard` | Today's priorities and financial overview |
| Tasks | `/tasks` | All tasks, filters, and recurring work |
| Finance | `/finance` | Transactions, budgets, debts, and dues |
| Calendar | `/calendar` | Tasks and payments by date |
| Growth | `/growth` | Courses, study plans, and job applications |
| Habits | `/habits` | Routines and weekly consistency |
| Notes & Inbox | `/inbox` | Ideas, quick capture, and unscheduled items |
| Settings | `/settings` | Profile, security, and notification preferences |
| Login | `/login` | Sign in |
| Signup | `/signup` | Account creation, if needed |

Use a sidebar on desktop and bottom navigation on mobile. Keep a quick-add action easy to access.

---

## 8. Suggested project structure

```text
personal-organizer/
├── backend/                       # Python Django Backend
│   ├── core/                      # Project settings and root routing
│   │   ├── __init__.py
│   │   ├── settings.py            # PostgreSQL (tododb), CORS, DRF, GCS
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── api/                       # DRF Application
│   │   ├── migrations/
│   │   ├── models.py              # Task, Transaction, Debt, Habit, LearningGoal, JobApp, Note, Settings
│   │   ├── serializers.py         # DRF Serializers
│   │   ├── views.py               # REST API Views (Dashboard, Tasks, Finance, Growth, etc.)
│   │   └── urls.py                # Endpoint routing
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                       # Backend PostgreSQL and GCP credentials
├── src/                           # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx               # Next.js dashboard client
│   ├── components/                # DashboardView, TasksView, FinanceView, HabitsView, etc.
│   └── lib/
├── next.config.ts                 # Next.js reverse-proxy rewrites to Django backend
├── package.json
└── .env                           # Environment variables
```

Keep business logic, database transactions, and data models in the Django backend. Validate input with Django REST Framework serializers and verify authorization for every sensitive operation.

---

## 9. Development roadmap

Plan for approximately **6–8 weeks at 5–7 hours per week**, alongside full-time work.

### Week 1 — Foundation

- Create the Next.js project with TypeScript.
- Configure Tailwind CSS and shadcn/ui.
- Connect PostgreSQL (`tododb`) and configure Django models.
- Implement authentication and protected routes.
- Set up environment variables and `.env.example`.

### Week 2 — Task management

- Create, edit, complete, and delete tasks.
- Add categories, priorities, and due dates.
- Build Today, Overdue, and Upcoming views.
- Add search and basic filters.

### Week 3 — Finance

- Add income and expense records.
- Implement EMI and recurring payment schedules.
- Add debts, repayments, and payment status.
- Calculate monthly totals and budget progress.

### Week 4 — Recurrence and reminders

- Implement recurring tasks and payments.
- Generate reminders.
- Add email delivery.
- Add duplicate prevention, retry handling, and a protected scheduled endpoint.

### Week 5 — Career and habits

- Add course and study tracking.
- Add job applications and follow-ups.
- Add habit definitions and daily logs.
- Add notes and quick capture.

### Week 6 — Calendar and production readiness

- Add calendar view.
- Improve mobile responsiveness.
- Test validation and authorization.
- Configure backups and test restoration.
- Deploy and test reminders end to end.

### Weeks 7–8 — Optional improvements

- Installable PWA
- Push notifications
- Weekly and monthly reports
- Additional dashboard polish based on real usage

---

## 10. Security and reliability checklist

- [ ] Use a trusted authentication library.
- [ ] Hash passwords securely if using password-based authentication.
- [ ] Enforce authorization on every server action, route handler, and data operation.
- [ ] Validate every write with Zod or equivalent server-side validation.
- [ ] Add login rate limiting and secure session cookies.
- [ ] Never store banking passwords, card details, or unnecessary account identifiers.
- [ ] Keep secrets in environment variables.
- [ ] Use separate development and production credentials.
- [ ] Configure automated backups and test restoration.
- [ ] Add indexes for common queries.
- [ ] Test timezone conversion and monthly recurrence edge cases.
- [ ] Prevent duplicate reminders and financial transactions.
- [ ] Use HTTPS.
- [ ] Verify that one user cannot access another user's records.
- [ ] Provide a way to export personal data.

---

## 11. MVP checklist

Build and use these features before expanding the scope:

- [ ] Secure login and single-user setup
- [ ] Task CRUD with due dates and priorities
- [ ] Today, Overdue, and Upcoming dashboard
- [ ] Income, expenses, EMI, and debt tracker
- [ ] Recurring payment schedules
- [ ] Email reminders and morning summary
- [ ] Mobile-friendly responsive design
- [ ] Automated backup and basic security tests

Do not start with public sign-up, Google Calendar integration, push notifications, or AI features. Add them only after the core workflow is dependable.

---

## 12. Final recommendations

1. Build a private, single-user application first.
2. Keep the first version focused on tasks, money tracking, and reminders.
3. Use Python Django + PostgreSQL (`tododb`) consistently throughout the project.
4. Treat payment reminders and completed transactions as separate records.
5. Make reminders dependable before adding push notifications.
6. Keep recurring schedules separate from generated occurrences.
7. Make the app fast to use on a phone.
8. Add advanced modules only when actual daily use reveals a need.

**Success criterion:** I can record an obligation in seconds, trust the reminder, and see exactly what needs my attention today.
