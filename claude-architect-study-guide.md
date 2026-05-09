# Claude Certified Architect — Foundations Certification Study Guide

---

## Exam Overview

| Attribute | Detail |
|---|---|
| Scale | 100–1000 points |
| Passing score | **720** |
| Format | Multiple choice — 1 correct answer of 4 options |
| Scenarios | 4 randomly selected from 8 possible |
| Guessing penalty | **None** — always answer every question |
| Experience required | 6+ months hands-on with Claude API, Agent SDK, Claude Code, MCP |

### Five Weighted Domains

| Domain | Weight |
|---|---|
| Agent Architecture & Orchestration | **27%** |
| Claude Code Configuration | **20%** |
| Prompt Engineering & Structured Output | **20%** |
| Tool Design & MCP Integration | **18%** |
| Context Management & Reliability | **15%** |

---

# PART I: THEORY FOUNDATIONS

---

## Chapter 1: Claude API — Fundamentals of Model Interaction

### 1.1 API Request Structure

The Claude API follows a request–response model. Key fields in every request:

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hi!"},
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "How are you?"}
  ],
  "tools": [...],
  "tool_choice": {"type": "auto"}
}
```

| Field | Purpose |
|---|---|
| `model` | Model selection (`claude-opus-4-7`, `claude-sonnet-4-6`, `claude-haiku-4-5`) |
| `max_tokens` | Maximum response tokens |
| `system` | System prompt — defines model behavior |
| `messages` | Full conversation history (must be sent on every request) |
| `tools` | Tool definitions |
| `tool_choice` | Tool selection strategy |

> **Critical:** You must send the **full conversation history** on every request. The model does not persist state between calls.

### 1.2 Message Roles

- `user` — user messages
- `assistant` — model responses (included when sending history)
- `tool` — tool call results (appears as a `tool_result` content block)

### 1.3 The `stop_reason` Field

| Value | Meaning | Action |
|---|---|---|
| `"end_turn"` | Model finished responding | Show result to user |
| `"tool_use"` | Model wants to call a tool | Execute tool and return result |
| `"max_tokens"` | Token limit reached | Response is truncated; increase limit |
| `"stop_sequence"` | Stop sequence hit | Handle per application logic |

For agentic systems, `"tool_use"` and `"end_turn"` are the only values that matter.

### 1.4 System Prompt

- Passed in the `system` field (not in `messages`)
- Has priority over user messages
- Loaded once and applies throughout the conversation
- **Exam trap:** overly broad instructions (e.g., "always verify the customer") can cause the model to call `get_customer` even when unnecessary.

### 1.5 Context Window

Includes: system prompt + full message history + tool definitions + tool results.

**Three key problems:**

| Problem | Description | Mitigation |
|---|---|---|
| Lost-in-the-middle | Model reliably processes start and end, but misses details in the middle | Place key info near beginning or end |
| Tool result accumulation | 40+ field responses waste context when only 5 fields matter | Trim to relevant fields via PostToolUse hook |
| Progressive summarization | Numeric values, percentages, and dates get lost as vague "about", "roughly" | Extract facts into a persistent "case facts" block |

---

## Chapter 2: Tools and `tool_use`

### 2.1 What is `tool_use`

`tool_use` lets Claude call external functions. The model generates a structured call request; your code executes it and returns the result.

### 2.2 Tool Definition

```json
{
  "name": "get_customer",
  "description": "Finds a customer by email or ID. Returns name, email, order history, account status. Use BEFORE lookup_order to verify identity. Accepts email (user@domain.com) or numeric customer_id.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": {"type": "string"},
      "customer_id": {"type": "integer"}
    },
    "required": []
  }
}
```

**Critical rules for tool descriptions:**
1. The description is the **primary selection mechanism** — the model chooses tools based on descriptions alone.
2. Include: what it does, what it returns, input formats, edge cases, when to use vs similar tools.
3. Avoid overlapping descriptions — `analyze_content` and `analyze_document` with similar descriptions will be confused.
4. MCP tools competing with built-in tools: strengthen MCP descriptions with concrete advantages that built-in tools cannot provide.

### 2.3 The `tool_choice` Parameter

| Value | Behavior | When to use |
|---|---|---|
| `{"type": "auto"}` | Model decides whether to use a tool | Default |
| `{"type": "any"}` | Model must call some tool | Guaranteed structured output |
| `{"type": "tool", "name": "..."}` | Model must call this specific tool | Force execution order |

### 2.4 JSON Schemas for Structured Output

Using `tool_use` with JSON schemas is the **most reliable** method for structured output:
- Guarantees syntactically valid JSON (no missing braces, no trailing commas)
- Enforces required fields
- Does **not** guarantee semantic correctness

**Schema design rules:**
1. **Required vs optional:** only mark fields as required if information is always available — required fields push the model to fabricate values.
2. **Nullable fields:** use `"type": ["string", "null"]` for possibly absent data.
3. **Enums with `"other"`:** add an `"other"` option plus a detail string to avoid losing data.
4. **Enum `"unclear"`:** honest `"unclear"` beats a wrong category.

### 2.5 Syntax vs Semantic Errors

| Error type | Example | Mitigation |
|---|---|---|
| **Syntax** | Invalid JSON, wrong field type | `tool_use` with JSON schema (eliminates) |
| **Semantic** | Totals don't add up, value in wrong field, hallucination | Validation checks, retry with feedback, self-correction |

---

## Chapter 3: Claude Agent SDK — Building Agentic Systems

### 3.1 What is an Agentic Loop

```
1. Send request to Claude with tools
2. Receive response
3. Check stop_reason:
   - "tool_use" → execute tool, append result to history → go to step 1
   - "end_turn" → task complete, show result
4. Repeat until end_turn
```

**Anti-patterns to avoid:**
- Parsing assistant text for completion signals ("Task completed")
- Using an arbitrary iteration limit (`max_iterations=5`) as the primary stop condition
- Checking whether the assistant produced text as a completion signal

> **The only reliable completion signal is `stop_reason == "end_turn"`.**

### 3.2 `AgentDefinition` Configuration

```python
agent = AgentDefinition(
    name="customer_support",
    description="Handles customer requests for returns and order issues",
    system_prompt="You are a customer support agent...",
    allowed_tools=["get_customer", "lookup_order", "process_refund", "escalate_to_human"],
    # For coordinator: allowed_tools=["Task", "get_customer", ...]
)
```

### 3.3 Hub-and-Spoke: Coordinator and Subagents

```
         Coordinator
        /     |      \
   Subagent1  Subagent2  Subagent3
    (search)  (analysis) (synthesis)
```

**Coordinator owns:**
- Task decomposition into subtasks
- Dynamic subagent selection
- Delegating work
- Aggregating and validating results
- Error handling and retries
- Communicating with the user

> **Critical:** Subagents have **isolated context** — they do not automatically inherit the coordinator's conversation history. All required context must be **explicitly passed** in the subagent prompt.

### 3.4 The `Task` Tool for Spawning Subagents

The coordinator's `allowedTools` must include `"Task"`.

```
# Bad: subagent has no context
Task: "Analyze the document"

