# Spec 5: Direct Contact Form, Hardened Firestore Rules & Admin Inbox

**Date:** 2026-11-25  
**Status:** Draft for User Review  
**Scope Classification:** Architectural  
**Depends On:** Spec 1 (Landing Page shadcn/ui), Spec 2 (Admin Panel shadcn/ui), Spec 3 (Motion Craft & Performance), Spec 4 (Case Study & Career Timeline)  
**Target Audiences:** Freelance Clients, Recruiters / Hiring Managers, Portfolio Admin  
**Antislop Mode:** Mode 2 (`after`) with mandatory Delivery Gate

---

## 1. Goal & Principles

Convert portfolio visitors directly into actionable inquiries without external paid form services or custom servers, while fixing a critical Firestore security gap before storing visitor PII:

1. **Zero-Leak Security First (`firestore.rules`):** Replace the current blanket `match /{document=**} { allow read: if true; }` wildcard with explicit per-collection rules so the new `messages` collection is **write-only for public visitors** (with strict field/type/length validation) and **read/update/delete exclusively for authenticated Admin** (`request.auth != null`).
2. **Frictionless Direct Inquiry Form (`ContactSection.jsx`):** Add an accessible, Editorial Craft contact form alongside Direct Email and Social Channels, featuring one-tap topic selection, inline validation, hidden honeypot anti-bot check, 60-second client cooldown, and a zero-data-loss `mailto:` fallback if offline or blocked.
3. **Neutral Studio Ink Admin Inbox (`AdminMessagesTab.jsx`):** Add a dedicated `Messages Inbox` tab under `Insights` in `AdminPage.jsx` with a live unread badge, status filtering (`All` / `Unread` / `Read` / `Archived`), search, one-click `Reply via Email`, Mark Read/Unread, Archive, and confirmed Delete.
4. **Zero Extra Dependencies & Zero Bundle Regression:** Uses existing Firebase 11, shadcn/ui (`Input`, `Textarea`, `Button`, `Badge`, `Card`), `@tabler/icons-react`, and `sonner`. Keeps `AdminPage` & `firebase-auth` excluded from `/` preloads.

---

## 2. Section 1: Hardened Firestore Security Rules (`firestore.rules`)

Replace the blanket wildcard in `firestore.rules` with explicit collection rules:

- **`projects/{projectId}`, `skills/{skillId}`, `settings/{docId}`:**
  - `allow read: if true;`
  - `allow write: if request.auth != null;`
- **`analytics_summary/{docId}`, `analytics_daily/{date}`:**
  - `allow read, create, update: if true;`
  - `allow delete: if request.auth != null;`
