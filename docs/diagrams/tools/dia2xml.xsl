<?xml version="1.0" encoding="UTF-8"?>

<!--+
    | Dia-UML to Solidity conversion preprocessor
    | G. Baecker, Tecneos UG, 2018
    +-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:dia="http://www.lysator.liu.se/~alla/dia/"
    version="1.0">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="dia:diagram">
    <xsl:element name="diagram">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:layer">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="dia:object[@type='UML - LargePackage']">
    <xsl:element name="package">
      <xsl:attribute name="id">
        <xsl:value-of select="@id"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
    
  <xsl:template match="dia:object[@type='UML - Class']">
    <xsl:element name="class">
      <xsl:attribute name="id">
        <xsl:value-of select="@id"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:object[@type='UML - Generalization']">
    <xsl:element name="generalization">
      <xsl:attribute name="id">
        <xsl:value-of select="@id"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:object[@type='UML - Realizes']">
    <xsl:element name="realization">
      <xsl:attribute name="id">
        <xsl:value-of select="@id"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:object[@type='UML - Association']">
    <xsl:element name="association">
      <xsl:attribute name="id">
        <xsl:value-of select="@id"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:childnode">
    <xsl:if test="//dia:object[
        @type='UML - LargePackage' and 
        @id=current()/@parent]">
      <xsl:element name="package">
        <xsl:attribute name="ref">
          <xsl:value-of select="@parent"/>
        </xsl:attribute>
      </xsl:element>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:connections">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="dia:connection[@handle=0]">
    <xsl:attribute name="to">
      <xsl:value-of select="@to"/>
    </xsl:attribute>
  </xsl:template>
  
  <xsl:template match="dia:connection[@handle=1]">
    <xsl:attribute name="from">
      <xsl:value-of select="@to"/>
    </xsl:attribute>
  </xsl:template>
  
  <xsl:template match="dia:composite[@type='umlattribute']">
    <xsl:element name="attribute">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:composite[@type='umloperation']">
    <xsl:element name="operation">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:composite[@type='umlparameter']">
    <xsl:element name="parameter">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='attributes']">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='operations']">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='parameters']">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='stereotype']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="string-length($value)&gt;0">
      <xsl:element name="stereotype">
        <xsl:value-of select="$value"/>
      </xsl:element>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='name']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="string-length($value)&gt;0">
      <xsl:element name="name">
        <xsl:value-of select="$value"/>
      </xsl:element>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='type']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="string-length($value)&gt;0">
      <xsl:element name="type">
        <xsl:value-of select="$value"/>
      </xsl:element>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='value']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="string-length($value)&gt;0">
      <xsl:element name="value">
        <xsl:value-of select="$value"/>
      </xsl:element>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='comment']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="string-length($value)&gt;0">
      <xsl:call-template name="comment-split-lines">
        <xsl:with-param name="text" select="$value"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  
  <xsl:template name="comment-split-lines">
    <xsl:param name="text"/>
    <xsl:choose>
      <xsl:when test="contains($text,'&#xa;')">
        <xsl:variable name="line" select="substring-before($text,'&#xa;')"/>
        <xsl:if test="string-length($line)&gt;0">
          <xsl:element name="comment">
            <xsl:value-of select="$line"/>
          </xsl:element>
        </xsl:if>
        <xsl:call-template name="comment-split-lines">
          <xsl:with-param name="text" select="substring-after($text,'&#xa;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="string-length($text)&gt;0">
          <xsl:element name="comment">
            <xsl:value-of select="$text"/>
          </xsl:element>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='visibility']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:element name="visibility">
      <xsl:choose>
        <xsl:when test="$value=0">
          <xsl:text>public</xsl:text>
        </xsl:when>
        <xsl:when test="$value=1">
          <xsl:text>private</xsl:text>
        </xsl:when>
        <xsl:when test="$value=2">
          <xsl:text>protected</xsl:text>
        </xsl:when>
        <xsl:when test="$value=3">
          <xsl:text>inherited</xsl:text>
        </xsl:when>
      </xsl:choose>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='inheritance_type']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:element name="inheritance">
      <xsl:choose>
        <xsl:when test="$value=0">
          <xsl:text>abstract</xsl:text>
        </xsl:when>
        <xsl:when test="$value=1">
          <xsl:text>virtual</xsl:text>
        </xsl:when>
        <xsl:when test="$value=2">
          <xsl:text>sealed</xsl:text>
        </xsl:when>
      </xsl:choose>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='kind']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="$value&gt;0">
      <xsl:element name="direction">
        <xsl:choose>
          <xsl:when test="$value=1">
            <xsl:text>in</xsl:text>
          </xsl:when>
          <xsl:when test="$value=2">
            <xsl:text>out</xsl:text>
          </xsl:when>
          <xsl:when test="$value=3">
            <xsl:text>inout</xsl:text>
          </xsl:when>
        </xsl:choose>
      </xsl:element>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='abstract']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="$value='true'">
      <xsl:element name="abstract"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='template']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="$value='true'">
      <xsl:element name="template"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='class_scope']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="$value='true'">
      <xsl:element name="static"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:attribute[@name='query']">
    <xsl:variable name="value">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:if test="$value='true'">
      <xsl:element name="const"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="dia:string">
    <xsl:value-of select="substring(.,2,string-length()-2)"/>
  </xsl:template>
  
  <xsl:template match="dia:boolean">
    <xsl:value-of select="@val"/>
  </xsl:template>
  
  <xsl:template match="dia:enum">
    <xsl:value-of select="@val"/>
  </xsl:template>
  
  <xsl:template match="node()|@*"/>
  
</xsl:stylesheet>