# Good: full context in the prompt
Task: "Analyze the following document.
Document: [full document text]
Prior search results: [web search results]
Output format: [schema]"
```

**Parallel spawning:** a coordinator can include multiple `Task` calls in one response — they run concurrently.

### 3.5 Hooks in the Agent SDK

**PostToolUse** — intercepts tool results before the model sees them:

```python
@hook("PostToolUse")
def normalize_dates(tool_result):
    # Convert Unix timestamps to ISO 8601
    return normalized_result
```

**PreToolUse** — blocks policy-violating actions:

```python
@hook("PreToolUse")
def enforce_refund_limit(tool_call):
    if tool_call.name == "process_refund" and tool_call.args.amount > 500:
        return redirect_to_escalation(tool_call)
```

**Hooks vs prompt instructions:**

| Attribute | Hooks | Prompt instructions |
|---|---|---|
| Guarantee | **Deterministic (100%)** | **Probabilistic (>90%, not 100%)** |
| Use when | Critical business rules, financial ops, compliance | General preferences, formatting |
| Example | Block refunds > $500 | "Try to resolve before escalating" |

> **Rule:** when failure has financial, legal, or safety consequences — use hooks, not prompts.

---

## Chapter 4: Model Context Protocol (MCP)

### 4.1 What is MCP

MCP is an open protocol for connecting external systems to Claude. Three resource types:

1. **Tools** — functions the agent can call (CRUD, API calls, commands)
2. **Resources** — data the agent can read for context (docs, schemas, catalogs)
3. **Prompts** — predefined prompt templates

### 4.2 MCP Servers

- When you connect to an MCP server, all tools are discovered automatically
- Tools from all connected servers are available simultaneously
- Tool descriptions determine how the model selects them

### 4.3 Configuring MCP Servers

**Project scope (`.mcp.json`)** — for teams, managed in VCS:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

- Use environment variable substitution (`${GITHUB_TOKEN}`) — never commit tokens
- Available to all project contributors

**User scope (`~/.claude.json`)** — personal/experimental servers, not shared via VCS.

For standard integrations (Jira, GitHub, Slack), prefer existing community MCP servers over building your own.

### 4.4 The `isError` Flag in MCP

**Good — structured error:**

```json
{
  "isError": true,
  "content": {
    "errorCategory": "transient",
    "isRetryable": true,
    "message": "Service temporarily unavailable.",
    "attempted_query": "order_id=12345",
    "partial_results": null
  }
}
```

**Anti-pattern — generic error:**

```json
{ "isError": true, "content": "Operation failed" }
```

A generic error gives the agent nothing to act on — should it retry, change the query, or escalate?

### 4.5 MCP Resources

Resources provide context without taking actions (unlike tools):
- Content catalogs (task lists, hierarchical navigation)
- Database schemas
- Documentation (API references, internal guides)

**Advantage:** the agent doesn't need exploratory tool calls to understand what data exists — a resource provides an immediate "map."

---

## Chapter 5: Claude Code — Configuration and Workflows

### 5.1 The CLAUDE.md Hierarchy

```
1. User-level:       ~/.claude/CLAUDE.md
   - Only for that user; NOT shared via VCS
   - Personal preferences

2. Project-level:    .claude/CLAUDE.md  (or root CLAUDE.md)
   - All contributors; managed via VCS
   - Coding standards, testing standards, architecture

3. Directory-level:  CLAUDE.md in subdirectories
   - Active when working with files in that directory
```

> **Common mistake:** placing project instructions in `~/.claude/CLAUDE.md` (user-level) instead of `.claude/CLAUDE.md` (project-level) — new team members never see them.

### 5.2 `@path` Syntax (File Imports)

```markdown
Coding standards: @./standards/coding-style.md
Test requirements: @./standards/testing-requirements.md
```

- Use `@` immediately before the path (no space)
- Relative paths resolve from the file containing the import
- Maximum import nesting depth: 5

### 5.3 The `.claude/rules/` Directory

Alternative to a monolithic CLAUDE.md, organized by topic:

```
.claude/rules/
  testing.md
  api-conventions.md
  deployment.md
```

**YAML frontmatter for conditional loading:**

```yaml
---
paths: ["src/api/**/*"]
---
For API files, use async/await with explicit error handling.
```

```yaml
---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---
Tests must use describe/it blocks.
```

A rule loads **only** when Claude Code edits a file matching `paths` — saves context and tokens.

**When to use `.claude/rules/` with `paths` vs directory-level CLAUDE.md:**
- `.claude/rules/` with `paths` — conventions apply to files spread across many directories (tests, migrations)
- Directory-level CLAUDE.md — conventions tied to a specific directory

### 5.4 Custom Slash Commands and Skills

**Project commands** (`.claude/commands/` or `.claude/skills/`) — stored in VCS, available to everyone.
**User commands** (`~/.claude/commands/` or `~/.claude/skills/`) — personal, not shared.

### 5.5 Skills — `.claude/skills/`

```yaml
---
context: fork
allowed-tools: ["Read", "Grep", "Glob"]
argument-hint: "Path to the directory to analyze"
---
Analyze the code structure in the specified directory.
```

| Frontmatter | Description |
|---|---|
| `context: fork` | Runs skill in isolated subagent — verbose output doesn't pollute main session |
| `allowed-tools` | Restricts available tools (security) |
| `argument-hint` | Prompt shown when invoked without parameters |

### 5.6 Planning Mode vs Direct Execution

| Mode | When to use |
|---|---|
| **Planning** | Large changes (dozens of files), multiple approaches, architectural decisions, unfamiliar codebase, migrations touching 45+ files |
| **Direct execution** | Single-file fixes with a clear stack trace, adding one validation, unambiguous changes |

**Combined approach:** plan for discovery → user approves → direct execution for implementation.

**Explore subagent** — isolates verbose output from the main context; returns only a summary.

### 5.7 The `/compact` Command

Compresses context by summarizing prior history. Risk: exact numeric values, dates, and specific details can be lost.

### 5.8 The `/memory` Command

Edits `CLAUDE.md` to persist notes, preferences, and context across sessions. Information is automatically loaded on startup.

### 5.9 Claude Code CLI for CI/CD

```bash
# Non-interactive mode (required for CI)
claude -p "Analyze this pull request for security issues"

# Structured output
claude -p "Review this PR" --output-format json --json-schema '{...}'
```

- `-p` / `--print` flag: processes prompt, prints to stdout, exits — the **only** correct way to run Claude in CI/CD.
- **Session context isolation:** the session that generated code is less effective at reviewing it — use an independent instance for review.
- **Preventing duplicates:** on re-review after new commits, include prior results and instruct Claude to report only new/unresolved issues.

### 5.10 Session Management

```bash
# Resume a named session
claude --resume investigation-auth-bug
```

```
# fork_session: independent branches from shared context
Codebase investigation
         |
    fork_session
    /           \
