import type { CodeExample } from '../types';

export const codeExamples: CodeExample[] = [
  // ── API Fundamentals ──────────────────────────────────────────────────────
  {
    id: 'api-basic-call',
    topic: 'API Fundamentals',
    title: 'Basic API call',
    description:
      'The minimal structure of a Claude API request: model, max_tokens, and a messages array. Every subsequent API call in a session must include the full conversation history — the API is stateless.',
    language: 'python',
    code: `import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a helpful assistant.",  # defines role and constraints
    messages=[
        {"role": "user", "content": "What is the capital of France?"}
    ],
)

# stop_reason tells you why generation stopped:
#   "end_turn"  → model finished
#   "tool_use"  → model wants to call a tool
#   "max_tokens" → token limit reached
print(message.stop_reason)       # "end_turn"
print(message.content[0].text)   # "The capital of France is Paris."`,
    keyPoints: [
      'The API is stateless — you must send the full conversation history on every call.',
      'system is passed separately, not as a messages entry.',
      'Always check stop_reason before reading content — "tool_use" requires a different code path.',
      'max_tokens is required; there is no default. Set it high enough for your use case.',
    ],
  },
  {
    id: 'api-multi-turn',
    topic: 'API Fundamentals',
    title: 'Multi-turn conversation',
    description:
      'To maintain context across turns, append each assistant response and new user message to the history and send the full array. The model has no memory between calls — the messages array is the only state.',
    language: 'python',
    code: `from anthropic import Anthropic

client = Anthropic()

# Conversation history — you own and maintain this list
messages = []

def chat(user_input: str) -> str:
    messages.append({"role": "user", "content": user_input})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a concise assistant.",
        messages=messages,  # full history on every call
    )

    assistant_text = response.content[0].text
    # Append assistant turn so next call has full context
    messages.append({"role": "assistant", "content": assistant_text})

    return assistant_text

print(chat("My name is Alice."))         # "Nice to meet you, Alice!"
print(chat("What is my name?"))          # "Your name is Alice."
print(chat("Translate my name to French."))  # "Alice is the same in French."`,
    keyPoints: [
      'Append both the user turn and the assistant turn after each exchange.',
      'Sending partial history causes the model to lose earlier context silently — no error is raised.',
      'In long sessions, history accumulates tokens; trim tool results to relevant fields with a PostToolUse hook.',
      'Use a persistent "case facts" block outside the summarized history for critical values (IDs, amounts).',
    ],
  },
  {
    id: 'api-xml-prompt',
    topic: 'API Fundamentals',
    title: 'XML-structured system prompt',
    description:
      'Structuring the system prompt with XML tags (<role>, <capabilities>, <constraints>, <output_format>) prevents instruction bleed-over in complex prompts. Clear delimiters help the model distinguish what it can do from what it must not do, and enforce consistent output formats via sentinel values.',
    language: 'python',
    code: `import anthropic

client = anthropic.Anthropic()

# ✅ XML-structured system prompt — each concern has a clear boundary
SYSTEM_PROMPT = """
<role>
You are a senior customer support specialist for Acme SaaS.
You are empowered to issue refunds up to $500 without manager approval.
</role>

<capabilities>
- Access customer account details, order history, and billing records
- Process refunds up to $500
- Update account settings and preferences
- File bug reports for technical issues
</capabilities>

<constraints>
- Never disclose another customer's data
- Never promise features not on the public roadmap
- Escalate to human support if: customer is distressed, issue is termination, refund > $500
- Do not make exceptions to the 30-day return policy without manager approval
</constraints>

<output_format>
End every response with exactly one sentinel:
  [RESOLVED]                — issue fully addressed
  [ESCALATED: <team>]       — e.g., [ESCALATED: billing]
  [PENDING: <action>]       — e.g., [PENDING: carrier trace]
</output_format>

<examples>
User: "My order #A123 never arrived."
Response: "I've opened a carrier trace for order #A123 — I'll follow up within 24 hours."
[PENDING: carrier trace #A123]
</examples>
"""

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=SYSTEM_PROMPT,
    messages=[{"role": "user", "content": "I want a refund for order #B456."}],
)

# Downstream systems can parse the sentinel for routing
text = response.content[0].text
if "[ESCALATED:" in text:
    route_to_human(text)
elif "[PENDING:" in text:
    schedule_followup(text)`,
    keyPoints: [
      'XML tags prevent "instruction bleed" — without delimiters, capabilities and constraints can blur together.',
      'The <constraints> block is most critical: list prohibited actions explicitly so the model cannot reinterpret them.',
      'Sentinel values in <output_format> ([RESOLVED], [ESCALATED], [PENDING]) enable reliable downstream parsing and routing.',
      'At least one <examples> block dramatically improves adherence to complex output formats.',
    ],
  },

  // ── Tools & tool_use ──────────────────────────────────────────────────────
  {
    id: 'tool-definition',
    topic: 'Tools & tool_use',
    title: 'Tool definition (JSON schema)',
    description:
      'Tools are defined with a name, a description, and an input_schema (JSON Schema). The description is the primary selection mechanism — the model chooses tools based on it, so it must be precise and distinguish each tool from similar ones.',
    language: 'json',
    code: `{
  "name": "get_customer",
  "description": "Finds a customer by email or numeric ID. Returns the full customer profile including name, email, order history, and account status. Use this tool BEFORE lookup_order to verify the customer's identity. Accepts either an email (format: user@domain.com) or a numeric customer_id. Do NOT use this for order lookups — use lookup_order for that.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "description": "Customer email address (user@domain.com)"
      },
      "customer_id": {
        "type": "integer",
        "description": "Numeric customer ID from the CRM"
      }
    },
    "required": []
  }
}`,
    keyPoints: [
      'The description is the model\'s primary tool-selection mechanism — minimal descriptions cause misrouting.',
      'Include: what it returns, accepted input formats, edge cases, and when to use vs. similar tools.',
      'Mark fields "required" only when always available — required fields push the model to fabricate values.',
      'Avoid overlapping descriptions: if get_customer and lookup_customer have similar descriptions, the model will confuse them.',
    ],
  },
  {
    id: 'tool-agentic-loop',
    topic: 'Tools & tool_use',
    title: 'Agentic loop with tool_use handling',
    description:
      'The complete pattern for an agentic loop: send a request, check stop_reason, execute the tool if needed, append the result to history, and repeat. The only reliable completion signal is stop_reason == "end_turn".',
    language: 'python',
    code: `import anthropic

client = anthropic.Anthropic()

def calculate(expression: str) -> str:
    """Simple calculator — executes the tool the model requested."""
    try:
        return str(eval(expression))  # noqa: S307
    except Exception as e:
        return f"Error: {e}"

tools = [{
    "name": "calculator",
    "description": "Evaluates a mathematical expression and returns the result.",
    "input_schema": {
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "e.g. '(12 * 4) + 7'"}
        },
        "required": ["expression"],
    },
}]

messages = [{"role": "user", "content": "What is (144 / 12) * 3.5?"}]

# ── Agentic loop ──────────────────────────────────────────────────────────
while True:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages,
    )

    # Append assistant turn to history
    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "end_turn":
        # Task complete — extract text response
        final = next(b.text for b in response.content if hasattr(b, "text"))
        print(final)
        break

    if response.stop_reason == "tool_use":
        # Execute each tool the model requested
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = calculate(block.input["expression"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })

        # Append tool results and loop back
        messages.append({"role": "user", "content": tool_results})`,
    keyPoints: [
      'The only correct completion signal is stop_reason == "end_turn". Never use iteration limits as primary stop.',
      'Append the assistant turn BEFORE executing tools — the model\'s content block must be in history.',
      'Return tool results as a "user" role message with type "tool_result" and the matching tool_use_id.',
      'Anti-pattern: parsing assistant text for "Task completed" — this is fragile and wrong.',
    ],
  },
  {
    id: 'tool-structured-output',
    topic: 'Tools & tool_use',
    title: 'Structured output via tool_use + tool_choice',
    description:
      'Using tool_use with a JSON schema is the most reliable way to get structured output — it guarantees syntactically valid JSON. Use tool_choice: "any" to force a tool call, or force a specific tool by name. Note: this eliminates syntax errors but not semantic errors (wrong values, hallucinated fields).',
    language: 'python',
    code: `import anthropic
import json

client = anthropic.Anthropic()

# Define extraction schema as a tool
extract_tool = {
    "name": "extract_issue",
    "description": "Extract a structured bug report from the provided text.",
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "enum": ["bug", "feature", "docs", "unclear", "other"],
            },
            "category_detail": {
                "type": ["string", "null"],
                "description": "Required when category is 'other' or 'unclear'",
            },
            "severity": {
                "type": "string",
                "enum": ["critical", "high", "medium", "low"],
            },
            "confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Model confidence in this classification",
            },
            "summary": {"type": "string"},
        },
        "required": ["category", "severity", "confidence", "summary"],
    },
}

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=[extract_tool],
    # "any" → model MUST call a tool (guarantees structured output)
    # Use {"type": "tool", "name": "extract_issue"} to force a specific tool
    tool_choice={"type": "any"},
    messages=[{
        "role": "user",
        "content": "The payment button crashes on iOS 17 when the cart has 0 items.",
    }],
)

# Parse the structured result from the tool_use block
tool_block = next(b for b in response.content if b.type == "tool_use")
result = tool_block.input  # already a Python dict — no json.loads needed

print(json.dumps(result, indent=2))
# {
#   "category": "bug",
#   "category_detail": null,
#   "severity": "high",
#   "confidence": 0.95,
#   "summary": "Payment button crashes on iOS 17 with empty cart"
# }`,
    keyPoints: [
      'tool_choice: "any" guarantees the model calls a tool — preventing text-only responses.',
      'tool_block.input is already a Python dict — no JSON parsing needed.',
      'Nullable fields (type: ["string", "null"]) prevent hallucination when data is absent.',
      'JSON schema eliminates syntax errors but NOT semantic errors — validate calculated vs. stated values separately.',
    ],
  },
  {
    id: 'tool-composition',
    topic: 'Tools & tool_use',
    title: 'Tool composition: atomic vs monolithic',
    description:
      'Atomic tools do one thing, fail clearly, and compose cleanly. Monolithic tools hide failure modes and prevent intelligent retry. The lookup-then-act pattern separates expensive reads from writes, enabling user confirmation between steps and safe retries when writes fail.',
    language: 'python',
    code: `# ❌ Anti-pattern: monolithic tool — too many responsibilities per call
monolithic_tool = {
    "name": "book_and_confirm",
    "description": "Search flights, check availability, book seat, charge card, and send confirmation email.",
    "input_schema": {
        "type": "object",
        "properties": {
            "origin": {"type": "string"},
            "destination": {"type": "string"},
            "date": {"type": "string"},
            "seat_class": {"type": "string", "enum": ["economy", "business", "first"]},
            "payment_token": {"type": "string"},
            "passenger_email": {"type": "string"},
        },
        "required": ["origin", "destination", "date", "seat_class", "payment_token", "passenger_email"],
    },
}
# Problems:
#   - If seat is unavailable, card may already be charged before we find out
#   - Model cannot retry only the failed step — must restart the whole operation
#   - A single tool error gives no signal about WHICH step failed

# ✅ Atomic tools: lookup-then-act pattern separates reads from writes
atomic_tools = [
    {
        "name": "search_flights",
        "description": "Search available flights. Returns options with IDs. Read-only — no booking, no side effects.",
        "input_schema": {
            "type": "object",
            "properties": {
                "origin": {"type": "string"},
                "destination": {"type": "string"},
                "date": {"type": "string"},
            },
            "required": ["origin", "destination", "date"],
        },
    },
    {
        "name": "check_seat_availability",
        "description": "Check if a seat class is available on a specific flight. Read-only.",
        "input_schema": {
            "type": "object",
            "properties": {
                "flight_id": {"type": "string"},
                "seat_class": {"type": "string", "enum": ["economy", "business", "first"]},
            },
            "required": ["flight_id", "seat_class"],
        },
    },
    {
        "name": "book_seat",
        "description": "Book a seat and charge the stored payment method. WRITE operation. Call ONLY after confirming availability with check_seat_availability.",
        "input_schema": {
            "type": "object",
            "properties": {
                "flight_id": {"type": "string"},
                "seat_class": {"type": "string"},
                "passenger_id": {"type": "string"},
            },
            "required": ["flight_id", "seat_class", "passenger_id"],
        },
    },
]
# Model flow: search_flights → check_seat_availability → [confirm with user] → book_seat
# If check fails: model retries with a different seat class — no payment charged
# If book fails: model can show alternatives — no partial state to clean up`,
    keyPoints: [
      'Atomic tools fail atomically — each step can be retried independently without partial side effects.',
      'Monolithic tools cause double-failures: first the operation fails, then you must roll back a partial state.',
      'The lookup-then-act pattern separates reads (search, check) from writes (book) — enabling user confirmation and safe retries.',
      'State which operations have side effects in the description ("WRITE operation. Charges the stored payment method") so the model treats them accordingly.',
    ],
  },

  // ── Agent SDK ─────────────────────────────────────────────────────────────
  {
    id: 'sdk-agent-definition',
    topic: 'Agent SDK',
    title: 'AgentDefinition: coordinator + subagents',
    description:
      'The Agent SDK uses AgentDefinition to configure agents. A coordinator includes "Task" in its allowed_tools to spawn subagents. Subagents have isolated context — they do not inherit the coordinator\'s history; all required context must be explicitly passed in the Task prompt.',
    language: 'python',
    code: `from claude_agent_sdk import AgentDefinition, run_agent

# ── Subagent definitions ──────────────────────────────────────────────────
web_search_agent = AgentDefinition(
    name="web_search",
    description="Searches the web for information on a given topic.",
    system_prompt="You are a research assistant. Search the web and return structured findings.",
    allowed_tools=["web_search", "fetch_url"],  # only what this role needs
)

doc_analysis_agent = AgentDefinition(
    name="doc_analysis",
    description="Analyzes documents and extracts key facts with source attribution.",
    system_prompt="Extract claims with source URLs and publication dates.",
    allowed_tools=["read_file", "extract_text"],
)

# ── Coordinator definition ────────────────────────────────────────────────
coordinator = AgentDefinition(
    name="research_coordinator",
    description="Orchestrates a multi-source research pipeline.",
    system_prompt="""You coordinate research across web and document sources.
Decompose the user's query into subtasks, delegate to subagents via Task,
aggregate results, and produce a final synthesis with source attribution.
When a subagent fails, use its partial_results and continue.""",
    # "Task" is required to spawn subagents
    allowed_tools=["Task"],
)

# ── Running the coordinator ───────────────────────────────────────────────
result = run_agent(
    agent=coordinator,
    # Subagents receive ONLY what is in their Task prompt — no auto-inheritance
    user_message="Research the impact of AI on software engineering jobs in 2024–2025.",
    available_agents=[web_search_agent, doc_analysis_agent],
)`,
    keyPoints: [
      'The coordinator\'s allowed_tools must include "Task" to spawn subagents.',
      'Subagents have isolated context — include all required data explicitly in the Task prompt.',
      'Restrict each agent\'s allowed_tools to its role: too many tools reduces selection reliability.',
      'The coordinator owns error handling, result aggregation, and all communication with the user.',
    ],
  },
  {
    id: 'sdk-hooks',
    topic: 'Agent SDK',
    title: 'Hooks: PostToolUse (normalize) + PreToolUse (enforce)',
    description:
      'Hooks intercept tool calls at specific lifecycle points. PostToolUse transforms results before the model sees them. PreToolUse can block calls that violate business rules. Hooks provide deterministic guarantees — prompt instructions only provide probabilistic compliance.',
    language: 'python',
    code: `from claude_agent_sdk import hook, AgentDefinition
from datetime import datetime

# ── PostToolUse: normalize data before the model consumes it ──────────────
@hook("PostToolUse")
def normalize_dates(tool_name: str, tool_result: dict) -> dict:
    """Convert all date formats to ISO 8601 regardless of source system."""
    if "created_at" in tool_result:
        raw = tool_result["created_at"]

        # Unix timestamp → ISO 8601
        if isinstance(raw, int):
            tool_result["created_at"] = datetime.fromtimestamp(raw).isoformat()

        # "Mar 5, 2025" → "2025-03-05"
        elif isinstance(raw, str) and not raw[:4].isdigit():
            tool_result["created_at"] = datetime.strptime(raw, "%b %d, %Y").strftime("%Y-%m-%d")

    return tool_result


# ── PostToolUse: trim verbose responses to relevant fields ────────────────
@hook("PostToolUse", tool="lookup_order")
def trim_order_fields(tool_result: dict) -> dict:
    """Keep only 5 fields from a 40+ field order response."""
    return {
        "order_id":       tool_result["order_id"],
        "status":         tool_result["status"],
        "total":          tool_result["total"],
        "items":          tool_result["items"],
        "return_eligible": tool_result["return_eligible"],
    }


# ── PreToolUse: enforce business rules deterministically ─────────────────
@hook("PreToolUse", tool="process_refund")
def enforce_refund_limit(tool_name: str, tool_args: dict):
    """Block refunds above $500 — 100% compliance, not probabilistic."""
    if tool_args.get("amount", 0) > 500:
        # Redirect to escalation instead of executing the refund
        return {
            "action": "redirect",
            "tool": "escalate_to_human",
            "reason": f"Refund of {tool_args['amount']:.2f} exceeds $500 limit — requires human approval.",
        }
    # Return None to allow the tool call to proceed normally
    return None`,
    keyPoints: [
      'PostToolUse fires after tool execution, before the model sees the result — ideal for normalization.',
      'PreToolUse fires before execution — use it to block policy-violating calls entirely.',
      'Hooks give 100% deterministic enforcement; a prompt instruction like "don\'t process refunds over $500" is only ~90% reliable.',
      'Use hooks for: financial thresholds, identity verification ordering, compliance rules, data normalization.',
    ],
  },
  {
    id: 'sdk-context-management',
    topic: 'Agent SDK',
    title: 'Context management: progressive summarization',
    description:
      'Long sessions exhaust context windows and degrade attention quality — the model de-prioritizes content far from the current position. Progressive summarization compresses old turns into a structured summary while keeping the last N turns verbatim. Critical facts (IDs, amounts, commitments) live in a separate case_facts block outside the summary.',
    language: 'python',
    code: `import anthropic
import json

client = anthropic.Anthropic()

def compress_history(messages: list, case_facts: dict) -> list:
    """Compress old turns into a structured summary; keep the last 4 verbatim."""
    if len(messages) < 8:
        return messages  # too short to be worth compressing

    old_turns = messages[:-4]    # everything to summarize
    recent_turns = messages[-4:] # keep verbatim for recency

    # Use a cheap/fast model for compression — Haiku is ideal here
    summary_response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": (
                "Summarize this support conversation preserving:\\n"
                "1. Customer identity and account details\\n"
                "2. Issues raised and resolution status\\n"
                "3. Commitments made (refunds, callbacks, policy exceptions)\\n"
                "4. Any unresolved items still needing action\\n\\n"
                f"Critical case facts (preserve exactly): {json.dumps(case_facts)}\\n\\n"
                "Conversation:\\n"
                + "\\n".join(f'{m["role"].upper()}: {m["content"]}' for m in old_turns)
            ),
        }],
    )

    summary_text = summary_response.content[0].text

    # Structured summary block followed by recent verbatim turns
    return [
        {
            "role": "user",
            "content": f"[PRIOR CONVERSATION — treat as established context]\\n{summary_text}",
        },
        {
            "role": "assistant",
            "content": "Understood. I have the full context from our earlier conversation.",
        },
        *recent_turns,
    ]


# ── Usage in a long-running support agent ─────────────────────────────────
case_facts = {}   # persists outside the message history — never summarized away
messages = []

def support_turn(user_input: str) -> str:
    messages.append({"role": "user", "content": user_input})

    # Compress when history grows beyond 8 turns
    context = compress_history(messages, case_facts)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a customer support agent.",
        messages=context,
    )

    assistant_text = response.content[0].text
    messages.append({"role": "assistant", "content": assistant_text})
    return assistant_text`,
    keyPoints: [
      'Always keep the last N turns verbatim — recency bias means the model attends more strongly to recent context.',
      'Maintain a separate case_facts dict for immutable values (customer_id, order_id, refund amounts) that must survive compression without loss.',
      'Use a cheap, fast model (Haiku) for compression — this saves cost and latency on the compression step itself.',
      'Anti-pattern: sliding window (drop the oldest N turns) — it silently loses context that may still be critical.',
    ],
  },

  // ── MCP ───────────────────────────────────────────────────────────────────
  {
    id: 'mcp-project-config',
    topic: 'MCP',
    title: '.mcp.json project configuration',
    description:
      'Store MCP server configuration in .mcp.json at the project root for team-wide sharing. Tokens are injected via environment variable substitution — never commit actual secrets. All tools from connected servers are auto-discovered.',
    language: 'json',
    code: `// .mcp.json — committed to version control, shared with the whole team
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        // \${GITHUB_TOKEN} is substituted at runtime from the shell environment
        // The token itself is never in this file
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    },
    "jira": {
      "command": "npx",
      "args": ["-y", "mcp-server-jira"],
      "env": {
        "JIRA_URL": "\${JIRA_URL}",
        "JIRA_TOKEN": "\${JIRA_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "\${DATABASE_URL}"
      }
    }
  }
}

// User-only servers go in ~/.claude.json (NOT committed to VCS):
// {
//   "mcpServers": {
//     "my-experimental-server": { ... }
//   }
// }`,
    keyPoints: [
      '.mcp.json is committed to VCS — every team member gets the same server config when cloning.',
      'Use ${ENV_VAR} syntax for secrets — tokens are read from the shell environment at runtime.',
      '~/.claude.json is for personal/experimental servers that you don\'t want to share.',
      'Tools from ALL connected servers are auto-discovered and available simultaneously — write clear descriptions to prevent misrouting.',
    ],
  },
  {
    id: 'mcp-structured-error',
    topic: 'MCP',
    title: 'Structured isError MCP response',
    description:
      'When an MCP tool fails, return isError: true with structured metadata. Generic errors prevent intelligent recovery. Structured errors let the coordinator decide: retry with a different query, use partial results, or annotate a gap.',
    language: 'json',
    code: `// ✅ Good: structured error gives coordinator decision-making context
{
  "isError": true,
  "content": {
    "errorCategory": "transient",
    "isRetryable": true,
    "message": "Search API timed out after 5 seconds.",
    "attempted_query": "AI impact on music industry 2024",
    "partial_results": [
      {"title": "AI Music Generation Trends", "url": "https://...", "relevance": 0.85}
    ],
    "alternative_approaches": [
      "Narrow the query: 'AI music composition tools 2024'",
      "Try secondary source: academic search API"
    ],
    "coverage_impact": "Section 'Music Industry' will have incomplete coverage"
  }
}

// ❌ Anti-pattern: generic error — coordinator has no basis for recovery
{
  "isError": true,
  "content": "Operation failed"
}

// ❌ Anti-pattern: silent suppression — coordinator thinks no results exist
{
  "isError": false,
  "content": []
}`,
    keyPoints: [
      'errorCategory: "transient" (retry), "validation" (fix input), "business" (policy), "permission" (escalate).',
      'isRetryable: false for business-rule violations — include a user-facing explanation.',
      'Never return an empty array on failure — distinguish "no results found" from "search failed".',
      'Include coverage_impact so the coordinator can annotate gaps in the final synthesis.',
    ],
  },

  // ── Claude Code ───────────────────────────────────────────────────────────
  {
    id: 'claude-code-claudemd',
    topic: 'Claude Code',
    title: 'CLAUDE.md hierarchy',
    description:
      'CLAUDE.md files operate at three levels: user (personal, not shared), project (VCS, team-wide), and directory (scoped to a subdirectory). A common mistake is putting project standards in the user-level file — new team members never see them.',
    language: 'markdown',
    code: `# ~/.claude/CLAUDE.md  ← USER level: personal only, never committed to VCS
My preferred code style: functional over OOP.
Always use TypeScript strict mode.
When reviewing code, focus on security first, then performance.

---

# .claude/CLAUDE.md  ← PROJECT level: committed to VCS, shared with team
# This file is loaded for ALL contributors.

Project: Inventory Management System
Stack: React 18 + TypeScript + Node.js + PostgreSQL

## Standards
- All API endpoints must use the standard response wrapper (see @./standards/api.md)
- Tests must cover happy path + at least 2 edge cases
- No raw SQL — use the QueryBuilder in src/db/

## Importing standards from other files (keeps this file short)
Coding style: @./standards/coding-style.md
Testing requirements: @./standards/testing.md
Deployment rules: @./standards/deployment.md

---

# src/payments/CLAUDE.md  ← DIRECTORY level: only active when editing files here
# Loaded automatically when working in src/payments/

## Payment module conventions
- All monetary values are stored as integers (cents), never floats
- Every payment operation requires a verified customer_id (call get_customer first)
- Refund operations above $500 must be flagged for human review
- Use PaymentGatewayClient from ./client.ts — do NOT call the Stripe API directly`,
    keyPoints: [
      'User-level (~/.claude/CLAUDE.md) applies only to you — never use it for team standards.',
      'Project-level (.claude/CLAUDE.md) is committed to VCS and loaded for everyone who clones the repo.',
      'Use @./path/to/file syntax to import external files and keep CLAUDE.md modular.',
      'Directory-level CLAUDE.md is loaded only when editing files in that directory — ideal for module-specific rules.',
    ],
  },
  {
    id: 'claude-code-rules',
    topic: 'Claude Code',
    title: '.claude/rules/ with path-scoped YAML frontmatter',
    description:
      'Instead of a monolithic CLAUDE.md, organize conventions into topic-focused files in .claude/rules/. YAML frontmatter with "paths" glob patterns means each rule file is loaded only when editing matching files — saving context and tokens.',
    language: 'yaml',
    code: `# .claude/rules/testing.md
# Loaded only when editing *.test.ts or *.test.tsx files (any directory)
---
paths: ["**/*.test.ts", "**/*.test.tsx"]
---

## Testing conventions
- Use describe/it blocks (not test())
- Use data factories from src/test/factories/ — never hardcode entity data
- Do NOT mock the database — use the test database at TEST_DATABASE_URL
- Each test file must have at least one happy-path and one edge-case test
- Async tests must use await; never use done() callbacks

---

# .claude/rules/api-conventions.md
# Loaded only when editing files in src/api/
---
paths: ["src/api/**/*"]
---

## API conventions
- All endpoints return: { success: boolean, data?: T, error?: string }
- Validate all inputs with the Zod schemas in src/api/schemas/
- Use the logger from src/lib/logger.ts — never console.log in API handlers
- Rate limiting is handled by the middleware — do not add it per-route

---

# .claude/rules/terraform.md
# Loaded only when editing Terraform files
---
paths: ["infra/**/*.tf", "infra/**/*.tfvars"]
---

## Terraform conventions
- All resources must have a "team" and "environment" tag
- Never hardcode AWS account IDs — use data.aws_caller_identity
- State backend is configured in infra/backend.tf — do not modify`,
    keyPoints: [
      'The paths glob is matched against the file currently being edited — rules only load when relevant.',
      'This is more efficient than directory-level CLAUDE.md when conventions span multiple directories (e.g., all test files).',
      'Use .claude/rules/ for topic-based rules; use directory-level CLAUDE.md for location-based rules.',
      'Multiple rule files can match a single file (e.g., a test file in src/api/ matches both rules above).',
    ],
  },
  {
    id: 'claude-code-sessions',
    topic: 'Claude Code',
    title: 'Session management: --continue, --resume, --fork-session',
    description:
      'Claude Code stores every session with a unique ID. Session flags control whether you continue a previous session, branch from one, or start fresh with a memorable name. A common mistake is using --continue when you mean --session-id — the former always resumes the most recent session, even if that was unrelated work.',
    language: 'bash',
    code: `# ── --continue: Resume the MOST RECENT session (no ID needed) ─────────────
# Use when: you closed the terminal and want to pick up exactly where you left off.
# Risk: if you started other work since, this picks up THAT session instead.
claude --continue "Continue — add error handling to the function we were working on"

# ── --session-id <id>: Start a NEW session with a memorable name ───────────
# Use when: starting deliberate, resumable work that you'll want to return to later.
# Without --session-id, sessions get an auto-generated UUID that's hard to recall.
claude --session-id auth-refactor-jan "Refactor the auth module to use short-lived JWTs"

# ── --resume <session-id>: Resume a SPECIFIC past session ─────────────────
# Use when: returning to a past session by name, NOT the most recent one.
# Find all session IDs with: claude --list-sessions
claude --resume auth-refactor-jan "What design decisions did we make about token expiry?"

# ── --fork-session: Branch from the CURRENT session ───────────────────────
# Use when: exploring an alternative approach without losing the current conversation.
# The fork gets the parent's full history up to the fork point.
# Changes in the fork do NOT affect the parent session.
claude --fork-session "Try approach B: store sessions in Redis instead of JWTs"

# ── Common mistake: --continue on a new project ───────────────────────────
# If you open a new project directory and run --continue,
# Claude Code resumes whatever session you had open LAST — from any project.
# Always use --session-id when starting deliberate, resumable work on a new task.`,
    keyPoints: [
      '--continue always resumes the most recent session regardless of directory — can be surprising when switching projects.',
      '--session-id creates a NEW session with a memorable name; it does NOT resume an existing session with that name.',
      '--resume requires the exact session ID; use --list-sessions to find sessions from earlier in the week.',
      '--fork-session branches from the current active session; use it to safely explore alternative implementations.',
    ],
  },
  {
    id: 'claude-code-ci',
    topic: 'Claude Code',
    title: 'CI/CD: -p flag + structured JSON output',
    description:
      'The -p (--print) flag runs Claude Code non-interactively: it processes the prompt, prints to stdout, and exits. Use --output-format json with --json-schema to get machine-parseable results for inline PR comments. For re-reviews after new commits, pass prior results to avoid duplicate comments.',
    language: 'bash',
    code: `#!/bin/bash
# ci-review.sh — called by GitHub Actions on every PR push

PR_NUMBER=$1
PRIOR_REVIEW_FILE="./review-cache/\${PR_NUMBER}.json"

# ── First-time review ─────────────────────────────────────────────────────
if [ ! -f "$PRIOR_REVIEW_FILE" ]; then
  claude -p "Review this pull request for security vulnerabilities and bugs.
Focus on: SQL injection, XSS, missing auth checks, logic errors.
Severity levels: critical, high, medium, low.
Only flag real issues — no style suggestions." \
    --output-format json \
    --json-schema '{
      "type": "object",
      "properties": {
        "issues": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "file": {"type": "string"},
              "line": {"type": "integer"},
              "severity": {"type": "string", "enum": ["critical","high","medium","low"]},
              "description": {"type": "string"},
              "suggestion": {"type": "string"}
            },
            "required": ["file", "line", "severity", "description"]
          }
        }
      }
    }' > "$PRIOR_REVIEW_FILE"

# ── Re-review after new commits ───────────────────────────────────────────
else
  # Pass prior results so Claude only reports NEW or UNRESOLVED issues
  PRIOR=$(cat "$PRIOR_REVIEW_FILE")
  claude -p "Re-review this PR. Prior review results: \${PRIOR}
Report ONLY issues that are new (not in the prior review) or still unresolved.
Do not repeat issues that have already been fixed." \
    --output-format json \
    > "\${PRIOR_REVIEW_FILE}.new" && mv "\${PRIOR_REVIEW_FILE}.new" "$PRIOR_REVIEW_FILE"
fi

# Parse JSON output and post as inline PR comments via gh CLI
cat "$PRIOR_REVIEW_FILE" | jq -r '.issues[] | ....' | while read issue; do
  gh pr review $PR_NUMBER --comment "$issue"
done`,
    keyPoints: [
      '-p / --print is the ONLY correct way to run Claude Code non-interactively in CI — without it, the process hangs.',
      '--output-format json + --json-schema produces structured output parseable by gh CLI or other tools.',
      'Pass prior review results on re-runs to prevent duplicate comments after developer pushes a fix.',
      'Use an independent Claude instance for review — the session that generated the code is less effective at reviewing it.',
    ],
  },
];

export const TOPICS = [...new Set(codeExamples.map((e) => e.topic))];
