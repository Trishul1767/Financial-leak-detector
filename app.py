"""
app.py

Run with: streamlit run app.py

Demoable dashboard:
- Upload a transactions CSV (any reasonable column names - see
  normalize_dataframe) or use the built-in sample data
- Spending broken down by category (hybrid rule + ML categorizer)
- Leaks flagged: recurring subscriptions, duplicate charges,
  price creep - all pure pandas logic, fully explainable
- A plain-language summary, powered by Gemini if an API key is
  configured, falling back to a templated summary otherwise so a
  missing key or rate limit never crashes the live demo
"""

import os

import pandas as pd
import plotly.express as px
import streamlit as st

from categorize import categorize_dataframe
from leak_detection import (
    detect_duplicate_charges,
    detect_price_creep,
    detect_recurring_subscriptions,
)

st.set_page_config(page_title="Leak Detector", page_icon="💸", layout="wide")

st.title("💸 Leak Detector")
st.caption("Find where your money is quietly leaking out.")


# --- Robust CSV column normalization --------------------------------
def normalize_dataframe(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Maps common real-world bank/UPI export column names to the
    standard columns this app expects: date, merchant, description,
    amount. Real exports rarely match your schema exactly, so this
    keeps the demo from breaking on someone else's CSV.
    """
    col_map = {}
    for col in raw_df.columns:
        c = col.strip().lower()
        if c in ("date", "txn_date", "transaction_date", "posted_date"):
            col_map[col] = "date"
        elif c in ("merchant", "payee", "name", "vendor"):
            col_map[col] = "merchant"
        elif c in ("description", "narration", "memo", "details"):
            col_map[col] = "description"
        elif c in ("amount", "txn_amount", "debit", "cost"):
            col_map[col] = "amount"

    df = raw_df.rename(columns=col_map)

    if "merchant" not in df.columns and "description" in df.columns:
        df["merchant"] = df["description"]
    if "description" not in df.columns and "merchant" in df.columns:
        df["description"] = df["merchant"]

    required = ["date", "merchant", "description", "amount"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        st.error(
            f"Missing required columns: {missing}. "
            f"Expected something like Date, Merchant/Description, Amount."
        )
        st.stop()

    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").abs()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df.dropna(subset=["amount", "date"])


# --- Data input -------------------------------------------------------
with st.sidebar:
    st.header("Data")
    uploaded_file = st.file_uploader("Upload transactions CSV", type="csv")
    st.markdown(
        "Works with most bank export column names "
        "(Date/Merchant/Amount, or Txn_Date/Payee/Cost, etc.)"
    )

if uploaded_file is not None:
    raw_df = pd.read_csv(uploaded_file)
else:
    raw_df = pd.read_csv("transactions.csv")
    st.info("Using built-in sample data. Upload your own CSV in the sidebar to try real data.")

df = normalize_dataframe(raw_df)
df = categorize_dataframe(df)

# --- Top level metrics --------------------------------------------------
total_spend = df["amount"].sum()
num_transactions = len(df)
top_category = df.groupby("category")["amount"].sum().idxmax()

col1, col2, col3 = st.columns(3)
col1.metric("Total Spend", f"₹{total_spend:,.0f}")
col2.metric("Transactions", num_transactions)
col3.metric("Top Category", top_category)

st.divider()

# --- Category breakdown --------------------------------------------------
left, right = st.columns(2)

with left:
    st.subheader("Spending by Category")
    category_totals = df.groupby("category")["amount"].sum().reset_index()
    fig = px.pie(category_totals, names="category", values="amount", hole=0.4)
    st.plotly_chart(fig, use_container_width=True)

with right:
    st.subheader("Spending Over Time")
    daily = df.groupby("date")["amount"].sum().reset_index()
    fig2 = px.line(daily, x="date", y="amount")
    st.plotly_chart(fig2, use_container_width=True)

st.divider()

# --- Leak detection -------------------------------------------------------
st.subheader("🚨 Leaks Found")

tab1, tab2, tab3 = st.tabs(["Recurring Subscriptions", "Duplicate Charges", "Price Creep"])

with tab1:
    recurring = detect_recurring_subscriptions(df)
    if recurring.empty:
        st.success("No recurring charges detected.")
    else:
        st.dataframe(recurring, use_container_width=True)
        monthly_total = recurring["avg_amount"].sum()
        st.warning(f"You're paying roughly ₹{monthly_total:,.0f}/month across recurring charges.")

with tab2:
    duplicates = detect_duplicate_charges(df)
    if duplicates.empty:
        st.success("No duplicate charges detected.")
    else:
        st.dataframe(duplicates, use_container_width=True)
        st.error(f"Found {len(duplicates) // 2} potential duplicate charge(s) - worth disputing.")

with tab3:
    creep = detect_price_creep(df)
    if creep.empty:
        st.success("No price increases detected.")
    else:
        st.dataframe(creep, use_container_width=True)
        st.warning("These merchants raised their price without an obvious announcement.")

st.divider()

# --- Monthly summary: Gemini if available, safe fallback otherwise -------
st.subheader("📝 Monthly Summary")

default_summary = (
    f"You spent ₹{total_spend:,.0f} across {num_transactions} transactions this period. "
    f"Your biggest category was **{top_category}**. "
)
if not recurring.empty:
    default_summary += (
        f"You have {len(recurring)} recurring charges costing about "
        f"₹{recurring['avg_amount'].sum():,.0f}/month. "
    )
if not duplicates.empty:
    default_summary += f"We also flagged {len(duplicates) // 2} duplicate charge(s) worth checking."

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    try:
        api_key = st.secrets.get("GEMINI_API_KEY")
    except Exception:
        api_key = None

summary_text = default_summary
if api_key:
    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        prompt = (
            "Summarize this spending report in 3 short, conversational sentences.\n"
            f"Total spend: Rs {total_spend:.0f}\n"
            f"Top category: {top_category}\n"
            f"Category breakdown: {category_totals.to_dict(orient='records')}\n"
            f"Recurring subscriptions flagged: {len(recurring)}\n"
            f"Duplicate charges flagged: {len(duplicates)}\n"
            "Be direct, mention any leaks, and give one actionable tip."
        )
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        summary_text = response.text
    except Exception:
        # API missing, rate-limited, or offline - never let this break the demo
        summary_text = default_summary

st.write(summary_text)

