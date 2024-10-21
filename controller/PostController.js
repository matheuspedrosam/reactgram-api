const bcrypt = require("bcrypt");
const fs = require('fs');
const { ObjectId } = require('mongodb');

const Post = require("../models/Post");
const User = require('../models/User');
const { OK, INTERNAL_SERVER_ERROR, CREATED, BAD_REQUEST, UNAUTHORIZED, ACCEPTED, NOT_FOUND } = require("../helpers/http-status-code");
const createUserToken = require("../helpers/create-user-token");

module.exports = class PostController {

    static async getPosts(req, res){
        try{
            const posts = await Post.find().lean();
            return res.status(OK).json(posts);
        } catch (e){
            console.log(e);
            return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message});
        }
    }

    static async getPostById(req, res){
        const { id } = req.params;

        try{
            const post = await Post.findOne({_id: id})
                .populate('comments.user')
                .exec();
            return res.status(OK).json(post["_doc"]);
        } catch (e){
            console.log(e);
            return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message});
        }
    }

    static async getMyPosts(req, res){
        const { id } = req.user;

        try{
            const posts = await Post.find({userId: id}).lean();
            return res.status(OK).json(posts);
        } catch (e){
            console.log(e);
            return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message});
        }
    }

    static async createPost(req, res){
        const image = req.file ? req.file.filename : "";
        const {title, userName} = req.body;
        const userId = new ObjectId(`${req.user.id}`);

        let postForSave = {
            image, 
            title,
            likes: [],
            comments: [], 
            userId,
            userName
        };

        try{
            await PostController.validatePost(postForSave, req);

            try{
                const post = await Post.create(postForSave);
                return res.status(CREATED).json(post);
            } catch(e){
                return res.status(INTERNAL_SERVER_ERROR).json({"error": e.message});
            }
        } catch(e){
            return res.status(BAD_REQUEST).json({"error": e.message});
        }
    }

    static async updatePost(req, res){
        const id = req.params.id;
        const title = req.body.title;
        const userId = req.user.id;

        try{
            const oldPost = await Post.findOne({_id: id});
            if(oldPost.userId.toString() != userId){
                return res.status(UNAUTHORIZED).json({
                    error: "Você não pode atualizar o post de outra pessoa!"
                })
            }

            oldPost.title = title;
            try{
                const updatedPost = await Post.findOneAndUpdate(
                    { _id: id },  // Critério de busca
                    { title: oldPost.title },  // Campos a serem atualizados
                    { new: true }  // Opcional, retorna o documento atualizado
                )
                return res.status(OK).json(updatedPost);
            } catch(e){
                return res.status(INTERNAL_SERVER_ERROR).json({error: e.message});
            }
        } catch (e){
            return res.status(NOT_FOUND).json({error: "Nenhum post foi encontrado para ser atualizado!"})
        }
    }

    static async likePost(req, res){
        const postId = req.params.id;
        const userId = req.user.id;

        let post = await Post.findOne({_id: postId});
        if(!post){
            return res.status(NOT_FOUND).json({error: "Nenhum post foi encontrado para ser atualizado!"});
        }
        post = post["_doc"];

        if(!post.likes.includes(userId)){
            try{
                const updatedPost = await Post.findOneAndUpdate(
                    {_id: postId},
                    { $push: { likes: userId } },
                    { new: true },
                ).populate('comments.user').exec();
                return res.status(OK).json(updatedPost);
            } catch(e){
                return res.status(INTERNAL_SERVER_ERROR).json({error: e.message});
            }
        } else{
            return res.status(BAD_REQUEST).json({
                error: "Você já curtiu esse post!"
            });
        }
    }

    static async deslikePost(req, res){
        const postId = req.params.id;
        const userId = req.user.id;

        let post = await Post.findOne({_id: postId});
        if(!post){
            return res.status(NOT_FOUND).json({error: "Nenhum post foi encontrado para ser atualizado!"});
        }
        post = post["_doc"];

        if(post.likes.includes(userId)){
            try{
                const updatedPost = await Post.findOneAndUpdate(
                    {_id: postId},
                    { $pull: { likes: userId } },
                    { new: true },
                ).populate('comments.user').exec();
                return res.status(OK).json(updatedPost);
            } catch (e){
                return res.status(INTERNAL_SERVER_ERROR).json({error: e.message});
            }
        } else{
            return res.status(BAD_REQUEST).json({
                error: "Você não curtiu o post para poder dar deslike"
            });
        }
    }

    static async commentPost(req, res){
        const postId = req.params.id;
        const userId = req.user.id;
        const comment = req.body.comment;

        let post = await Post.findOne({_id: postId});
        if(!post){
            return res.status(NOT_FOUND).json({error: "Nenhum post foi encontrado para ser atualizado!"});
        }

        try{
            const updatedPost = await Post.findOneAndUpdate(
                { _id: postId },
                { $push: { comments: { user: userId, comment } } },
                { new: true }
            ).populate('comments.user').exec();

            return res.status(OK).json(updatedPost);
        } catch(e){
            return res.status(INTERNAL_SERVER_ERROR).json({error: e.message});
        }
    }

    static async deletePost(req, res){
        const postId = req.params.id;
        const postForDelete = await Post.findOne({_id: postId});
        const logedUser = req.user;

        if(logedUser.id != postForDelete.userId){
            return res.status(UNAUTHORIZED).json({"error": "Você não pode deletar o post de outro usuário!"})
        }

        const deletedPost = await Post.deleteOne({_id: postId});

        fs.unlink(`./public/images/posts/${postForDelete.image}`, (err) => {
            if (err) {
                console.error(`Erro ao remover o arquivo: ${err.message}`);
                return res.status(INTERNAL_SERVER_ERROR).json({error: "Erro ao remover o arquivo!"});
            }
            return res.status(OK).json(deletedPost);
        });
    }

    static async validatePost(postForSave, req, isUpdate = null){
        const {image, title, likes, comments, userId, userName} = postForSave;

        if(!title || !image){
            throw new Error("A imagem, e o título são obrigatórios!");
        }

        if(!userName || !userId){
            throw new Error("Deve haver um usuário para poder postar!");
        }
    }

}