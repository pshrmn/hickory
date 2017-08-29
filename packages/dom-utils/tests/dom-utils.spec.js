import {
	ensureEncodedPathname
} from '../src';

describe('dom utils', () => {
	describe('ensureEncodedPathname', () => {
		it('returns the encoded version of pathname strings', () => {
			const pairs = [
				[ '/test', '/test' ],
				[ '/테스트', '/%ED%85%8C%EC%8A%A4%ED%8A%B8' ],
				[ '/test ing', '/test%20ing' ],
				[ '/pre%2Fencoded%2Fslashes', '/pre%2Fencoded%2Fslashes' ]
			];
			pairs.forEach(([input, output]) => {
				expect(ensureEncodedPathname(input)).toEqual(output);
			});
		});
	});
});
