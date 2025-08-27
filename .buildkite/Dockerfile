FROM node:22-bookworm

# Vault
RUN apt-get -y update && apt-get -y install build-essential curl 
RUN curl --fail --location --show-error --silent https://apt.releases.hashicorp.com/gpg | gpg --dearmor --output /usr/share/keyrings/hashicorp-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com bookworm main" | tee /etc/apt/sources.list.d/hashicorp.list
RUN apt-get -y update && apt-get -y install vault

# Rush
RUN npm install --global @microsoft/rush
