import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  PHASE_I_COUNT,
  PHASE_II_COUNT,
  phaseIIIScenarios,
  phaseIIScenarios,
  phaseIScenarios,
} from "./scenarios.ts";
import {
  CONFIDENCE_QUESTION,
  EXPLANATION_PROMPT,
  SESSION_OPTIONS,
  SESSION_QUESTION,
  buildDeclinedSubmission,
  buildSteps,
  buildSubmission,
  completionParagraphs,
  consentCanContinue,
  demographicsComplete,
  explanationCanContinue,
  isSession,
  phaseHeading,
  phaseIInstructionParagraphs,
  phaseIIInstructionParagraphs,
  phaseIIIInstructionParagraphs,
  scenarioHeading,
  sessionToGroup,
  type InstructionBlock,
  type SessionRecord,
} from "./study-flow.ts";

const APOSTROPHE = "\u2019";

function blockLines(blocks: InstructionBlock[]): string[] {
  return blocks.flatMap((block) => (block.type === "bullets" ? block.items : [block.text]));
}

test("default counts follow the 46-page pattern", () => {
  const steps = buildSteps(5, 10);
  assert.equal(steps.length, 46);
  assert.equal(steps[0].kind, "consent");
  assert.equal(steps[1].kind, "demographics");
  assert.deepEqual(steps[2], { kind: "instructions", phase: 1 });
  assert.deepEqual(steps[3], { kind: "decision", phase: 1, index: 0, timed: true });
  assert.deepEqual(steps[4], { kind: "explanation", phase: 1, index: 0, confidence: true });
  assert.deepEqual(steps[13], { kind: "instructions", phase: 2 });
  assert.deepEqual(steps[14], { kind: "decision", phase: 2, index: 0, timed: false });
  assert.deepEqual(steps[15], { kind: "explanation", phase: 2, index: 0, confidence: false });
  assert.deepEqual(steps[32], { kind: "decision", phase: 2, index: 9, timed: false });
  assert.deepEqual(steps[33], { kind: "explanation", phase: 2, index: 9, confidence: false });
  assert.deepEqual(steps[34], { kind: "instructions", phase: 3 });
  assert.deepEqual(steps[35], { kind: "decision", phase: 3, index: 0, timed: true });
  assert.deepEqual(steps[36], { kind: "explanation", phase: 3, index: 0, confidence: true });
  assert.equal(steps[45].kind, "completion");
  assert.equal(
    steps.some((step) => step.kind === "confidence"),
    false,
  );
});

test("phase III count matches phase I, and phase II has no confidence or timing", () => {
  const steps = buildSteps(2, 3);
  assert.equal(steps.length, 20);
  const decisions = steps.filter((step) => step.kind === "decision");
  const explanations = steps.filter((step) => step.kind === "explanation");
  assert.equal(decisions.filter((step) => step.phase === 1).length, 2);
  assert.equal(decisions.filter((step) => step.phase === 2).length, 3);
  assert.equal(decisions.filter((step) => step.phase === 3).length, 2);
  assert.equal(
    decisions.filter((step) => step.phase === 2).every((step) => step.timed === false),
    true,
  );
  assert.equal(
    decisions.filter((step) => step.phase === 1 || step.phase === 3).every((step) => step.timed === true),
    true,
  );
  assert.equal(
    explanations.filter((step) => step.phase === 2).every((step) => step.confidence === false),
    true,
  );
  assert.equal(
    explanations.filter((step) => step.phase !== 2).every((step) => step.confidence === true),
    true,
  );
  assert.equal(
    explanations.every((step) => !("timed" in step)),
    true,
  );
});

test("phase I and III decision pages are timed and every other page is not", () => {
  const steps = buildSteps(5, 10);
  const timed = steps.filter((step) => step.kind === "decision" && step.timed);
  assert.equal(timed.length, 10);
  assert.equal(
    timed.every((step) => step.phase === 1 || step.phase === 3),
    true,
  );
  assert.equal(steps.filter((step) => step.kind === "decision" && step.phase === 2 && step.timed).length, 0);
});

