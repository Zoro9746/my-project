# PROJECT MISSING INFORMATION
## BIT Student Health Center Management System
### Gaps, Unverified Claims, and Items Needed for a Complete Academic Report

---

## Category 1: Missing Visual Diagrams (Not Present in Codebase)

These diagrams are standard academic report requirements but **do not exist** as image or diagram files in the project workspace. They must be created manually or with a diagramming tool (draw.io, Lucidchart, PlantUML, etc.):

| Diagram | Standard Chapter | Current Status |
| :--- | :--- | :--- |
| **ER Diagram** (Entity-Relationship) | Database Design | ❌ NOT present. Schema exists in `schema.prisma` but no visual ER diagram file. |
| **System Architecture Diagram** (visual/layered) | Architecture | ❌ Only an ASCII text diagram exists in `docs/architecture.md`. No PNG/SVG image file. |
| **DFD Level 0 — Context Diagram** | System Design | ❌ NOT present anywhere in project. |
| **DFD Level 1 — Detailed Data Flow** | System Design | ❌ NOT present anywhere in project. |
| **Use Case Diagram** | Requirements | ❌ NOT present. |
| **Sequence Diagram — Login Flow** | System Design | ❌ NOT present. |
| **Sequence Diagram — Dispensing Flow** | System Design | ❌ NOT present. |
| **Class Diagram / Module Diagram** | System Design | ❌ NOT present. |
| **Deployment Diagram** | Deployment | ❌ NOT present. |

**Recommendation**: Create these using draw.io (free, online) using the schema and architecture details provided in `PROJECT_REPORT_HANDOFF.md`.

---

## Category 2: Missing Screenshots

No UI screenshots exist as files in the project. The application is functional (can be run locally), but no screenshots were captured during development.

| Missing Screenshot | Page / Feature | Notes |
| :--- | :--- | :--- |
| Login Page | `/login` | BIT PCDP light periwinkle theme |
| Student Dashboard | `/dashboard` (STUDENT) | Health stats, recent appointments |
| Book Appointment Page | `/appointments/book` | Doctor selection + slot picker |
| Doctor OPD Queue | `/doctor/queue` | Token-ordered queue list |
| Doctor Consultation Form | `/doctor/consultation` | Symptoms, diagnosis, prescription form |
| Pharmacist Dispense Page | `/pharmacy/prescriptions` | PENDING_DISPENSE list |
| Inventory Manager | `/pharmacy/inventory` | Medicine stock table |
| Stock Alerts Page | `/pharmacy/alerts` | LOW_STOCK + NEAR_EXPIRY + EXPIRED badges |
| Admin Analytics Dashboard | `/dashboard` (ADMIN) | System-wide metric cards |
| Admin User Management | `/admin/users` | User table with role filters |
| Medical History Page | `/history` | Past visits list for student |

**Recommendation**: Run the application locally (`npm run dev` on both frontend and backend) and capture screenshots from each page.

---

## Category 3: Missing Test Output Evidence

The test suite results (35/35 passing) were confirmed during development but **no saved test output log or screenshot** exists in the project files.

- **Missing**: Screenshot or text file capture of `npm test` console output showing all 35 tests passing.
- **How to obtain**: Run `npm test` in `d:\HC_Mini\backend` and screenshot the terminal output, or redirect to a log file:
  ```bash
  cd d:\HC_Mini\backend
  npm test > test_results.txt 2>&1
  ```

---

## Category 4: Unverified Test Counts

From the `docs/implementation-status.md`, the total is stated as **35 tests** across 6 suites. However, exact per-suite test counts were only confirmed for:

- `auth.test.ts` — 7 tests (counted from file, verified)
- `appointment.test.ts` — 14 tests (stated in implementation-status.md, not independently counted from source)
- `inventory.test.ts` — 5 tests (counted from file, verified)

The exact test counts for `prescription.test.ts`, `admin.test.ts`, and `reports.test.ts` were **not independently counted** from the source files. Total of 35 is stated in the implementation status document but should be confirmed by running `npm test`.

