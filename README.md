# MediaFragmentRecorder
Record and set metadata of and concatenate media fragments in browser

Motivation: [OfflineMediaContext](https://github.com/guest271314/OfflineMediaContext#offlinemediacontext), 
            [How to use Blob URL, MediaSource or other methods to play concatenated Blobs of media fragments?](https://stackoverflow.com/questions/45217962/how-to-use-blob-url-mediasource-or-other-methods-to-play-concatenated-blobs-of), `$ ffmpeg -i concat:"int.mpg|int1.mpg" -c copy int_all.mpg`, `$ ffmpeg -i int_all.mpg -qscale:v 2 mix.webm`

Depends: [ts-ebml](https://github.com/legokichi/ts-ebml)

Usage:
```
    const tsebml = require("ts-ebml");

    const video = document.querySelector("video");

    const videoStream = document.createElement("video");

    // `MediaSource`
    const mediaSource = new MediaSource();
    // for firefox 
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1259788
    const hasCaptureStream = HTMLMediaElement.prototype.hasOwnProperty("captureStream");

    const captureStream = mediaElement =>
      !!mediaElement.mozCaptureStream ? mediaElement.mozCaptureStream() : mediaElement.captureStream();

    let currentFragmentURL, currentBlobURL, fragments;

    videoStream.width = video.width;

    videoStream.height = video.height;

    const mimeCodec = "video/webm;codecs=vp8,opus";

    mediaFragmentRecorder(<URL string or array of URLs>)
    .then(recordedMediaFragments => {
      // `recordedMediaFragments` : array of objects : 
      // `mediaBlob:Blob, mediaBuffer:ArrayBuffer, 
      // mediaFileName:<filename>, 
      // mediaDuration:<media duration>`,
      // `mediaFragmentType`: <"singleMediaFragment" or "multipleMediaFragments">
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

