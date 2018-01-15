var j2k = null;
var initj2k = function () {

	Module['j2k'] = (function () {

		const decode = cwrap('decode', 'number', ['number', 'number', 'number']);

		return {
			decode: function (data) {
				var image = null;
				var dataPtr = _malloc(data.byteLength);
				var sizePtr = _malloc(4);
				writeArrayToMemory(data, dataPtr);
				var imagePtr = decode(dataPtr, data.byteLength, sizePtr);
				var size = getValue(sizePtr, 'i32');
				if (imagePtr)
					image = new Int16Array(HEAP16.buffer, imagePtr, size);
				// console.log(size, image);
				_free(dataPtr);
				_free(imagePtr);
				_free(sizePtr);
				return image;
			}
		};

	}());

	j2k = Module['j2k'];
	postMessage({ initialized: true });

};

self.onmessage = function (evt) {

	if (j2k) {
		if (evt.data && evt.data instanceof ArrayBuffer) {
			var data = j2k.decode(evt.data);
			postMessage({ data: data.buffer }, [data.buffer]);
		} else {
			postMessage({ data: null });
		}
	} else {
		postMessage({ initialized: false });
	}

};


