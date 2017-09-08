// recordMediaFragments.js 2017 guest271314
// https://github.com/guest271314/recordMediaFragments

// https://github.com/guest271314/recordMediaFragments/blob/master/ts-ebml/ts-ebml-min.js
// const tsebml = require("ts-ebml");

// const video = document.querySelector("video");

// const videoStream = document.createElement("video");
// `MediaSource`
// const mediaSource = new MediaSource();

// const mimeCodec = "video/webm;codecs=vp8,opus";

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

              videoStream.width = video.width;
              videoStream.height = video.height;

              // for firefox
              let audioContext, audioMediaStream, audioStream, canvasStream, gainNode, mediaStream, recorder,
                sourceNode;

              videoStream.onprogress = e => {
                console.log("loading " + url)
              }

              videoStream.oncanplay = async(e) => {
                // for firefox 
                if (!hasCaptureStream) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                };

                videoStream.oncanplay = null;
                videoStream.play();

                mediaStream = await new Promise(resolveMediaStream => {
                  if (hasCaptureStream) {
                    resolveMediaStream(videoStream.captureStream());
                  }
                  // for firefox
                  else {
                    audioContext = new AudioContext();

                    audioMediaStream = audioContext.createMediaStreamDestination();
                    sourceNode = audioContext.createMediaElementSource(videoStream);
                    gainNode = audioContext.createGain();
                    gainNode.gain.value = 0;
                    gainNode.connect(audioContext.destination)
                    sourceNode.connect(audioContext.destination);
                    sourceNode.connect(audioMediaStream);
                    audioStream = audioMediaStream.stream;
                    drawVideo(ctx, videoStream, audioStream);
                    canvasStream = canvas.captureStream(60);
                    audioStream.addTrack(canvasStream.getVideoTracks()[0]);

                    resolveMediaStream(audioStream);
                  }

                });
                // record `MediaStream`
                recorder = new MediaRecorder(mediaStream, {
                  mimeType: mimeCodec
                });

                recorder.ondataavailable = async(e) => {
                  // stop `MediaStreamTrack`s
                  for (let track of mediaStream.getTracks()) {
                    track.stop();
                  }
                  // set metadata of recorded media fragment `Blob`
                  const mediaBlob = await setMediaMetadata(e.data);
                  // create `ArrayBuffer` of `Blob` of recorded media fragment
                  const mediaBuffer = await readAsArrayBuffer(mediaBlob);
                  const mediaDuration = videoStream.played.end(0) - videoStream.played.start(0);
                  const mediaFragmentId = currentFragmentURL || new URL(url);
                  const mediaFileName = mediaFragmentId.pathname.split("/").pop() + mediaFragmentId.hash;
                  const mediaFragmentType = "singleMediaFragment";
                  media.push({
                    mediaBlob, mediaBuffer, mediaDuration, mediaFragmentType, mediaFileName
                  });
                  resolve();
                  if (currentBlobURL) {
                    URL.revokeObjectURL(currentBlobURL);
                  }
                  if (audioContext) {
                    audioContext.close()
                  }
                }
                recorder.start();
              }
              videoStream.onpause = e => {
                  videoStream.onpause = null;
                  recorder.stop();
                  // stop `MediaStreamTrack`s
                  for (let ms of[audioStream, canvasStream, mediaStream]) {
                    if (ms) {
                      for (let track of ms.getTracks()) {
                        track.stop();
                      }
                    }
                  }
                  // for firefox, close `AudioContext`
                  // try to get audio output
                }
                // attempt to work around no audio output
                // for cross origin URL
                // does not result in audio output
                /*
                if (!hasCaptureStream) {
                  currentFragmentURL = new URL(url);
                  console.log(currentFragmentURL);
                  request = new Request(currentFragmentURL.href);
                  blob = await fetch(request).then(response => response.blob());
                  console.log(blob);
                  currentBlobURL = URL.createObjectURL(blob);
                  url = `${currentBlobURL}${currentFragmentURL.hash}`
                }
                */
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

        let audioContext, audioMediaStream, audioStream, canvasStream,
          gainNode, fragments, mediaStream, recorder, sourceNode;

        mediaSource.onsourceended = e => {
            video.ontimeupdate = e => {

              console.log(video.currentTime, mediaSource.duration);
              if (video.currentTime === mediaSource.duration) {
                video.ontimeupdate = null;
                recorder.stop();
                console.log(e, recorder);

                // stop `MediaStreamTrack`s
                for (let ms of[audioStream, canvasStream, mediaStream]) {
                  if (ms) {
                    for (let track of ms.getTracks()) {
                      track.stop();
                    }
                  }
                }
                // for firefox 
                if (audioContext) {
                  audioContext.close()
                };
              }
            }
          }
          // record `MediaSource` playback of recorded media fragments
        video.onplaying = async(e) => {
          console.log(e);
          video.onplaying = null;
          mediaStream = await new Promise(resolveMediaStream => {
            if (HTMLMediaElement.prototype.hasOwnProperty("captureStream")) {
              resolveMediaStream(video.captureStream());
            }
            // for firefox
            else {
              audioContext = new AudioContext();
              audioMediaStream = audioContext.createMediaStreamDestination();
              sourceNode = audioContext.createMediaElementSource(videoStream);
              gainNode = audioContext.createGain();
              gainNode.gain.value = 1;
              gainNode.connect(audioContext.destination)
              sourceNode.connect(audioContext.destination);
              sourceNode.connect(audioMediaStream);
              audioStream = audioMediaStream.stream;
              drawVideo(ctx, video, audioStream);
              canvasStream = canvas.captureStream(60);
              audioStream.addTrack(canvasStream.getVideoTracks()[0]);
              resolveMediaStream(audioStream);
            }

          });
          recorder = new MediaRecorder(mediaStream, {
            mimeType: mimeCodec
          });
          console.log(recorder);

          recorder.ondataavailable = async(e) => {

            // video.pause();
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

              console.log(fragments.duration);

            }
            document.body.appendChild(fragments);
            resolveAllMedia([
              ...mediaFragments, mediaFragmentsRecording
            ]);
          }

          recorder.start();
        }



        video.oncanplay = (e) => {
          console.log(e);
        }



        video.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener("sourceopen", sourceOpen);

        async function sourceOpen(e) {


          if (MediaSource.isTypeSupported(mimeCodec)) {
            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            sourceBuffer.mode = "sequence";
            for (let {
                mediaBuffer, mediaDuration
              }
              of mediaFragments) {
              // for firefox
              if (!hasCaptureStream) {
                // ctx.clearRect(0, 0, canvas.width, canvas.height)
              };

              await new Promise(resolveUpdatedMediaSource => {

                sourceBuffer.onupdateend = e => {
                  sourceBuffer.onupdateend = null;
                  console.log(mediaDuration, mediaSource.duration, video.paused, video.ended, video.currentTime,
                              e, "media source playing", video.readyState);

                  video.play().then(resolveUpdatedMediaSource)
                }
                sourceBuffer.appendBuffer(mediaBuffer);
              })
            }
            video.onwaiting = e => {
              video.onwaiting = null;
              console.log(e);
              mediaSource.endOfStream()
            }

            video.onended = (e) => {
              video.onended = null;
              console.log(e, video.currentTime,
                mediaSource.duration);
            }

          } else {
            console.warn(mimeCodec + " not supported");
          }
        };

      })

      return recordedMedia
    };




