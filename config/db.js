import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export const connectToDatabase = async () => {
  try {
    await client.connect();
    db = client.db("studiospace");
    console.log("Connected to MongoDB");
return db;  

}catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
} 
return db;
};