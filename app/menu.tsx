import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fruitData } from '@/src/store/fruitData';
import { fruitImages } from '@/src/constants/fruitImages';


type Fruit = typeof fruitData[0];


const MenuHeader = ({ onBack }: { onBack(): void }) => (
  <SafeAreaView edges={['top']} style={styles.headerContainer}>
    <View style={styles.headerContent}>
      {/* Левая кнопка */}
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Текст посередние */}
      <Text style={styles.headerTitle}>
        Veggie<Text style={{ color: "#FFD700" }}>Scan</Text>
      </Text>

      <View style={{width: 40}}></View>
    </View>
  </SafeAreaView>
);


const SearchBar = ({ value, onChange }: { value: string; onChange: (text: string) => void }) => (
  <View style={[styles.searchContainer, { backgroundColor: "#1C1C1E" }]}>
    <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
    <TextInput
      style={[styles.searchInput, { color: "#FFFFFF" }]}
      placeholder="Поиск по названию или PLU коду..."
      placeholderTextColor="#A0A0A0"
      value={value}
      onChangeText={onChange}
      returnKeyType="done"
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChange('')} style={styles.clearButton}>
        <Ionicons name="close-circle" size={20} color="#A0A0A0" />
      </TouchableOpacity>
    )}
  </View>
);


const FruitCard = ({ item, onPress}: { item: Fruit; onPress: () => void }) => (
  <TouchableOpacity style={[styles.cardContainer, { backgroundColor: "#1C1C1E" }]} onPress={onPress} activeOpacity={0.8}>
    <Image 
      source={fruitImages[item.slug] || fruitImages.default}
      style={styles.cardImage}
    />
    <View style={styles.cardOverlay}>
      <View style={styles.badgeContainer}>
        <Text style={[styles.badgeText, { color: "#FFD700" }]}>#{item.plu_code}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
    </View>
  </TouchableOpacity>
);


const EmptyState = ({ searchQuery }: { searchQuery: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="search-outline" size={60} color="#A0A0A0" />
    <Text style={[styles.emptyTitle, { color: "#FFFFFF" }]}>Ничего не найдено</Text>
  </View>
);


export default function MenuScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMonuments = fruitData.filter(fruit => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') return true;

    const idMatch = String(fruit.plu_code).includes(query);
    const nameMatch = `${fruit.id}.name`.toLowerCase().includes(query);

    return idMatch || nameMatch;
  });

  const handleFruitPress = (fruit: Fruit) => {
    router.push(`/info?slug=${fruit.slug}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]}>
      <StatusBar barStyle="light-content" />

      <MenuHeader onBack={handleBack} />
      <View style={styles.topSection}>
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Фрукты</Text>
        
        <FlatList
          data={filteredMonuments}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState searchQuery={searchQuery} />}
          renderItem={({ item }) => (
            <FruitCard 
              item={item} 
              onPress={() => handleFruitPress(item)} 
            />
          )}
        />
      </View>
    </View>
  );
}

// --- Styles ---
const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
// Вычисляем ширину карточки: половина экрана минус отступы по бокам и между карточками
const CARD_WIDTH = (width - 40 - CARD_MARGIN * 2) / 2; 

const styles = StyleSheet.create({
  container: { flex: 1 },

  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  
  // Header
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContainer: { backgroundColor: 'black', zIndex: 10 },
  headerContent: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  appTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleHighlight: {
    color: '#FFD700', // Желтый акцент
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },

  // List & Section
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  flatListContent: {
    paddingBottom: 40, // Отступ снизу для удобного скролла
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Card
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3, // Делаем карточку немного вытянутой по вертикали
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Затемнение, чтобы текст всегда читался
    justifyContent: 'space-between',
    padding: 12,
  },
  badgeContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
});