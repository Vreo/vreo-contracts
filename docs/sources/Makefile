# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line.
SPHINXOPTS    =
SPHINXBUILD   = sphinx-build-3.6
SPHINXPROJ    = TokenPlatform
SOURCEDIR     = .
BUILDDIR      = _build
PYTHON        = python3

.PHONY: help index pdf Makefile
.SILENT:

# Put it first so that "make" without argument is like "make help".
help:
	$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
	echo "make index  # to create references to Solidity contracts"
	echo "make pdf    # to create a PDF document (fix for latexpdf)"

index:
	$(PYTHON) create_rst.py

pdf: index
	$(SPHINXBUILD) -M latexpdf "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
	(cd "$(BUILDDIR)/latex"; pdflatex *.tex)
	mv "$(BUILDDIR)/latex"/*.pdf .

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
.DEFAULT: Makefile index
	$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
