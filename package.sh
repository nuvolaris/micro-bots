TAG="${1:?version}"
VER="${TAG#refs/*/}"
PRE="https://github.com/nuvolaris/nuvolaris/releases/download"

#windows
wget -nc $PRE/$VER/nuv-$VER-windows-amd64.zip
cd robots
rm -f nuv nuv.exe
unzip ../nuv-$VER-windows-amd64.zip
mv LICENSE LICENSE.nuv
cp ../LICENSE.md LICENSE.microbots
zip -r ../microbots-$VER-windows-amd64.zip *
rm -f nuv nuv.exe
cd ..

# mac/linux
for OS in linux darwin
do for ARC in amd64 arm64
   do wget -nc $PRE/$VER/nuv-$VER-$OS-$ARC.tar.gz
      TGT=microbots-$VER-$OS-$ARC
      cp -Rvf robots $TGT
      tar xzvf nuv-$VER-$OS-$ARC.tar.gz -C $TGT
      mv $TGT/LICENSE $TGT/LICENSE.nuv
      cp LICENSE.md $TGT/LICENSE.microbots
      tar czvf $TGT.tar.gz $TGT 
   done
done
