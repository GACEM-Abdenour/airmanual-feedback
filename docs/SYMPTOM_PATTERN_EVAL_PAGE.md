# Symptom Pattern Evaluation Page

## Purpose of the page
The `/symptom-pattern-eval` page is an internal frontend evaluation tool designed to test the AeroMind backend's ability to process and answer questions. Specifically, it allows engineers and developers to compare the expected target answer against the current baseline ("Render answer") and an eventual after-deployment version ("After Symptom Pattern Answer").

This tooling ensures that changes to the backend—like introducing a new symptom-pattern recognition engine—quantifiably improve answer quality and source-grounding, rather than guessing.

## How to run it locally
1. Ensure your frontend application is running locally: `npm run dev`
2. Navigate to `http://localhost:5173/symptom-pattern-eval` or click "Symptom Eval" in the sidebar.

## How to set env variables
You must configure your `.env.local` file (which is never committed to Git) with the API key necessary to talk to the AeroMind chat endpoint.

Example `.env.local`:
```env
VITE_EVAL_BACKEND_URL=https://airmanual.onrender.com
VITE_GAME_API_KEY=your_key_here
```

**CRITICAL: NEVER commit the `.env.local` file or real API keys to the repository!**

## How to capture baseline answers from Render

**Automated Capture Script (Preferred)**
1. Add your evaluation questions to `data/symptom-pattern-eval-questions.json`.
2. Run the capture script from your terminal:
   ```bash
   npm run capture:symptom-baseline
   ```
3. This will create a `data/symptom-pattern-baseline-render.json` file with the captured answers.
4. Open the Symptom Eval page, click **Import JSON**, and select the generated `symptom-pattern-baseline-render.json` file. This will load all cases into the UI.

**Manual Capture via UI**
1. Open the Symptom Eval page.
2. Enter the test question and the true expected behavior (from engineering/dataset).
3. Ensure the Current Baseline URL is set to `https://airmanual.onrender.com`.
4. Click **Ask Current** to fetch the response from the live baseline.
5. Click **Save Case** to store this evaluation case to `localStorage`.

*Note: The Render answer is only the “before” answer, NOT the expected truth. Expected answers must always come from engineers or the verified evaluation dataset.*

## How to compare after symptom-pattern deployment
1. Once the new symptom-pattern logic is deployed (e.g., to a staging URL or a local backend instance), click on your previously saved case in the "Saved Cases" section to load it.
2. Enter the new backend URL in the "After Backend URL" field.
3. Click **Ask After**.
4. The page will display the results side-by-side, allowing you to easily verify if the expected behavior was successfully achieved by the new engine.

## Data Persistence & Export
Cases are saved in your browser's `localStorage` and will persist across reloads. To share results with the team or back them up, click **Export JSON** to download `symptom-pattern-eval-cases.json`.
