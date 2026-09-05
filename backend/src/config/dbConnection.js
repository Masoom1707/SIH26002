import mongoose from "mongoose"

const getErrorMessage = (error)  => { 
  if(error instanceof Error) return error.message
  return String(error);
}

const gracefulShutdown = async(signal) => { 
  console.log(`\n${signal} received, Closing MongoDB connection...`);
  try {
    await mongoose.connection.close()
    console.log("MongoDB connection closed gracefully.");
    process.exit(0)
  } catch (error) {
    console.error("Error during shutdown: ", getErrorMessage(error))
    process.exit(1)
  }
} 

export const dbConnection = async() => {
  try {
    await mongoose.connect(process.env.DB_URL, {
        dbName: "SIH",
    })
    console.log("Database is connected successfully :)");

    mongoose.connection.on("disconnected", () => {
      console.error("MongoDB disconnected: ")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected: ")
    })

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", getErrorMessage(error))
    })

    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

  } catch (error) {
    console.error("DB Connection Failed: ", getErrorMessage(error));
    process.exit(1);
  }
}
