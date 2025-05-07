const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const whatsappClient = require('./whatsapp');
const originateCall = require('./asterisk');
const { numeroAlerta, jira } = require('./config');
const app = express();
app.use(bodyParser.json());

require('dotenv').config();


// Variável para armazenar o valor de "issue"
let issueKey = null;

app.post('/alerta', async (req, res) => {
  const { mensagem, issue } = req.body;

  if (!mensagem || !issue) {
    return res.status(400).json({ erro: 'Campos "mensagem" e "issue" são obrigatórios.' });
  }

  try {
    // Armazenar o valor de "issue"
    issueKey = issue;

    const numero = numeroAlerta.replace(/\D/g, '');

    await whatsappClient.sendMessage(`${numero}@c.us`, mensagem);
    console.log(`📩 WhatsApp enviado para ${numero}`);

    originateCall(numero);

    res.status(200).json({ status: 'Mensagem e chamada enviadas com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao enviar:', error);
    res.status(500).json({ erro: 'Erro ao enviar mensagem ou originar chamada.' });
  }
});

app.post('/jira', async (req, res) => {
  const { status } = req.body;

  if (status !== 1) {
    return res.status(400).json({ erro: 'Status inválido. Apenas o valor 1 é aceito.' });
  }

  if (!issueKey) {
    return res.status(400).json({ erro: 'Nenhum chamado iniciado. Utilize o endpoint "/alerta" primeiro.' });
  }

  try {
    const response = await axios.post(
      `https://support-sippulse.atlassian.net/rest/api/3/issue/${issueKey}/transitions`,
      {
        transition: {
          id: '11',
        },
        update: {
          comment: [
            {
              add: {
                body: {
                  type: 'doc',
                  version: 1,
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: process.env.JIRA_ATENDIMENTO_MSG || 'Olá, o atendimento foi iniciado.',
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${jira.username}:${jira.apiToken}`).toString('base64')}`,
        },
      }
    );

    if (response.status === 204) {
      res.status(200).json({ status: 'Status do chamado atualizado para "Em Atendimento".' });
    } else {
      res.status(500).json({ erro: 'Falha ao atualizar o status do chamado.' });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar o status do chamado:', error);
    res.status(500).json({ erro: 'Erro ao comunicar com a API do Jira.' });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

