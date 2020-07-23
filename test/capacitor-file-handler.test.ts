import { CapacitorFileHandler } from "../src/file-handler/capacitor-file-handler";

const fetchFn = jest.fn();
const blobFn = jest.fn();

global.fetch = fetchFn;

const capacitorFileHandler = new CapacitorFileHandler();

test("should trigger download with mocked functions", (done) => {
    const source = "http://test.com";
    const target = `test`;
    const blob = new Blob(["foo", "bar"], {type: "text/text"});
    const writeFileFn = require('@capacitor/core').Plugins.Filesystem.writeFile;

    fetchFn.mockResolvedValueOnce({ blob: blobFn });
    blobFn.mockResolvedValueOnce(blob);

    capacitorFileHandler
        .triggerDownload({source: source, target: target})
        .then(async () => {         
            expect(writeFileFn.mock.calls[0][0]['path']).toEqual(`/test`);
            expect(writeFileFn.mock.calls[0][0]['data']).toEqual("data:text/text;charset=undefined,foobar");
            expect(writeFileFn.mock.calls.length).toEqual(1);
            done();
        });
});