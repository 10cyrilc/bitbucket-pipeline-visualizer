import type { NodeEnvironment, GlobalConfig } from '../../types';
import type { Template } from '../types';
import { getPmCommands, getCachePath } from '../utils';

export const NodeTemplateV1: Template = {
  metadata: {
    id: 'node-docker-ssh',
    name: 'Node Docker + SSH',
    version: '1.0.0',
    description: 'Build Docker image, push to ECR, and deploy via SSH.',
  },
  generate: (environments: NodeEnvironment[], config: GlobalConfig) => {
    const pm = getPmCommands(config.packageManager);
    const cachePath = getCachePath(config.packageManager);
    const installSteps = [...pm.install];
    if (config.packageManager === 'pnpm') {
      // Insert pnpm config set store-dir before pnpm install
      installSteps.splice(1, 0, 'pnpm config set store-dir ~/.pnpm-store');
    }

    let yaml = `image: python:${config.pythonVersion || '3.13.9'}-alpine3.22

options:
  docker: true
  size: 2x

definitions:
  caches:
    ${config.packageManager}: ${config.packageManager === 'pnpm' ? '~/.pnpm-store' : cachePath}

  steps:
    - step: &quality-check
        name: 🧪 Quality Check
        image: node:${config.nodeVersion || '20'}-alpine
        caches:
          - ${config.packageManager}
        script:
${installSteps.map(cmd => `          - ${cmd}`).join('\n')}
          - ${pm.run} format:check &
          - ${pm.run} lint &
          - ${pm.run} typeCheck &
          - wait
          - ${pm.audit} || echo "⚠️ Vulnerabilities detected"

    - step: &build
        name: 🏗 Build Image
        caches:
          - docker
        script:
          - export NODE_VERSION=$(cat .nvmrc)
          - export IMAGE_TAG=$BITBUCKET_COMMIT
          - export REPO=${config.ecrRegistry}/${config.ecrRepository}

          - pip3 install --no-cache-dir awscli

          - aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${config.ecrRegistry}

          - docker build --build-arg NODE_VERSION=$NODE_VERSION -t $REPO:$IMAGE_TAG .

          - docker push $REPO:$IMAGE_TAG
`;

    environments.forEach((env) => {
      yaml += `
    - step: &deploy-${env.name.toLowerCase()}
        name: 🚀 Deploy ${env.name}
        deployment: ${env.name}
        script:
          - pipe: atlassian/ssh-run:0.8.1
            variables:
              SSH_USER: ${env.sshUser || 'root'}
              SERVER: ${env.serverIp}
              SSH_KEY: ${env.sshKey}
              COMMAND: |
                set -e

                IMAGE_TAG=\${BITBUCKET_COMMIT}
                REPO=${config.ecrRegistry}/${config.ecrRepository}

                CONTAINER=${env.containerName}
                HOST_PORT=${env.hostPort}
                CONTAINER_PORT=${env.containerPort || '5000'}
                LOG_PATH=/var/log/${env.containerName}
                NODE_ENV=${env.nodeEnv || env.name.toLowerCase()}

                TEST_PORT=$(shuf -i 20000-40000 -n 1)

                aws ecr get-login-password --region us-east-1 \\
                  | docker login --username AWS --password-stdin ${config.ecrRegistry}

                echo "Deploying \\\${REPO}:\\\${IMAGE_TAG}"

                docker pull \\\${REPO}:\\\${IMAGE_TAG}

                docker rm -f \\\${CONTAINER}-test || true

                docker run -d \\
                  --name \\\${CONTAINER}-test \\
                  -p \\\${TEST_PORT}:\\\${CONTAINER_PORT} \\
                  -e LOG_DIRECTORY=/usr/app/logs \\
                  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \\
                  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \\
                  -e AWS_SECRET_ID=$AWS_SECRET_ID \\
                  -e NODE_ENV=\\\${NODE_ENV} \\
                  \\\${REPO}:\\\${IMAGE_TAG}

                for i in {1..20}; do
                  if curl -fs http://localhost:\\\${TEST_PORT}/api/health; then
                    break
                  fi
                  sleep 2
                done

                if ! curl -fs http://localhost:\\\${TEST_PORT}/api/health; then
                  docker logs \\\${CONTAINER}-test
                  docker rm -f \\\${CONTAINER}-test
                  exit 1
                fi

                docker stop \\\${CONTAINER} || true
                docker rm \\\${CONTAINER} || true

                docker run -d \\
                  --name \\\${CONTAINER} \\
                  -p \\\${HOST_PORT}:\\\${CONTAINER_PORT} \\
                  --restart unless-stopped \\
                  -v \\\${LOG_PATH}:/usr/app/logs \\
                  -e LOG_DIRECTORY=/usr/app/logs \\
                  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \\
                  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \\
                  -e AWS_SECRET_ID=$AWS_SECRET_ID \\
                  -e NODE_ENV=\\\${NODE_ENV} \\
                  --log-driver=json-file \\
                  --log-opt max-size=10m \\
                  --log-opt max-file=3 \\
                  --security-opt=no-new-privileges:true \\
                  --read-only \\
                  --tmpfs /tmp \\
                  \\\${REPO}:\\\${IMAGE_TAG}

                docker rm -f \\\${CONTAINER}-test

                docker images \\\${REPO} -q | tail -n +2 | xargs -r docker rmi -f
`;
    });

    yaml += `
pipelines:
  pull-requests:
    "**":
      - step: *quality-check
`;

    if (environments.length > 0) {
      yaml += `
  branches:
`;
      environments.forEach((env) => {
        yaml += `    ${env.branch}:
      - step: *build
      - step: *deploy-${env.name.toLowerCase()}
`;
      });
    }

    return yaml;
  },
};
