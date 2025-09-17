import { StyleSheet, Text, View, FlatList, Pressable, TextInput} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "react-native";
import React,  { useEffect, useState, useRef } from 'react'
import Realm from 'realm'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native"
import { RefreshControl } from 'react-native-gesture-handler';
import { useRealm } from '../useRealm';
import { useObjects } from '../useObjects';

const api = axios.create();

api.interceptors.request.use((config) => {
  console.log("[Request]",config);
  return config;
});

api.interceptors.response.use(
  (res) => {
  console.log("[Response]",res);
  return res;
},
(err) => {
  console.log("[Error]",err);
  return Promise.reject(err);
}
);

export default function OrdersScreen({ route }) {

const { type } = route.params;

const [refreshing, setRefreshing] = useState(false)
const [supplierQuery, setSupplierQuery] = useState("");
const [noteQuery, setNoteQuery] = useState("");

const navigation = useNavigation();
const realm = useRealm();
const flatListRef = useRef(null);
let notes = []
try {
  notes = useObjects("Orders")  || []//realm's live collection
} catch(e) {
  console.log("Realm hook failed", e);
}

useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [notes]); // whenever notes change, jump to top

  // --- Fetch & save orders ---
async function fetchAndSaveOrders() {
    
      const dpa = await SecureStore.getItemAsync("depot");
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const res = await axios.post(apiUrl+"/rest.desadv.cls?func=DeAdList", {
        depot : dpa, 
      },
        {
           headers: {
             "Content-Type": "application/json",
            },
          });

      const data = res.data;
        //console.log("data",data)
      try {
         if (!realm) return;
         realm.write(() => {

            //Realm.deleteFile({ schema: [OrdersSchema], path: "orders.realm" });
            realm.delete(realm.objects("Orders"));

           data.forEach(item => {
              // Check if order already exists
             const existingOrder = realm.objectForPrimaryKey("Orders", item.order);

              const savedOrder = realm.create("Orders", {
                  id: item.order,
                  deliveryNote: item.ref1AA,
                  depot: item.depot,
                  arrival: item.arrival,
                  supplier: item.supplier,
                  article: item.article,
                  description : item.description,
                  profile: item.profile,
                  ean: item.ean,
                  brand: item.brand,
                  quantity: parseInt(item.quantity,10),
                  quantitycfm: existingOrder ? existingOrder.quantitycfm : 0,
                
              }, Realm.UpdateMode.Modified)

              console.log("Created:",savedOrder.id,"->", savedOrder.deliveryNote)
             
      });
      });
      
      } catch(e) {
        console.log("Realm create failed",e);
      }    
    }

useEffect(() => {
  const init = async() => {
  await fetchAndSaveOrders();
}
 init();
    
}, [realm]);

if (!notes || notes.length === 0) {
  return <Text>Loading orders...</Text>;
}

const today = new Date();
const zd8 =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  
const notes1 = type === "nu"
  ? realm.objects("Orders").filtered("arrival <= $0", zd8)
  : realm.objects("Orders").filtered("arrival > $0", zd8);

const onRefresh = async () => {
    setRefreshing(true);
    await fetchAndSaveOrders();
    setRefreshing(false);
    };

function getDistinctNotes(dlvs) {
  const map = new Map();

  dlvs.forEach(item => {
    const key = item.id.split('|').slice(0, 2).join('|');
    if (!map.has(key)) {
      // Determine if this order is confirmed
      const isConfirmed = item.quantitycfm > 0;

      map.set(key, {
        orderid: item.id,
        deliveryNote: item.deliveryNote,
        arrival: item.arrival,
        supplier: item.supplier,
        confirmed: isConfirmed // add the property
      });
    } else {
      // If deliveryNote already exists, update confirmed if any item is confirmed
      const existing = map.get(key);
      if (item.quantitycfm > 0) {
        existing.confirmed = true;
      }
    }
  });

  return Array.from(map.values());
}  

// --- Prepare distinct sorted notes ---
const distinctNotesSorted = getDistinctNotes(notes1).sort(
    (a, b) => Number(b.confirmed) - Number(a.confirmed)
  );

  console.log("notessorted",distinctNotesSorted )
  
   // --- Apply search filters ---
  const filteredData = distinctNotesSorted.filter((item) => {
    const matchesSupplier = supplierQuery
      ? item.supplier?.toLowerCase().includes(supplierQuery.toLowerCase())
      : true;
    const matchesNote = noteQuery
      ? item.deliveryNote?.toLowerCase().includes(noteQuery.toLowerCase())
      : true;
    return matchesSupplier && matchesNote;
  });


  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
     <Text style={styles.title}>Delivery Notes</Text>
     <View style={{ flexDirection: "row", padding: 8, gap: 8 }}>
  <TextInput
    style={[styles.searchInput, { flex: 1 }]}
    placeholder="Search by Supplier..."
    value={supplierQuery}
    onChangeText={setSupplierQuery}
  />
  <TextInput
    style={[styles.searchInput, { flex: 1 }]}
    placeholder="Search by Delivery Note..."
    value={noteQuery}
    onChangeText={setNoteQuery}
  />
</View>


     <FlatList
     ref={flatListRef}
      data={filteredData}
      keyExtractor={(item) => item.orderid}
      renderItem={({ item }) => (
        <Pressable onPress={() => {
          navigation.navigate("Order",{"arrival" : item.arrival, "supplier": item.supplier, "deliveryNote": item.deliveryNote})
        }}>
       <View style={[styles.card, item.confirmed && styles.confirmedCard]}>
          <Text style={styles.supplier}>🏭 Supplier: {item.supplier}</Text>
          <Text>📅 Arrival: {item.arrival}</Text>
          <Text>📦 Delivery Note: {item.deliveryNote}</Text>
        </View>
        </Pressable>
      )
    }
    refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
   {/*<LogoutButton/>*/} 
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    elevation: 3,
    shadowColor: "#000", //shadow on ios
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  confirmedCard: {
    backgroundColor: "#e0ffe0", // light green for confirmed
    borderColor: "#00aa00",
  },
  supplier: {
    fontWeight: "600",
  },
  searchInput: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 8,
  marginBottom: 10,
}

})