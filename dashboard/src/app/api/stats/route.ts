import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const client = new MongoClient(process.env.MONGO_URI as string);
        await client.connect();
        
        const db = client.db('sentinel_monitor');
        const collection = db.collection('pings');

        // Fetch the 50 most recent pings from the database
        const data = await collection
            .find({})
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

        await client.close();

        // Send the data back to our React frontend
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}