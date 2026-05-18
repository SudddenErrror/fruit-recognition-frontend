import { FruitHero } from '@/src/components/FruitHero';
import { InfoTable } from '@/src/components/InfoTable';
import { TopNavigation } from '@/src/components/TopNavigation';
import { useRouter, useLocalSearchParams  } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { fruitData } from '@/src/store/fruitData';


// --- Main Screen Component ---
export default function FruitDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const fruit = fruitData.find(f => f.slug === slug);

  const handleBack = () => {
    console.log("Go back!");
    router.back();
  };

  if (!fruit) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TopNavigation onBack={handleBack} title="Details" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Loading fruit data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <TopNavigation onBack={handleBack} title="Details" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <FruitHero 
          imageUrl={fruit.image_url ?? ""} 
          name={fruit.name ?? "Не распознан"} 
          scientificName={fruit.scientific_name}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>
            {fruit.description}
          </Text>
        </View>

        <InfoTable title="Пищевая ценность (100г)" data={fruit.nutrition ?? []} />
        <InfoTable title="Витамины" data={fruit.vitamins ?? []} />
        <InfoTable title="Макроэлементы" data={fruit.macronutrients ?? []} />
        <InfoTable title="Микроэлементы" data={fruit.micronutrients ?? []} />

        <View style={{ height: 40 }} />

      </ScrollView>
    </View>
  );
}

// --- Styles ---
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Основной фон как в камере
  },
  
  // --- Nav Styles ---
  navContainer: {
    backgroundColor: 'black',
    zIndex: 10,
  },
  navContent: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  // --- Scroll Styles ---
  scrollContent: {
    paddingBottom: 20,
  },

  // --- Hero Styles ---
  heroContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: width,
    height: 300,
  },
  heroTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    // Градиент или полупрозрачный фон для читаемости текста на картинке
    backgroundColor: 'rgba(0,0,0,0.6)', 
  },
  fruitName: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  scientificName: {
    color: '#ccc',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // --- Section & Table Styles ---
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#FFD700', // Используем тот же желтый цвет, что был у вспышки
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  descriptionText: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
  },

  // Table styling (iOS Settings style dark mode)
  tableContainer: {
    backgroundColor: '#1C1C1E', // Темно-серый фон плашки
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A', // Разделитель
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  tableLabel: {
    color: 'white',
    fontSize: 16,
  },
  tableValue: {
    color: '#A0A0A0', // Чуть более тусклый для значений
    fontSize: 16,
  },
});