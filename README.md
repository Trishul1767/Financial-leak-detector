# Leak Detector

An AI-assisted tool that finds where your money is quietly leaking out:
forgotten subscriptions, duplicate charges, and silent price increases.

Built for International Hackathon Competition 2026.

## Setup (5 minutes)

```bash
# 1. Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate     # on Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate sample data
python generate_sample_data.py

# 4. Run the app
streamlit run app.py
```

This opens a browser window with the dashboard. Upload your own CSV
(the app auto-detects common column name variants like `Date`/`Txn_Date`,
`Merchant`/`Payee`, `Amount`/`Debit`) or just use the generated sample
data - it already has recurring subscriptions, a duplicate charge, and
a price increase baked in so all three leak detectors have something
to find.

## Optional: enable the AI summary (Gemini)

The monthly summary works fine without this - it falls back to a
plain templated summary automatically. To get an LLM-generated
narrative instead:

1. Get a free API key at https://aistudio.google.com/apikey
2. Set it as an environment variable before running:
   ```bash
   export GEMINI_API_KEY="your-key-here"   # Windows: set GEMINI_API_KEY=your-key-here
   streamlit run app.py
   ```
   Or, if deploying on Streamlit Community Cloud, add it under
   **App settings → Secrets** as `GEMINI_API_KEY = "your-key-here"`.

If the key is missing, invalid, or the API is rate-limited, the app
silently falls back to the templated summary instead of crashing -
important for a live demo in front of judges.

## Deploying (do this well before Round 1, not the night before)

1. Push this folder to a new GitHub repo.
2. Go to https://share.streamlit.io, sign in with GitHub.
3. Click **New app**, pick your repo and `app.py`, click **Deploy**.
4. If using the Gemini summary, add `GEMINI_API_KEY` under the app's
   **Secrets** settings.
5. You'll get a public URL - test it yourself end-to-end (upload a
   CSV, check all three leak tabs) before submitting it.

## Project Structure

```
leak_detector/
├── generate_sample_data.py   # creates transactions.csv for testing/demo
├── categorize.py             # hybrid: keyword rules + trained classifier fallback
├── leak_detection.py         # subscription/duplicate/price-creep detectors
├── pdf_parser.py             # best-effort bank statement PDF parsing
├── app.py                    # Streamlit dashboard (the demo)
└── requirements.txt
```

## About PDF statement upload

Most people don't have a ready CSV of their transactions, but almost
everyone gets a monthly PDF statement from their bank - so PDF upload
is supported alongside CSV.

**Be honest about this in your pitch:** bank statement PDF layouts
vary a lot between banks, so this uses a best-effort two-stage parser
(table extraction first, then a text-line fallback) - it won't
perfectly handle every bank's format, and if it can't find
transactions it says so clearly and suggests a CSV export instead,
rather than silently failing or crashing. That's a reasonable,
defensible answer if a judge asks "does this really work for anyone's
statement?" - for production, the honest answer is you'd integrate
with the RBI's Account Aggregator framework (what apps like Fi/Jupiter
use) for consent-based bank data access instead of parsing PDFs at all.

## Roadmap (matched to your exam schedule)

**Before Aug 13 (Round 1) - this is already built above:**
- [x] Sample data + hybrid categorization (rules + real trained classifier)
- [x] Leak detection: recurring subscriptions, duplicate charges, price creep
- [x] Robust CSV upload (handles different bank export column names)
- [x] PDF statement upload (best-effort, with graceful fallback message)
- [x] Optional Gemini-powered summary with a safe offline fallback
- [ ] Deploy to Streamlit Community Cloud (see above) - do this early
- [ ] Test PDF upload with a couple of real statement PDFs (yours,
      family member's) if you can - the two test formats we verified
      won't cover every bank's exact layout
- [ ] Run through the demo yourself, tweak the sample data if needed
      so the "wow" moments are obvious (duplicate charge, price hike)
- [ ] Prepare a 2-3 minute pitch: problem → live demo → impact number
      (e.g. "flagged ₹X in a 3-month sample")

**Aug 20 onward - sessional exams:**
- Pause. Don't touch the project. Exams first.

**After exams, before Round 2/3:**
- [ ] Polish the UI (spacing, colors, maybe a logo)
- [ ] Add one predictive "wow" feature if time allows -
      e.g. "at this rate, you'll overspend by ₹X this month"
      (a simple linear projection on the daily spend trend is enough)
- [ ] Rehearse the live demo end-to-end at least twice



## Pitch angle for judges

- **Innovation:** reframes budgeting as "leak detection" - not another
  generic expense tracker
- **Technical Skills:** rule-based categorization with a genuinely trained
  classifier as fallback; real anomaly detection logic (duplicates, price creep)
- **Impact:** quantifiable ₹ savings, relevant to literally everyone
- **UI/UX:** one clean dashboard, no unnecessary complexity
- **Presentation:** clear before/after story - "here's money you didn't
  know you were losing"
