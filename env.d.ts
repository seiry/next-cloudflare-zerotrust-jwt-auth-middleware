declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG_JWT: string;
      TEAM_DOMAIN: string;
    }
  }
}

export {};
