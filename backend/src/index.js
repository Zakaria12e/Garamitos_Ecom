import express from "express";
import 'dotenv/config'
import { connectDB } from './config/db.js'


await connectDB()
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.send("API is working");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});