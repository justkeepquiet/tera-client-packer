"use strict";

const recursiveReadSync = require("recursive-readdir-sync");
const fs = require("fs");
const path = require("path");
const md5File = require("md5-file");
const wcmatch = require("wildcard-match");
const cab = require("./cab");

class ClientPackage {
	constructor(config) {
		this._config = config;
	}

	create(file, id, version) {
		const sourceFile = path.resolve(this._config.clientDirectory, file);
		const tempFile = path.resolve(this._config.tempDirectory, `${id}-${version}`);
		const destinationFile = path.resolve(this._config.patchDirectory, `${id}-${version}.cab`);

		if (this._config.crossDevice) {
			cab.compress(sourceFile, { "outputFile": destinationFile, "deleteFile": false });
		} else {
			cab.compress(sourceFile, { "outputFile": tempFile, "deleteFile": false });
			fs.renameSync(tempFile, destinationFile);
		}
	}

	getSize(id, version) {
		return fs.statSync(path.resolve(this._config.patchDirectory, `${id}-${version}.cab`)).size;
	}

	exists(id, version) {
		return fs.existsSync(path.resolve(this._config.patchDirectory, `${id}-${version}.cab`));
	}
}

class Client {
	constructor(config) {
		this._config = config;
	}

	list() {
		const clientDirectory = path.resolve(this._config.clientDirectory);
		const list = recursiveReadSync(clientDirectory);

		const isMatch = wcmatch(
			this._config.clientExcludes.map(file =>
				path.resolve(this._config.clientDirectory, file).toLowerCase().replace(/\\/g, "\\\\")
			)
		);

		return list.filter(file => !isMatch(file.toLowerCase()));
	}

	getHash(file) {
		return md5File.sync(path.resolve(this._config.clientDirectory, file));
	}

	getSize(file) {
		return fs.statSync(path.resolve(this._config.clientDirectory, file)).size;
	}

	exists(file) {
		return fs.existsSync(path.resolve(this._config.clientDirectory, file));
	}

	Package() {
		return new ClientPackage(this._config);
	}
}

module.exports = Client;
