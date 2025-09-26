/*import { useEffect, useState } from "react";
import { RealmHelper, RealmHelper1} from "./RealmHelper"; // adjust path

let realmInstance = null; // 🔑 global reference
let realmInstance1 = null; // 🔑 global reference

export function useRealm() {
  const [realm, setRealm] = useState(realmInstance);

  useEffect(() => {
    let mounted = true;

    async function open() {
      if (!realmInstance) {
        try {
          realmInstance = await RealmHelper.openRealm();
        } catch (err) {
          console.error("Failed to open Realm:", err);
        }
      }
      if (mounted) setRealm(realmInstance);
    }

    open();

    return () => {
      mounted = false;
      // ❌ do NOT close here
    };
  }, []);

  return realm;
}

export function closeRealm() {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
}

export function useRealm1() {
  const [realm, setRealm] = useState(realmInstance1);

  useEffect(() => {
    let mounted = true;

    async function open() {
      if (!realmInstance1) {
        try {
          realmInstance1 = await RealmHelper1.openRealm1();
        } catch (err) {
          console.error("Failed to open Realm:", err);
        }
      }
      if (mounted) setRealm(realmInstance1);
    }

    open();

    return () => {
      mounted = false;
      // ❌ do NOT close here
    };
  }, []);

  return realm;
}

export function closeRealm1() {
  if (realmInstance1 && !realmInstance1.isClosed) {
    realmInstance1.close();
    realmInstance1 = null;
  }
}*/

// useRealm.js

import Realm from "realm";
import { OrdersSchema } from "./models/OrdersSchema"
import { EansSchema } from "./models/EansSchema";

let ordersRealmInstance;
let eansRealmInstance;

export function useRealm() {
  if (!ordersRealmInstance) {
    console.log("OrdersSchema", OrdersSchema);
    ordersRealmInstance = new Realm({ schema: [OrdersSchema], path: "orders.realm" });
  }
  return ordersRealmInstance;
}

export function useRealm1() {
  if (!eansRealmInstance) {
    eansRealmInstance = new Realm({ schema: [EansSchema], path: "eans.realm" });
  }
  return eansRealmInstance;
}

export function closeRealm() {
  if (ordersRealmInstance && !ordersRealmInstance.isClosed) {
    ordersRealmInstance.close();
    ordersRealmInstance = null;
  }
}

export function closeRealm1() {
  if (eansRealmInstance && !eansRealmInstance.isClosed) {
    eansRealmInstance.close();
    eansRealmInstance = null;
  }
}