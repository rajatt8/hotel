import { NextResponse } from "next/server";

const MONGO_BASE_URL = "https://us-east-1.aws.data.mongodb-api.com/app/application-0-bkgstpk/endpoint/data/v1/action";
const MONGO_API_KEY = "6724b7a1dfa52b8344e6bf75";
const DATA_SOURCE = "Cluster0";
const DATABASE_NAME = "test";
const COLLECTION_NAME = "hotel_data";

const defaultState = {
  rooms: [
    { id: 1, name: "Deluxe King Room", category: "deluxe", price: 4999, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80", description: "Spacious king-size bed with premium amenities", amenities: ["AC", "WiFi", "TV", "Mini Bar", "Room Service"], size: "320 sq ft", capacity: 2, baseOccupancy: 2, extraPersonCharge: 300, available: true },
    { id: 2, name: "Executive Suite", category: "suite", price: 8999, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80", description: "Luxury suite with separate living area", amenities: ["AC", "WiFi", "TV", "Bathtub", "Living Area", "Mini Bar"], size: "550 sq ft", capacity: 3, baseOccupancy: 2, extraPersonCharge: 300, available: true },
    { id: 3, name: "Standard Twin Room", category: "standard", price: 2999, image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80", description: "Comfortable twin beds for business travelers", amenities: ["AC", "WiFi", "TV", "Work Desk"], size: "280 sq ft", capacity: 2, baseOccupancy: 2, extraPersonCharge: 300, available: true },
    { id: 4, name: "Premium Ocean View", category: "premium", price: 6999, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80", description: "Ocean view room with private balcony", amenities: ["AC", "WiFi", "TV", "Balcony", "Ocean View", "Mini Bar"], size: "400 sq ft", capacity: 2, baseOccupancy: 2, extraPersonCharge: 300, available: true },
    { id: 5, name: "Family Suite", category: "suite", price: 12999, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", description: "Perfect for family with 2 bedrooms", amenities: ["AC", "WiFi", "TV", "Kitchenette", "Living Room", "2 Bathrooms"], size: "750 sq ft", capacity: 5, baseOccupancy: 4, extraPersonCharge: 300, available: true },
    { id: 6, name: "Budget Single Room", category: "standard", price: 1999, image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?w=600&q=80", description: "Cozy single room for solo travelers", amenities: ["AC", "WiFi", "TV"], size: "200 sq ft", capacity: 1, baseOccupancy: 1, extraPersonCharge: 300, available: true },
  ],
  bookings: [],
  reviews: [
    { id: 1, name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210", rating: 5, comment: "Amazing hotel! Great service and beautiful rooms. Highly recommended!", date: "2024-01-15" },
    { id: 2, name: "Priya Patel", email: "priya@example.com", phone: "9876543211", rating: 4, comment: "Very comfortable stay. Food was delicious and staff was friendly.", date: "2024-01-20" },
    { id: 3, name: "Amit Kumar", email: "amit@example.com", phone: "9876543212", rating: 5, comment: "Best hotel in town! The ocean view room was spectacular.", date: "2024-02-01" },
  ],
  hotelInfo: {
    address: "Slapper - Khurahal Rd, near ACC Cement Plant, Tehsil Barmana, District Mandi, Himachal Pradesh 175017",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM"
  },
  contacts: {
    phones: ["+91 98765 43210", "+91 98765 43211"],
    emails: ["reservations@hotelmidway.com", "info@hotelmidway.com"]
  },
  gallery: {
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    ],
    heroBg: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
  }
};

async function fetchWithTimeout(url: string, options: any, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    
    const res = await fetchWithTimeout(`${MONGO_BASE_URL}/findOne`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": MONGO_API_KEY },
      body: JSON.stringify({
        dataSource: DATA_SOURCE,
        database: DATABASE_NAME,
        collection: COLLECTION_NAME,
        filter: {},
      }),
    }, 30000);

    const data = await res.json();
    const fullData: any = (data && data.document) ? data.document : defaultState;
    
    if (collection && fullData[collection]) {
      return NextResponse.json(fullData[collection]);
    }
    
    return NextResponse.json(fullData);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(defaultState);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collection, data } = body;
    
    const existingRes = await fetchWithTimeout(`${MONGO_BASE_URL}/findOne`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": MONGO_API_KEY },
      body: JSON.stringify({
        dataSource: DATA_SOURCE,
        database: DATABASE_NAME,
        collection: COLLECTION_NAME,
        filter: {},
      }),
    }, 30000);
    
    const existingData = await existingRes.json();
    let fullData: any = defaultState;
    
    if (existingData && existingData.document) {
      fullData = existingData.document;
    }
    
    if (collection && data) {
      fullData[collection] = data;
    } else {
      fullData = { ...fullData, ...body };
    }
    
    await fetchWithTimeout(`${MONGO_BASE_URL}/deleteMany`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": MONGO_API_KEY },
      body: JSON.stringify({ 
        dataSource: DATA_SOURCE, 
        database: DATABASE_NAME, 
        collection: COLLECTION_NAME, 
        filter: {} 
      }),
    }, 30000);
    
    const insertRes = await fetchWithTimeout(`${MONGO_BASE_URL}/insertOne`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": MONGO_API_KEY },
      body: JSON.stringify({
        dataSource: DATA_SOURCE,
        database: DATABASE_NAME,
        collection: COLLECTION_NAME,
        document: fullData,
      }),
    }, 30000);
    
    const result = await insertRes.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}