import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAsAdmin } = useAuth();


  const [isSubmitting, setSubmitting] = useState(false);
  const [loginType, setLoginType] = useState('employee'); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminKey, setAdminKey] = useState('');

  
  const [error, setError] = useState('');

 
  const onSubmit = async () => {
    setError(''); 
    setSubmitting(true);
    
    let result;
    if (loginType === 'employee') {
      result = await login(email.trim(), password.trim());
    } else {
      result = await loginAsAdmin(adminName.trim(), adminKey.trim());
    }

    if (result.success) {
      router.replace('/'); 
    } else {
      setError(result.msg); 
    }
    
    setSubmitting(false);
  };

  
  const renderEmployeeForm = () => (
    <>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
      />
    </>
  );

  const renderAdminForm = () => (
    <>
      <TextInput
        style={styles.input}
        value={adminName}
        onChangeText={setAdminName}
        placeholder="Admin Name"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={adminKey}
        onChangeText={setAdminKey}
        placeholder="Admin Secret Key"
        placeholderTextColor="#999"
        secureTextEntry
      />
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your CRM account</Text>
      
  
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
            style={[styles.toggleButton, loginType === 'employee' && styles.toggleButtonActive]} 
            onPress={() => { setLoginType('employee'); setError(''); }}>
          <Text style={[styles.toggleText, loginType === 'employee' && styles.toggleTextActive]}>Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.toggleButton, loginType === 'admin' && styles.toggleButtonActive]} 
            onPress={() => { setLoginType('admin'); setError(''); }}>
          <Text style={[styles.toggleText, loginType === 'admin' && styles.toggleTextActive]}>Admin</Text>
        </TouchableOpacity>
      </View>

    
      {loginType === 'employee' ? renderEmployeeForm() : renderAdminForm()}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

    
      <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </Pressable>

      
      <View style={styles.row}>
        <Text>New employee? </Text>
        <Pressable onPress={() => router.push('/register')}>
           <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24 },
  toggleContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, marginBottom: 20 },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#007AFF' },
  toggleText: { color: '#007AFF', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, marginBottom: 12, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { marginTop: 16, flexDirection: 'row', justifyContent: 'center' },
  link: { color: '#007AFF', fontWeight: '600' },
  errorText: { color: '#DC3545', textAlign: 'center', marginBottom: 10, fontWeight: '600' },
});

