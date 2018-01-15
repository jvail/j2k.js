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


return Module['j2k'];

}());
if (typeof module !== 'undefined') module.exports = j2k;
if (typeof define === 'function') define(j2k);
