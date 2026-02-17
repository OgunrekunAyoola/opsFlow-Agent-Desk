---
title: "Email Forwarding Setup"
categoryId: "setup"
categoryLabel: "Setup"
readTime: "5 min"
updatedAt: "2026-02-17"
summary: "Connect your support inbox so every email becomes a ticket."
---

# Email Forwarding Setup

Email forwarding lets you keep your existing support address while OpsFlow creates and triages
tickets for every message.

## Prerequisites

- Admin access to your email provider (Google Workspace or Microsoft 365).
- An OpsFlow workspace with admin permissions.

## Step 1: Get your inbound address

1. In OpsFlow, open **Settings → Email**.
2. Copy the **Inbound email address** shown for your tenant.

This address is unique per tenant and is protected by a secret header.

## Step 2: Configure forwarding

In your email provider, create or choose the customer‑facing address, such as
`support@yourcompany.com`, and configure a forward to your OpsFlow inbound address.

See the **Gmail Setup** and **Outlook Setup** articles for provider‑specific steps.

## Step 3: Send a test

1. From a personal email account, send a message to your support address.
2. Wait a few seconds.
3. Open the **Tickets** page in OpsFlow.

You should see a new ticket that matches the subject and body of your email.

