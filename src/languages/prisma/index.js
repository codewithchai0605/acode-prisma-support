import { parser } from "./parser"
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
} from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { prismaCompletion } from "./complete"

export const prismaLanguage = LRLanguage.define({
  name: "prisma",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Block: delimitedIndent({ closing: "}", align: false }),
        BlockBody: delimitedIndent({ closing: "}", align: false }),
      }),
      foldNodeProp.add({
        Block: foldInside,
        BlockBody: foldInside,
      }),
      styleTags({
        ModelBlock: t.definitionKeyword,
        EnumBlock: t.definitionKeyword,
        ConfigBlock: t.definitionKeyword,
        BlockType: t.definitionKeyword,
        Identifier: t.name,
        FieldName: t.definition(t.propertyName),
        Type: t.typeName,
        EnumValue: t.constant(t.variableName),
        AttributeName: t.annotation,
        BlockAttrName: t.annotation,
        AttrKey: t.definition(t.propertyName),
        AttrValue: t.variableName,
        String: t.string,
        Number: t.number,
        ArrayMarker: t.squareBracket,
        LineComment: t.lineComment,
        "{": t.brace,
        "}": t.brace,
        "(": t.paren,
        ")": t.paren,
        "[": t.squareBracket,
        "]": t.squareBracket,
        "=": t.definitionOperator,
        ":": t.punctuation,
        ",": t.separator,
        ".": t.derefOperator,
        "|": t.logicOperator,
        "&": t.logicOperator,
        "@": t.annotation,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
  },
})

export function prisma() {
  return new LanguageSupport(prismaLanguage, [prismaLanguage.data.of({ autocomplete: prismaCompletion })])
}

export const prismaMode = {
  name: "prisma",
  extension: ["prisma"],
  caption: "Prisma",
  load: prisma,
}