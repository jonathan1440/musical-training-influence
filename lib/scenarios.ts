/**
 * Scenario counts and wording for the AI decision study.
 *
 * Edit PHASE_I_COUNT, PHASE_II_COUNT, and the drafts in this file.
 * Phase III always uses PHASE_I_COUNT. Instruction pages read these numbers.
 *
 * The drafts below are the study text. An empty draft, or a count higher
 * than the number of drafts, uses the placeholder constants.
 */

export const PHASE_I_COUNT = 5;
export const PHASE_II_COUNT = 10;

export const PLACEHOLDER_SCENARIO =
  "Placeholder. Scenario text is not written yet. Jonathan will edit this later.";

export const PLACEHOLDER_QUESTION = "Choose one option.";

export const PLACEHOLDER_OPTION_1 =
  "Option 1. Placeholder label. Jonathan will edit this later.";

export const PLACEHOLDER_OPTION_2 =
  "Option 2. Placeholder label. Jonathan will edit this later.";

export type Scenario = {
  id: string;
  label: string;
  text: string;
  question: string;
  option1: string;
  option2: string;
};

type ScenarioDraft = {
  text?: string;
  question?: string;
  option1?: string;
  option2?: string;
};

const phaseIDrafts: ScenarioDraft[] = [
  {
    text: "You got accepted into two graduate programs and have to submit your decisions. University A is highly reputable and offered a full ride assistantship position, but the professor you wanted to work with is retiring soon. University B is better aligned with your career goals and located near family, but the program will take an additional year to complete.",
    question: "Which graduate program would you choose?",
    option1: "University A",
    option2: "University B",
  },
  {
    text: "You are buying a used car. Car A has 100,000 miles on it but a clean vehicle history, and it has the storage and passenger capacity you need. Car B includes all the interior features you wanted and has great gas mileage, but it requires a high monthly payment.",
    question: "Which car would you buy?",
    option1: "Car A",
    option2: "Car B",
  },
  {
    text: "You are looking for a gym to join and have narrowed your options down to two facilities. Gym A offers a wide variety of fitness classes and has extensive equipment, but it is often crowded during peak hours. Gym B is open 24/7 and provides access to personal training consultations, but it is located across town.",
    question: "Which gym would you join?",
    option1: "Gym A",
    option2: "Gym B",
  },
  {
    text: "You have received two job offers after graduating from college. Company A offers a flexible work schedule and opportunities to travel internationally, but the position requires frequent overtime. Company B provides an extensive professional development program and great benefits, but the position involves a lengthy daily commute.",
    question: "Which job would you accept?",
    option1: "Company A",
    option2: "Company B",
  },
  {
    text: "You are registering for a course and have to choose between two professors. Professor A provides quick, helpful feedback on assignments and does not require attendance, but their exams are known to be particularly challenging. Professor B is known to be very approachable and utilizes a variety of teaching methods, but they assign frequent group projects.",
    question: "Which professor would you choose?",
    option1: "Professor A",
    option2: "Professor B",
  },
];

