import type { EduviaRole } from "@/shared/domain";
import type {
  AIModelOption,
  CommandThread,
  ContextAttachment,
  LiveHudState,
  QuickCommandPrompt,
} from "./command-center.types";

export const AVAILABLE_MODELS: AIModelOption[] = [
  { id: "terra-5.6", name: "5.6 Terra Medium", tier: "Fast & Balanced", badge: "Default" },
  { id: "eduvia-4.5", name: "Eduvia 4.5 Sonnet", tier: "Advanced Reasoning" },
  { id: "eduvia-flash", name: "Eduvia Flash 2.0", tier: "Ultra Fast" },
];

export const AVAILABLE_CONTEXTS: ContextAttachment[] = [
  { id: "ctx-ss2a", label: "SS2A Mathematics", category: "classroom" },
  { id: "ctx-grade9", label: "Grade 9 Physics", category: "classroom" },
  { id: "ctx-alg4", label: "Unit 4 Quadratics", category: "curriculum" },
  { id: "ctx-today-lesson", label: "Thursday 4:00 PM Lesson", category: "lesson" },
  { id: "ctx-midterm", label: "Midterm Practice Bank", category: "assessment" },
  { id: "ctx-cohort", label: "Follow-up Learners (3)", category: "students" },
];

export const QUICK_PROMPTS: QuickCommandPrompt[] = [
  {
    id: "qp-lesson-pack",
    title: "Prepare Thursday's Quadratics lesson & board deck",
    description:
      "Build a 45-minute pacing plan, select 5 graduated problems, and attach them to the Learning Board.",
    prompt:
      "Prepare Thursday's SS2A Quadratics lesson: create a 45-minute plan, pull 5 medium-difficulty practice problems from the bank, and queue them for the Learning Board.",
    mode: "orchestrate",
    accent: "emerald",
    iconKind: "workflow",
    contexts: [AVAILABLE_CONTEXTS[0], AVAILABLE_CONTEXTS[2]],
    roles: ["teacher", "admin"],
  },
  {
    id: "qp-reports-digest",
    title: "Audit weekly lesson reports & draft parent updates",
    description:
      "Scan completed sessions, flag repeated mastery gaps, and prepare short parent check-in notes.",
    prompt:
      "Scan this week's Lesson Reports across my classrooms, highlight students needing follow-up, and draft short parent notes ready for review.",
    mode: "orchestrate",
    accent: "blue",
    iconKind: "reports",
    contexts: [AVAILABLE_CONTEXTS[0], AVAILABLE_CONTEXTS[5]],
    roles: ["teacher", "admin"],
  },
  {
    id: "qp-explain-concept",
    title: "Brainstorm worked examples for completing the square",
    description:
      "Discuss visual board cues and common sign-flip traps before going live with students.",
    prompt:
      "Give me three intuitive ways to explain completing the square on the Learning Board, plus common algebra traps to watch out for.",
    mode: "discuss",
    accent: "purple",
    iconKind: "calculator",
    contexts: [AVAILABLE_CONTEXTS[2]],
    roles: ["teacher", "student", "admin"],
  },
  {
    id: "qp-midterm-balance",
    title: "Balance difficulty across Midterm Practice Bank",
    description:
      "Check question distribution, flag overlapping stems, and generate 3 missing synthesis problems.",
    prompt:
      "Audit the Midterm Practice Bank for difficulty balance, flag near-duplicate algebra questions, and draft 3 replacement synthesis items.",
    mode: "orchestrate",
    accent: "amber",
    iconKind: "book",
    contexts: [AVAILABLE_CONTEXTS[4]],
    roles: ["teacher", "admin"],
  },
  {
    id: "qp-parent-checkin",
    title: "Summarize this week's lessons & home practice",
    description:
      "Review completed classwork, upcoming assessments, and two 15-minute focus areas.",
    prompt:
      "Give me a clear breakdown of this week's completed lessons, upcoming assessments, and two focused 15-minute practice topics for home.",
    mode: "discuss",
    accent: "emerald",
    iconKind: "users",
    contexts: [AVAILABLE_CONTEXTS[3]],
    roles: ["parent"],
  },
  {
    id: "qp-student-coach",
    title: "Run a 25-minute guided Quadratics revision",
    description:
      "Turn recent quiz mistakes into a 3-step practice walkthrough with worked examples.",
    prompt:
      "Orchestrate a 25-minute quadratics revision session based on my recent quiz mistakes and walk me through one example step by step.",
    mode: "orchestrate",
    accent: "emerald",
    iconKind: "calculator",
    contexts: [AVAILABLE_CONTEXTS[2], AVAILABLE_CONTEXTS[4]],
    roles: ["student"],
  },
];

