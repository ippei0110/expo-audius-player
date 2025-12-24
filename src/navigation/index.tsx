import React from "react";
import { View, Pressable, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import QueueScreen from "../screens/QueueScreen";
import PlayerScreen from "../screens/PlayerScreen";

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Queue: undefined;
  Player: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

const titleMap: Record<keyof RootStackParamList, string> = {
  Home: "Home",
  Search: "Search",
  Queue: "Queue",
  Player: "Now Playing",
};

export default function Navigation() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => {
        const name = route.name as keyof RootStackParamList;

        // 右上に出すボタン（画面ごとに出し分け）
        const showSearch = name !== "Search";
        const showQueue = name !== "Queue";

        return {
          title: titleMap[name],

          // ヘッダーの統一スタイル
          headerTitleStyle: { fontWeight: "800" },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerBackTitleVisible: false,

          // 右上のボタン
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {showSearch && (
                <HeaderButton
                  label="Search"
                  onPress={() => navigation.navigate("Search")}
                />
              )}
              {showQueue && (
                <HeaderButton
                  label="Queue"
                  onPress={() => navigation.navigate("Queue")}
                />
              )}
            </View>
          ),
        };
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Queue" component={QueueScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
}
