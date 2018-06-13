
=============================
Dia-UML to Solidity Converter
=============================

Convert a Dia UML class diagram to Solidity source.

Usage::

    ./dia2sol.sh <dia-file> <sol-dir>

Classes:

- won't be written if part of a package
- depending on the stereotype will become

  - contracts (if there's no stereotype)
  - interfaces (if stereotype is `«interface»`)
  - libraries (if stereotype is `«library»`)
  - structs (if stereotype is `«struct»`)
  - enums (if stereotype is `«enum»`)

- structs and enums will be written into the contracts/interfaces/libraries
  when properly connected, regardless if this is valid code

Attributes:

- are written as state variables regardless if their occurrence is valid code
- visibility will become

  - public (if visibility is `public`/`+`)
  - internal (if visibility is `protected`/`#`)
  - private (if visibility is `private`/`–`)

- cannot be set to constant

Operations:

- depending on the stereotype or name will become

  - constructors (if name is `constructor` or equals class name)
  - modifiers (if stereotype is `«modifier»`)
  - events (if stereotype is `«event»`)

- visibility will become

  - external (if part of a library)
  - public (if visibility is `public`/`+`)
  - internal (if visibility is `protected`/`#`)
  - private (if visibility is `private`/`–`)

- will be set to `view` if they're queries (`constant`)
- modifiers and super-constructors will be recognized from comment lines,
  regardless if they are not in inheritance chain

Requirements:

- `gunzip` (likely part of `gzip`)
- `xsltproc` (maybe part of `libxml2`)