Approach A      Approach B
(Redux)         (Context API)
```

**When to start fresh instead of resuming:** files changed since prior session; context has degraded; it's better to start with a structured summary than resume with stale tool data.

---

## Chapter 6: Prompt Engineering — Advanced Techniques

### 6.1 Few-shot Prompting

Include 2–4 input/output examples to demonstrate expected behavior.

**Why it beats textual descriptions:** a vague instruction like "be more precise" is interpreted many ways; an example shows format and decision logic unambiguously.

**Example — escalation decisions:**

```
Request: "My order is broken"
Action: Call get_customer → lookup_order → check status
Rationale: "broken" may mean damaged; need order details

Request: "Get me a manager"
Action: Immediately call escalate_to_human
Rationale: Customer explicitly requests a human — do not attempt autonomous resolution
```

**Example — extraction from different formats:**

```
Inline citation: "rate is 42% (Smith, 2023)"
→ {"value": "42%", "source": "Smith, 2023", "type": "inline_citation"}

Bibliography: "rate is 42%. [1]"
→ {"value": "42%", "source": "reference_1", "type": "bibliography"}
```

**Normalization rules in prompts** (for JSON schema output):

```
- Dates: always ISO 8601; "yesterday" → compute absolute date
- Currency: numeric + code; "five bucks" → {"amount": 5, "currency": "USD"}
- Percentages: decimal fraction; "half" → 0.5
```

### 6.2 Explicit Criteria vs Vague Instructions

**Bad (vague):**
```
Check code comments for accuracy. Be conservative.
```

**Good (explicit):**
```
Flag a comment ONLY if:
1. It describes behavior that CONTRADICTS the actual code
2. It references a non-existent function or variable
3. A TODO/FIXME refers to a bug already fixed in code

Do NOT flag:
- Stylistically outdated comments
- Minor wording inaccuracies
- Missing comments (separate category)
```

**Define severity with examples:**

```
CRITICAL: Runtime failure for users
  Example: NullPointerException during payment

HIGH: Security vulnerability
  Example: SQL injection, XSS, missing auth checks

MEDIUM: Logic bug without immediate impact
  Example: Wrong sorting, off-by-one error

LOW: Code quality
  Example: Duplication, suboptimal algorithm
```

### 6.3 Prompt Chaining

Break complex tasks into focused sequential steps:

```
Step 1: Analyze auth.ts → list of local issues
Step 2: Analyze database.ts → list of local issues
Step 3: Integration pass (cross-file) → issues at module boundaries
```

**Why:** avoids attention dilution — when the model receives too many files at once, it gives shallow analysis to some and deep analysis to others inconsistently.

**Prompt chaining vs dynamic decomposition:**
- **Prompt chaining** — predictable, repeatable tasks (code review, migrations)
- **Dynamic decomposition** — open-ended investigations where subtasks emerge during execution

### 6.4 The "Interview" Pattern

Before implementing, Claude asks clarifying questions:

```
"Before implementing caching, a few questions:
1. TTL or event-based invalidation?
2. Is stale data acceptable when cache is unavailable?
3. Per-user or global caching?
4. Expected data volume?"
```

Use when: unfamiliar domain, multiple viable approaches, non-obvious implications.

### 6.5 Validation and Retry-with-Feedback

```
Step 1: Extract data from document
Step 2: Validate (Pydantic, JSON Schema, business rules)
Step 3: On error — retry with:
  - The original document
  - The previous (incorrect) extraction
  - Specific error: "Field 'total' = 150, but sum(line_items) = 145"
```

**Retry works for:** format errors, structural errors, arithmetic inconsistencies.
**Retry does NOT work for:** information absent from the source; data in an external document not provided.

**Pydantic key points for the exam:**
- Structural validation: types, requiredness, enum constraints
- Semantic validation: custom validators (sum of items = total; start_date < end_date)
- Can generate JSON Schema for `tool_use` — single source of truth

### 6.6 Self-correction

Extract both a stated value and a calculated value; flag discrepancies:

```json
{
  "stated_total": "$150.00",
  "calculated_total": "$145.00",
  "conflict_detected": true,
  "line_items": [
    {"name": "Widget A", "price": 75.00},
    {"name": "Widget B", "price": 70.00}
  ]
}
```

---

## Chapter 7: Message Batches API

### 7.1 Overview

| Attribute | Value |
|---|---|
| Savings | **50%** vs synchronous |
| Processing window | Up to **24 hours** — no latency SLA |
| Multi-turn tool calling | **Not supported** |
| Correlation field | `custom_id` |

### 7.2 Batch API vs Synchronous API

| Task | API | Why |
|---|---|---|
| Pre-merge PR check | **Synchronous** | Developer is waiting — 24h unacceptable |
| Overnight tech-debt report | **Batch** | Needed by morning; 50% savings |
| Weekly security audit | **Batch** | Not urgent |
| Interactive code review | **Synchronous** | Immediate response required |
| Processing 10,000 documents | **Batch** | Bulk processing |

### 7.3 Using `custom_id`

```json
{
  "custom_id": "doc-invoice-2024-001",
  "params": { "model": "claude-sonnet-4-6", "messages": [...] }
}
```

Links result to original document. On failure: re-submit only failed documents (identified by `custom_id`).

### 7.4 SLA Planning

If you need a result in 30 hours and Batch API can take up to 24 hours:
- Submission deadline = 30 - 24 = **6 hours before deadline**
- For repeated submissions, split into 4-hour windows

---

## Chapter 8: Task Decomposition Strategies

### 8.1 Fixed Pipelines (Prompt Chaining)

```
Document → Metadata extraction → Data extraction → Validation → Enrichment → Final output
```

Use when: task structure is predictable, all steps known up front, stability and reproducibility needed.

### 8.2 Dynamic Adaptive Decomposition

```
"Add tests for a legacy codebase"
→ Map structure (Glob, Grep)
→ Found 3 modules with no tests, 2 with partial coverage
→ Prioritize payments module (high risk)
→ Discovered external API dependency
→ Add mock before writing tests
```

Use when: open-ended investigative tasks, scope unknown up front, each step depends on prior results.

### 8.3 Multi-pass Code Review

For PRs with 10+ files:

```
Pass 1 (per-file): Analyze each file → list of local issues per file
Pass 2 (integration): Analyze cross-file relationships
  → Inconsistent types, circular dependencies, dataflow issues
