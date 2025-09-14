// app/modal.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

// IMPORTANT: Replace this with your backend's actual IP address and port
const API_URL = 'http://10.16.33.100:5000';

export default function AddCustomerModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddCustomer = async () => {
   
    if (!name || !email) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    setIsLoading(true);
    try {
      
      await axios.post(`${API_URL}/api/customers`, { name, email, phone, company });


      Alert.alert('Success', 'Customer added successfully!');
   
      router.back();

    } catch (error) {
      console.error('Failed to add customer:', error);
      Alert.alert('Error', 'Could not add customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Customer</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (Optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Company (Optional)"
        value={company}
        onChangeText={setCompany}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Add Customer" onPress={handleAddCustomer} />
      )}
    
      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} color="#666" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});
