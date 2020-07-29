// Hook up the functions
// Query Selector is a CSS type selector
// .class #id element (e.g., 'p' for paragraph) [attribute]

const log = document.querySelector("#uiLog");




function ReadCldrFile(fileSelect, oncomplete)
{
	let file = fileSelect.files[0];
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(evt) {
        let parser = new DOMParser();
		let tree = parser.parseFromString (evt.target.result, "text/xml");
		let result = new Object();
		log.innerHTML += "ReadClrdrFile:: " + file.name +  "<br />";
		for (let keyboardXml of tree.querySelectorAll("keyboard"))
		{
			// TODO: what happens when there are multiple keyboards (which is not legal)
			var keyboard = ParseCldrKeyboard(keyboardXml);
			userPreferredKeyboard = keyboard; // NOTE: global variable used here.
		
			let kstr = JSON.stringify(keyboard);
			chrome.storage.local.set({ "keyboard": kstr}, function() {
				if (chrome.extension.lastError) {
					log.innerHTML += "DBG:ERROR=" + chrome.extension.lastError.message +"<br/>\n";
                }				
			  });

			if (oncomplete != null) {
				oncomplete(keyboard);
			}
		}
	}
}

function ParseCldrKeyboard(keyboardXml)
{
	// Can only parse a keyboard
	if (keyboardXml.tagName != "keyboard") return;

	let keyboard = new Object();
	// attributes: locale (is required)
	keyboard.locale = keyboardXml.getAttribute("locale"); 

	// <version platform="10.4" number="1"/>
	// <names> ... <name value=".."> ... </names>
	// <settings [fallback="omit"] [transformFailure="omit"] [transformPartial="hide"]>
	// <keyMap [modifiers="{Set of Modifier Combinations}"]> example modifiers="cmd?+opt+caps?+shift"
	log.innerHTML += "ReadClrdrFile::Locale:: " + keyboard.locale + "<br />";

	// keyboard contain a version, names, settings, and a bunch of keymap elements
	keyboard.keyMaps = new Array();
	for (let keymapXml of keyboardXml.querySelectorAll("keyMap"))
	{
		let keymap = ParseCldrKeyboardKeyMap(keymapXml);
		keyboard.keyMaps.push (keymap);
	}
	return keyboard;
}

function ParseCldrKeyboardKeyMap(keymapXml)
{
	// <keyMap modifiers="caps"> ... </keyMap>
	// 
	
	let keyMap = new Object();
	keyMap.modifiers = keymapXml.hasAttribute("modifiers") ? keymapXml.getAttribute("modifiers") : "";
	log.innerHTML += "ReadClrdrFile: " + keyMap.modifiers + "<br>\n";

	keyMap.keyMap = new Array();
	for (let mapXml of keymapXml.querySelectorAll("map"))
	{
		let map = ParseCldrKeyboardKeyMapMap(mapXml);
		keyMap.keyMap.push (map);
	}
	// TODO: doesn't handle the flicks value
	// see e.g. https://www.unicode.org/reports/tr35/tr35-59/tr35-keyboards.html#Contents section 5.8.1
	return keyMap;
}

function ParseCldrKeyboardKeyMapMap(mapXml)
{
	// <map iso="B00" to="SHIFT" show="Shift" type="control" />
	// <map iso="{the iso position}" to="{the output}" [longPress="{long press keys}"] [transform="no"] />
	var map = new Object();
    map.iso = mapXml.hasAttribute("iso") ? mapXml.getAttribute("iso") : "D01";
    map.to = mapXml.hasAttribute("to") ? UnescapeXmlUnicodeU(mapXml.getAttribute("to")) : "Q";
    map.longPress = mapXml.hasAttribute("longPress") ? mapXml.getAttribute("longPress") : "";
    map.transform = mapXml.hasAttribute("transform") ? mapXml.getAttribute("transform") : "no";
    map.multitap = mapXml.hasAttribute("multitap") ? mapXml.getAttribute("multitap") : "";
    map.longPressStatus = mapXml.hasAttribute("longPress-status") ? mapXml.getAttribute("longPress-status") : "";
    map.optional = mapXml.hasAttribute("optional") ? mapXml.getAttribute("optional") : "";
    map.hint = mapXml.hasAttribute("hint") ? mapXml.getAttribute("hint") : "";

	// Things I added because otherwise the format isn't very useful
    map.show = mapXml.hasAttribute("show") ? mapXml.getAttribute("show") : map.to;
    map.type = mapXml.hasAttribute("type") ? mapXml.getAttribute("type") : "letter";
	return map;
}

// The allowed escapes according to https://www.unicode.org/reports/tr35/tr35-59/tr35.html#Lists_of_Code_Points
// (aka, section 5.3.3.1)
//
// \x{h...h}
// \u{h...h}	list of 1-6 hex digits ([0-9A-Fa-f]), separated by spaces
// \xhh	2 hex digits
// \uhhhh	Exactly 4 hex digits
// \Uhhhhhhhh	Exactly 8 hex digits
//
// Of these,
// \x isn't used in either format \x{hhh} or \xHH
// \uhhhh is never used
// \U... is never used
//
// ergo: just look for \u{hhhhh} without the weird space thing.
function UnescapeXmlUnicodeU(str)
{
	let start = 0;
	let retval = "";
	while (start < str.length)
	{
		let idx = str.indexOf("\\u{", start);
		if (idx >= 0)
		{
			if (idx > start)
			{
				retval += str.substring(start, idx);
			}
			let lastidx = str.indexOf("}", idx+3);
			if (lastidx >= 0)
			{
				// substring is start to lastidx-1 (it's an index, not a length).
				// Split by :Pattern_White_Spaces: as defined in https://www.unicode.org/reports/tr18/
				// TODO: this isn't complete. OTOH, I can't even find a single example
				// of any \u{} expression that includes any whitespace at all.
				const ws = new RegExp("[ \t]+");
				let hexlist = str.substring(idx+3,lastidx).split(ws);
				for (var i in hexlist)
				{
					let hexval = parseInt(hexlist[i], 16);
					if (isNaN(hexval))
					{
						retval += "ERR:" + hexlist[i] + ">>";
					}
					else
					{
						retval += String.fromCodePoint (hexval);
					}
				}
				start = lastidx + 1;
			}
			else // failure case: string is e.g. ABC\u{61 without the closing bracket.
			{
				start = str.length; // exit now. The output is wrong, but the input was wrong, too.
			}
		}
		else
		{
			// copy the rest of the string to retval
			retval += str.substr(start);
			start = str.length;
		}

	}
	return retval;
}
