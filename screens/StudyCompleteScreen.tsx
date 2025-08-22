import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const StudyCompleteScreen = ({ navigation }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
      <LottieView
        source={require('../assets/animation/study_completed.json')} // Place a congrats animation JSON in your assets folder
        autoPlay
        loop={false}
        style={{
          width: screenWidth * 0.7,
          height: screenWidth * 0.7,
          marginBottom: 32,
        }}
      />
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: 16,
          textAlign: 'center',
        }}>
        Congratulations!
      </Text>
      <Text style={{ fontSize: 18, color: '#64748b', marginBottom: 32, textAlign: 'center' }}>
        You have completed your study session. Keep up the great work!
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#2563eb',
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 10,
        }}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StudyCompleteScreen;
