import express from "express";
import multer from "multer";
import { authenticatedRoles, writeAccess } from "../middleware/auth.js";

// ── Jadwal controllers ─────────────────────────────────────
import {
  getJadwalKaryawan,
  getJadwalDW,
  createJadwalKaryawan,
  createJadwalDW,
  updateJadwalKaryawan,
  deleteJadwalKaryawan,
  deleteJadwalPeriodKaryawan,
  clearJadwalKaryawan,
  clearJadwalDW,
  importJadwalKaryawan,
  importJadwalDW,
  importJadwalKaryawanPin,
  importJadwalDWPin,
  importJadwalKaryawanSmartMatch,
  importJadwalDWSmartMatch,
} from "../controllers/jadwalkaryawanController.js";

// ── Kehadiran controllers ──────────────────────────────────
import {
  importKehadiran,
  getAvailablePeriodsKaryawan,
  getAvailablePeriodsDW,
  deleteKehadiranPeriodKaryawan,
  deleteKehadiranPeriodDW,
} from "../controllers/kehadiranController.js";

// ── Croscek controllers ────────────────────────────────────
import {
  getCroscekKaryawan,
  getCroscekKaryawanSQL,
  getCroscekDiagnostics,
  getJadwalCoverage,
  saveCroscekKaryawan,
  getCroscekKaryawanFinal,
  getCroscekDW,
  saveCroscekDW,
  getCroscekDWFinal,
  getKaryawanSelect,
  getRekapHOD,
  refreshMaterializedView,
  recreateMaterializedView,
  clearCroscekKaryawan,
  clearCroscekDW,
} from "../controllers/croscekController.js";

const router = express.Router();

// Multer: file upload ke memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// =============================================
// JADWAL KARYAWAN ROUTES
// =============================================
router.get("/jadwal-karyawan/list",             ...authenticatedRoles, getJadwalKaryawan);
router.post("/jadwal-karyawan/create",          ...writeAccess, createJadwalKaryawan);
router.put("/jadwal-karyawan/update/:no",       ...writeAccess, updateJadwalKaryawan);
router.delete("/jadwal-karyawan/delete/:no",    ...writeAccess, deleteJadwalKaryawan);
router.delete("/jadwal-karyawan/delete-period", ...writeAccess, deleteJadwalPeriodKaryawan);
router.post("/jadwal-karyawan/clear",           ...writeAccess, clearJadwalKaryawan);
router.post("/import-jadwal-karyawan",          ...writeAccess, upload.single("file"), importJadwalKaryawan);
router.post("/import-jadwal-karyawan-pin",      ...writeAccess, upload.single("file"), importJadwalKaryawanPin); // PIN-based
router.post("/import-jadwal-karyawan-smartmatch", ...writeAccess, upload.single("file"), importJadwalKaryawanSmartMatch); // NEW: Smart NIK/id_absen

// =============================================
// JADWAL DW ROUTES
// =============================================
router.get("/jadwal-dw/list",                   ...authenticatedRoles, getJadwalDW);
router.post("/jadwal-dw/create",                ...writeAccess, createJadwalDW);
router.post("/jadwal-dw/clear",                 ...writeAccess, clearJadwalDW);
router.post("/import-jadwal-dw",                ...writeAccess, upload.single("file"), importJadwalDW);
router.post("/import-jadwal-dw-pin",            ...writeAccess, upload.single("file"), importJadwalDWPin); // PIN-based
router.post("/import-jadwal-dw-smartmatch",     ...writeAccess, upload.single("file"), importJadwalDWSmartMatch); // NEW: Smart NIK/id_absen

// =============================================
// INFORMASI JADWAL (consolidated to jadwal.js/jadwalController)
// =============================================
// Route removed - use /api/informasi-jadwal/list from jadwal.js instead

// =============================================
// KEHADIRAN ROUTES
// =============================================
router.post("/import-kehadiran",                ...writeAccess, upload.single("file"), importKehadiran);

router.get("/kehadiran-karyawan/available-periods",  ...authenticatedRoles, getAvailablePeriodsKaryawan);
router.get("/kehadiran-dw/available-periods",        ...authenticatedRoles, getAvailablePeriodsDW);

router.delete("/kehadiran-karyawan/delete-period",   ...writeAccess, deleteKehadiranPeriodKaryawan);
router.delete("/kehadiran-dw/delete-period",         ...writeAccess, deleteKehadiranPeriodDW);

// =============================================
// CROSCEK ROUTES
// =============================================
router.get("/croscek-karyawan",               ...authenticatedRoles, getCroscekKaryawan);
router.get("/croscek-karyawan/sql",           ...authenticatedRoles, getCroscekKaryawanSQL);
router.post("/croscek-karyawan/sql/refresh", ...writeAccess, refreshMaterializedView);
router.post("/croscek-karyawan/sql/recreate", ...writeAccess, recreateMaterializedView);
router.get("/croscek-karyawan/diagnostics",  ...authenticatedRoles, getCroscekDiagnostics);
router.get("/croscek-karyawan/coverage", ...authenticatedRoles, getJadwalCoverage);
router.post("/croscek-karyawan",              ...writeAccess, saveCroscekKaryawan);
router.post("/croscek-karyawan/clear",        ...writeAccess, clearCroscekKaryawan);
router.get("/croscek-karyawan/final",         ...authenticatedRoles, getCroscekKaryawanFinal);

router.get("/croscek-dw",                     ...authenticatedRoles, getCroscekDW);
router.post("/croscek-dw",                    ...writeAccess, saveCroscekDW);
router.post("/croscek-dw/clear",              ...writeAccess, clearCroscekDW);
router.get("/croscek-dw/final",               ...authenticatedRoles, getCroscekDWFinal);

// =============================================
// UTILITY ROUTES
// =============================================
router.get("/karyawan-select",                ...authenticatedRoles, getKaryawanSelect);
router.get("/rekap-hod",                      ...authenticatedRoles, getRekapHOD);

export default router;
