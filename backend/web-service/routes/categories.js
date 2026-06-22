import { Router } from "express";
import { getCategories } from "../controller/categories.js";

const router = Router();
// 1. ดึงรายการหมวดหมู่
router.get('/get', getCategories);

export default router;