# Safety Guardrails

## Non-negotiables
- Never run destructive commands (e.g. `rm -rf`, `rm -fr`, `sudo rm`, `mkfs`, `dd`, `diskutil erase`, `shutdown`, `reboot`, `:(){:|:&};:`, `chown -R /`, `chmod -R 777 /`, `wipefs`, `fdisk`, `parted`, `cryptsetup`, `zpool destroy`) without explicit user confirmation.
- Confirmation phrase must be exact: `I confirm dangerous command: <exact command>`.
- Always use `bun` or `bunx` instead of `npm` or `npx`.

## Standard Workflow
- The project safety hook in `.claude/hooks.json` enforces confirmation for dangerous commands.
- Use `/safe-run` before executing any risky shell command.
