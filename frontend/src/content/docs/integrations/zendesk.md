---
title: "Zendesk Integration"
categoryId: "integrations"
categoryLabel: "Integrations"
readTime: "6 min"
updatedAt: "2026-02-17"
summary: "Use OpsFlow as an AI triage layer on top of Zendesk."
---

# Zendesk Integration

This integration pattern keeps Zendesk as your system of record while OpsFlow handles AI
triage and suggested replies.

## High-level flow

1. A ticket is created in Zendesk.
2. A small middleware service calls the OpsFlow API with ticket details.
3. OpsFlow runs triage and returns category, priority, sentiment, and a suggested reply.
4. The middleware writes those results back into Zendesk (custom fields or internal notes).

## Data to send to OpsFlow

- Zendesk ticket ID
- subject and body
- requester details (email, name)

Use these fields when calling the OpsFlow `/tickets` or triage endpoints.

