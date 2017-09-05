// recordMediaFragments.js 2017 guest271314
// https://github.com/guest271314/recordMediaFragments

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
          console.log(e, recorder);
          recorder.stop();
          // stop `MediaStreamTrack`s
          for (let ms of [audioStream, canvasStream, mediaStream]) {
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
              mediaFragmentsRecording.mediaDuration = fragments.duration;
              resolveAllMedia([
                ...mediaFragments, mediaFragmentsRecording
              ]);
            }
            fragments.src = URL.createObjectURL(mediaFragmentsRecording.mediaBlob);
            document.body.appendChild(fragments);

          }

          recorder.start();
        }

        mediaSource.addEventListener("sourceopen", sourceOpen);

        video.src = URL.createObjectURL(mediaSource);

        async function sourceOpen(e) {

          
          if (MediaSource.isTypeSupported(mimeCodec)) {
            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            for (let {
                mediaBuffer, mediaDuration
              }
              of mediaFragments) {
              // for firefox
              if (!hasCaptureStream) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
              };

              await new Promise(resolveUpdatedMediaSource => {

                video.ontimeupdate = e =>
                  console.log(video.currentTime, mediaDuration);
                console.log(sourceBuffer.appendWindowStart,
                  sourceBuffer.appendWindowEnd);
                sourceBuffer.appendWindowStart = 0;
                sourceBuffer.appendWindowEnd = mediaDuration;
               
                sourceBuffer.onupdateend = e => {
                  sourceBuffer.onupdateend = null;
                  console.log(mediaDuration, mediaSource.duration);
                  // console.log(mediaBuffer.byteLength, sourceBuffer.buffered.start(0), sourceBuffer.buffered.end(0));
                  video.currentTime = 0;
                  // chromium 60 renders expected result
                  // firefox 55 does not reach `canplay` event
                  // chromium 60: `1 false false 0`
                  // firefox 55 `1 true false 0`
                  /* */
                  console.log(video.readyState, video.paused, video.ended, video.currentTime);
                  video.oncanplay = async(e) => {
                    video.oncanplay = null;
                    console.log(e);
                    console.log("media source playing", video.readyState);
                    // firefox issue here
                    const play = await video.play();
                    video.onwaiting = e => {
                      console.log(e);
                      video.onwaiting = null;
                      video.ontimeupdate = null;
                      sourceBuffer.onupdateend = e => {
                        console.log(e);
                        // console.log(mediaBuffer.byteLength, sourceBuffer.buffered.start(0), sourceBuffer.buffered.end(0));
                        sourceBuffer.appendWindowStart = 0;
                        sourceBuffer.appendWindowEnd = Infinity;
                        resolveUpdatedMediaSource()
                      }
                      sourceBuffer.remove(0, mediaDuration);
                      console.log(mediaSource);
                    };
                  }
                }
                sourceBuffer.appendBuffer(mediaBuffer);
              })
            }

            mediaSource.endOfStream();

          } else {
            console.warn(mimeCodec + " not supported");
          }
        };

      })

      return recordedMedia
    };

    mediaFragmentRecorder(geckoUrl)
      .then(recordedMediaFragments => {
        // do stuff with recorded media fragments
        console.log(recordedMediaFragments);
        const select = document.createElement("select");
        for (let {
            mediaFileName, mediaBlob, mediaFragmentType
          }
          of Object.values(recordedMediaFragments)) {
          const option = new Option(mediaFileName, URL.createObjectURL(mediaBlob));
          select.appendChild(option);
        }
        select.onchange = () => {
          document.getElementById("fragments").src = select.value;
        }
        video.parentNode.insertBefore(select, video);
      })
      .catch(err => console.error(err));
