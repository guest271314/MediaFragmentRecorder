let osc = osctx = imageBitmap = width = height = void 0;
onmessage = ({
  data
}) => {
  if (!osc) {
    ({
      osc, imageBitmap
    } = data);
    ({width, height} = osc);
    osctx = osc.getContext("2d");
  }
  osctx.clearRect(0, 0, width, height);
  osctx.drawImage(imageBitmap, 0, 0);
  postMessage(null);
}
