'use strict';
const path = require('path');
const cwepb = require('cwebp-bin');
const execa = require('execa');
const got = require('got');

const isDev = process.env.NOW_REGION === 'dev1';
const bin = isDev ? cwepb : path.join(__dirname, 'cwebp');

const handleError = (error, response) => {
	console.error(error);

	response.status(500);
	response.setHeader('content-type', 'text/plain');
	response.send('Internal server error');
};

module.exports = (request, response) => {
	const args = ['-quiet', '-mt'];
	const url = request.url.slice(1);
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
		width = 0
	} = request.query;

	if (!request.headers.accept.includes('image/webp')) {
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

	const imageStream = got.stream(url);
	const cwebpStream = execa(bin, [...args, '-o', '-', '--', '-'], {
		encoding: null,
		input: imageStream
	});

	cwebpStream.stderr.setEncoding('utf8');
	cwebpStream.stderr.on('data', data => {
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
