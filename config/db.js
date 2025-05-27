const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const _ = await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB Atlas connected successfully");
        console.log("Connection host:", mongoose.connection.host);
        console.log("Database name:", mongoose.connection.db.databaseName);

        // List all collections in the database
        mongoose.connection.db.listCollections().toArray((err, collections) => {
          if (err) {
            console.error("Error listing collections:", err);
          } else {
            console.log("\nAvailable collections:");
            collections.forEach((collection) => {
              console.log("-", collection.name);
            });
          }
        });
      })
      .catch((error) => {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
      });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
