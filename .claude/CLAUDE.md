# Claude Architect Learning Experience Standards

## Goal
Provide a superior learning experience for the Claude Architect certification, moving away from generic UI patterns and focusing on high-quality, "Impeccable" educational content.

## Design Principles (Impeccable Cues)
- **Aesthetic Direction:** Use an editorial and focused aesthetic for learning. Avoid "stacked cards" UI.
- **Typography:** Ensure a fluid type scale and proper vertical rhythm. Use system fonts effectively, prioritizing readability for long-form study content.
- **Visual Anchor:** Each screen should have a single visual anchor to guide the student's attention.
- **Tone:** Technical, authoritative, yet encouraging.

## Claude Architect Domain Cues
- **Agentic Loops:** Always emphasize the `stop_reason` check (`tool_use` vs `end_turn`).
- **Context Management:** Teach "Lost-in-the-middle" mitigation and the "Case Facts" pattern.
- **Tool Design:** Descriptions are the primary selection mechanism. Be explicit.
- **MCP:** Emphasize structured error handling (`isError` flag with metadata).

## Active Guides
- Study Guide: @claude-architect-study-guide.md

## Commands
- `/audit` - Review the current learning content for technical accuracy against the Claude Architect domains.
- `/polish` - Improve the formatting and "Impeccable" design of a study section.
