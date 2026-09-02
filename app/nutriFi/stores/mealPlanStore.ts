import { mealPlanResult } from "@/utils/utils";
import { create } from "zustand";

type MealPlanStore = {
  plans: mealPlanResult[];
  setPlans: (plans: mealPlanResult[]) => void;
  addPlan: (plan: mealPlanResult) => void;
  removePlan: (id: string) => void;
};

export const useMealPlanStore = create<MealPlanStore>((set) => ({
  plans: [],
  setPlans: (plans) => set({ plans }),
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
  removePlan: (id) =>
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
}));
