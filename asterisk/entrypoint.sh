#!/bin/bash

# Substitui variáveis de ambiente no template
envsubst < /etc/asterisk/sip.conf.template > /etc/asterisk/sip.conf

envsubst < /etc/asterisk/rtp.conf.template > /etc/asterisk/rtp.conf


# Inicia o Asterisk
exec "$@"
