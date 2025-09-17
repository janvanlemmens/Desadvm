import { useEffect, useState } from "react";
import { useRealm } from "./useRealm"; // your global hook

export function useObjects(schemaName) {
  const realm = useRealm();
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (!realm) return;

    const results = realm.objects(schemaName);

    // initial set
    setObjects([...results]);

    // listener
    const listener = () => {
      setObjects([...results]); // trigger re-render with fresh data
    };
    results.addListener(listener);

    return () => {
      results.removeListener(listener);
    };
  }, [realm, schemaName]);

  return objects;
}
