pipeline {
    agent any

    environment {
        JAVA_HOME = tool 'Java 17'
        MAVEN_HOME = tool 'Maven 3.9'
        PATH = "${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${env.PATH}"
        
        
        REMOTE_SERVER = "192.168.80.99"
        REMOTE_USER   = "root"
        TARGET_DIR    = "/tmp/testing_area"
        
     
        BUILD_ID = "my-test-app"
    }

    stages {
        stage('Cleanup Previous Try') {
            steps {
                sh 'mvn clean'
                sh "sourceanalyzer -b ${BUILD_ID} -clean || true"
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Local Translate (Fortify)') {
            steps {
                echo 'Building and Translating for Fortify...'
               
                sh "sourceanalyzer -b ${BUILD_ID} mvn clean install -DskipTests"
            }
        }

        stage('Fortify Remote Scan') {
            steps {
                echo 'Starting Fortify Scan...'
                
                sh "sourceanalyzer -b ${BUILD_ID} -scan -f results.fpr"
            }
        }

        stage('Deploy to Remote (Testing)') {
            steps {
                
                withCredentials([usernamePassword(credentialsId: 'your-ssh-credentials-id', passwordVariable: 'SSH_PASS', usernameVariable: 'SSH_USER')]) {
                    
                    echo 'Preparing remote directory...'
                    sh "sshpass -p '$SSH_PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_SERVER} 'mkdir -p ${TARGET_DIR}'"

                    echo 'Uploading Jar file...'
                    
                    sh "sshpass -p '$SSH_PASS' scp -o StrictHostKeyChecking=no backend/target/*.jar ${REMOTE_USER}@${REMOTE_SERVER}:${TARGET_DIR}/app.jar"
                    
                    echo 'Running Application...'
                    
                    sh "sshpass -p '$SSH_PASS' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_SERVER} 'nohup java -jar ${TARGET_DIR}/app.jar > ${TARGET_DIR}/log.txt 2>&1 &'"
                }
            }
        }
    }

    post {
        always {
            
            archiveArtifacts artifacts: 'results.fpr', allowEmptyArchive: true
            echo "To delete everything on remote later, run: ssh root@${REMOTE_SERVER} 'rm -rf ${TARGET_DIR}'"
        }
        success {
            echo 'Done! Test deployment and scan completed.'
        }
    }
}
