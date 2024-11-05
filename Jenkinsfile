pipeline {
    agent any

    triggers {
        pollSCM('TZ=Asia/Kolkata\n1 0 * * *') // This will poll SCM at 00:01 AM India time
    }

    tools {
        // Define the Node.js installation with the name "20.5.0"
        nodejs 'nodejs'
    }
    environment {
        DOCKER_REGISTRY = "shlokauditor/seyo_template_${NODE_VARIANT}"
        PROJECT_NAME = 'template Microservice'
        APP_MAJOR_VERSION = "1"
        APP_MINOR_VERSION = "1"
        BUILD_VERSION = "${APP_MAJOR_VERSION}.${APP_MINOR_VERSION}.${BUILD_NUMBER}"
        KUBERNETES_NAMESPACE = 'backend'
        KUBERNETES_FILE = 'deploy_latest.yaml'
        LATEST_IMAGE_TAG = 'latest'
        SLACK_BUILD_CHANNEL="#builds"
        SLACK_RELEASE_CHANNEL="#releases"

    }

    stages {
        stage('Test') {
            tools {
                nodejs 'nodejs'
            }
            steps {
                sh 'npm install'
            }
        }

        stage('Update .env Files') {

            steps {
                withCredentials([
                        string(credentialsId: "mongo_uri", variable: 'MONGO_URI'),
                        string(credentialsId: "${NODE_VARIANT}_jwt_secret", variable: 'JWT_SECRET'),
                        string(credentialsId: "${NODE_VARIANT}_mongo_uri_testing", variable: 'MONGO_URI_TESTING'),
                ])
                {
                    script {
                        def envFileContent = """
                        NODE_ENV=$NODE_VARIANT
                        PORT=$PORT
                        MONGO_URI=${MONGO_URI}
                        MONGO_DATABASE_NAME=$MONGO_DATABASE_NAME
                        MONGO_URI_TESTING=${MONGO_URI_TESTING}
                        JWT_SECRET=$JWT_SECRET
                        JWT_EXPIRE=$JWT_EXPIRE
                        JWT_COOKIE_EXPIRE=$JWT_COOKIE_EXPIRE
                        LOG_LABEL=$LOG_LABEL
                    """.stripIndent()

                                // Write the content to the .env file
                                writeFile file: 'config/.env', text: envFileContent

                                // Display the content of the .env file
                                echo 'Contents of .env file:'
                                sh 'cat config/.env'
                            }
                        }
            }
        }

        stage('Code Analysis') {
            steps {
                withCredentials([
                    string(credentialsId: 'sonarqube_url', variable: 'SONARQUBE_URL'),
                    string(credentialsId: 'template_sonarqube_token', variable: 'SONARQUBE_TOKEN'),
                    ]) {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'sonarscan'
                        withEnv(["PATH+SONARSCANNER=${scannerHome}/bin"]) {
                            sh "${scannerHome}/bin/sonar-scanner \
                                  -Dsonar.projectKey=template-microservice \
                                  -Dsonar.sources=. \
                                  -Dsonar.host.url=$SONARQUBE_URL \
                                  -Dsonar.token=$SONARQUBE_TOKEN"
                        }
                    }
                }
                    }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 15, unit: 'MINUTES') { // Just in case something goes wrong, pipeline will be killed after a timeout
                        waitForQualityGate abortPipeline: true // Reuse taskId previously collected by withSonarQubeEnv
                    }
                }
            }
        }
        stage('Build') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_REGISTRY}:${BUILD_VERSION} ."
                }
            }
        }
        stage('Publish') {
            steps {
                script {
                    docker.withRegistry('', 'docker_hub_id') {
                        sh "docker tag ${DOCKER_REGISTRY}:${BUILD_VERSION} ${DOCKER_REGISTRY}:${BUILD_VERSION}"
                        sh "docker push ${DOCKER_REGISTRY}:${BUILD_VERSION}"
                        sh "docker tag  ${DOCKER_REGISTRY}:${BUILD_VERSION}  ${DOCKER_REGISTRY}:${LATEST_IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}:${LATEST_IMAGE_TAG}"
                    }
                }
                
                stash includes: 'changeTag.sh, deployment.yaml', name: 'deployFiles'                
            }

            post {
                success {
                    slackSend(
                        message: 'Successfully Pushed the Image',
                        channel: "${SLACK_BUILD_CHANNEL}"
                    )
                }
                failure {
                    slackSend(
                        message: 'Failed to push the Image',
                        channel: "${SLACK_BUILD_CHANNEL}"
                    )
                }
            }
        }
        stage('Clean') {
			steps{
				script {
					sh "docker rmi ${DOCKER_REGISTRY}:${BUILD_VERSION}"
				}
			}
        }
        stage('Connect to Kuberenetes') {

            agent any

            options { skipDefaultCheckout(true) }

            stages {
                    stage('Deploy') {

                        steps {

                        unstash 'deployFiles'
                    
                        sh "chmod +x changeTag.sh"
                        sh "./changeTag.sh ${DOCKER_REGISTRY} ${BUILD_VERSION}"
                    
                        withKubeConfig([credentialsId:'uat-kubeconfig-secretfile']) {
                                sh 'curl -LO "https://storage.googleapis.com/kubernetes-release/release/v1.20.5/bin/linux/amd64/kubectl"'  
                                sh 'chmod u+x ./kubectl'    
                                sh "./kubectl -n ${NODE_VARIANT} apply -f ${KUBERNETES_FILE}"
                            }
                        }
                    }       
                }
            post {
                  always {
                    jiraSendDeploymentInfo environmentId: 'dev', environmentName: 'development', environmentType:
                            'development', site: 'shlok-auditor.atlassian.net'
                }
            }
        }
    }

    post {
        success {
            slackSend(
                message: "${PROJECT_NAME} version ${BUILD_VERSION} Pipeline Success",
                channel: "${SLACK_RELEASE_CHANNEL}"
            )

        }
        failure {
            slackSend(
                message: "${PROJECT_NAME} version ${BUILD_VERSION} Pipeline failure",
                channel: "${SLACK_BUILD_CHANNEL}"
            )
        }
    }
}