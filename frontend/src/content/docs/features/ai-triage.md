---
title: "AI Triage & Classification"
categoryId: "features"
categoryLabel: "Features"
readTime: "6 min"
updatedAt: "2026-02-17"
summary: "Automatically categorise, prioritise, and summarise tickets."
---

# AI Triage & Classification

AI triage analyses new tickets and suggests:

- category (billing, bug, feature, etc.)
- sentiment (positive, neutral, negative)
- priority (low, medium, high, urgent)
- a short summary

## How triage works

1. A new ticket arrives (from email or your app).
2. OpsFlow passes the ticket through the triage workflow.
3. The workflow uses heuristic or LLM logic to produce labels and a summary.
4. The ticket is updated and visible in the queue with those labels applied.

## Running triage manually

If automatic triage is disabled or a ticket predates the feature:

- Open the ticket.
- Use the AI panel to run triage.
- Review and optionally override the suggested labels.