test("consent No does not advance and the declined payload has only the name", () => {
  assert.equal(consentCanContinue("No", "Ada Lovelace"), "stop");
  assert.equal(consentCanContinue("Yes", "Ada Lovelace"), "ok");
  assert.equal(consentCanContinue("No", "  "), "incomplete");
  assert.equal(consentCanContinue("", "Ada Lovelace"), "incomplete");

  const declined = buildDeclinedSubmission("  Ada Lovelace  ", "2026-11-15T12:00:00.000Z");
  assert.equal(declined.declined, true);
  assert.deepEqual(declined.headers, ["Timestamp", "Full Name"]);
  assert.deepEqual(declined.values, ["2026-11-15T12:00:00.000Z", "Ada Lovelace"]);
  const encoded = JSON.stringify(declined);
  for (const forbidden of ["Age", "Gender", "Group", "Scenario", "Confidence", "Explanation", "session"]) {
    assert.equal(encoded.includes(forbidden), false, forbidden);
  }

  const questionnaire = readFileSync(
    new URL("../app/studies/ai-decision-making/questionnaire.tsx", import.meta.url),
    "utf8",
  );
  const stopAt = questionnaire.indexOf('gate === "stop"');
  const advanceAt = questionnaire.indexOf("goTo(index + 1)", stopAt);
  assert.notEqual(stopAt, -1);
  assert.notEqual(advanceAt, -1);
  const stopBranch = questionnaire.slice(stopAt, advanceAt);
  assert.match(stopBranch, /setStopped\(true\)/);
  assert.match(stopBranch, /buildDeclinedSubmission/);
  assert.match(stopBranch, /return;/);
  assert.doesNotMatch(stopBranch, /goTo/);
  assert.doesNotMatch(questionnaire, /nothing was saved/);
});

test("an explanation is required, and confidence is required only when that page asks for it", () => {
  assert.equal(EXPLANATION_PROMPT, "Briefly explain (in a sentence or less) why you made your decision:");
  assert.equal(explanationCanContinue("  ", null), "incomplete");
  assert.equal(explanationCanContinue("The full ride mattered.", null), "ok");
  assert.equal(explanationCanContinue("The full ride mattered.", ""), "incomplete");
  assert.equal(explanationCanContinue("   ", "Moderately"), "incomplete");
  assert.equal(explanationCanContinue("The full ride mattered.", "Moderately"), "ok");

  const questionnaire = readFileSync(
    new URL("../app/studies/ai-decision-making/questionnaire.tsx", import.meta.url),
    "utf8",
  );
  assert.match(questionnaire, /explanationCanContinue/);
  assert.match(questionnaire, /EXPLANATION_PROMPT/);
});

test("demographics require every answer, including Monday or Tuesday", () => {
  const complete = {
    age: "18-19",
    gender: "Female",
    aiFrequency: "Daily",
    aiPrimaryUse: "Academic work",
    aiDecisionFrequency: "Rarely",
    session: "Tuesday",
  };
  assert.deepEqual(SESSION_OPTIONS, ["Monday", "Tuesday"]);
  assert.equal(isSession("Monday"), true);
  assert.equal(isSession("Tuesday"), true);
  assert.equal(isSession("Wednesday"), false);
  assert.equal(demographicsComplete(complete), true);
  assert.equal(demographicsComplete({ ...complete, session: "" }), false);
  assert.equal(demographicsComplete({ ...complete, session: "Wednesday" }), false);
  assert.equal(demographicsComplete({ ...complete, session: "Control" }), false);
  assert.equal(demographicsComplete({ ...complete, session: "Experimental" }), false);
  assert.equal(demographicsComplete({ ...complete, aiPrimaryUse: "" }), false);
});

