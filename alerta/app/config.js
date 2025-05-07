require('dotenv').config();

module.exports = {
  numeroAlerta: process.env.NUMERO_ALERTA,
  ami: {
    host: process.env.AMI_HOST,
    port: parseInt(process.env.AMI_PORT, 10),
    username: process.env.AMI_USER,
    password: process.env.AMI_PASS,
  },
  jira: {
    username: process.env.JIRA_USER,
    apiToken: process.env.JIRA_TOKEN,
  },
};
