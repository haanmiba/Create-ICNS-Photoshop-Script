const ERROR_MESSAGES = [
    '',
    'No open document.'
]
const ENDING_SCRIPT_STRING = 'Ending script.'

const FILE_NAMES = [
    'icon_512x512@2x.png',
    'icon_512x512.png',
    'icon_256x256@2x.png',
    'icon_256x256.png',
    'icon_128x128@2x.png',
    'icon_128x128.png',
    'icon_32x32@2x.png',
    'icon_32x32.png',
    'icon_16x16@2x.png',
    'icon_16x16.png',
];

const ICON_DIMENSIONS = [
    1024,
    512,
    512,
    256,
    256,
    128,
    64,
    32,
    32,
    16,
];

const PIXELS = "px";
const PNG_EXTENSION = ".png";


function main() {

    if (app.documents.length === 0) {
        exit(1);
    }

    changeRulerUnitsToPixels();

	var documentWidth = app.activeDocument.width;
    var documentHeight = app.activeDocument.height;

    if (documentWidth != documentHeight) {
        var userResponse = promptUserToContinue("The current document's width and height are unequal. This script may lead to some image distortion. Continue?");
        if (userResponse === 'no') {
            exit(0);
        }
    }

    if (documentWidth < 1024 && documentHeight >= 1024) {
        var userResponse = promptUserToContinue("The current document's width is below 1024px. Some pixelation might occur. Continue?");
        if (userResponse === 'no') {
            exit(0);
        }
    } else if (documentWidth >= 1024 && documentHeight < 1024) {
        var userResponse = promptUserToContinue("The current document's height is below 1024px. Some pixelation might occur. Continue?");
        if (userResponse === 'no') {
            exit(0);
        }
    } else if (documentWidth < 1024 && documentHeight < 1024) {
        var userResponse = promptUserToContinue("The current document's width and height is below 1024px x 1024px. Some pixelation might occur. Continue?");
        if (userResponse === 'no') {
            exit(0);
        }
    }

    var destinationFolderPath = app.activeDocument.path + '/' + app.activeDocument.name.split('.').slice(0, -1).join('.') + '.iconset';
    var folder = Folder(destinationFolderPath);
    if (!folder.exists) { folder.create(); }

    for (var i = 0; i < FILE_NAMES.length; i++) {
        app.activeDocument.resizeImage(UnitValue(ICON_DIMENSIONS[i], PIXELS), UnitValue(ICON_DIMENSIONS[i], PIXELS));
        savePNG(destinationFolderPath, FILE_NAMES[i]);
    }

    alert('iconutil -c icns ' + destinationFolderPath + '')
    app.system('iconutil -c icns ' + destinationFolderPath + '')
}

function changeRulerUnitsToPixels() {
	app.preferences.rulerUnits = Units.PIXELS;
}

function promptUserToContinue(text) {
    var userSelection = 'yes';
    var dialogWindow = new Window('dialog');
    dialogWindow.add('statictext', undefined, text);
    var yesButton = dialogWindow.add('button', undefined, 'Yes', {name: 'ok'});
    var noButton = dialogWindow.add('button', undefined, 'No', {name: 'cancel'});
    yesButton.onClick = function () { 
        userSelection = 'yes'; 
        dialogWindow.close();
        return 'yes';
    }
    noButton.onClick = function () {
        userSelection = 'no';
        dialogWindow.close();
        return 'no';
    }
    if (dialogWindow.show() == 1) {
        return;
    } else {
        return userSelection;
    }
}

function savePNG(outputFilePath, fileName) {

	// Create export settings.
	var opts = new ExportOptionsSaveForWeb();
	opts.format = SaveDocumentType.PNG;
	opts.PNG8 = false;
	opts.quality = 100;

	// Export PNG file and save to computer.
	var file = new File(outputFilePath + '/' + fileName + PNG_EXTENSION);
	app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, opts);	
}

function exit(exitCode) {
    var exitMessage = ERROR_MESSAGES[exitCode]
    throw new Error(exitMessage);
}

function stringIsNullOrEmpty(str) {
	return str == null || str == undefined;
}

try{
    main();
} catch (err) {
    if (stringIsNullOrEmpty(err.message)) { alert(ENDING_SCRIPT_STRING); }
    else { alert(err.message + ' ' + ENDING_SCRIPT_STRING); }
}