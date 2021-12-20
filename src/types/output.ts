/**
 * A type to describe docker-compose.yml files
 */
export interface DockerCompose {
  version: '3'
  services: Record<
    string,
    {
      image: string
      volumes: {
        type: string
        source: string
        target: string
      }[]
      environment?: Record<string, string>
      ports?: string[]
    }
  >
}

/**
 * A type to describe config.yml files
 */
export interface OutputConfig {
  stages: {
    name: string
    host: string
    port: number
  }[];

  links: {
    source: {
      stage: string;
      field: string;
    }
    target: {
      stage: string;
      field: string;
    }
  }[]
}