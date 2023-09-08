import { test, expect } from "bun:test";
import { CORS } from '..';

test('CORS no origin', () => {
    const cors = new CORS({
        allowOrigins: []
    });
    console.log(cors.check.toString());

    expect(cors.check('localhost')).toEqual({});
})

test('CORS all origin', () => {
    const cors = new CORS();
    console.log(cors.check.toString());

    expect(cors.check('example.com')).toEqual({ 'Access-Control-Allow-Origin': '*' });
});

test('CORS one origin', () => {
    const cors = new CORS({
        allowOrigins: 'example.com',
        allowMethods: ['GET', 'POST']
    });
    console.log(cors.check.toString());

    expect(cors.check('another.com')).toEqual({
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Origin': 'example.com',
        'Vary': 'Origin'
    });
    expect(cors.check('example.com')).toEqual({
        'Access-Control-Allow-Origin': 'example.com',
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST'
    });
});

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
