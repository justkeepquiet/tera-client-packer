# Tera 92.03 Launcher Client Packer and Updater

Original Chinese launcher client packer for patch 92.03. Used with Nodejs.

## Install

1. Copy files.
2. Run `npm install`.
3. See **config.js** for details.
4. Run `app.bat`.

## Note

For packing files, a non-standard version of the LZMA format is used.   
We used a modified version of the **elzma.exe** utility, the source codes of which are available here https://github.com/justkeepquiet/easylzma

## Issues

There is a known problem with packing file `DO_NOT_DELETE.TXT` due to the fact that it has a size of zero.   
You may need to pack it manually or simply remove it.
