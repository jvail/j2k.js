var j2k = null;
var initj2k = function () {

	Module['j2k'] = (function () {

		const decode = cwrap('decode', 'number', ['number', 'number', 'number', 'number']);

		return {
			decode: function (idx, bufin) {
				var bufout = null;
				var dataPtr = _malloc(bufin.byteLength);
				var sizePtr = _malloc(4);
				writeArrayToMemory(new Uint8Array(bufin), dataPtr);
				var imagePtr = decode(idx, dataPtr, bufin.byteLength, sizePtr);
				var size = getValue(sizePtr, 'i32');
				if (imagePtr)
					bufout = HEAP16.buffer.slice(imagePtr, imagePtr + size);
				_free(dataPtr);
				_free(imagePtr);
				_free(sizePtr);
				return bufout;
			}
		};

	}());

	j2k = Module['j2k'];
	postMessage({ initialized: true });

};

self.onmessage = function (evt) {

	if (j2k) {
		if (evt.data.buf instanceof ArrayBuffer) {
			var idx = evt.data.idx;
			try {
				var buffer = j2k.decode(idx, evt.data.buf);
				if (buffer) postMessage({ idx: idx, buf: buffer } , [buffer]);
				else postMessage(null);
			} catch (err) {
				console.log(err);
				postMessage(null);
			}
		} else {
			postMessage(null);
		}
	} else {
		postMessage({ initialized: false });
	}

};


