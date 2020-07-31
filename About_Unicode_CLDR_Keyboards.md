# Unicode CLDR Keyboard format

There are over 5,000 different languages spoken in the world. Some are very popular, and are well supported by computer operating systems. But there are many other small languages: languages spoken in one region, and with few enough people that they have little to no support.

My own journey to learning this was when I learned about dxʷləšucid (Lushootseed), a language spoken by several of the Indian tribes in my area. There are Lushootseed keyboards and fonts for different computers -- but from a computer geek point of view, these are unsatisfying. Many pacific northwest (PNW) languages predate Unicode; the letters are described by shape and don't have a single, perfect Unicode definition. 

The Unicode people, not surprisingly, are trying to tackle this problem by updating the creating a format to describe keyboard binding

# Absolute surprises in the format

## CLDR versus LDML

Unicode [**Locale Data Markup Language**](http://www.unicode.org/reports/tr35/)

Unicode [**Common Locale Data Repository Project**](http://cldr.unicode.org/)

The LDML provides all of the format definitions for keyboards (and more). The CLDR provides the actual data. When you want to look at a bunch of defined keyboards, go to the CLDR. When you need to know how those XML files are formatted, try the LDML.

## It's all about the emitted keystrokes

As a novice, I'd expect a keyboard definition to include important keys like "control" and "shift" and "Windows". Nope, none of those are part of the definition at all. Here's a sample keyboard straight from the Unicode site:

![Sample Keyboard](ScreenShots/Sample_CLDR_Keyboard.png)

Note that it's missing (on the left side) the TAB and CAPS LOCK key, ctrl, windows/apple/etc key aqnd the alt key, and on the right side, the backspace/delete keys, enter, shift, and more alt/ctrl keys.

There are also no arrow keys, function keys, or media control keys.

## No styling

I'm a vintage computer fan, and really want to be able to create keyboards that are good matches for some of the classics. 

This wasn't a goal for the Unicode people, and no surprise, it's not possible with the CLDR format. 

### Key positioning
Keyboard keys are described in a sort of grid: the top-left key is E00 (often `), the next row is the D row, and the bottom row (with the space bar is the A row).

What you can't do is specify a key size: you can't make the spacebar extra-wide, or indent the rows.

### Key styling

There are wicked cool, beautiful keyboards with different shapes and extrusions. None of these are described in the keyboard file. Nor are there key or label color, even though many keyboards will highlight keys (for example, the number keys might be in a different color, or the extra labels on a key)

### Keyboard labels

This one is a hard to describe. When you press down on the "Q" key, what should be sent to the computer? Answer: on traditional keyboards, either a "q" or a "Q". Hardware keyboards usually print the upper-case letter on the key; some advanced keyboards (looking at you, Sinclair ZX80!) include multiple labels: Q, "NEW", and ▌, although that last one should really be enclosed in a box.


There is a weak ability to convert a "to" string into some other "to" string, but this is universal: it doesn't change based on the key or the current state.

## XML format surprises

## The \u format

The point of a standard is to be both readable and exact: a developer creating a file should know what's allowed, and a developer reading a file should know what might be in a file.

Enter the \u{41} format. XML has excellant Unicode support via both direct utf-8 support and an escape mechanism with **&#x** xxxx **;** .

That's not good enoughh for the Unicode people. They added a new \u{xxxx} escape. But wait! It also supports code in a \uXXXXX format, and also the \u{xxxx} format handles multiple characters. But only if they are seperated with spaces, and by spaces they mean seperated with all the characters in the [:Pattern_White_Spaces:](https://www.unicode.org/reports/tr18/) regex definition. 

Oh -- and it also supports characters in either \uxxxx or \uXXXXXXXX or \xxx or \x{uuuu} format, none of which are present in any of keyboards in the repository. And these are only sometimes accepted; it's not really clear which XML elements can be escaped in which formats.

### Pattern_White_Spaces details

This requires more snark than normal. In the \u{hh hh hh} format, the spaces can be other characters which are white-space-like. The LDML spec merely says this is defined in [TR18](https://www.unicode.org/reports/tr18/), but that document mentions Pattern_White_Space exactly once, in a reference to [TR44](https://www.unicode.org/reports/tr44/#Pattern_White_Space).

In **TR44**, Pattern_White_Space is defined in PropList.txt with the note that it's a B and N type, where B means it's binary and N says that it's Normative, meaning it's part of the real standard and not merely a proposal.

As a brief aside: it might be awesome if any computer language, anywhere, included a complete (ish) set of Unicode functions and tables so that I could just split a string based on "all characters which match Pattern_White_Space".

Downlowing [PropList.txt](http://www.unicode.org/Public/13.0.0/ucd/PropList.txt), we learn that Pattern_White_Space is currently these characters:

```
0009..000D    ; Pattern_White_Space # Cc   [5] <control-0009>..<control-000D>
0020          ; Pattern_White_Space # Zs       SPACE
0085          ; Pattern_White_Space # Cc       <control-0085>
200E..200F    ; Pattern_White_Space # Cf   [2] LEFT-TO-RIGHT MARK..RIGHT-TO-LEFT MARK
2028          ; Pattern_White_Space # Zl       LINE SEPARATOR
2029          ; Pattern_White_Space # Zp       PARAGRAPH SEPARATOR
```

The very first PropList.txt is from [2.0-Update](https://www.unicode.org/Public/2.0-Update/PropList-2.0.14.txt) and it doens't have Pattern_White_Space. It looks like the first PropList.txt with Pattern_White_Space is version [4.1.0](https://www.unicode.org/Public/4.1.0/ucd/PropList.txt); the  characters are:

```
0009..000D    ; Pattern_White_Space # Cc   [5] <control-0009>..<control-000D>
0020          ; Pattern_White_Space # Zs       SPACE
0085          ; Pattern_White_Space # Cc       <control-0085>
200E..200F    ; Pattern_White_Space # Cf   [2] LEFT-TO-RIGHT MARK..RIGHT-TO-LEFT MARK
2028          ; Pattern_White_Space # Zl       LINE SEPARATOR
2029          ; Pattern_White_Space # Zp       PARAGRAPH SEPARATOR
```

So it looks like Pattern_White_Space has not changed at all since it was first added. The characters that make it up are:
1. tab, LF, vertical tab, form-feed, CR
2. Space
3. next-line (U+85) from the Latin-1 supplement
4. The left-to-right and right-to-left marks
5. line seperator 
6. paragraph seperator, both from the General Punctuation

Which means that if you really want to screw with someone, add in an EM SPACE -- it looks just like a space, but isn't one of these characters.

In the first version of my code, I just use space and tab for Pattern_White_Space.


# Survey data: what's in the keyboard format

TODO: add in data about actual contents!

# Useful links

The overall [CLDR specifications](http://cldr.unicode.org/index/cldr-spec) and the [keyboard](https://www.unicode.org/reports/tr35/tr35-keyboards.html#Contents) data in particular
The [CLDR charts and data](https://www.unicode.org/cldr/charts/36/keyboards/index.html)