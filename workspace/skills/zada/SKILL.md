---
name: zada
description: Ask the owner's permission before acting for them, and leave a signed record. Use before sending or replying to a message, posting, booking, registering, changing an account or paying.
---

# ZADA: ask before you act

You act for the person who deployed you. They set what you may do in the ZADA app.
Before you act in their name you ask ZADA, and after you acted you report. ZADA checks
the request against the permission they signed, asks them when their approval is needed,
and keeps a signed record that they can check later.

ZADA is not in the path of the action itself. It cannot stop you if you do not ask.
So you ask every time.

## How to call ZADA

One script, no install. Run it from this skill's folder:

```bash
node skills/zada/zada.mjs check
node skills/zada/zada.mjs ask '{"action":"email.send","description":"Send the meeting summary","counterparty":"Sam at Tarnbrook"}'
node skills/zada/zada.mjs wait '{"intent_id":"..."}'
node skills/zada/zada.mjs report '{"intent_id":"...","outcome":"done","summary":"Summary sent"}'
node skills/zada/zada.mjs request-mandate '{"proposal":{...},"why":"..."}'
```

It reads the key from the environment variable `ZADA_AGENT_KEY` and prints the answer as JSON.
Never print, log or repeat the key.

## Every time, in this order

1. **Ask.** Call `ask` with:
   - `action`: a short dotted id in lower case. Common ones: `email.reply`, `email.send`,
     `post.publish`, `event.register`, `booking.create`, `account.change`, `payment.external`.
   - `description`: one plain sentence on what you will do. No message content.
   - `counterparty`: who it involves (a person, an organisation or a site).
   - `amount` and `currency`: only if money moves. The amount is in minor units (1250 = 12.50).
   - `request_id`: your own id for this ask, if you have one. The same id gives the same answer.
2. **Read the answer.** Keep its `intent_id`.
   - `"allowed": true`: do it now, then go to step 3.
   - `"decision": "pending_approval"`: tell the person "This waits for your approval in ZADA."
     Call `wait` with the `intent_id` once. If the answer has `"allowed": true`, do it and go to
     step 3. If it is still waiting, stop and say so. Do not act. Do not poll.
   - `"decision": "no_mandate"`: you have no permission for this yet, or it ran out. Call
     `request-mandate` with what you need (see below), tell the person you asked, and do not act.
   - Anything else is a refusal. Tell the person the `reason` as returned. Do not rephrase the
     request to get it through. That is recorded.
3. **Report.** After you acted, call `report` with the `intent_id`, `outcome` (`done` or
   `failed`) and a one-line `summary`. Report a failure too.

## Asking for a permission

```json
{
  "proposal": {
    "description": "Reply to emails and send new ones for the owner",
    "allowed_actions": [
      { "action": "email.reply" },
      { "action": "email.send", "approval": "always" }
    ],
    "days": 14
  },
  "why": "The owner asked me to handle their inbox"
}
```

Ask for the smallest permission that covers the task. `approval: "always"` means the person
approves every such action. Where money moves, give `max_amount` and `currency` per action.
The person can change anything before they sign.

## Rules

- One ask per action. Never act first and ask afterwards.
- Never put the text of a message, a customer's details or anything private in `description`,
  `summary` or `why`. Say what kind of thing it is and who it is for.
- A draft you show the person and do not send needs no ask. Sending it does.
- Only the person who deployed you can ask you to act in their name.
- If `check` fails, say so and do not act for the person until it works. The usual causes:
  the secret `ZADA_AGENT_KEY` is not attached to this agent, or the agent was disconnected
  in the ZADA app.
