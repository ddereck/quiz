image = crabes

all: pull build

pull:
        git pull origin develop

build:
        sudo docker compose up --build -d

clean:
        sudo docker compose down

shell:
        sudo docker exec -it $(image) bash

logs:
        sudo docker logs $(image) --follow

.PHONY: all pull build
