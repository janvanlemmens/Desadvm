import { useEffect, useState } from "react";
import RealmHelper from "./RealmHelper"; // adjust path

let realmInstance = null; // 🔑 global reference

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
