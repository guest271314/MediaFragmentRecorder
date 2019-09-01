class RecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    console.log(globalThis, options.processorOptions);
  }
  process(inputs, outputs) {
    this.port.postMessage(null);
    return true;
  }
}
registerProcessor("output-silence", RecorderProcessor);
