import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestionnaireData, Goal, Country, CEFRLevel } from "@/types";

interface QuestionnaireState extends QuestionnaireData {
  currentStep: number;
  setGoal: (goal: Goal) => void;
  setCountry: (country: Country) => void;
  setEnglishLevel: (level: CEFRLevel) => void;
  setNativeLevel: (level: CEFRLevel) => void;
  setSelectedPrograms: (programs: string[]) => void;
  toggleProgram: (programId: string) => void;
  setMeetingDatetime: (datetime: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState: QuestionnaireData & { currentStep: number } = {
  goal: null,
  country: null,
  englishLevel: null,
  nativeLevel: null,
  selectedPrograms: [],
  meetingDatetime: null,
  currentStep: 0,
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      ...initialState,
      setGoal: (goal) => set({ goal }),
      setCountry: (country) => set({ country }),
      setEnglishLevel: (level) => set({ englishLevel: level }),
      setNativeLevel: (level) => set({ nativeLevel: level }),
      setSelectedPrograms: (programs) => set({ selectedPrograms: programs }),
      toggleProgram: (programId) =>
        set((state) => ({
          selectedPrograms: state.selectedPrograms.includes(programId)
            ? state.selectedPrograms.filter((id) => id !== programId)
            : [...state.selectedPrograms, programId],
        })),
      setMeetingDatetime: (datetime) => set({ meetingDatetime: datetime }),
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),
      reset: () => set(initialState),
    }),
    {
      name: "questionnaire-storage",
    }
  )
);
