import { MaterialCommunityIcons } from '@expo/vector-icons';

// Helper to get icon name based on category
const getCategoryIcon = (category?: string) => {
  switch ((category || '').toLowerCase()) {
    case 'math':
      return 'calculator-variant';
    case 'science':
      return 'flask-outline';
    case 'history':
      return 'book-open-variant';
    case 'language':
      return 'alphabetical-variant';
    case 'programming':
      return 'code-tags';
    default:
      return 'book-outline';
  }
};

const CategoryIcon = ({ category }: { category?: string }) => {
  const iconName = getCategoryIcon(category);
  return <MaterialCommunityIcons name={iconName} size={24} color="#2563eb" />;
};

export default CategoryIcon;
