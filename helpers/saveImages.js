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
    // helperImg(req.file.path, `resize-${req.file.filename}`);

    try {
        const { cedula, experiences, hasExperience, areas } = req.body;
        const photo = req.file.filename;
        const areasString = JSON.stringify(areas);
        const tarifas = JSON.parse(req.body.tarifas);

        await pool.query('INSERT INTO ofertantes (cedula, photo, complete_info, areas) VALUES (?, ?, TRUE, ?) ON DUPLICATE KEY UPDATE photo = VALUES(photo), complete_info = VALUES(complete_info), areas = VALUES(areas)', [cedula, photo, areasString]);

        const hasExperienceInt = hasExperience === 'true' ? 1 : 0;

        if (hasExperienceInt) {
            for (let exp of experiences) {
                const { title, company, startDate, isCurrent, endDate, responsibilities, telefono } = exp;
                const isCurrentInt = isCurrent === 'true' ? 1 : 0;
                const endDateFinal = isCurrentInt ? null : endDate;
                await pool.query('INSERT INTO experiencia (cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE hasExperience = VALUES(hasExperience), title = VALUES(title), company = VALUES(company), startDate = VALUES(startDate), isCurrent = VALUES(isCurrent), endDate = VALUES(endDate), responsibilities = VALUES(responsibilities)',
                    [cedula, hasExperienceInt, title, company, startDate, isCurrentInt, endDateFinal, responsibilities, telefono]);
            }
        } else {
            await pool.query('INSERT INTO experiencia (cedula, hasExperience, title, company, startDate, isCurrent, endDate, responsibilities, telefono) VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE hasExperience = VALUES(hasExperience), title = VALUES(title), company = VALUES(company), startDate = VALUES(startDate), isCurrent = VALUES(isCurrent), endDate = VALUES(endDate), responsibilities = VALUES(responsibilities)',
                [cedula, hasExperienceInt]);
        }

        for (let servicio in tarifas) {
            for (let tarifa of tarifas[servicio]) {
                const { servicio: tipoTarifa, precio } = tarifa;

                const [servicioRows] = await pool.query('SELECT id FROM servicios WHERE nombre = ?', [servicio]);
                const servicioId = servicioRows[0].id;

                const [tipoTarifaRows] = await pool.query('SELECT id FROM tipos_tarifas WHERE nombre = ?', [tipoTarifa]);
                if (tipoTarifaRows.length === 0) {
                    console.log(`No tariff type found with name ${tipoTarifa}`);
                    continue;
                }
                const tipoTarifaId = tipoTarifaRows[0].id;

                await pool.query('INSERT INTO tarifas (cedula, servicio_id, tipo_tarifa_id, precio) VALUES (?, ?, ?, ?)', [cedula, servicioId, tipoTarifaId, precio]);
            }
        }

        res.send({
            data: 'File uploaded and photo, complete_info, experience, and tarifas data updated in database',
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error occurred while updating the database' });
    }
});

export default router;