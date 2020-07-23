import { EventEmitter } from 'events';
import { FileHandler, File } from './api'

export class FileDownloader extends EventEmitter {

    constructor(
        protected _fileHandler: FileHandler,
        protected _files: Array<File> = [],
        protected _retryTimeout: number = 1000,
        protected _retries: number = 3
    ) {
        super();
    }

    /**
     * 
     * Try to download file from {@link this._files} array by given index
     * 
     * If a download error occurs it is retried {@link this._retries} number of times
     * and before each retry is happing {@link this._retryTimeout} milliseconds waiting time occurs
     * 
     * @event file-download-error is triggered for every file download error that occurs
     * @param index index of the {@link this._files} array to download
     * @returns boolean to state if download was successful or not
     */
    async downloadFile(index:number): Promise<boolean> {
        for (let r = 0; r <= this._retries; r++) {
            try {
                await this._fileHandler.download(this._files[index]);
                return true;
            } catch(error) {
                this.emit('file-download-error', { index: index, length: this._files.length, error: error });
                await this.wait();
            }
        }
        return false;
    }

    async download(): Promise<boolean> {
        for (let i = 0; i < this._files.length; i++) {
            const success = await this.downloadFile(i);        
            
            if (success) {
                this.emit('progress', { index: i, length: this._files.length, progress: ((i+1)/this._files.length) });
            } else {
                this.emit('error');
                return false;
            }            
        }

        this.emit('complete');
        return true;
    }

    async cleanup(): Promise<boolean> {
        try {
            await this._fileHandler.cleanup(this._files);
            return true;
        } catch (error) {
            return false;
        }
    }

    wait() {
        return new Promise(resolve => setTimeout(resolve, this._retryTimeout));    
    }
}