---
name: harness-config
description: View and modify Harness runtime configuration (.harness.yaml) — compact threshold, HITL settings, and other project-level options.
---

# harness-config

You are helping a user view and modify their Harness runtime configuration. This is a simple read-display-edit loop.

---

## Step 1: Read Configuration

1. Read `.harness.yaml` from the project root.

2. If the file does not exist, tell the user:

   > No `.harness.yaml` found. Run `/harness-init` to initialize your project first.

   Then stop.

3. If the file exists but is malformed (invalid YAML, missing required keys), tell the user:

   > Your `.harness.yaml` appears malformed. Would you like me to reset it to defaults?

   If yes, write the default config (see Schema below) and continue. If no, stop.

---

## Step 2: Display Current Configuration

Show the current state in this format:

```
Current Harness Configuration:

max_compacts: 3               — Context compact exit threshold
hitl_on_stage_boundary: true  — Pause at Stage boundaries for confirmation
```

Use the actual values from the file. Then ask:

> What would you like to change? (or "done" to exit)

---

## Step 3: Handle Modifications

Process one setting at a time.

### max_compacts

- Accept an integer value from the user.
- Validate: must be a positive integer (>= 1).
- If the value is > 3, show this warning:

  > Values above 3 may lead to degraded context quality. Are you sure?

  Require explicit confirmation before applying.

### hitl_on_stage_boundary

- Toggle between `true` and `false`.
- No warning needed.

### Unknown setting

If the user asks to change something not in the schema, tell them it's not a recognized setting and show the available options.

---

## Step 4: Save and Confirm

1. Write the updated config back to `.harness.yaml`.
2. Confirm the change: "Updated `<setting>` to `<value>`."
3. Show the full config again (same format as Step 2).
4. Ask if they want to change anything else, or exit.

---

## Configuration Schema

```yaml
# .harness.yaml
max_compacts: 3                  # integer, >= 1, default 3
hitl_on_stage_boundary: true     # boolean, default true
```

## Defaults

If resetting or creating fresh:

```yaml
max_compacts: 3
hitl_on_stage_boundary: true
```
