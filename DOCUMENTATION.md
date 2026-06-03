# AeroMind Feedback Dashboard

AeroMind Feedback Dashboard is a React-based web application designed to help manage, review, and export system prompts, rules, and Q&A pairs (expected responses). It bridges the gap between public users (who can suggest new rules/questions) and administrators (who manage and approve these suggestions).

## 🚀 Tech Stack
- **Frontend Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend / Database:** Supabase (PostgreSQL)
- **Excel Parsing:** SheetJS (`xlsx`)

## 🏗 Architecture Overview

The application is built to provide **two distinct experiences** based on the environment:

1. **Production Environment (Vercel)**
   - Designed for the public or clients.
   - Users can view current questions, rules, and categories.
   - Users can **Suggest Questions** by uploading an Excel file. These submissions are sent to a staging area (`question_requests`) rather than being applied directly to the live database.

2. **Local / Admin Environment (`localhost`)**
   - Designed for the administrator.
   - **Incoming Requests:** Displays a dashboard of pending question suggestions uploaded by users. Admins can review the suggested response, key points, and the uploader's name. They can approve or deny requests individually or use **Approve All**.
   - **Full Editing:** Admins can manually add, edit, or delete questions and categories.
   - **Direct Import:** Admins can bypass the staging area and import Excel data directly into the database.

## 🗄 Database Schema (Supabase)

The application relies on 4 primary tables in Supabase:

1. `settings`: Stores global instructions, general rules, redlines, and expected JSON schemas.
2. `categories`: Stores tags/categories, each with their own specific rules and redlines.
3. `questions`: The live, permanent repository of questions. Contains the question text, expected answer, key points, resources, and references a category.
4. `question_requests`: A staging table identical to `questions`, but includes a `suggestedBy` column to track who uploaded the request.

*(Refer to `schema.sql` in the repository for exact table definitions and Row Level Security policies).*

## 🧩 Key Components & State Management

### `AppContext.tsx` (State Hub)
All global state and database interactions are handled via React Context. 
- Fetches data from Supabase on mount.
- Exposes methods to mutate data (`addQuestion`, `approveRequest`, `importExcelData`, etc.).
- Handles data sanitization (e.g., stripping invalid Category IDs to prevent foreign key crashes during Excel imports).

### `QuestionsManager.tsx`
The primary interface for managing questions. 
- Handles rendering the "Incoming Requests" staging UI.
- Contains the forms for adding/editing questions inline (auto-resizing text areas).
- Handles Excel parsing and exporting via SheetJS.

### `RulesManager.tsx`
The interface for managing system rules.
- Manages Global Settings.
- Manages Category-specific rules.

## 🔄 Excel Import / Export Workflow

The application uses Excel (`.xlsx`) as the primary format for batch data operations.

### Exporting
Clicking **Export Excel** generates an `AeroMind_Data.xlsx` file with two sheets:
1. **Questions:** Contains all live questions and their details.
2. **Categories:** Contains all categories, plus a special row for "Global Settings".

### Importing (Vercel / Public)
- Users click **Suggest Questions (Excel)**.
- They are prompted for their name.
- The app parses the `Questions` sheet, generates new temporary IDs, appends the user's name, and uploads them to the `question_requests` staging table.

### Importing (Local / Admin)
- Admins click **Import Excel (Admin)**.
- The app parses the `Categories` sheet and upserts them to the database.
- It parses the `Questions` sheet, assigns brand new permanent IDs (to prevent overwriting existing data), verifies the Category IDs, and inserts them directly into the live `questions` table.

## 🛠 Setup & Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup:**
   Run the SQL commands found in `schema.sql` within your Supabase SQL Editor to create the necessary tables and policies.

4. **Run Locally:**
   ```bash
   npm run dev
   ```
   *Running locally will automatically trigger the "Admin" view.*

## 🐛 Error Handling & Failsafes
- **Category Validation:** When approving questions from the staging area or importing via Admin, the system checks if the Excel file's `categoryId` actually exists in the `categories` table. If it does not, the category is gracefully set to `null` (Untagged) to prevent Supabase from throwing a Foreign Key Violation and crashing the insert.
- **Silent Upserts:** `id` regeneration is forced on all imports. This guarantees that importing an Excel file will always **extend** the database rather than accidentally overwriting existing records.
