# Event Notifier

## Fluxo de Funcionamento

1. **Recebimento do Evento do Jira**:  
   Quando um evento é enviado pelo Jira para a API `/alerta`, a aplicação extrai:
   - Código do chamado
   - Descrição do atendimento

2. **Notificação WhatsApp **:  
   A aplicação envia uma mensagem para o plantonista no WhatsApp com as informações do chamado.

3. **Ligação com Asterisk**:  
   A chamada é originada via Asterisk para o número do plantonista com uma mensagem de alerta.

4. **Alteração no Jira**:  
   Se o plantonista pressionar "1" na ligação:
   - Status do chamado é atualizado para "Em Atendimento"
   - Comentário sobre o atendimento é adicionado


## Baixe o repositório 
```
git clone https://github.com/gabrielpiaia/alert-call
cd event-notifier
```

## Realize a configuração do .env

```
vim asterisk/.env
vim alerta/.env
```

## Fazer o deploy e logar no whatsapp

```
docker-compose up -d && docker logs -f  alerta-agent
Escaneie o QR code para logar no WhatsApp
Pressione `Control+C` para finalizar o log
```

## Parâmetros de Configuração

### asterisk/.env
```
ASTERISK_USER=usuário_do_asterisk
ASTERISK_SECRET=senha_do_usuário
ASTERISK_DOMAIN=dominio_ou_ip_publico
ASTERISK_PORT=5049
ASTERISK_RTP_START=porta_inicial_rtp
ASTERISK_RTP_END=porta_final_rtp
ASTERISK_EXTERNIP=ip_externo
ASTERISK_LOCALNET=172.18.0.0/16
```

### alerta/.env

```
# Numero do Atendente
NUMERO_ALERTA=numero_destino
# Asterisk AMI
AMI_HOST=127.0.0.1
AMI_PORT=5038
AMI_USER=admin
AMI_PASS=t3st3123
# Jira
JIRA_USER=user@jira.com
JIRA_TOKEN=TOKEN_AIP_JIRA
JIRA_ATENDIMENTO_MSG=Olá, o plantonista recebeu a notificação...
```



#  Tecnologias e Bibliotecas Utilizadas

- **Node.js**: Ambiente de execução JavaScript server-side.
- **Express**: Framework web minimalista para roteamento e middleware HTTP.
- **body-parser**: Middleware Express para análise do corpo de requisições JSON.
- **axios**: Client HTTP Promise-based para comunicação com a API Jira.
- **whatsapp-web.js**: Biblioteca para interação programática com o WhatsApp Web.
- **net (Módulo Core Node.js)**: API para criação de sockets TCP para comunicação com o Asterisk AMI.
- **qrcode-terminal**: Biblioteca para geração de códigos QR no terminal (utilizado para autenticação WhatsApp).
- **dotenv**: Biblioteca para carregamento de variáveis de ambiente de arquivos .env.

#  Módulos e Funcionalidades

## app.js (Ponto de Entrada):
- Define as rotas da API (`/alerta` e `/jira`).
- Utiliza **body-parser** para processar requisições JSON.
- Carrega variáveis de ambiente com **dotenv**.
- Gerencia o fluxo principal das operações de alerta e integração Jira.
- Inicia o servidor Express na porta 8080.

## whatsapp.js:
- Instancia e configura o client **whatsapp-web.js** com autenticação local (**LocalAuth**).
- Implementa a lógica de conexão e autenticação via QR code.
- Exporta o client configurado para envio de mensagens.

## asterisk.js:
- Implementa a função `originateCall(numero)` para conectar-se ao Asterisk AMI via socket TCP (**net**).
- Envia comandos de Login e Originate para iniciar chamadas telefônicas.
- Gerencia eventos de resposta, erro e fechamento da conexão AMI.

## config.js:
- Carrega e exporta as configurações da aplicação, incluindo:
  - `numeroAlerta`: Número de telefone para alertas.
  - `ami`: Configurações de conexão com o Asterisk AMI (host, porta, usuário, senha).
  - `jira`: Credenciais de autenticação para a API Jira (usuário, token).

#  Endpoints da API

## POST /alerta:
### Corpo da Requisição (JSON):
```json
{
  "mensagem": "Texto da mensagem de alerta.",
  "issue": "ID ou key do chamado Jira."
}
```
### Funcionalidade
Envia a mensagem via WhatsApp para o `numeroAlerta` configurado e inicia uma chamada telefônica para o mesmo número utilizando o Asterisk. Armazena o valor de `issue` para uso posterior.

### Respostas

- **200 OK**  
  ```json
  { "status": "Mensagem e chamada enviadas com sucesso." }
  ```
- **400 Bad Request**  
  ```json
  { "erro": "Campos \"mensagem\" e \"issue\" são obrigatórios." }
  ```
- **500 Internal Server Error**  
  ```json
  { "erro": "Erro ao enviar mensagem ou originar chamada." }
  ```
  
  
## POST /jira:
### Corpo da Requisição (JSON):
```json
{
  "status": 1
}
```
### Funcionalidade
Funcionalidade: Atualiza o status do chamado Jira (identificado pela issueKey armazenada previamente) para "Em Atendimento" (transição com ID '11') e adiciona um comentário com uma mensagem padrão ou configurada.
### Respostas

- **200 OK**  
  ```json
  { "status": "Status do chamado atualizado para \"Em Atendimento\"." }
  ```
- **400 Bad Request**  
  ```json
  { "erro": "Status inválido. Apenas o valor 1 é aceito." }
  { "erro": "Nenhum chamado iniciado. Utilize o endpoint \"/alerta\" primeiro." }
  ```
- **500 Internal Server Error**  
  ```json
  { "erro": "Erro ao comunicar com a API do Jira." }
  { "erro": "Falha ao atualizar o status do chamado." }
  ```
  
#  Fluxo da Operação:

- Uma requisição POST é recebida no endpoint /alerta com a mensagem e o ID do chamado Jira.
- O número de alerta é formatado e a mensagem é enviada via WhatsApp utilizando o whatsappClient.
- Uma chamada telefônica é originada para o mesmo número através da função originateCall, conectando-se ao Asterisk AMI e enviando os comandos necessários.
- O ID do chamado Jira (issueKey) é armazenado.
- Posteriormente, uma requisição POST é recebida no endpoint /jira com o status '1'.
- A aplicação utiliza o axios para fazer uma requisição à API do Jira, atualizando o status do chamado identificado pela issueKey e adicionando um comentário.
- As respostas das requisições são enviadas ao cliente.