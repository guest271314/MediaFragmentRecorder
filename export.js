let width = screen.width;
let height = screen.height;
const canvas = globalThis.document.createElement("canvas");
canvas.width = width;
canvas.height = height;
const canvasStream = canvas.captureStream(0);
const [videoTrack] = canvasStream.getVideoTracks();
videoTrack.onunmute = e => {
  console.log(e);
}
videoTrack.onmute = e => {
  console.log(e);
}
videoTrack.onended = e => {
  console.log(e);
}
const worker = new Worker("worker.js");
// console.log(canvasStream, videoTrack);
const offscreen = new OffscreenCanvas(width, height);
const offscreenCtx = offscreen.getContext("2d");
offscreenCtx.fillStyle = "#000000";
offscreenCtx.fillRect(0, 0, width, height);
const imageBitmap = offscreen.transferToImageBitmap();
const osc = canvas.transferControlToOffscreen();
const audioContext = new AudioContext({
  sampleRate: 44100
});
const audioStream = audioContext.createMediaStreamDestination();
const [audioTrack] = audioStream.stream.getAudioTracks();
audioContext.audioWorklet.addModule("audioWorklet.js")
.then(_ => {
  const aw = new AudioWorkletNode(audioContext, "output-silence");
  aw.connect(audioStream);
  aw.connect(audioContext.destination);
  aw.port.onmessage = _ => {
    worker.postMessage(null);
  }
  worker.postMessage({
    osc, imageBitmap
  }, [osc, imageBitmap]);
  worker.onmessage = e => {
    videoTrack.requestFrame();
  };
});

audioStream.stream.addTrack(videoTrack);
const mediaStream = audioStream.stream;
export {
  mediaStream, audioContext, worker
};
