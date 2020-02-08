'use strict';
const path = require('path');
const cwepb = require('cwebp-bin');
const execa = require('execa');
const got = require('got');

const handleError = (error, response) => {
	console.error(error);

	response.status(500);
	response.end();
};

module.exports = (request, response) => {
	const args = ['-quiet', '-mt'];
	const {
		alphaQuality,
		autoFilter,
		filter,
		height = 0,
		lossless,
		method,
		nearLossless,
		preset,
		quality,
		sharpness,
		size,
		sns,
		url,
		width = 0
	} = request.query;

	response.setHeader('vary', 'accept');

	if (request.headers.accept && !request.headers.accept.includes('image/webp')) {
		response.status(302);
		response.setHeader('location', url);
		response.end();
		return;
	}

	if (preset) {
		args.push('-preset', preset);
	}

	if (quality) {
		args.push('-q', quality);
	}

	if (alphaQuality) {
		args.push('-alpha_q', alphaQuality);
	}

	if (method) {
		args.push('-m', method);
	}

	if (size) {
		args.push('-size', size);
	}

	if (sns) {
		args.push('-sns', sns);
	}

	if (filter) {
		args.push('-f', filter);
	}

	if (autoFilter) {
		args.push('-af');
	}

	if (sharpness) {
		args.push('-sharpness', sharpness);
	}

	if (lossless) {
		args.push('-lossless');
	}

	if (nearLossless) {
		args.push('-near_lossless', nearLossless);
	}

	if (height || width) {
		args.push('-resize', width, height);
	}

	const libPath = path.join(__dirname, '..', 'lib64');
	const imageStream = got.stream(url);
	const cwebpStream = execa(cwepb, [...args, '-o', '-', '--', '-'], {
		encoding: null,
		env: {LD_LIBRARY_PATH: `${libPath}:${process.env.LD_LIBRARY_PATH}`},
		input: imageStream
	});

	cwebpStream.stderr.setEncoding('utf8');
	cwebpStream.stderr.on('data', data => {
		if (data.includes('Could not process file')) {
			response.status(302);
			response.setHeader('location', url);
			response.end();
			return;
		}

		handleError(data, response);
	});

	cwebpStream.on('error', ({message}) => {
		handleError(message, response);
	});

	imageStream.on('error', ({message}) => {
		handleError(message, response);
	});

	response.status(200);
	response.setHeader('content-type', 'image/webp');
	response.setHeader('cache-control', 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000');

	cwebpStream.stdout.pipe(response);
};
