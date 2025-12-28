interface ServerConfig {
  apiServer: string;
}

const configurations: { [key: string]: ServerConfig } = {
  local: {
    apiServer: process.env.REACT_APP_API_SERVER_LOCAL || 'http://localhost:8080',
  },
  dev: {
    apiServer: process.env.REACT_APP_API_SERVER_DEV || 'http://localhost:8080',
  },
  prod: {
    apiServer: process.env.REACT_APP_API_SERVER_PROD || 'http://localhost:8080',
  },
};

const phase: string = process.env.REACT_APP_PHASE || 'local';
console.log('현재 환경:', phase);

export const config = configurations[phase];
