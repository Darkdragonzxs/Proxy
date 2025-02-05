self.__uv$config = {
    prefix: '/s/go/',
    bare:'https://bare.benrogo.net/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/s/u/handler.js',
    bundle: '/s/u/bundle.js',
    config: '/s/u/config.js',
    sw: '/s/u/sw.js',
};