import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from "react-native";
import { router } from 'expo-router';

type LoginProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
}

const LoginPage = ({ email, setEmail, password, setPassword, onLogin }: LoginProps) => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#f5f5f5"}}>
    <View style={styles.container}>
      <View style={styles.header}>
      <Image
  source={require("../../assets/images/NF_blue.png")}
 alt="Logo"
  accessibilityLabel="NutriFi logo"
  style={styles.headerImg}
/>

<Text style={styles.title} testID='login-title'>Sign in to NutrFi</Text>
<Text style={styles.subtitle}> Get access to exercises and workout history</Text>
        
      </View>

      <View style={styles.form}>
        <View style={styles.input}>
        <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
          style={styles.inputControl}
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="johndoe@example.com"
          placeholderTextColor="#6b7280"
          value={email} 
          onChangeText={setEmail}
          testID="email-input"
          />
          
        </View>
    
        <View style={styles.input}>
        <Text style={styles.inputLabel}>Password</Text>
          <TextInput
          style={styles.inputControl}
          placeholder="********"
          placeholderTextColor="#6b7280"
          value={password} 
          onChangeText={setPassword}
          secureTextEntry 
          testID="password-input"
          />
        </View>
        <View style={styles.formAction}>
          <TouchableOpacity onPress={onLogin} 
          accessible={true}
           testID="signin-button">
            <View style={styles.btn}>
              <Text style={styles.btnText}>Sign in</Text>
            </View>
          </TouchableOpacity>
          </View>
          <TouchableOpacity style={{marginTop: 'auto'}}
          accessible={true}
          testID="have-no-account-button"
           onPress={() => router.push({
            pathname: '/(auth)/signup',
            })}
            >
            
              <Text style={styles.formFooter}>Don't have an account? 
                <Text style={{textDecorationLine: 'underline'}}>Sign up</Text></Text>
            
          </TouchableOpacity>
        </View>
      </View>
    
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({

    container: {
      padding: 24,
      flex: 1
    },
  
    header: {
      marginVertical: 36
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
    input: {
      marginBottom: 16
    },
    inputLabel: {
      fontSize: 17,
      fontWeight: '600',
      color: '#222',
      marginBottom: 8
    },
    inputControl: {
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      borderRadius: 12,
      fontSize: 15,
      fontWeight: '500',
      height: 44
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#929292',
      textAlign: 'center'
    },
  
    form: {
      marginBottom: 24,
      flex: 1
    },
    formAction: {
      marginVertical: 24
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
    }
  
  })

export default LoginPage