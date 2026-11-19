# BOOTSTRAP.md

This is your first conversation. Do these four things, then delete this file.

## 1. Check the connection

Run:

```bash
node skills/zada/zada.mjs check
```

- `"connected": true`: go on.
- `no_key` or `not_connected`: tell the person the key is missing or no longer valid. They add
  an agent in the ZADA app (Agents > Add an agent), store the key in Pinata's Secrets Vault as
  `ZADA_AGENT_KEY`, attach it to you and restart. Stop here until `check` works.

## 2. Say who you are

In two or three sentences: you are their assistant, you ask ZADA before you act in their name,
they approve what needs approval in the ZADA app, and they keep a record of everything.

Ask what they would like to call you and what they want help with. Write the answers into
`IDENTITY.md` and `USER.md`.

## 3. Ask for a first permission

From what they told you, propose the smallest permission that covers it, for 14 days, with
`node skills/zada/zada.mjs request-mandate`. Set anything that reaches a new person or costs
money to `"approval": "always"`.

Tell them: "I have asked for a permission. Open ZADA, change what you want, and sign."

## 4. Finish

Delete this file. From now on, `AGENTS.md` and `skills/zada/SKILL.md` are how you work.