export function getPromptsForRole(role?: EduviaRole): QuickCommandPrompt[] {
  const effectiveRole: EduviaRole = role && role !== "pending" ? role : "teacher";
  const matched = QUICK_PROMPTS.filter(
    (item) => !item.roles || item.roles.includes(effectiveRole),
  );
  return matched.slice(0, 4);
}

export const INITIAL_COMMAND_THREADS: CommandThread[] = [
  {
    id: "thread-assessment-reqs",
    title: "Explain assessment requirements",
    subtitle: "Assessment sync, scoring rules, and API references",
    kind: "discuss",
    project: "Assessment",
    accent: "blue",
    iconKind: "reports",
    preview: "We synchronized through API calls and stored the important references on both sides.",
    updatedAt: "Just now",
    statusLabel: "Discussion",
    pinned: true,
    contexts: [AVAILABLE_CONTEXTS[4]],
    messages: [
      {
        id: "m-ar-1",
        role: "user",
        mode: "discuss",
        timestamp: "10:24 AM",
        content: "how did we sync data across system",
      },
      {
        id: "m-ar-2",
        role: "assistant",
        mode: "discuss",
        timestamp: "10:24 AM",
        content: `We did not copy one database into another. We synchronized through API calls and stored the important references on both sides.

\`\`\`plaintext
PCX has its own Transaction record
EzRemit has its own transaction record
They stay aligned by exchanging securityNo, clientRefNo, and status updates
\`\`\`

For outbound OA:

\`\`\`plaintext
PCX creates payment
      ↓
PCX sends request to EzRemit
      ↓
EzRemit returns securityNo
\`\`\``,
      },
    ],
  },
  {
    id: "thread-quadratics-pack",
    title: "SS2A Quadratics Lesson Pack",
    subtitle: "SS2A Mathematics — Curriculum, Question Bank & Board",
    kind: "orchestrate",
    project: "Classrooms",
    accent: "emerald",
    iconKind: "workflow",
    preview: "Staged 5 graduated board exercises and synced Thursday's 45m lesson plan.",
    updatedAt: "12m ago",
    statusLabel: "Completed",
    pinned: true,
    contexts: [AVAILABLE_CONTEXTS[0], AVAILABLE_CONTEXTS[2]],
    messages: [
      {
        id: "m-1",
        role: "user",
        mode: "orchestrate",
        timestamp: "09:14 AM",
        contexts: [AVAILABLE_CONTEXTS[0], AVAILABLE_CONTEXTS[2]],
        content:
          "Prepare Thursday's SS2A Quadratics lesson. Pull 5 graduated questions on factorisation and completing the square, stage them for the Learning Board, and summarize pacing for a 45-minute block.",
      },
      {
        id: "m-2",
        role: "assistant",
        mode: "orchestrate",
        timestamp: "09:14 AM",
        spokenNote:
          "I've staged Thursday's SS2A lesson outline with five graduated problems ready to drop onto the Learning Board.",
        content:
          "Thursday's 45-minute pacing plan is ready and five graduated exercises are staged in your Question Bank bundle. You can reveal each question directly from the Learning Board toolbar during Teach Mode.",
        orchestration: {
          id: "orch-1",
          goal: "Stage Thursday SS2A Quadratics lesson & board exercises",
          summary: "4 actions completed across Curriculum, Question Bank, Learning Board, and Calendar",
          state: "completed",
          steps: [
            {
              id: "s-1",
              title: "Mapped Unit 4 curriculum checkpoints",
              detail: "Aligned factorisation and vertex-form objectives for SS2A Mathematics.",
              module: "Curriculum",
              status: "completed",
              durationLabel: "1.2s",
            },
            {
              id: "s-2",
              title: "Selected 5 graduated practice problems",
              detail: "2 warm-up factorisation items, 2 completing-the-square drills, and 1 extension word problem.",
              module: "Question Bank",
              status: "completed",
              durationLabel: "1.8s",
            },
            {
              id: "s-3",
              title: "Attached question deck to Learning Board",
              detail: "Pinned all 5 items to Thursday's board for one-click reveal.",
              module: "Learning Board",
              status: "completed",
              durationLabel: "0.9s",
            },
            {
              id: "s-4",
              title: "Updated Thursday 4:00 PM lesson brief",
              detail: "Set 10m starter, 20m worked examples, and 15m exit check.",
              module: "Calendar",
              status: "completed",
              durationLabel: "0.7s",
            },
          ],
          artifacts: [
            {
              id: "art-1",
              label: "Thursday 4:00 PM Lesson",
              targetRoute: "/calendar",
              meta: "Calendar schedule",
            },
            {
              id: "art-2",
              label: "Quadratics Problem Set (5)",
              targetRoute: "/questions",
              meta: "Question Bank",
            },
          ],
        },
      },
      {
        id: "m-3",
        role: "user",
        mode: "discuss",
        timestamp: "09:16 AM",
        content:
          "Should I keep the extension problem unlocked at the start or wait until after worked example 2?",
      },
      {
        id: "m-4",
        role: "assistant",
        mode: "discuss",
        timestamp: "09:16 AM",
        spokenNote:
          "Hold the extension problem until after worked example 2 so the class clears the sign-flip step together first.",
        content:
          "Hold it until after worked example 2. Two students in SS2A missed the negative sign distribution during factorisation last week, so keeping the extension card locked for the first 20 minutes keeps everyone anchored on the worked example before fast finishers jump ahead.",
      },
    ],
  },
  {
    id: "thread-weekly-digest",
    title: "Weekly Lesson Report Digest",
    subtitle: "14 reports audited — awaiting approval on step 3",
    kind: "orchestrate",
    project: "Reports",
    accent: "amber",
    iconKind: "reports",
    preview: "Paused before drafting 3 parent check-in notes. Ready to resume.",
    updatedAt: "1h ago",
    statusLabel: "Paused (2/4)",
    isPaused: true,
    pinned: true,
    contexts: [AVAILABLE_CONTEXTS[0], AVAILABLE_CONTEXTS[5]],
    messages: [
      {
        id: "m-10",
        role: "user",
        mode: "orchestrate",
        timestamp: "08:05 AM",
        contexts: [AVAILABLE_CONTEXTS[0], AVAILABLE_CONTEXTS[5]],
        content:
          "Audit all submitted Lesson Reports from this week, flag any learner with two consecutive low mastery checks, and prepare parent check-in messages for my approval.",
      },
      {
        id: "m-11",
        role: "assistant",
        mode: "orchestrate",
        timestamp: "08:05 AM",
        spokenNote:
          "I've audited 14 lesson reports and flagged 3 learners. I'm paused at step 3 — say the word to draft the parent updates.",
        content:
          "I finished scanning 14 submitted reports across SS2A and identified 3 learners with recurring sign-substitution errors. I paused the orchestration before drafting parent messages so you can confirm.",
        orchestration: {
          id: "orch-weekly",
          goal: "Audit weekly reports and draft parent check-ins",
          summary: "Paused at step 3 of 4 — awaiting confirmation",
          state: "paused",
          steps: [
            {
              id: "ws-1",
              title: "Aggregated 14 submitted Lesson Reports",
              detail: "Evaluated attendance, board participation, and exit ticket scores.",
              module: "Lesson Reports",
              status: "completed",
              durationLabel: "1.4s",
            },
            {
              id: "ws-2",
              title: "Identified 3 learners for follow-up",
              detail: "Flagged repeated sign errors in algebraic substitution.",
              module: "Student Progress",
              status: "completed",
              durationLabel: "1.1s",
            },
            {
              id: "ws-3",
              title: "Draft tailored parent check-in summaries",
              detail: "Prepare tone-matched updates with 10-minute home practice suggestions.",
              module: "Messages",
              status: "paused",
            },
            {
              id: "ws-4",
              title: "Stage follow-up starter quiz for Monday",
              detail: "Queue 3 confidence-builder questions per flagged learner.",
              module: "Assessments",
              status: "pending",
            },
          ],
          artifacts: [
            {
              id: "art-w1",
              label: "Weekly Lesson Reports (14)",
              targetRoute: "/lesson-reports",
              meta: "Lesson Reports",
            },
            {
              id: "art-w2",
              label: "Flagged Learner Cohort (3)",
              targetRoute: "/student-progress",
              meta: "Student Progress",
            },
          ],
        },
      },
    ],
  },
  {
    id: "thread-misconceptions",
    title: "Algebra Sign-Flip Board Routine",
    subtitle: "Unit 4 Quadratics — Teaching strategy discussion",
    kind: "discuss",
    project: "Curriculum",
    accent: "purple",
    iconKind: "calculator",
    preview: "Two-color highlighter cue on the Learning Board before bracket expansion.",
    updatedAt: "Yesterday",
    statusLabel: "Discussion",
    contexts: [AVAILABLE_CONTEXTS[2]],
    messages: [
      {
        id: "m-20",
        role: "user",
        mode: "discuss",
        timestamp: "Yesterday",
        contexts: [AVAILABLE_CONTEXTS[2]],
        content:
          "My SS2A group still drops negative signs when distributing brackets inside equations. What quick board routine fixes that?",
      },
      {
        id: "m-21",
        role: "assistant",
        mode: "discuss",
        timestamp: "Yesterday",
        spokenNote:
          "Use an amber highlighter to box the leading minus sign before students write a single number.",
        content:
          "Use a two-color pen rule on the Learning Board: highlight the leading minus sign and draw distribution arrows in amber before writing any numbers. Running three 30-second 'spot the missing sign' warm-ups at the top of class cuts distribution mistakes noticeably within two sessions.",
      },
    ],
  },
  {
    id: "thread-midterm-audit",
    title: "Midterm Bank Balance Check",
    subtitle: "Midterm Practice Bank — 24 items analyzed",
    kind: "orchestrate",
    project: "Assessment",
    accent: "blue",
    iconKind: "book",
    preview: "Balanced difficulty across 24 items and flagged 2 overlapping algebra stems.",
    updatedAt: "Mon",
    statusLabel: "Completed",
    contexts: [AVAILABLE_CONTEXTS[4]],
    messages: [
      {
        id: "m-30",
        role: "user",
        mode: "orchestrate",
        timestamp: "Mon",
        contexts: [AVAILABLE_CONTEXTS[4]],
        content:
          "Check difficulty balance in Midterm Practice Bank and tag any duplicates.",
      },
      {
        id: "m-31",
        role: "assistant",
        mode: "orchestrate",
        timestamp: "Mon",
        spokenNote:
          "Reviewed 24 midterm items. Two overlapping simultaneous equation stems were flagged for replacement.",
        content:
          "Reviewed all 24 items in the Midterm Practice Bank: 8 foundational, 11 application, and 5 synthesis prompts. Two overlapping simultaneous equations items were marked for substitution.",
        orchestration: {
          id: "orch-midterm",
          goal: "Audit difficulty & uniqueness in Midterm Practice Bank",
          summary: "3 steps completed across Question Bank, Assessments, and Curriculum",
          state: "completed",
          steps: [
            {
              id: "ms-1",
              title: "Scanned 24 published assessment items",
              detail: "Classified difficulty depth and average solve duration.",
              module: "Question Bank",
              status: "completed",
              durationLabel: "1.6s",
            },
            {
              id: "ms-2",
              title: "Flagged 2 overlapping algebra stems",
              detail: "Marked items #104 and #118 for replacement.",
              module: "Assessments",
              status: "completed",
              durationLabel: "0.8s",
            },
            {
              id: "ms-3",
              title: "Saved distribution summary",
              detail: "33% Foundational, 46% Application, 21% Synthesis.",
              module: "Curriculum",
              status: "completed",
              durationLabel: "0.5s",
            },
          ],
        },
      },
    ],
  },
];

export const INITIAL_LIVE_HUD: LiveHudState = {
  threadId: "thread-quadratics-pack",
  phase: "speaking",
  title: "SS2A Quadratics Lesson Pack",
  activeStepLabel: "4 of 4 orchestration actions complete",
  spokenTranscript:
    "I've staged Thursday's SS2A lesson outline and pinned 5 quadratic problems to the Learning Board. Want me to preview question 1?",
  completedSteps: 4,
  totalSteps: 4,
  voiceMuted: false,
  steps: INITIAL_COMMAND_THREADS[0].messages[1].orchestration?.steps ?? [],
};
