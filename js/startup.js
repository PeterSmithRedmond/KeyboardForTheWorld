chrome.storage.local.get(['keyboard'], function(result) {
	if (result.keyboard != undefined)
	{
        userPreferredKeyboard = JSON.parse (result.keyboard);
        drawKeyboard();
		log.innerHTML += "GOT SAVE KEYBOARD " + userPreferredKeyboard.locale + "\n<br>";
	}
  });


document.addEventListener('DOMContentLoaded', function () {
	const log = document.querySelector("#uiLog");
	log.innerHTML += "might draw keyboard...<br />";
	if (userPreferredKeyboard != null) {
		drawKeyboard();
	}
});


const showKeyboardId = document.getElementById("showKeyboardId");
if (showKeyboardId) {
	showKeyboardId.onclick = drawKeyboard;
} else {
	alert ("error no keyboard");
}

const cldrFile = document.querySelector("#cldr-file-input");
if (cldrFile != null) {
	cldrFile.addEventListener('change', (event) => {
		ReadCldrFile(event.target, ()=>{ drawKeyboard();});
	});
}



