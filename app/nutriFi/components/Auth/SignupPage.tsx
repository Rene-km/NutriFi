import { View, Text, TextInput, Button, Pressable, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, router } from "expo-router";
import useSignupHook from "@/hooks/Auth/signup_hook";
import Chip from "@/components/Chip";
import { Gender, Goal } from "@/app/(auth)/signup";




type SignupProps = {
  fullName: string;
  setFullName: (fullName: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  gender: Gender;
  setGender: (gender: Gender) => void;
  goal: Goal;
  setGoal: (goal: Goal) => void;
  age: string;
  setAge: (age: string) => void;
  heightCm: string;
  setHeightCm: (heightCm: string) => void;
  weightKg: string;
  setWeightKg: (weightKg: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  msg: string | null;
  loading: boolean;
  onSignup: () => void;
}
const SignupPage = ({ fullName, setFullName, phone, setPhone, gender, 
    setGender, goal, setGoal, age, setAge, heightCm, setHeightCm, 
    weightKg, setWeightKg, email, setEmail, password, 
    setPassword, msg, loading, onSignup }: SignupProps) => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#f5f5f5"}}>
    <ScrollView style={{flex:1}}>
  <View style={styles.container}>
    <View style={styles.header}>
    <Image
source={require("../../assets/images/NF_blue.png")}
alt="Logo"
accessibilityLabel="NutriFi logo"
style={styles.headerImg}
/>

<Text style={styles.title}
accessible={true}
testID="signup-title"
>Sign up to NutrFi</Text>
<Text style={styles.subtitle}>Create an account with NutriFi</Text>
      
    </View>
    <View style={{flex: 1}}>
    <View style={styles.input}>
    <Text style={styles.inputLabel}>Full name</Text>
    <TextInput
      placeholder="Full name"
      placeholderTextColor="#6b7280"
      value={fullName}
      onChangeText={setFullName}
      style={styles.inputControl}
      testID="fullname-input"
    />
    </View>
    <View style={styles.input}>
<Text style={styles.inputLabel}>Phone</Text>
    <TextInput
      placeholder="Phone (optional)"
      placeholderTextColor="#6b7280"
      keyboardType="phone-pad"
      value={phone}
      onChangeText={setPhone}
      style={styles.inputControl}
      testID="phone-input"
    />
</View>

    <View style={styles.input}>
    <Text style={styles.inputLabel}>Gender</Text>
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Chip label="Male" selected={gender === "male"} onPress={() => setGender("male")} 
        testID="gender-male-input"
      />
      <Chip label="Female" selected={gender === "female"} onPress={() => setGender("female")}
        testID="gender-female-input"
      />
      <Chip label="Other" selected={gender === "other"} onPress={() => setGender("other")}
        testID="gender-other-input"
      />
      <Chip
        label="Prefer not to say"
        selected={gender === "prefer_not_to_say"}
        onPress={() => setGender("prefer_not_to_say")}
        testID="gender-prefer-not-to-say-input"
      />
    </View>
    </View>

    <View style={styles.input}>
    <Text style={styles.inputLabel}>Goal</Text>
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Chip label="Lose weight" selected={goal === "lose_weight"} onPress={() => setGoal("lose_weight")}
        testID="goal-lose-weight-input"
      />
      <Chip label="Build muscle" selected={goal === "build_muscle"} onPress={() => setGoal("build_muscle")}
        testID="goal-build-muscle-input"
      />
      <Chip label="Maintain" selected={goal === "maintain"} onPress={() => setGoal("maintain")}
        testID="goal-maintain-input"
      />
      <Chip
        label="Improve fitness"
        selected={goal === "improve_fitness"}
        onPress={() => setGoal("improve_fitness")}
        testID="goal-improve-fitness-input"
      />
    </View>
    </View>

    <View style={styles.input}>
    <Text style={styles.inputLabel}>Measurements</Text>
    <View style={{ flexDirection: "row", gap: 10 }}>
      <TextInput
        placeholder="Age"
        placeholderTextColor="#6b7280"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
        style={styles.inputControl}
        testID="age-input"
        accessible={true}
      />
      <TextInput
        placeholder="Height (cm)"
        placeholderTextColor="#6b7280"
        keyboardType="number-pad"
        value={heightCm}
        onChangeText={setHeightCm}
        style={styles.inputControl}
        testID="height-input"
        accessible={true}
      />
      <TextInput
        placeholder="Weight (kg)"
        placeholderTextColor="#6b7280"
        keyboardType="number-pad"
        value={weightKg}
        onChangeText={setWeightKg}
        style={styles.inputControl}
        testID="weight-input"
        accessible={true}
      />
    </View>
    </View>

    <View style={styles.input}>
    <Text style={styles.inputLabel}>Email address</Text>
    <TextInput
      autoCapitalize="none"
      placeholder="Email"
      placeholderTextColor="#6b7280"
      value={email}
      onChangeText={setEmail}
      style={styles.inputControl}
      testID="email-input"
      accessible={true}
    />
    </View>

    <View style={styles.input}>
    <Text style={styles.inputLabel}>Password</Text>
    <TextInput
      placeholder="Password (min 6 chars)"
      placeholderTextColor="#6b7280"
      secureTextEntry
      value={password}
      onChangeText={setPassword}
      style={styles.inputControl}
      testID="password-input"
      accessible={true}
    />
    </View>

    {msg && <Text style={{color: '#f14444'}}>{msg}</Text>}

    <View style={styles.formAction}>
        <TouchableOpacity onPress={onSignup} disabled={loading} testID="signup-button">
          <View style={styles.btn}>
            <Text style={styles.btnText}>{loading ? "Creating..." : "Create account"}</Text>
          </View>
        </TouchableOpacity>
        </View>
        <TouchableOpacity style={{marginTop: 'auto'}}
         onPress={() => router.push({
          pathname: '/(auth)/login',
          })}
          >
          
            <Text style={styles.formFooter}>Already have an account? 
              <Text style={{textDecorationLine: 'underline'}}>Sign in</Text></Text>
          
        </TouchableOpacity>
</View>

    
    
  </View>
  </ScrollView>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({

    container: {
      padding: 12,
      flex: 1
    },
  
    
    header: {
      marginVertical: 12
    },
  
    headerImg: {
      width: 80,
      height: 80,
      alignSelf: 'center',
      borderRadius: 3,
      marginBottom: 36
    },
  
    title: {
      fontSize:27,
      fontWeight:'700',
      marginBottom: 6,
      textAlign: 'center',
      color: '#1e1e1e'
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#929292',
      textAlign: 'center'
    },
  
    inputControl: {
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      borderRadius: 12,
      fontSize: 15,
      fontWeight: '500',
      height: 44
    },
    inputLabel: {
      fontSize: 17,
      fontWeight: '600',
      color: '#222',
      marginBottom: 8
    },
    input: {
      marginBottom: 16
    },
  
    btn: {
      backgroundColor: "#3981f6",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#3981f6",
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
     
    },
    btnText: {
      fontSize: 18,
      fontWeight: '600',
      color: "#fff",
    },
    formFooter: {
      fontSize: 17,
      fontWeight: '600',
      color: '#222',
      textAlign: 'center',
      letterSpacing: 0.15
    },
    formAction: {
      marginVertical: 24
    },
  
  
  })

export default SignupPage