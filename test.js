import path from 'path';
import test from 'ava';
import {createServerWithHelpers} from '@now/node/dist/helpers';
import got from 'got';
import isWebp from 'is-webp';
import nock from 'nock';
import testListen from 'test-listen';
import toWebp from './api';

test.before(async t => {
	t.context.url = await testListen(
		createServerWithHelpers(toWebp, {consumeEvent: () => ({})})
	);

	nock('http://foo.bar')
		.persist()
		.get('/fixture')
		.replyWithFile(200, path.join(__dirname, 'fixture.png'));
});

test('convert png to webp', async t => {
	const {body} = await got(t.context.url, {
		headers: {'x-now-bridge-request-id': 1},
		responseType: 'buffer',
		searchParams: {url: 'http://foo.bar/fixture'}
	});

	t.true(isWebp(body));
});
