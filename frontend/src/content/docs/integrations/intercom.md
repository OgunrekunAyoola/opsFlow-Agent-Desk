---
title: "Intercom Integration"
categoryId: "integrations"
categoryLabel: "Integrations"
readTime: "6 min"
updatedAt: "2026-02-17"
summary: "Bring AI triage and replies into Intercom conversations."
---

# Intercom Integration

Intercom is often the first touchpoint for customer questions. OpsFlow can enrich Intercom
conversations with AI triage and suggested replies.

## High-level flow

1. A new conversation or ticket appears in Intercom.
2. A backend worker subscribes to Intercom webhooks.
3. For each new conversation, the worker calls OpsFlow with the transcript.
4. OpsFlow returns labels and a suggested reply which the worker writes back as an internal note.

## Suggested fields to sync

- conversation ID
- customer email or user ID
- last message text
- AI category, sentiment, priority

Your agents can then use these signals to decide when to escalate, respond, or close.

