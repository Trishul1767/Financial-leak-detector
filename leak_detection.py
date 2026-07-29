import numpy as np
import pandas as pd

def detect_recurring_subscriptions(df, max_cv=0.10):
    """
    Identifies recurring subscriptions by calculating the Coefficient of Variation (CV = std / mean)
    for each merchant. True subscriptions have low price variance (CV < 10%).
    """
    if df.empty or 'merchant' not in df.columns:
        return pd.DataFrame(columns=['merchant', 'avg_amount', 'count'])

    recurring = []
    for merchant, group in df.groupby('merchant'):
        if len(group) >= 2:
            amounts = group['amount'].values
            mean_amt = np.mean(amounts)
            std_amt = np.std(amounts)
            
            # Low CV indicates fixed-amount recurring billing
            cv = (std_amt / mean_amt) if mean_amt > 0 else 1.0
            
            if cv <= max_cv:
                recurring.append({
                    'merchant': merchant,
                    'avg_amount': mean_amt,
                    'count': len(group)
                })

    return pd.DataFrame(recurring) if recurring else pd.DataFrame(columns=['merchant', 'avg_amount', 'count'])


def detect_duplicate_charges(df):
    """Identifies identical charges on the exact same date for the same merchant."""
    if df.empty:
        return pd.DataFrame()

    duplicates = df[df.duplicated(subset=['date', 'merchant', 'amount'], keep=False)].copy()
    if duplicates.empty:
        return pd.DataFrame()

    return duplicates[['date', 'merchant', 'description', 'amount']].sort_values(by=['date', 'merchant'])


def detect_price_creep(df):
    """
    Identifies price creep ONLY within the recurring subscription subset 
    to eliminate noisy false positives from general shopping or variable vendor pricing.
    """
    recurring_df = detect_recurring_subscriptions(df, max_cv=0.25)
    if recurring_df.empty:
        return pd.DataFrame(columns=['merchant', 'initial_price', 'latest_price', 'increase'])

    creep_list = []
    sorted_df = df.sort_values('date')

    for merchant in recurring_df['merchant']:
        group = sorted_df[sorted_df['merchant'] == merchant]
        if len(group) >= 2:
            initial_price = group.iloc[0]['amount']
            latest_price = group.iloc[-1]['amount']

            if latest_price > initial_price:
                creep_list.append({
                    'merchant': merchant,
                    'initial_price': initial_price,
                    'latest_price': latest_price,
                    'increase': latest_price - initial_price
                })

    return pd.DataFrame(creep_list) if creep_list else pd.DataFrame(columns=['merchant', 'initial_price', 'latest_price', 'increase'])
