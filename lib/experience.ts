export type Role = {
  title: string;
  detail?: string;
  dates: string;
  points?: string[];
};

export const education: Role[] = [
  {
    title: "Southern Adventist University",
    detail: "Collegedale, TN · B.A. in Psychology and B.S. in Music · GPA 3.99",
    dates: "Expected May 2027",
  },
  {
    title: "Campus Adventiste du Salève",
    detail: "Collonges-sous-Salève, France · Study Abroad, French Language",
    dates: "Summer 2025",
  },
];

export const research: Role[] = [
  {
    title: "Research Assistant",
    detail: "Center for Learning Innovation and Research, SAU",
    dates: "2026 – present",
    points: [
      "Designed studies and methodologies, developed study materials, prepared IRB applications and revisions, and assisted with grant applications",
      "Held a team lead position for a study, coordinating research assistants, organizing meetings with faculty, and implementing procedures",
      "Conducted quantitative analyses, prepared qualitative data, and organized data coding and analysis plans",
      "Recruited and communicated with participants and collected data",
      "Assisted in establishing data management procedures and trained RAs in data processing, electronic lab notebooks, and survey tools",
      "Provided statistical consultation for a DNP student, assisting with a data analysis plan and report",
    ],
  },
  {
    title: "Undergraduate Research Studies",
    dates: "2026 – present",
    points: [
      "Research Design & Statistics II: Independent research project on preferences for historical musical eras between musically trained and non-trained individuals",
      "Cognitive Psychology: Collaborative research project on the effect of repeated AI usage for cognitive offloading on decision making speed and confidence",
    ],
  },
];

export const presentations: string[] = [
  "Ziesmer, S. M. (2027, April). Beyond “Classical”: Music preferences across historical eras by musical training [Poster presentation submitted]. Southeastern Psychological Association Annual Meeting.",
  "Ziesmer, S. M. (2026, September 21). Music as an emotional regulator [Guest lecture]. Intro to Music & Health, Southern Adventist University.",
  "Ziesmer, S. M. (2026, July 17). Narrative identification in music: Implications for emotion regulation [Poster presentation]. Summer Undergraduate Research Education Program Conference, University of Georgia, Live virtual presentation.",
  "Ziesmer, S. M. (2026, April 16). From Renaissance to 20th century: The influence of musical training on historical music preferences [Poster presentation]. Campus Research Day, Southern Adventist University.",
];

export const teaching: Role[] = [
  {
    title: "Teaching Assistant",
    detail: "Statistics for Social Sciences, SAU",
    dates: "2026 – present",
    points: [
      "Taught lectures on an introduction to statistics and correlations and regressions",
      "Provide individual tutoring for students and assist them with course material in class",
      "Grade homework and tests, providing constructive feedback",
      "Maintain attendance records, gradebook, and online course platform",
      "Collaborate with two fellow teaching assistants to support course administration",
    ],
  },
  {
    title: "Teaching Assistant",
    detail: "Music Theory II, SAU",
    dates: "2026",
    points: [
      "Assisted students during class by explaining concepts and helping with assignments",
      "Graded homework in a timely manner and provided feedback to students",
      "Managed the course online platform, posting materials and updating the gradebook",
      "Ran errands and assisted the professor with course-related tasks",
    ],
  },
  {
    title: "Student Reader",
    detail: "General Chemistry I & II, SAU",
    dates: "2024 – 2025",
    points: [
      "Provided timely feedback on homework assignments",
      "Entered grades into the professor’s gradebook",
    ],
  },
];

export const professional: Role[] = [
  {
    title: "Office Worker",
    detail: "School of Music, SAU",
    dates: "2024 – present",
    points: [
      "Compile and maintain physical and digital records, improving organization and accessibility",
      "Respond to student, faculty, and community needs and inquiries",
      "Serve as head usher for concerts and recitals, working with stage managers, performers, and attendees",
      "Design and prepare programs for concerts and recitals",
    ],
  },
  {
    title: "Office Worker",
    detail: "Dakota Adventist Camps",
    dates: "Summers 2023 – 2024",
    points: [
      "Created staff and camper schedules, ensuring smooth daily operations",
      "Managed online camper registration as well as check-in and check-out processes",
      "Processed and categorized receipts for reconciliation",
    ],
  },
];

export const music: Role[] = [
  {
    title: "Volunteer Violinist",
    detail: "His Symphony Orchestra, Ooltewah Adventist Church",
    dates: "2025",
    points: ["Provided musical support and mentorship for younger orchestra members"],
  },
  {
    title: "Co-Composer",
    detail: "Deep Space, Original Short Film Score",
    dates: "2025",
    points: ["Received Best Original Score at Indie Short Fest"],
  },
  {
    title: "Principal Second Violin",
    detail: "SAU Symphony Orchestra",
    dates: "2023 – 2025",
    points: [
      "Led sectionals and provided support and communication for the 2nd violin section",
      "Collaborated with other section leaders to implement ensemble preparation",
    ],
  },
  {
    title: "Worship Leader",
    detail: "Collegedale Seventh-day Adventist Church",
    dates: "2023 – present",
    points: ["Lead worship for the Renewal service piano and vocals"],
  },
  {
    title: "Composer",
    detail: "Seventeen, Original Symphonic Composition",
    dates: "2023",
    points: ["Premiered at Carnegie Hall, New York City"],
  },
];

export const awards: Role[] = [
  {
    title: "Distinguished Dean’s List",
    detail: "SAU",
    dates: "2023 – present",
  },
  {
    title: "Full Tuition Scholarship",
    detail: "SAU",
    dates: "2023 – present",
    points: ["Awarded based on standardized test scores (SAT: 1530; ACT: 35)"],
  },
];

export const skills = [
  "Statistical Analysis: SPSS, G*Power",
  "Data Management: SciNote",
  "Participant Pool Software: Sona",
  "Productivity Software: Microsoft Office",
];

export const coursework = [
  "Research Design & Statistics I & II",
  "Social Psychology",
  "Cognitive Psychology",
  "Psychological Testing",
  "Developmental Psychology",
  "Personality Theories",
  "History & Systems of Psychology",
];

export const affiliations: Role[] = [
  {
    title: "Psi Chi, The International Honor Society in Psychology",
    detail: "Secretary",
    dates: "2026 – present",
  },
  {
    title: "American Psychological Association",
    detail: "Member",
    dates: "2026 – present",
  },
];
