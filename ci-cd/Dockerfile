FROM node:7

RUN /bin/bash -c 'git clone -b develop --recursive https://github.com/etherisc/flightDelay'

WORKDIR flightDelay

RUN /bin/bash -c 'npm install'


ENV DEBIAN_FRONTEND=noninteractive

RUN /bin/bash -c 'apt-get update && apt-get -y upgrade'

RUN /bin/bash -c 'apt-get install -y libcurl4-openssl-dev libelf-dev libdw-dev gcc-4.8 g++-4.8'

RUN /bin/bash -c 'apt-get install -y python-pip build-essential libssl-dev libffi-dev python-dev'

RUN /bin/bash -c 'pip install --upgrade --force-reinstall cffi cryptography base58'

RUN /bin/bash -c './migselect.sh'


CMD /bin/bash -c './deploy-docker.sh'
