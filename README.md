# Tera 92 Launcher Client Packer and Updater

Original Chinese launcher client packer for patch 92. Used with Nodejs.

## Install and Usage

1. Install latest node.js from https://nodejs.org
2. Run command `npm install -g node-gyp` for install node-gyp.
3. Download and unzip files from this repository to your folder.
2. Open cmd, go to your folder and run command `npm install`.
3. Open and edit **config.js** to set your paths to client files and patch place.
4. Run `app.bat` to start hashing files and generating a patch database.

## File structure

The unpacked clean client files must be placed in the directory specified in the `clientDirectory` parameter. After running the utility, these files will be hashed and added to the patch database.

The patch files will be placed in the directory specified in the `patchDirectory` parameter. Information about the database version, lists and hashes of all files is located in the **server.db.x.cab** file, which is located in the directory specified in the `databaseDirectory` parameter. The path to the version file (**version.ini**) is specified in the `versionFile` parameter.

## Note

For packing files, a non-standard version of the LZMA format is used.   
We used a modified version of the **elzma.exe** utility, the source codes of which are available here https://github.com/justkeepquiet/easylzma
