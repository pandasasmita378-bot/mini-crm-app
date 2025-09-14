
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const API_URL = 'http://10.16.33.100:5000';

export default function AddLeadScreen() {
  const { id: customerId } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const [title, setTitle] = useState(''), [description, setDescription] = useState('');
  const [value, setValue] = useState(''), [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title) return Alert.alert('Error', 'Lead title is required.');
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/leads`,
        { customerId, title, description, value: Number(value) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not create lead.');
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Lead</Text>
      <TextInput style={styles.input} placeholder="Lead Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Value ($)" value={value} onChangeText={setValue} keyboardType="numeric" />
      <Pressable style={styles.button} onPress={handleSave} disabled={saving}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save Lead'}</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
