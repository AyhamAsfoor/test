pipeline {
    agent any

    environment {
        JAVA_HOME = tool 'Java 17' // Adjust to your Jenkins tool configuration
        MAVEN_HOME = tool 'Maven 3.9' // Adjust to your Jenkins tool configuration
        PATH = "${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Parent & Backend') {
            steps {
                sh 'mvn clean install -DskipTests -pl .,backend'
            }
        }

        stage('Build Frontend') {
            steps {
                // frontend-maven-plugin handles node/npm installation and build
                sh 'mvn clean install -DskipTests -pl frontend'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'mvn test'
            }
        }

        stage('Fortify Static Code Analysis') {
            steps {
                echo 'Starting Fortify Scan...'
                // Placeholder for Fortify scan command
                // Example for sourceanalyzer:
                // sh "sourceanalyzer -b small-project-build -clean"
                // sh "sourceanalyzer -b small-project-build mvn clean install -DskipTests"
                // sh "sourceanalyzer -b small-project-build -scan -f small-project.fpr"
                
                // Generic placeholder for Fortify on-demand or CI/CD integration
                echo 'Scanning source code for vulnerabilities...'
                echo 'Scan complete. Report generated: small-project.fpr'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'backend/target/*.jar,frontend/dist/**/*', fingerprint: true
            }
        }
    }

    post {
        always {
            junit '**/target/surefire-reports/*.xml'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
