function GetPluginSettings()
{
	return {
		"name":			"JSON++",
		"id":			"JSON_plus_plus",
		"version":		"1.12",
		"description":	"A JSON++ mod for Construct 2",
		"author":		"PlayLive",
		"help url":		"https://github.com/starterbeeee/JSON-Plus-Extended/",
		"category":		"Addon",
		"type":			"object",
		"rotatable":	false,
		"flags":		0
	};
};

////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different JSON requests.", "\"\"");
AddCondition(0,	cf_trigger, "On completed", "JSON", "On <b>{0}</b> completed", "Triggered when the loading completes successfully.", "OnComplete");

AddCondition(1,	cf_trigger, "On any completed", "JSON", "On <b>ANY</b> completed", "Triggered when the loading completes successfully.", "OnAnyComplete");

AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different JSON requests.", "\"\"");
AddCondition(2,	cf_trigger, "On error", "JSON", "On <b>{0}</b> error", "Triggered when an JSON request fails.", "OnError");

AddCondition(3,	cf_trigger, "On any error", "JSON", "On <b>ANY</b> error", "Triggered when an JSON request fails.", "OnAnyError");

AddCondition(4, cf_none, "Is empty", "JSON", "Is empty", "JSON is empty", "IsEmpty");
AddCondition(5, cf_none, "Is loading", "JSON", "Is loading", "JSON is loading", "IsLoading");

AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different JSON requests.", "\"\"");
AddCondition(6,	cf_trigger, "On timeout", "JSON", "On <b>{0}</b> timeout", "Triggered when an JSON request timeout expires.", "OnTimeout");

AddCondition(7,	cf_trigger, "On any timeout", "JSON", "On <b>ANY</b> timeout", "Triggered when an JSON request timeout expires.", "OnAnyTimeout");
////////////////////////////////////////
// Actions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different JSON requests.", "\"\"");
AddStringParam("URL", "The URL to request.  Note: most browsers prevent cross-domain requests.", "\"http://\"");
AddStringParam("POST", "Send using POST.  *empty to use GET.", "\"\"");
AddAction(0, 0, "Load JSON", "Connect", "Load JSON(<i>{0}</i>)", "Load a JSON-File.", "LoadJSON");

AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different JSON requests.", "\"\"");
AddStringParam("JSON", "Set JSON value.", "\"\"");
AddAction(1, 0, "Set JSON", "Local", "Set JSON(<i>{0}</i>)", "Set JSON value.", "SetJSON");

AddAction(2, 0, "Clear JSON", "Local", "Clear JSON", "Clear all values inside the JSON.", "Clear");

AddStringParam("Header", "The HTTP header name to set on the request.");
AddStringParam("Value", "A string of the value to set the header to.");
AddAction(3, 0, "Set request header", "Connect", "Set request header <i>{0}</i> to <i>{1}</i>", "Set a HTTP header on the next request that is made.", "SetHeader");

AddAnyTypeParam("Value", "Set key value with string, number or object. (\"string\" | 999 | \"[]\" | \"{}\" | \"{\"\"object\"\": true}\")", "\"\"");
AddVariadicParams("Key Path", "Key path.", "\"\"");
AddAction(4, 0, "Set value", "Key", "Set the value <b>{0}</b> on the path (<i>{...}</i>)", "Set key value with string, number or object. (\"string\" | 999 | \"[]\" | \"{}\" | \"{\"\"object\"\": true}\")", "KeySet");

AddAnyTypeParam("Value", "Add key value. (string or number)", "\"\"");
AddVariadicParams("Key Path", "Key path.", "\"\"");
AddAction(5, 0, "Add value", "Key", "Add the value <b>{0}</b> to the path (<b>{...}</b>)", "Add key value. (string or number)", "KeyAdd");

AddNumberParam("Value", "Subtract key value. (string or number)", "\"\"");
AddVariadicParams("Key Path", "Key path.", "\"\"");
AddAction(6, 0, "Subtract value", "Key", "Subtract the value <b>{0}</b> from the path (<b>{...}</b>)", "Subtract key value. (string or number)", "KeySub");

AddVariadicParams("Key Path", "Key path.", "\"\"");
AddAction(7, 0, "Delete key", "Key", "Delete key path (<b>{...}</b>)", "Delete key path.", "KeyDel");

AddNumberParam("Timer", "The number in seconds until the timeout. 0 to default.", "0");
AddAction(8, 0, "Set timeout", "Connect", "<b>{0}</b> seconds timeout", "JSON request timeout expires.", "SetTimeout");

AddAction(9, 0, "Abort", "Connect", "Abort", "Abort JSON loading.", "Abort");

AddAction(10, 0, "Load last connection", "Connect", "Load last connection", "Load a JSON-File using the last connection made.", "LoadLast");
////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get tag", "JSON", "GetTag", "Get the last tag name.");
AddExpression(1, ef_return_string, "Get error", "JSON", "GetError", "Get the error message.");
AddExpression(2, ef_return_any | ef_variadic_parameters, "Get value", "JSON", "GetValue", "Get value.");
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get size", "JSON", "GetSize", "How many values are in use.");
AddExpression(4, ef_return_string | ef_variadic_parameters, "Get key name", "JSON", "GetKeyName", "Get key name via position.");
AddExpression(5, ef_return_number | ef_variadic_parameters, "Get index", "JSON", "GetIndexOf", "Get index.");
AddExpression(6, ef_return_string | ef_variadic_parameters, "Get typeof", "JSON", "GetTypeof", "Get typeof (string, number, object, null, ...).");
AddExpression(7, ef_return_number, "Get percentage", "JSON download", "DocumentPercent", "Get the loading percentage.");
AddExpression(8, ef_return_number, "Get loaded", "JSON download", "DocumentLoaded", "Get current file loaded.");
AddExpression(9, ef_return_number, "Get total size", "JSON download", "DocumentTotalSize", "Get the total file size.");
AddExpression(10, ef_return_string, "Get URL", "JSON", "URL", "Get the last URL.");
AddExpression(11, ef_return_number, "Get length", "JSON download", "DocumentLength", "Get the length of the current json.");
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
var property_list = [];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}