path=$(pwd)
src=$(realpath $1)
cd ~/dev/DistanceMapGenerator
./distancemap $src /tmp/distance.png
./gradient /tmp/distance.png /tmp/gradient
convert /tmp/gradient_dx.png /tmp/gradient_dy.png /tmp/smooth.png -combine ${src/.png/}_grad.png
