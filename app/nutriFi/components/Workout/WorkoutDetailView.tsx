import { exercise } from '@/hooks/Workout/workout_hook';
import { router } from 'expo-router';
import React from 'react'
import { 
    ScrollView,
    Text,
    Image,
    View,
    TouchableOpacity,
    StyleSheet

 } from 'react-native';

type WorkoutCardProps = {
    exercise: exercise;
    exerciseDetail: any;
};


const WorkoutDetailView = ({exercise, exerciseDetail}: WorkoutCardProps) => {
  return (
    <ScrollView style={styles.container}>
      <Image source={{uri:exercise.image_url}} style={styles.image}/>
      <Text style={styles.title}>{exercise.name}</Text>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Muscles</Text>
          {exerciseDetail?.data?.targetMuscles.map((muscle:any,index:number) => (
              <Text style={styles.ingredient} key={index}>{muscle}</Text>
          ))}
      </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exerciseDetail?.data?.instructions?.map((step: string, index: number) => (
              <View style={styles.step} key={index}>
                  <Text style={styles.stepNumber}>Step {index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
              </View>
          ))}
      </View>
      <TouchableOpacity 
      onPress={() => router.push({
        pathname: '/workout/session/[exercise]',
        params: { exercise: exercise?.name ?? "",  exerciseId: String(exercise?.id)},
    })}
      style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Attempt exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default WorkoutDetailView

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#ffffff"
    },
    image:{
        width:"100%",
        height:300,
        resizeMode:"cover"
    },
    title:{
        fontSize:25,
        fontWeight:"bold",
        textAlign:"center",
        marginVertical:20,
        color:"#333333"
    },
    section:{
        padding:20
    },
    sectionTitle:{
        fontSize:22,
        fontWeight:"600",
        color:"#3981f6",
        marginBottom:10
    },
    ingredient:{
        fontSize:16,
        color:"#6c727e",
        marginBottom:5,
    },
    step:{
        marginBottom:15,
    },
    stepNumber:{
        fontSize:15,
        fontWeight:"bold",
        color:"#3981f6"
    },
    stepText:{
        fontSize:15,
        color:"#6c727e"
    },
    saveButton:{
        backgroundColor:"#3981f6",
        padding:15,
        borderRadius:25,
        margin:20,
        alignItems:"center"
    },
    saveButtonText:{
        color:"#fff",
        fontSize:16,
        fontWeight:"bold"
    }
  });
  
  