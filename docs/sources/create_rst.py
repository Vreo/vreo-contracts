#!/usr/bin/env python3

#
# G. Baecker, Tecneos UG, 2018
#

import os
import os.path

SOLDIR = "../../contracts"
RSTDIR = "_contracts"

def dedent(text):
    lines = text.split("\n")
    index = min(len(line) - len(line.lstrip())
                for line in lines
                if line.lstrip())
    return "\n".join(line[index:] for line in lines)

if os.path.exists(RSTDIR):
    for name in os.listdir(RSTDIR):
        path = os.path.join(RSTDIR, name)
        print("delete", path)
        os.remove(path)
else:
    print("create", RSTDIR)
    os.mkdir(RSTDIR)

with open("index.rst") as file:
    for line in file:
        chunks = line.strip().split("/")
        if len(chunks) != 2 or chunks[0] != RSTDIR:
            continue
        name = chunks[1]
        if not os.path.exists(os.path.join(SOLDIR, name + ".sol")):
            continue
        path = os.path.join(RSTDIR, name + ".rst")
        print("create", path)
        with open(path, "w") as file:
            file.write(dedent("""
                {line}
                {name}
                {line}

                .. literalinclude:: {path}
                    :linenos:
                """.format(line=("=" * len(name)),
                           name=name,
                           path=os.path.join("..", SOLDIR, name + ".sol"))))
