export type Group = "Control" | "Experimental";
export type Session = "Monday" | "Wednesday";

export type Step =
  | { kind: "consent" }
  | { kind: "demographics" }
  | { kind: "instructions"; phase: 1 | 2 | 3 }
  | { kind: "decision"; phase: 1 | 2 | 3; index: number; timed: boolean }
  | { kind: "confidence"; phase: 1 | 3; index: number }
  | { kind: "completion" };

export const AGE_OPTIONS = ["18-19", "20-21", "22+", "Prefer not to say"] as const;
export const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"] as const;
export const AI_FREQUENCY_OPTIONS = [
  "Never",
  "Less than monthly",
  "Monthly",
  "Weekly",
  "Daily",
  "Multiple times a day",
] as const;
export const AI_PRIMARY_USE_OPTIONS = [
  "Academic work",
  "Professional work",
  "Personal life",
  "Research",
  "Creative projects",
  "Other",
  "I don't use AI",
] as const;
export const AI_DECISION_OPTIONS = ["Never", "Rarely", "Sometimes", "Often", "Very often"] as const;
export const SESSION_OPTIONS = ["Monday", "Wednesday"] as const;
export const CONFIDENCE_OPTIONS = [
  "Not at all",
  "Slightly",
  "Moderately",
  "Quite a bit",
  "Very much",
] as const;

export const CONFIDENCE_QUESTION = "How confident do you feel in your decision?";

export const SESSION_QUESTION = "Which session are you attending?";

const HANDOFF_EMAIL = "susannaziesmer@southern.edu";

export type Demographics = {
  age: string;
  gender: string;
  aiFrequency: string;
  aiPrimaryUse: string;
  aiDecisionFrequency: string;
  session: string;
};

export type PhaseTimedAnswer = {
  choice: string;
  confidence: string;
  seconds: number;
};

export type PhaseChoiceAnswer = {
  choice: string;
};

export type SessionRecord = {
  fullName: string;
  age: string;
  gender: string;
  aiFrequency: string;
  aiPrimaryUse: string;
  aiDecisionFrequency: string;
  session: Session;
  phase1: PhaseTimedAnswer[];
  phase2: PhaseChoiceAnswer[];
  phase3: PhaseTimedAnswer[];
};

export type SheetPayload = {
  headers: string[];
  values: (string | number)[];
};

function scenarioWord(count: number): string {
  return count === 1 ? "scenario" : "scenarios";
}

export function buildSteps(phaseICount: number, phaseIICount: number): Step[] {
  const steps: Step[] = [
    { kind: "consent" },
    { kind: "demographics" },
    { kind: "instructions", phase: 1 },
  ];

  for (let index = 0; index < phaseICount; index += 1) {
    steps.push({ kind: "decision", phase: 1, index, timed: true });
    steps.push({ kind: "confidence", phase: 1, index });
  }

  steps.push({ kind: "instructions", phase: 2 });
  for (let index = 0; index < phaseIICount; index += 1) {
    steps.push({ kind: "decision", phase: 2, index, timed: false });
  }

  steps.push({ kind: "instructions", phase: 3 });
  for (let index = 0; index < phaseICount; index += 1) {
    steps.push({ kind: "decision", phase: 3, index, timed: true });
    steps.push({ kind: "confidence", phase: 3, index });
  }

  steps.push({ kind: "completion" });
  return steps;
}

export function consentCanContinue(consent: string, fullName: string): "ok" | "incomplete" | "stop" {
  if (consent !== "Yes" && consent !== "No") return "incomplete";
  if (!fullName.trim()) return "incomplete";
  if (consent === "No") return "stop";
  return "ok";
}

export function isSession(value: string): value is Session {
  return value === "Monday" || value === "Wednesday";
}

/** Monday is the no-AI condition. Wednesday is the ChatGPT condition. */
export function sessionToGroup(session: Session): Group {
  return session === "Monday" ? "Control" : "Experimental";
}

export function demographicsComplete(demographics: Demographics): boolean {
  return Boolean(
    demographics.age &&
      demographics.gender &&
      demographics.aiFrequency &&
      demographics.aiPrimaryUse &&
      demographics.aiDecisionFrequency &&
      isSession(demographics.session),
  );
}

export function phaseIInstructionParagraphs(count: number): string[] {
  return [
    `You will be given ${count} ${scenarioWord(count)} where you will have to decide between two options. Please make your best judgment based on the information presented.`,
    "After each scenario, you will also be asked about your confidence in your decision.",
  ];
}

export function phaseIIInstructionParagraphs(count: number, group: Group): string[] {
  const lead = `You will be given ${count} more ${scenarioWord(count)} where you will have to decide between two options. Please make your best judgment based on the information presented.`;
  if (group === "Control") return [lead];
  return [
    lead,
    "For this phase, you are required to utilize ChatGPT to assist in your decision-making process. You may: ask AI what decision it would make, reason through your thought process, discuss strengths and weaknesses, ask follow up questions, or any other approaches you would like. Use one conversation thread for all scenarios, as you will be sending it to the researchers at the conclusion of the study.",
  ];
}

export function phaseIIIInstructionParagraphs(count: number, group: Group): string[] {
  const lead = `You will be given ${count} last ${scenarioWord(count)} where you will have to decide between two options. Please make your best judgment based on the information presented. After each scenario, you will also be asked about your confidence in your decision.`;
  if (group === "Control") return [lead];
  return [lead, "No AI assistance is permitted for this phase."];
}

export function completionSubject(fullName: string): string {
  return `AI Study - ${fullName.trim()}`;
}

export function completionParagraphs(group: Group, fullName: string): string[] {
  if (group === "Control") {
    return ["You have completed the study! Thank you for participating!"];
  }
  return [
    `You have completed the study! Thank you for participating! Before leaving, send your ChatGPT conversation thread to the researchers. Click “Share” at the top right of your conversation thread. Paste the link into an email addressed to ${HANDOFF_EMAIL}. Name your email subject: ${completionSubject(fullName)}. If you have any questions about this process, please let the researchers know!`,
  ];
}

export function buildSubmission(record: SessionRecord, timestamp: string): SheetPayload {
  // Group stays in this position and stores sessionToGroup(session).
  // The live sheet already has a response row, so Session is not a column.
  const headers = [
    "Timestamp",
    "Full Name",
    "Age",
    "Gender",
    "Generative AI Frequency",
    "Generative AI Primary Use",
    "Generative AI for Decisions",
    "Group",
  ];
  const values: (string | number)[] = [
    timestamp,
    record.fullName,
    record.age,
    record.gender,
    record.aiFrequency,
    record.aiPrimaryUse,
    record.aiDecisionFrequency,
    sessionToGroup(record.session),
  ];

  record.phase1.forEach((item, index) => {
    const label = `Phase I Scenario ${index + 1}`;
    headers.push(`${label} Choice`, `${label} Confidence`, `${label} Seconds`);
    values.push(item.choice, item.confidence, item.seconds);
  });

  record.phase2.forEach((item, index) => {
    headers.push(`Phase II Scenario ${index + 1} Choice`);
    values.push(item.choice);
  });

  record.phase3.forEach((item, index) => {
    const label = `Phase III Scenario ${index + 1}`;
    headers.push(`${label} Choice`, `${label} Confidence`, `${label} Seconds`);
    values.push(item.choice, item.confidence, item.seconds);
  });

  return { headers, values };
}
