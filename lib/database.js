"use strict";

const fs = require("fs");
const path = require("path");
const Sqlite = require("better-sqlite3");
const cab = require("./cab");

const CREATE_STRUCTURE = [
	"BEGIN TRANSACTION;",
	`CREATE TABLE IF NOT EXISTS "file_info" (
		"id"	integer,
		"unique_path"	text UNIQUE,
		"path"	text,
		"property"	integer,
		PRIMARY KEY("id")
	);`,
	`CREATE TABLE IF NOT EXISTS "file_version" (
		"id"	integer,
		"version"	integer,
		"size"	integer,
		"hash"	text
	);`,
	`CREATE TABLE IF NOT EXISTS "file_size" (
		"id"	integer,
		"org_ver"	integer,
		"new_ver"	integer,
		"size"	integer
	);`,
	`CREATE TABLE IF NOT EXISTS "version_info" (
		"version"	integer,
		"version_path"	text UNIQUE,
		"reg_date"	text DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY("version")
	);`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "id_version" ON "file_version" (
		"id",
		"version"
	);`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "id_diff" ON "file_size" (
		"id",
		"org_ver",
		"new_ver"
	);`,
	"COMMIT;"
];

/**
 * Table `file_info`
 */
class TableFileInfo {
	constructor(db) {
		this._db = db;
	}

	add(file, property = 0) {
		const uniquePath = file.toLowerCase();
		const query = this._db.prepare("SELECT 1 FROM file_info WHERE unique_path = ?").all(uniquePath);

		if (query.length === 0) {
			this._db.prepare("INSERT INTO file_info (unique_path, path, property) VALUES (?, ?, ?)").run(uniquePath, file, property);
		}
	}

	getAll() {
		return this._db.prepare("SELECT * FROM file_info").all();
	}
}

/**
 * Table `file_version`
 */
class TableFileVersion {
	constructor(db) {
		this._db = db;
	}

	add(id, version, size, hash) {
		const query = this._db.prepare("SELECT 1 FROM file_version WHERE id = ? AND version = ?").all(id, version); // id_version

		if (query.length === 0) {
			return this._db.prepare("INSERT INTO file_version (id, version, size, hash) VALUES (?, ?, ?, ?)").run(id, version, size, hash);
		}

		return false;
	}

	getAll() {
		return this._db.prepare("SELECT * FROM file_version").all();
	}

	getMaxById(id) {
		return this._db.prepare("SELECT MAX(version) as max_version FROM file_version WHERE id = ?").all(id)[0]["max_version"];
	}

	existsById(id) {
		return this._db.prepare("SELECT 1 FROM file_version WHERE id = ?").all(id).length !== 0;
	}

	checkHashById(id, hash) {
		return this._db.prepare("SELECT 1 FROM file_version WHERE id = ? AND hash = ?").all(id, hash).length !== 0;
	}
}

/**
 * Table `file_size`
 */
class TableFileSize {
	constructor(db) {
		this._db = db;
	}

	add(id, orgVer, newVer, size) {
		const query = this._db.prepare("SELECT 1 FROM file_size WHERE id = ? AND org_ver = ? AND new_ver = ?").all(id, orgVer, newVer); // id_diff

		if (query.length === 0) {
			this._db.prepare("INSERT INTO file_size (id, org_ver, new_ver, size) VALUES (?, ?, ?, ?)").run(id, orgVer, newVer, size);
		}
	}

	getAll() {
		return this._db.prepare("SELECT * FROM file_size").all();
	}

	getLastById(id) {
		return this._db.prepare("SELECT *, (org_ver + new_ver) AS ver_sum FROM file_size WHERE id = ? ORDER BY ver_sum DESC LIMIT 1").all(id)[0];
	}
}

/**
 * Table `version_info`
 */
class TableVersionInfo {
	constructor(db) {
		this._db = db;
	}

	add(version, versionPath, regDate) {
		const query = this._db.prepare("SELECT 1 FROM version_info WHERE version_path = ?").all(versionPath);

		if (query.length === 0) {
			this._db.prepare("INSERT INTO version_info (version, version_path, reg_date) VALUES (?, ?, ?)").run(version, versionPath, regDate);
		}
	}

	getAll() {
		return this._db.prepare("SELECT * FROM version_info").all();
	}

	getMax() {
		return this._db.prepare("SELECT MAX(version) as max_version FROM version_info").all()[0]["max_version"];
	}
}

class Database {
	constructor(config) {
		this._config = config;
	}

	load(dbVersion) {
		const packedDbFile = path.resolve(this._config.databaseDirectory, `server.db.${dbVersion}.cab`);
		const unpackedDbFile = path.resolve(this._config.tempDirectory, "server.db");

		if (fs.existsSync(packedDbFile))
			this._unpack(packedDbFile, dbVersion);

		this._db = new Sqlite(unpackedDbFile);
		this._create();
	}

	FileInfo() {
		return new TableFileInfo(this._db);
	}

	FileSize() {
		return new TableFileSize(this._db);
	}

	FileVersion() {
		return new TableFileVersion(this._db);
	}

	VersionInfo() {
		return new TableVersionInfo(this._db);
	}

	pack(dbVersion) {
		this._db.close();

		const unpackedDbFile = path.resolve(this._config.tempDirectory, "server.db");
		const renamedDbFile = path.resolve(this._config.tempDirectory, `server.db.${dbVersion}`);

		fs.renameSync(unpackedDbFile, renamedDbFile);

		cab.compress(renamedDbFile, {
			"outputDirectory": path.resolve(this._config.databaseDirectory),
			"deleteFile": true,
			"overwrite": true
		});
	}

	/**
	 * Private functions
	 */
	_unpack(packedDbFile, dbVersion) {
		const unpackedDbFile = path.resolve(this._config.tempDirectory, `server.db.${dbVersion}`);
		const renamedDbFile = path.resolve(this._config.tempDirectory, "server.db");

		cab.decompress(packedDbFile, { "outputDirectory": path.resolve(this._config.tempDirectory) });
		fs.renameSync(unpackedDbFile, renamedDbFile);
	}

	_create() {
		CREATE_STRUCTURE.forEach(query => this._db.exec(query));
	}
}

module.exports = Database;
