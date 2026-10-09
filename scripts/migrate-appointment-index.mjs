import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI in .env.local before running the migration.");

await mongoose.connect(uri);
try {
  const collection = mongoose.connection.collection("appointments");
  const duplicates = await collection.aggregate([
    { $match: { status: { $in: ["pending", "confirmed"] } } },
    { $group: { _id: { date: "$date", time: "$time" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 5 },
  ]).toArray();
  if (duplicates.length) throw new Error("Active duplicate time slots exist. Resolve them in MongoDB Atlas before retrying.");

  const indexes = await collection.indexes().catch(() => []);
  for (const index of indexes) {
    if (index.name === "date_1_time_1") await collection.dropIndex(index.name);
  }
  await collection.createIndex({ date: 1, time: 1 }, {
    unique: true,
    name: "active_booking_slot_unique",
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  });
  process.stdout.write("Appointment slot index migration completed.\n");
} finally {
  await mongoose.disconnect();
}
