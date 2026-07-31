# Leak Detector

An AI-assisted full-stack React & Node.js application that finds where your money is quietly leaking out: forgotten subscriptions, duplicate charges, and silent price increases.

## Features & Highlights

- 💸 **Total Spend & Key Metrics**: High-level spending summary, transaction counts, top category, and recurring leak warnings.
- 📊 **Visual Analytics**: Interactive category breakdown pie chart and daily spending trend line chart powered by Recharts.
- 🚨 **Automated Leak Detection**:
  - **Recurring Subscriptions**: Identifies recurring vendors (2+ months with consistent amounts) and computes monthly recurring cost.
  - **Duplicate Charges**: Flags double-billed transactions (same merchant, date, and amount) ready to dispute.
  - **Price Creep**: Tracks silent price increases on recurring subscription plans.
- 🤖 **Gemini AI Monthly Summary**: Generates concise, 3-sentence conversational reports with actionable financial tips using server-side Gemini API (`@google/genai`), with safe offline fallback summaries.
- 📄 **CSV & Bank Statement PDF Upload**: Built-in column auto-mapping for CSVs and server-side PDF statement table & text line extraction.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (runs on port 3000)
npm run dev

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` and set your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