---

## Category 5: Features Discussed But Not Implemented

The following features were mentioned or planned during conversations but **are NOT implemented** in the final codebase:

| Feature | Status | Evidence |
| :--- | :--- | :--- |
| **Inpatient Bed Ward Management** (visual bed map, live occupancy) | ❌ NOT implemented | No `BedAllocation` model in `schema.prisma`; no bed management page in frontend routes |
| **SMS / WhatsApp Notifications** | ❌ NOT implemented | Only in-app notification system; no Twilio or SMS gateway integration |
| **QR Code Student Check-in** | ❌ NOT implemented | Discussed as future enhancement only |
| **Wearable Device Data Integration** | ❌ NOT implemented | Mentioned as future scope only |
| **PDF Medical Leave Certificate Generation** | ❌ NOT implemented | No PDF generation library in dependencies |
| **BIT ERP / Student Database Integration** | ❌ NOT implemented | No external API connection in codebase |

> [!IMPORTANT]
> In the academic report, these must be clearly listed under "Future Enhancements" or "Out of Scope", NOT presented as implemented features.

---

## Category 6: Unverified Performance Claims

The following performance or scale claims **cannot be verified** from the codebase alone:

| Claim | Verifiable? | Notes |
| :--- | :--- | :--- |
| "Handles concurrent users" | ❌ Not benchmarked | Node.js async model supports concurrency, but no load test was performed |
| "Response time < X ms" | ❌ Not measured | No performance benchmarking conducted |
| "Supports N concurrent pharmacy operations" | ❌ Not stress-tested | `prisma.$transaction` provides correctness guarantee, not performance guarantee |

**Recommendation**: Do not include specific performance numbers in the report. State that the architecture is designed for single-campus operational scale.

---

## Category 7: Environment / Deployment Gaps

| Gap | Details |
| :--- | :--- |
| **No Production Deployment** | The system runs locally only. No cloud/server deployment has been done. Report should state "deployed locally for demonstration purposes." |
| **No HTTPS** | Running on plain HTTP (`localhost:5000`). No SSL/TLS configured. |
| **No Docker / Containerization** | No `Dockerfile` or `docker-compose.yml` present. |
| **JWT Secret in .env** | `.env` file with `JWT_SECRET` is not committed to git (correct security practice), but `.env` contents are not shown in the handoff for security. Only `.env.example` with placeholder values is available. |

---

## Category 8: Items Requiring Clarification for Report Writing

| Item | Question / Gap |
| :--- | :--- |
| **College Guide / Supervisor Name** | Not available in project files. Needed for report title page. |
| **Academic Year** | Not available in project files. Needed for report title page. |
| **Department Name** | Not available in project files. Needed for report title page. |
| **Register/Roll Numbers of Team Members** | Not available in project files. Needed for report title page. |
| **Institution Address** | Standard: "Bannari Amman Institute of Technology, Sathyamangalam - 638 401, Erode District, Tamil Nadu." — Verify before use. |
| **Exact Prisma Migration History** | `prisma db push` was used (no formal migration files exist). If the report requires migration evidence, this should be noted. |

---

## Summary: What Must Be Created Before Report Submission

| Priority | Item | How to Create |
| :--- | :--- | :--- |
| 🔴 HIGH | ER Diagram | Use draw.io + schema.prisma field definitions |
| 🔴 HIGH | DFD Level 0 & Level 1 | Draw manually based on workflow in handoff doc |
| 🔴 HIGH | UI Screenshots | Run app locally and capture each page |
| 🟡 MEDIUM | Test output screenshot | Run `npm test` and capture console |
| 🟡 MEDIUM | System architecture visual | Convert ASCII art from architecture.md to diagram |
| 🟡 MEDIUM | Use Case Diagram | Draw from functional requirements in handoff |
| 🟢 LOW | Sequence Diagrams | Draw login and dispensing flows |
| 🟢 LOW | Deployment Diagram | Simple local deployment diagram |
