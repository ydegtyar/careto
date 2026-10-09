import { useLocalStorage } from 'usehooks-ts';

export interface CategoryItem {
  id: string;
  label: string;
  iconName: string;
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'insurance', label: 'Insurance / Tax', iconName: 'Shield', isDefault: true },
  { id: 'parking', label: 'Parking & Tolls', iconName: 'LocalParking', isDefault: true },
  { id: 'wash', label: 'Car Wash', iconName: 'CarWash', isDefault: true },
  { id: 'fine', label: 'Fines & Fees', iconName: 'ConfirmationNumber', isDefault: true },
  { id: 'other', label: 'Other Expense', iconName: 'MoreHoriz', isDefault: true },
];

export const CATEGORIES_STORAGE_KEY = 'careta_expense_categories_v1';

export function useExpenseCategories() {
  const [categories, setCategories] = useLocalStorage<CategoryItem[]>(
    CATEGORIES_STORAGE_KEY,
    DEFAULT_CATEGORIES,
  );

  const addCategory = (label: string, iconName: string) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCat: CategoryItem = {
      id,
      label,
      iconName,
      isDefault: false,
    };
    setCategories([...categories, newCat]);
    return id;
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return {
    categories,
    addCategory,
    removeCategory,
  };
}
