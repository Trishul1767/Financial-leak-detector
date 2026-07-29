# 💸 Financial Leak Detector

An automated financial analysis dashboard that identifies subtle overspending leaks, duplicate billing charges, and price creep across bank transaction histories.

## Key Features
* **Algorithmic Leak Detection:** Deterministically flags recurring subscriptions, duplicate transactions, and price increases over time.
* **Hybrid Categorization Pipeline:** Combines deterministic rule-based parsing with a Scikit-Learn `DecisionTreeClassifier` fallback for unclassified merchants.
* **Resilient Architecture:** Implements auto-remapping for diverse CSV exports and robust fallback options if offline or API key limits are reached.
* **AI Summary Engine:** Integrates the Gemini API to transform structured expenditure metrics into clear plain-language insights.

## Tech Stack
* **Language:** Python
* **Frontend/Dashboard:** Streamlit, Plotly
* **Data Processing & ML:** Pandas, Scikit-Learn
* **AI Integration:** Google GenAI SDK

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/Trishul1767/Financial-leak-detector.git cd Financial-leak-detector
