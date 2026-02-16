import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConversationPhase, ExtractedData } from "@/lib/gemini";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface RecommendationItem {
  courseId: string;
  courseName: string;
  matchScore: number;
  matchReasons: string[];
  category: string;
  description: string;
  format: string;
  levels: string[];
}

interface QuestionnaireState {
  // Chat messages
  messages: ChatMessageItem[];
  // Current conversation phase
  phase: ConversationPhase;
  // Extracted structured data from AI
  extracted: ExtractedData;
  // AI-generated recommendations
  recommendations: RecommendationItem[];
  // Programs the user has selected from recommendations
  selectedPrograms: string[];
  // Meeting datetime picked by the user
  meetingDatetime: string | null;
  // Whether the AI is currently thinking
  isLoading: boolean;
  // Whether recommendations have been shown
  recommendationsShown: boolean;

  // Actions
  addMessage: (msg: Omit<ChatMessageItem, "id" | "timestamp">) => void;
  setPhase: (phase: ConversationPhase) => void;
  setExtracted: (data: ExtractedData) => void;
  setRecommendations: (recs: RecommendationItem[]) => void;
  toggleProgram: (programId: string) => void;
  setMeetingDatetime: (datetime: string) => void;
  setIsLoading: (loading: boolean) => void;
  setRecommendationsShown: (shown: boolean) => void;
  reset: () => void;
}

const initialState = {
  messages: [] as ChatMessageItem[],
  phase: "greeting" as ConversationPhase,
  extracted: {} as ExtractedData,
  recommendations: [] as RecommendationItem[],
  selectedPrograms: [] as string[],
  meetingDatetime: null as string | null,
  isLoading: false,
  recommendationsShown: false,
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...msg,
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: Date.now(),
            },
          ],
        })),

      setPhase: (phase) => set({ phase }),

      setExtracted: (data) =>
        set((state) => ({
          extracted: { ...state.extracted, ...data },
        })),

      setRecommendations: (recs) => set({ recommendations: recs }),

      toggleProgram: (programId) =>
        set((state) => ({
          selectedPrograms: state.selectedPrograms.includes(programId)
            ? state.selectedPrograms.filter((id) => id !== programId)
            : [...state.selectedPrograms, programId],
        })),

      setMeetingDatetime: (datetime) => set({ meetingDatetime: datetime }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setRecommendationsShown: (shown) => set({ recommendationsShown: shown }),

      reset: () => set(initialState),
    }),
    {
      name: "questionnaire-storage",
    }
  )
);
