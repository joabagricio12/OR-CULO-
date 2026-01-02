declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

// Isso transforma o arquivo em um módulo e evita erros de escopo global
export {};