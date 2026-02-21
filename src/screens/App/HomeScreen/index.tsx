import React, { useRef, useState } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";

// components
import Header from "../../../components/HomeScreen/Header";
import SearchBar from "../../../components/HomeScreen/SearchBar";
import CategoryTabs from "../../../components/HomeScreen/CategoryTabs";
import ListItem from "../../../components/HomeScreen/ListItem";
import AddButton from "../../../components/HomeScreen/AddButton";
import ItemPreviewSheet from "../../../components/HomeScreen/ItemPreviewSheet";

import styles from "./styles";

const VAULT_DATA = [
  {
    id: "1",
    title: "Google",
    category: "social",
    url: "google.com",
    icon: "logo-google",
    iconBg: "rgba(255, 0, 0, 0.1)", // Light red background for icon
  },
  {
    id: "2",
    title: "Chase Bank",
    category: "finance",
    url: "chase.com",
    icon: "business-outline",
    iconBg: "rgba(0, 0, 255, 0.1)",
  },
  {
    id: "3",
    title: "Slack",
    category: "work",
    url: "slack.com",
    icon: "chatbubble-outline",
    iconBg: "rgba(128, 0, 128, 0.1)",
  },
  {
    id: "4",
    title: "Netflix",
    category: "personal",
    url: "netflix.com",
    icon: "film-outline",
    iconBg: "rgba(255, 255, 255, 0.1)", // In the design Netflix is dark red
  },
  {
    id: "5",
    title: "Dropbox",
    category: "work",
    url: "dropbox.com",
    icon: "folder-open-outline",
    iconBg: "rgba(0, 128, 255, 0.1)",
  },
];

// Re-adjusting iconBg for exact match with design if possible
VAULT_DATA[0].iconBg = "#FFF1F1"; // Google
VAULT_DATA[1].iconBg = "#F0F4FF"; // Chase
VAULT_DATA[2].iconBg = "#FBF2FF"; // Slack
VAULT_DATA[3].iconBg = "#8B1A1A"; // Netflix (dark red as per design image)
VAULT_DATA[4].iconBg = "#F0F9FF"; // Dropbox

function HomeScreen() {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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
      url={item.url}
      icon={item.icon}
      iconBg={item.iconBg}
      onPress={() => handlePresentItem(item)}
    />
  )

  const keyExtractor = (item: any) => item.id;

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SearchBar value={""} onChange={() => { }} />
      <CategoryTabs />
      <FlatList
        data={VAULT_DATA}
        keyExtractor={keyExtractor}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <AddButton onPress={() => navigation.navigate('AddListItem' as never)} />
      <ItemPreviewSheet
        ref={bottomSheetModalRef}
        item={selectedItem}
        onClose={() => bottomSheetModalRef.current?.dismiss()}
      />
    </SafeAreaView>
  );
}

export default HomeScreen;
