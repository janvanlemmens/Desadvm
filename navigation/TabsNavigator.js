import { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
//import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from '@expo/vector-icons';
import OrdersScreen from "../screens/OrdersScreen";
import OrderScreen from "../screens/OrderScreen";
import ScanScreen from "../screens/ScanScreen";
import { Text, View, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";

const Tab = createBottomTabNavigator();

function withIconTitle(title, iconName) {
  return () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={iconName} size={22} style={{ marginRight: 6 }} />
      <Text style={{ fontSize: 18, fontWeight: "600" }}>{title}</Text>
    </View>
  );
}

const HeaderUsername = ({ name }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Ionicons name="person-circle-outline" size={20} />
    <Text style={{ marginLeft: 6 }}>{name}</Text>
  </View>
);

const HeaderMenu = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} />
      </TouchableOpacity>

      {open ? (
        <View
          style={{
            position: "absolute",
            top: 28,
            right: 0,
            backgroundColor: "white",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
            minWidth: 120,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <Text>Uitloggen</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default function TabsNavigator({ onLogout }) {
  const [uname, setUname] = useState(null);

  const logout = () => {
    // jouw logout logica
    console.log("Logged out");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const usr = await SecureStore.getItemAsync("uname");
        if (mounted) setUname(usr ?? ""); // fallback to empty string if not set
      } catch (e) {
        if (mounted) setUname(""); // avoid staying null on error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (uname === null) {
    // show nothing or a tiny loader while we fetch
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center", // titel centreren
        headerLeft: () => <HeaderUsername name={uname} />, // uiterst links
        headerLeftContainerStyle: { paddingLeft: 12 },
        headerRight: () => <HeaderMenu onLogout={onLogout} />, // uiterst rechts
        headerRightContainerStyle: { paddingRight: 12 },
        tabBarActiveTintColor: "#333",
      }}
    >
      <Tab.Group>
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          initialParams={{ type: "nu" }}
          options={{
            headerTitle: withIconTitle("Orders", "cube-outline"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={OrdersScreen}
          initialParams={{ type: "nietnu" }}
          options={{
            headerTitle: withIconTitle("Search", "search-outline"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Order"
          component={OrderScreen}
          initialParams={{ orderid: null }}
          options={{
            headerTitle: withIconTitle("Order", "create-outline"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="create-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarButton: () => null, // hide from the tab bar
            tabBarStyle: { display: "none" }, // v6/v7 way to hide bar when focused
          }}
        />
      </Tab.Group>
    </Tab.Navigator>
  );
}

/*
/tabBar={(props) => <CustomTabBar {...props} />}
screenOptions={{
        headerTitleAlign: "center",
        tabBarShowLabel: true,
        tabBarStyle: { justifyContent: "space-around" },
      }}
*/
