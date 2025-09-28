// OrderItem.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Modal, Button } from "react-native";
import { useRealm } from '../useRealm';
import CustomPressable from "./CustomPressable";

export default function OrderItem({ item , onDelete }) {

 if (!item || !item.isValid()) {
    return null;
  }

  const safeId = item.id; // now safe, only runs if valid

  const [confirmedQty, setConfirmedQty] = useState(item.quantitycfm || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDescription, setNewDescription] = useState(item.description);

  const realm = useRealm();

 useEffect(() => {
    setConfirmedQty(item.quantitycfm || 0);
  }, [item.quantitycfm]);

  useEffect(() => {
  if (!item || !item.isValid()) {
    setModalVisible(false);
  }
}, [item]);

  const updateRealmQty = (newQty) => {
    setConfirmedQty(newQty);

    if (!realm) return;

    realm.write(() => {
      const order = realm.objectForPrimaryKey("Orders", item.id);
      if (order) order.quantitycfm = newQty;
    });
  };

  const updateRealmDescription = () => {
    if (!realm) return;

    realm.write(() => {
      const order = realm.objectForPrimaryKey("Orders", item.id);
      if (order) order.description = newDescription;
    });

    setModalVisible(false);
  };

  const deleteItem = () => {
   
     setModalVisible(false);
     // notify parent so it removes this item from its list
    if (onDelete && safeId) onDelete(safeId);
  }

  const increment = () => updateRealmQty(confirmedQty + 1);
  const decrement = () => updateRealmQty(Math.max(0, confirmedQty - 1));

  return (
    <View style={styles.card}>
      {/* Line 1 */}
        <Pressable onPress={() => setModalVisible(true)}>
       <Text style={styles.description}>{item.description}</Text>

          {/* Line 2 */}
      <Text style={styles.subtext}>
        {item.profile} - {item.brand}
      </Text>
        </Pressable>
     

          {/* Modal for editing description */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Description</Text>
            <TextInput
              style={styles.modalInput}
              value={newDescription}
              onChangeText={setNewDescription}
            />
          

           <View style={{ flexDirection: "row", padding: 8, gap: 8, justifyContent : 'space-between'}}>
                 <CustomPressable
                text="Cancel"
                style = {{paddingVertical: 4, borderRadius: 8, height: 32}}
                textStyle = {{ fontSize: 16, fontWeight: "500"}}
                hoverColor="#0EA371" // only on web
                onPress={() => setModalVisible(false)}
                /> 
                <CustomPressable
                text="Delete"
                style = {{paddingVertical: 4, borderRadius: 8, height: 32}}
                textStyle = {{ fontSize: 16, fontWeight: "500"}}
                hoverColor="#0EA371" // only on web
                onPress={deleteItem}
                />
                 <CustomPressable
                text="Save"
                style = {{paddingVertical: 4, borderRadius: 8, height: 32}}
                textStyle = {{ fontSize: 16, fontWeight: "500"}}
                hoverColor="#0EA371" // only on web
                onPress={updateRealmDescription}
                />
                </View>


          </View>
        </View>
      </Modal>

   

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
            style={[styles.qtyInput, confirmedQty === item.quantity && confirmedQty > 0 && {
              backgroundColor: "#8cf68cff",
              color: "#000",
              borderWidth: 2,
              borderColor: "#00aa00",
              shadowColor: "#00aa00",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 3, // Android shadow
            }
          ]}
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
    color: "#000", // default text color
    backgroundColor: "#fff", // default background
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
  },
  modalOverlay: {
  flex: 1,
  justifyContent: "center",  // centers vertically
  alignItems: "center",      // centers horizontally
  backgroundColor: "rgba(0,0,0,0.5)", // dimmed background
},
modalContent: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 20,
  elevation: 5,
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
},
modalTitle: {
  fontSize: 18,
  color: "#c96161ff",
},
modalInput: {
  borderWidth: 2,
  borderColor: "#ccc",
  borderRadius: 6,
  padding: 6,
}

});
