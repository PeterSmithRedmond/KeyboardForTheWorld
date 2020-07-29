// There's a KeyboardLayout object
keyboardState = "";
nextKeyboardState = "";
userPreferredKeyboard = null; 

function drawKeyboard()
{
	const log = document.querySelector("#uiLog");
	const div = document.querySelector("#uiDiv");


	var keyboard = userPreferredKeyboard;
	// find the keymap in the keyboard that matches the state
	log.innertText += "State: " + keyboardState;
	for (map of keyboard.keyMaps)
	{
		if (map.modifiers == keyboardState)
		{
			keymap = map.keyMap;
		}
	}

	// set the size
	var prefratio = 0.5; // half as high as it is wide
	var prefw = window.innerWidth * .95;
	var prefh = window.innerHeight * .95 - 100;

	prefh = 200 * .95; //TODO: magic number

	if ((prefh / prefw) < prefratio) { prefw = prefh / prefratio; }
	else prefh = prefw * prefratio;

	var ncol = 13;
	var nrow = 6; // rows A B C D E F; A is on the bottom and F is the function keys
	var cellInfo = {
		cellw : prefw / ncol,
		cellh : prefh / nrow
	};

	div.width = prefw;
	div.height = prefh;

	// Remove all old keys!
	while (div.firstChild) 
	{
		div.removeChild(div.firstChild);
	}


	for (var key of keymap)
	{
		drawCellDiv(div, key, cellInfo);
	}


}

function isoToRow(iso)
{
	switch (iso.charAt(0))
	{
		case "G": return -1; // TODO: media keys?
		case "F": return 0; // esc + function keys
		case "E": return 1; // number `123456
		case "D": return 2; // qwerty
		case "C": return 3; // asdfg
		case "B": return 4; // zxcvb
		case "A":  return 5; // ctrl/win/alt/space
	}
}

function isoToCol(iso)
{
	var col = iso.substring(1, 3);
	if (col.charAt[0] == "0") col = iso.substring(2,3); // javascript thinks that 09 is octal 
	var retval = parseInt(col);
	return retval;
}

function getCellColor (type)
{
	var cellColor = "white";
	switch (type)
		{
			case "letter": cellColor = "#BBB"; break;
			case "number": cellColor = "#DEF"; break;
			case "punctuation": cellColor = "#FFC"; break;
			case "control": cellColor = "#DB8"; break;
		}
	return cellColor;
}

//TODO: move these global variables to some kind of state variable.
xtrawidth = 0.0; // used for, e.g. the space bar.
lastxpos = 0.0;

function drawCellDiv(div, element, cellInfo)
{
	var cell = document.createElement("div");

	var name = element.to;
	var row = isoToRow(element.iso);
	var col = isoToCol(element.iso);
	if (col == 0) {
		xtrawidth = 0.0; lastxpos = 0.0;
	} 
	var type = element.type;
	var show = element.to;
	if (element.show != undefined) show = element.show; // e.q. when to is "q" but the key should have "Q"
	var extra = element.extra;

	var margin = 2;
	var cellColor = getCellColor (type);
	var rowdata = KeyboardLayout.getLayout (element.iso);
	x = (col==0) ?  rowdata.IndentRow * cellInfo.cellw
		: (col-1+rowdata.Size00) *cellInfo.cellw
		;
	x += xtrawidth*cellInfo.cellw;
	y = row * cellInfo.cellh;

	switch (col)
	{
		case 0: cellw = rowdata.Size00 * cellInfo.cellw; break;
		default: 
			cellw = cellInfo.cellw; 
			let xw = KeyboardLayout.getWidth(element.to) - 1.0;
			if (xw > 0.0) {
				//log.innerHTML += "xw: " + xw;
				cellw += xw * cellInfo.cellw;
			}
			xtrawidth += xw; // xw is almost always 0.0. Note that if space==5.5, xw=4.5

			break;
		case 13: 
			let righty = (col+1)*cellInfo.cellw;
			x = lastxpos;
			cellw = righty - x;
			break;
	}
	cellh = cellInfo.cellh;
	lastxpos = x + cellw;

	// Figure out the right font size based on the key size
	// and also the length of the string.
	let fw = Math.min (cellw, 1*cellInfo.cellw);
	if (show.length > 2)
	{
		// make the font smaller
		let ratio = show.lenth / 3;
		fw = fw / ratio;
	}
	var font = fontSize (fw, 20); //"25px Ariel";


	cell.style.backgroundColor = cellColor;
	html = "<div style='font:" + font + "'>" + show + "</div>";
	if (extra != undefined)
	{
		html += "<div style='font:" + fontSize(cellw, 8) + "'>" + extra + "</div>";
		console.log (html);
	}
	cell.innerHTML = html;
	cell.style.position = "absolute";
	cell.style.left = (x+margin)+"px";
	cell.style.top = (y+margin)+"px";
	cell.style.width = (cellw-margin*2)+"px";
	cell.style.height = (cellh-margin*2)+"px";
	cell.style.border="1px solid black";
	cell.style.textAlign="center";
	cell.style.cursor = "pointer";
	let verb = "insert";
	switch (type)
	{
		case "control":
			verb = "control";
			break;
		case "letter":
			break;
		case "number":
			break;
		case "punctuation":
			break;
		default:
		alert (type);
	}
	cell.onclick = function() { insertText (verb, element.to)};

	var tooltip = name;
	cell.title = tooltip;

	div.appendChild (cell);
}

function insertText(insertType, value)
{
	var input = document.getElementById("uiTextInput");
	input.focus();
	switch (insertType)
	{
		case "control":
			switch (value)
			{
				case "BACKSPACE":
					input.selectionStart -= 1;
					input.selectionEnd = input.selectionStart;
					break;
				case "CAPSLOCK":
					keyboardState = keyboardState == "caps" ? "" : "caps";
					nextKeyboardState = keyboardState;
					drawKeyboard();
					break;
				case "SHIFT":
					keyboardState = keyboardState == "caps" ? "" : "caps";
					nextKeyboardState = "";
					drawKeyboard();
					break;
			}
			break;
		case "insert":
			insertAtCursor (input, value);
			if (nextKeyboardState != keyboardState)
			{
				keyboardState = nextKeyboardState;
				drawKeyboard();
			}
			break;
		default:
			alert (insertType);
			break;
	}
}

// https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html
function insertAtCursor (input, textToInsert) {
	// get current text of the input
	const value = input.value;
  
	// save selection start and end position
	const start = input.selectionStart;
	const end = input.selectionEnd;
  
	// update the value with our text inserted
	input.value = value.slice(0, start) + textToInsert + value.slice(end);
  
	// update cursor to be at the end of insertion
	input.selectionStart = input.selectionEnd = start + textToInsert.length;
  }



// cellw=40 with dsize=25 results in 25px Ariel
// cellw=20 with dsize=25 results in 12.5px Ariel
function fontSize(cellw, dsize)
{
	var fs = Math.round(dsize * cellw/40);
	return fs+"px Ariel";
}
