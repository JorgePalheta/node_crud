const express = require('express');
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");

// Configuração do multer para upload de imagem
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
})
var upload = multer({
    storage: storage,
}).single("image");

// Rota para adicionar um usuário
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();
        
        req.session.message = {
            type: "success",
            message: "Usuário adicionado com sucesso"
        };
        res.redirect("/");
    } catch (error) {
        res.status(500).json({ message: error.message, type: "danger" });
    }
});

// Rota para listar todos os usuários
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', {
            title: "Página inicial",
            users: users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Rota para renderizar a página inicial
router.get("/add", (req, res) =>{
    res.render("add_users",{title: "Adicionar Usuários"});
});
router.get("/a", (req, res)=>{
    res.render('login');
});
// Rota para editar um usuário
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        
        if (!user) {
            req.session.message = {
                type: "danger",
                message: "Usuário não encontrado."
            };
            return res.redirect("/");
        }
        
        res.render("edit_users", {
            title: "Editar usuário",
            user: user,
        });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        req.session.message = {
            type: "danger",
            message: "Erro ao buscar usuário. Por favor, tente novamente mais tarde."
        };
        res.redirect("/");
    }
});
//atualizar o evento
// Rota para editar um usuário
router.post("/update/:id", upload, async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        };

        // Verificando se há uma nova imagem enviada
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado', type: 'danger' });
        }

        req.session.message = {
            type: 'success',
            message: "O usuário foi atualizado",
        };
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});

// Rota para deletar um usuário
router.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado', type: 'danger' });
        }

        req.session.message = {
            type: 'success',
            message: "Usuário deletado com sucesso",
        };
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});

  





module.exports = router;
