import { test, expect } from "bun:test";
import { CORS } from '..';

test('CORS multiple origins', () => {
    const cors = new CORS({
        allowOrigins: ['example.com', 'localhost'],
        allowMethods: ['GET', 'POST']
    });
    console.log(cors.check.toString());

    expect(cors.check('another.com')).toEqual({
        'Access-Control-Allow-Origin': 'example.com',
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST'
    });
    expect(cors.check('example.com')).toEqual({
        'Access-Control-Allow-Origin': 'example.com',
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST'
    });
    expect(cors.check('localhost')).toEqual({
        'Access-Control-Allow-Origin': 'localhost',
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST'
    });
});
