// OrderItem.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRealm } from '../useRealm';


export default function OrderItem({ item }) {
  const [confirmedQty, setConfirmedQty] = useState(item.quantitycfm || 0);

  const realm = useRealm();

 useEffect(() => {
    setConfirmedQty(item.quantitycfm || 0);
  }, [item.quantitycfm]);

  const updateRealmQty = (newQty) => {
    setConfirmedQty(newQty);

    if (!realm) return;

    realm.write(() => {
      const order = realm.objectForPrimaryKey("Orders", item.id);
      if (order) order.quantitycfm = newQty;
    });
  };

  const increment = () => updateRealmQty(confirmedQty + 1);
  const decrement = () => updateRealmQty(Math.max(0, confirmedQty - 1));

  return (
    <View style={styles.card}>
      {/* Line 1 */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Line 2 */}
      <Text style={styles.subtext}>
        {item.profile} - {item.brand}
      </Text>

      {/* Line 3 */}
      <View style={styles.row}>
        <Text style={styles.subtext}>
          EAN : {item.ean} - QTY : {item.quantity}
        </Text>

        <View style={styles.qtyContainer}>
          <Pressable style={styles.qtyButton} onPress={decrement}>
            <Text style={styles.qtyButtonText}>-</Text>
          </Pressable>

          <TextInput
            style={[styles.qtyInput, confirmedQty === item.quantity && {backgroundColor: '#8cf68cff', color: '#000'}]}
            keyboardType="numeric"
            value={String(confirmedQty)}
             placeholderTextColor="#000"
             selectionColor="#000"
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              updateRealmQty(num);
            }}
          />

          <Pressable style={styles.qtyButton} onPress={increment}>
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  description: {
    fontSize: 16,
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
    backgroundColor: "#c96161ff",
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
   card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 6,
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
  }
});
