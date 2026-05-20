import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// 1. Tell the app to look inside the .env file for the MONGO_URI
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export async function connectToDatabase() {
    try {
        // 2. Try to connect to the cloud cluster
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas");
        
        const db = client.db('sentinel_monitor');

        // 3. Create a Time-Series collection (This is the "Senior" way)
        // This is only created once. It optimizes how pings are stored.
        await db.createCollection("pings", {
            timeseries: {
                timeField: "timestamp",
                metaField: "metadata",
                granularity: "minutes"
            }
        }).catch(() => {
            // If the collection already exists, we just ignore the error
        });

        return{ 
          db: db ,
          pingsCollection :db.collection('pings')
        };
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1); // Stop the app if we can't connect
    }
}