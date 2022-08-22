# tera-client-packer

TERA Client patcher and updater for original BHS Launcher. Used with Node.js.

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

After all is configured and your client files placed, run `pack_all.bat` file to create a first patch.

All files placed in client directory will be hashed, after which a hash database will be created in database directory, in which the checksums of all files will be entered.

After that, the client files will be automatically packed into cab-archives and placed in the patch directory. The original client files are not deleted or changed.

After the process is completed, the version file will be automatically updated.

### Patching client after change

After you have changed some files in the client, just replace files in the client directory and start the `pack_all.bat` or `pack_S1Data.bat` (if you need to update DataCenter files only). The client will be re-hashed, all found changes will be packed into new cab-archives and automatically added to the database.

## Note

For packing files, a non-standard version of the LZMA format is used.   
We used a modified version of the **elzma.exe** utility, the source codes of which are available here https://github.com/justkeepquiet/easylzma