test("Monday maps to Control and Tuesday maps to Experimental", () => {
  assert.equal(sessionToGroup("Monday"), "Control");
  assert.equal(sessionToGroup("Tuesday"), "Experimental");

  assert.deepEqual(phaseIInstructionParagraphs(5), [
    {
      type: "paragraph",
      text: "You will be given 5 life scenarios where you will have to decide between two options. Please make your best judgment based on the information presented.",
    },
    {
      type: "paragraph",
      text: "After each scenario, you will explain your choice and report your confidence in your decision.",
    },
  ]);

  assert.deepEqual(phaseIIInstructionParagraphs(10, sessionToGroup("Monday")), [
    {
      type: "paragraph",
      text: "You will be given 10 more life scenarios where you will have to decide between two options. Please make your best judgment based on the information presented.",
    },
    { type: "paragraph", text: "After each scenario, you will briefly explain your choice." },
  ]);
  const tuesdayTwo = phaseIIInstructionParagraphs(10, sessionToGroup("Tuesday"));
  assert.deepEqual(tuesdayTwo, [
    {
      type: "paragraph",
      text: "You will be given 10 more scenarios where you will have to decide between two options. Please make your best judgment based on the information presented.",
    },
    { type: "paragraph", text: "After each scenario, you will briefly explain your choice." },
    {
      type: "emphasis",
      text: "For this phase, you are required to utilize ChatGPT to assist in your decision-making process.",
    },
    { type: "paragraph", text: "You may:" },
    {
      type: "bullets",
      items: [
        "ask AI what decision it would make",
        "reason through your thought process",
        "discuss strengths and weaknesses",
        "ask follow up questions",
        "or any other approaches you would like",
      ],
    },
    {
      type: "emphasis",
      text: "Use one conversation thread for all scenarios, as you will be sending it to the researchers at the conclusion of the study.",
    },
  ]);
  assert.equal(blockLines(tuesdayTwo).join(" ").includes("life"), false);
  assert.equal(
    phaseIIInstructionParagraphs(10, "Control").every((block) => block.type === "paragraph"),
    true,
  );

  assert.deepEqual(phaseIIIInstructionParagraphs(5, sessionToGroup("Monday")), [
    {
      type: "paragraph",
      text: "You will be given 5 last life scenarios where you will have to decide between two options. Please make your best judgment based on the information presented. After each scenario, you will explain your choice and report your confidence in your decision.",
    },
  ]);
  const tuesdayThree = phaseIIIInstructionParagraphs(5, sessionToGroup("Tuesday"));
  assert.deepEqual(tuesdayThree, [
    {
      type: "paragraph",
      text: "You will be given 5 last scenarios where you will have to decide between two options. Please make your best judgment based on the information presented. After each scenario, you will explain your choice and report your confidence in your decision.",
    },
    { type: "paragraph", text: "No AI assistance is permitted for this phase." },
  ]);
  assert.equal(blockLines(tuesdayThree).join(" ").includes("life"), false);

  const mondayEnd = completionParagraphs(sessionToGroup("Monday"), "Ada Lovelace").join(" ");
  const tuesdayEnd = completionParagraphs(sessionToGroup("Tuesday"), "Ada Lovelace").join(" ");
  assert.equal(mondayEnd, "You have completed the study! Thank you for participating!");
  assert.match(tuesdayEnd, /susannaziesmer@southern.edu/);
  assert.match(tuesdayEnd, /AI Study - Ada Lovelace/);
});

