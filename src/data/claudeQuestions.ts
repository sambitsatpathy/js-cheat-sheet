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
];
