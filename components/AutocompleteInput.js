import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const AutocompleteInput = ({ data, placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleChange = (text) => {
    setQuery(text);
    if (text.length > 0) {
      const results = data.filter((item) =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(results);
    } else {
      setFilteredData([]);
    }
  };

  const handleSelect = (item) => {
    setQuery(item);
    setFilteredData([]);
    if (onSelect) onSelect(item);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        placeholder={placeholder || "Type to search..."}
        onChangeText={handleChange}
      />
      {filteredData.length > 0 && (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleSelect(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  list: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    maxHeight: 150,
    borderRadius: 8,
    backgroundColor: "white",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default AutocompleteInput;