const phaseIIDrafts: ScenarioDraft[] = [
  {
    text: "You are choosing a bank to open a new checking account. Bank A has a higher interest rate on account balances and no monthly account fees, but there are very few physical branch locations near you. Bank B offers a sign-up bonus and has a convenient mobile banking app, but it requires a higher minimum balance to avoid additional charges.",
    question: "Which bank would you choose?",
    option1: "Bank A",
    option2: "Bank B",
  },
  {
    text: "You are looking to adopt a dog and are deciding between two breeds. Dog A is easy to train and doesn’t shed much, but it requires extensive daily exercise. Dog B has a calm, companionable temperament and can be left alone for long periods, but the breed is known to have health complications.",
    question: "Which dog would you adopt?",
    option1: "Dog A",
    option2: "Dog B",
  },
  {
    text: "You are considering moving to one of two cities after graduation. City A has an extensive public transportation system and you have friends who live in the area, but the cost of living is high. City B has a low crime rate and an active local community, but you will have fewer professional opportunities there.",
    question: "Which city would you move to?",
    option1: "City A",
    option2: "City B",
  },
  {
    text: "You are choosing a phone plan and have narrowed your options down to two providers. Plan A includes unlimited data and free international texting, but it requires a two-year contract. Plan B offers a generous monthly data allowance and allows you to upgrade your phone every year, but it has more limited network coverage.",
    question: "Which phone plan would you choose?",
    option1: "Plan A",
    option2: "Plan B",
  },
  {
    text: "Your friend group is deciding between two vacation spots. Location A has a wide variety of activities in the area and a large Airbnb, but it’s an 8-hour drive. Location B is supposed to have perfect weather and is hosting an event you’re all excited about, but the area is known to be very expensive.",
    question: "Which vacation spot would you choose?",
    option1: "Location A",
    option2: "Location B",
  },
  {
    text: "You need to decide on a major before registering for next semester’s classes. Major A has more opportunities to work with faculty and less demanding coursework, but it will require you to stay an extra semester. Major B has a more specific track focused on your career goals and extensive professional connections, but it leaves no room for exploring elective courses.",
    question: "Which major would you choose?",
    option1: "Major A",
    option2: "Major B",
  },
  {
    text: "You are booking flights for an upcoming trip. Flight A is cheaper and allows free seat selection, but you will have to drive two additional hours from the arrival airport to your final destination. Flight B is a direct flight and includes a free checked bag, but it arrives late at night.",
    question: "Which flight would you book?",
    option1: "Flight A",
    option2: "Flight B",
  },
  {
    text: "You are looking for an apartment to rent for the next year. Apartment A is closer to campus and has its own laundry unit but limited storage. Apartment B has a lower monthly rent and a spacious floor plan, but it’s an older building with outdated appliances.",
    question: "Which apartment would you choose?",
    option1: "Apartment A",
    option2: "Apartment B",
  },
  {
    text: "Your friend is getting married and has asked you to help them decide between two wedding venues. Venue A has a more convenient location and is less expensive, but it would require them to reduce their guest list to fit capacity limits. Venue B matches the style they envisioned and includes more equipment in the rental package, but it has limited weekend availability.",
    question: "Which venue would you recommend to your friend?",
    option1: "Venue A",
    option2: "Venue B",
  },
  {
    text: "You are looking for a roommate for the next academic year. Roommate A has a similar sleep schedule and communicates well, but they like the temperature warmer than you do. Roommate B is taking many of the same classes as you and is very clean and tidy, but they frequently have friends over late at night.",
    question: "Which roommate would you choose?",
    option1: "Roommate A",
    option2: "Roommate B",
  },
];

const phaseIIIDrafts: ScenarioDraft[] = [
  {
    text: "You are deciding between two study abroad programs for the next semester. University A is located in a city where most people speak English and offers courses in your major, but you will not be able to work due to visa restrictions. University B has a lower overall program fee and is conveniently located for travel, but it has very limited housing availability.",
    question: "Which study abroad location would you choose?",
    option1: "University A",
    option2: "University B",
  },
  {
    text: "You are purchasing a new laptop for school and personal use. Laptop A has a large, high-resolution display and comes with an extended warranty, but its battery life is shorter than alternatives. Laptop B is lightweight and has a touchscreen feature, but the storage is limited.",
    question: "Which laptop would you buy?",
    option1: "Laptop A",
    option2: "Laptop B",
  },
  {
    text: "You are looking for a new church community. Church A has an active small group program and you really enjoy the sermons, but there are a few theological points you’ve disagreed with. Church B has a worship style you’re more used to and a large community of members your age, but due to the size, it’s easy to go unnoticed.",
    question: "Which church would you attend?",
    option1: "Church A",
    option2: "Church B",
  },
  {
    text: "You have been offered two internships for the upcoming summer. Internship A is with a nationally recognized organization and has both in-person and remote options, but it is primarily observational rather than hands-on. Internship B provides structured mentorship and has the possibility of a full-time job after graduation, but it is unpaid.",
    question: "Which internship would you accept?",
    option1: "Internship A",
    option2: "Internship B",
  },
  {
    text: "Your company is deciding between two candidates for a team marketing position. Candidate A has five years of relevant experience and excellent references, but they are used to working independently. Candidate B is a recent graduate of a reputable marketing program and has demonstrated an eagerness to learn, but they have yet to manage the workload the position requires.",
    question: "Which candidate would you hire?",
    option1: "Candidate A",
    option2: "Candidate B",
  },
];

function takeScenarios(phase: "I" | "II" | "III", drafts: ScenarioDraft[], count: number): Scenario[] {
  return Array.from({ length: count }, (_, index) => {
    const draft = drafts[index] ?? {};
    const number = index + 1;
    return {
      id: `phase-${phase}-${number}`,
      label: `Scenario ${number}`,
      text: draft.text?.trim() || PLACEHOLDER_SCENARIO,
      question: draft.question?.trim() || PLACEHOLDER_QUESTION,
      option1: draft.option1?.trim() || PLACEHOLDER_OPTION_1,
      option2: draft.option2?.trim() || PLACEHOLDER_OPTION_2,
    };
  });
}

export const phaseIScenarios = takeScenarios("I", phaseIDrafts, PHASE_I_COUNT);
export const phaseIIScenarios = takeScenarios("II", phaseIIDrafts, PHASE_II_COUNT);
export const phaseIIIScenarios = takeScenarios("III", phaseIIIDrafts, PHASE_I_COUNT);
