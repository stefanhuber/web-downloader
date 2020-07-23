import { getFilesForCleanup, File } from '../src';

const files: Array<File> = [
    { source : '' , target : 'file-1'} ,
    { source : '' , target : 'file-2'} ,
    { source : '' , target : 'file-3'} ,
];

test("should show files to remove", () => {
    let cleanupFiles = getFilesForCleanup(files, ['file-1','file-4']);
    expect(cleanupFiles[0]).toEqual('file-4');
});