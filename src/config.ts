interface ServerConfig {
  apiServer: string;
}

const configurations: { [key: string]: ServerConfig } = {
  local: {
    apiServer: 'http://localhost:8080',
  },
  dev: {
    apiServer: 'http://54.180.139.219:3000',
  },
  prod: {
    apiServer: 'http://54.180.139.219:3000',
  },
};

const phase: string = process.env.REACT_APP_PHASE || 'local';
console.log('현재 환경:', phase);

export const config = configurations[phase];
