import multer from 'multer';
import { Router } from "express";
import { pool } from '../db.js';

import sharp from 'sharp';

const router = Router();

const helperImg = (filePath, filename, size = 300) => {
    return sharp(filePath)
        .resize(size)
        .toFile(`assets/optimize/${filename}`)
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/uploads');
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
    }
});

const upload = multer({ storage });

router.post('/upload-data', upload.single('photo'), async (req, res) => {
    console.log(req.file);
    helperImg(req.file.path, `resize-${req.file.filename}`);

    try {
        console.log(req.body);
        const { cedula, experiences, hasExperience } = req.body;
        const photo = req.file.filename;
        await pool.query('INSERT INTO ofertantes (cedula, photo, complete_info) VALUES (?, ?, TRUE) ON DUPLICATE KEY UPDATE photo = VALUES(photo), complete_info = VALUES(complete_info)', [cedula, photo]);

        const hasExperienceInt = hasExperience === 'true' ? 1 : 0;

        if (hasExperienceInt) {
            for (let exp of experiences) {
                const { title, company, startDate, isCurrent, endDate, responsibilities } = exp;
                const isCurrentInt = isCurrent === 'true' ? 1 : 0;
                const endDateFinal = isCurrentInt ? null : endDate;
                await pool.query('INSERT INTO experiencia (cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE hasExperience = VALUES(hasExperience), title = VALUES(title), company = VALUES(company), startDate = VALUES(startDate), isCurrent = VALUES(isCurrent), endDate = VALUES(endDate), responsibilities = VALUES(responsibilities)', 
                [cedula, hasExperienceInt, title, company, startDate, isCurrentInt, endDateFinal, responsibilities]);
            }
        } else {
            await pool.query('INSERT INTO experiencia (cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities) VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE hasExperience = VALUES(hasExperience), title = VALUES(title), company = VALUES(company), startDate = VALUES(startDate), isCurrent = VALUES(isCurrent), endDate = VALUES(endDate), responsibilities = VALUES(responsibilities)', 
            [cedula, hasExperienceInt]);
        }

        res.send({ data: 'File uploaded and photo, complete_info, and experience data updated in database',
            success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error occurred while updating the database' });
    }
});

export default router;