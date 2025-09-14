import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Pressable, RefreshControl, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../context/AuthContext'; 
import { Picker } from '@react-native-picker/picker';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();


  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const leadStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  const fetchLeads = useCallback(() => {
    const loadData = async () => {
        setLoading(true);
        try {
          const response = await api.get('/leads'); 
          setLeads(response.data || []);
        } catch (error) {
          console.error('Failed to fetch leads:', error?.response?.data || error?.message);
          Alert.alert('Error', 'Could not fetch your assigned leads.');
        } finally {
          setLoading(false);
        }
    };
    loadData();
  }, []);

  useFocusEffect(fetchLeads);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const openStatusModal = (lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedLead || !newStatus) return;
    try {
      const response = await api.put(`/leads/${selectedLead._id}`, { status: newStatus });
      
      setLeads(currentLeads => 
        currentLeads.map(lead => lead._id === selectedLead._id ? response.data : lead)
      );
      
      setModalVisible(false);
      setSelectedLead(null);
      Alert.alert('Success', 'Lead status has been updated.');

    } catch (error) {
       Alert.alert('Error', 'Failed to update lead status.');
       console.error('Update status error:', error.response?.data);
    }
  };

  if (loading && !leads.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading Your Leads...</Text>
      </View>
    );
  }

  const renderLeadItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle}>Customer: {item.customer?.name || 'N/A'}</Text>
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Pressable style={styles.updateButton} onPress={() => openStatusModal(item)}>
            <Text style={styles.updateButtonText}>Update Status</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Dashboard</Text>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
      
      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLeads} colors={['#1E90FF']} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text>You have no leads assigned to you.</Text>
          </View>
        )}
      />

       <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Update Lead Status</Text>
             <Text style={styles.modalLeadTitle}>{selectedLead?.title}</Text>
             <Picker selectedValue={newStatus} onValueChange={(itemValue) => setNewStatus(itemValue)}>
               {leadStatuses.map(status => <Picker.Item key={status} label={status} value={status} />)}
             </Picker>
             <View style={styles.modalActions}>
               <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}><Text style={styles.buttonText}>Cancel</Text></Pressable>
               <Pressable style={[styles.button, styles.submitButton]} onPress={handleUpdateStatus}><Text style={styles.buttonText}>Save Changes</Text></Pressable>
             </View>
           </View>
         </View>
       </Modal>
    </View>
  );
}

const getStatusColor = (status) => {
    const colors = {
        'New': '#007BFF', 'Contacted': '#FFC107', 'Qualified': '#17A2B8',
        'Converted': '#28A745', 'Lost': '#DC3545',
    };
    return colors[status] || '#6C757D';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6C757D', marginBottom: 16, paddingHorizontal: 16 },
  logoutBtn: { backgroundColor: '#DC3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  itemContainer: {
    backgroundColor: '#fff', padding: 20, marginTop: 15, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd', shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  itemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  itemSubtitle: { fontSize: 14, color: '#666' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  statusBadge: { borderRadius: 15, paddingVertical: 5, paddingHorizontal: 12 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  updateButton: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  updateButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyContainer: { flex: 1, marginTop: 50, alignItems: 'center' },
  // Modal styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalLeadTitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#6C757D' },
  submitButton: { backgroundColor: '#007BFF' },
});

