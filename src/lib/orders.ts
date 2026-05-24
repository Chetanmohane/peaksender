// lib/orders.ts
// Placeholder order data layer. Replace with real DB integration.

type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Canceled';

export interface Order {
  id: string;
  customer: string;
  serviceName: string;
  link: string;
  charge: string;
  status: OrderStatus;
  createdAt: string;
}

// In-memory store (simulated)
let orders: Order[] = [
  {
    id: '1',
    customer: 'John Doe',
    serviceName: 'Express Delivery',
    link: 'https://example.com/track/1',
    charge: '150.00',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    customer: 'Jane Smith',
    serviceName: 'Standard Shipping',
    link: 'https://example.com/track/2',
    charge: '75.50',
    status: 'In Progress',
    createdAt: new Date().toISOString(),
  },
  // Sample orders matching UI default IDs
  {
    id: 'ORD-001',
    customer: 'Alice Johnson',
    serviceName: 'Sample Service',
    link: 'https://example.com',
    charge: '10.00',
    status: 'Completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ORD-002',
    customer: 'Bob Lee',
    serviceName: 'Another Service',
    link: 'https://example.org',
    charge: '20.00',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
];

export function getAllOrders(): Order[] {
  return orders;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  return order;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}
