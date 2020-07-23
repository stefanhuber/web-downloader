const cap = jest.genMockFromModule('@capacitor/core');

const statFn = jest.fn();
const writeFileFn = jest.fn();

statFn.mockResolvedValue({ size: 0 });
writeFileFn.mockResolvedValue("");

cap.Plugins = {
    Filesystem: {
        stat: statFn,
        writeFile: writeFileFn
    }
};

module.exports = cap;