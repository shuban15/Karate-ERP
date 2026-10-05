# Karate ERP

A lightweight, browser-based management app for a karate class. It uses plain HTML, CSS, and JavaScript modules with Firebase Firestore for storing student, attendance, and fee records.

## Features

- **Students:** View students, add records, edit student details, and remove students.
- **Attendance:** Mark students present or absent for a selected date, save the record, and download the current month's attendance as a CSV file.
- **Fees:** Record monthly payments using Cash, Online, or Master; review pending fees, payment totals, and payment history for the previous six months.
- **Consolidated accounts:** Filter payments by method. Identical records for the same student, month, method, and amount are shown and counted once.
- **Responsive interface:** Pages are designed to work on desktop and mobile screens.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Student directory and student detail, edit, and delete actions |
| `add-student.html` | Form for adding a student |
| `attendance.html` | Daily attendance and monthly CSV export |
| `fees.html` | Monthly fees, consolidated accounts, pending payments, and payment history |
| `theme.css` | Shared visual theme used by the pages |

## Requirements

- A Firebase project with Cloud Firestore enabled.
- A modern browser with JavaScript modules enabled.
- A local or hosted HTTP server. Opening the HTML files directly with `file://` may prevent Firebase modules from loading.

## Firebase setup

The HTML pages initialize Firebase with the web app configuration already present in their module scripts. To connect the app to a different Firebase project, replace that configuration in each page with the configuration for your Firebase web app.

The app reads and writes these Firestore collections:

| Collection | Document contents |
| --- | --- |
| `students` | `name`, `age`, `phone`, `dob`, `belt`, and `createdAt` |
| `payments` | `studentId`, `name`, `method`, `amount`, and `monthYear` |
| `attendance` | One document per date, with `date`, a `records` map keyed by student ID, and `updatedAt` |

Attendance document IDs use `YYYY-MM-DD`; payment month keys use `M-YYYY` (for example, `10-2026`). Fee payments currently use a fixed amount of ₹500.

**Security:** This frontend does not implement sign-in. Firebase web configuration is not an authorization mechanism; access is controlled by your Firestore security rules. Before deployment, configure rules appropriate for your users and data, and do not expose a database with unrestricted public read or write access.

## Run locally

From the project directory, start a static HTTP server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> and use the navigation to open the Students, Attendance, Add Student, and Fees pages. The app requires an internet connection to load the Firebase JavaScript SDK and connect to Firestore.

## Notes

- There is no build step or package installation; the app is served directly as static files.
- No automated test suite is currently included.
- Student and payment records are stored in Firestore. Removing a student does not automatically remove related payment or attendance history.
