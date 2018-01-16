/*
 * partly copied from opj_decompress_fuzzer
 *
 * The copyright in this software is being made available under the 2-clauses
 * BSD License, included below. This software may be subject to other third
 * party and contributor rights, including patent rights, and no such rights
 * are granted under this license.
 *
 * Copyright (c) 2017, IntoPix SA <contact@intopix.com>
 * All rights reserved.
 */

#include <stddef.h>
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <limits.h>
#include <math.h>

#include "openjpeg.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    const uint8_t* data;
    size_t         pos;
    size_t         len;
} MemFile;

static void error(const char *msg, void *d)
{
    fprintf(stderr, "%s\n", msg);
}

static void warn(const char *msg, void *d)
{
    fprintf(stdout, "%s\n", msg);
}

static void info(const char *msg, void *d)
{
    fprintf(stdout, "%s\n", msg);
}

static OPJ_SIZE_T read(void* buf, OPJ_SIZE_T bytes,
                               void *data)
{
    MemFile* file = (MemFile*)data;
    if (file->pos >= file->len) {
        return -1;
    }
    if (file->pos + bytes >= file->len) {
        size_t nToRead = file->len - file->pos;
        memcpy(buf, file->data + file->pos, nToRead);
        file->pos = file->len;
        return nToRead;
    }
    if (bytes == 0) {
        return -1;
    }
    memcpy(buf, file->data + file->pos, bytes);
    file->pos += bytes;
    return bytes;
}

static OPJ_BOOL seek(OPJ_OFF_T bytes, void *data)
{
    MemFile* file = (MemFile*)data;
    file->pos = bytes;
    return OPJ_TRUE;
}

static OPJ_OFF_T skip(OPJ_OFF_T bytes, void *data)
{
    MemFile* file = (MemFile*)data;
    file->pos += bytes;
    return bytes;
}

OPJ_INT16 * decode(const uint8_t *buf, OPJ_SIZE_T len, OPJ_SIZE_T *datasize)
{
    opj_codec_t* codec = NULL;
    codec = opj_create_decompress(OPJ_CODEC_J2K);

    opj_set_info_handler(codec, info, NULL);
    opj_set_warning_handler(codec, warn, NULL);
    opj_set_error_handler(codec, error, NULL);

    opj_dparameters_t parameters;
    opj_set_default_decoder_parameters(&parameters);
    opj_setup_decoder(codec, &parameters);

    opj_stream_t *stream = opj_stream_default_create(OPJ_TRUE);
    MemFile file;
    file.data = buf;
    file.len = len;
    file.pos = 0;
    opj_stream_set_user_data_length(stream, len);
    opj_stream_set_read_function(stream, read);
    opj_stream_set_seek_function(stream, seek);
    opj_stream_set_skip_function(stream, skip);
    opj_stream_set_user_data(stream, &file, NULL);

    opj_image_t * image = NULL;
    if (!opj_read_header(stream, codec, &image)) {
        fprintf(stderr, "ERROR: failed to read codestream header\n");
        opj_destroy_codec(codec);
        opj_stream_destroy(stream);
        opj_image_destroy(image);
        return NULL;
    }

    // TODO: opj_set_decode_area

    if (!opj_get_decoded_tile(codec, stream, image, 0)) {
        fprintf(stderr, "ERROR: failed to decode tile\n");
        opj_destroy_codec(codec);
        opj_stream_destroy(stream);
        opj_image_destroy(image);
        return NULL;
    }

    OPJ_SIZE_T ii = image->comps[0].w * image->comps[0].h;
    *datasize = image->numcomps * ii * sizeof(OPJ_INT16);
    OPJ_INT16 *pix = NULL, *ptr = NULL;
    OPJ_SIZE_T i;
    pix = (OPJ_INT16 *)malloc(*datasize);
    ptr = pix;

    for (i = 0; i < ii; i++) {
        *(ptr++) = (OPJ_INT16)image->comps[0].data[i];
        if (image->numcomps == 3) {
            *(ptr++) = (OPJ_INT16)image->comps[1].data[i];
            *(ptr++) = (OPJ_INT16)image->comps[2].data[i];
        }
    }

    opj_end_decompress(codec, stream);
    opj_destroy_codec(codec);
    opj_stream_destroy(stream);
    opj_image_destroy(image);

    return pix;
}

#ifdef __cplusplus
}
#endif
