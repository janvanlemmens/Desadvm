// RealmHelper.js
import Realm from "realm";
import { OrdersSchema } from "./models/OrdersSchema";
import { EansSchema } from "./models/EansSchema";

let realmInstance = null;
let realmInstance1 = null;

const RealmHelper = {
  openRealm: async () => {
    if (realmInstance && !realmInstance.isClosed) return realmInstance;

    realmInstance = await Realm.open({
      schema: [OrdersSchema],
      path: "orders.realm",
      deleteRealmIfMigrationNeeded: true,
    });

    console.log("✅ Realm opened globally");
    return realmInstance;
  },

  getRealm: () => {
    if (!realmInstance || realmInstance.isClosed) {
      throw new Error("Realm instance not initialized or already closed");
    }
    return realmInstance;
  },

  closeRealm: () => {
    if (realmInstance && !realmInstance.isClosed) {
      realmInstance.close();
      realmInstance = null;
      console.log("📂 Realm closed globally");
    }
  },
};

const RealmHelper1 = {
  openRealm1: async () => {
    if (realmInstance1 && !realmInstance1.isClosed) return realmInstance1;

    realmInstance1 = await Realm.open({
      schema: [EansSchema],
      path: "eans.realm",
      deleteRealmIfMigrationNeeded: true,
    });

    console.log("✅ Realm1 opened globally");
    return realmInstance1;
  },

  getRealm1: () => {
    if (!realmInstance1 || realmInstance1.isClosed) {
      throw new Error("Realm instance not initialized or already closed");
    }
    return realmInstance1;
  },

  closeRealm1: () => {
    if (realmInstance1 && !realmInstance1.isClosed) {
      realmInstance1.close();
      realmInstance1 = null;
      console.log("📂 Realm1 closed globally");
    }
  },
};

export {RealmHelper, RealmHelper1 } ;
