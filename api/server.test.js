// Write your tests here

const request = require('supertest');
const server = require('./server'); // a router
const Users = require('./users/user-model');

const newUser = { name: 'user1', password: '123456' };

test('sanity', () => {
  expect(true).toBe(false);
});

describe('[POST] api/users', () => {
  it('resturns the newly created user', async () => {
    const res = await request(server).post('api/users').send(newUser);
    expect(res.body.username).toBe('user1');
  });
});
