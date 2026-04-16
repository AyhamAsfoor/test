pipeline {
    agent any

    parameters {
        booleanParam(name: 'SKIP_FORTIFY_SCAN', defaultValue: false, description: 'Check this to skip the Fortify Scan stage.')
    }

    environment {
        JAVA_HOME = tool 'Java 17'
        MAVEN_HOME = tool 'Maven 3.9'
        PATH = "${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${env.PATH}"
        
        FORTIFY_BIN = "/opt/Fortify/OpenText_SAST_Fortify_25.4.0/bin/sourceanalyzer"
        
        REMOTE_IP     = "192.168.80.80"
        REMOTE_USER   = "root"
        REMOTE_PATH   = "/tmp/testing_area"
        
        FORTIFY_BUILD_ID = "test"
    }

    stages {
        stage('Preparation & Build') {
            steps {
                sh 'mvn clean install -DskipTests'
                sh "${FORTIFY_BIN} -b ${FORTIFY_BUILD_ID} -clean"
                
                withCredentials([usernamePassword(credentialsId: 'ims-deploy-server-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP} 'mkdir -p ${REMOTE_PATH}'"
                }
            }
        }

        stage('Fortify Translation') {
            steps {
                script {
                    sh "${FORTIFY_BIN} -b ${FORTIFY_BUILD_ID} 'backend/src/**/*.java'"
                    sh "${FORTIFY_BIN} -b ${FORTIFY_BUILD_ID} 'frontend/src/'"
                    sh "${FORTIFY_BIN} -b ${FORTIFY_BUILD_ID} 'frontend/index.html' || echo 'index.html not found'"
                }
            }
        }

        stage('Fortify Scan') {
            when {
                expression { return params.SKIP_FORTIFY_SCAN == false }
            }
            steps {
                sh "${FORTIFY_BIN} -b ${FORTIFY_BUILD_ID} -scan -f results.fpr"
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ims-deploy-server-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "sshpass -p '$PASS' scp -o StrictHostKeyChecking=no backend/target/*.jar ${REMOTE_USER}@${REMOTE_IP}:${REMOTE_PATH}/app.jar"
                    sh "sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP} 'nohup java -jar ${REMOTE_PATH}/app.jar > ${REMOTE_PATH}/app.log 2>&1 &'"
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'results.fpr', allowEmptyArchive: true
        }
    }
}
