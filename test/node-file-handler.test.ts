import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { NodeFileHandler } from "../src/file-handler/node-file-handler";

const dir = `${__dirname}/../.tmp`;
const dirAlternative = `${__dirname}/../.tmp-alt`;
const nodeFileHandler = new NodeFileHandler(dir);
const nodeFileHandlerAlternative = new NodeFileHandler(dirAlternative);

beforeAll(() => {    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (!fs.existsSync(dirAlternative)) {
        fs.mkdirSync(dirAlternative);
    }
});

afterAll(() => {
    fs.rmdirSync(dir, {recursive:true});
    fs.rmdirSync(dirAlternative, {recursive:true});
});

test("should retrieve right handler", () => {
    let httpHandler = nodeFileHandler.selectProtocol("http://someurl.com/image.jpg");
    expect(httpHandler).toEqual(http);

    let httpsHandler = nodeFileHandler.selectProtocol("https://someurl.com/image.jpg");
    expect(httpsHandler).toEqual(https);

    let nullHandler = nodeFileHandler.selectProtocol("notsupported://blub");
    expect(nullHandler).toBeNull();  
});

test("should download sample image from https source and store with new name", (done) => {
    const source = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/800px-FullMoon2010.jpg";
    const target = `${dir}/full-moon-${(new Date()).getTime()}.jpg`;

    nodeFileHandler
        .download({source: source, target: target})
        .then(() => {
            expect(fs.existsSync(target)).toBeTruthy();
            done();
        });
});

test("should not download if file with same name exists and bytesize > 0", (done) => {
    const source = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/800px-FullMoon2010.jpg";
    const target = `${dir}/full-moon-sensless.jpg`;

    const file = fs.createWriteStream(target, {'flags': 'a'});
    const dummyData = Buffer.from("some sensless information to fill bytes...");
   
    file.write(dummyData);
    file.end(() => {
        nodeFileHandler            
            .download({source: source, target: target})
            .then(() => {
                const readData = fs.readFileSync(target);
                expect(readData.toString('utf-8')).toEqual(dummyData.toString('utf-8'));
                done();
            });
    });
});

test("should correctly cleanup files", (done) => {    
    for (let i = 1; i < 5; i++) {
        fs.writeFileSync(`${dirAlternative}/file${i}`, `some data for file ${i}`);
    }

    nodeFileHandlerAlternative.cleanup([
        { source : '' , target : 'file1' },
        { source : '' , target : 'file2' }
    ]).then(() => {
        const files = fs.readdirSync(dirAlternative);
        expect(files.length).toEqual(2);
        done();
    });    
});
