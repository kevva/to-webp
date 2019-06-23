'use strict';
const binBuild = require('bin-build');

(async () => {
	try {
		await binBuild.url('http://downloads.webmproject.org/releases/webp/libwebp-1.0.2.tar.gz', [
			`./configure --disable-shared --prefix="${__dirname}" --bindir="${__dirname}"`,
			'make && make install'
		]);

		console.log('cwebp built successfully');
	} catch (error) {
		throw error;
	}
})();
