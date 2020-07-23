# Web Downloader

# Usage Example

```typescript
import { FileDownloader, NodeFileHandler } from "web-downloader";

const fileDownloader = new FileDownloader(
    new NodeFileHandler('/var/tmp/sample/directory'),
    [
        { source: 'https://testtest.com/123.jpg', target: 'myimage1.jpg' },
        { source: 'https://testtest.com/555555.jpg', target: 'myimage2.jpg' },
        // other files ...
    ]
);

fileDownloader.once('progress', (event) => {
    console.log(`${Math.floor(event.progress * 100)}% of files have been downloaded...`);
});

fileDownloader.once('complete', () => {
    // all files are downloaded
});

fileDownloader.once('error', () => { 
    // file download could not be complete
});

fileDownloader.download();
```