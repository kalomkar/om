# 🎓 SRN MEHTA COLLEGE, KALBURGI
## Student Requirement & Academic Request Management System
### Comprehensive Technical Report, Architecture & Workflow Documentation

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Project Overview](#1-executive-summary--project-overview)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [End-to-End Workflows & User Journeys](#4-end-to-end-workflows--user-journeys)
   - 4.1 Student Request Submission Workflow
   - 4.2 Real-time Cloud Synchronization (Phone ⇄ Laptop)
   - 4.3 Teacher Review & Status Management Workflow
   - 4.4 Live Tracking & WhatsApp Notification Workflow
   - 4.5 Teacher Authentication & Multi-Account Management
5. [Data Models & Database Schema](#5-data-models--database-schema)
6. [API Endpoints & Server Layer](#6-api-endpoints--server-layer)
7. [Installation, Local Setup & Production Deployment Guide](#7-installation-local-setup--production-deployment-guide)
8. [Security, Roles & Data Persistence Strategy](#8-security-roles--data-persistence-strategy)

---

## 1. EXECUTIVE SUMMARY & PROJECT OVERVIEW

### 1.1 Objective
The **Student Requirement & Academic Request Management System** is an institutional web platform designed specifically for **SRN Mehta College, Kalburgi**. It eliminates physical paperwork, long inquiry queues, and manual tracking by digitizing student-teacher communications. 

### 1.2 Core Problem Solved
- **Paperless Workflow:** Students can submit academic applications (Leave, Bonafide, Fee concessions, Lab equipment, Exam queries, Library books) directly from any mobile device without logging in or visiting administrative counters.
- **Cross-Device Real-Time Sync:** When a student submits a request from their smartphone, the Class Teacher or Department HOD viewing their laptop dashboard receives the request within **1 second** via Google Cloud Firestore live websockets.
- **Bi-directional Tracking:** Students receive a unique Ticket ID (e.g., `REQ-8492`) and instant WhatsApp confirmations to check review progress, official teacher remarks, and resolution updates.
- **Centralized Faculty Control:** Teachers have administrative controls, status actions (Approve, Review, Reject, Resolve), official remarks, CSV data export, and an automated Teacher Account creation system.

---

## 2. COMPLETE TECHNOLOGY STACK

```
+-------------------------------------------------------------------------------+
|                             CLIENT / FRONTEND                                 |
|  React 19 • TypeScript 5.8 • Vite 6 • Tailwind CSS v4 • Motion • Lucide Icons|
+-------------------------------------------------------------------------------+
                                      ↕
+-------------------------------------------------------------------------------+
|                       BACKEND SERVER / REST API LAYER                         |
|  Node.js • Express 4.21 • TypeScript (via TSX) • esbuild Bundler              |
+-------------------------------------------------------------------------------+
                                      ↕
+-------------------------------------------------------------------------------+
|                        DATABASE & PERSISTENCE ENGINE                          |
|  1. Google Cloud Firestore (Primary Live DB - Multi-device Realtime Sync)     |
|  2. Server Local JSON Store (data/database.json - Offline / File Fallback)     |
|  3. Client Browser LocalStorage (Zero-latency instant state cache)            |
+-------------------------------------------------------------------------------+
```

### 2.1 Frontend Technologies
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.0.1` | Component-driven declarative UI with hooks and real-time state reactivity. |
| **TypeScript** | `5.8.2` | Strict type-safety across requests, teacher models, and API responses. |
| **Vite** | `6.2.3` | Ultra-fast build tool and development server with middleware integration. |
| **Tailwind CSS** | `4.1.14` | Modern utility-first CSS framework for clean, responsive college portal styling. |
| **Lucide React** | `0.546.0` | Accessible iconography for intuitive teacher and student workflows. |
| **Motion** | `12.23.24` | Smooth interactive animations for modals, card transitions, and status updates. |

### 2.2 Backend Technologies
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=20.x` | High-performance JavaScript runtime environment. |
| **Express** | `4.21.2` | RESTful API server handling request records, health checks, and static assets. |
| **TSX** | `4.21.0` | Direct execution of TypeScript server files without manual transpilation during dev. |
| **esbuild** | `0.25.0` | Blazing-fast production bundler outputting unified `dist/server.cjs`. |

### 2.3 Database & Cloud Technologies
| Service | Role | Key Feature |
| :--- | :--- | :--- |
| **Google Cloud Firestore** | Primary Database | Multi-tenant cloud NoSQL database providing sub-second `onSnapshot` live listeners. |
| **Local JSON Database** (`data/database.json`) | Fallback & Export | Self-contained persistent JSON file stored on the server disk. |
| **Firebase Applet SDK** | Client SDK (`v12.19.0`) | Client-side reactive subscriptions for real-time live synchronization. |

---

## 3. SYSTEM ARCHITECTURE & DATA FLOW

### Architectural Diagram

```
[ Student Smartphone ]                 [ Teacher Laptop / PC ]
        |                                       |
        | 1. Submit Request                     | 3. Instant Push (onSnapshot)
        v                                       v
[ Client Firestore SDK ] -------------> [ Google Cloud Firestore ]
        |                                       |
        | 2. Optional REST Mirror               | 4. Read / Update Status
        v                                       v
[ Express Server API (Port 3000) ] <------------+
        |
        +----> [ data/database.json on Server Disk ]
```

### Tri-Layer Redundancy Architecture:
1. **Primary Layer (Google Cloud Firestore):**  
   Every new request, status update, or newly registered teacher is dispatched to the Firestore cloud collections (`requests` and `teachers`). Both mobile and desktop clients maintain an active websocket listener (`onSnapshot`).
2. **Secondary Layer (Express REST Server):**  
   The Express server exposes `/api/requests` endpoints and simultaneously writes records to `data/database.json` to guarantee offline recovery and easy file-based inspectability.
3. **Tertiary Layer (Browser Cache):**  
   Local storage caches recent tickets so that a student can immediately view their submitted token even if their mobile connection experiences brief network disruption.

---

## 4. END-TO-END WORKFLOWS & USER JOURNEYS

```
========================================================================
                       LIFECYCLE OF A STUDENT REQUEST
========================================================================

  [ Student Submits Form ]
            │
            ▼
    Status: "PENDING" (लंबित) ──► Instant Ticket ID generated (REQ-XXXX)
            │
            ▼
  [ Teacher Reviews on Dashboard ]
            │
      ┌─────┴────────────────────────┐
      ▼                              ▼
Status: "UNDER REVIEW"        Status: "REJECTED" (अस्वीकृत)
(समीक्षाधीन)                   (With specific remarks & feedback)
      │
      ▼
Status: "APPROVED" (स्वीकृत)
(Verified & ready for collection)
      │
      ▼
Status: "RESOLVED" (पूर्ण / निस्तारित)
(Document handed over / Completed)
```

---

### 4.1 Student Request Submission Workflow
1. **Direct Access:** Student opens the portal URL on any mobile browser (`/?mode=student`). No registration or password is required.
2. **Form Data Input:**
   - Full Student Name
   - College Roll Number / Registration Number
   - Department / Course (e.g. BCA, B.Sc, B.Com, BA, PUC)
   - Year / Semester
   - Category Selection (Leave Application, Bonafide Certificate, Lab Equipment, Fee Concession, Exam Query, Library Book, Other)
   - Urgency Level (Normal, Urgent, Critical)
   - Subject & Detailed Problem Description
   - Contact Details (WhatsApp Mobile Number & Email)
3. **Submission Event:**
   - System automatically generates a unique 8-character Ticket Code (e.g., `REQ-9142`).
   - The document is written directly to Firestore collection `/requests/REQ-9142` and duplicated to the local JSON store.
   - A success confirmation modal displays the generated Ticket ID with a direct **1-Click WhatsApp Share** button to notify parents or keep personal records.

---

### 4.2 Real-time Cloud Synchronization (Phone ⇄ Laptop)
- The Teacher Dashboard mounts a `subscribeToRequests` listener linked to Firestore.
- As soon as a student taps **"Submit Request"** on their mobile phone anywhere in the campus, the Teacher Dashboard increments its real-time badge count, updates statistics cards, and displays the new card at the top of the feed within **< 1 second** without needing page reloads.

---

### 4.3 Teacher Review & Status Management Workflow
1. Teacher navigates to `/?mode=teacher`.
2. Logs in using authorized credentials.
3. **Inspection & Actions:**
   - **Filter & Search:** Filter by Status (Pending, Under Review, Approved, Rejected, Resolved), Category, Urgency, or student name/roll number search.
   - **Status Transition Modal:** Click **"Update Status"** to change request state:
     - `pending` ➔ `under_review`
     - `under_review` ➔ `approved`
     - `under_review` ➔ `rejected`
     - `approved` ➔ `resolved`
   - **Teacher Remarks (आधिकारिक टिप्पणी):** Add instructions (e.g., *"Verified. Please collect signed certificate from Room 12 tomorrow 11 AM"*).
4. **Export Capabilities:**
   - **Export CSV:** One-click download of all institutional records formatted for Microsoft Excel / Google Sheets.
   - **DB Explorer:** View raw formatted JSON or download a `.json` backup file.

---

### 4.4 Live Tracking & WhatsApp Notification Workflow
- **Student Tracker View:** Student enters their Ticket ID (or opens direct link `/?track=REQ-9142`).
- The screen renders an interactive visual progress timeline:
  - Step 1: Request Received
  - Step 2: Teacher Under Review
  - Step 3: Decision (Approved / Action Required)
  - Step 4: Final Resolution
- **Official Teacher Remarks Banner:** If the teacher entered feedback, it appears highlighted in high contrast with timestamp.
- **WhatsApp Notification Integration:**
  Teachers can click the green **WhatsApp Update** button next to any student to generate a pre-formatted, polite notification message sent directly to the student's phone number.

---

### 4.5 Teacher Authentication & Multi-Account Management
- **Primary Institutional Account:**
  - **Teacher ID:** `9771`
  - **Password:** `123456`
  - **Role:** Administrator / Faculty Incharge
- **Add Teacher Account System (`+ Add New Teacher`):**
  - Allows HOD or faculty to register additional staff accounts (e.g., ID: `9772`, `T-102`).
  - Fields: Teacher ID, Password, Name, Department, Role (Class Teacher vs Admin).
  - Newly created teacher credentials are automatically persisted in Google Cloud Firestore (`/teachers/{teacherId}`) and work instantaneously across all devices.

---

## 5. DATA MODELS & DATABASE SCHEMA

### 5.1 Student Request Schema (`StudentRequest`)
Stored in Firestore collection `/requests/{id}` and local `data/database.json`:

```typescript
interface StudentRequest {
  id: string;               // Unique ticket code e.g. "REQ-8492"
  studentName: string;      // Full name of the student
  rollNumber: string;       // College Roll / Reg number e.g. "SRN-2024-041"
  department: string;       // e.g. "Computer Science / BCA"
  semester: string;         // e.g. "4th Sem"
  category: RequestCategory;// "leave" | "bonafide" | "lab_equipment" | "fee_concession" | "exam_query" | "library" | "other"
  urgency: UrgencyLevel;    // "normal" | "urgent" | "critical"
  title: string;            // Short subject of requirement
  description: string;      // Complete description or application text
  contactNumber: string;    // Student WhatsApp phone number
  email?: string;           // Optional email address
  status: RequestStatus;    // "pending" | "under_review" | "approved" | "rejected" | "resolved"
  teacherRemarks?: string;  // Review notes entered by faculty
  createdAt: string;        // ISO 8601 string e.g. "2026-09-14T10:00:00.000Z"
  updatedAt: string;        // ISO 8601 string
}
```

### 5.2 Teacher Account Schema (`TeacherAccount`)
Stored in Firestore collection `/teachers/{teacherId}`:

```typescript
interface TeacherAccount {
  teacherId: string;        // Unique Login ID e.g. "9771"
  name: string;             // Faculty full name e.g. "Prof. Ramesh Patil"
  password: string;         // Authentication key / PIN e.g. "123456"
  department?: string;      // e.g. "Department of Science"
  role?: 'teacher' | 'admin' | 'hod';
  createdAt: string;        // Timestamp
}
```

---

## 6. API ENDPOINTS & SERVER LAYER

The backend runs on Express (`server.ts`) at port `3000`:

| Method | Endpoint | Description | Sample Response / Payload |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Service health & total record count | `{"status":"ok","time":"...","count":12}` |
| **GET** | `/api/requests` | Fetch all student requests in JSON format | `[{"id":"REQ-9142", ...}]` |
| **GET** | `/api/requests/:id` | Fetch single request by Ticket ID | `{"id":"REQ-9142", ...}` |
| **POST** | `/api/requests` | Create new student application | Payload: `StudentRequest` |
| **PATCH**| `/api/requests/:id` | Update status & teacher remarks | Payload: `{"status":"approved","teacherRemarks":"..."}` |
| **GET** | `/api/database` | Database file health, size, and status | `{"status":"online","count":12,"fileSizeKB":"4.2"}` |

---

## 7. INSTALLATION, LOCAL SETUP & PRODUCTION DEPLOYMENT GUIDE

### 7.1 Prerequisites
- **Node.js** version 18 or 20+ installed ([https://nodejs.org](https://nodejs.org))
- **npm** (bundled with Node.js)

### 7.2 Running Locally from Extracted ZIP
1. **Unzip the project** to any folder on your computer.
2. Open Command Prompt (CMD), PowerShell, or Terminal in that folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the live local server:
   ```bash
   npm run dev
   ```
5. Open your browser:
   - Web App URL: **`http://localhost:3000`**
   - Teacher Portal: **`http://localhost:3000/?mode=teacher`** (ID: `9771`, Pass: `123456`)
   - Student Portal: **`http://localhost:3000/?mode=student`**

### 7.3 Building for Production
To generate the optimized production build:
```bash
npm run build
```
To run the production server:
```bash
npm start
```

---

## 8. SECURITY, ROLES & DATA PERSISTENCE STRATEGY

1. **Role-Based Separation:**
   - Students have read-only tracking via specific Ticket IDs and write-only submission capabilities. They cannot modify or delete tickets.
   - Teachers authenticate with unique credentials to unlock status reviews and official college remarks.
2. **Cloud Security Rules (`firestore.rules`):**
   - Validates proper document schema and maintains read/write permissions for academic continuity.
3. **Continuous Data Backup:**
   - All transactions are stored across **Google Cloud Firestore** (primary cloud layer) and mirrored to **`data/database.json`** on the server. Teachers can also export CSV data anytime.

---

*Authored for SRN Mehta College, Kalburgi — Student Requirement & Academic Request Management System.*
