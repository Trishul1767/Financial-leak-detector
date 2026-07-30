"""
pdf_parser.py

Best-effort parser for bank/UPI statement PDFs. Bank statement layouts
vary a lot between banks, so this uses two strategies and returns
whichever one produces usable data:

1. Table extraction (pdfplumber) - works for statements that are
   genuinely laid out as a table, which is the more common case for
   net-banking "download statement" PDFs.
2. Regex line parsing - fallback for statements that are just lines
   of text with a date, description, and amount, no real table
   structure.

Honesty note: this will not perfectly parse every bank's PDF format -
no lightweight parser can, formats differ too much. If it can't find
transactions, it returns an empty DataFrame and the app should tell
the user to try a CSV export instead rather than fail silently.
"""

import re
from io import BytesIO

import pandas as pd
import pdfplumber

DATE_PATTERNS = [
    r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",           # 01/05/2026, 01-05-26
    r"\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}",       # 01 May 2026
]
DATE_REGEX = re.compile("(" + "|".join(DATE_PATTERNS) + ")")
AMOUNT_REGEX = re.compile(r"(?:Rs\.?\s?|₹\s?)?([\d,]+\.\d{2})")


def _try_table_extraction(pdf) -> pd.DataFrame:
    """Attempts to extract transactions from real tables in the PDF."""
    all_rows = []
    header = None

    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if not table or len(table) < 2:
                continue
            candidate_header = [str(c).strip().lower() if c else "" for c in table[0]]
            has_date_col = any("date" in c for c in candidate_header)
            has_amount_col = any(
                c in ("amount", "debit", "credit", "withdrawal", "deposit")
                for c in candidate_header
            )
            if not (has_date_col and has_amount_col):
                continue  # not a transaction table, skip (e.g. a summary box)

            header = candidate_header
            all_rows.extend(table[1:])

    if not all_rows or header is None:
        return pd.DataFrame()

    raw_df = pd.DataFrame(all_rows, columns=header)

    date_col = next((c for c in raw_df.columns if "date" in c), None)
    desc_col = next(
        (c for c in raw_df.columns if c in ("description", "narration", "particulars", "details")),
        None,
    )
    debit_col = next((c for c in raw_df.columns if c in ("debit", "withdrawal")), None)
    credit_col = next((c for c in raw_df.columns if c in ("credit", "deposit")), None)
    amount_col = next((c for c in raw_df.columns if c == "amount"), None)

    if date_col is None:
        return pd.DataFrame()

    result = pd.DataFrame()
    result["date"] = raw_df[date_col]
    result["description"] = raw_df[desc_col] if desc_col else ""
    result["merchant"] = result["description"]

    if amount_col:
        result["amount"] = raw_df[amount_col]
    elif debit_col:
        # Most statements: spending shows up in the debit column.
        # Credits (salary, refunds) are dropped - this tool is about
        # spending leaks, not income tracking.
        result["amount"] = raw_df[debit_col]
    else:
        return pd.DataFrame()

    result["amount"] = (
        result["amount"].astype(str).str.replace(",", "", regex=False).str.strip()
    )
    result = result[result["amount"].str.match(r"^\d+(\.\d+)?$", na=False)]

    return result


def _try_text_line_extraction(pdf) -> pd.DataFrame:
    """
    Fallback for statements with no real table - parses lines that
    look like: <date> <description> <amount>
    """
    rows = []
    for page in pdf.pages:
        text = page.extract_text() or ""
        for line in text.split("\n"):
            date_match = DATE_REGEX.search(line)
            amount_matches = AMOUNT_REGEX.findall(line)
            if not date_match or not amount_matches:
                continue

            date_str = date_match.group(0)
            amount_str = amount_matches[-1].replace(",", "")  # last number on the line

            # Description = whatever's between the date and the amount
            description = line.replace(date_str, "").strip()
            for a in amount_matches:
                description = description.replace(a, "")
            description = re.sub(r"Rs\.?|₹|Dr|Cr", "", description).strip()

            rows.append({"date": date_str, "description": description, "amount": amount_str})

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows)
    df["merchant"] = df["description"]
    return df


def parse_bank_statement_pdf(file) -> pd.DataFrame:
    """
    Main entry point. `file` is a file-like object (e.g. from
    st.file_uploader). Returns a DataFrame with columns
    [date, merchant, description, amount], or an empty DataFrame if
    nothing usable could be extracted.
    """
    file_bytes = file.read() if hasattr(file, "read") else file
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        result = _try_table_extraction(pdf)
        if not result.empty:
            return result

        # Table extraction found nothing usable - try text-line parsing
        result = _try_text_line_extraction(pdf)
        return result
