import type { QuizQuestion } from '../types';

export const claudeQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    scenario: 'Customer Support Agent',
    question:
      'A customer support agent is observed calling lookup_order before get_customer in 12% of cases, causing identity verification failures. What is the best fix?',
    options: [
      {
        key: 'A',
        text: 'Add a programmatic precondition that blocks lookup_order and process_refund until get_customer returns a verified customer ID',
      },
      { key: 'B', text: 'Add a prompt instruction: "Always call get_customer first"' },
      {
        key: 'C',
        text: 'Add an iteration limit to restart the loop if the wrong order is detected',
      },
      {
        key: 'D',
        text: 'Increase max_tokens to allow the model to re-read its instructions',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'When a business rule requires a specific tool sequence with guaranteed compliance, use programmatic enforcement (hooks or preconditions). Prompt instructions only provide probabilistic compliance — they will be followed most of the time, but never 100%.',
  },
  {
    id: 'q2',
    scenario: 'Customer Support Agent',
    question:
      'An agent has three tools — get_customer, lookup_order, search_kb — but all have one-line descriptions. Tool misrouting errors are occurring. What is the best fix?',
    options: [
      { key: 'A', text: 'Add tool_choice: "any" to force a tool call on every turn' },
      {
        key: 'B',
        text: 'Expand each tool\'s description with input formats, examples, edge cases, and boundaries',
      },
      { key: 'C', text: 'Reduce the number of tools to one general-purpose tool' },
      {
        key: 'D',
        text: 'Add a system prompt instruction that lists tool names and their use cases',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'Tool descriptions are the model\'s primary selection mechanism. Minimal or overlapping descriptions cause misrouting. Expanding descriptions with concrete distinctions, examples, input formats, and boundaries is the most effective fix. A system prompt listing tool names is a weaker signal than the tool descriptions themselves.',
  },
  {
    id: 'q3',
    scenario: 'Customer Support Agent',
    question:
      'An agent achieves 55% resolution rate vs. an 80% target. Analysis shows it escalates based on customer sentiment rather than specific policy gaps. What is the best improvement?',
    options: [
      {
        key: 'A',
        text: 'Add explicit escalation criteria with few-shot examples (explicit human request, policy gap, inability to make progress)',
      },
      {
        key: 'B',
        text: 'Integrate a dedicated sentiment analysis model to better classify customer mood',
      },
      { key: 'C', text: 'Lower the escalation confidence threshold from 7 to 5' },
      {
        key: 'D',
        text: 'Add more tools so the agent can handle a broader range of requests autonomously',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Sentiment analysis is an unreliable escalation trigger — customer mood does not correlate with case complexity. Explicit escalation criteria with few-shot examples give the model concrete, unambiguous decision rules that improve both accuracy and consistency.',
  },
  {
    id: 'q4',
    scenario: 'Code Generation Workflow',
    question:
      'A team wants all members to share a /review slash command for pull request reviews. Where should it be created?',
    options: [
      {
        key: 'A',
        text: '.claude/commands/review.md in the project repository',
      },
      {
        key: 'B',
        text: '~/.claude/commands/review.md on each developer\'s machine',
      },
      {
        key: 'C',
        text: '~/.claude/CLAUDE.md with a section defining the review workflow',
      },
      {
        key: 'D',
        text: '.claude/CLAUDE.md as an always-loaded instruction block',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Project-level .claude/commands/ is tracked in version control and is automatically available to all contributors when they clone the repository. User-level ~/.claude/commands/ is personal and never shared — other team members would not see it.',
  },
  {
    id: 'q5',
    scenario: 'Code Generation Workflow',
    question:
      'Before restructuring a monolith into microservices — a change that will touch 45+ files — what is the recommended first step?',
    options: [
      {
        key: 'A',
        text: 'Use planning mode: explore the codebase, understand dependencies, and design an approach before making any changes',
      },
      {
        key: 'B',
        text: 'Use direct execution to make incremental changes file by file',
      },
      {
        key: 'C',
        text: 'Use fork_session to simultaneously test multiple microservice boundary approaches',
      },
      {
        key: 'D',
        text: 'Use the Batch API to analyze all 45 files in parallel before starting',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Planning mode is the correct choice for complex architectural changes that touch many files and have multiple viable approaches. It allows safe exploration of the codebase without side effects, so the user can approve a plan before any modifications are made. Direct execution is reserved for simple, well-understood single-file fixes.',
  },
  {
    id: 'q6',
    scenario: 'Code Generation Workflow',
    question:
      'A monorepo has 15 packages, each with different testing conventions. How should per-package conventions be managed most efficiently?',
    options: [
      {
        key: 'A',
        text: 'Create .claude/rules/ files with YAML frontmatter glob patterns (paths: ["packages/auth/**/*"]) to load conventions only for the relevant package',
      },
      {
        key: 'B',
        text: 'Create a single monolithic CLAUDE.md at the root listing all conventions for all packages',
      },
      {
        key: 'C',
        text: 'Create a CLAUDE.md file inside each package directory',
      },
      {
        key: 'D',
        text: 'Store all conventions in the system prompt',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Path-specific rules in .claude/rules/ with YAML frontmatter glob patterns load only when Claude Code edits files matching the pattern. This saves context and tokens by not loading irrelevant conventions. A monolithic CLAUDE.md loads everything every time, wasting context. Directory-level CLAUDE.md works but path-specific rules are more flexible when conventions are tied to file patterns rather than directory location.',
  },
  {
    id: 'q7',
    scenario: 'Multi-agent Research Pipeline',
    question:
      'A coordinator spawns 3 search subagents. One times out and returns a generic error ("search unavailable"). What should the subagent return instead to enable the best coordinator recovery?',
    options: [
      {
        key: 'A',
        text: 'A structured error: { failure_type: "timeout", attempted_query: "...", partial_results: [...], alternative_approaches: [...], coverage_impact: "..." }',
      },
      {
        key: 'B',
        text: 'An empty array [] to signal that no results were found',
      },
      {
        key: 'C',
        text: 'A retry flag asking the coordinator to automatically re-spawn the same subagent',
      },
      {
        key: 'D',
        text: 'The generic error "search unavailable" with an HTTP 503 status code',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Structured errors give the coordinator the information needed to make intelligent recovery decisions: retry with a modified query, use partial results, delegate to another subagent, or annotate the coverage gap in the final synthesis. An empty array silently masks the failure as "no results found," which is an anti-pattern. Generic errors hide all context from the coordinator.',
  },
  {
    id: 'q8',
    scenario: 'Multi-agent Research Pipeline',
    question:
      'After aggregating research from multiple subagents, two sources report different values — 12% vs 8% — for the same metric. What is the correct synthesis approach?',
    options: [
      {
        key: 'A',
        text: 'Preserve both values with source attribution and dates; annotate the conflict and pass to the coordinator for reconciliation',
      },
      {
        key: 'B',
        text: 'Take the average of the two values (10%) for a balanced estimate',
      },
      {
        key: 'C',
        text: 'Use the more recent source and discard the older one',
      },
      {
        key: 'D',
        text: 'Flag the entire section as unreliable and exclude it from the report',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Conflicting data should never be arbitrarily resolved. Both values must be preserved with full attribution (source name, date, methodology). Including publication dates often reveals a temporal explanation — e.g., 10% in 2023 vs 15% in 2024 shows growth rather than a true contradiction. The coordinator, not the subagent, is responsible for reconciliation decisions.',
  },
  {
    id: 'q9',
    scenario: 'Multi-agent Research System',
    question:
      'The synthesis agent frequently needs to verify specific claims while merging results. Currently it hands control back to the coordinator for every verification, which calls the web-search agent and re-runs synthesis — adding 2–3 extra round trips and increasing latency by 40%. Analysis shows 85% of checks are simple fact checks (dates, names, statistics) and 15% require deeper investigation. How do you reduce overhead while maintaining reliability?',
    options: [
      {
        key: 'A',
        text: 'Give the synthesis agent a limited verify_fact tool for simple checks, and continue routing complex verification through the coordinator',
      },
      {
        key: 'B',
        text: 'Accumulate all verification needs and return them to the coordinator as a batch at the end of synthesis',
      },
      {
        key: 'C',
        text: 'Give the synthesis agent full access to all web-search tools',
      },
      {
        key: 'D',
        text: 'Proactively cache additional context around each source to avoid verification calls',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'This applies the principle of least privilege: the synthesis agent gets exactly the tool it needs for the 85% common case (simple fact checks) while preserving the coordinator-mediated path for complex investigations that need deeper research. Option B introduces blocking dependencies — later synthesis steps may depend on earlier verified facts. Option C breaks separation of responsibilities and exposes the synthesis agent to tools outside its role. Option D relies on speculative caching that cannot reliably predict verification needs.',
  },
  {
    id: 'q10',
    scenario: 'Claude Code for CI',
    question:
      'A CI pipeline runs the command `claude "Analyze this pull request for security issues"` but the job hangs indefinitely waiting for interactive input. What is the correct fix?',
    options: [
      {
        key: 'A',
        text: 'Use the -p flag: `claude -p "Analyze this pull request for security issues"`',
      },
      {
        key: 'B',
        text: 'Set the environment variable CLAUDE_HEADLESS=true before running the command',
      },
      {
        key: 'C',
        text: 'Redirect stdin from /dev/null: `claude "..." < /dev/null`',
      },
      {
        key: 'D',
        text: 'Use the --batch flag to run in batch processing mode',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, prints the result to stdout, and exits immediately without waiting for user input. The other options are either non-existent features (CLAUDE_HEADLESS, --batch) or Unix workarounds that do not engage Claude\'s non-interactive mode properly.',
  },
  {
    id: 'q11',
    scenario: 'Claude Code for CI',
    question:
      'A team uses Claude for two workflows: (1) a blocking pre-merge check that must complete before developers can merge a PR, and (2) a tech-debt report generated overnight for morning review. A manager proposes moving both to the Message Batches API to save 50% on API costs. How should you evaluate this proposal?',
    options: [
      {
        key: 'A',
        text: 'Use the Batches API only for the tech-debt report; keep synchronous calls for the pre-merge check',
      },
      {
        key: 'B',
        text: 'Move both workflows to the Batches API and poll for completion with exponential backoff',
      },
      {
        key: 'C',
        text: 'Keep synchronous calls for both workflows to avoid ordering issues in batch results',
      },
      {
        key: 'D',
        text: 'Move both to the Batches API with an automatic fallback to real-time calls if a batch takes more than 30 minutes',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'The Message Batches API saves 50% on cost but has a processing window of up to 24 hours with no guaranteed latency SLA. This makes it completely unsuitable for the pre-merge check, where developers are actively waiting and a 24-hour delay is unacceptable. The overnight tech-debt report has no latency requirement and is an ideal batch workload. Option B ignores the latency constraint. Option C wastes 50% savings on the overnight report unnecessarily. Option D adds complexity and does not reliably solve the latency problem.',
  },
  {
    id: 'q12',
    scenario: 'Multi-file Code Review',
    question:
      'A PR review over 14 files produces inconsistent results: detailed comments on some files, superficial analysis on others, missed obvious bugs, and contradictory feedback (the same pattern flagged as a problem in one file but approved in another). What is the best architectural fix?',
    options: [
      {
        key: 'A',
        text: 'Split into focused passes: analyze each file individually for local issues, then run a separate integration pass for cross-file data flows and interactions',
      },
      {
        key: 'B',
        text: 'Require developers to split large PRs into batches of 3–4 files before requesting review',
      },
      {
        key: 'C',
        text: 'Switch to a model with a larger context window so all 14 files fit in a single pass',
      },
      {
        key: 'D',
        text: 'Run three independent full-PR review passes and report only issues found in at least two of the three runs',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Focused passes directly fix the root cause: attention dilution when processing many files simultaneously. Per-file analysis ensures consistent analytical depth across all files. A separate integration pass then catches cross-file issues (inconsistent types, circular dependencies, data flow bugs) that per-file analysis cannot detect. Option B shifts the burden to developers without improving review quality. Option C is a misconception — a larger context window does not improve attention quality; the model still processes all content simultaneously and suffers the same dilution. Option D relies on consensus across inconsistent detections, which suppresses real bugs that happen to appear in only one pass.',
  },
  {
    id: 'q13',
    scenario: 'Long-running Support Agent',
    question:
      'A customer support agent runs for 50+ turns before each session ends. After turn 20, the agent starts contradicting commitments it made in turns 5–10 — even though the context window is not exhausted. What is the most likely cause and best architectural fix?',
    options: [
      {
        key: 'A',
        text: 'Implement progressive summarization: compress old turns with a cheap model, preserve critical facts (commitments, IDs, amounts) in a separate case_facts block outside the summary, and keep the last N turns verbatim',
      },
      {
        key: 'B',
        text: 'Switch to a model with a larger context window so that all 50 turns fit without compression',
      },
      {
        key: 'C',
        text: 'Reduce max_tokens on each call to leave more context budget for earlier turns',
      },
      {
        key: 'D',
        text: 'Use the Batch API to process earlier turns in a separate batch and merge results',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Contradicting early commitments is a symptom of attention dilution, not token exhaustion — content far from the current position receives less attention even when it fits in the context window. A larger context window makes the problem worse, not better. Progressive summarization solves this by keeping critical facts (the things that must not be forgotten) in a compact, recent position in the context. The case_facts block ensures values like customer IDs, promised refund amounts, and explicit commitments are never compressed away. Reducing max_tokens is counterproductive and the Batch API has no memory across calls.',
  },
  {
    id: 'q14',
    scenario: 'MCP Tool Integration',
    question:
      'An MCP server that Claude Code relies on crashes mid-session. Claude Code reports "Tool call failed." Which error tier is this, and what does the correct response look like?',
    options: [
      {
        key: 'A',
        text: 'Protocol error — the crashed server cannot return isError: true because the transport layer is broken; the MCP host surfaces a connection failure to the model, which then decides whether to retry or change approach',
      },
      {
        key: 'B',
        text: 'Tool execution error — the server should return {"isError": true, "content": "Server crashed"} using the standard MCP result format',
      },
      {
        key: 'C',
        text: 'Application error — return a JSON-RPC error object with code -32603 and a message field',
      },
      {
        key: 'D',
        text: 'Transport error — the MCP host should silently retry up to 3 times before surfacing any error to the model',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'MCP distinguishes two error tiers: protocol errors (server crash, connection refused, malformed message, transport failure) and tool execution errors (the server ran but the tool\'s business logic failed). Only tool execution errors use isError: true in the MCP result payload — because only a running server can produce a result. Protocol errors are handled at the transport layer: the MCP host detects the broken connection and surfaces a connection failure to the orchestrating model. The model then makes an intelligent decision — retry, use a fallback tool, or inform the user. Silent retries (option D) hide the failure and prevent the model from adapting its approach.',
  },
  {
    id: 'q15',
    scenario: 'Multi-session Claude Code Workflow',
    question:
      'A developer starts a refactoring session Monday using: claude --session-id auth-refactor "Refactor auth to use JWTs". On Wednesday, they want to ask about the design decisions made Monday — not continue the work, just review the reasoning. Which command is correct?',
    options: [
      {
        key: 'A',
        text: 'claude --resume auth-refactor "What design decisions did we make about token expiry?"',
      },
      {
        key: 'B',
        text: 'claude --continue "What design decisions did we make about token expiry?"',
      },
      {
        key: 'C',
        text: 'claude --session-id auth-refactor "What design decisions did we make about token expiry?"',
      },
      {
        key: 'D',
        text: 'claude --fork-session "What design decisions did we make about token expiry?"',
      },
    ],
    correctAnswer: 'A',
    explanation:
      '--resume <session-id> resumes a specific past session by its ID, giving full access to the conversation history including all design decisions from Monday. --continue always picks up the MOST RECENT session — which on Wednesday is probably Tuesday\'s work, not Monday\'s refactoring. --session-id auth-refactor starts a BRAND NEW session with that name; it does not resume the existing session (the old session would effectively be overwritten as the current one). --fork-session branches from whichever session is currently active, not from a named past session.',
  },
  {
    id: 'q16',
    scenario: 'Document Processing Pipeline',
    question:
      'A legal team needs to process 200 customer contracts: extract key terms (parties, effective dates, payment amounts, termination clauses) from each one. All contracts follow the same format. What agentic pattern minimizes total wall-clock time?',
    options: [
      {
        key: 'A',
        text: 'Parallel subagents — partition the 200 contracts across N independent agents, each extracting terms from its batch, then merge all results',
      },
      {
        key: 'B',
        text: 'Orchestrator-workers — one coordinator distributes contracts to specialist agents (one agent for dates, one for amounts, one for parties)',
      },
      {
        key: 'C',
        text: 'Dynamic decomposition — let a single agent decompose the task as it processes each contract',
      },
      {
        key: 'D',
        text: 'Prompt chaining — process all 200 contracts sequentially: extract → validate → store for each one',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'This is the canonical parallel subagents use case: a large batch of homogeneous items (all contracts, same format) with fully independent processing (one contract\'s extraction doesn\'t depend on another\'s). Partitioning across N agents reduces wall-clock time from O(200) to O(200/N). Orchestrator-workers adds unnecessary coordination overhead — there are no specialists needed when all items use the same extraction logic. Dynamic decomposition adds overhead for a well-structured, repeatable task where the structure is already known. Prompt chaining processes items sequentially, which is functionally correct but wastes the parallelism opportunity — for 200 independent items, sequential processing is O(200x) slower than parallel.',
  },
];