- **`messages/{messageId}`:**
  - `allow read, update, delete: if request.auth != null;` (never publicly readable)
  - `allow create: if` all schema checks pass:
    - Exact allowed key set: `['name', 'email', 'topic', 'message', 'status', 'source', 'createdAt']`
    - `name`: string, 2 to 100 chars
    - `email`: string, 5 to 160 chars, basic valid email pattern (`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
    - `topic`: one of `['freelance', 'hiring', 'collaboration', 'general']`
    - `message`: string, 10 to 2000 chars
    - `status == 'unread'`
    - `source`: string, <= 60 chars
    - `createdAt == request.time`

> **Deployment Note:** After merging/pushing, deploy updated rules once via `firebase deploy --only firestore:rules` (or paste `firestore.rules` in Firebase Console) so public submissions and private inbox reads are enforced in production.

---

## 3. Section 2: Contact Service & Public Contact Form

### 3.1 `src/services/contactMessages.js`
Dedicated, testable service module exporting:
- `MESSAGE_TOPICS`: array of `{ value, label }` for `freelance` (`Freelance Project`), `hiring` (`Job Opportunity`), `collaboration` (`Collaboration`), `general` (`General Inquiry`).
- `MESSAGE_STATUSES`: `['unread', 'read', 'archived']`.
- `COOLDOWN_MS = 60_000`, `getCooldownRemainingMs()`, `recordSubmissionTimestamp()` (safely handles unavailable `localStorage`).
- `validateContactForm({ name, email, topic, message })`: mirrors exact Firestore rule limits and returns `{ valid, errors }`.
- `submitContactMessage({ name, email, topic, message, website })`:
  - Honeypot guard: if `String(website ?? '').trim().length > 0`, returns `{ ok: true, honeypot: true }` silently without writing to Firestore.
  - Enforces validation + cooldown before calling `addDoc(collection(db, 'messages'), { ... , status: 'unread', source: 'portfolio_contact_form', createdAt: serverTimestamp() })`.
  - Normalizes network or `permission-denied` errors into `{ ok: false, code, message }` so the UI can offer a prefilled `mailto:` fallback.

### 3.2 Enhanced `src/components/sections/ContactSection.jsx`
Preserve Editorial Craft 12-column balance:
- **Left Column (`lg:col-span-5`):** Header (`Get In Touch` / `Contact Me`), opt-in `AvailabilityBadge`, concise intro, Direct Email card (`Send Email` + `Copy Address`), and compact Social Channels grid.
- **Right Column (`lg:col-span-7`):** **Send a Direct Message** `Card`:
  - **Inquiry Topic (`role="radiogroup"`):** 4 accessible pill radio buttons (`min-h-11 sm:min-h-9`) with keyboard arrow support (`ArrowRight`/`ArrowLeft`) and zero extra Radix Select bundle cost on `/`.
  - **Name & Email Inputs:** 2-column responsive row with explicit `<Label>`, `aria-invalid`, `aria-describedby`, and inline `text-destructive-text` error messages.
  - **Message Textarea:** 10 to 2000 chars with subtle `font-mono tabular-nums` live character counter (`0 / 2000`).
  - **Hidden Honeypot Input (`name="website"`):** Visually hidden, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden="true"`.
  - **Submit Button:** `min-h-11`, loading state (`IconLoader2`), disabled during submit/cooldown.
  - **Success Confirmation Panel:** Clean in-card confirmation showing the sender's email and a `Send Another Message` reset button, plus `Sonner` toast.
  - **Graceful Failure Fallback:** If submission fails (e.g. offline or rules pending deployment), displays an inline `role="alert"` notice with a 1-click `Open in Email Client` (`mailto:`) link prefilled with the visitor's subject and message so no text is ever lost.

---

## 4. Section 3: Admin Messages Inbox (`AdminMessagesTab.jsx`)

### 4.1 Shell Integration (`src/pages/admin/AdminPage.jsx`)
- Add `{ id: 'messages', label: 'Messages Inbox', title: 'Visitor Messages & Inquiries', Icon: IconInbox }` to the `Insights` group in `TAB_GROUPS`.
- Fetch `messages` (`query(collection(db, 'messages'), orderBy('createdAt', 'desc'))`) in `reloadAll()` and compute `unreadMessagesCount = messages.filter((m) => (m.status || 'unread') === 'unread').length`.
- Show `unreadMessagesCount` as the sidebar badge count for `messages` (omitted when `0`, or displayed cleanly as a numeric count).

### 4.2 `src/pages/admin/tabs/AdminMessagesTab.jsx`
Strict Neutral Studio Ink (`bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-destructive-text`, zero `season-*` tokens):
- `AdminPageHeader` with title `Messages Inbox`, badge `${unreadCount} unread`, and `Refresh` button (`min-h-11 sm:min-h-9`).
- Filter bar:
  - WAI-ARIA `role="tablist"` with `All`, `Unread`, `Read`, `Archived` tabs (keyboard `ArrowLeft`/`ArrowRight`/`Home`/`End` support + numeric counts).
  - Search `Input` filtering by sender name, email, topic, or message body.
- Message cards:
  - Sender name (with subtle unread indicator dot when `status === 'unread'`), monospace email, topic badge, status badge, and formatted timestamp (`tabular-nums`).
  - Full message body (`whitespace-pre-wrap break-words`).
  - Responsive action toolbar (`min-h-11 sm:min-h-8` / `size-11 sm:size-8` tap targets):
    - `Reply via Email` (`mailto:` with prefilled subject `Re: <Topic> Inquiry`)
    - `Mark as Read` / `Mark as Unread` (`updateDoc` + optimistic state update)
    - `Archive` / `Unarchive` (`updateDoc` + optimistic state update)
    - `Delete` (gated by `useConfirm()` `AlertDialog` -> `deleteDoc`)
- Loading shimmer state (`AdminProjectsShimmer` / `Skeleton` list) and clean empty states.

---

## 5. Testing, Verification & Antislop Delivery Gate

### 5.1 Automated Tests
- **New `test/services/contactMessages.test.js`:** Verify `validateContactForm`, honeypot silent bypass, Firestore `addDoc` payload structure, cooldown enforcement, and error handling.
- **Update `test/components/sections/ContactSection.test.jsx`:** Verify form validation errors, topic radio selection, successful submission confirmation state, and `mailto:` fallback on error.
- **New `test/pages/admin/AdminMessagesTab.test.jsx`:** Verify message list rendering, status tabs (`All`/`Unread`/`Read`/`Archived`), search filter, `Reply via Email` link, Mark Read/Unread, Archive, and confirmed Delete (`alertdialog`).
- **Update `test/pages/admin/AdminPage.test.jsx`:** Verify `Messages Inbox` sidebar tab appears under `Insights` and switches cleanly to `AdminMessagesTab`.
- **Static Rules Check:** Add a test verifying `firestore.rules` has no blanket `match /{document=**}` public read and enforces `request.auth != null` on `messages` read/update/delete.

### 5.2 Quality Gates
1. Full `npx vitest run` (all 32+ suites green).
2. Full `npm run build` (exit 0, zero Vite `> 500 KB` warnings, `AdminPage` & `firebase-auth` still excluded from `/` preloads).
3. Whole-Branch Senior Code Review via `research` subagent; resolve all Critical/Important findings via TDD.
4. Antislop Mode 2 (`after`) Audit saved to `anti-slop/audit-005-2026-11-25.md`, await user selection of findings, apply chosen fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
