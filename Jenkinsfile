pipeline {
    agent any

    parameters {
        booleanParam(name: 'SKIP_FORTIFY_SCAN', defaultValue: true, description: 'Check this to skip the Fortify Scan stage and only perform Translation.')
    }

    environment {
        JAVA_HOME = tool 'Java 17'
        MAVEN_HOME = tool 'Maven 3.9'
        PATH = "${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${env.PATH}"
        
        REMOTE_IP     = "192.168.80.80"
        REMOTE_USER   = "root"
        REMOTE_PATH   = "/tmp/testing_area"
        
        FORTIFY_BUILD_ID = "ticketing-system-test"
        FPR_FILE         = "results.fpr"
    }

    stages {
        stage('Preparation & Clean') {
            steps {
                sh 'mvn clean'
                sh "sourceanalyzer -b ${FORTIFY_BUILD_ID} -clean || true"
                withCredentials([usernamePassword(credentialsId: 'target-server-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP} 'mkdir -p ${REMOTE_PATH}'"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Fortify Local Translation') {
            steps {
                echo 'Starting Local Translation on 192.168.80.99...'
                sh "sourceanalyzer -b ${FORTIFY_BUILD_ID} mvn install -DskipTests"
            }
        }

        stage('Fortify Local Scan') {
            when {
                expression { return params.SKIP_FORTIFY_SCAN == false }
            }
            steps {
                echo 'Scanning translated code...'
                sh "sourceanalyzer -b ${FORTIFY_BUILD_ID} -scan -f ${FPR_FILE}"
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                echo 'Deploying to 192.168.80.80...'
                withCredentials([usernamePassword(credentialsId: 'target-server-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "sshpass -p '$PASS' scp -o StrictHostKeyChecking=no backend/target/*.jar ${REMOTE_USER}@${REMOTE_IP}:${REMOTE_PATH}/app.jar"
                    sh "sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP} 'nohup java -jar ${REMOTE_PATH}/app.jar > ${REMOTE_PATH}/app.log 2>&1 &'"
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: "${FPR_FILE}", allowEmptyArchive: true
        }
    }
}
