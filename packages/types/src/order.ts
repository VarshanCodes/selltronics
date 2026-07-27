import { Address } from './user';

// Added OrderType to separate people selling to you vs buying from you
export type OrderType = 'sell_to_us' | 'buy_from_us';
export type OrderStatus = 'pending' | 'confirmed' | 'agent_assigned' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed';
export type PaymentMethod = 'upi' | 'cash'; // Restricted to your exact payment methods

export interface Order {
  id: string;
  userId: string;
  orderType: OrderType;
  
  // Device Details
  deviceCategory: string;
  deviceBrand: string;
  deviceModel: string;
  conditionAnswers?: Record<string, string>; 
  
  // Pricing & Agent Verification
  quotedPrice: number;
  finalPrice?: number;          // Updated by Agent after physical check
  finalPriceReason?: string;    // Agent's note on why the price changed
  
  // Logistics
  status: OrderStatus;
  address: Address;
  scheduledDate: string;
  scheduledTimeSlot: string;
  agentId?: string;
  
  // Payment & Feedback
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerRating?: number;      // 1 to 5 stars triggered after completion
  
  createdAt: Date;
  updatedAt: Date;
}