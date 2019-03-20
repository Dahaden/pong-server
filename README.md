# Pong Server

## Setup

```bash
yarn
mkdir postgres_volume
docker pull postgres
docker run --rm   --name pg-docker -e POSTGRES_PASSWORD=docker -d -p 5432:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data  postgres
mkdir static
#Link to pong-canvas
```

Login to postgres 
`psql -h localhost -U postgres -d postgres`