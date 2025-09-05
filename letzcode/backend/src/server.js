const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//Setting a Static Frontend
const publicDir = path.join(__dirname, "..", "..", "frontend", "public");
app.use(express.static(publicDir));

//Auth --stubs--
app.post("/api/auth/signin", (req, res) => {
    const {email} = req.body || {};
    return res.json({ok: true, token: "dummy-token", user : {id: "u123", email}});
});

app.post("/api/auth/signup", (req, res) => {
    const {email} = req.body || {};
    return res.json({ok: true, token: "dummy-token", user : {id: "u999", email}});
});

//fall back for client routing
app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});