const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express()

const errorMiddleware = require("./middlewares/error")

app.use(cors())
app.use(express.json())
app.use(cookieParser())

//Rotues
const user = require("./routes/user.routes")

app.use("/api/v1", user)

app.use("/api/v1/isWorking", (req, res) => {
    res.send("Server is working fine")
})

//Middleware for error
app.use(errorMiddleware)

module.exports = app