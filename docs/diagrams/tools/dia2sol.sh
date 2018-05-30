#!/bin/sh

#
# Dia-UML to Solidity conversion
# G. Baecker, Tecneos UG, 2018
#

if [ $# -lt 1 -o $# -gt 2 ]
then
    echo "Usage: $0 <dia-file> [<sol-dir>]"
    exit 1
fi

SCRIPT=$(readlink -f "$0")
SCRIPTDIR=$(dirname "$SCRIPT")

DIAFILE="$1"
SOLDIR="$2"
VERSION="0.4.23"

if [ "$SOLDIR" = "" ]
then
    mkdir -p "$SOLDIR"
fi

echo "$DIAFILE --> $SOLDIR/*.sol"
gunzip -c "$DIAFILE" \
    | xsltproc "$SCRIPTDIR/dia2xml.xsl" - \
    | xsltproc --stringparam directory "$SOLDIR" \
               --stringparam version "$VERSION" \
               "$SCRIPTDIR/xml2sol.xsl" -
