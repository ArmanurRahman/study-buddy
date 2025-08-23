import { View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useRealm } from '@realm/react';

const SettingScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Get all plans and statuses from Realm
  const plans = useQuery('Plan');
  const statuses = useQuery('PlanStatus');
  const realm = useRealm();

  const handleExport = async () => {
    try {
      // Convert Realm objects to plain JS arrays
      const plansData = plans.map((plan: any) => ({
        id: plan._id?.toHexString ? plan._id.toHexString() : String(plan._id),
        title: plan.title,
        category: plan.category,
        description: plan.description,
        duration: plan.duration,
        streak: plan.streak ?? 0,
        startTime: plan.startTime,
        endDate: plan.endDate,
        frequency: plan.frequency,
        startDate: plan.startDate,
        totalHours: plan.totalHours ?? null,
      }));

      const statusesData = statuses.map((status: any) => ({
        id: status._id?.toHexString ? status._id.toHexString() : String(status._id),
        planId: status.planId?.toHexString ? status.planId.toHexString() : String(status.planId),
        date: status.date,
        status: status.status,
        updatedAt: status.updatedAt,
        passedTime: status.passedTime,
      }));

      const exportObj = {
        plans: plansData,
        statuses: statusesData,
      };

      const json = JSON.stringify(exportObj, null, 2);
      const fileUri = FileSystem.documentDirectory + 'study_buddy_export.json';
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Study Buddy Data',
        UTI: 'public.json',
      });
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : 'Could not export data.';
      Alert.alert('Export Failed', message);
    }
  };

  // Import handler
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const data = JSON.parse(fileContent);

        if (!data.plans || !data.statuses) {
          Alert.alert('Import Failed', 'Invalid file format.');
          return;
        }

        realm.write(() => {
          realm.delete(realm.objects('PlanStatus'));
          realm.delete(realm.objects('Plan'));

          // Import Plans
          data.plans.forEach((plan: any) => {
            let planObjId;
            if (typeof plan.id === 'string' && plan.id.length === 24) {
              planObjId = new Realm.BSON.ObjectId(plan.id);
            } else {
              planObjId = new Realm.BSON.ObjectId();
            }
            if (!realm.objectForPrimaryKey('Plan', planObjId)) {
              realm.create('Plan', {
                _id: planObjId,
                title: plan.title,
                category: plan.category,
                description: plan.description,
                duration: plan.duration,
                streak: plan.streak ?? 0,
                startTime: plan.startTime ? new Date(plan.startTime) : null,
                endDate: plan.endDate ? new Date(plan.endDate) : null,
                frequency: plan.frequency,
                startDate: plan.startDate ? new Date(plan.startDate) : null,
                totalHours: plan.totalHours ?? null,
              });
            }
          });

          // Import PlanStatuses
          data.statuses.forEach((status: any) => {
            let statusObjId, planObjId;
            if (typeof status.id === 'string' && status.id.length === 24) {
              statusObjId = new Realm.BSON.ObjectId(status.id);
            } else {
              statusObjId = new Realm.BSON.ObjectId();
            }
            if (typeof status.planId === 'string' && status.planId.length === 24) {
              planObjId = new Realm.BSON.ObjectId(status.planId);
            } else {
              planObjId = new Realm.BSON.ObjectId();
            }
            if (!realm.objectForPrimaryKey('PlanStatus', statusObjId)) {
              realm.create('PlanStatus', {
                _id: statusObjId,
                planId: planObjId,
                date: status.date ? new Date(status.date) : null,
                status: status.status,
                updatedAt: status.updatedAt ? new Date(status.updatedAt) : null,
                passedTime: status.passedTime,
              });
            }
          });
        });

        Alert.alert('Import Successful', 'Your data has been imported into Study Buddy.');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Import Failed', 'Could not import data.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#1e293b' }}>
          Settings
        </Text>

        {/* Account Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2563eb', marginBottom: 12 }}>
            Account
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color="#2563eb"
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 16, color: '#1e293b', flex: 1 }}>Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2563eb', marginBottom: 12 }}>
            Preferences
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#2563eb"
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 16, color: '#1e293b', flex: 1 }}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              thumbColor={notifications ? '#2563eb' : '#f1f5f9'}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}>
            <Ionicons name="moon-outline" size={22} color="#2563eb" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: '#1e293b', flex: 1 }}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? '#2563eb' : '#f1f5f9'}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2563eb', marginBottom: 12 }}>
            About
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#2563eb"
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 16, color: '#1e293b', flex: 1 }}>About Study Buddy</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          {/* Export Data Item */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={handleExport}>
            <Ionicons
              name="download-outline"
              size={22}
              color="#2563eb"
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 16, color: '#1e293b', flex: 1 }}>Export Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          {/* Import Data Item */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={handleImport}>
            <Ionicons
              name="cloud-upload-outline"
              size={22}
              color="#2563eb"
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 16, color: '#1e293b', flex: 1 }}>Import Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingScreen;
