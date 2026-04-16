pipeline {
    agent any
    environment {
        BUILD_ID        = 'test-debug'
        SSC_APP_NAME    = 'test1'
        SSC_APP_VERSION = '3'
    }
    tools {
        maven 'Maven3'
    }
    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                git url: 'https://github.com/AyhamAsfoor/test.git', branch: 'main'
            }
        }
        stage('Maven Build') {
            steps {
                sh 'mvn clean install -DskipTests -pl backend -am -Dmaven.compiler.source=8 -Dmaven.compiler.target=8'
            }
        }
        stage('Fortify Clean') {
            steps {
                fortifyClean buildID: "${BUILD_ID}"
            }
        }
        stage('Fortify Translate') {
            steps {
                fortifyTranslate buildID: "${BUILD_ID}",
                    projectScanType: fortifyMaven3(
                        mavenInstallationName: 'Maven3',
                        mavenOptions: '-DskipTests=true -Dfortify.includes=**/*.java,**/*.xml -Dfortify.maven.compile=true'
                    )
            }
        }
        stage('Fortify Remote Scan & Upload') {
            steps {
                fortifyRemoteScan buildID: "${BUILD_ID}",
                    uploadSSC: [
                        appName:    "${SSC_APP_NAME}",
                        appVersion: "${SSC_APP_VERSION}"
                    ]
            }
        }
    }
    post {
        failure {
            echo 'Pipeline failed.'
        }
        success {
            echo 'Pipeline succeeded.'
        }
    }
}
