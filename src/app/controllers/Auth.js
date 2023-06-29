import express from 'express';
import bcrypt from 'bcryptjs';
import authConfig from '@/config/auth';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Mailer from '@/modules/Mailer'
import User from '@/app/schemas/User';

const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json()); 

/**
 * @swagger
 * components:
 *   schemas:
 *     Auth:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's e-mail
 *         name:
 *           type: string
 *           description: The user's name
 *         password:
 *           type: string
 *           description: The user's account password
 *       example:
 *         email: lucas@gmail.com
 *         name: lucas gomes
 *         password: 1234567
 *
 */

/**
 * @swagger
 *  tags:
 *    name: Auth
 *    description: posts of users
 */

const generateToken = params =>{
    return jwt.sign(params, authConfig.secret,{
            expiresIn:86400,
        },
    );
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Register a new user with email, name, and password.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: leanne.graham@gmail.com
 *               name:
 *                 type: string
 *                 description: The user's name.
 *                 example: Leanne Graham
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: Leanne Graham
 *  
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */

router.post('/register', (req, res) => {

    const {email, name, password} = req.body;
    console.log(name)
    User.findOne({email})
    .then(userData =>{
        if(userData){
            return res.status(400).send({error: 'User already exists'});
        }else{
            User.create({name,email,password})
                .then(user =>{
                    user.password = undefined;
                    return res.send({user});
                })
                .catch(error =>{
                    console.error('Erro ao salvar o usuario', error);
                    return res.status(400).send({error: 'Registration failed'});
                });
        }
    })
    .catch(error => {
        console.error('Erro ao consultar usuario no banco de dados', error);
        return res.status(500).send({error: 'Registration failed'});
    });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a new user
 *     tags: [Auth]
 *     description: Login a user with email and password.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: leanne.graham@gmail.com
 *               password:
 *                 type: string
 *                 description: The user's account password.
 *                 example: 123456 
 *  
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */

router.post('/login', (req, res) => {
    const {email, password} = req.body;
    User.findOne({email})
    .select('+password')
    .then(user =>{
        if(user){
            bcrypt.compare(password, user.password)
            .then(result =>{
                if(result){
                    const token = generateToken({uid:user.id});
                    return res.status(200).send({token:token, tokenexpiration: 'id'});
                }else{
                    return res.status(400).send({error:'Invalid password'});
                }
            })
            .catch(error =>{
                console.error('Erro ao verificar senha', error);
            });
        }else{
            res.status(404).send({error: 'User not found'});
        }
    }).catch(error =>{
        console.error('Erro ao logar',error);
        return res.status(500).send({error: 'internal server error'});
    })
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password function.
 *     tags: [Auth]
 *     description: Forgot the user's account password.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: leanne.graham@gmail.com
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */

router.post('/forgot-password', (req, res) => {
    const {email} = req.body;

    User.findOne({email})
    .then(user =>{
        if(user){
            const token = crypto.randomBytes(20).toString('hex');
            const expiration = new Date();
            expiration.setHours(new Date().getHours() + 3);
            
            User.findByIdAndUpdate(user.id, {
                $set:{
                    passwordResetToken: token,
                    passwordResetTokenExpiration: expiration,
                },
            })
            .then(() =>{
                Mailer.sendMail(
                    {
                    to: email,
                    from: 'webmaster@testeexpress.com',
                    template: 'auth/forgot_password',
                    context: {token}
                }, 
                error => {
                    if(error){
                        console.error('Erro ao enviar e-mail', error);
                        return res.status(400).send({error: 'Fail sending recover password mail'});
                    }else{
                        return res.status(200).send();
                    }
                },
                );
            })
            .catch(error =>{
                console.error('Erro ao salvar a token de recuperacao de senha', error);
                return res.status(500).send({error: 'Internal server error'});
            });
        }else{
            return res.status(404).send({error: 'User not found'});
        }
    })
    .catch(error =>{
        console.error('Erro no "forgot password"',error);
        return res.status(500).send({error: 'internal server error'});
    });
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password function.
 *     tags: [Auth]
 *     description: Reset user's account password.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: leanne.graham@gmail.com
 *               token:
 *                 type: string
 *                 description: The user's account token.
 *                 example: ayuwvd13413daw
 *               newPassword:
 *                 type: string
 *                 description: The user's new password.
 *                 example: 12345467
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */

router.post('/reset-password', (req, res) => {
    const{email, token, newPassword} = req.body;

    User.findOne({email})
    .then(user =>{
        if(user){
        if(token != user || new DataTransfer().now > user.passwordResetTokenExpiration){
            return res.status(400).send({error: 'Invalid token'})
        }else{
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpiration = undefined;
            user.password = newPassword;

            user.save().then(() => {
                return res.send({messsage: 'Senha trocada com sucesso'});
            }).catch(error =>{
                console.error('Erro ao salvar a nova senha do usuario' ,error);
                return res.status(500).send({error: 'Internal server erro'})
            })
        }
    }else{
        return res.status(404).send({error: 'User not found'});
    }
    }).catch(error =>{
        console.error('Erro no "forgot password"', error);
        return res.status(500).send({error: 'internal server error'});
    });
});

export default router;