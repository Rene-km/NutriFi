import { mealPlanResult } from '@/utils/utils';
import React, { useState } from 'react'


const useSavedViewHook = () => {

    const [modalVisible, setModalVisible] = useState(false);
    const [modalPlan, setModalPlan] = useState<mealPlanResult | null>(null);
    const [savedViewTab, setSavedViewTab] = useState<0 | 1>(0);
  
  
  return { modalVisible, setModalVisible, modalPlan, setModalPlan, savedViewTab, setSavedViewTab };   
    
}

export default useSavedViewHook          