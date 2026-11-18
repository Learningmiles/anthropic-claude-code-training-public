---
name: northwind-pr
description: Write the pull request description for the current branch in the team's required Northwind format (ticket-prefixed title, what changed, how I verified it, acceptance criteria, deliberately not done). Use when the user asks to write or draft a PR description, or invokes /northwind-pr.
---

# /northwind-pr

Write the pull request description for the work in this branch, in the team's required format.

The reviewer reads this before the diff. Every claim in it has to be something you can point to.

## Before you write anything

Read all three. Do not draft from memory or from the conversation alone.

1. **The branch diff.** `git diff main...HEAD --stat`, then the diff itself. What actually changed, not what was intended.
2. **The git log.** `git log main..HEAD --oneline`. How the work was sequenced, and whether the commit subjects carry the ticket ID.
3. **The ticket.** The matching file in `docs/tickets/`. Take the ID, the acceptance criteria (verbatim) and any notes from the team.

If any of these cannot be read (no ticket found, branch has no commits ahead of `main`), say so and stop. Do not fill the gap with a guess.

## Output format

Produce exactly these parts, in this order.

### Title

`<TICKET-ID>: <what it does>`

The ID comes from the ticket. The rest says what the change does in plain words, for example `NWP-101: add export options`.

### What changed

One plain-language paragraph. What can the app do now that it could not do before? Not a file list; the diff already is one.

### How I verified it

The actual commands that were run and what they output.

- Quote the command and the real output line, for example `npm test` followed by `Tests  39 passed (39)`.
- Include what was clicked in the browser and what appeared, if that was done.
- If a check was not run, leave it out or write "not run". Never fill it in.

### Acceptance criteria

Copy the ticket's checkboxes verbatim, then tick them honestly.

- Tick a box only when you can point to the code or the check that meets it.
- If a criterion is partly done, leave it unticked and add a note that says which part is done and which is not.
- If you cannot tell whether it is met, leave it unticked and say it is unverified.

### Deliberately not done

Anything out of scope, left for a follow-up, or known to be rough. Name the file or area and the reason. If nothing was left out, write "Nothing."

## Rules

- **Never claim a verification step that was not actually run.** If a command was not run in this session, or its output was not seen, it does not go under "How I verified it". An honest gap beats an invented check.
- **Do not tick an acceptance criterion on intent.** Only on evidence.
- **Evidence over adjectives.** Exact commands, exact counts, exact outputs.
- **Plain language.** Short paragraphs and real bullets; no filler.
- **No placeholders left behind.** No `NWP-____`, no empty sections.

## After writing

Print the finished description. If the user wants it opened as a pull request, ask first and name the repository and branches. Opening a pull request is the user's decision.
