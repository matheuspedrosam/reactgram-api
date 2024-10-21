const bcrypt = require("bcrypt");
const fs = require('fs');

const User = require("../models/User");
const { OK, INTERNAL_SERVER_ERROR, CREATED, BAD_REQUEST, UNAUTHORIZED, ACCEPTED } = require("../helpers/http-status-code");
const createUserToken = require("../helpers/create-user-token");

module.exports = class UserController {

    static async getUsers(req, res){
        try{
            const users = await User.find().lean();
            return res.status(OK).json(users.map((user) => {
                return {...user, password: undefined}
            }));
        } catch (e){
            console.log(e);
            return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message})
        }
    }

    static async getUserById(req, res){
        const { id } = req.params;

        try{
            const user = await User.findOne({_id: id});
            return res.status(OK).json({...user["_doc"], password: undefined});
        } catch (e){
            console.log(e);
            return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message})
        }
    }

    static async createUser(req, res){
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        let userForSave = {name, email, password};

        try{
            await UserController.validateUser(userForSave);

            try{
                //bcrypt for hashPassword
                const salt = bcrypt.genSaltSync(10);
                const hashPassword = bcrypt.hashSync(password, salt);
                userForSave.password = hashPassword;

                let createdUser = await User.create(userForSave);
                createdUser = createdUser["_doc"];

                const token = await createUserToken(createdUser);

                res.status(CREATED).json({
                    token,
                    ...createdUser,
                    password: undefined
                })
            } catch(e){
                return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message})
            }
        } catch(e){
            return res.status(BAD_REQUEST).json({error: e.message})
        }
    }

    static async loginUser(req, res){
        const email = req.body.email;
        const password = req.body.password;

        try{
            let user = await User.findOne({email})

            if(!user){
                return res.status(BAD_REQUEST).json({"error": "E-mail inválido"})
            }
            user = user["_doc"]

            if(!bcrypt.compareSync(password, user.password)){
                return res.status(BAD_REQUEST).json({"error": "Senha inválida"});
            }

            const token = await createUserToken(user);

            return res.status(OK).json({
                token,
                ...user,
                password: undefined
            })
        } catch(e){
            return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message})
        }
    }

    static async updateUser(req, res){
        const {name, email, bio} = req.body;
        const currentUserId = req.user.id;
        const paramsId = req.params.id;
        if(currentUserId != paramsId){
            return res.status(UNAUTHORIZED).json({error: "Acesso Negado, não pode alterar o perfil de outra pessoa!"})
        }

        if(!email || !name) return res.status(BAD_REQUEST).json({
            error: "Fields: name and email cannot be empty"
        })

        const id = currentUserId;
        
        const oldUser = await User.findOne({_id: id});
        if(!oldUser) return res.status(BAD_REQUEST).json({error: "Usuário não existe!"});
        
        if(oldUser.email != email) return res.status(BAD_REQUEST).json({
            error: "Requisição Negada, não pode alterar o e-mail"
        });
        
        let userForSave = {name, email};
        userForSave.bio = bio ? bio : '';
        userForSave.profilePhoto = req.file ? req.file.filename : oldUser.profilePhoto;

        if(req.file){
            if(oldUser.profilePhoto){
                fs.unlink(`./public/images/users/${oldUser.profilePhoto}`, (err) => {
                    if (err) {
                        console.error(`Erro ao remover o antigo arquivo: ${err.message}`);
                        return res.status(INTERNAL_SERVER_ERROR).json({error: "Erro ao remover o arquivo!"});
                    }
                });
            }
        }

        try{
            const isUpdate = true;
            await UserController.validateUser(userForSave, isUpdate);
            
            try{
                let updatedUser = await User.findOneAndUpdate({ _id: id }, userForSave, { new: true });
                updatedUser = updatedUser["_doc"];

                const token = await createUserToken(updatedUser);

                return res.status(OK).json({
                    token,
                    ...updatedUser,
                    password: undefined
                })
            } catch (e){
                return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message});
            }
        } catch(e){
            return res.status(BAD_REQUEST).json({"error": e.message})
        }
    }

    static async deleteUser(req, res){
        const id = req.params.id;
        const logedUser = req.user;

        if(logedUser.id != id){
            return res.status(UNAUTHORIZED).json({"error": "Você não pode deletar outro usuário!"})
        }

        const deletedUser = await User.deleteOne({_id: id});
        return res.status(OK).json({
            ...deletedUser,
        });
    }

    static checkCurrentUser(req, res){
        return res.status(200).json(req.user)
    }

    static async validateUser(userForSave, isUpdate = null){
        const {name, email, password} = userForSave;

        if(name.length < 3){
            throw new Error("Name must have at least 3 characters!");
        }

        if(!isUpdate){
            if(password.length < 6){
                throw new Error("A senha precisa ter no mínimo 6 caracteres");
            }
        }

        let emailAlreadyExist = null;
        if(!isUpdate){
            emailAlreadyExist = await User.findOne({email});
        }

        if(emailAlreadyExist){
            throw new Error("E-mail Already Exists!");
        }
        
    }

}