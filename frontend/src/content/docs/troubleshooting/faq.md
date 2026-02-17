---
title: "FAQ"
categoryId: "troubleshooting"
categoryLabel: "Troubleshooting"
readTime: "4 min"
updatedAt: "2026-02-17"
summary: "Answers to common questions about authentication, limits, and environments."
---

# FAQ

## Is the API stable?

Yes. The surface area is intentionally small and changes are rolled out in a backwards
compatible way whenever possible.

## How does authentication work?

OpsFlow uses short‑lived access tokens issued via the `/auth` endpoints. Integrations should:

- send tokens via the `Authorization: Bearer <access_token>` header
- handle `401` responses by refreshing tokens or re‑authenticating

## Can I have multiple environments?

Yes. You can create separate tenants for staging and production and point each environment
at the right tenant.

## Does OpsFlow replace my helpdesk or CRM?

Not necessarily. Many teams start with OpsFlow as a triage and routing layer that feeds
their existing tools.