test("participant-facing copy does not say Control, Experimental, or Wednesday", () => {
  const facing = [
    SESSION_QUESTION,
    ...SESSION_OPTIONS,
    CONFIDENCE_QUESTION,
    EXPLANATION_PROMPT,
    ...blockLines(phaseIInstructionParagraphs(5)),
    ...blockLines(phaseIIInstructionParagraphs(10, sessionToGroup("Monday"))),
    ...blockLines(phaseIIInstructionParagraphs(10, sessionToGroup("Tuesday"))),
    ...blockLines(phaseIIIInstructionParagraphs(5, sessionToGroup("Monday"))),
    ...blockLines(phaseIIIInstructionParagraphs(5, sessionToGroup("Tuesday"))),
    ...completionParagraphs(sessionToGroup("Monday"), "Ada Lovelace"),
    ...completionParagraphs(sessionToGroup("Tuesday"), "Ada Lovelace"),
  ];
  for (const text of facing) {
    assert.doesNotMatch(text, /\bControl\b/);
    assert.doesNotMatch(text, /\bExperimental\b/);
    assert.doesNotMatch(text, /Wednesday/);
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
    assert.doesNotMatch(source, /Wednesday/, String(page));
    assert.doesNotMatch(source, /post-activity/, String(page));
  }

  const consent = readFileSync(new URL("../components/consent-copy.tsx", import.meta.url), "utf8");
  assert.match(consent, /You will attend an in-person session/);
  assert.match(consent, /complete decision-making tasks either with or without AI/);

  const questionnaire = readFileSync(
    new URL("../app/studies/ai-decision-making/questionnaire.tsx", import.meta.url),
    "utf8",
  );
  assert.match(questionnaire, /Please select below if you agree to participate in this study:/);
  assert.doesNotMatch(questionnaire, /or not:/);
  assert.doesNotMatch(questionnaire, /Susanna Ziesmer/);
  assert.doesNotMatch(questionnaire, /home-link/);
  assert.match(questionnaire, /showTitle=\{step\.kind === "consent"\}/);
  assert.match(questionnaire, /<h1 className="study-title">/);
  assert.equal(phaseHeading(1), "Phase I");
  assert.equal(phaseHeading(2), "Phase II");
  assert.equal(phaseHeading(3), "Phase III");
  assert.equal(scenarioHeading(1, 2), "Phase I scenario 3");
  assert.equal(scenarioHeading(2, 6), "Phase II scenario 7");
  assert.doesNotMatch(phaseHeading(1), /instructions/i);
  assert.equal((questionnaire.match(/scenarioHeading\(step\.phase, step\.index\)/g) ?? []).length, 2);
  assert.match(questionnaire, /phaseHeading\(step\.phase\)/);
  assert.doesNotMatch(questionnaire, /instructions`/);
});

test("explanation columns are appended after the existing row and a declined row is separate", () => {
  const record: SessionRecord = {
    fullName: "Ada Lovelace",
    age: "20-21",
    gender: "Female",
    aiFrequency: "Weekly",
    aiPrimaryUse: "Research",
    aiDecisionFrequency: "Sometimes",
    session: "Monday",
    phase1: [
      {
        choice: "University A",
        confidence: "Moderately",
        seconds: 4.2,
        explanation: "The full ride mattered.",
      },
    ],
    phase2: [
      { choice: "Bank A", explanation: "No monthly fee." },
      { choice: "Dog B", explanation: "Calmer temperament." },
    ],
    phase3: [
      {
        choice: "Laptop B",
        confidence: "Very much",
        seconds: 3.1,
        explanation: "It is lighter.",
      },
    ],
  };
  const { headers, values, declined } = buildSubmission(record, "2026-11-06T00:00:00.000Z");
  assert.equal(declined, undefined);
  assert.deepEqual(headers, [
    "Timestamp",
    "Full Name",
    "Age",
    "Gender",
    "Generative AI Frequency",
    "Generative AI Primary Use",
    "Generative AI for Decisions",
    "Group",
    "Phase I Scenario 1 Choice",
    "Phase I Scenario 1 Confidence",
    "Phase I Scenario 1 Seconds",
    "Phase II Scenario 1 Choice",
    "Phase II Scenario 2 Choice",
    "Phase III Scenario 1 Choice",
    "Phase III Scenario 1 Confidence",
    "Phase III Scenario 1 Seconds",
    "Phase I Scenario 1 Explanation",
    "Phase II Scenario 1 Explanation",
    "Phase II Scenario 2 Explanation",
    "Phase III Scenario 1 Explanation",
  ]);
  assert.equal(values[headers.indexOf("Phase I Scenario 1 Seconds")], 4.2);
  assert.equal(values[headers.indexOf("Phase III Scenario 1 Seconds")], 3.1);
  assert.equal(values[headers.indexOf("Phase I Scenario 1 Explanation")], "The full ride mattered.");
  assert.equal(values[headers.indexOf("Phase II Scenario 2 Explanation")], "Calmer temperament.");
  assert.equal(values[headers.indexOf("Phase III Scenario 1 Explanation")], "It is lighter.");
  assert.equal(values.length, headers.length);
  assert.equal(headers.indexOf("Group"), 7);
  assert.equal(headers.includes("Session"), false);
  assert.equal(values[headers.indexOf("Group")], "Control");
  assert.equal(headers.some((header) => header.startsWith("Phase II ") && header.includes("Seconds")), false);
  assert.equal(
    headers.some((header) => header.startsWith("Phase II ") && header.includes("Confidence")),
    false,
  );

  const tuesday = buildSubmission({ ...record, session: "Tuesday" }, "2026-11-06T00:00:00.000Z");
  assert.equal(tuesday.headers.indexOf("Group"), 7);
  assert.equal(tuesday.values[tuesday.headers.indexOf("Group")], "Experimental");
  assert.deepEqual(tuesday.headers.slice(0, 8), headers.slice(0, 8));
});

test("the Apps Script writes declined names to their own tab and does not rewrite headers", () => {
  const script = readFileSync(new URL("../google-apps-script-ai-study.js", import.meta.url), "utf8");
  assert.match(script, /Declined consent/);
  assert.match(script, /data\.declined/);
  assert.match(script, /values\[0\]/);
  assert.match(script, /values\[1\]/);
  assert.match(script, /appendMissingHeaders/);
  assert.match(script, /Do not rewrite existing header cells/);
  assert.doesNotMatch(script, /Consent "No" is never posted/);
  const declinedAt = script.indexOf("function writeDeclinedConsent");
  assert.notEqual(declinedAt, -1);
  const declinedFn = script.slice(declinedAt, script.indexOf("function appendMissingHeaders"));
  assert.match(declinedFn, /appendRow\(\["Timestamp", "Full Name"\]\)/);
  assert.doesNotMatch(declinedFn, /AI Decision Study/);
});

test("scenario counts and text live in the data file and phase III follows phase I", () => {
  assert.equal(PHASE_I_COUNT, 5);
  assert.equal(PHASE_II_COUNT, 10);
  assert.equal(phaseIScenarios.length, PHASE_I_COUNT);
  assert.equal(phaseIIScenarios.length, PHASE_II_COUNT);
  assert.equal(phaseIIIScenarios.length, phaseIScenarios.length);

  const expected = {
    I: [
      [
        "You got accepted into two graduate programs and have to submit your decisions. University A is highly reputable and offered a full ride assistantship position, but the professor you wanted to work with is retiring soon. University B is better aligned with your career goals and located near family, but the program will take an additional year to complete.",
        "Which graduate program would you choose?",
        "University A",
        "University B",
      ],
      [
        "You are buying a used car. Car A has 100,000 miles on it but a clean vehicle history, and it has the storage and passenger capacity you need. Car B includes all the interior features you wanted and has great gas mileage, but it requires a high monthly payment.",
        "Which car would you buy?",
        "Car A",
        "Car B",
      ],
      [
        "You are looking for a gym to join and have narrowed your options down to two facilities. Gym A offers a wide variety of fitness classes and has extensive equipment, but it is often crowded during peak hours. Gym B is open 24/7 and provides access to personal training consultations, but it is located across town.",
        "Which gym would you join?",
        "Gym A",
        "Gym B",
      ],
      [
        "You have received two job offers after graduating from college. Company A offers a flexible work schedule and opportunities to travel internationally, but the position requires frequent overtime. Company B provides an extensive professional development program and great benefits, but the position involves a lengthy daily commute.",
        "Which job would you accept?",
        "Company A",
        "Company B",
      ],
      [
        "You are registering for a course and have to choose between two professors. Professor A provides quick, helpful feedback on assignments and does not require attendance, but their exams are known to be particularly challenging. Professor B is known to be very approachable and utilizes a variety of teaching methods, but they assign frequent group projects.",
        "Which professor would you choose?",
        "Professor A",
        "Professor B",
      ],
    ],
    II: [
      [
        "You are choosing a bank to open a new checking account. Bank A has a higher interest rate on account balances and no monthly account fees, but there are very few physical branch locations near you. Bank B offers a sign-up bonus and has a convenient mobile banking app, but it requires a higher minimum balance to avoid additional charges.",
        "Which bank would you choose?",
        "Bank A",
        "Bank B",
      ],
      [
        `You are looking to adopt a dog and are deciding between two breeds. Dog A is easy to train and doesn${APOSTROPHE}t shed much, but it requires extensive daily exercise. Dog B has a calm, companionable temperament and can be left alone for long periods, but the breed is known to have health complications.`,
        "Which dog would you adopt?",
        "Dog A",
        "Dog B",
      ],
      [
        "You are considering moving to one of two cities after graduation. City A has an extensive public transportation system and you have friends who live in the area, but the cost of living is high. City B has a low crime rate and an active local community, but you will have fewer professional opportunities there.",
        "Which city would you move to?",
        "City A",
        "City B",
      ],
      [
        "You are choosing a phone plan and have narrowed your options down to two providers. Plan A includes unlimited data and free international texting, but it requires a two-year contract. Plan B offers a generous monthly data allowance and allows you to upgrade your phone every year, but it has more limited network coverage.",
        "Which phone plan would you choose?",
        "Plan A",
        "Plan B",
      ],
      [
        `Your friend group is deciding between two vacation spots. Location A has a wide variety of activities in the area and a large Airbnb, but it${APOSTROPHE}s an 8-hour drive. Location B is supposed to have perfect weather and is hosting an event you${APOSTROPHE}re all excited about, but the area is known to be very expensive.`,
        "Which vacation spot would you choose?",
        "Location A",
        "Location B",
      ],
      [
        `You need to decide on a major before registering for next semester${APOSTROPHE}s classes. Major A has more opportunities to work with faculty and less demanding coursework, but it will require you to stay an extra semester. Major B has a more specific track focused on your career goals and extensive professional connections, but it leaves no room for exploring elective courses.`,
        "Which major would you choose?",
        "Major A",
        "Major B",
      ],
      [
        "You are booking flights for an upcoming trip. Flight A is cheaper and allows free seat selection, but you will have to drive two additional hours from the arrival airport to your final destination. Flight B is a direct flight and includes a free checked bag, but it arrives late at night.",
        "Which flight would you book?",
        "Flight A",
        "Flight B",
      ],
      [
        `You are looking for an apartment to rent for the next year. Apartment A is closer to campus and has its own laundry unit but limited storage. Apartment B has a lower monthly rent and a spacious floor plan, but it${APOSTROPHE}s an older building with outdated appliances.`,
        "Which apartment would you choose?",
        "Apartment A",
        "Apartment B",
      ],
      [
        "Your friend is getting married and has asked you to help them decide between two wedding venues. Venue A has a more convenient location and is less expensive, but it would require them to reduce their guest list to fit capacity limits. Venue B matches the style they envisioned and includes more equipment in the rental package, but it has limited weekend availability.",
        "Which venue would you recommend to your friend?",
        "Venue A",
        "Venue B",
      ],
      [
        "You are looking for a roommate for the next academic year. Roommate A has a similar sleep schedule and communicates well, but they like the temperature warmer than you do. Roommate B is taking many of the same classes as you and is very clean and tidy, but they frequently have friends over late at night.",
        "Which roommate would you choose?",
        "Roommate A",
        "Roommate B",
      ],
    ],
    III: [
      [
        "You are deciding between two study abroad programs for the next semester. University A is located in a city where most people speak English and offers courses in your major, but you will not be able to work due to visa restrictions. University B has a lower overall program fee and is conveniently located for travel, but it has very limited housing availability.",
        "Which study abroad location would you choose?",
        "University A",
        "University B",
      ],
      [
        "You are purchasing a new laptop for school and personal use. Laptop A has a large, high-resolution display and comes with an extended warranty, but its battery life is shorter than alternatives. Laptop B is lightweight and has a touchscreen feature, but the storage is limited.",
        "Which laptop would you buy?",
        "Laptop A",
        "Laptop B",
      ],
      [
        `You are looking for a new church community. Church A has an active small group program and you really enjoy the sermons, but there are a few theological points you${APOSTROPHE}ve disagreed with. Church B has a worship style you${APOSTROPHE}re more used to and a large community of members your age, but due to the size, it${APOSTROPHE}s easy to go unnoticed.`,
        "Which church would you attend?",
        "Church A",
        "Church B",
      ],
      [
        "You have been offered two internships for the upcoming summer. Internship A is with a nationally recognized organization and has both in-person and remote options, but it is primarily observational rather than hands-on. Internship B provides structured mentorship and has the possibility of a full-time job after graduation, but it is unpaid.",
        "Which internship would you accept?",
        "Internship A",
        "Internship B",
      ],
      [
        "Your company is deciding between two candidates for a team marketing position. Candidate A has five years of relevant experience and excellent references, but they are used to working independently. Candidate B is a recent graduate of a reputable marketing program and has demonstrated an eagerness to learn, but they have yet to manage the workload the position requires.",
        "Which candidate would you hire?",
        "Candidate A",
        "Candidate B",
      ],
    ],
  } as const;

  const phases = [
    ["I", phaseIScenarios, expected.I],
    ["II", phaseIIScenarios, expected.II],
    ["III", phaseIIIScenarios, expected.III],
  ] as const;

  for (const [phase, scenarios, rows] of phases) {
    rows.forEach((row, index) => {
      const scenario = scenarios[index];
      assert.equal(scenario.text, row[0], `Phase ${phase} scenario ${index + 1} text`);
      assert.equal(scenario.question, row[1], `Phase ${phase} scenario ${index + 1} question`);
      assert.equal(scenario.option1, row[2], `Phase ${phase} scenario ${index + 1} option 1`);
      assert.equal(scenario.option2, row[3], `Phase ${phase} scenario ${index + 1} option 2`);
      assert.equal(scenario.text.includes(scenario.question), false);
      assert.doesNotMatch(scenario.text, /Placeholder/);
      assert.doesNotMatch(scenario.option1, /Placeholder/);
    });
  }
});
