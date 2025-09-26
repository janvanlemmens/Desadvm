import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, FlatList, Pressable } from "react-native";
import CustomPressable from "../components/CustomPressable";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { useRealm, useRealm1 } from "../useRealm";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";

export default function ScanScreen({ route, navigation }) {
  const { arrival, supplier, deliveryNote } = route.params;
  //const ref1AA = orderid.split("|")[1];
  const [barcode, setBarcode] = useState("");
  const [barcodes, setBarcodes] = useState([]);
  const [brand, setBrand] = useState("");
  const [depot, setDepot] = useState("");
  const inputRef = useRef(null);
  const flatListRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const lastScanRef = useRef({ code: null, ts: 0 });
  const realm = useRealm();
  const realm1 = useRealm1();
  const insets = useSafeAreaInsets();
  

  const updateQuantities = (arr, supp, barcodes) => {
    realm.write(() => {

      const upd0 =  realm
          .objects("Orders")
          .filtered("arrival == $0 and supplier == $1", arr, supp);

          upd0.forEach((item) => {
          item.quantitycfm = 0;
        });

      barcodes.forEach(({ code, count }) => {
        //console.log("code", code);
        const matchingItems = realm
          .objects("Orders")
          .filtered("arrival == $0 and supplier == $1 and ean == $2", arr, supp, code);
        
          
        matchingItems.forEach((item) => {
          item.quantitycfm = count;
        });

        if (matchingItems.length === 0) {

          realm.create("Orders", {
          id: `${arrival}|${supplier}|${code}`, // unique id
          arrival,
          supplier,
          ean: code,
          quantity: 0,
          quantitycfm: count,
          depot: depot,
          deliveryNote,
          article: code,
          description: "Unknown item",
          profile: "N/A",
          brand: "N/A"
        });

          
        }
      });
    });
  };

  const handleEndScan = () => {
    console.log("barcodes", barcodes);
    updateQuantities(arrival, supplier, barcodes);
    //barcodes [{"code": "3286341037012", "count": 4}]
    navigation.navigate("Order",{"arrival" : arrival, "supplier": supplier, "deliveryNote": deliveryNote})
  };

  // handle scanned code
  const handleScanComplete = (scannedCode) => {
    if (!scannedCode) return;
    const now = Date.now();
    if (
      lastScanRef.current.code === scannedCode &&
      now - lastScanRef.current.ts < 300
    ) {
      console.log("⚠️ Duplicate ignored:", scannedCode);
      return;
    }

    lastScanRef.current = { code: scannedCode, ts: now };
 let eandescr = "Unknown item";
    console.log("✅ scannedCode:", JSON.stringify(scannedCode));
     const results1 = realm1.objects("Eans").filtered("ean == $0", scannedCode);
     if (results1.length > 0) {
      console.log("Found in Eans:", results1[0].descr1);
      eandescr = results1[0].descr1;
     } else {
      console.log("EAN not found in database");
     }

    // Prevent empty or invalid codes
    if (!scannedCode || scannedCode.length < 3) {
      console.log("⚠️ Ignored invalid code:", scannedCode);
      setBarcode("");
      inputRef.current?.clear();
      inputRef.current?.focus();
      return;
    }

    // Add to list immutably
    setBarcodes((prev) => {
      // check if code already exists
      const existing = prev.find((item) => item.code === scannedCode);
      if (existing) {
        return prev.map((item) =>
          item.code === scannedCode ? { ...item, count: item.count + 1 } : item
        );
      } else {
        return [...prev, { code: scannedCode, count: 1 , descr: eandescr}];
      }
    });

    // Clear input for next scan
    setBarcode("");
    inputRef.current?.clear();
    inputRef.current?.focus();
  };

  const handleScanChange = (text) => {
    setBarcode(text);
    if (brand != "unitech") return;
    // clear previous timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // If scanner sends newline, process immediately
    if (text.endsWith("\n")) {
      if (text.trim() !== "") {
        handleScanComplete(text.trim());
      }
      return;
    }

    // start new timeout to detect end of input
    scanTimeoutRef.current = setTimeout(() => {
      console.log("brand", brand);
      if (text.trim() !== "") {
        handleScanComplete(text.trim());
      }
    }, 100); // 50ms after last input character
  };

  // handle Enter/Return key on emulator
  const handleSubmitEditing = () => {
    if (barcode.trim() !== "") {
      handleScanComplete(barcode.trim());
    }
  };

  // Refocus input every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // clear current input
      setBarcode("");
      // put cursor back
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);

      const initBarcodes = async () => {
      const brand = await SecureStore.getItemAsync("brand");
      const depot = await SecureStore.getItemAsync("depot");
      setBrand(brand);
      setDepot(depot);

      const results = realm
        .objects("Orders")
        .filtered("arrival == $0 AND supplier == $1", arrival, supplier);
      console.log("Initial results:", results.length);
       
      const barcodeArray = results.filtered("quantitycfm > 0").map(item => {
    console.log("Mapping item:", item.ean, item.quantitycfm);

        try {
          const match = realm1.objects("Eans").filtered("ean == $0", item.ean);
          console.log("Match length:", match.length);
         return {
          code: item.ean,
           count: item.quantitycfm,
          descr: match[0]?.descr1 ?? "",
       };
        } catch (e) {
          console.log("Error querying Eans:", e.message);
        return {
        code: item.ean,
        count: item.quantitycfm,
        descr: "",
  };
        }
    

  });

  console.log("Initial barcodes:", barcodeArray);

      setBarcodes(barcodeArray);
    };
    initBarcodes();

      return () => {
        setBarcodes([]);
      };
    }, [arrival, supplier, realm, realm1])
  );

 

  useEffect(() => {
    if (barcodes.length && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [barcodes]);

  const handleRemove = (code) => {
  setBarcodes((prev) => {
    const updated = prev.filter((item) => item.code !== code);
    console.log("Updated barcodes:", updated); // log the array that will actually be used
    return updated;
  });
};


  const renderRightActions = (index) => {
    return (
      <Pressable
        onPress={() => handleRemove(index)}
        style={{
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.title}>Note : {deliveryNote}</Text>
      </View>

      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Scan barcode..."
        value={barcode}
        onChangeText={handleScanChange} // scanner detection
        onSubmitEditing={handleSubmitEditing} // emulator support
        autoFocus
        showSoftInputOnFocus={false}
      />

      {/* FlatList showing scanned barcodes */}
      <FlatList
        ref={flatListRef}
        data={barcodes}
        keyExtractor={(item) => item.code}
        renderItem={({ item, index }) => (
           <Swipeable
          renderRightActions={() => renderRightActions(item.code)}
          onSwipeableOpen={() => handleRemove(item.code)}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.code}</Text>
            <Text style={{ fontSize: 18 }}>x{item.count}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#555', paddingLeft: 8 }}>{item.descr}</Text>
          </View>
</Swipeable>

        )}
        style={{ flex: 1, marginTop: 10 }}
      />

      {/* End Scan button pinned at bottom */}
      <CustomPressable
        text="End Scan"
        borderRadius={18}
        hoverColor="#0EA371"
        onPress={handleEndScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // fill the screen
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  item: {
    fontSize: 18,
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
