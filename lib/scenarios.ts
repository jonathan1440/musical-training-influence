/**
 * Scenario counts and wording for the AI decision study.
 *
 * Change PHASE_I_COUNT and PHASE_II_COUNT in this file only.
 * Phase III always uses PHASE_I_COUNT. Instruction pages read these numbers.
 *
 * Scenario text and both option labels are placeholders. Edit the draft
 * entries below. An empty draft uses the placeholder constants. Example:
 * { text: "A friend asks you to choose.", option1: "Stay", option2: "Leave" },
 * If a count is higher than the number of drafts, the extra slots stay on
 * the placeholder text. If a count is lower, later drafts are unused.
 */

export const PHASE_I_COUNT = 5;
export const PHASE_II_COUNT = 10;

export const PLACEHOLDER_SCENARIO =
  "Placeholder. Scenario text is not written yet. Jonathan will edit this later.";

export const PLACEHOLDER_OPTION_1 =
  "Option 1. Placeholder label. Jonathan will edit this later.";

export const PLACEHOLDER_OPTION_2 =
  "Option 2. Placeholder label. Jonathan will edit this later.";

export type Scenario = {
  id: string;
  label: string;
  text: string;
  option1: string;
  option2: string;
};

type ScenarioDraft = {
  text?: string;
  option1?: string;
  option2?: string;
};

const phaseIDrafts: ScenarioDraft[] = [
  {},
  {},
  {},
  {},
  {},
];

const phaseIIDrafts: ScenarioDraft[] = [
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
];

const phaseIIIDrafts: ScenarioDraft[] = [
  {},
  {},
  {},
  {},
  {},
];

function takeScenarios(phase: "I" | "II" | "III", drafts: ScenarioDraft[], count: number): Scenario[] {
  return Array.from({ length: count }, (_, index) => {
    const draft = drafts[index] ?? {};
    const number = index + 1;
    return {
      id: `phase-${phase}-${number}`,
      label: `Scenario ${number}`,
      text: draft.text?.trim() || PLACEHOLDER_SCENARIO,
      option1: draft.option1?.trim() || PLACEHOLDER_OPTION_1,
      option2: draft.option2?.trim() || PLACEHOLDER_OPTION_2,
    };
  });
}

export const phaseIScenarios = takeScenarios("I", phaseIDrafts, PHASE_I_COUNT);
export const phaseIIScenarios = takeScenarios("II", phaseIIDrafts, PHASE_II_COUNT);
export const phaseIIIScenarios = takeScenarios("III", phaseIIIDrafts, PHASE_I_COUNT);
