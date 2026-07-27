import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// Adjust this path to point to your actual firebase.ts config file
import { db } from "../firebase"; 

export interface BaseOrderData {
  deviceCategory: string;
  brand: string;
  model: string;
  deviceImageCode: string | null;
  issues: Record<string, boolean>;
  customerDetails?: {
    name: string;
    phone: string;
    email: string;
  };
}

/**
 * Submits a new sell order to Firestore and returns the generated Order ID.
 */
export async function submitSellOrder(orderData: BaseOrderData) {
  try {
    // Reference to the sellOrders collection in Firestore
    const ordersRef = collection(db, "sellOrders");

    // Add the document with the initial Pending status
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: "Pending", // Default status for the Admin Dashboard to pick up
      createdAt: serverTimestamp(),
    });

    // Return the generated ID so the frontend can show it in the Success Modal
    return { 
      success: true, 
      orderId: docRef.id 
    };

  } catch (error) {
    console.error("Error submitting sell order to Firebase:", error);
    return { 
      success: false, 
      orderId: null,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}