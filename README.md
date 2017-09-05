# recordMediaFragments
Record and set metadata of and concatenate media fragments in browser

Motivation: [OfflineMediaContext](https://github.com/guest271314/OfflineMediaContext#offlinemediacontext), 
            [How to use Blob URL, MediaSource or other methods to play concatenated Blobs of media fragments?](https://stackoverflow.com/questions/45217962/how-to-use-blob-url-mediasource-or-other-methods-to-play-concatenated-blobs-of)

Depends: [ts-ebml](https://github.com/legokichi/ts-ebml)

Usage:
```
mediaFragmentRecorder(<URL string or array of URLs>)
.then(recordedMediaFragments => {
  // `recordedMediaFragments` : array of objects : 
  // `mediaBlob:Blob, mediaBuffer:ArrayBuffer, mediaFileName:<filename>, mediaDuration:<media duration>`
  // do stuff with recorded media fragments
  console.log(recordedMediaFragments);
  const select = document.createElement("select");
  for (let {mediaFileName, mediaBlob, mediaFragmentType} of Object.values(recordedMediaFragments)) {
    const option = new Option(mediaFileName, URL.createObjectURL(mediaBlob));
    select.appendChild(option);
  }
  select.onchange = () => {
    document.getElementById("fragments").src = select.value;
  }
  video.parentNode.insertBefore(select, video);
  })
  .catch(err => console.error(err));
```

