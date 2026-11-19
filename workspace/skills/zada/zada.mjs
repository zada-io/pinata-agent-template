#!/usr/bin/env node
// zada.mjs: call the ZADA connector (MCP over HTTP, JSON-RPC 2.0) with the agent's key.
// No dependencies. Needs Node 18 or newer (built-in fetch).
//
//   node zada.mjs check
//   node zada.mjs ask '{"action":"email.send","description":"...","counterparty":"..."}'
//   node zada.mjs wait '{"intent_id":"..."}'
//   node zada.mjs report '{"intent_id":"...","outcome":"done","summary":"..."}'
//   node zada.mjs request-mandate '{"proposal":{...},"why":"..."}'
//
// Environment: ZADA_AGENT_KEY (required, zna_...), ZADA_URL (optional).
// The key is sent only in the Authorization header and is never printed.

const URL_DEFAULT = 'https://mcp.zada.io/mcp'
const TOOLS = { ask: 'zada_ask', wait: 'zada_wait', report: 'zada_report', 'request-mandate': 'zada_request_mandate' }
const TIMEOUT_MS = 90_000 // a held request waits for a person

function fail(code, message, extra = {}) {
  console.log(JSON.stringify({ ok: false, error: code, message, ...extra }, null, 2))
  process.exit(1)
}

const [command, raw] = process.argv.slice(2)
if (!command || command === 'help' || (command !== 'check' && !TOOLS[command])) {
  fail('usage', `Use: node zada.mjs check | ${Object.keys(TOOLS).join(' | ')} '<json arguments>'`)
}

// The app copies either the bare key or a longer connection text; only the zna_ part is used.
const key = (process.env.ZADA_AGENT_KEY || '').match(/zna_[A-Za-z0-9_-]+/)?.[0]
if (!key) fail('no_key', 'ZADA_AGENT_KEY is not set on this agent. Add the key from the ZADA app as a secret, attach it and restart.')

const url = process.env.ZADA_URL || URL_DEFAULT
// The key travels in a header: https only, except a local test server.
if (!/^https:\/\//.test(url) && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) fail('bad_url', 'ZADA_URL must start with https://')

let args = {}
if (command !== 'check') {
  try {
    args = JSON.parse(raw ?? '')
  } catch {
    fail('bad_arguments', 'The second argument must be one JSON object in single quotes.')
  }
  if (!args || typeof args !== 'object' || Array.isArray(args)) fail('bad_arguments', 'The arguments must be a JSON object.')
}

async function rpc(method, params) {
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    fail('unreachable', `ZADA did not answer (${e.name === 'TimeoutError' ? 'timed out' : 'network error'}). Do not act; try again later.`)
  }
  const text = await res.text()
  if (res.status === 401) fail('not_connected', 'ZADA did not accept the key. It is wrong, or the agent was disconnected in the ZADA app. Ask the owner for a new key.')
  // The server may answer as plain JSON or as one server-sent event.
  const body = text.trimStart().startsWith('{') ? text : (text.match(/^data:\s*(\{.*\})\s*$/m)?.[1] ?? text)
  let json
  try {
    json = JSON.parse(body)
  } catch {
    fail('bad_answer', `ZADA answered with status ${res.status} and no JSON.`, { status: res.status })
  }
  if (!res.ok || json.error) fail('zada_error', json.error?.message || json.message || `Status ${res.status}`, { status: res.status, code: json.error?.code ?? json.code })
  return json.result
}

if (command === 'check') {
  const result = await rpc('tools/list', {})
  const names = (result.tools || []).map((t) => t.name)
  const missing = Object.values(TOOLS).filter((t) => !names.includes(t))
  if (missing.length) fail('tools_missing', `Connected, but these tools are not offered to this agent: ${missing.join(', ')}`, { tools: names })
  console.log(JSON.stringify({ ok: true, connected: true, tools: Object.values(TOOLS) }, null, 2))
} else {
  const result = await rpc('tools/call', { name: TOOLS[command], arguments: args })
  if (result.isError) fail('refused_call', result.content?.[0]?.text || 'ZADA did not accept the call.')
  const answer = result.structuredContent ?? result.content?.[0]?.text ?? result
  console.log(typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2))
}
