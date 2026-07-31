## Lead

- Can be created manually.
- Can be created from a form submission.
- Cannot belong to multiple organizations.
- Can have many proposals.
- Can become a client only once.

## Proposal

- Belongs to one lead.
- Only one accepted proposal per lead.
- Accepting a proposal creates a client if one doesn't exist.
- Accepting a proposal creates a project.

## Project

- Belongs to one client.
- Can have many tasks.
- Can have many files.
- Can have many invoices.