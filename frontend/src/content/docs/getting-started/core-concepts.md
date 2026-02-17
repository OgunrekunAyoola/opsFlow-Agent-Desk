---
title: "Core Concepts"
categoryId: "getting-started"
categoryLabel: "Getting Started"
readTime: "6 min"
updatedAt: "2026-02-17"
summary: "Understand tenants, tickets, AI triage, auto‑reply, and roles."
---

# Core Concepts

Understanding a few core concepts makes OpsFlow much easier to reason about.

## Tenants

A **tenant** is your workspace. Each tenant has:

- its own users and roles
- its own tickets and settings
- its own inbound email address and secrets

Data is strictly isolated between tenants.

## Tickets

Tickets are the atomic unit of work. A ticket has:

- subject and body
- customer name and email
- priority, status, and category
- history of replies and AI analyses

Tickets can be created from inbound email, internal tools, or manually via the UI.

## AI triage

AI triage analyses a ticket and suggests:

- category (billing, bug, feature, etc.)
- sentiment (positive, neutral, negative)
- priority (low, medium, high, urgent)
- an optional summary and suggested reply

You can trigger triage automatically or manually from the ticket view.

## Auto‑reply

Auto‑reply is an optional layer on top of triage. You choose:

- which categories are “safe” for auto‑reply
- the minimum confidence threshold

When those conditions are met, OpsFlow can send AI‑generated replies automatically.

## Roles

- **Admins** can configure settings, invite users, and see everything.
- **Members** focus on the day‑to‑day ticket queue.

Most teams start with one or two admins and several agents as members.

