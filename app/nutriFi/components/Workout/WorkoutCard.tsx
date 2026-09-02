import { exercise } from '@/hooks/Workout/workout_hook';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';

type WorkoutCardProps = {
    exercise: exercise;
};

export default function WorkoutCard({ exercise }: WorkoutCardProps) {
    return (
        
        <TouchableOpacity
            style={styles.itemWrapper}
            key={exercise.id}
            onPress={() => router.push({
                pathname: '/workout/[exercise]',
                params: { exercise: exercise.name },
            })}
        >
            <View style={styles.card}>
                <Image
                    alt=""
                    resizeMode="cover"
                    style={styles.cardImg}
                    source={{ uri: exercise.image_url }}
                />
            </View>
            <Text style={styles.cardTitle}>
           {exercise.name}
         </Text>
        </TouchableOpacity>
         
      
       
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardImg: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#232425',
        flexShrink: 1,
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 4
      },
    itemWrapper: {
        width: '75%',
        alignSelf: 'center'
    },
});