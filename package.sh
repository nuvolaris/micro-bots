TAG="${1:?version}"
VER="${TAG#refs/*/}"
PRE="https://github.com/nuvolaris/nuvolaris-cli/releases/download"

#windows
wget -nc $PRE/$VER/nuv-$VER-windows-amd64.zip
pushd robots
rm -f nuv nuv.exe
unzip ../nuv-$VER-windows-amd64.zip
mv LICENSE LICENSE.nuv
cp ../LICENSE.md LICENSE.microbots
zip -r ../microbots-$VER-windows-amd64.zip *

# mac/linux
for OS in linux darwin
do for ARC in amd64 arm64
   do wget -nc $PRE/$VER/nuv-$VER-$OS-$ARC.tar.gz
      pushd robots
      rm -f nuv nuv.exe
      tar xzvf ../nuv-$VER-$OS-$ARC.tar.gz
      mv LICENSE LICENSE.nuv
      cp ../LICENSE.md LICENSE.micro-bots
      tar czvf ../microbots-$VER-$OS-$ARC.tar.gz *
      popd
   done
done
