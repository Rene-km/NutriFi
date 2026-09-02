import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { RecipeResult } from "@/lib/api";

import RecipeCard from "./RecipeCard";


type SearchViewProps = {
  text: string;
  onChangeText: (value: string) => void;
  runSearch: () => void;
  isLoading: boolean;
  data: RecipeResult[];
  containerStyle: StyleProp<ViewStyle>;
  inputStyle: StyleProp<TextStyle>;
  onNavigate: (id: number, title: string, image: string) => void;
  profile: string  | null;
};

export default function SearchView({
  text,
  onChangeText,
  runSearch,
  isLoading,
  data,
  containerStyle,
  inputStyle,
  onNavigate,
  profile,
}: SearchViewProps) {
  const renderItem = ({ item }: { item: RecipeResult }) => (
    <RecipeCard
    item={item}
    onNavigate={onNavigate}
    />
  );

  return (
    <View style={containerStyle}>
      <TextInput
        style={inputStyle}
        onChangeText={onChangeText}
        placeholder="Search for a recipe"
        placeholderTextColor="#6b7280"
        onSubmitEditing={runSearch}
        returnKeyType="search"
        testID="search-input"
      />

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
        style={{marginTop: 20}}
          data={data}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={({ title }) => title}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
});