import React, { useEffect, useState } from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import RNFS from "react-native-fs";
import {readLocalFile,parseEansFile,saveEansToRealm} from "../utils/eansImport"



const DownloadEans = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL+"/desadv.exportean.cls";
 

  const downloadFile = async (url, localFileName) => {
  const path = `${RNFS.DocumentDirectoryPath}/${localFileName}`;

  try {
    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
    }).promise;

    console.log("File downloaded:", path);
    return path;
  } catch (err) {
    console.error("Download failed:", err);
    return null;
  }
};

  useEffect(() => {
    let isActive = true; // guard if component unmounts

    const runDownload = async () => {
      if (visible) {
        setLoading(true);

        // 👉 call your download function here
        const savedPath = await downloadFile(
         apiUrl, // replace with real URL
          "eans.csv"
        );
        console.log("Saved to:", savedPath);
        
        if (savedPath) {
        try {
          // 👉 step 2: read file
          const content = await readLocalFile(savedPath);

          // 👉 step 3: parse lines (skip header if present)
          const records = parseEansFile(content);

          console.log(`Parsed ${records.length} records`);

          // 👉 step 4: save in Realm with batching
          await saveEansToRealm(records, 1000);

          console.log("Import finished ✅");
        } catch (err) {
          console.error("Error importing EANs:", err);
        }
      }

        if (isActive) {
          setLoading(false);
          onClose(); // auto-close modal after download
        }
      }
    };

    runDownload();

    return () => {
      isActive = false;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={{ marginTop: 12 }}>Downloading EANs...</Text>
            </>
          ) : (
            <Text>Done!</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default DownloadEans;
