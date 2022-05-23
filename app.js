"use strict";

const path = require("path");

const config = require("./config");
const Version = require("./lib/version");
const Database = require("./lib/database");
const Client = require("./lib/client");

/**
 * ONLY FOR DEBUG ISSUES!
 */
const SKIP_HASHING = false;

class App {
	constructor() {
		this.version = new Version(config);
		this.db = new Database(config);
		this.client = new Client(config);

		this.clientFiles = new Map();
		this.dbVersion = null;
		this.dbChanged = false;

		this.results = {
			"added": [],
			"updated": [],
			"removed": [],
			"packed": []
		};
	}

	loadDatabase() {
		this.dbVersion = this.version.get();
		console.log("loadDatabase [Begin]");

		this.db.load(this.dbVersion);

		console.log("loadDatabase [Loaded]: version:", this.dbVersion);
		console.log("loadDatabase [End]");
	}

	loadFiles() {
		console.log("loadFiles [Begin]");
		const clientList = this.client.list();
		const total = clientList.length;

		clientList.forEach((file, i) => {
			const filePath = file.substr(path.resolve(config.clientDirectory).length + 1);

			this.db.FileInfo().add(filePath);

			console.log("loadFiles [Add] (", i + 1, "/", total, "):", filePath);
		});

		console.log("loadFiles [End]");
	}

	processDatabase() {
		console.log("processDatabase [Begin]");
		const fileInfoList = this.db.FileInfo().getAll();

		let fileHash = null;
		let fileSize = null;

		const total = fileInfoList.length;

		fileInfoList.forEach((fileInfo, i) => {
			if (this.client.exists(fileInfo.path)) { // client file already exists
				if (!SKIP_HASHING) {
					fileHash = this.client.getHash(fileInfo.path);
					fileSize = this.client.getSize(fileInfo.path);
				}

				if (this.db.FileVersion().existsById(fileInfo.id)) { // hash exists, compare hash
					const fileVersion = this.db.FileVersion().getMaxById(fileInfo.id);

					if (SKIP_HASHING || this.db.FileVersion().checkHashById(fileInfo.id, fileHash)) { // hash exists and match
						// Interrupt fix
						const fileSizeInfo = {
							"org_ver": -1,
							"new_ver": 1,
							...this.db.FileSize().getLastById(fileInfo.id)
						};

						// Current version
						this.clientFiles.set(fileInfo.path, {
							"id": fileInfo.id,
							"orgVersion": fileSizeInfo.org_ver,
							"newVersion": fileSizeInfo.new_ver
						});

						console.log("processDatabase [Match] (", i + 1, "/", total, "):", fileInfo.path);
						return;
					}

					const newFileVersion = fileVersion + 1;

					this.db.FileVersion().add(fileInfo.id, newFileVersion, fileSize, fileHash);

					// New version
					this.clientFiles.set(fileInfo.path, {
						"id": fileInfo.id,
						"orgVersion": -1, // fileVersion
						"newVersion": newFileVersion
					});

					this.results.updated.push(fileInfo.path);

					console.log("processDatabase [Updated] (", i + 1, "/", total, "):", fileInfo.path, ": new version:", newFileVersion);
				} else { // hash not exists, add new
					this.db.FileVersion().add(fileInfo.id, 1, fileSize, fileHash);

					// Initial version
					this.clientFiles.set(fileInfo.path, {
						"id": fileInfo.id,
						"orgVersion": -1,
						"newVersion": 1
					});

					this.results.added.push(fileInfo.path);

					console.log("processDatabase [New] (", i + 1, "/", total, "):", fileInfo.path, ": initial version:", 1);
				}
			} else { // client file not more exists, add "empty" record
				const fileVersion = this.db.FileVersion().getMaxById(fileInfo.id);
				const newFileVersion = fileVersion + 1;

				this.db.FileVersion().add(fileInfo.id, newFileVersion, -1, ""); // add empty
				this.results.removed.push(fileInfo.path);

				console.log("processDatabase [Removed] (", i + 1, "/", total, "):", fileInfo.path, ": new version:", newFileVersion);
			}

			this.dbChanged = true;
		});

		console.log("processDatabase [End]");
	}

	processFiles() {
		console.log("processFiles [Begin]");

		if (this.clientFiles.size !== 0) {
			const total = this.clientFiles.size;
			let i = 0;

			this.clientFiles.forEach((fileData, filePath) => {
				if (this.client.Package().exists(fileData.id, fileData.newVersion)) { // package file exists
					const packageSize = this.client.Package().getSize(fileData.id, fileData.newVersion);

					this.db.FileSize().add(fileData.id, fileData.orgVersion, fileData.newVersion, packageSize); // current size

					console.log("processFiles [Exists] (", ++i, "/", total, ")", filePath);
				} else { // package file not exists
					this.client.Package().create(filePath, fileData.id, fileData.newVersion);

					const packageSize = this.client.Package().getSize(fileData.id, fileData.newVersion);

					this.db.FileSize().add(fileData.id, fileData.orgVersion, fileData.newVersion, packageSize); // now size
					this.results.packed.push(filePath);

					console.log("processFiles [Packed] (", ++i, "/", total, ")", filePath, ": version:", fileData.newVersion);
				}
			});

			console.log("processFiles [End]");
		} else
			console.log("processFiles [End]: Empty file list");
	}

	updateDatabase() {
		console.log("updateDatabase [Begin]");

		const dateTime = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
		let dbVersion = this.dbVersion;

		if (SKIP_HASHING || this.dbChanged)
			this.db.VersionInfo().add(++dbVersion, `version\\ver${dbVersion}`, dateTime);

		this.db.pack(dbVersion);
		this.version.set(dbVersion);

		console.log("updateDatabase [Updated]: version:", dbVersion);
		console.log("updateDatabase [End]");
	}

	showResults() {
		console.log("showResult [Added]:", this.results.added);
		console.log("showResult [Updated]:", this.results.updated);
		console.log("showResult [Removed]:", this.results.removed);
		console.log("showResult [Packed]:", this.results.packed);
	}
}

try {
	const app = new App();

	app.loadDatabase();
	app.loadFiles();
	app.processDatabase();
	app.processFiles();
	app.updateDatabase();
	app.showResults();
} catch (e) {
	const stack = e.stack.match(/at App.([^\s]+)\s/);

	if (stack)
		console.error(stack[1], "[Error]:", e.stack);
	else
		console.error(e);
}

// end