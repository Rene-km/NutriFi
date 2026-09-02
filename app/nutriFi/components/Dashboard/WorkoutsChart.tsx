import { View, Text, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import { BarChart } from "react-native-gifted-charts";
import Card from "../Card";

export default function WorkoutChart() {
    const barData = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
  
    return (
      
      
      <Card>
      <BarChart data={barData}/>
        
      </Card>

      



      
    );
  }
  
  
  const styles = StyleSheet.create({
    card: {
      marginBottom: 18,
      borderRadius: 18,
      padding: 18,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4
    }
  
  })

