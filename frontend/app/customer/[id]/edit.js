
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const API_URL = 'http://10.16.33.100:5000';

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState(''), [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''), [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/customers/${id}`, authConfig);
        const c = res.data || {};
        setName(c.name || ''); setEmail(c.email || ''); setPhone(c.phone || ''); setCompany(c.company || '');
      } catch (e) {
        Alert.alert('Error', 'Could not load customer for editing.'); router.replace(`/customer/${id}`);
      } finally { setLoading(false); }
    };
    if (id && token) load();
  }, [id, token]);

  const save = async () => {
    if (!name || !email) return Alert.alert('Invalid', 'Name and Email are required.');
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/customers/${id}`, { name, email, phone, company }, authConfig);
      router.replace(`/customer/${id}`); 
    } catch (e) {
      Alert.alert('Error', e.response?.data?.msg || 'Could not update customer.');
    } finally { setSaving(false); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Customer</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Company" value={company} onChangeText={setCompany} />
      <View style={styles.row}>
        <Pressable style={[styles.button, styles.cancel]} onPress={() => router.replace(`/customer/${id}`)}><Text style={styles.buttonText}>Cancel</Text></Pressable>
        <Pressable style={[styles.button, styles.save]} onPress={save} disabled={saving}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save'}</Text></Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { height: 50, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 14, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
  cancel: { backgroundColor: '#999' }, save: { backgroundColor: '#007AFF' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
