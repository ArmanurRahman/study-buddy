import { useState, useEffect, useContext } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useQuery } from '@realm/react';

import { Context as PlanContext } from 'context/PlanContext';
import { DEFAULT_CATEGORIES } from 'utils/enum';

type RootStackParamList = {
  AllPlans: undefined;
  PlanCategory?: { edit?: boolean };
  PlanStartDate?: { edit?: boolean };
};

type PlansScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanCategory'>;
  route: RouteProp<RootStackParamList, 'PlanCategory'>;
};

const CategoryScreen = ({ navigation, route }: PlansScreenProps) => {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const {
    state: { category },
    changeCategory,
  } = useContext(PlanContext) as {
    state: { category: string };
    changeCategory: (category: string) => void;
  };
  const [categoryInput, setCategoryInput] = useState(category);

  const planResults = useQuery('Plan');

  // Merge DB categories with default categories
  useEffect(() => {
    const dbCategories = Array.from(
      new Set(
        planResults
          .map((plan: any) => plan.category)
          .filter((cat) => !!cat && typeof cat === 'string')
      )
    );
    setCategories(Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories])));
  }, [planResults]);

  // Filtered suggestions
  const filteredCategories = categoryInput
    ? categories.filter((cat) => cat.toLowerCase().includes(categoryInput.toLowerCase()))
    : categories;

  const handleNext = () => {
    // Add new category to suggestions if it's not already present
    if (category && !categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }
    navigation.navigate('PlanStartDate', {
      ...route.params,
      edit: route.params?.edit ?? false,
    });
  };

  const handleSkip = () => {
    changeCategory('');
    handleNext();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowCategorySuggestions(false);
        Keyboard.dismiss();
      }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}>
        <View
          style={{
            width: '90%',
            padding: 24,
            borderRadius: 12,
            backgroundColor: '#f9fafb',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'left' }}>
            Add Study Plan Category
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 12, textAlign: 'left', color: '#6b7280' }}>
            This helps you organize your study plans better. You can select from existing categories
            or create a new one.
          </Text>
          <View className="relative w-full" style={{ marginBottom: 24 }}>
            <TextInput
              value={categoryInput}
              onChangeText={(text) => {
                setCategoryInput(text);
                setShowCategorySuggestions(true);
                changeCategory(text); // Set as selected if user types a new one
              }}
              onFocus={() => setShowCategorySuggestions(true)}
              placeholder="Type or select a category"
              className="rounded-lg border border-gray-300 p-4 shadow-sm"
            />
            {showCategorySuggestions && filteredCategories.length > 0 && (
              <View
                className="mt-1 max-h-32 rounded border border-gray-200 shadow"
                style={{
                  position: 'absolute',
                  top: 50,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  zIndex: 10,
                  overflow: 'hidden',
                }}>
                {filteredCategories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      changeCategory(item);
                      setCategoryInput(item);
                      setShowCategorySuggestions(false);
                    }}
                    style={{ padding: 10 }}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: '#2563eb',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              backgroundColor: '#a5b4fc',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 18 }}>Skip</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CategoryScreen;
