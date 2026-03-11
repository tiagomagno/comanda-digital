import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/upload/image
 * @desc Faz upload de uma imagem
 * @access Private (Admin)
 */
router.post(
    '/image',
    authMiddleware,
    adminMiddleware,
    uploadMiddleware.single('file'),
    (req: Request, res: Response): void => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'Nenhum arquivo enviado ou tipo de arquivo inválido.' });
                return;
            }

            // A URL para acessar a imagem será '/uploads/nome_do_arquivo'
            const relativeUrl = `/uploads/${req.file.filename}`;

            res.status(200).json({
                message: 'Upload concluído com sucesso',
                url: relativeUrl
            });
        } catch (error) {
            console.error('Erro no upload de imagem:', error);
            res.status(500).json({ error: 'Erro interno ao processar upload.' });
        }
    }
);

export default router;
