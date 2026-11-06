"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { ConsentCopy } from "@/components/consent-copy";
import { AI_STUDY_SCRIPT_URL } from "@/lib/ai-study-config";
import { phaseIScenarios, phaseIIScenarios, phaseIIIScenarios, PHASE_I_COUNT, PHASE_II_COUNT } from "@/lib/scenarios";
import {
  AGE_OPTIONS,
  AI_DECISION_OPTIONS,
  AI_FREQUENCY_OPTIONS,
  AI_PRIMARY_USE_OPTIONS,
  CONFIDENCE_OPTIONS,
  CONFIDENCE_QUESTION,
  GENDER_OPTIONS,
  GROUP_OPTIONS,
  GROUP_QUESTION,
  buildSteps,
  buildSubmission,
  completionParagraphs,
  completionSubject,
  consentCanContinue,
  demographicsComplete,
  phaseIInstructionParagraphs,
  phaseIIInstructionParagraphs,
  phaseIIIInstructionParagraphs,
  type Group,
  type PhaseChoiceAnswer,
  type PhaseTimedAnswer,
  type SessionRecord,
} from "@/lib/study-flow";

const HANDOFF_EMAIL = "susannaziesmer@southern.edu";

function RadioOptions({
  name,
  legend,
  options,
  value,
  onChange,
  invalid,
  layout,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  layout: "pills" | "choices";
}) {
  return (
    <div className={`field${invalid ? " has-error" : ""}`}>
      <p className="field-label" id={`${name}-label`}>
        {legend}
      </p>
      <div className={layout === "pills" ? "pill-group" : "choice-list"} role="radiogroup" aria-labelledby={`${name}-label`}>
        {options.map((option) => {
          const id = `${name}-${option.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
          return (
            <span key={option}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              <label htmlFor={id}>{option}</label>
            </span>
          );
        })}
      </div>
      <div className="field-error">Please select an option.</div>
    </div>
  );
}

function InstructionBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="card">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export function Questionnaire() {
  const steps = useMemo(() => buildSteps(PHASE_I_COUNT, PHASE_II_COUNT), []);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [consent, setConsent] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [aiFrequency, setAiFrequency] = useState("");
  const [aiPrimaryUse, setAiPrimaryUse] = useState("");
  const [aiDecisionFrequency, setAiDecisionFrequency] = useState("");
  const [group, setGroup] = useState<Group | "">("");
  const [phase1, setPhase1] = useState<PhaseTimedAnswer[]>([]);
  const [phase2, setPhase2] = useState<PhaseChoiceAnswer[]>([]);
  const [phase3, setPhase3] = useState<PhaseTimedAnswer[]>([]);
  const [selected, setSelected] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const submitted = useRef(false);
  const renderedIndex = useRef(-1);
  const t0 = useRef(0);

  const step = steps[index];
  const timed = step.kind === "decision" && step.timed;
  if (renderedIndex.current !== index) {
    renderedIndex.current = index;
    t0.current = timed ? performance.now() : 0;
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 5000);
  }

  async function send(record: SessionRecord) {
    if (submitted.current) return;
    submitted.current = true;
    if (!AI_STUDY_SCRIPT_URL) {
      showToast("The response sheet is not connected, so this session was not saved. Tell a researcher.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch(AI_STUDY_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSubmission(record, new Date().toISOString())),
      });
    } catch {
      showToast("There was a problem submitting. Your responses may not have been recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  function goTo(nextIndex: number) {
    setShowError(false);
    setSelected("");
    setIndex(nextIndex);
    window.scrollTo(0, 0);
  }

  function onAdvance() {
    if (step.kind === "consent") {
      const gate = consentCanContinue(consent, fullName);
      if (gate === "incomplete") {
        setShowError(true);
        return;
      }
      if (gate === "stop") {
        setStopped(true);
        window.scrollTo(0, 0);
        return;
      }
      goTo(index + 1);
      return;
    }

    if (step.kind === "demographics") {
      const complete = demographicsComplete({
        age,
        gender,
        aiFrequency,
        aiPrimaryUse,
        aiDecisionFrequency,
        group,
      });
      if (!complete || (group !== "Control" && group !== "Experimental")) {
        setShowError(true);
        return;
      }
      goTo(index + 1);
      return;
    }

    if (step.kind === "instructions") {
      goTo(index + 1);
      return;
    }

    if (!selected) {
      setShowError(true);
      return;
    }

    if (step.kind === "decision") {
      if (step.phase === 1) {
        const seconds = Math.round((performance.now() - t0.current) / 100) / 10;
        setPhase1((current) => {
          const next = [...current];
          next[step.index] = { choice: selected, confidence: current[step.index]?.confidence ?? "", seconds };
          return next;
        });
      } else if (step.phase === 2) {
        setPhase2((current) => {
          const next = [...current];
          next[step.index] = { choice: selected };
          return next;
        });
      } else {
        const seconds = Math.round((performance.now() - t0.current) / 100) / 10;
        setPhase3((current) => {
          const next = [...current];
          next[step.index] = { choice: selected, confidence: current[step.index]?.confidence ?? "", seconds };
          return next;
        });
      }
      goTo(index + 1);
      return;
    }

    if (step.kind === "confidence") {
      const nextPhase1 =
        step.phase === 1
          ? phase1.map((item, itemIndex) =>
              itemIndex === step.index ? { ...item, confidence: selected } : item,
            )
          : phase1;
      const nextPhase3 =
        step.phase === 3
          ? phase3.map((item, itemIndex) =>
              itemIndex === step.index ? { ...item, confidence: selected } : item,
            )
          : phase3;
      if (step.phase === 1) setPhase1(nextPhase1);
      if (step.phase === 3) setPhase3(nextPhase3);

      const nextIndex = index + 1;
      if (steps[nextIndex]?.kind === "completion" && (group === "Control" || group === "Experimental")) {
        const record: SessionRecord = {
          fullName: fullName.trim(),
          age,
          gender,
          aiFrequency,
          aiPrimaryUse,
          aiDecisionFrequency,
          group,
          phase1: nextPhase1,
          phase2,
          phase3: nextPhase3,
        };
        void send(record);
      }
      goTo(nextIndex);
    }
  }

  const progress = (index / (steps.length - 1)) * 100;
  const pageLabel = `Page ${index + 1} of ${steps.length}`;

  if (stopped) {
    return (
      <div className="wrapper">
        <p className="home-link">
          <a href="/">Susanna Ziesmer</a>
        </p>
        <h1 className="study-title">Effect of Repeated AI Usage on Decision Making Speed</h1>
        <p className="study-meta">Research Study</p>
        <h2 className="section-label">Study information</h2>
        <div className="card" data-page="stopped">
          <p>You selected No. The study stops here, and nothing was saved.</p>
        </div>
      </div>
    );
  }

  let body: ReactNode = null;
  let action = "Next";
  let pageName: string = step.kind;
  let branch = "";

  if (step.kind === "consent") {
    pageName = "consent";
    body = (
      <>
        <h2 className="section-label">Study information</h2>
        <ConsentCopy />
        <div className="card">
          <RadioOptions
            name="consent"
            legend="Please select below if you agree to participate in this study or not:"
            options={["Yes", "No"]}
            value={consent}
            onChange={(value) => {
              setConsent(value);
              setShowError(false);
            }}
            invalid={showError && consent !== "Yes" && consent !== "No"}
            layout="pills"
          />
          <div className={`field${showError && !fullName.trim() ? " has-error" : ""}`}>
            <label className="field-label" htmlFor="full-name">
              Please type your full name below to act as your signature.
            </label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setShowError(false);
              }}
            />
            <div className="field-error">Please type your full name.</div>
          </div>
        </div>
      </>
    );
  } else if (step.kind === "demographics") {
    pageName = "demographics";
    body = (
      <>
        <h2 className="section-label">Demographic information</h2>
        <div className="card">
          <RadioOptions name="age" legend="Age" options={AGE_OPTIONS} value={age} onChange={(value) => { setAge(value); setShowError(false); }} invalid={showError && !age} layout="pills" />
          <RadioOptions name="gender" legend="Gender" options={GENDER_OPTIONS} value={gender} onChange={(value) => { setGender(value); setShowError(false); }} invalid={showError && !gender} layout="pills" />
          <RadioOptions name="ai-frequency" legend="How frequently do you use generative AI (e.g. ChatGPT, Claude, Gemini)?" options={AI_FREQUENCY_OPTIONS} value={aiFrequency} onChange={(value) => { setAiFrequency(value); setShowError(false); }} invalid={showError && !aiFrequency} layout="pills" />
          <RadioOptions name="ai-primary" legend="What do you primarily use generative AI for?" options={AI_PRIMARY_USE_OPTIONS} value={aiPrimaryUse} onChange={(value) => { setAiPrimaryUse(value); setShowError(false); }} invalid={showError && !aiPrimaryUse} layout="pills" />
          <RadioOptions name="ai-decisions" legend="How often do you use generative AI to help you make decisions?" options={AI_DECISION_OPTIONS} value={aiDecisionFrequency} onChange={(value) => { setAiDecisionFrequency(value); setShowError(false); }} invalid={showError && !aiDecisionFrequency} layout="pills" />
          <RadioOptions name="group" legend={GROUP_QUESTION} options={GROUP_OPTIONS} value={group} onChange={(value) => { setGroup(value as Group); setShowError(false); }} invalid={showError && group !== "Control" && group !== "Experimental"} layout="pills" />
        </div>
      </>
    );
  } else if (step.kind === "instructions") {
    pageName = `instructions-${step.phase}`;
    action = "Begin";
    const branchGroup: Group = group === "Experimental" ? "Experimental" : "Control";
    branch = step.phase === 1 ? "" : branchGroup;
    const paragraphs =
      step.phase === 1
        ? phaseIInstructionParagraphs(PHASE_I_COUNT)
        : step.phase === 2
          ? phaseIIInstructionParagraphs(PHASE_II_COUNT, branchGroup)
          : phaseIIIInstructionParagraphs(PHASE_I_COUNT, branchGroup);
    body = (
      <>
        <h2 className="section-label">{`Phase ${step.phase === 1 ? "I" : step.phase === 2 ? "II" : "III"} instructions`}</h2>
        <InstructionBody paragraphs={paragraphs} />
      </>
    );
  } else if (step.kind === "decision") {
    pageName = `decision-${step.phase}-${step.index}`;
    const scenario =
      step.phase === 1 ? phaseIScenarios[step.index] : step.phase === 2 ? phaseIIScenarios[step.index] : phaseIIIScenarios[step.index];
    body = (
      <>
        <p className="scenario-kicker">{scenario.label}</p>
        <div className="card">
          <p>{scenario.text}</p>
          <RadioOptions
            name={`choice-${step.phase}-${step.index}`}
            legend="Choose one option."
            options={[scenario.option1, scenario.option2]}
            value={selected}
            onChange={(value) => {
              setSelected(value);
              setShowError(false);
            }}
            invalid={showError && !selected}
            layout="choices"
          />
        </div>
      </>
    );
  } else if (step.kind === "confidence") {
    pageName = `confidence-${step.phase}-${step.index}`;
    body = (
      <>
        <h2 className="section-label">Confidence</h2>
        <div className="card">
          <RadioOptions
            name={`confidence-${step.phase}-${step.index}`}
            legend={CONFIDENCE_QUESTION}
            options={CONFIDENCE_OPTIONS}
            value={selected}
            onChange={(value) => {
              setSelected(value);
              setShowError(false);
            }}
            invalid={showError && !selected}
            layout="pills"
          />
        </div>
      </>
    );
  } else {
    pageName = "completion";
    const branchGroup: Group = group === "Experimental" ? "Experimental" : "Control";
    branch = branchGroup;
    const paragraphs = completionParagraphs(branchGroup, fullName);
    body = (
      <>
        <h2 className="section-label">Study completion</h2>
        <div className="card">
          {paragraphs.map((paragraph) => (
            <CompletionParagraph key={paragraph} text={paragraph} fullName={fullName} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        className="wrapper"
        data-page={pageName}
        data-timed={timed ? "yes" : "no"}
        data-branch={branch}
      >
        <p className="home-link">
          <a href="/">Susanna Ziesmer</a>
        </p>
        <h1 className="study-title">Effect of Repeated AI Usage on Decision Making Speed</h1>
        <p className="study-meta">Research Study · {pageLabel}</p>
        {body}
        {step.kind !== "completion" ? (
          <div className="btn-row">
            <button className="btn btn-primary" type="button" onClick={onAdvance} disabled={submitting}>
              {action}
            </button>
          </div>
        ) : null}
      </div>
      <div className={`overlay${submitting ? " visible" : ""}`}>
        <div className="overlay-spinner" />
        <div className="overlay-text">Submitting your responses...</div>
      </div>
      <div className={`toast${toast ? " visible" : ""}`} role="status">
        {toast}
      </div>
    </>
  );
}

function CompletionParagraph({ text, fullName }: { text: string; fullName: string }) {
  const parts = text.split(HANDOFF_EMAIL);
  if (parts.length === 1) return <p>{text}</p>;
  const href = `mailto:${HANDOFF_EMAIL}?subject=${encodeURIComponent(completionSubject(fullName))}`;
  return (
    <p>
      {parts[0]}
      <a href={href}>{HANDOFF_EMAIL}</a>
      {parts[1]}
    </p>
  );
}
