import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react'

type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type Goal = "lose_weight" | "build_muscle" | "maintain" | "improve_fitness";

const useSignupHook = () => {
 

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(""); // optional
  const [gender, setGender] = useState<Gender>("prefer_not_to_say");
  const [goal, setGoal] = useState<Goal>("improve_fitness");

  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    setMsg(null);

    // Basic validation
    if (!fullName.trim()) return setMsg("Please enter your name.");
    if (!email.includes("@")) return setMsg("Please enter a valid email.");
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");

    const ageNum = age ? Number(age) : null;
    const heightNum = heightCm ? Number(heightCm) : null;
    const weightNum = weightKg ? Number(weightKg) : null;

    if (age && (!Number.isFinite(ageNum) || (ageNum as number) < 10 || (ageNum as number) > 120))
      return setMsg("Enter a valid age.");
    if (
      heightCm &&
      (!Number.isFinite(heightNum) || (heightNum as number) < 80 || (heightNum as number) > 250)
    )
      return setMsg("Enter a valid height (cm).");
    if (
      weightKg &&
      (!Number.isFinite(weightNum) || (weightNum as number) < 20 || (weightNum as number) > 300)
    )
      return setMsg("Enter a valid weight (kg).");

    setLoading(true);

    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            gender,
            goal,
          },
        },
      });
      //console.log("signUpError:", signUpError);

      if (signUpError) {
        setLoading(false);
        return setMsg(signUpError.message);
      }

      // 2) Ensure we have a session/JWT (RLS needs auth.uid())
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        return setMsg(`Signed up, but sign-in failed: ${signInError.message}`);
      }

      const userId = signInData.user?.id || signUpData.user?.id;

      if (!userId) {
        setLoading(false);
        return setMsg("No user id available after sign up/sign in.");
      }

      // 3) Insert profile row
      // Use UPSERT so you don't crash if the row already exists (e.g. trigger/duplicate attempt)
      const { error: profileError } = await supabase.from("profile").upsert(
        [
          {
            id: userId, // must match auth.uid() for your policy
            full_name: fullName.trim(),
            phone: phone.trim() ? phone.trim() : null,
            gender,
            age: ageNum,
            height_cm: heightNum,
            weight_kg: weightNum,
            goal,
          },
        ],
        { onConflict: "id" }
      );
      //console.log("profileError:", profileError);

      setLoading(false);

      if (profileError) {
        console.log("Profile upsert error:", profileError);
        return setMsg(profileError.message);
      }

      setMsg("Account created.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      setLoading(false);
      console.log("Signup unexpected error:", e);
      setMsg(e?.message ?? "Unexpected error during signup.");
    }
  };
  return {
    fullName, setFullName,
    phone, setPhone,
    gender, setGender,
    goal, setGoal,
    age, setAge,
    heightCm, setHeightCm,
    weightKg, setWeightKg,
    email, setEmail,
    password, setPassword,
    msg,
    loading,
    onSignup,
  };
};

export default useSignupHook;