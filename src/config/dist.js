import base from './base';

const dist = {
  apiUrl: 'http://10.10.11.137:8080/api',
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
