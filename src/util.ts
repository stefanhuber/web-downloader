import { File } from './api';

export function getFileIndex(files:Array<File>, localFile:string) : number {
    for (let i = 0; i < files.length; i++) {
        if (localFile == files[i].target) {
            return i;
        }
    }
    return -1;
}

export function getFilesForCleanup(files:Array<File>, localFiles:Array<string>) : Array<string> {
    let filesForCleanup = [];

    for (let localFile of localFiles) {
        let index = -1;

        index = getFileIndex(files, localFile);
                
        if (index < 0) {
            filesForCleanup.push(localFile);
        } else {
            // splice for performance improvement only
            files.splice(index,1);
        }
    }

    return filesForCleanup;
}