// RealmHelper.js
import Realm from "realm";
import { OrdersSchema } from "./models/OrdersSchema";

let realmInstance = null;

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

export default RealmHelper;