```

**Why not one pass over 14 files:**
- Attention dilution: deep analysis for some files, shallow for others
- Inconsistent findings: a pattern flagged in one file, approved in another
- Missed bugs: cognitive overload causes skipped issues

---

## Chapter 9: Escalation and Human-in-the-Loop

### 9.1 When to Escalate

| Situation | Action |
|---|---|
| Customer explicitly asks for a manager | Escalate **immediately** — do not attempt to solve |
| Policy does not cover the request | Escalate (policy gap) |
| Agent cannot make progress | Escalate after reasonable attempts |
| Financial operation above threshold | Escalate (enforce via hook, not prompt) |
| Multiple customer matches | Ask for additional identifiers — do not guess |

**Unreliable escalation triggers (avoid):**

| Method | Why it fails |
|---|---|
| Sentiment analysis | Mood doesn't correlate with case complexity |
| Model self-rated confidence (1–10) | Model can be confidently wrong; poor calibration |
| Automatic classifier | Requires training data; overengineering |

### 9.2 Escalation Patterns

**Immediate:** customer says "get me a manager" → call `escalate_to_human` immediately.

**After an attempt:**
```
Customer: "Refrigerator broke 2 days after purchase"
Agent: check order → offer warranty replacement
If unsatisfied → escalate
```

**Nuanced (acknowledge → resolve → escalate on reiteration):**
```
Customer: "This is outrageous!"
Agent: [acknowledge] "I understand your frustration."
       [offer] "I can offer a replacement or refund."
Customer: "No, I want to talk to someone!"
Agent: [customer reiterates] → escalate immediately
```

> Do not escalate on the first expression of dissatisfaction — only when the customer explicitly requests a human.

**Policy gap:**
```
Customer: "Competitor X has this 30% cheaper — give me a discount"
Policy: covers price adjustments on your own site only
Agent: escalate — policy is silent on competitor matching
```

### 9.3 Structured Handoff Protocol

The human operator sees only this summary — it must be complete and self-contained:

```json
{
  "customer_id": "CUST-12345",
  "customer_name": "Ivan Petrov",
  "issue_summary": "Refund request for damaged item",
  "order_id": "ORD-67890",
  "root_cause": "Item arrived damaged",
  "actions_taken": [
    "Verified customer via get_customer",
    "Confirmed order via lookup_order",
    "Offered standard replacement — customer insists on refund"
  ],
  "refund_amount": "$89.99",
  "recommended_action": "Approve full refund",
  "escalation_reason": "Customer requested to speak with a manager"
}
```

### 9.4 Confidence Calibration and Human Oversight

1. Output field-level confidence scores per extracted field
2. Calibrate thresholds using labeled validation sets
3. Route: high confidence + stable accuracy → automated; low confidence or ambiguous → human review

**Stratified random sampling:** aggregate 97% accuracy can hide 40% errors for a specific document type. Analyze by document type and by field, not only overall.

---

## Chapter 10: Error Handling in Multi-agent Systems

### 10.1 Error Categories

| Category | Examples | Retryable | Action |
|---|---|---|---|
| **Transient** | Timeout, 503, network | Yes | Retry with exponential backoff |
| **Validation** | Invalid input, missing field | No (fix input) | Modify and retry |
| **Business** | Policy violation, threshold exceeded | No | Explain; propose alternative |
| **Permission** | Access denied | No | Escalate |

### 10.2 Anti-patterns

| Anti-pattern | Problem | Correct approach |
|---|---|---|
| Generic status "search unavailable" | Coordinator can't decide how to recover | Return error type, query, partial results, alternatives |
| Silent suppression (empty = success) | Coordinator thinks no matches; actually a failure | Distinguish "no results" from "search failure" |
| Abort whole workflow on one failure | Lose all partial results | Continue with partial results; annotate gaps |
| Infinite retries inside subagent | Wasted resources, high latency | 1–2 local retries then propagate to coordinator |

### 10.3 Structured Subagent Error

```json
{
  "status": "partial_failure",
  "failure_type": "timeout",
  "attempted_query": "AI impact on music industry 2024",
  "partial_results": [
    {"title": "AI Music Generation Report", "url": "...", "relevance": 0.8}
  ],
  "alternative_approaches": [
    "Try narrower query: 'AI music composition tools'",
    "Use alternative data source"
  ],
  "coverage_impact": "Not covered: AI impact on music production"
}
```

The coordinator can then decide: retry with modified query / use partial results / delegate elsewhere / annotate gap.

### 10.4 Coverage Annotations in Final Synthesis

```markdown
### Visual Art (FULL COVERAGE)
[research results]

### Music (PARTIAL COVERAGE — search agent timeout)
[partial results]
⚠️ Coverage limited due to search agent timeout.

### Literature (FULL COVERAGE)
[research results]
```

---

## Chapter 11: Context Management in Production Systems

### 11.1 Extract Facts into a Separate Block

Instead of relying on conversation history (which degrades during summarization):

```
=== CASE FACTS (updated whenever a new fact appears) ===
Customer ID: CUST-12345
Order ID: ORD-67890
Order Date: 2025-01-15
Order Amount: $89.99
Issue: Damaged item on delivery
Customer Request: Full refund
Status: Pending manager approval
===
```

Include this block in every prompt, regardless of how history is summarized.

### 11.2 Trimming Tool Results

```python
@hook("PostToolUse", tool="lookup_order")
def trim_order_fields(result):
    return {
        "order_id": result["order_id"],
        "status": result["status"],
        "total": result["total"],
        "items": result["items"],
        "return_eligible": result["return_eligible"]
    }
```

Keep only the 5 relevant fields from a 40+ field response.

### 11.3 Position-aware Input

```
[KEY FINDINGS — top]
Found 3 critical vulnerabilities...

[DETAILED RESULTS — middle]
=== auth.ts === ...
=== database.ts === ...

[ACTION ITEMS — end]
Priority: fix auth.ts vulnerabilities before merge.
```

### 11.4 Scratchpad Files

In long investigations, write key findings to a file:

```markdown
# investigation-scratchpad.md
- PaymentProcessor in src/payments/processor.ts inherits from BaseProcessor
- refund() called from 3 places: OrderController, AdminPanel, CronJob
- External API rate limit: 100 req/min
```

When context degrades, consult the scratchpad instead of re-running discovery.

### 11.5 Delegating to Subagents to Protect Context

```
Main agent: "Investigate dependencies of the payments module"
  → Subagent (Explore): reads 15 files, traces imports
  → Returns: "Payments depends on AuthService, OrderModel, PaymentGateway API"
Main agent: keeps one line, not 15 files
```

Each subagent receives only the information required for its task — prevents "context leakage."

### 11.6 Structured State Persistence (for crash recovery)

```json
// agent-state/web-search-agent.json
{
  "status": "completed",
  "queries_executed": ["AI music 2024", "AI music composition"],
  "results_count": 12,
  "key_findings": [...],
  "gaps": ["music distribution", "music licensing"]
}

// agent-state/manifest.json
{
  "web-search": "completed",
  "doc-analysis": "in_progress",
  "synthesis": "not_started"
}
```

Coordinator loads manifest on resume — enables crash recovery without re-running completed work.

---

## Chapter 12: Preserving Provenance

### 12.1 The Attribution Loss Problem

```
Bad: "The AI music market is estimated at $3.2B." (no source, no year)

