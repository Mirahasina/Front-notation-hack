FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Port exposé pour le serveur de développement
EXPOSE 3000

# Commande pour le développement avec hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]