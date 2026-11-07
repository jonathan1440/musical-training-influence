import type { Metadata } from "next";
import { Questionnaire } from "./questionnaire";

export const metadata: Metadata = {
  title: "Effect of Repeated AI Usage on Decision Making Speed",
};

export default function AiDecisionStudyPage() {
  return <Questionnaire />;
}
