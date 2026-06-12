import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://hotel-admin:hotel123456@cluster0.csal0w6.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function getCollection() {
  await client.connect();
  const db = client.db("test");
  return db.collection("hotel_data");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collection");
    const collection = await getCollection();
    const data = await collection.findOne({});
    
    if (collectionName && data) {
      return NextResponse.json(data[collectionName] || []);
    }
    return NextResponse.json(data || {});
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collection: collectionName, data } = body;
    const collection = await getCollection();
    
    const existing = await collection.findOne({});
    let fullData: any = existing || {};
    
    if (collectionName && data) {
      fullData[collectionName] = data;
    } else {
      fullData = { ...fullData, ...body };
    }
    
    await collection.updateOne(
      {},
      { $set: fullData },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}