---
title: "Outlook Setup"
categoryId: "setup"
categoryLabel: "Setup"
readTime: "5 min"
updatedAt: "2026-02-17"
summary: "Configure Outlook or Microsoft 365 to forward into OpsFlow."
---

# Outlook Setup

These steps target Microsoft 365 admin. You may need help from your IT team if you do not have
admin access.

## Step 1: Choose or create a shared mailbox

1. Open the Microsoft 365 admin centre.
2. Go to **Exchange admin** → **Recipients** → **Shared**.
3. Create or choose a shared mailbox such as `support@yourcompany.com`.

## Step 2: Add a forwarding rule

1. In Exchange admin, go to **Mail flow** → **Rules**.
2. Create a new rule, for example **Forward support to OpsFlow**.
3. Set the condition to messages sent to your shared support mailbox.
4. Set the action to **Redirect the message to** your OpsFlow inbound email address.

## Step 3: Test the integration

1. Send an email to your shared mailbox from a personal account.
2. Confirm that a ticket appears in OpsFlow with the same subject and body.

Once this works, your support team can keep using Outlook while OpsFlow handles triage and
routing.

