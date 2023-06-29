import { Router } from 'express';
import ProjectSchema from '@/app/schemas/Project';
import { isValidObjectId } from 'mongoose'; //ignorem essa importação de início
import slugify from '@/utils/Slugify';
import AuthMiddleware from '@/app/middlewares/Auth';
import Multer from '@/app/middlewares/Multer';

const ProjectRouter = new Router();
const bodyParser = require('body-parser');

ProjectRouter.use(bodyParser.json()); 
/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectRouter:
 *       type: object
 *       required:
 *         - titulo
 *         - slug
 *         - descricao
 *         - categoria
 *         - featuredImage
 *         - images
 *         - data
 *       properties:
 *         titulo:
 *           type: string
 *           description: The project's title
 *         slug:
 *           type: string
 *           description: The project's slug
 *         descricao:
 *           type: string
 *           description: The project's description
 *         categoria:
 *           type: string
 *           description: The project's category
 *         featuredImage:
 *           type: string
 *           description: The URL of the project's featured image
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: The URLs of additional images related to the project
 *         data:
 *           type: string
 *           format: date
 *           description: The project's date
 *       example:
 *         titulo: My Project
 *         slug: my-project
 *         descricao: This is a sample project
 *         categoria: Sample Category
 *         featuredImage: https://example.com/featured-image.jpg
 *         images:
 *           - https://example.com/image1.jpg
 *           - https://example.com/image2.jpg
 *         data: 2023-05-28
 */
/**
 * @swagger
 *  tags:
 *    name: ProjectRouter
 *    description: posts of users
 */

/**
 * @swagger
 * /projectrouter:
 *   post:
 *     summary: Data insertion.
 *     tags: [ProjectRouter]
 *     description: Data insertion in data base.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Object's name.
 *                 example: Parafuso
 *               descricao:
 *                 type: string
 *                 description: Object's description.
 *                 example: Parafuso Aglomerado Fenda Phillips Cabeça Chata 4 Bemfixa 4.5 X 50 Mm
 *               categoria:
 *                 type: string
 *                 description: The object's category..
 *                 example: Ferragens
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */
ProjectRouter.post('/', AuthMiddleware, (req, res) => {
  const { titulo, descricao, categoria } = req.body; //Atribuição via desestruturação

  //A desestruturação busca pelos parametros "titulo" e "descricao" dentro do objeto
  //req.body e atribui esses valores para as variaveis com os mesmos nomes ("titulo" e "descricao")
  //Detalhes em:
  //https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Atribuicao_via_desestruturacao
  if (!titulo) return res.status(400).send({ erro: 'É necessário um título' });
  if (!descricao) return res.status(400).send({ erro: 'É necessária uma descrição' });
  if (!categoria) return res.status(400).send({ erro: 'É necessária uma categoria' });
  //Se chegar até aqui, significa que tá tudo certo
  ProjectSchema.create({ titulo, descricao, categoria })
    .then((resultado) => {
      return res.send(resultado);
    })
    .catch((err) => {
      console.error(err, 'Erro ao criar objeto');
      return res.status(500).send({ erro: 'Erro interno do servidor' });
    });
});

/**
 * @swagger
 * /projectrouter :
 *   get:
 *     summary: Get data.
 *     tags: [ProjectRouter]
 *     description: Get all informations about the object.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Object data.
 *       500:
 *         description: Internal server erro.
 */
ProjectRouter.get('/', (req, res) => {
  console.log('tst')
  ProjectSchema.find()
    .then((data) => {
      const projects = data.map(project =>{
        return {titulo: project.titulo, categoria: project.categoria, slug: project.slug, featuredImage: project.featuredImage,};
      })
      return res.send(projects);
    })
    .catch((err) => {
      console.error(err, 'Erro ao listar objetos');
      return res.status(500).send({ erro: 'Erro interno do servidor' });
    });
});

/**
 * @swagger
 * /projectrouter/{slug} :
 *   get:
 *     summary: Get data using slug.
 *     tags: [ProjectRouter]
 *     description: Get all informations about the object using slug.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       500:
 *         description: Internal server erro.
 */
