import { Router } from "express";
import { pool } from "../db.js";
pool
const router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to the API');
});

router.get('/ping', async(req, res) => {
    const [rows] = await pool.query('select 1 + 1 as result')
    console.log(rows[0])
    res.json(rows[0])
})

export default router;