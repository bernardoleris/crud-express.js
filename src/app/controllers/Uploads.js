import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = new Router();
/**
 * @swagger
 * /{path}/{filename} :
 *   get:
 *     summary: Get image.
 *     tags: [ProjectRouter]
 *     description: Get image from back-end.
 *     produces:
 *       - application/json
 *     parameters:
 *     
 *     responses:
 *       200:
 *         description: Image
 *       404:
 *         description: File not found
 */

router.get('/:path/:filename', (req, res) => {
  const filePath = path.resolve(`./uploads/${req.params.path}/${req.params.filename}`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send({ error: 'File not found' });
  }
});

export default router;