ProjectRouter.get('/:slug', (req, res) => {
  ProjectSchema.findOne({slug: req.params.slug})
    .then(project => {
      res.send(project);
    })
    .catch((err) => {
      console.error(err, 'Erro ao listar objetos');
      return res.status(500).send({ erro: 'Erro interno do servidor' });
    });
});

/**
 * @swagger
 * /projectrouter/{projectId}:
 *   put:
 *     Authorization: Bearer <token>
 *     summary: Data update.
 *     tags: [ProjectRouter]
 *     description: Data update by id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Object's name.
 *                 example: Parafuso
 *               descricao:
 *                 type: string
 *                 description: Object's description.
 *                 example: Parafuso Aglomerado Fenda Phillips Cabeça Chata 4 Bemfixa 4.5 X 50 Mm
 *               categoria:
 *                 type: string
 *                 description: The object's category.
 *                 example: Ferragens
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Server error.
 */

ProjectRouter.put('/:projectId', AuthMiddleware, (req, res) => {
  //:id significa que id é um parâmetro da requisição
  //é possivel obter o id através de req.params.id
  const { titulo, descricao, categoria } = req.body;
  let slug = undefined;
  if(titulo){
    slug = slugify(titulo);
  }

  ProjectSchema.findByIdAndUpdate(req.params.projectId, {titulo, slug, descricao, categoria}, {new: true})
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((err) => {
      console.error('Erro ao salvar projeto no banco de dados.', err);
      res.status(400).send({
        error:
          'Não foi possível atualizar seu projeto, verifique os dados novamente.',
      })
    });
});

/**
 * @swagger
 * /projectrouter/{id}:
 *   delete:
 *     summary: Delete data using id
 *     tags: [ProjectRouter]
 *     description: Delete all the information about a specific object.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success.
 *       500:
 *         description: Internal server error.
 */

ProjectRouter.delete('/:id', AuthMiddleware, (req, res) => {
  const id = req.params.id;

  if (!id) return res.status(400).send({ erro: 'ID é obrigatório' });
  if (!isValidObjectId(id))
    return res.status(400).send({ erro: 'ID inválido' });

  ProjectSchema.findByIdAndRemove(id)
    .then((resultado) => {
      if (resultado) return res.send({message: 'Projeto removido com sucesso!'});
      else return res.status(404).send({ erro: 'Objeto não encontrado' });
    })
    .catch((err) => {
      console.error(err, 'Erro ao remover objeto');
      return res.status(500).send({ erro: 'Erro interno do servidor' });
    });
});

/**
 * @swagger
 * /projectrouter/featured-image/{projectId}:
 *   post:
 *     summary: Image insertion.
 *     tags: [ProjectRouter]
 *     description: Image insertion in data base.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 description: Image.
 *                 example: parafuso.png
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */
ProjectRouter.post('/featured-image/:projectId', [AuthMiddleware, Multer.single('featuredImage')], (req, res) => {
  const { file } = req;
  if (file) {
    Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $set: {
          featuredImage: file.path,
        },
      },
      { new: true }
    )
      .then(project => {
        return res.send({ project });
      })
      .catch(error => {
        console.error('Erro ao associar imagem ao projeto', error);
        res.status(500).send({ error: 'Ocorreu um erro, tente novamente' });
      });
  } else {
    return res.status(400).send({ error: 'Nenhuma imagem enviada' });
  }
});

/**
 * @swagger
 * /projectrouter/images/{projectId}:
 *   post:
 *     summary: Image insertion.
 *     tags: [ProjectRouter]
 *     description: Image insertion in data base.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 description: Image.
 *                 example: parafuso.png
 *     responses:
 *       200:
 *         description: Success.
 *       400:
 *         description: Client error.
 *       500:
 *         description: Servers erros.
 */
ProjectRouter.post('/images/:projectId', Multer.array('images'), (req, res) => {
  const {files} = req;
  if(files && files.length >0){
    const images = [];
    files.forEach(file=>{
      images.push(file.path);
    });
    Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $set: {images},
      },
      { new: true }
    )
      .then(project => {
        return res.send({ project });
      })
      .catch(error => {
        console.error('Erro ao associar imagens ao projeto', error);
        res.status(500).send({ error: 'Ocorreu um erro, tente novamente' });
      });
  }else{
    return res.status(400).send({ error: 'Nenhuma imagem enviada' });
  }

});

export default ProjectRouter;
