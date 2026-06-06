-- Core schema for Sistem Croscek Kehadiran Karyawan.
-- Safe to run more than once.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS karyawan (
    id_karyawan SERIAL PRIMARY KEY,
    nik VARCHAR(30),
    nama VARCHAR(100) NOT NULL,
    jabatan VARCHAR(50),
    dept VARCHAR(50),
    id_absen VARCHAR(50),
    kategori VARCHAR(50),
    UNIQUE (nik, nama),
    UNIQUE (id_absen)
);

CREATE TABLE IF NOT EXISTS informasi_jadwal (
    kode VARCHAR(20) PRIMARY KEY,
    lokasi_kerja VARCHAR(50),
    nama_shift VARCHAR(100),
    jam_masuk TIME,
    jam_pulang TIME,
    keterangan VARCHAR(100),
    "group" VARCHAR(50),
    status VARCHAR(50),
    kontrol VARCHAR(50),
    UNIQUE (kode)
);

CREATE TABLE IF NOT EXISTS shift_info (
    kode VARCHAR(20) PRIMARY KEY,
    jam_masuk TIME NOT NULL,
    jam_pulang TIME NOT NULL,
    lintas_hari BOOLEAN NOT NULL,
    CONSTRAINT fk_shiftinfo_kode
        FOREIGN KEY (kode) REFERENCES informasi_jadwal(kode)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS jadwal_karyawan (
    no SERIAL PRIMARY KEY,
    id_karyawan INT NULL,
    nama VARCHAR(100),
    tanggal DATE,
    kode_shift VARCHAR(20),
    shift_window_start TIMESTAMPTZ,
    shift_window_end TIMESTAMPTZ,
    CONSTRAINT fk_jadwal_kode
        FOREIGN KEY (kode_shift) REFERENCES informasi_jadwal(kode)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_jadwal_nik
        FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS kehadiran_karyawan (
    tanggal_scan TIMESTAMPTZ NOT NULL,
    tanggal DATE NOT NULL,
    jam TIME NOT NULL,
    pin VARCHAR(20),
    id_karyawan INT NULL,
    nip VARCHAR(20),
    nama VARCHAR(100) NOT NULL,
    jabatan VARCHAR(50),
    departemen VARCHAR(50),
    kantor VARCHAR(50),
    verifikasi INT,
    io INT,
    workcode VARCHAR(20),
    sn VARCHAR(50),
    mesin VARCHAR(50),
    kode VARCHAR(20),
    CONSTRAINT fk_kehadiran_kode
        FOREIGN KEY (kode) REFERENCES informasi_jadwal(kode)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_kehadiran_nik
        FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS croscek (
    id_croscek SERIAL PRIMARY KEY,
    "Nama" VARCHAR(150) NOT NULL,
    "Tanggal" DATE NOT NULL,
    "Kode_Shift" VARCHAR(10),
    "Jabatan" VARCHAR(100),
    "Departemen" VARCHAR(100),
    id_karyawan INT NOT NULL,
    "NIK" VARCHAR(50) NOT NULL,
    "Jadwal_Masuk" TIME,
    "Jadwal_Pulang" TIME,
    "Actual_Masuk" TIMESTAMPTZ NULL,
    "Actual_Pulang" TIMESTAMPTZ NULL,
    "Prediksi_Shift" VARCHAR(50) DEFAULT NULL,
    "Prediksi_Actual_Masuk" TIMESTAMPTZ DEFAULT NULL,
    "Prediksi_Actual_Pulang" TIMESTAMPTZ DEFAULT NULL,
    "Probabilitas_Prediksi" VARCHAR(50),
    "Confidence_Score" VARCHAR(50),
    "Frekuensi_Shift_Historis" VARCHAR(50),
    "Status_Kehadiran" VARCHAR(50),
    "Status_Masuk" VARCHAR(50),
    "Status_Pulang" VARCHAR(50),
    UNIQUE (id_karyawan, "Tanggal", "Kode_Shift")
);

CREATE TABLE IF NOT EXISTS croscek_dw (
    id_croscek_dw SERIAL PRIMARY KEY,
    "Nama" VARCHAR(150) NOT NULL,
    "Tanggal" DATE NOT NULL,
    "Kode_Shift" VARCHAR(10),
    "Jabatan" VARCHAR(100),
    "Departemen" VARCHAR(100),
    id_karyawan INT NOT NULL,
    "NIK" VARCHAR(50) NOT NULL,
    "Jadwal_Masuk" TIME,
    "Jadwal_Pulang" TIME,
    "Actual_Masuk" TIMESTAMPTZ NULL,
    "Actual_Pulang" TIMESTAMPTZ NULL,
    "Prediksi_Shift" VARCHAR(50) DEFAULT NULL,
    "Prediksi_Actual_Masuk" TIMESTAMPTZ DEFAULT NULL,
    "Prediksi_Actual_Pulang" TIMESTAMPTZ DEFAULT NULL,
    "Probabilitas_Prediksi" VARCHAR(50),
    "Confidence_Score" VARCHAR(50),
    "Frekuensi_Shift_Historis" VARCHAR(50),
    "Status_Kehadiran" VARCHAR(50),
    "Status_Masuk" VARCHAR(50),
    "Status_Pulang" VARCHAR(50),
    UNIQUE (id_karyawan, "Tanggal", "Kode_Shift")
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff'
        CHECK (role IN ('admin', 'staff', 'guest')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (username)
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'users'
          AND constraint_type = 'CHECK'
          AND constraint_name LIKE '%role%'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    END IF;
END $$;

ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'guest')) NOT VALID;

ALTER TABLE users VALIDATE CONSTRAINT users_role_check;

CREATE INDEX IF NOT EXISTS idx_khd_nama_tanggal_scan ON kehadiran_karyawan (nama, tanggal_scan);
CREATE INDEX IF NOT EXISTS idx_khd_nama_tgl ON kehadiran_karyawan (nama, tanggal);
CREATE INDEX IF NOT EXISTS idx_khd_nik_tanggal ON kehadiran_karyawan (nip, tanggal);
CREATE INDEX IF NOT EXISTS idx_khd_pin_tanggal_scan ON kehadiran_karyawan (pin, tanggal_scan);
CREATE INDEX IF NOT EXISTS idx_khd_id_tanggal_scan ON kehadiran_karyawan (id_karyawan, tanggal_scan);
CREATE INDEX IF NOT EXISTS idx_khd_id_tanggal ON kehadiran_karyawan (id_karyawan, tanggal);

CREATE INDEX IF NOT EXISTS idx_jk_nama_tanggal ON jadwal_karyawan (nama, tanggal);
CREATE INDEX IF NOT EXISTS idx_jk_id_tanggal ON jadwal_karyawan (id_karyawan, tanggal);
CREATE INDEX IF NOT EXISTS idx_jk_id_shift_tanggal ON jadwal_karyawan (id_karyawan, kode_shift, tanggal);
CREATE INDEX IF NOT EXISTS idx_jk_tanggal_id ON jadwal_karyawan (tanggal, id_karyawan);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

CREATE OR REPLACE FUNCTION to_wib(ts TIMESTAMPTZ)
RETURNS TIMESTAMP AS $$
    SELECT ts AT TIME ZONE 'Asia/Jakarta'
$$ LANGUAGE SQL IMMUTABLE;
