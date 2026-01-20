import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const collections = ["patients", "doctors"];

    for (const colName of collections) {
      try {
        const collection = mongoose.connection.collection(colName);
        const indexes = await collection.indexes();
        const userIndex = indexes.find((idx) => idx.key.user === 1);

        if (userIndex) {
          console.log(`Dropping index ${userIndex.name} from ${colName}...`);
          await collection.dropIndex(userIndex.name);
          console.log(`Dropped index ${userIndex.name} from ${colName}`);
        } else {
          console.log(`No 'user_1' index found in ${colName}`);
        }
      } catch (err) {
        console.log(`Error processing ${colName}:`, err.message);
      }
    }

    console.log("Index cleanup complete");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

dropIndexes();
