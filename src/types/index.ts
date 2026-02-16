// Types for the application

export type AvatarCountry = "default" | "germany" | "italy" | "spain" | "belgium" | "turkey";

export type Goal = "study_abroad" | "job" | "training";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Country = "germany" | "italy" | "spain" | "belgium" | "turkey";

export interface QuestionnaireData {
  goal: Goal | null;
  country: Country | null;
  englishLevel: CEFRLevel | null;
  nativeLevel: CEFRLevel | null;
  selectedPrograms: string[];
  meetingDatetime: string | null;
}

export interface CourseData {
  id: string;
  name: string;
  description: string;
  price: number | null;
  format: string;
  capacity: string;
  levels: string[];
  duration: Record<string, string>;
  curriculum_highlights: string[];
  countries: string[];
  category: string;
}

export interface AusbildungField {
  id: string;
  name: string;
  roles: string[];
  duration: string;
  requirements: string[];
  salary_range: string;
}

export interface Recommendation {
  courseId: string;
  courseName: string;
  matchScore: number;
  matchReasons: string[];
  category: string;
}

export interface CountryInfo {
  name: string;
  code: Country;
  flag: string;
  nativeLanguage: string;
  coordinates: { x: number; y: number };
}

export const COUNTRIES: CountryInfo[] = [
  { name: "Germany", code: "germany", flag: "🇩🇪", nativeLanguage: "German", coordinates: { x: 51, y: 28 } },
  { name: "Italy", code: "italy", flag: "🇮🇹", nativeLanguage: "Italian", coordinates: { x: 53, y: 35 } },
  { name: "Spain", code: "spain", flag: "🇪🇸", nativeLanguage: "Spanish", coordinates: { x: 45, y: 34 } },
  { name: "Belgium", code: "belgium", flag: "🇧🇪", nativeLanguage: "French", coordinates: { x: 49, y: 28 } },
  { name: "Turkey", code: "turkey", flag: "🇹🇷", nativeLanguage: "Turkish", coordinates: { x: 62, y: 33 } },
];

export const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const GOALS: { value: Goal; label: string; description: string; icon: string }[] = [
  { value: "study_abroad", label: "Study Abroad", description: "Pursue higher education at international universities", icon: "🎓" },
  { value: "job", label: "Find Jobs / Ausbildung", description: "Vocational training and recruitment opportunities", icon: "💼" },
  { value: "training", label: "Professional Training", description: "Develop skills with specialized training programs", icon: "📚" },
];