Good:
{
  "claim": "The AI music market is estimated at $3.2B.",
  "source_url": "https://example.com/report",
  "source_name": "Global AI Music Report 2024",
  "publication_date": "2024-06-15",
  "confidence": 0.9
}
```

### 12.2 Handling Conflicting Data

```json
{
  "claim": "Share of AI-generated music on streaming platforms",
  "values": [
    {"value": "12%", "source": "Spotify Annual Report 2024", "date": "2024-03"},
    {"value": "8%", "source": "Music Industry Association Survey", "date": "2024-07"}
  ],
  "conflict_detected": true,
  "possible_explanation": "Different methodology and time period"
}
```

Do not arbitrarily choose one value. Preserve both with attribution and let the coordinator decide.

### 12.3 Include Dates for Correct Interpretation

```
Bad: "Source A says 10%, source B says 15%. Contradiction."
Good: "Source A (2023) says 10%, source B (2024) says 15%. Likely +5% growth over a year."
```

### 12.4 Render by Content Type

| Content type | Format |
|---|---|
| Financial data | Tables |
| News and analysis | Prose |
| Technical findings | Structured lists |
| Time series | Chronological ordering |

---

## Chapter 13: Claude Code Built-in Tools

### 13.1 Tool Selection Reference

| Task | Tool |
|---|---|
| Find files by name/pattern | **Glob** — `**/*.test.tsx`, `src/components/**/*.ts` |
| Search within files | **Grep** — function name, error message, import |
| Read a file in full | **Read** |
| Write a new file | **Write** |
| Edit an existing file precisely | **Edit** — replace via unique text match |
| Run a shell command | **Bash** — git, npm, tests, build |

### 13.2 Incremental Investigation Strategy

```
1. Grep: find entry points (function definition, export)
2. Read: load the found files
3. Grep: find usages (import, calls)
4. Read: load consumer files
5. Repeat until picture is complete
```

Do not read all files at once.

### 13.3 Fallback: Read + Write Instead of Edit

When Edit fails due to a non-unique text match:
1. **Read** — load the full file
2. Modify content programmatically
3. **Write** — write the updated version

---

# PART II: EXAM DOMAIN NOTES

---

## Domain 1: Agent Architecture and Orchestration (27%)

### 1.1 Designing Agentic Loops for Autonomous Task Execution

**Know:**
- Agent loop: send request → check `stop_reason` (`"tool_use"` vs `"end_turn"`) → execute tools → return results → repeat
- Tool results are appended to conversation history so the model decides the next action
- Model-driven (Claude chooses the next tool) vs hard-coded decision trees

**Do:**
- Continue loop when `stop_reason = "tool_use"`; stop on `"end_turn"`
- Append tool results to context between iterations
- Avoid: parsing assistant text for completion; using arbitrary iteration limits as primary stop

### 1.2 Orchestrating Multi-agent Systems (Coordinator–Subagent)

**Know:**
- Hub-and-spoke: coordinator owns all inter-agent communication, error handling, routing
- Subagents operate with isolated context — they do not inherit the coordinator's history
- Coordinator: task decomposition, delegation, result aggregation, dynamic subagent selection
- Risk of overly narrow decomposition by coordinator

**Do:**
- Split research coverage among subagents to minimize duplication
- Implement iterative refinement loops (coordinator evaluates synthesis and re-routes)
- Route all communication through coordinator for observability

### 1.3 Configuring Subagent Calls, Context Passing, and Spawning

**Know:**
- `Task` tool spawns subagents; coordinator's `allowedTools` must include `"Task"`
- Subagent context must be explicitly included in the prompt; no parent context inheritance
- `AgentDefinition` configuration: descriptions, system prompts, tool constraints
- Session management via `fork_session` for exploring alternatives

**Do:**
- Include full outputs from prior agents in the subagent prompt
- Use structured formats to separate data from metadata when passing context
- Spawn parallel subagents via multiple `Task` calls in one coordinator turn
- Write coordinator prompts in terms of goals and quality criteria, not step-by-step instructions

### 1.4 Implementing Multi-step Workflows with Enforcement and Handoff Patterns

**Know:**
- **Programmatic enforcement** (hooks, preconditions) vs **prompt guidance** for ordering workflows
- For deterministic guarantees (identity verification before financial operations), prompts alone are insufficient
- Structured handoff protocols on escalation: customer ID, reason, recommended action

**Do:**
- Programmatic preconditions that block downstream calls until prior steps complete (block `process_refund` until `get_customer` returns verified ID)
- Decompose multi-aspect customer requests into separate items
- Produce structured summaries when escalating to a human

### 1.5 Agent SDK Hooks for Intercepting Tool Calls and Normalizing Data

**Know:**
- `PostToolUse` hooks intercept tool results before the model consumes them
- Hooks can block outgoing calls to enforce compliance (block refunds above threshold)
- Hooks = **deterministic guarantees**; prompt instructions = **probabilistic compliance**

**Do:**
- Use `PostToolUse` to normalize data formats (Unix timestamps → ISO 8601, numeric status codes)
- Use interception hooks to block policy-violating actions and redirect to escalation
- Choose hooks over prompts when business rules require guaranteed compliance

### 1.6 Task Decomposition Strategies for Complex Workflows

**Know:**
- **Fixed pipelines** (prompt chaining) vs **dynamic adaptive decomposition** based on intermediate results
- Prompt chaining: sequential steps (analyze files separately, then integration pass)
- Adaptive investigation: generate subtasks based on what was discovered

**Do:**
- Use prompt chaining for predictable, repeatable tasks; use dynamic for open-ended investigations
- Split large code reviews into per-file analysis + separate cross-file integration pass
- Decompose open-ended tasks: map structure first, then build prioritized plan

### 1.7 Session State, Resuming, and Forking

**Know:**
- `--resume <session-name>` to continue named sessions
- `fork_session` to create independent investigation branches from shared context
- Importance of informing the agent about file changes when resuming
- A new session with a structured summary can be more reliable than resuming with stale results

**Do:**
- Use `--resume` to continue named investigation sessions
- Use `fork_session` to compare approaches in parallel
- Choose between resuming (context still current) vs starting fresh (results stale)

---

## Domain 2: Tool Design and MCP Integration (18%)

### 2.1 Designing Tool Interfaces with Clear Descriptions

**Know:**
- Tool descriptions are the **primary mechanism** an LLM uses to select tools — minimal descriptions lead to unreliable selection
- Include input formats, example queries, edge cases, and applicability boundaries
- Ambiguous or overlapping descriptions cause misrouting
- System prompt wording can create unintended tool associations

**Do:**
- Write descriptions that clearly distinguish each tool from similar alternatives
- Rename tools to eliminate functional overlap (e.g., `analyze_content` → `extract_web_results`)
- Split general-purpose tools into specialized ones with clear input/output contracts

### 2.2 Implementing Structured Error Responses for MCP Tools

**Know:**
- The `isError` flag in MCP tool responses
- Error categories: **transient** (timeouts), **validation** (bad input), **business** (policy violations), **permission** (access denied)
- Generic errors ("Operation failed") prevent correct recovery decisions
- Distinguish retryable from non-retryable errors

**Do:**
- Return structured metadata: `errorCategory`, `isRetryable`, human-readable message
- Use `retryable: false` for business-rule violations with clear user-facing explanation
- Do local recovery inside subagents for transient failures; propagate only unresolvable errors
- Distinguish access failures (retry decision) from valid empty results (no matches)

### 2.3 Allocating Tools Across Agents and Configuring `tool_choice`

**Know:**
- Too many tools per agent (e.g., 18 instead of 4–5) **reduces** tool selection reliability
- Agents with tools outside their specialization tend to misuse them
- Scoped tool access: only role-relevant tools + limited cross-role utilities
- `tool_choice`: `"auto"`, `"any"`, or forced selection `{"type": "tool", "name": "..."}`

**Do:**
- Restrict each subagent's toolset to what is relevant for its role
- Replace general tools with constrained alternatives (`fetch_url` → `load_document`)
- Use `tool_choice: "any"` to guarantee a tool call instead of a text answer
- Force a specific tool to ensure execution order

### 2.4 Integrating MCP Servers into Claude Code and Agent Workflows

**Know:**
- MCP server scope: project (`.mcp.json`) for teams vs user (`~/.claude.json`) for experiments
- Environment variable substitution in `.mcp.json` (`${GITHUB_TOKEN}`) for secret management
- Tools from all connected servers are discovered on connection and available simultaneously
- MCP resources as "content catalogs" to reduce exploratory tool calls

**Do:**
- Configure shared MCP servers in project `.mcp.json` with env-var-based tokens
- Keep personal/experimental servers in `~/.claude.json`
- Prefer community MCP servers over custom servers for standard integrations

### 2.5 Selecting and Applying Built-in Tools (Read, Write, Edit, Bash, Grep, Glob)

**Know:**
- **Grep**: search within file contents (function names, error messages, imports)
- **Glob**: find files by name/extension patterns
- **Read/Write**: full-file operations; **Edit**: precise changes via unique text matches
- If Edit fails due to non-unique matches, fall back to Read + Write

**Do:**
- Use Grep for content search; Glob for file discovery by pattern
- Build understanding incrementally: Grep entry points → Read files → Grep usages
- Trace function usage through wrapper modules

---

## Domain 3: Claude Code Configuration and Workflows (20%)

### 3.1 Configuring CLAUDE.md with Hierarchy, Scope, and Modular Organization

**Know:**
- CLAUDE.md hierarchy: user (`~/.claude/CLAUDE.md`), project (`.claude/CLAUDE.md`), directory-level
- User-level settings apply only to one user — not shared via VCS
- `@path` syntax for referencing external files (modularize CLAUDE.md)
- `.claude/rules/` directory for topic-focused rule files instead of a monolithic CLAUDE.md

**Do:**
- Diagnose hierarchy issues (new team member missing instructions → check if they are user-level)
- Use `@path` to selectively include standards in each package's CLAUDE.md
- Split large CLAUDE.md into `.claude/rules/` files (testing.md, api-conventions.md, deployment.md)

### 3.2 Creating and Configuring Custom Slash Commands and Skills

**Know:**
- **Project commands** in `.claude/commands/` (shared via VCS) vs **user commands** in `~/.claude/commands/`
- Skills in `.claude/skills/` with `SKILL.md` frontmatter: `context: fork`, `allowed-tools`, `argument-hint`
- `context: fork` runs the skill in an isolated subagent context — doesn't pollute the main session
- Personal skill variants can live in `~/.claude/skills/` under different names

**Do:**
- Store project slash commands in `.claude/commands/` so the whole team gets them
- Use `context: fork` to isolate skills with verbose output
- Use `allowed-tools` to restrict what tools a skill can use
- Use `argument-hint` to prompt developers for required parameters

### 3.3 Using Path-specific Rules for Conditional Convention Loading

**Know:**
- `.claude/rules/` files can include YAML frontmatter `paths` to activate rules based on glob patterns
- Path-scoped rules load **only** when editing matching files — saves context and tokens
- Glob-based rules preferable when conventions apply across many directories (e.g., all tests)

**Do:**
- Create `.claude/rules/` files with `paths: ["terraform/**/*"]` to load only for matching files
- Use glob patterns (`**/*.test.tsx`) to apply conventions by file type regardless of location
- Prefer path-specific rules over directory-level CLAUDE.md when conventions span the codebase

### 3.4 Deciding When to Use Planning Mode vs Direct Execution

**Know:**
- **Planning mode**: complex tasks, large changes, multiple viable approaches, architectural decisions
- **Direct execution**: simple, well-understood changes (single file, clear stack trace)
- Planning mode enables safe codebase exploration before making changes

**Do:**
- Use planning mode for tasks with architectural consequences (microservices, migrations touching 45+ files)
- Use direct execution for fixes with a clear stack trace and single file
- Use Explore subagent to prevent context-window exhaustion in multi-phase tasks
- Combine: plan for discovery, then execute for implementation

### 3.5 Iterative Refinement for Progressive Improvement

**Know:**
- Concrete input/output examples are the most effective way to communicate expectations
- **Test-driven iteration**: write tests first, then iterate based on failures
- The "interview" pattern: Claude asks questions to surface non-obvious design considerations

**Do:**
- Provide 2–3 concrete input/output examples to clarify transformation requirements
- Build test sets with expected behavior, edge cases, and performance requirements before implementation
- Use the interview pattern to surface design aspects (cache invalidation, failure modes)

### 3.6 Integrating Claude Code into CI/CD Pipelines

**Know:**
- The `-p` (`--print`) flag for non-interactive mode in automated pipelines
- `--output-format json` and `--json-schema` for structured CI output
- CLAUDE.md provides project context for CI-triggered Claude Code
- **Session context isolation**: the session that generated code is less effective at reviewing it

**Do:**
- Run Claude Code in CI with `-p` to avoid hanging on interactive input
- Use `--output-format json` + `--json-schema` for structured results (e.g., inline PR comments)
- Include prior review results when re-running after new commits (report only new/unfixed issues)
- Document testing standards and available fixtures in CLAUDE.md to improve test generation

---

## Domain 4: Prompt Engineering and Structured Output (20%)

### 4.1 Designing Prompts with Explicit Criteria to Improve Accuracy

**Know:**
- Explicit criteria outperform vague instructions ("flag comments only when they contradict code" vs "check comment accuracy")
- Generic guidance like "be more conservative" is worse than concrete categorical criteria
- High false-positive rates in some categories undermine trust in accurate categories

**Do:**
- Define review criteria: what to report (bugs, security) vs what to ignore (minor style)
- Temporarily disable categories with high false-positive rates
- Define explicit severity criteria with code examples for each level

### 4.2 Using Few-shot Prompting to Improve Output Consistency

**Know:**
- Few-shot examples are the most effective method for consistently formatted, actionable output
- Few-shot demonstrates handling of ambiguous cases (tool selection, gaps in test coverage)
- Few-shot helps the model generalize to new patterns rather than repeating defaults
- Few-shot can reduce hallucinations in extraction tasks

**Do:**
- Provide 2–4 targeted examples for ambiguous scenarios with rationale
- Include examples demonstrating output format (location, issue, severity, suggested fix)
- Provide examples distinguishing acceptable patterns from real issues
- Provide examples of correct extraction from documents with different structures

### 4.3 Enforcing Structured Output with `tool_use` and JSON Schemas

**Know:**
- `tool_use` with JSON schemas is the most reliable way to guarantee schema-conformant output
- `tool_choice: "auto"` → model may return text; `"any"` → must call a tool; forced → calls specific tool
- Strict JSON schemas eliminate syntax errors but not semantic errors
- Schema design: required vs optional fields; enums with `"other"` plus a detail string for extensibility

**Do:**
- Define extraction tools with JSON schemas; parse data from `tool_use` results
- Use `tool_choice: "any"` to guarantee structured output when multiple schemas exist
- Force a specific tool: `tool_choice: {"type": "tool", "name": "extract_metadata"}`
- Make fields optional/nullable when the source may not contain the information (avoid fabrication)
- Use enums like `"unclear"` and `"other"` plus detail fields for extensible categorization

### 4.4 Implementing Validation, Retries, and Feedback Loops for Extraction Quality

**Know:**
- Retry-with-error-feedback: include concrete validation errors in the retry prompt
- Retries are ineffective when information is simply absent from the source
- Track the pattern that triggered a finding (`detected_pattern` field)
- Semantic errors (totals don't reconcile) vs syntax errors (addressed by `tool_use`)

**Do:**
- Follow-up prompts with: original document + incorrect extraction + specific validation errors
- Identify when retry will be ineffective (required info only in an external document)
- Include `detected_pattern` fields in findings to analyze false positives
- Design self-correction by extracting both `calculated_total` and `stated_total` to detect discrepancies

### 4.5 Designing Efficient Batch Processing Strategies

**Know:**
- Message Batches API: 50% savings, up to 24-hour processing window, no latency SLA guarantees
- Suitable for non-blocking tasks (overnight reports, audits); unsuitable for blocking tasks (pre-merge checks)
- Batch API does not support multi-turn tool calling within a single request
- `custom_id` fields correlate request/response within batches

**Do:**
- Use synchronous API for blocking checks; use Batch API for overnight/weekly workloads
- Plan batch submission cadence based on SLA needs (4-hour windows for 30-hour guarantee with 24-hour processing)
- Handle failures by re-submitting only failed documents (identified by `custom_id`)
- Iterate on prompts using a sample before running large-scale processing

### 4.6 Designing Multi-instance and Multi-pass Review Architectures

**Know:**
- Self-review limitation: the model retains its reasoning context and is less likely to challenge its own decisions
- Independent review instances (without generation context) are better at finding subtle issues
- Multi-pass: per-file local analysis + a cross-file integration pass avoids attention dilution

**Do:**
- Use a second independent Claude instance to review changes without generation context
- Split multi-file reviews into per-file passes + integration passes for cross-file dataflow analysis
- Use verification passes with self-rated confidence to route reviews in a calibrated way

---

## Domain 5: Context Management and Reliability (15%)

### 5.1 Managing Conversation Context to Preserve Critical Information

**Know:**
- Progressive summarization risk: numeric values, percentages, and dates get condensed into vague summaries
- Lost-in-the-middle effect: models reliably process start and end, but may miss findings in the middle
- Tool outputs can accumulate disproportionately (40+ fields when 5 are needed)
- The full conversation history must be sent in subsequent API requests

**Do:**
- Extract transactional facts into a persistent "case facts" block outside summarized history
- Trim verbose tool outputs down to relevant fields
- Place key findings at the beginning of aggregated data with explicit section headings
- Require subagents to include metadata (dates, sources) in structured outputs

### 5.2 Designing Effective Escalation Patterns and Resolving Ambiguity

**Know:**
- Suitable escalation triggers: explicit request for a human, policy gaps/exceptions, inability to make progress
- Immediate escalation (explicit request) vs attempt-to-resolve (within agent scope)
- Sentiment analysis and model confidence self-ratings are unreliable proxies for case complexity
- Multiple customer matches require asking for additional identifiers — not heuristic guessing

**Do:**
- Define explicit escalation criteria with few-shot examples in the system prompt
- Execute explicit requests for a human immediately without additional investigation
- Escalate when policy is ambiguous or silent for a specific request
- Ask for additional identifiers when tool results contain multiple matches

### 5.3 Implementing Error Propagation Strategies in Multi-agent Systems

**Know:**
- Structured error context (failure type, query, partial results, alternatives) enables smarter coordinator recovery
- Distinguish access failures (timeouts → retry decision) from valid empty results (no matches)
- Generic error statuses hide valuable context from the coordinator
- Silent suppression or aborting the whole workflow on a single failure are both anti-patterns

**Do:**
- Return structured error context: failure type, what was attempted, partial results, possible alternatives
- Distinguish access failures from valid empty results
- Perform local recovery in subagents for transient failures; propagate only non-recoverable errors with partial results
- Annotate coverage in synthesis: what is well-supported vs where gaps remain

### 5.4 Managing Context Efficiently When Investigating Large Codebases

**Know:**
- Context degradation in long sessions: model starts producing unstable answers and referring to "typical patterns"
- Scratchpad files preserve key findings across context boundaries
- Delegating to subagents isolates verbose discovery output
- Structured state persistence enables crash recovery

**Do:**
- Spawn subagents for specific questions; keep high-level coordination in the main agent
- Use scratchpad files to store key findings and reference them later
- Summarize key findings before spawning next-phase subagents
- Use `/compact` to reduce context usage during long investigations

### 5.5 Designing Workflows with Human Oversight and Confidence Calibration

**Know:**
- Aggregate metrics (e.g., 97% overall accuracy) can mask poor performance on specific document types
- Stratified random sampling measures error rates in high-confidence extractions
- Field-level confidence calibration using labeled validation sets

**Do:**
- Implement stratified random sampling to detect new error patterns
- Analyze accuracy by document type and field to validate stable performance
- Output field-level confidence scores and calibrate review thresholds using labeled data
- Route low-confidence or ambiguous-source extractions to human review

### 5.6 Preserving Provenance and Handling Uncertainty in Multi-source Synthesis

**Know:**
- Attribution is lost during summarization without preserving "claim → source" mappings
- Structured mappings must be preserved during aggregation
- Handle conflicting statistics by annotating conflicts with attribution — not arbitrarily choosing one value
- Include publication/collection dates to avoid misreading temporal differences as contradictions

**Do:**
- Require subagents to output "claim → source" mappings (URL, document name, quotes)
- Structure reports to separate stable findings from disputed ones
- Preserve conflicting values with annotations and pass them to the coordinator for reconciliation
- Include publication dates for correct temporal interpretation
- Render content by type: financial data as tables, news as prose, technical findings as structured lists

---

# Quick Reference: Anti-patterns to Avoid

| Anti-pattern | Problem | Correct approach |
|---|---|---|
| Parsing assistant text for completion | Fragile and unreliable | Check `stop_reason == "end_turn"` |
| Using iteration limits as primary stop | Stops valid tasks prematurely | Use `stop_reason` as the only stop signal |
| Generic error responses ("Operation failed") | Coordinator can't make recovery decisions | Return `errorCategory`, `isRetryable`, `attempted_query`, `partial_results` |
| Overlapping tool descriptions | Model misroutes between similar tools | Write descriptions that clearly distinguish each tool |
| Relying on sentiment for escalation | Mood ≠ case complexity | Use explicit triggers: policy gap, explicit request, no progress |
| Resuming sessions when files changed | Stale tool results produce wrong answers | Start fresh with a structured summary |
| Single-pass review of many files | Attention dilution, inconsistent analysis | Per-file passes + separate integration pass |
| Prompt-based ordering for critical logic | Only probabilistic compliance | Use hooks (PreToolUse/PostToolUse) for guaranteed enforcement |
| Silent error suppression | Coordinator sees success when it's a failure | Always distinguish "no results" from "search failure" |
| Too many tools per agent (18+) | Tool selection reliability decreases | Restrict to 4–5 role-relevant tools per agent |
| User-level CLAUDE.md for team standards | New team members miss instructions | Use project-level `.claude/CLAUDE.md` for shared standards |
| Fabricating values in required schema fields | Hallucinations | Mark fields as optional/nullable when data may be absent |

---

# Practice Questions

## Q1 — Customer Support Agent

A customer support agent is observed calling `lookup_order` before `get_customer` in 12% of cases, causing identity verification failures. What is the best fix?

- A) Add a programmatic precondition that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer ID
- B) Add a prompt instruction: "Always call get_customer first"
- C) Add an iteration limit to restart the loop if the wrong order is detected
- D) Increase `max_tokens` to allow the model to re-read its instructions

**Answer: A**
When a business rule requires a specific tool sequence with guaranteed compliance, use programmatic enforcement (hooks or preconditions). Prompt instructions only provide probabilistic compliance.

---

## Q2 — Customer Support Agent

An agent has three tools — `get_customer`, `lookup_order`, `search_kb` — but all have one-line descriptions. Tool misrouting errors are occurring. What is the best fix?

- A) Add `tool_choice: "any"` to force a tool call
- B) Expand each tool's description with input formats, examples, edge cases, and boundaries
- C) Reduce the number of tools to one
- D) Add a system prompt instruction listing tool names and their use cases

**Answer: B**
Tool descriptions are the model's primary selection mechanism. Minimal or overlapping descriptions cause misrouting. Expanding descriptions with concrete distinctions, examples, and input formats is the correct solution.

---

## Q3 — Customer Support Agent

An agent achieves 55% resolution vs. an 80% target. Analysis shows it escalates based on customer sentiment rather than specific policy gaps. What is the best improvement?

- A) Add explicit escalation criteria with few-shot examples (explicit request for human, policy gap, inability to make progress)
- B) Add a sentiment analysis model to better classify customer mood
- C) Lower the escalation threshold score from 7 to 5
- D) Add more tools to handle a broader range of requests

**Answer: A**
Sentiment analysis is an unreliable escalation trigger. Explicit criteria with few-shot examples give the model concrete decision rules, improving consistency.

---

## Q4 — Code Generation Workflow

A team wants all members to share a `/review` slash command for PR reviews. Where should it be created?

- A) `.claude/commands/review.md` in the project repository
- B) `~/.claude/commands/review.md` on each developer's machine
- C) `~/.claude/CLAUDE.md` with a section defining the review workflow
- D) `.claude/CLAUDE.md` as an always-loaded instruction block

**Answer: A**
Project-level `.claude/commands/` is managed in VCS and available to all project contributors when they clone the repo. User-level `~/.claude/commands/` is personal and not shared.

---

## Q5 — Code Generation Workflow

Before restructuring a monolith into microservices (touching 45+ files), what is the recommended approach?

- A) Use planning mode to explore the codebase, understand dependencies, and design an approach before making changes
- B) Use direct execution to make incremental changes file by file
- C) Use `fork_session` to test multiple microservice boundary approaches simultaneously
- D) Use a batch API call to analyze all 45 files at once

**Answer: A**
Planning mode is recommended for complex architectural changes with many files and multiple viable approaches. It provides safe exploration without side effects before any changes are made.

---

## Q6 — Code Generation Workflow

A monorepo has 15 packages, each with different testing conventions. How should conventions be managed?

- A) Create `.claude/rules/` files with YAML frontmatter glob patterns (`paths: ["packages/auth/**/*"]`) to load conventions only for the relevant package
- B) Create a single monolithic CLAUDE.md at the root with all conventions for all packages
- C) Create `CLAUDE.md` files in each package directory
- D) Store all conventions in the system prompt

