import { StyleSheet, Text, View, FlatList,TextInput, Pressable, Alert } from 'react-native'
import CustomPressable from '../components/CustomPressable'
import React,  { useEffect, useState } from 'react'
import OrderItem from '../components/OrderItem'
import { useRealm } from '../useRealm';
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const OrderScreen = ({route, navigation}) => {
const {arrival, supplier, deliveryNote} = route.params ?? {};
const [order, setOrder] = useState([]);

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const realm = useRealm();

useEffect(() => {
    

    async function loadDelines() {
      try {
       // console.log("📂 Opening Realm...");

       if (!realm) return;
       
        //console.log("arr+sup",arrival+"-"+supplier)
        const results = realm
          .objects("Orders")
          .filtered("arrival == $0 and supplier ==  $1", arrival, supplier);

         setOrder(results); // keep Realm objects live
        console.log("📊 Query results:", results.length);
      } catch (e) {
        console.error("Error opening realm", e);
      }
    }

    loadDelines();

    
  }, [arrival,supplier]);

  useEffect(() => {
    if (!realm) return;
    const data = realm.objects("Orders")
     .filtered("arrival == $0 and supplier ==  $1", arrival, supplier)
    .sorted("id");
    setOrder([...data]);

    // live updates when realm changes
    const listener = () => setOrder([...data]);
    data.addListener(listener);

    return () => data.removeListener(listener);
  }, [realm]);

  const handleConfirm = async () => {
    //const allConfirmed = order.every(item => item.quantitycfm > 0);
    const atLeastOneConfirmed = order.some(item => item.quantitycfm > 0);

   if (!atLeastOneConfirmed) {
    alert("No items have quantitycfm > 0");
    return; // stop execution if none are confirmed
  }

  const token = await SecureStore.getItemAsync("token");
    
  try {
    const results = realm.objects("Orders").filtered("arrival == $0 AND supplier == $1", arrival, supplier);
    // 2. Map to a JSON-friendly array
    const ordersToPost = results.map(item => ({
      id: item.id,
      deliveryNote: item.deliveryNote,
      depot: item.depot,
      arrival: item.arrival,
      supplier: item.supplier,
      article: item.article,
      description: item.description,
      profile: item.profile,
      ean: item.ean,
      brand: item.brand,
      quantity: item.quantity,
      quantitycfm: item.quantitycfm,
    }));
    // 3. Send POST request
    const response = await axios.post(`${apiUrl}/rest.desadv.cls?func=DeAdCfm`, {
      orders: ordersToPost,
      token: token
    });

    console.log("Server response:", response.data);
    if (!response.data?.success) {return;}

    realm.write(() => {
      realm.delete(results);
    })
    navigation.navigate("Orders",{"type" : 'nu'})
   

  } catch (error) {
  console.error("Failed to post orders:", error);
   alert("Failed to post orders. Please try again.");
  }
   
  }

  const handleDelete = (id) => {
    if (!realm) return;
  // filter out deleted item from local state (React UI)
 realm.write(() => {
    const order = realm.objectForPrimaryKey("Orders", id);
    if (order) realm.delete(order);
    const results = realm
          .objects("Orders")
          .filtered("arrival == $0 and supplier ==  $1", arrival, supplier);

         setOrder(results); // keep Realm objects live
  });
};


  return (
    <View style={styles.container}>
      <View style={{alignItems: "center"}}> 
       <Text style={styles.title}>Note : {deliveryNote}</Text>
      </View>
       <View style={{ flexDirection: "row", padding: 8, gap: 8, justifyContent : 'space-between'}}>
       <CustomPressable
      text="Start Scan"
      borderRadius={18}
      hoverColor="#0EA371" // only on web
      onPress={() => {
          navigation.navigate("Scan",{"arrival" : arrival, "supplier": supplier, "deliveryNote": deliveryNote})
        }}
      /> 
      <CustomPressable
      text="Confirm"
      borderRadius={18}
      hoverColor="#0EA371" // only on web
      onPress={handleConfirm}
      />
      </View>
    
    <FlatList
  data={order.filter(o => o.isValid())}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <OrderItem item={item} onDelete={handleDelete}/>}
  style={{ flex: 1, marginTop: 10 }}
/>

    </View>
  )
}

export default OrderScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtext: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginHorizontal: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    minWidth: 50,
    textAlign: "center",
    fontSize: 16,
  },
});