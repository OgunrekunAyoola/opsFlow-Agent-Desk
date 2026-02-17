---
title: "Gmail Setup"
categoryId: "setup"
categoryLabel: "Setup"
readTime: "5 min"
updatedAt: "2026-02-17"
summary: "Configure Gmail or Google Workspace to forward into OpsFlow."
---

# Gmail Setup

This guide assumes you are using Google Workspace. Steps may differ slightly for personal Gmail
accounts.

## Step 1: Add forwarding address

1. Open Gmail.
2. Click the gear icon → **See all settings**.
3. Go to the **Forwarding and POP/IMAP** tab.
4. Click **Add a forwarding address**.
5. Paste your OpsFlow inbound email address and confirm.

Gmail sends a confirmation email to OpsFlow. It appears as a ticket.

## Step 2: Confirm forwarding

1. In OpsFlow, open the new ticket created from Gmail&apos;s confirmation email.
2. Copy the verification code from the email body.
3. Paste it into the Gmail confirmation dialog and confirm.

## Step 3: Create a filter

1. In Gmail settings, click **Filters and blocked addresses**.
2. Create a new filter for messages sent to your support address.
3. Choose **Forward it to** and select the OpsFlow forwarding address.

New support emails now flow automatically into OpsFlow as tickets.

