"""
generate_sample_data.py

Creates a synthetic bank/UPI transaction CSV so you have something
to build and demo against right away, without needing a real dataset.

Run: python generate_sample_data.py
Output: transactions.csv
"""

import csv
import random
from datetime import date, timedelta

random.seed(42)

# Merchants grouped so we can inject realistic patterns
SUBSCRIPTIONS = [
    ("Netflix", 199),
    ("Spotify", 119),
    ("Amazon Prime", 179),
    ("Hotstar", 149),
]

FOOD_DELIVERY = ["Zomato", "Swiggy", "Swiggy Instamart", "Blinkit"]
TRANSPORT = ["Uber", "Ola", "Rapido", "IRCTC"]
SHOPPING = ["Amazon", "Flipkart", "Myntra", "Ajio"]
BILLS = ["Airtel Postpaid", "Jio Fiber", "Electricity Board", "Water Board"]
OTHER = ["ATM Withdrawal", "Local Kirana Store", "Cafe Coffee Day", "Pharmacy"]

START_DATE = date(2026, 5, 1)
NUM_DAYS = 90  # 3 months of data


def random_date_in_range():
    offset = random.randint(0, NUM_DAYS)
    return START_DATE + timedelta(days=offset)


def generate_transactions():
    rows = []

    # 1. Recurring subscriptions - charged once a month, roughly same date
    for merchant, base_price in SUBSCRIPTIONS:
        for month_offset in range(3):
            txn_date = START_DATE + timedelta(days=month_offset * 30 + random.randint(0, 2))
            # Inject "price creep" on Netflix specifically - price increases silently
            price = base_price
            if merchant == "Netflix" and month_offset == 2:
                price = base_price + 50  # price hike in the 3rd month
            rows.append([txn_date.isoformat(), merchant, "Subscription", price])

    # 2. A duplicate charge - same merchant, same amount, same day (common billing glitch)
    dup_date = START_DATE + timedelta(days=45)
    rows.append([dup_date.isoformat(), "Jio Fiber", "Monthly Bill", 799])
    rows.append([dup_date.isoformat(), "Jio Fiber", "Monthly Bill", 799])  # duplicate

    # 3. Regular everyday spending - randomised across categories
    everyday_pool = FOOD_DELIVERY + TRANSPORT + SHOPPING + BILLS + OTHER
    for _ in range(150):
        merchant = random.choice(everyday_pool)
        txn_date = random_date_in_range()
        if merchant in FOOD_DELIVERY:
            amount = random.randint(120, 650)
        elif merchant in TRANSPORT:
            amount = random.randint(50, 400)
        elif merchant in SHOPPING:
            amount = random.randint(200, 3000)
        elif merchant in BILLS:
            amount = random.randint(300, 1200)
        else:
            amount = random.randint(50, 1000)
        rows.append([txn_date.isoformat(), merchant, "Purchase", amount])

    rows.sort(key=lambda r: r[0])
    return rows


def write_csv(rows, filename="transactions.csv"):
    with open(filename, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["date", "merchant", "description", "amount"])
        writer.writerows(rows)
    print(f"Generated {len(rows)} transactions -> {filename}")


if __name__ == "__main__":
    write_csv(generate_transactions())
