import { StyleSheet, Text, View, Modal, TextInput} from 'react-native'
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

 useEffect(() => {
    async function loadSuppliers() {
        const dpa = await SecureStore.getItemAsync("depot");
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

  function handleClose() {
    onClose();
    setSupplier("");   
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
  }
  function handleSelectSupplier(supp) {
    setSupplier(supp);
  }


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
                       <CustomPressable
                        text="Add Order"
                        borderRadius={18}
                        style ={{marginTop:20, backgroundColor:"#0EA371"}}
                        hoverColor="#0EA371" // only on web
                        onPress={handleClose}
                                      /> 
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
    width: 300,
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
    minWidth: 300,
  },
})