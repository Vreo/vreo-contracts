
=============================
Dia-UML to Solidity Converter
=============================

Convert a Dia UML class diagram to Solidity source.

Classes
- won't be written if part of a package
- depending on the stereotype will become
  - contracts (if there's no stereotype)
  - interfaces (if stereotype is `«interface»`)
  - libraries (if stereotype is `«library»`)
  - structs (if stereotype is `«struct»`)
  - enums (if stereotype is `«enum»`)
- structs and enums will be written into the contracts/interfaces/libraries
  when properly connected, regardless if this is valid code

Attributes
- are written as state variables regardless if their occurrence is valid code

Operations
- depending on the stereotype or name will become
  - constructors (if name is `constructor` or equals class name)
  - modifiers (if stereotype is `«modifier»`)
  - events (if stereotype is `«event»`)
- visibility will become
  - external (if part of a library)
  - public (if visibility is `public`/`+`)
  - internal (if visibility is `protected`/`#`)
  - private (if visibility is `private`/`–`)

Requirements:

- `gunzip` (likely part of `gzip`)
- `xsltproc` (maybe part of `libxml2`)

Usage::

    ./dia2sol.sh <dia-file> <sol-dir>

