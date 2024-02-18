#!/bin/bash

if [[ ! -e build ]] ; then
    mkdir build
fi

# regular cards
for layerId in {1..6}; do
    label=$(xmllint --xpath "string(/*[local-name() = 'svg']/*[local-name() = 'g'][@*[local-name() = 'id'] = 'layer${layerId}']/@*[local-name() = 'label'])"  resources/chesspieces.svg)

    # exports two versions of the drawing scene
    inkscape resources/chesspieces.svg -i layer${layerId} -j -C --export-png=build/piece-${label}.scene.forhtml.png
done