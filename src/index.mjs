import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import emprouter from "./Router/empRouter.mjs"
import cors from 'cors'
import departmentrouter from "./Router/deptRouter.mjs"
import rolerouter from "./Router/roleRouter.mjs"
import dataaddrouter from "./Router/dataRouter.mjs"
import projectrouter from "./Router/projectRouter.mjs"
import subprojectrouter from "./Router/subproject.mjs"





const index = express()
const port = 8000
dotenv.config()
console.log(process.env.DatabaseName)

index.use(express.json())
index.use(express.static('static'))
index.use(cors())

index.use(emprouter)
index.use(departmentrouter)
index.use(rolerouter)
index.use(dataaddrouter)
index.use(projectrouter)
index.use(subprojectrouter)


mongoose.connect(`mongodb://localhost:27017/${process.env.DatabaseName}`).then(() => {
    console.log("Database connected");
}).catch((error)=>{
    console.log(error)
})






index.listen(port,()=>{
    console.log(`the server is running on port ${port}`)
})