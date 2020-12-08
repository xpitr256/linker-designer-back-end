DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
INITIALDIR=$PWD
export ANCHOR_PATH=$DIR/Tools/ANCHOR
export IUPred_PATH=$DIR/Tools/iupred
export PASTA_PATH=$DIR/Tools/PASTA/pasta_exe
cd $ANCHOR_PATH
make clean
make
cd $IUPred_PATH
gcc -w iupred.c -o iupredExe
export PROSITE=$DIR/Tools/Prosite/ps_scan
cd $INITIALDIR
export HEMO="MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
