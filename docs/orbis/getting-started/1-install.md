# Installing Orbis
You can get the `orbisd` binary from the releases page of the Orbis repo: [https://github.com/sourcenetwork/orbis-go/releases/tag/v0.2.3](https://github.com/sourcenetwork/orbis-go/releases/tag/v0.2.3).
```bash
cd $HOME
wget https://github.com/sourcenetwork/orbis-go/releases/download/v0.2.3/orbisd
chmod +x orbisd
sudo mv /usr/bin
```

### From Source
You can download the code and compile your own binaries if you prefer. However you will need a local installation of the `go` toolchain at a minimum version of 1.21
```bash
cd $HOME
git clone https://github.com/sourcenetwork/orbis-go
cd orbis-go
git checkout v0.2.3
make build
cp ./build/orbisd $GOBIN/orbisd
export PATH=$PATH:$GOBIN
```
Now you will have the `orbisd` available in your local system.

## Docker
You can either use the pre-existing docker image hosted on our GitHub, or build your own

`docker pull ghcr.io/sourcenetwork/orbis:0.2.3`

### Build Docker Image from Source
```bash
cd $HOME
git clone https://github.com/sourcenetwork/orbis-go
cd orbis-go
git checkout v0.2.3
docker build -t <name> .
```