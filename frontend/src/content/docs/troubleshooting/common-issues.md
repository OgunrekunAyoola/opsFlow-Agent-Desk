---
title: "Common Issues"
categoryId: "troubleshooting"
categoryLabel: "Troubleshooting"
readTime: "6 min"
updatedAt: "2026-02-17"
summary: "Debug inbound email, AI triage, and access problems."
---

# Common Issues

## No tickets from email

- Confirm forwarding is enabled in your email provider.
- Check spam and security filters; messages must reach OpsFlow for tickets to be created.
- Verify that the inbound email address in **Settings → Email** matches the forward target.

## AI triage did not run

- Check that AI features are enabled for your tenant.
- Ensure the ticket has enough text; very short messages may be ignored.
- You can always trigger triage manually from the ticket view.

## Agents cannot see tickets

- Make sure agents are invited to the correct tenant.
- Confirm they log in with the same email you invited.
- Verify they have at least member access.

## Web app shows 401 errors

- Access tokens are short‑lived. Log out and log back in.
- If you are building an integration, handle token expiry and refresh logic.

