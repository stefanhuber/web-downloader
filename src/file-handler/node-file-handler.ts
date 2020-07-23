import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { FileHandler, File } from '../api';
import { getFilesForCleanup } from '../util';

export class NodeFileHandler implements FileHandler {

    constructor(
        protected baseDir:string
    ) {}

    selectProtocol(url:string) : any {
        if (url.search(/^http:\/\//) === 0) {
            return http;
        } else if (url.search(/^https:\/\//) === 0) {
            return https;
        } else {
            return null;
        }
    }

    download(file:File) {       
        return new Promise<void>((resolve, reject) => {
            const handler = this.selectProtocol(file.source);

            if (!handler) {
                reject("No handler for source: " + file.source);
            } else if (fs.existsSync(file.target) && (fs.statSync(file.target)['size'] > 0)) {
                resolve();
            } else {
                const fileStream = fs.createWriteStream(file.target, {'flags': 'a'});

                handler.get(file.source, (response:any) => {                    
                    response.on('data', (chunk:any) => {
                        fileStream.write(chunk, 'binary');       
                    });    
                    response.once('end', () => {
                        fileStream.end();
                        resolve();
                    });
                }).on('error', (error:any) => {
                    fs.unlinkSync(file.target);
                    reject("Error while downloading: " + error);
                });
            }
        });  
    }

    cleanup(files:Array<File>) {
        return new Promise<void>((resolve, reject) => {            
            try {
                const localFiles = fs.readdirSync(this.baseDir);
                const filesForCleanup = getFilesForCleanup(files, localFiles);

                for (let i = 0; i < filesForCleanup.length; i++) {
                    fs.unlinkSync(`${this.baseDir}/${filesForCleanup[i]}`);
                }          

                resolve();
            } catch (e) {
                reject(e);
            }   
        }); 
    }
}
