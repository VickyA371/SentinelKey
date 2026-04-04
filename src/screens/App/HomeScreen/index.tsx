import React, { useRef, useState } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// components
import Header from "../../../components/HomeScreen/Header";
import SearchBar from "../../../components/HomeScreen/SearchBar";
import CategoryTabs from "../../../components/HomeScreen/CategoryTabs";
import ListItem from "../../../components/HomeScreen/ListItem";
import AddButton from "../../../components/HomeScreen/AddButton";
import ItemPreviewSheet from "../../../components/HomeScreen/ItemPreviewSheet";
import EmptyList from "../../../components/HomeScreen/EmptyList";

// constants
import { COLLECTIONS } from "../../../constants/firebase";

// styles
import styles from "./styles";

// types
import { AppScreensPropTypes } from "../../../navigation/types";

// misc
import { getCategoryIcon, getDynamicColor } from "../../../utils/mapping";

function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppScreensPropTypes>>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [vaultData, setVaultData] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const user = auth().currentUser;
    const subscriber = firestore()
      .collection(COLLECTIONS.PASSWORDS)
      .where('userId', '==', user?.uid)
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
    const matchesCategory = activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderEmptyListComponent = () => <EmptyList loading={loading} />

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <CategoryTabs
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      <FlatList
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyListComponent}
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
