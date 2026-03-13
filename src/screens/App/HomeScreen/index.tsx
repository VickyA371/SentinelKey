import React, { useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { NavigationProp, useNavigation } from "@react-navigation/native";

// components
import Header from "../../../components/HomeScreen/Header";
import SearchBar from "../../../components/HomeScreen/SearchBar";
import CategoryTabs from "../../../components/HomeScreen/CategoryTabs";
import ListItem from "../../../components/HomeScreen/ListItem";
import AddButton from "../../../components/HomeScreen/AddButton";
import ItemPreviewSheet from "../../../components/HomeScreen/ItemPreviewSheet";
import AppText from "../../../components/Common/AppText";

import colors from "../../../constants/colors";
import styles from "./styles";

// types
import { AppScreensPropTypes } from "../../../navigation/types";

// Re-adjusting iconBg for exact match with design if possible
// VAULT_DATA removed as it is now fetched from Firestore

import firestore from '@react-native-firebase/firestore';
import { getCategoryIcon, getDynamicColor } from "../../../utils/mapping";
import { COLLECTIONS } from "../../../constants/firebase";

function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppScreensPropTypes>>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [vaultData, setVaultData] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const subscriber = firestore()
      .collection(COLLECTIONS.PASSWORDS)
      .onSnapshot(querySnapshot => {
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            icon: getCategoryIcon(data.category),
            iconBg: getDynamicColor(doc.id)
          };
        });
        setVaultData(items);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  const handlePresentItem = (item: any) => {
    setSelectedItem(item);
    setTimeout(() => {
      // present bottom sheet after re-rendering
      bottomSheetModalRef.current?.present();
    }, 0)
  };

  const renderListItem = ({ item }: ListRenderItemInfo<any>) => (
    <ListItem
      title={item.title}
      category={item.category}
      icon={item.icon}
      iconBg={item.iconBg}
      onPress={() => handlePresentItem(item)}
    />
  )

  const keyExtractor = (item: any) => item.id;

  const filteredData = vaultData.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
      <FlatList
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
            <AppText style={{ color: colors.mutedBlueGray }}>
              {loading ? "Loading your vault..." : "No items found"}
            </AppText>
          </View>
        )}
      />
      <AddButton onPress={() => navigation.navigate('AddListItem')} />
      <ItemPreviewSheet
        ref={bottomSheetModalRef}
        item={selectedItem}
        onClose={() => bottomSheetModalRef.current?.dismiss()}
      />
    </SafeAreaView>
  );
}

export default HomeScreen;
