import { FileDownloader } from "../src";

const downloadFn = jest.fn();
const cleanupFn = jest.fn();

let fileDownloader = new FileDownloader({
  download: downloadFn,
  cleanup: cleanupFn
},[
  { source: 'test1', target:''},
  { source: 'test2', target:''}
], 100, 3);

beforeEach(() => {
  downloadFn.mockReset();
  cleanupFn.mockReset();
  fileDownloader.removeAllListeners();
})

test("should trigger complete as download correctly ended, however with 2 errors in between", (done) => {
  downloadFn.mockRejectedValueOnce('mocked error 1');
  downloadFn.mockResolvedValueOnce(true);
  downloadFn.mockRejectedValueOnce('mocked error 2');
  downloadFn.mockResolvedValueOnce(true);

  fileDownloader.on('progress', (e) => {
    if (e.index == 0) {
      expect(e.progress).toBeCloseTo(0.5);
    } else {
      expect(e.progress).toBeCloseTo(1.0);
    }
  });

  fileDownloader.once('complete', () => { 
    expect(downloadFn.mock.calls.length).toEqual(4);
    done();
  });
  
  fileDownloader.download();
});

test("should check that 3 retries are triggered, 4 call all in all", (done) => {
  let retries = 0;

  downloadFn.mockRejectedValueOnce('mocked error 1');
  downloadFn.mockRejectedValueOnce('mocked error 2');
  downloadFn.mockRejectedValueOnce('mocked error 3');
  downloadFn.mockRejectedValueOnce('mocked error 4');

  fileDownloader.on('file-download-error', (e) => {
    retries++;
    expect(e.index).toEqual(0);
    expect(e.error).toEqual(`mocked error ${retries}`);
  });

  fileDownloader.once('error', () => { 
    expect(retries).toEqual(4);
    expect(downloadFn.mock.calls.length).toEqual(4);
    done();
  });
  
  fileDownloader.download();  
});


