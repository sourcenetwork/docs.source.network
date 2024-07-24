# Getting Started

To get started with SourceHub, we need to download and initialize our local client. This section will utilize the `CLI` but equivalent functionaly is available using the programatic embedded API.

## 1. Install SourceHub
First, we will download the SourceHub binary which includes a client.
### Precompiled
You can get precompiled binaries from our Github Release page [here](https://github.com/sourcenetwork/sourcehub/releases) or using your console:
```bash
cd $HOME
wget https://github.com/sourcenetwork/sourcehub/releases/download/v0.2.0/sourcehubd
chmod +x sourcehubd
sudo mv /usr/bin
```

### From Source Code
You can download the code and compile your own binaries if you prefer. However you will need a local installation of the go toolchain at a minimum version of 1.22
```bash
cd $HOME
git clone https://github.com/sourcenetwork/sourcehub
cd sourcehub
git checkout v0.2.0
make install
export PATH=$PATH:$GOBIN
```

Next we will setup our local client wallet account.