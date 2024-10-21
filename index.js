const express = require("express");
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const hostUrl = process.env.HOST_URL;
const { OK } = require("./helpers/http-status-code.js");

// Habilita CORS para requisição na porta padrão do react + vite
app.use(cors({
    origin: '*'
}));

// Ler body
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");

app.get("/", (req, res) => {
    res.status(OK).json({
        "Description": "ReactGram REST API",
        "EndPoint User": "/api/users...",
        "EndPoint Posts": "/api/posts...",
    });
})

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/files/posts", express.static("public/images/posts"));
app.use("/api/files/users", express.static("public/images/users"));
// 404
app.use((req, res, next) => res.status(404).json({"Error": "This Route Doesn't Exist"}));

// Listener
app.listen(port, () => {
    console.log(`Sucesso: ${hostUrl}:${port}`)
})