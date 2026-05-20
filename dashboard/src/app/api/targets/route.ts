import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const client = new MongoClient(process.env.MONGO_URI as string);

// GET : to fetch the list of sites we are monitoring
export async function GET() {
  try {
    await client.connect();
    const db = client.db("sentinel_monitor");
    const sites = await db.collection("targets").find({}).toArray();
    return NextResponse.json(sites);
  } catch (e) {
    return NextResponse.json({ error: "failed to fetch" }, { status: 500 });
  }
}

// POST : To save a new site to monitor

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    await client.connect();
    const db = client.db("sentinel_monitor");

    // Add new url to the database
    await db.collection("targets").insertOne({ url, createdDate: new Date() });
    return NextResponse.json({ message: "Site Added!" });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// DELETE : delete an existing sites

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    await client.connect();
    const db = client.db("sentinel_monitor");

    // NEW LOGIC: This finds the site even if there are trailing slashes or small differences
    const cleanUrl = url.replace(/[/?]+$/, ""); // Removes trailing slash if exists

    // Remove the site from the targets collection
    const result = await db.collection("targets").deleteOne({
      url: { $regex: cleanUrl, $options: "i" },
    });
    console.log(
      `Delete request for ${url} | Document Deleted : ${result.deletedCount}`,
    );
    return NextResponse.json({ success: result.deletedCount > 0,
      count: result.deletedCount
     });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
