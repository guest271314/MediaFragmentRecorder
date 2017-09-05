# recordMediaFragments
Record and set metadata of and concatenate media fragments in browser

Motivation: [OfflineMediaContext](https://github.com/guest271314/OfflineMediaContext#offlinemediacontext), 
            [How to use Blob URL, MediaSource or other methods to play concatenated Blobs of media fragments?](https://stackoverflow.com/questions/45217962/how-to-use-blob-url-mediasource-or-other-methods-to-play-concatenated-blobs-of)

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

videoStream.width = video.width;

videoStream.height = video.height;

const mimeCodec = "video/webm;codecs=vp8,opus";
// for firefox
let blob, canvas, ctx, currentBlobURL, currentFragmentURL, 
    drawVideo, hash, raf = 0, request;

if (!hasCaptureStream) {
  // no audio output
  // TODO fix audio output
  videoStream.crossOrigin = "anonymous";
  canvas = document.createElement("canvas");

  canvas.setAttribute("width", video.width);
  canvas.setAttribute("height", video.height);

  document.body.appendChild(canvas);

  ctx = canvas.getContext("2d");

  drawVideo = (ctx, currentVideo, stream, timeStamp) => {
    ctx.drawImage(currentVideo, 0, 0);
    if (stream.active) {
      raf = window.requestAnimationFrame(drawVideo.bind(null, ctx, currentVideo, stream));
    } else {
      window.cancelAnimationFrame(raf);
    }
  }
}
    
// https://gist.github.com/jsturgis/3b19447b304616f18657
// https://www.w3.org/2010/05/video/mediaevents.html
const multipleUrls = [
  "https://media.w3.org/2010/05/sintel/trailer.mp4#t=0,5",
  "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=55,60",
  "https://raw.githubusercontent.com/w3c/web-platform-tests/master/media-source/mp4/test.mp4#t=0,5",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4#t=0,5",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4#t=0,5",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4#t=0,6",
  "https://media.w3.org/2010/05/video/movie_300.mp4#t=30,36"
];

mediaFragmentRecorder(<URL string or array of URLs>)
.then(recordedMediaFragments => {
  // `recordedMediaFragments` : array of objects : 
  // `mediaBlob:Blob, mediaBuffer:ArrayBuffer, mediaFileName:<filename>, mediaDuration:<media duration>`,
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

