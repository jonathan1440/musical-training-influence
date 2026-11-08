import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  CONFIDENCE_QUESTION,
  SESSION_OPTIONS,
  SESSION_QUESTION,
  buildSteps,
  buildSubmission,
  completionParagraphs,
  consentCanContinue,
  demographicsComplete,
  phaseIInstructionParagraphs,
  phaseIIInstructionParagraphs,
  phaseIIIInstructionParagraphs,
  sessionToGroup,
  type SessionRecord,
} from "./study-flow.ts";

test("default counts follow the 36-page pattern", () => {
  const steps = buildSteps(5, 10);
  assert.equal(steps.length, 36);
  assert.equal(steps[0].kind, "consent");
  assert.equal(steps[1].kind, "demographics");
  assert.deepEqual(steps[2], { kind: "instructions", phase: 1 });
  assert.deepEqual(steps[3], { kind: "decision", phase: 1, index: 0, timed: true });
  assert.deepEqual(steps[4], { kind: "confidence", phase: 1, index: 0 });
  assert.deepEqual(steps[13], { kind: "instructions", phase: 2 });
  assert.deepEqual(steps[14], { kind: "decision", phase: 2, index: 0, timed: false });
  assert.deepEqual(steps[23], { kind: "decision", phase: 2, index: 9, timed: false });
  assert.deepEqual(steps[24], { kind: "instructions", phase: 3 });
  assert.deepEqual(steps[25], { kind: "decision", phase: 3, index: 0, timed: true });
  assert.deepEqual(steps[26], { kind: "confidence", phase: 3, index: 0 });
  assert.equal(steps[35].kind, "completion");
});

test("phase III count matches phase I, and phase II has no confidence or timing", () => {
  const steps = buildSteps(2, 3);
  assert.equal(steps.length, 6 + 3 + 8);
  const decisions = steps.filter((step) => step.kind === "decision");
  const confidence = steps.filter((step) => step.kind === "confidence");
  assert.equal(decisions.filter((step) => step.phase === 2).every((step) => step.timed === false), true);
  assert.equal(decisions.filter((step) => step.phase !== 2).every((step) => step.timed === true), true);
  assert.equal(confidence.every((step) => step.phase === 1 || step.phase === 3), true);
  assert.equal(confidence.some((step) => (step as { phase: number }).phase === 2), false);
});

test("consent No stops and an empty name does not continue", () => {
  assert.equal(consentCanContinue("No", "Ada Lovelace"), "stop");
  assert.equal(consentCanContinue("Yes", "Ada Lovelace"), "ok");
  assert.equal(consentCanContinue("No", "  "), "incomplete");
  assert.equal(consentCanContinue("", "Ada Lovelace"), "incomplete");
});

test("demographics require every answer, including session", () => {
  const complete = {
    age: "18-19",
    gender: "Female",
    aiFrequency: "Daily",
    aiPrimaryUse: "Academic work",
    aiDecisionFrequency: "Rarely",
    session: "Wednesday",
  };
  assert.equal(demographicsComplete(complete), true);
  assert.equal(demographicsComplete({ ...complete, session: "" }), false);
  assert.equal(demographicsComplete({ ...complete, session: "Control" }), false);
  assert.equal(demographicsComplete({ ...complete, session: "Experimental" }), false);
  assert.equal(demographicsComplete({ ...complete, aiPrimaryUse: "" }), false);
});

test("Monday maps to Control and Wednesday maps to Experimental", () => {
  assert.equal(sessionToGroup("Monday"), "Control");
  assert.equal(sessionToGroup("Wednesday"), "Experimental");

  const mondayTwo = phaseIIInstructionParagraphs(10, sessionToGroup("Monday")).join(" ");
  const wednesdayTwo = phaseIIInstructionParagraphs(10, sessionToGroup("Wednesday")).join(" ");
  assert.equal(mondayTwo.includes("ChatGPT"), false);
  assert.match(wednesdayTwo, /required to utilize ChatGPT/);
  assert.match(wednesdayTwo, /one conversation thread/);

  const mondayThree = phaseIIIInstructionParagraphs(5, sessionToGroup("Monday")).join(" ");
  const wednesdayThree = phaseIIIInstructionParagraphs(5, sessionToGroup("Wednesday")).join(" ");
  assert.equal(mondayThree.includes("No AI assistance"), false);
  assert.match(wednesdayThree, /No AI assistance is permitted for this phase/);

  const mondayEnd = completionParagraphs(sessionToGroup("Monday"), "Ada Lovelace").join(" ");
  const wednesdayEnd = completionParagraphs(sessionToGroup("Wednesday"), "Ada Lovelace").join(" ");
  assert.equal(mondayEnd, "You have completed the study! Thank you for participating!");
  assert.match(wednesdayEnd, /susannaziesmer@southern.edu/);
  assert.match(wednesdayEnd, /AI Study - Ada Lovelace/);
});

