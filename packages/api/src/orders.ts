import { collection, doc, setDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus } from '@repo/types';

const ORDERS_COLLECTION = 'orders';

/**
 * Creates a new Buy or Sell order in Firestore.
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const newOrderRef = doc(ordersRef); // Auto-generate an ID
    
    const newOrder = {
      ...orderData,
      id: newOrderRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newOrderRef, newOrder);
    return newOrderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
};

/**
 * Fetches all orders for a specific user (used in the Mobile App / Web Profile).
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });
    
    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Failed to fetch orders");
  }
};

/**
 * Updates an order after agent inspection (used in the Admin Dashboard).
 */
export const updateOrderAfterInspection = async (
  orderId: string, 
  updates: {
    status: OrderStatus;
    finalPrice?: number;
    finalPriceReason?: string;
    paymentStatus?: 'pending' | 'completed';
  }
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw new Error("Failed to update order inspection details");
  }
};