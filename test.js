import {createServer} from 'http';
import path from 'path';
import test from 'ava';
import got from 'got';
import isWebp from 'is-webp';
import nock from 'nock';
import testListen from 'test-listen';
import webp from '.';

test.before(async t => {
	t.context.url = await testListen(createServer(webp));

	nock('http://foo.bar')
		.persist()
		.get('/fixture')
		.replyWithFile(200, path.join(__dirname, 'fixture.png'));
});

test('convert png to webp', async t => {
	const {body} = await got(
		`${t.context.url}/http://foo.bar/fixture`,
		{encoding: null, headers: {accept: 'image/webp'}}
	);

	t.true(isWebp(body));
});
