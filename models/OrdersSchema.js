export const OrdersSchema = {
  name: "Orders",
  primaryKey: "id",
  properties: {
    id: "string", // full order string
    deliveryNote: "string", 
    depot: { type: "string", indexed: true },
    arrival: "string",
    supplier: { type: "string", indexed: true },
    article: "string",
    description: "string",
    profile: "string",
    ean: "string",
    brand: "string",
    quantity: "int",
    quantitycfm: { type: "int", default: 0 } ,
  },
};