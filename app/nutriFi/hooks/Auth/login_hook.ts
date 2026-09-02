import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react'

const useLoginHook = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const onLogin = async () => {
    setMsg(null);

    if (!email || !password) {
      setMsg('Please enter your email and password.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setMsg(error.message);
    else router.replace("/");
  };

  return {
    email, setEmail,
    password, setPassword,
    msg,
    onLogin,
  };
}

export default useLoginHook