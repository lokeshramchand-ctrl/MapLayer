pipeline 
{
    agent { dockerfile true }
    stages 
    {
        stage ('Build')
        {
            steps
            {
                echo 'Starting Build...'

                // Delete old and create new out folder
                sh 'rm -rf out && mkdir out -p'

            }
        }
        stage ('Test')
        {
            steps 
            {
                echo 'Running Test...'
            }
        }
    }
}
