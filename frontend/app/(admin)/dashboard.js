import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable,
  Alert, Modal, TextInput, ScrollView, RefreshControl, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit'; 
import { useAuth } from '../../context/AuthContext';
import { api } from '../../context/AuthContext';

const screenWidth = Dimensions.get("window").width;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, token } = useAuth();

 
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [modalVisible, setModalVisible] = useState({ createLead: false, createCustomer: false, editLead: false, editCustomer: false });
  const [newLead, setNewLead] = useState({ title: '', description: '', value: '', customerId: '', assignedToId: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', company: '' });
  const [editingItem, setEditingItem] = useState(null);

  
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [customersRes, usersRes, leadsRes] = await Promise.all([
        api.get('/customers'), api.get('/users'), api.get('/leads')
      ]);
      setCustomers(customersRes.data || []);
      setUsers(usersRes.data.filter(u => u.role !== 'admin') || []);
      setLeads(leadsRes.data || []);
    } catch (e) { Alert.alert('Error', e.response?.data?.msg || 'Failed to fetch dashboard data.'); } 
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  
  const leadStatusData = useMemo(() => {
    if (leads.length === 0) return [];
    const statusCounts = { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0 };
    leads.forEach(lead => {
      if (statusCounts.hasOwnProperty(lead.status)) {
        statusCounts[lead.status]++;
      }
    });

    return Object.keys(statusCounts)
      .filter(key => statusCounts[key] > 0)
      .map(key => ({
        name: key,
        population: statusCounts[key],
        color: getStatusColor(key),
        legendFontColor: "#7F7F7F",
        legendFontSize: 14
      }));
  }, [leads]);

  
  const handleLogout = async () => { await logout(); router.replace('/login'); };
  const handleCreateCustomer = async () => { try { const response = await api.post('/customers', newCustomer); setCustomers(prev => [response.data, ...prev]); setModalVisible({ ...modalVisible, createCustomer: false }); setNewCustomer({ name: '', email: '', phone: '', company: '' }); } catch (e) { Alert.alert('Creation Error', e.response?.data?.msg || 'Could not create customer.'); } };
  const handleCreateLead = async () => { try { const response = await api.post('/leads', { ...newLead, value: Number(newLead.value) || 0 }); setLeads(prev => [response.data, ...prev]); setModalVisible({ ...modalVisible, createLead: false }); setNewLead({ title: '', description: '', value: '', customerId: '', assignedToId: '' }); } catch (e) { Alert.alert('Creation Error', e.response?.data?.msg || 'Could not create lead.'); } };
  const handleDeleteCustomer = (customerId) => { Alert.alert("Delete Customer", "Are you sure? This will also delete all associated leads.", [ { text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { try { await api.delete(`/customers/${customerId}`); setCustomers(prev => prev.filter(c => c._id !== customerId)); fetchData(); } catch (error) { Alert.alert("Error", "Could not delete customer."); } }} ]); };
  const handleDeleteLead = (leadId) => { Alert.alert("Delete Lead", "Are you sure?", [ { text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { try { await api.delete(`/leads/${leadId}`); setLeads(prev => prev.filter(l => l._id !== leadId)); } catch (error) { Alert.alert("Error", "Could not delete lead."); } }} ]); };
  const openEditCustomerModal = (customer) => { setEditingItem(customer); setModalVisible({ ...modalVisible, editCustomer: true }); };
  const handleUpdateCustomer = async () => { if (!editingItem) return; try { const response = await api.put(`/customers/${editingItem._id}`, editingItem); setCustomers(prev => prev.map(c => c._id === editingItem._id ? response.data : c)); setModalVisible({ ...modalVisible, editCustomer: false }); setEditingItem(null); } catch (error) { Alert.alert("Update Error", error.response?.data?.msg || "Could not update customer."); } };
  const openEditLeadModal = (lead) => { const formattedLead = { ...lead, customerId: lead.customer?._id || '', assignedToId: lead.assignedTo?._id || '' }; setEditingItem(formattedLead); setModalVisible({ ...modalVisible, editLead: true }); };
  const handleUpdateLead = async () => { if (!editingItem) return; try { const response = await api.put(`/leads/${editingItem._id}`, editingItem); setLeads(prev => prev.map(l => l._id === editingItem._id ? response.data : l)); setModalVisible({ ...modalVisible, editLead: false }); setEditingItem(null); } catch (error) { Alert.alert("Update Error", error.response?.data?.msg || "Could not update lead."); } };

  // --- Render Functions (Preserving your UI) ---
  const renderCustomerItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>{item.email}</Text>
      </View>
       <View style={styles.itemActions}>
        <Pressable style={[styles.actionButton, styles.editButton]} onPress={() => openEditCustomerModal(item)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteCustomer(item._id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
       </View>
    </View>
  );

  const renderLeadItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={styles.itemMeta}>Customer: {item.customer?.name || 'N/A'}</Text>
        <Text style={styles.itemMeta}>Assigned to: {item.assignedTo?.name || 'N/A'}</Text>
      </View>
      <View style={styles.itemActions}>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Pressable style={[styles.actionButton, styles.editButton, {marginTop: 8}]} onPress={() => openEditLeadModal(item)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton, {marginTop: 8}]} onPress={() => handleDeleteLead(item._id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}>
     
      <View style={styles.headerRow}><Text style={styles.title}>Admin Panel</Text><Pressable style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutText}>Logout</Text></Pressable></View>
      <Text style={styles.subtitle}>Welcome, {user?.name || 'Admin'}</Text>
      
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lead Status Overview</Text>
        {loading ? <ActivityIndicator/> : leadStatusData.length > 0 ? (
          <PieChart
            data={leadStatusData}
            width={screenWidth - 52} 
            height={220}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <Text style={styles.emptyText}>No lead data for chart.</Text>
        )}
      </View>
      
      <View style={styles.mainActionsContainer}><Pressable style={[styles.mainActionButton, {backgroundColor: '#28A745'}]} onPress={() => setModalVisible({ ...modalVisible, createCustomer: true })}><Text style={styles.mainActionButtonText}>+ New Customer</Text></Pressable><Pressable style={[styles.mainActionButton, {backgroundColor: '#007BFF'}]} onPress={() => setModalVisible({ ...modalVisible, createLead: true })}><Text style={styles.mainActionButtonText}>+ New Lead</Text></Pressable></View>
      
     
      <View style={styles.section}><Text style={styles.sectionTitle}>All Customers ({customers.length})</Text><FlatList data={customers} keyExtractor={(item) => item._id} renderItem={renderCustomerItem} ListEmptyComponent={<Text style={styles.emptyText}>No customers created yet.</Text>} scrollEnabled={false} /></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>All Leads ({leads.length})</Text><FlatList data={leads} keyExtractor={(item) => item._id} renderItem={renderLeadItem} ListEmptyComponent={<Text style={styles.emptyText}>No leads created yet.</Text>} scrollEnabled={false} /></View>
      
      <Modal visible={modalVisible.createCustomer} animationType="slide" transparent={true} onRequestClose={() => setModalVisible({ ...modalVisible, createCustomer: false })}><View style={styles.modalContainer}><View style={styles.modalContent}><Text style={styles.modalTitle}>Create New Customer</Text><TextInput style={styles.input} placeholder="Full Name*" value={newCustomer.name} onChangeText={text => setNewCustomer({ ...newCustomer, name: text })} /><TextInput style={styles.input} placeholder="Email Address*" value={newCustomer.email} onChangeText={text => setNewCustomer({ ...newCustomer, email: text })} /><TextInput style={styles.input} placeholder="Phone Number" value={newCustomer.phone} onChangeText={text => setNewCustomer({ ...newCustomer, phone: text })} /><TextInput style={styles.input} placeholder="Company Name" value={newCustomer.company} onChangeText={text => setNewCustomer({ ...newCustomer, company: text })} /><View style={styles.modalActions}><Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible({ ...modalVisible, createCustomer: false })}><Text style={styles.buttonText}>Cancel</Text></Pressable><Pressable style={[styles.button, styles.submitButton]} onPress={handleCreateCustomer}><Text style={styles.buttonText}>Save Customer</Text></Pressable></View></View></View></Modal>
      <Modal visible={modalVisible.createLead} animationType="slide" transparent={true} onRequestClose={() => setModalVisible({ ...modalVisible, createLead: false })}><View style={styles.modalContainer}><View style={styles.modalContent}><Text style={styles.modalTitle}>Create New Lead</Text><TextInput style={styles.input} placeholder="Lead Title*" value={newLead.title} onChangeText={text => setNewLead({ ...newLead, title: text })} /><TextInput style={styles.input} placeholder="Description" value={newLead.description} onChangeText={text => setNewLead({ ...newLead, description: text })} /><TextInput style={styles.input} placeholder="Value ($)" keyboardType="numeric" value={newLead.value} onChangeText={text => setNewLead({ ...newLead, value: text })} /><Picker selectedValue={newLead.customerId} onValueChange={val => setNewLead({ ...newLead, customerId: val })}><Picker.Item label="Select Customer..." value="" />{customers.map(c => <Picker.Item key={c._id} label={c.name} value={c._id} />)}</Picker><Picker selectedValue={newLead.assignedToId} onValueChange={val => setNewLead({ ...newLead, assignedToId: val })}><Picker.Item label="Select User..." value="" />{users.map(u => <Picker.Item key={u._id} label={u.name} value={u._id} />)}</Picker><View style={styles.modalActions}><Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible({ ...modalVisible, createLead: false })}><Text style={styles.buttonText}>Cancel</Text></Pressable><Pressable style={[styles.button, styles.submitButton]} onPress={handleCreateLead}><Text style={styles.buttonText}>Save Lead</Text></Pressable></View></View></View></Modal>
      
      {editingItem && (
        <>
          <Modal visible={modalVisible.editCustomer} animationType="slide" transparent={true} onRequestClose={() => setModalVisible({ ...modalVisible, editCustomer: false })}><View style={styles.modalContainer}><View style={styles.modalContent}><Text style={styles.modalTitle}>Edit Customer</Text><TextInput style={styles.input} placeholder="Full Name*" value={editingItem.name} onChangeText={text => setEditingItem({...editingItem, name: text})} /><TextInput style={styles.input} placeholder="Email Address*" value={editingItem.email} onChangeText={text => setEditingItem({...editingItem, email: text})} /><TextInput style={styles.input} placeholder="Phone Number" value={editingItem.phone} onChangeText={text => setEditingItem({...editingItem, phone: text})} /><TextInput style={styles.input} placeholder="Company Name" value={editingItem.company} onChangeText={text => setEditingItem({...editingItem, company: text})} /><View style={styles.modalActions}><Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible({ ...modalVisible, editCustomer: false })}><Text style={styles.buttonText}>Cancel</Text></Pressable><Pressable style={[styles.button, styles.submitButton]} onPress={handleUpdateCustomer}><Text style={styles.buttonText}>Save Changes</Text></Pressable></View></View></View></Modal>
          <Modal visible={modalVisible.editLead} animationType="slide" transparent={true} onRequestClose={() => setModalVisible({ ...modalVisible, editLead: false })}><View style={styles.modalContainer}><View style={styles.modalContent}><Text style={styles.modalTitle}>Edit Lead</Text><TextInput style={styles.input} placeholder="Lead Title*" value={editingItem.title} onChangeText={text => setEditingItem({...editingItem, title: text})} /><TextInput style={styles.input} placeholder="Description" value={editingItem.description} onChangeText={text => setEditingItem({...editingItem, description: text})} /><TextInput style={styles.input} placeholder="Value ($)" keyboardType="numeric" value={String(editingItem.value)} onChangeText={text => setEditingItem({...editingItem, value: text})} /><Picker selectedValue={editingItem.customerId} onValueChange={val => setEditingItem({...editingItem, customerId: val})}><Picker.Item label="Select Customer..." value="" />{customers.map(c => <Picker.Item key={c._id} label={c.name} value={c._id} />)}</Picker><Picker selectedValue={editingItem.assignedToId} onValueChange={val => setEditingItem({...editingItem, assignedToId: val})}><Picker.Item label="Select User..." value="" />{users.map(u => <Picker.Item key={u._id} label={u.name} value={u._id} />)}</Picker><View style={styles.modalActions}><Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible({ ...modalVisible, editLead: false })}><Text style={styles.buttonText}>Cancel</Text></Pressable><Pressable style={[styles.button, styles.submitButton]} onPress={handleUpdateLead}><Text style={styles.buttonText}>Save Changes</Text></Pressable></View></View></View></Modal>
        </>
      )}
    </ScrollView>
  );
}

const getStatusColor = (status) => { 
  const colors = { 'New': '#007BFF', 'Contacted': '#FFC107', 'Qualified': '#17A2B8', 'Converted': '#28A745', 'Lost': '#DC3545' };
  return colors[status] || '#6C757D';
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#F8F9FA' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6C757D', marginBottom: 16 },
  logoutBtn: { backgroundColor: '#DC3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  mainActionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, gap: 10 },
  mainActionButton: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  mainActionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#343A40' },
  emptyText: { textAlign: 'center', color: '#6C757D', marginTop: 20, fontStyle: 'italic' },
  itemContainer: { backgroundColor: '#fff', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemContent: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 18, fontWeight: '600' },
  itemMeta: { fontSize: 14, color: '#6C757D', marginTop: 4 },
  itemActions: { alignItems: 'center' },
  actionButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, width: 80, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  editButton: { backgroundColor: '#007BFF', marginBottom: 8},
  deleteButton: { backgroundColor: '#DC3545' },
  statusBadge: { alignSelf: 'center', borderRadius: 15, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 8 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { height: 45, borderColor: '#CED4DA', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#6C757D' },
  submitButton: { backgroundColor: '#007BFF' },
});

