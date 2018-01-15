OPJ = openjpeg-2.3.0
PWD = $(shell pwd)

all: configure openjp2 asm

configure:
	cd $(OPJ) && mkdir -p build && cd ./build && \
	EMCONFIGURE_JS=1 emconfigure cmake .. \
	-DCMAKE_C_FLAGS="--memory-init-file 0" \
	-DCMAKE_BUILD_TYPE=MINSIZEREL \
	-DBUILD_THIRDPARTY=ON \
	-DCMAKE_INSTALL_PREFIX:path="install" \
	-DBUILD_SHARED_LIBS:bool=off

openjp2:
	cd $(OPJ)/build && emmake make openjp2 && make install

.PHONY: asm
asm:
	cd $(PWD) && mkdir -p asm && \
	emcc -Oz --memory-init-file 0 \
	-s EXPORTED_FUNCTIONS="['_decode']" \
	-I$(OPJ)/build/install/include/openjpeg-2.3 -I$(OPJ)/src/bin/jp2 -I$(OPJ)/src/lib/openjp2 \
	j2k.js.c $(OPJ)/build/bin/libopenjp2.a  \
	--post-js ./post.js --pre-js ./pre.js -o asm/j2k.js

.PHONY: wasm
wasm:
	cd $(PWD) && mkdir -p wasm && \
	emcc -Oz --memory-init-file 0 -s WASM=1 -s NO_EXIT_RUNTIME=1 \
	-s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_decode']" \
	-I$(OPJ)/build/install/include/openjpeg-2.3 -I$(OPJ)/src/bin/jp2 -I$(OPJ)/src/lib/openjp2 \
	j2k.js.c $(OPJ)/build/bin/libopenjp2.a  \
	--post-js ./post.js --pre-js ./pre.js -o wasm/j2k.js

.PHONY: wasmworker
wasmworker:
	cd $(PWD) && mkdir -p wasmworker && \
	emcc -Oz --memory-init-file 0 -s WASM=1 -s NO_EXIT_RUNTIME=1 \
	-s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_decode']" \
	-I$(OPJ)/build/install/include/openjpeg-2.3 -I$(OPJ)/src/bin/jp2 -I$(OPJ)/src/lib/openjp2 \
	j2k.js.c $(OPJ)/build/bin/libopenjp2.a  \
	--post-js ./post.js --pre-js ./pre.js -o wasm/j2k.js

.PHONY: html
html:
	cd $(PWD) && mkdir -p html && \
	emcc -Oz --memory-init-file 0 -s WASM=1 -s NO_EXIT_RUNTIME=1 \
	-s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_decode']" \
	-I$(OPJ)/build/install/include/openjpeg-2.3 -I$(OPJ)/src/bin/jp2 -I$(OPJ)/src/lib/openjp2 \
	j2k.js.c $(OPJ)/build/bin/libopenjp2.a  \
	--post-js ./post.js --pre-js ./pre.js -o html/j2k.html
