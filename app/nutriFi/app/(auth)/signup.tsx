import { View, Text, TextInput, Button, Pressable, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, router } from "expo-router";
import useSignupHook from "@/hooks/Auth/signup_hook";
import SignupPage from "@/components/Auth/SignupPage";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type Goal = "lose_weight" | "build_muscle" | "maintain" | "improve_fitness";

export default function Signup() {
 

  const {
    fullName, setFullName, phone, setPhone,
    gender, setGender, goal, setGoal,
    age, setAge, heightCm, setHeightCm, weightKg, setWeightKg,
    email, setEmail, password, setPassword,
    msg, loading, onSignup,
  } = useSignupHook();

  return (
    <SignupPage fullName={fullName} setFullName={setFullName} phone={phone} setPhone={setPhone}
     gender={gender} setGender={setGender} goal={goal} 
     setGoal={setGoal} age={age} setAge={setAge} heightCm={heightCm}
      setHeightCm={setHeightCm} weightKg={weightKg} 
      setWeightKg={setWeightKg} email={email} setEmail={setEmail} password={password}
       setPassword={setPassword} msg={msg} loading={loading} onSignup={onSignup} />
  );
}

