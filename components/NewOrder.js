import { StyleSheet, Text, View, Modal, FlatList, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import CustomPressable from "./CustomPressable";
import AutocompleteInput from './AutocompleteInput';
import { useRealm } from '../useRealm';

const NewOrder = ({ visible, onClose}) => {

const [suppliers, setsetSuppliers] = useState([]);
const [supplier, setSupplier] = useState("");
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const realm = useRealm();
const [dpa, setDpa] = useState("");
const [allnotes, setAllNotes] = useState([]);
const [notes, setNotes] = useState([]);
const [selected, setSelected] = useState([]); // keep track of clicked ref1AA values


 useEffect(() => {
    async function loadSuppliers() {
        const dpa = await SecureStore.getItemAsync("depot");
        setDpa(dpa);
      try {
       const response = await axios.post(
        apiUrl + "/rest.desadv.cls?func=DeAdSupp",
        {
          depot : dpa
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Suppliers:", response.data);
      const data = response.data || [];
      const sarr = response.data.map(item => item.Supplier);
      setsetSuppliers(sarr);
       console.log("Suppliers loaded:", sarr);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }
    loadSuppliers();
  }, []);
  
  function handleCancel() {
    onClose();
    setSupplier("");   
    setNotes([]);
    setAllNotes([]);
    setSelected([]);
  }

  function handleClose() {
    onClose();
    
    if (!realm) return;
    if (!supplier) return;

    const existing = realm
      .objects("Orders")
      .filtered("supplier == $0", supplier);
    if (existing.length > 0) {
      console.log("Supplier already exists locally, not adding.");
      alert("Order for this supplier already exists.");
      return;
    }
      if (selected.length === 0) {
    realm.write(() => {
      const today = new Date();
      const formatted = today.toISOString().split("T")[0];
        const newOrder = realm.create("Orders", {
        id: `${formatted}|${supplier}|9999999999999`, // unique id
        deliveryNote: "New Order",
        depot: dpa,
        arrival: formatted,
        supplier: supplier,
        article: "",
        description: "Unknown item",
        profile: "N/A",
        ean: "9999999999999",
        brand: "N/A",
        quantity: 0,
        quantitycfm: 0,
      });
      console.log("New order added:", newOrder);
    })
    } else {
    realm.write(() => {
      const today = new Date();
      const formatted = today.toISOString().split("T")[0];
      selected.forEach((ref1AA) => {
        // find all entries in allnotes with this ref1AA
        const entries = allnotes.filter(item => item.ref1AA === ref1AA);
        entries.forEach(item => {
          const uniqueId = `${formatted}|${supplier}|${item.ean}`;
          // Check if order with this id already exists
          const existingOrder = realm.objectForPrimaryKey("Orders", uniqueId);
          if (!existingOrder) {
            const newOrder = realm.create("Orders", {
              id: uniqueId,
              deliveryNote: item.ref1AA,
              depot: item.depot,
              arrival: item.arrival,
              supplier: item.supplier,
              article: item.article,
              description : item.description || "Unknown item",
              profile: item.profile || "N/A",
              ean: item.ean,
              brand: item.brand || "N/A",
              quantity: parseInt(item.quantity,10),
              quantitycfm: 0,
            });
            console.log("New order added:", newOrder);
          } else {
            // update existing order
           // increase quantity
            existingOrder.quantity += parseInt(item.quantity, 10);
           // expand delivery note
           existingOrder.deliveryNote = `${existingOrder.deliveryNote}-${item.ref1AA}`;
    console.log(`Order with id ${uniqueId} already exists. Updated quantity = ${existingOrder.quantity}, deliveryNote = ${existingOrder.deliveryNote}`);

          }
        });
      });
    });
  }
    setSupplier("");   
    setNotes([]);
    setAllNotes([]);
    setSelected([]);
  };


  async function handleSelectSupplier(supp) {
    setSupplier(supp);
    const result = await axios.post(
        apiUrl + "/rest.desadv.cls?func=SuppOpen",
        {
          depot : dpa,
          supplier: supp
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
       // extract ref1AA values
    setAllNotes(result.data);
    const allRefs = result.data.map(item => item.ref1AA);
   const uniqueRefs = [...new Set(allRefs)];
    setNotes(uniqueRefs.map(ref => ({ ref1AA: ref })));
    console.log("All notes:", allnotes);
   
  }

  const toggleSelect = (ref1AA) => {
    setSelected((prev) => {
      if (prev.includes(ref1AA)) {
        // already selected → remove
        return prev.filter((id) => id !== ref1AA);
      } else {
        // not selected → add
        return [...prev, ref1AA];
      }
    });
  };


  return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
       
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
             <AutocompleteInput
            data={suppliers}
            placeholder="Search supplier..."
            onSelect={handleSelectSupplier}
         />
         <View style={{height: 300, width: '100%', marginTop: 12}}>
         <FlatList
        data={notes}
        keyExtractor={(item) => item.ref1AA}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.ref1AA);
          return (
            <TouchableOpacity onPress={() => toggleSelect(item.ref1AA)}>
              <View style={[styles.item, isSelected && styles.itemSelected]}>
                <Text style={[styles.text, isSelected && styles.textSelected]}>
                  {item.ref1AA}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      </View>
       <View flexDirection="row" style={{justifyContent: 'space-between', width: '100%'}}>
          <CustomPressable
             text="Cancel"
             style = {{paddingVertical: 4, borderRadius: 8, height: 32, marginTop: 12}}
            textStyle = {{ fontSize: 16, fontWeight: "500"}}
            hoverColor="#0EA371" // only on web
            onPress={handleCancel}
             />
              <CustomPressable
             text="Add Order"
             style = {{paddingVertical: 4, borderRadius: 8, height: 32, marginTop: 12}}
            textStyle = {{ fontSize: 16, fontWeight: "500"}}
            hoverColor="#0EA371" // only on web
            onPress={handleClose}
             />
             </View>
          </View>
        </View>
      </Modal>
    );
}

export default NewOrder

const styles = StyleSheet.create({
    input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    width: 30
  },
   modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "90%",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  itemSelected: {
    backgroundColor: "#cce5ff", // highlight when selected
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  textSelected: {
    fontWeight: "bold",
    color: "#004085",
  },
})