**Answer: A**
Path-specific rules in `.claude/rules/` with glob patterns load only when editing matching files, saving context. This is more efficient than directory-level CLAUDE.md when conventions are package-specific.

---

## Q7 — Multi-agent Research Pipeline

A coordinator spawns 3 search subagents. One times out and returns a generic error. What should the subagent return instead?

- A) Structured error: `{failure_type: "timeout", attempted_query: "...", partial_results: [...], alternative_approaches: [...], coverage_impact: "..."}`
- B) An empty array `[]` to indicate no results were found
- C) A retry flag asking the coordinator to re-spawn the subagent
- D) The generic error "Search unavailable" with an HTTP status code

**Answer: A**
Structured errors give the coordinator the information needed to make intelligent recovery decisions — retry with a modified query, use partial results, delegate to another subagent, or annotate a gap. Generic errors or empty arrays hide critical information.

---

## Q8 — Multi-agent Research Pipeline

After aggregating research from multiple subagents, two sources report different values (12% vs 8%) for the same metric. What is the correct synthesis approach?

- A) Preserve both values with source attribution and dates; annotate the conflict and pass to coordinator for reconciliation
- B) Take the average of the two values
- C) Use the more recent source and discard the older one
- D) Flag the entire section as unreliable and exclude it from the report

**Answer: A**
Conflicting data should never be arbitrarily resolved. Both values must be preserved with full attribution (source name, date, methodology) and the conflict annotated. Including dates often reveals a temporal explanation (growth over time) rather than a true contradiction.
