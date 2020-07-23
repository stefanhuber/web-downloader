import { File } from './file';

export interface FileHandler {

    /**
     * The donwload works as following:
     *  - if the file already exists and is not empty: trigger complete
     *  - if the download is in progress: trigger next (0-1 progress for percent of download)
     *  - if the download enters any error condition, trigger error and an already downloaded part of the file
     */
    download(file:File): Promise<void>;

    /**
     * Remove all files, which are not inside the files array from local storage
     */
    cleanup(files: Array<File>): Promise<void>;

}

