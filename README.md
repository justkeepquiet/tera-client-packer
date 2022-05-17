# Tera 92 Launcher Client Packer and Updater

Original Chinese launcher client packer for patch 92. Used with Nodejs.

## Install

1. Install latest node.js from https://nodejs.org
2. Run command `npm install -g node-gyp` for install node-gyp.
3. Download and unzip files from this repository to your folder.
2. Open cmd, go to your folder and run command `npm install`.
3. Open and edit **config.js** to set your paths to client files and patch place.

## File structure

The unpacked clean client files must be placed in the directory specified in the `clientDirectory` parameter. After running the utility, these files will be hashed and added to the patch database.

The patch files will be placed in the directory specified in the `patchDirectory` parameter. 

Information about the database version, lists and hashes of all files is located in the **server.db.x.cab** file, which is located in the directory specified in the `databaseDirectory` parameter.

The path to the version file (**version.ini**) is specified in the `versionFile` parameter.

## Usage

After all parameters are configured and the client is placed in the directory, run the `app.bat` file to create a first patch.

All files placed in client directory (`clientDirectory`) will be hashed, after which a hash database will be created in database directory (`databaseDirectory`), in which the checksums of all files will be entered.

After that, the client files will be packed into cab-archives and placed in the patch directory (`patchDirectory`). The original client files are not deleted.

After the process is completed, the version file (`versionFile`) will be automatically updated.

### Patching the client after the change

After you have changed some files in the client, just replace those files in the client directory and start the `app.bat` again.

The client will be re-hashed, all found changes will be packed into new cab archives and automatically added to the database.

## Note

For packing files, a non-standard version of the LZMA format is used.   
We used a modified version of the **elzma.exe** utility, the source codes of which are available here https://github.com/justkeepquiet/easylzma
