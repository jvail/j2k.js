var j2k = null;
var initj2k = function () {

	Module['j2k'] = (function () {

		const decode = cwrap('decode', 'number', ['number', 'number', 'number']);

		return {
			decode: function (bufin) {
				var bufout = null;
				var dataPtr = _malloc(bufin.byteLength);
				var sizePtr = _malloc(4);
				writeArrayToMemory(new Uint8Array(bufin), dataPtr);
				var imagePtr = decode(dataPtr, bufin.byteLength, sizePtr);
				var size = getValue(sizePtr, 'i32');
				if (imagePtr)
					bufout = new Int16Array(HEAP16.buffer, imagePtr, size).slice(0).buffer;
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
		if (evt.data && evt.data instanceof ArrayBuffer) {
			var buffer = j2k.decode(evt.data);
			if (buffer) postMessage(buffer, [buffer]);
			else postMessage(null);
		} else {
			postMessage(null);
		}
	} else {
		postMessage({ initialized: false });
	}

};


