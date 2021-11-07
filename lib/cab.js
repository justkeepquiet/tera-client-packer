"use strict";

const fs = require("fs");
const path = require("path");
const spawnSync = require("child_process").spawnSync;

const PROCESS_PATH = "bin\\elzma.exe";

module.exports = {
	compress(file, options) {
		const inputFile = path.resolve(file);
		let outputFile = path.resolve(`${file}.cab`);

		({ "deleteFile": false, "overwrite": true, "outputFile": null, "outputDirectory": null, ...options });

		if (!fs.existsSync(inputFile))
			throw `Input file "${inputFile}" is not exists`;

		if (options.outputDirectory)
			outputFile = path.join(options.outputDirectory, path.basename(outputFile));

		if (options.outputFile)
			outputFile = path.resolve(options.outputFile);

		if (options.overwrite || !fs.existsSync(outputFile))
			this._spawnProcess("compress", inputFile, outputFile);

		if (options.deleteFile)
			fs.unlinkSync(inputFile);
	},

	decompress(file, options) {
		const inputFile = path.resolve(file);
		let outputFile = path.resolve(file.replace(/\.cab$/g, ""));

		({ "deleteFile": false, "overwrite": true, "outputFile": null, "outputDirectory": null, ...options });

		if (!fs.existsSync(inputFile))
			throw `Input file "${inputFile}" is not exists`;

		if (options.outputDirectory)
			outputFile = path.join(options.outputDirectory, path.basename(outputFile));

		if (options.outputFile)
			outputFile = path.resolve(options.outputFile);

		if (options.overwrite || !fs.existsSync(outputFile))
			this._spawnProcess("decompress", inputFile, outputFile);

		if (options.deleteFile)
			fs.unlinkSync(inputFile);
	},

	/**
	 * Private functions
	 */
	_spawnProcess(flag, inputFile, outputFile) {
		const args = [...(flag === "compress" ? ["--compress", "-9", "-s", 26] : ["--decompress"]), "-f", "-k", "--lzma", inputFile, outputFile];
		const result = spawnSync(
			path.resolve(__dirname, PROCESS_PATH), args,
			{
				"cwd": process.cwd(),
				"env": process.env,
				"stdio": "pipe"
			}
		);

		if (String(result.stderr).length !== 0)
			throw `Error in ${flag}: ${String(result.stderr)}`;
	}
};
