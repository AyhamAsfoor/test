pipeline {
    agent any

    environment {
        JAVA_HOME = tool 'Java 17'
        MAVEN_HOME = tool 'Maven 3.9'
        PATH = "${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${env.PATH}"
        
        
        REMOTE_IP     = "192.168.80.80"
        REMOTE_USER   = "root"
        REMOTE_PATH   = "/tmp/testing_area"
        
        
        FORTIFY_BUILD_ID = "test"
        FPR_FILE         = "results.fpr"
    }

    stages {
        stage('Preparation & Clean') {
            steps {
                echo 'Cleaning up old files...'
                
                sh 'mvn clean'
                
                sh "sourceanalyzer -b ${FORTIFY_BUILD_ID} -clean || true"
                
                withCredentials([usernamePassword(credentialsId: 'target-server-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP} 'mkdir -p ${REMOTE_PATH}'"
                }
            }
        }

        stage('Fortify Local Translation') {
            steps {
                echo 'Starting Local Translation on Jenkins Server (192.168.80.99)...'
                sh "sourceanalyzer -b ${FORTIFY_BUILD_ID} mvn install -DskipTests"
            }
        }

        stage('Fortify Local Scan') {
            steps {
                echo 'Scanning translated code...'
                sh "sourceanalyzer -b ${FORTIFY_BUILD_ID} -scan -f ${FPR_FILE}"
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                echo 'Deploying to Remote Server (192.168.80.80)...'
                withCredentials([usernamePassword(credentialsId: 'target-server-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    
                    sh "sshpass -p '$PASS' scp -o StrictHostKeyChecking=no backend/target/*.jar ${REMOTE_USER}@${REMOTE_IP}:${REMOTE_PATH}/app.jar"

                    echo 'Starting the application on 192.168.80.80...'
                    sh "sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP} 'nohup java -jar ${REMOTE_PATH}/app.jar > ${REMOTE_PATH}/app.log 2>&1 &'"
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: "${FPR_FILE}", allowEmptyArchive: true
            
            echo "--- Clean Up Instructions ---"
            echo "1. To delete Fortify artifacts on Jenkins: sourceanalyzer -b ${FORTIFY_BUILD_ID} -clean"
            echo "2. To delete files on Remote Server: ssh root@${REMOTE_IP} 'rm -rf ${REMOTE_PATH}'"
        }
    }
}
