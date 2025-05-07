const net = require('net');
const { ami } = require('./config');

function originateCall(numero) {
  const clientAMI = new net.Socket();

  clientAMI.connect(ami.port, ami.host, () => {
    console.log('📞 Conectado ao Asterisk AMI');

    clientAMI.write(`Action: Login\r\nUsername: ${ami.username}\r\nSecret: ${ami.password}\r\nEvents: off\r\n\r\n`);

    setTimeout(() => {
      const originateCommand =
        `Action: Originate\r\n` +
        `Channel: SIP/${numero}@8562\r\n` +
        `Context: discador\r\n` +
        `Exten: ${numero}\r\n` +
        `Priority: 1\r\n` +
        `Callerid: "Alerta" <1000>\r\n` +
        `Timeout: 30000\r\n` +
        `Async: true\r\n\r\n`;

      clientAMI.write(originateCommand);
      console.log(`📞 Chamada originada para ${numero}`);
    }, 300);
  });

  clientAMI.on('data', (data) => {
    console.log('📞 AMI Resposta:', data.toString());
  });

  clientAMI.on('error', (err) => {
    console.error('❌ Erro na conexão AMI:', err);
  });

  clientAMI.on('close', () => {
    console.log('📞 Conexão com AMI encerrada');
  });
}

module.exports = originateCall;

