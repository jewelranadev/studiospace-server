import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import studios from "./data/studios.js";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

const seedDatabase = async () => {
  try {
    await client.connect();

    const db = client.db("studiospace");

    const studiosCollection = db.collection("studios");

    const result = await studiosCollection.insertMany(studios);

    console.log(`${result.insertedCount} Studios Added Successfully`);

  } catch (error) {
    console.error("Seed Error:", error);
  } finally {
    await client.close();
  }
};

seedDatabase();