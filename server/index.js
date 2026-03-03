require('dotenv').config(); // Load environment variables at the very top
const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require('./models/users');

// Use the variable from .env
mongoose.connect(process.env.MONGODB_URI);

app.get("/getusers", async (req, res) => {
    try {
        const result = await UserModel.find({});
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Use the PORT variable from .env
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server runs perfectly on port ${PORT}!`);
});