test("only phase II instructions, phase III instructions, and completion change with group", () => {
  const controlTwo = phaseIIInstructionParagraphs(10, "Control").join(" ");
  const experimentalTwo = phaseIIInstructionParagraphs(10, "Experimental").join(" ");
  assert.equal(controlTwo.includes("ChatGPT"), false);
  assert.match(experimentalTwo, /required to utilize ChatGPT/);
  assert.match(experimentalTwo, /one conversation thread/);
  assert.match(controlTwo, /10 more scenarios/);

  const controlThree = phaseIIIInstructionParagraphs(5, "Control").join(" ");
  const experimentalThree = phaseIIIInstructionParagraphs(5, "Experimental").join(" ");
  assert.equal(controlThree.includes("No AI assistance"), false);
  assert.match(experimentalThree, /No AI assistance is permitted for this phase/);
  assert.match(controlThree, /5 last scenarios/);

  const controlEnd = completionParagraphs("Control", "Ada Lovelace").join(" ");
  const experimentalEnd = completionParagraphs("Experimental", "Ada Lovelace").join(" ");
  assert.equal(controlEnd, "You have completed the study! Thank you for participating!");
  assert.match(experimentalEnd, /susannaziesmer@southern.edu/);
  assert.match(experimentalEnd, /AI Study - Ada Lovelace/);
  assert.equal(experimentalEnd.includes("post-activity"), false);
});

test("participant-facing copy does not say Control or Experimental", () => {
  const facing = [
    SESSION_QUESTION,
    ...SESSION_OPTIONS,
    CONFIDENCE_QUESTION,
    ...phaseIInstructionParagraphs(5),
    ...phaseIIInstructionParagraphs(10, sessionToGroup("Monday")),
    ...phaseIIInstructionParagraphs(10, sessionToGroup("Wednesday")),
    ...phaseIIIInstructionParagraphs(5, sessionToGroup("Monday")),
    ...phaseIIIInstructionParagraphs(5, sessionToGroup("Wednesday")),
    ...completionParagraphs(sessionToGroup("Monday"), "Ada Lovelace"),
    ...completionParagraphs(sessionToGroup("Wednesday"), "Ada Lovelace"),
  ];
  for (const text of facing) {
    assert.doesNotMatch(text, /\bControl\b/);
    assert.doesNotMatch(text, /\bExperimental\b/);
  }

  const pages = [
    new URL("../app/studies/ai-decision-making/questionnaire.tsx", import.meta.url),
    new URL("../app/studies/ai-decision-making/page.tsx", import.meta.url),
    new URL("../components/consent-copy.tsx", import.meta.url),
  ];
  for (const page of pages) {
    const source = readFileSync(page, "utf8");
    assert.doesNotMatch(source, /\bControl\b/, String(page));
    assert.doesNotMatch(source, /\bExperimental\b/, String(page));
  }
});

test("the sheet row stores timed seconds only for phase I and phase III decisions", () => {
  const record: SessionRecord = {
    fullName: "Ada Lovelace",
    age: "20-21",
    gender: "Female",
    aiFrequency: "Weekly",
    aiPrimaryUse: "Research",
    aiDecisionFrequency: "Sometimes",
    session: "Monday",
    phase1: [{ choice: "Option 1", confidence: "Moderately", seconds: 4.2 }],
    phase2: [{ choice: "Option 2" }, { choice: "Option 1" }],
    phase3: [{ choice: "Option 2", confidence: "Very much", seconds: 3.1 }],
  };
  const { headers, values } = buildSubmission(record, "2026-11-06T00:00:00.000Z");
  assert.deepEqual(headers.slice(0, 8), [
    "Timestamp",
    "Full Name",
    "Age",
    "Gender",
    "Generative AI Frequency",
    "Generative AI Primary Use",
    "Generative AI for Decisions",
    "Group",
  ]);
  assert.equal(headers.includes("Phase I Scenario 1 Seconds"), true);
  assert.equal(headers.includes("Phase I Scenario 1 Confidence"), true);
  assert.equal(headers.includes("Phase III Scenario 1 Seconds"), true);
  assert.equal(headers.some((header) => header.startsWith("Phase II ") && header.includes("Seconds")), false);
  assert.equal(headers.some((header) => header.startsWith("Phase II ") && header.includes("Confidence")), false);
  assert.deepEqual(
    headers.filter((header) => header.startsWith("Phase II ")),
    ["Phase II Scenario 1 Choice", "Phase II Scenario 2 Choice"],
  );
  assert.equal(values[headers.indexOf("Phase I Scenario 1 Seconds")], 4.2);
  assert.equal(values[headers.indexOf("Phase III Scenario 1 Seconds")], 3.1);
  assert.equal(values.length, headers.length);
  assert.equal(headers.indexOf("Group"), 7);
  assert.equal(headers.includes("Session"), false);
  assert.equal(values[headers.indexOf("Group")], "Control");

  const wednesday = buildSubmission({ ...record, session: "Wednesday" }, "2026-11-06T00:00:00.000Z");
  assert.equal(wednesday.headers.indexOf("Group"), 7);
  assert.equal(wednesday.headers.includes("Session"), false);
  assert.equal(wednesday.values[wednesday.headers.indexOf("Group")], "Experimental");
});
