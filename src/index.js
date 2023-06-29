import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import frontUrl from './config/urls'
import { ProjectRouter, Auth, Uploads} from './app/controllers';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

var path = require('path');
var filename = path.dirname(__filename);


const app = express();
app.disable("x-powered-by");


const port = 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
      termsOfService: "http://example.com/terms/",
      contact: {
        name: "API Support",
        url: "http://www.exmaple.com/support",
        email: "support@example.com",
      },
      
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "My API Documentation",
      },
    ],
  },
  apis: [`${filename}/app/controllers/*.js`],
};

const specs = swaggerJsDoc(options);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: frontUrl
}))

//app.use(router);
app.use('/projectrouter', ProjectRouter);
app.use('/auth', Auth);
app.use('/uploads', Uploads);

app.listen(port, () => {
  console.log(`Servidor rodando no link http://localhost:${port}`);
});
