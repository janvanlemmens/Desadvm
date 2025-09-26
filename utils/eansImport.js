import RNFS from "react-native-fs";
import Realm from "realm";
import { EansSchema } from "../models/EansSchema";
import { RealmHelper1 } from "../RealmHelper";

const readLocalFile = async (path) => {
  try {
    const content = await RNFS.readFile(path, "ascii");
    return content;
  } catch (err) {
    console.error("Error reading file:", err);
    return null;
  }
};

const parseEansFile = (text) => {
  const lines = text.split(/\r?\n/); // handle Windows + Unix line breaks
  const result = [];

  for (const line of lines) {
    if (!line.trim()) continue; // skip empty lines

    const [eanStr, descr1, descr2] = line.split(";");
    if (!eanStr) continue;

    const eanNum = parseInt(eanStr, 10);

    if (!Number.isSafeInteger(eanNum)) {
      console.warn("Skipping invalid EAN:", eanStr);
      continue; // skip bad rows
    }

    result.push({
      ean: eanStr,// convert to int
      descr1: descr1 || "",
      descr2: descr2 || "",
    });
  }

  return result;
};



function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const saveEansToRealm = async (records, batchSize = 1000) => {
  const realm = await RealmHelper1.openRealm1();
  const chunks = chunkArray(records, batchSize);

  for (let i = 0; i < chunks.length; i++) {
    realm.write(() => {
      chunks[i].forEach((rec) => {
        realm.create("Eans", rec, "modified");
      });
    });
    console.log(`Inserted batch ${i + 1}/${chunks.length}`);
  }

  realm.close();
};


export { readLocalFile, parseEansFile, saveEansToRealm };
