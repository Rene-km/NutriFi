import { mealPlanResult } from '@/utils/utils';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';


type PlanCardProps = {
    plan: mealPlanResult;
    setModalVisible: (visible: boolean) => void;
    setModalPlan: (plan: mealPlanResult) => void;
}

export default function PlanCard({plan, setModalVisible, setModalPlan}: PlanCardProps) {
   
    return (
        <TouchableOpacity
        key={plan.summary}
        onPress={() => {
        setModalPlan(plan)
        setModalVisible(true)
        }}>
        <View style={styles.card}>
          <Text style={styles.label}>Meal plan</Text>
          <Text style={styles.cardDay}>
            {plan.days.length} day plan
          </Text>
          <View style={styles.colourBadge}>
           
          </View>
          <Text style={styles.description}>{plan.summary}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  const styles = StyleSheet.create({
    container: {
      padding: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: '#1d1d1d',
      marginBottom: 12,
    },

    card: {
      position: 'relative',
      backgroundColor: '#fff',
      marginBottom: 12,
      padding: 16,
      borderRadius: 8,
      alignItems: 'flex-start',
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 1.2,
      color: '#b3b3b3',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    cardDay: {
      fontSize: 18,
      fontWeight: '700',
      color: '#2f2f2f',
      marginBottom: 12,
    },
    colourBadge: {
      backgroundColor: '#4b5666',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      marginBottom: 12,
    },
    description: {
      fontSize: 15,
      fontWeight: '500',
      color: '#848a96',
    },
    
  });