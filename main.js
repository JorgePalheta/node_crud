require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const morgan = require("morgan"); // Adicione esta linha

const app = express();
const PORT = process.env.PORT || 4000;

// Conexão com o banco de dados
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", error => console.error("Erro de conexão com o banco de dados:", error));
db.once('open', () => console.log("Conectado ao banco de dados"));

// Middleware de análise de corpo
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware de sessão
app.use(
    session({
        secret: process.env.SESSION_SECRET || "my secret key",
        saveUninitialized: true,
        resave: false,
    })
);

// Middleware de mensagens de sessão
app.use((req, res, next) => {
    res.locals.message = req.session.message || "";
    delete req.session.message;
    next();
});

// Configuração do mecanismo de modelo
app.set('view engine', 'ejs');

// Middleware de logging com morgan
app.use(morgan('dev')); // Adicione esta linha

// Rotas
app.use("", require("./routes/routes"));

// Manipulador de erro para rota não encontrada
app.use((req, res, next) => {
    res.status(404).send("Página não encontrada");
});

// Manipulador de erro global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Algo deu errado!");
});

//puxar as imagens
app.use('/uploads', express.static(__dirname + '/uploads'));

//login
app.get("/a", (req, res)=>{
    res.render('login');
});
//estilo do login
app.use(express.static('public'));


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
