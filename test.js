import path from 'path';
import test from 'ava';
import {createServerWithHelpers} from '@now/node/dist/helpers';
import got from 'got';
import isWebp from 'is-webp';
import nock from 'nock';
import testListen from 'test-listen';
import webp from '.';

test.before(async t => {
	t.context.url = await testListen(
		createServerWithHelpers(webp, {consumeEvent: () => ({})})
	);

	nock('http://foo.bar')
		.persist()
		.get('/fixture')
		.replyWithFile(200, path.join(__dirname, 'fixture.png'));
});

test('convert png to webp', async t => {
	const {body} = await got(`${t.context.url}/http://foo.bar/fixture`, {
		encoding: null,
		headers: {
			accept: 'image/webp',
			'x-now-bridge-request-id': 1
		}
	});

	t.true(isWebp(body));
});
