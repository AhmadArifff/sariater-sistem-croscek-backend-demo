import { Router } from "express";
import multer from "multer";
import {
  getJadwalList,
  getJadwalListAll,
  uploadJadwal,
  createJadwal,
  updateJadwal,
  deleteJadwal,
} from "../controllers/jadwalController.js";
import { adminOnly, adminGuestRead } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file Excel (.xlsx, .xls) yang diizinkan"));
    }
  },
});

// =============================================
// INFORMASI JADWAL ROUTES
// =============================================

// GET list dengan pagination & search (PUBLIC atau PROTECTED - sesuai kebijakan)
router.get("/informasi-jadwal/list",             ...adminGuestRead, getJadwalList);

// GET semua data tanpa pagination (untuk dropdown/referensi)
router.get("/informasi-jadwal/list/all",         ...adminGuestRead, getJadwalListAll);

// POST upload Excel (PROTECTED - admin only)
router.post("/informasi-jadwal/upload",          ...adminOnly, upload.single("file"), uploadJadwal);

// POST create manual (PROTECTED - admin only)
router.post("/informasi-jadwal/create",          ...adminOnly, createJadwal);

// PUT update by kode (PROTECTED - admin only)
router.put("/informasi-jadwal/update/:kode",     ...adminOnly, updateJadwal);

// DELETE by kode (PROTECTED - admin only)
router.delete("/informasi-jadwal/delete/:kode",  ...adminOnly, deleteJadwal);

export default router;
