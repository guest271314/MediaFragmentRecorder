// recordMediaFragments.js 2017 guest271314
// https://github.com/guest271314/recordMediaFragments

// https://github.com/guest271314/recordMediaFragments/blob/master/ts-ebml/ts-ebml-min.js
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

    const mediaFragmentRecorder = async(urls) => {
      // `ts-ebml`
      const tsebmlTools = async() => ({
        decoder: new tsebml.Decoder(),
        encoder: new tsebml.Encoder(),
        reader: new tsebml.Reader(),
        tools: tsebml.tools
      });
      // create `ArrayBuffer` from `Blob`
      const readAsArrayBuffer = (blob) => {
          return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsArrayBuffer(blob);
            fr.onloadend = () => {
              resolve(fr.result);
            };
            fr.onerror = (ev) => {
              reject(ev.error);
            };
          });
        }
        // `urls`: string or array of URLs
        // record each media fragment
      const recordMediaFragments = async(video, mimeCodec, decoder, encoder, reader, tools, ...urls) => {
          urls = [].concat(...urls);
          const media = [];
          for (let url of urls) {
            await new Promise(async(resolve) => {

              let mediaStream, recorder;

              videoStream.onprogress = e => {
                videoStream.onprogress = null;
                console.log("loading " + url)
              }

              videoStream.oncanplay = async(e) => {

                videoStream.oncanplay = null;
                videoStream.play();

                mediaStream = captureStream(videoStream);
                console.log(mediaStream);

                recorder = new MediaRecorder(mediaStream, {
                  mimeType: mimeCodec
                });

                recorder.ondataavailable = async(e) => {
                  // set metadata of recorded media fragment `Blob`
                  const mediaBlob = await setMediaMetadata(e.data);
                  // create `ArrayBuffer` of `Blob` of recorded media fragment
                  const mediaBuffer = await readAsArrayBuffer(mediaBlob);
                  const mediaDuration = videoStream.played.end(0) - videoStream.played.start(0);
                  const mediaFragmentId = currentFragmentURL || new URL(url);
                  const mediaFileName = mediaFragmentId.pathname.split("/").pop() + mediaFragmentId.hash;
                  const mediaFragmentType = "singleMediaFragment";
                  if (currentBlobURL) {
                    URL.revokeObjectURL(currentBlobURL);
                  }
                  media.push({
                    mediaBlob, mediaBuffer, mediaDuration, mediaFragmentType, mediaFileName
                  });
                  resolve();

                }
                recorder.start();
              }
              videoStream.onpause = e => {
                videoStream.onpause = null;
                cursor = videoStream.currentTime;
                recorder.stop();
                // stop `MediaStreamTrack`s
                for (let track of mediaStream.getTracks()) {
                  track.stop();
                }
              }

              if (!hasCaptureStream) {
                currentFragmentURL = new URL(url);
                console.log(currentFragmentURL);
                request = new Request(currentFragmentURL.href);
                blob = await fetch(request).then(response => response.blob());
                console.log(blob);
                currentBlobURL = URL.createObjectURL(blob);
                url = currentBlobURL + currentFragmentURL.hash;
              }
                
              // set hash of media fragment to `cursor`: last `.currentTime` of previous media fragment
              if (cursor > 0) {
                url = url.replace(/=\d+/, "=" + cursor);
                console.log(url);
              }

              videoStream.src = url;
            }).catch(err => err)
          }
          return media
        }
        // set metadata of media `Blob`
        // see https://github.com/legokichi/ts-ebml/issues/14#issuecomment-325200151
      const setMediaMetadata = async(blob) =>
        tsebmlTools()
        .then(async({
          decoder, encoder, tools, reader
        }) => {

          let webM = new Blob([], {
            type: "video/webm"
          });

          webM = new Blob([webM, blob], {
            type: blob.type
          });

          const buf = await readAsArrayBuffer(blob);
          const elms = decoder.decode(buf);
          elms.forEach((elm) => {
            reader.read(elm);
          });

          reader.stop();

          const refinedMetadataBuf = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);

          const webMBuf = await readAsArrayBuffer(webM);

          const body = webMBuf.slice(reader.metadataSize);
          const refinedWebM = new Blob([refinedMetadataBuf, body], {
            type: webM.type
          });
          // close Blobs
          if (webM.close && blob.close) {
            webM.close();
            blob.close();
          }

          return refinedWebM;
        })
        .catch(err => console.error(err));


      let mediaTools = await tsebmlTools();

      const {
        decoder, encoder, reader, tools
      } = mediaTools;

      const mediaFragments = await recordMediaFragments(video, mimeCodec, decoder, encoder, reader, tools, urls);

      const recordedMedia = await new Promise((resolveAllMedia, rejectAllMedia) => {
        console.log(decoder, encoder, tools, reader, mediaFragments);

        let mediaStream, recorder;

        mediaSource.onsourceended = e => {
          console.log(video.buffered.start(0), video.buffered.end(0));
          video.currentTime = video.buffered.start(0);

          console.log(video.paused, video.readyState);

          video.ontimeupdate = e => {

            console.log(video.currentTime, mediaSource.duration);
            if (video.currentTime >= mediaSource.duration) {
              video.ontimeupdate = null;
              video.oncanplay = null;
              video.onwaiting = null;
              if (recorder.state === "recording") {
                recorder.stop();
              }
              console.log(e, recorder);

            }
          }
        }
        video.onended = (e) => {
          video.onended = null;
          console.log(e, video.currentTime,
            mediaSource.duration);
        }
        video.oncanplay = e => {
            console.log(e, video.duration, video.buffered.end(0));
            video.play()
          }
          // firefox issue
        video.onwaiting = e => {
            console.log(e, video.currentTime);
          }
          // record `MediaSource` playback of recorded media fragments
        video.onplaying = async(e) => {
          console.log(e);
          video.onplaying = null;

          mediaStream = captureStream(video);

          recorder = new MediaRecorder(mediaStream, {
            mimeType: mimeCodec
          });
          console.log(recorder);

          recorder.ondataavailable = async(e) => {
            console.log(e);

            const mediaFragmentsRecording = {};

            mediaFragmentsRecording.mediaBlob = await setMediaMetadata(e.data);
            mediaFragmentsRecording.mediaBuffer = await readAsArrayBuffer(mediaFragmentsRecording.mediaBlob);
            mediaFragmentsRecording.mediaFileName = urls.map(url => {
              const id = new URL(url);
              return id.pathname.split("/").pop() + id.hash
            }).join("-");
            mediaFragmentsRecording.mediaFragmentType = "multipleMediaFragments";
            // `<video>` to play concatened media fragments
            // recorded from playback of `MediaSource`
            fragments = document.createElement("video");
            fragments.id = "fragments";
            fragments.width = video.width;
            fragments.height = video.height;
            fragments.controls = true;
            fragments.onloadedmetadata = () => {
              fragments.onloadedmetadata = null;
              mediaFragmentsRecording.mediaDuration = fragments.duration;
              URL.revokeObjectURL(currentBlobURL);
              // stop `MediaStreamTrack`s
              for (let track of mediaStream.getTracks()) {
                track.stop();
              }
              resolveAllMedia([
                ...mediaFragments, mediaFragmentsRecording
              ]);

            }
            currentBlobURL = URL.createObjectURL(mediaFragmentsRecording.mediaBlob);
            fragments.src = currentBlobURL;
            document.body.appendChild(fragments);

          }

          recorder.start();
        }

        video.src = URL.createObjectURL(mediaSource);

        let duration = 0;

        mediaSource.addEventListener("sourceopen", sourceOpen);

        async function sourceOpen(e) {

          if (MediaSource.isTypeSupported(mimeCodec)) {
            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            sourceBuffer.mode = "sequence";
            for (let {
                mediaBuffer, mediaDuration
              }
              of mediaFragments) {

              await new Promise(resolveUpdatedMediaSource => {
                sourceBuffer.onupdateend = e => {
                  sourceBuffer.onupdateend = null;
                  console.log(e, mediaDuration, mediaSource.duration, video.paused, video.ended, video.currentTime, "media source playing", video.readyState);
                  // https://bugzilla.mozilla.org/show_bug.cgi?id=1400587
                  // https://bugs.chromium.org/p/chromium/issues/detail?id=766002&q=label%3AMSEptsdtsCleanup
                  try {
                    sourceBuffer.timestampOffset += sourceBuffer.buffered.end(0);
                    resolveUpdatedMediaSource();
                  } catch (err) {
                    console.error(err);
                    resolveUpdatedMediaSource();
                  }

                }
                sourceBuffer.appendBuffer(mediaBuffer);
              })
            }

            mediaSource.endOfStream()

          } else {
            console.warn(mimeCodec + " not supported");
          }
        };

      })

      return recordedMedia
    };








