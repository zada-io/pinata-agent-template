# Assistant with Permissions

An assistant that asks before it acts for you.

Deploying an agent takes minutes. Deciding what it may do in your name, and being able to show
later what it did, is the part that is usually missing. This template adds it with one secret.

## What you get

- **Permissions you set.** In the ZADA app you choose what the agent may do: reply to emails,
  send new ones, publish posts, register, book, pay up to an amount. Each permission has an end date.
- **Approval on your phone.** For anything you set to "ask me every time", the agent stops and
  waits until you approve.
- **A signed record.** Every request, decision and outcome is kept in a record that you hold and
  can check yourself.

The agent asks ZADA before each action and reports afterwards. ZADA is not in the path of the
action itself, so it records what the agent asks and cannot stop an agent that does not ask. The
instructions in this template tell the agent to ask every time.

## Set-up (about 5 minutes)

1. **Get ZADA.** Open https://home.zada.io/welcome (for yourself) or https://work.zada.io (for a
   team). ZADA is in early access: request an access code at https://agents.zada.io.
2. **Add the agent.** In the app: Agents > Add an agent. Copy the connection key. It starts with
   `zna_` and is shown once.
3. **Store the key.** In Pinata, add it to the Secrets Vault as `ZADA_AGENT_KEY`.
4. **Deploy this template** and attach the secret.
5. **Say hello.** On the first conversation the agent checks its connection and asks you for a
   first permission. Review it in the ZADA app, change what you want, and sign.

## Try it

> "Reply to Sam and confirm Friday."

The agent asks ZADA, is allowed, replies and reports. The record shows the request and the outcome.

> "Write to the venue and ask for a quote."

If you set new emails to "ask me every time", the agent tells you it waits for your approval.
Approve in the ZADA app and it continues.

> "Post the announcement."

If your permission does not cover it, the agent says so and asks you for that permission. It does
not post.

## What is in the template

```text
manifest.json                  One secret: ZADA_AGENT_KEY
workspace/
  AGENTS.md                    The rule: ask before you act, report after
  BOOTSTRAP.md                 First conversation: check the connection, ask for a permission
  SOUL.md, IDENTITY.md, USER.md, TOOLS.md, HEARTBEAT.md
  skills/zada/
    SKILL.md                   How and when to ask ZADA
    zada.mjs                   One script, no dependencies, calls https://mcp.zada.io/mcp
    .env.example
```

The template gives the agent no email, calendar or payment access by itself. Add the skills and
channels you want. The rule covers whatever you add.

## Using the skill in another agent

The folder `workspace/skills/zada/` is a complete skill. Upload it in the Skills Library, attach it
to any agent, and attach the `ZADA_AGENT_KEY` secret.

## Take it back

- Withdraw a permission: ZADA app > the agent > Withdraw.
- Cut the connection: ZADA app > the agent > Disconnect. The key stops working at once.

## Questions

info@zada.io

## Licence

Apache-2.0. See `LICENSE`.
