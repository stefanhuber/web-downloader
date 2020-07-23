import { FileHandler, File, getFilesForCleanup } from '../';
import { Plugins, FilesystemDirectory } from '@capacitor/core';
const { Filesystem } = Plugins; 

export class CapacitorFileHandler implements FileHandler  {

    constructor(
        protected baseDir:string = ""
    ) {}

    triggerDownload(file: File) {
        return new Promise<void>((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.addEventListener('load', (event) => {
                Filesystem.writeFile({
                    path: `${this.baseDir}/${file.target}`,
                    data: event.target?.result?.toString() || "",
                    directory: FilesystemDirectory.Data
                }).then(() => {
                    resolve();
                }).catch(error => {
                    reject(error);
                });            
            });
    
            fetch(file.source)
                .then(response => response.blob())
                .then(blob => fileReader.readAsDataURL(blob));
        });        
    }

    download(file:File) {
        return new Promise<void>((resolve) => {
            Filesystem.stat({
                path: `${this.baseDir}/${file.target}`,
                directory: FilesystemDirectory.Data
            }).then(stats => {
                if (stats.size > 0) {
                    resolve();
                } else {
                    resolve(this.triggerDownload(file));
                }
            }).catch(() => {
                resolve(this.triggerDownload(file));
            });
        });
    }

    cleanup(files:Array<File>) {        
        return new Promise<void>((resolve, reject) => {
            Filesystem.readdir({
                path: this.baseDir,
                directory: FilesystemDirectory.Data
            }).then(async filesInDirectory => {
                const filesForCleanup = getFilesForCleanup(files, filesInDirectory.files);
                for (let i = 0; i < filesForCleanup.length; i++) {
                    await Filesystem.deleteFile({
                        path: `${this.baseDir}/${filesForCleanup[i]}`,
                        directory: FilesystemDirectory.Data
                    });
                }
                resolve();
            }).catch(() => reject());
        });
    }
}
