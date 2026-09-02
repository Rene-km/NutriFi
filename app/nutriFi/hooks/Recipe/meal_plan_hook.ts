import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { SubmitHandler } from 'react-hook-form';
import { mealPlanResult } from '@/utils/utils';
import { deleteMealPlan, saveMealPlan } from '@/lib/api';
import { useMealPlanStore } from '@/stores/mealPlanStore';

type MealPlanInputs = {
  goal: string;
  days: '1' | '2' | '3';
  mealsPerDay: '2' | '3' | '4';
  anythingElse: string;
};

type MealPlanHookProps = {
  mealPlan: mealPlanResult | null;
  modalVisible: boolean;
  profile: string | null;
  onGenerateMealPlan: (data: MealPlanInputs) => void | Promise<void>;
};

const useMealPlanHook = ({ mealPlan, modalVisible, profile, onGenerateMealPlan }: MealPlanHookProps) => {
  const [previewDay, setPreviewDay] = useState<number>(1);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const isLoading = useRef(false);

  const addPlan = useMealPlanStore((state) => state.addPlan);
  const removePlan = useMealPlanStore((state) => state.removePlan);

  const isSaved = !isDeleted && (!!mealPlan?.id || savedId !== null);

  useEffect(() => {
    if (modalVisible) {
      setIsDeleted(false);
      setSavedId(null);
    }
    if (modalVisible && mealPlan?.days?.length) {
      setPreviewDay(mealPlan.days[0].day);
    }
  }, [modalVisible, mealPlan]);

  const onSubmit: SubmitHandler<MealPlanInputs> = async (data) => {
    await onGenerateMealPlan(data);
  };

  const navigateToRecipe = (recipeId: number, title: string, image: string, closeModal?: () => void) => {
    closeModal?.();
    setTimeout(() => {
      router.push({
        pathname: '/recipe/[id]',
        params: { id: String(recipeId), title: title ?? '', image: image ?? '' },
      });
    }, 150);
  };

  const handleSavePlan = async () => {
    if (!mealPlan || !profile || isSaved || isLoading.current) return;
    isLoading.current = true;
    try {
      const id = await saveMealPlan(mealPlan, profile);
      setSavedId(id);
      addPlan({ ...mealPlan, id });
    } finally {
      isLoading.current = false;
    }
  };

  const handleDeletePlan = async () => {
    const id = mealPlan?.id ?? savedId;
    if (!id || !profile || isLoading.current) return;
    isLoading.current = true;
    try {
      await deleteMealPlan(id, profile);
      setIsDeleted(true);
      setSavedId(null);
      removePlan(id);
    } finally {
      isLoading.current = false;
    }
  };

  return { previewDay, setPreviewDay, onSubmit, navigateToRecipe, isSaved, handleSavePlan, handleDeletePlan };
};

export default useMealPlanHook;
