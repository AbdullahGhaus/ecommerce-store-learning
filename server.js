const app = require("./app");
const dotenv = require("dotenv");
const connectMongoDB = require("./config/mongo");

//Handling Uncaught Exceptions
process.on("uncaughtException", err => {
    console.log("Error: ", err.message);
    console.log("Shutting down server due to uncaught exception");
    process.exit(1)
})

//Config
dotenv.config({ path: "./config/config.env" })

//Connect database
connectMongoDB()


const server = app.listen(process.env.PORT, () => {
    console.log('\x1b[33m%s\x1b[0m', `Server is working on:`, `http://localhost:${process.env.PORT}`)
})

//Handling Unhandled Promise Rejection
process.on("unhandledRejection", err => {
    console.log("Error: ", err.message);
    console.log("Shutting down server due to unhandled promise rejection");

    server.close(() => {
        process.exit(1)
    })
})