import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

// This function pushes the device data and Base64 image to the database
export const submitSellOrder = async (orderPayload: any) => {
  try {
    // Creates a new document in a collection named "sellOrders"
    const docRef = await addDoc(collection(db, "sellOrders"), orderPayload);
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error saving the sell order: ", error);
    return { success: false, error };
  }
};