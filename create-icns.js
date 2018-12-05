const ERROR_MESSAGES = [
    '',
    'No open document.'
];

const ENDING_SCRIPT_STRING = 'Ending script.';

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

const MAX_PIXELS_WIDTH_HEIGHT = 1024;
const PIXELS = "px";

/*
 * Main method.
 */
function main() {
    checkIfThereIsADocumentOpen();

    changeRulerUnitsToPixels();

	var documentWidth = getActiveDocumentWidth();
    var documentHeight = getActiveDocumentHeight();

    evaluateDocumentWidthAndHeight(documentWidth, documentHeight);

    var iconsetFolderPath = createIconsetFolderPathFromActiveDocument();
    createIconsetFolder(iconsetFolderPath);
    exportIconsetPNGsToIconsetFolder(iconsetFolderPath);

    var escapedIconsetFolderPath = createEscapedIconsetFolderPath(iconsetFolderPath);
    convertIconsetFolderToICNS(escapedIconsetFolderPath);
    deleteIconsetFolder(escapedIconsetFolderPath)
}

function checkIfThereIsADocumentOpen() {
    if (noOpenDocuments()) {
        exit(1);
    }
}

function noOpenDocuments() {
    return app.documents.length === 0;   
}

function changeRulerUnitsToPixels() {
	app.preferences.rulerUnits = Units.PIXELS;
}

function getActiveDocumentWidth() {
    return app.activeDocument.width;
}

function getActiveDocumentHeight() {
    return app.activeDocument.height;
}

function evaluateDocumentWidthAndHeight(documentWidth, documentHeight) {
    if (documentWidth != documentHeight) {
        warnUserAboutUnequalWidthAndHeight();
    }

    if (documentWidth < MAX_PIXELS_WIDTH_HEIGHT && documentHeight >= MAX_PIXELS_WIDTH_HEIGHT) {
        warnUserAboutWidthBelowMaxWidth();
    } else if (documentWidth >= MAX_PIXELS_WIDTH_HEIGHT && documentHeight < MAX_PIXELS_WIDTH_HEIGHT) {
        warnUserAboutHeightBelowMaxHeight();
    } else if (documentWidth < MAX_PIXELS_WIDTH_HEIGHT && documentHeight < MAX_PIXELS_WIDTH_HEIGHT) {
        warnUserAboutWidthAndHeightBelowMaxWidth();
    }
}

function warnUserAboutUnequalWidthAndHeight() {
    const UNEQUAL_WIDTH_HEIGHT_PROMPT = "The current document's width and height are unequal. This script may lead to some image distortion. Continue?";
    warnUser(UNEQUAL_WIDTH_HEIGHT_PROMPT);    
}

function warnUserAboutWidthBelowMaxWidth() {
    const WIDTH_BELOW_MAX_WIDTH_PROMPT = "The current document's width is below " + MAX_PIXELS_WIDTH_HEIGHT + " px. Some pixelation might occur. Continue?";
    warnUser(WIDTH_BELOW_MAX_WIDTH_PROMPT);
}

function warnUserAboutHeightBelowMaxHeight() {
    const HEIGHT_BELOW_MAX_HEIGHT_PROMPT = "The current document's height is below " + MAX_PIXELS_WIDTH_HEIGHT + " px. Some pixelation might occur. Continue?";
    warnUser(HEIGHT_BELOW_MAX_HEIGHT_PROMPT);
}

function warnUserAboutWidthAndHeightBelowMaxWidth() {
    const WIDTH_AND_HEIGHT_BELOW_MAX_HEIGHT_PROMPT = "The current document's width and height is below " + MAX_PIXELS_WIDTH_HEIGHT + " px x " + MAX_PIXELS_WIDTH_HEIGHT + " px. Some pixelation might occur. Continue?"
    warnUser(WIDTH_AND_HEIGHT_BELOW_MAX_HEIGHT_PROMPT);
}

function warnUser(warning) {
    var userResponse = promptUserToContinue(warning);
    if (userResponse == 'no') {
        exit(0);
    }
}

function promptUserToContinue(prompt) {
    var userSelection = 'yes';
    var dialogWindow = new Window('dialog');
    dialogWindow.add('statictext', undefined, prompt);
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

function createIconsetFolderPathFromActiveDocument() {
    return decodeURI(app.activeDocument.path) + '/' + app.activeDocument.name.split('.').slice(0, -1).join('.') + '.iconset';
}

function createIconsetFolder(folderPath) {
    var folder = Folder(folderPath);
    if (!folder.exists) { folder.create(); }
}

function exportIconsetPNGsToIconsetFolder(iconsetFolderPath) {
    for (var i = 0; i < FILE_NAMES.length; i++) {
        app.activeDocument.resizeImage(UnitValue(ICON_DIMENSIONS[i], PIXELS), UnitValue(ICON_DIMENSIONS[i], PIXELS));
        savePNG(iconsetFolderPath, FILE_NAMES[i]);
    }
}

function savePNG(outputFilePath, fileName) {
	// Create export settings.
	var opts = new ExportOptionsSaveForWeb();
	opts.format = SaveDocumentType.PNG;
	opts.PNG8 = false;
	opts.quality = 100;

	// Export PNG file and save to computer.
	var file = new File(outputFilePath + '/' + fileName);
	app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, opts);	
}

function createEscapedIconsetFolderPath(iconsetFolderPath) {
    const SPECIAL_CHARACTERS_REGEX = /[-[\]{}()*+?.,\\^$|#\s]/g
    const FORWARD_SLASH = '\\$&'
    var escapedIconsetFolderPath = iconsetFolderPath.replace(SPECIAL_CHARACTERS_REGEX, FORWARD_SLASH);
    return escapedIconsetFolderPath
}

function convertIconsetFolderToICNS(iconsetFolderPath) {
    const SHELL_COMMAND_CREATE_ICNS_FROM_ICONSET_FOLDER = 'iconutil -c icns ';
    app.system(SHELL_COMMAND_CREATE_ICNS_FROM_ICONSET_FOLDER + iconsetFolderPath + '');
}

function deleteIconsetFolder(iconsetFolderPath) {
    const SHELL_COMMAND_DELETE_ICONSET_FOLDER = 'rm -rf ';
    app.system(SHELL_COMMAND_DELETE_ICONSET_FOLDER + iconsetFolderPath + '');
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
