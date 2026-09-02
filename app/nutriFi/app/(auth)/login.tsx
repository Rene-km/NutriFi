import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useLoginHook from "@/hooks/Auth/login_hook";
import LoginPage from "@/components/Auth/LoginPage";


export default function Login() {
 

  const { email, setEmail, password, setPassword, msg, onLogin } = useLoginHook();

  return (
    <LoginPage email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={onLogin} />
  );
}

