"use strict";

const fs = require("fs");
const path = require("path");
const ini = require("ini");

// Default values. Don't change!
const DEFAULTS = Object.freeze({
	"Download": {
		"Retry": 3,
		"Wait": 1000,
		"Version": null,
		"DL root": "patch",
		"DB file": null
	},
	"CheckHash": {
		"count": 0,
		"hash": "d41d8cd98f00b204e9800998ecf8427e",
		"signature":
			"4bcd3c28f0b535df1b844defe5e547692b128ef2195d1ada38ed4b8cc9bc21c7" +
			"d5a220c1e92a678a8659afc4d6cf709c186d60de6ff888867d7f75967a80f370" +
			"98a94f9106e11637e74ebca1cd71144c153f26799b1b35cedab70ff105dfe1c0" +
			"fe8516ccefc304ff1012a8e69fcddf5909c0a30c1ba98da1c3ff7a88966b6335",
		"file0": "Binaries\\TERA.exe",
		"value0": "32f81770ad8d6e58d9ed5ebb952e8298"
	}
});

class Version {
	constructor(config) {
		this._config = config;
		this._iniData = { ...DEFAULTS };

		if (this._exists())
			this._load();
		else
			this.set(this._config.initialVersion || 0);
	}

	get() {
		this._load();

		return Number(this._iniData["Download"]["Version"]);
	}

	set(version) {
		this._iniData["Download"]["Version"] = Number(version);
		this._iniData["Download"]["DB file"] = `db/server.db.${version}.cab`;

		this._write();
	}

	/**
	 * Private functions
	 */
	_load() {
		this._iniData = ini.decode(
			fs.readFileSync(this._config.versionFile, "utf8")
		);
	}

	_write() {
		fs.writeFileSync(
			path.resolve(this._config.versionFile),
			ini.encode(this._iniData)
		);
	}

	_exists() {
		return fs.existsSync(path.resolve(this._config.versionFile));
	}
}

module.exports = Version;