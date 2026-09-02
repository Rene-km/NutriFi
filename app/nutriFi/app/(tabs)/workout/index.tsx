import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutHook, type exercise } from "../../../hooks/Workout/workout_hook";
import WorkoutCard from "@/components/Workout/WorkoutCard";

export default function Workout() {
  const { excercises } = useWorkoutHook();


    return (



        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5'}}>
     

        <View style={styles.header}>
        
         
          <Text style={styles.headerTitle}>Exercises</Text>

        
        </View>
        <View style={styles.container}>
        <FlatList
                data={excercises}
                keyExtractor={(item: exercise) => item.id.toString()}
               
                
                renderItem={({ item }) => (
                    <WorkoutCard
                    exercise={item}
                    />
                )}
            />

        </View>
      
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        
      backgroundColor: "#f5f5f5",
      flex: 1,
      padding: 24,
      justifyContent: 'center'
        
    },

    header: {
        paddingHorizontal: 16,
        marginBottom: 12,
      },
      headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1d1d1d',
        marginTop: 12
      },
      row: {
        justifyContent: 'space-between',
        marginBottom: 12,
      },
      flatlist: {
        flex: 1,
        justifyContent: 'center'
      }

})
