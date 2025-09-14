// frontend/app/customer/[id].js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://10.16.33.100:5000';

const LeadItem = ({ item, onDelete }) => (
  <View style={styles.leadItem}>
    <View>
      <Text style={styles.leadTitle}>{item.title}</Text>
      <Text style={styles.leadStatus}>Status: {item.status}</Text>
      <Text style={styles.leadValue}>Value: ${item.value || 0}</Text>
    </View>
    <Pressable onPress={() => onDelete(item._id)} style={styles.deleteLeadButton}>
      <Text style={styles.deleteLeadText}>✕</Text>
    </Pressable>
  </View>
);

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCustomerDetails = useCallback(async () => {
    if (!id || !token) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/customers/${id}`, authConfig);
      setCustomer(res.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch customer details.');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useFocusEffect(fetchCustomerDetails);

  const handleDeleteLead = (leadId) => {
    Alert.alert("Delete Lead", "Are you sure you want to delete this lead?", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`${API_URL}/api/leads/${leadId}`, authConfig);
          Alert.alert('Success', 'Lead deleted.');
          fetchCustomerDetails();
        } catch (error) {
          Alert.alert('Error', 'Could not delete lead.');
        }
      }}
    ]);
  };

  const doDeleteCustomer = async () => {
    try {
      await axios.delete(`${API_URL}/api/customers/${id}`, authConfig);
      router.replace('/'); 
    } catch (error) {
      Alert.alert('Error', 'Could not delete customer.');
    }
  };

  const handleDeleteCustomer = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to delete this customer?');
      if (ok) doDeleteCustomer();
      return;
    }
    Alert.alert("Delete Customer", "This will also remove associated leads. Are you sure?", [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDeleteCustomer }
    ]);
  };

  const handleEditCustomer = () => router.push(`/customer/${id}/edit`);

  if (isLoading) return <ActivityIndicator size="large" />;
  if (!customer) return <Text>Customer not found.</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.name}>{customer.name}</Text>
            <View style={styles.detailRow}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{customer.email}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Phone:</Text><Text style={styles.value}>{customer.phone || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.label}>Company:</Text><Text style={styles.value}>{customer.company || 'N/A'}</Text></View>
            <View style={styles.buttonGroup}>
              <Pressable style={styles.button} onPress={handleEditCustomer}><Text style={styles.buttonText}>Edit</Text></Pressable>
              <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDeleteCustomer}><Text style={styles.buttonText}>Delete</Text></Pressable>
            </View>
            <View style={styles.leadsHeader}>
              <Text style={styles.leadsTitle}>Leads</Text>
              <Pressable style={styles.addLeadButton} onPress={() => router.push(`/customer/${id}/add-lead`)}>
                <Text style={styles.addLeadButtonText}>+ Add Lead</Text>
              </Pressable>
            </View>
          </>
        }
        data={customer.leads}
        renderItem={({ item }) => <LeadItem item={item} onDelete={handleDeleteLead} />}
        keyExtractor={(item) => item._id.toString()}
        ListEmptyComponent={<Text style={styles.emptyListText}>No leads found. Add one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  name: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 20 },
  detailRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 4 },
  label: { fontSize: 16, fontWeight: '600', width: 80 },
  value: { fontSize: 16 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', margin: 20 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 10, alignItems: 'center' },
  deleteButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  leadsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, borderTopWidth: 1, borderColor: '#ddd', paddingTop: 20 },
  leadsTitle: { fontSize: 22, fontWeight: 'bold' },
  addLeadButton: { backgroundColor: '#34C759', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  addLeadButtonText: { color: '#fff', fontWeight: 'bold' },
  leadItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, marginHorizontal: 20, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  leadTitle: { fontSize: 16, fontWeight: 'bold' },
  leadStatus: { color: '#666', marginTop: 2 },
  leadValue: { color: '#333', marginTop: 2 },
  deleteLeadButton: { padding: 8 },
  deleteLeadText: { fontSize: 20, color: '#FF3B30' },
  emptyListText: { textAlign: 'center', marginTop: 20, color: 'grey' }
});
