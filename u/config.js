self.__uv$config = {
    prefix: '/go/',
    bare:'https://t.thecappuccino.site/bare/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/u/handler.js',
    bundle: '/u/bundle.js',
    config: '/u/config.js',
    sw: '/u/sw.js',
};