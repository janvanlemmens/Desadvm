import { StyleSheet, Text, View, Modal, TextInput} from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import CustomPressable from "./CustomPressable";

const NewOrder = ({ visible, onClose}) => {

const [suppliers, setsetSuppliers] = useState([]);
const [supplier, setSupplier] = useState("");
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

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
      //data.sort((a, b) => a.supplier.localeCompare(b.supplier));    
        //setsetSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }
    loadSuppliers();
  }, [suppliers]);

  function handleClose() {
    onClose();
    setSupplier("");    
  }


  return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
       
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
             <TextInput
                        placeholder="Supplier"
                        style={styles.input}
                        value={supplier}
                        onChangeText={setSupplier}
                      />
                       <CustomPressable
                                      text="Save"
                                      borderRadius={18}
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
  },
})