// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class

cr.plugins_.JSON_plus_plus = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	
	var pluginProto = cr.plugins_.JSON_plus_plus.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.tag = "";
		this.headers = {};
		this.data = [];
		this.datalength = 0;
		this.error = "";
		this.timeout = 0;
		this.xhr = new XMLHttpRequest();
		// last load
		this.last_tag = "";
		this.last_url = "";
		this.last_post = "";
		// download
		this.download_loaded = 0;
		this.download_size = 0;
		this.download_percent = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
	};
	
	instanceProto.saveToJSON = function ()
    {
        return this.data;
    };
    
    instanceProto.loadFromJSON = function (load)
    {
        this.data = load;
    };

	instanceProto.draw = function(ctx)
	{
	};

	/////////////////////////////////////
	// Functions
	instanceProto.Construct = function (type_, args_, value_)
	{
		/////////////////////////////////////
		args_ = typeof args_ === "string" ? JSON.parse(args_) : args_;
		var i = (type_ === "name" || type_ === "size" || type_ === "sizeofjs" || type_ === "value" || type_ === "indexOf" || type_ === "typeof") ? 1 : 0;
		var str = "", loop = args_.length;
		loop -= (type_ === "name" || type_ === "indexOf" || type_ === "typeof") || (type_ === "del" && typeof args_[loop-1] === "number") ? 1 : 0;
	    /////////////////////////////////////
	    for (; i < loop; i++) {
	        if (typeof args_[i] === "string") {
	        	if (i === 0 && this.data == "") this.data = {};
	        	str += "[\""+args_[i]+"\"]";
	        } else
	        	str += "["+args_[i]+"]";
	    };
	    /////////////////////////////////////
	    var obj;
	    try {
	    	obj = eval("this.data"+str);
	    } catch(e) {
	    	var log = "~~~ERROR~~~\ntype: "+type_+"\npatch: this.data"+str;
	    	log += value_ ? "\nvalue: "+value_ : "";
	    	console.log(log);
	    };
	    /////////////////////////////////////
	    switch (type_) {
	    	case "name":
	    		return Object.keys(obj)[args_[args_.length-1]];
	    	case "size":
				if(obj == null || typeof obj == "undefined"){return 0;}
				return Object.keys(obj).length;
			case "sizeofjs":
				if(obj == null || typeof obj == "undefined"){return 0;}
				try{
					var jsoncheck = JSON.parse(JSON.stringify(obj.toString()));
					return obj.length;
				}catch(e){
					return 0;
				};
	    	case "value":
				if(obj == null){return "null";}
				switch(typeof obj){
					case "number":
						return obj;
					case "boolean":
						return obj.toString();
					default:
						try{
							var ret = JSON.stringify(obj);
							if (typeof ret != "undefined")
								return args_.length === 1 ? ret : ret.substr(1, ret.length-2);
						}catch(err){return "null";}
				};
	    	case "indexOf":
	    		if (typeof obj != "undefined") {
	    			if (typeof obj[0] != "undefined")
	    				return obj.indexOf(args_[loop]);
	    			else
	    				return Object.keys(obj).indexOf(args_[loop]);
	    		} else
	    			return -1;
	    	case "typeof":
	    		return typeof obj;
	    	/////////////////////////////////////
	    	case "set":
	    		if (value_ === "[]" || value_ === "{}" || typeof value_ === "number")
	    			eval("this.data"+str+"="+value_);
	    		else if (typeof value_ === "string") {
	    			var type = "string";
	    			try { type = eval(value_); }
	    			catch(e) {};
	    			/////////////////////////////////////
	    			if (typeof type === "object")
	    				eval("this.data"+str+"="+value_);
	    			else
	    				eval("this.data"+str+"=\""+value_+"\"");
	    		}
	    		break;
	    	case "add":
	    		var data = Number(obj);
	    		if (!isNaN(data))
	    			eval("this.data"+str+"="+(data+value_));
	    		else
	    			eval("this.data"+str+"+="+value_);
	    		break;
	    	case "sub":
	    		var data = Number(obj);
	    		if (!isNaN(data))
	    			eval("this.data"+str+"-="+value_);
	    		else {
	    			data = obj;
	    			eval("this.data"+str+"=\""+data.substring(0, data.length - value_)+"\"");
	    		}
	    		break;
	    	case "del":
	    		if (typeof args_[loop] === "number")
	    			eval("this.data"+str+".splice("+args_[loop]+", 1)");
	    		else
	    			eval("delete this.data"+str);
	    		break;
	    };
	};
	
	instanceProto.Load = function (tag_, url_, post_)
	{
		this.tag = tag_;
		var inst = this;
		var type = post_.length ? "POST" : "GET";
		//////////////////////////////////////
		// Last load
		this.last_tag = tag_;
		this.last_url = url_;
		this.last_post = post_;
		//////////////////////////////////////
		this.xhr.onprogress = function (e) {
			var size;
			if (e.lengthComputable)
				size = e.total;
			else
				size = parseInt(e.target.getResponseHeader('x-decompressed-content-length'), 10);
			//////////////////////////////////////
			inst.download_percent = e.loaded / size;
			inst.download_loaded = e.loaded;
			inst.download_size = size;
		};

		this.xhr.onload = function () {
			var application = new RegExp("application/json").test(inst.xhr.getResponseHeader("Content-Type"));
			if (inst.xhr.status === 200 && application) {
				inst.data = JSON.parse(inst.xhr.responseText);
				try{inst.datalength = inst.data.length;}finally{}
				inst.error = "";
				inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnComplete, inst);
				inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnAnyComplete, inst);
			} else {
				inst.data = [];
				inst.error = inst.xhr.responseText;
				inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnError, inst);
				inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnAnyError, inst);
			};
		};

		this.xhr.ontimeout = function () {
			inst.data = [];
			inst.error = "";
			inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnTimeout, inst);
			inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnAnyTimeout, inst);
		};

		this.xhr.onerror = function() {
			inst.data = [];
			inst.error = inst.xhr.responseText;
			inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnError, inst);
			inst.runtime.trigger(cr.plugins_.JSON_plus_plus.prototype.cnds.OnAnyError, inst);
		};
		//////////////////////////////////////
		this.xhr.open(type, url_, true);
		//////////////////////////////////////
		if (post_) {
			if (this.xhr["setRequestHeader"] && !this.headers.hasOwnProperty("Content-Type"))
				this.xhr["setRequestHeader"]("Content-Type", "application/x-www-form-urlencoded");
		};
		//////////////////////////////////////
		// Apply custom headers
		if (this.xhr["setRequestHeader"]) {
			var p;
			for (p in this.headers) {
				if (this.headers.hasOwnProperty(p)) {
					try { inst.xhr["setRequestHeader"](p, this.headers[p]); }
					catch (e) {}
				};
			};
			//////////////////////////////////////
			// Reset for next request
			this.headers = {};
		};
		//////////////////////////////////////
		this.xhr.timeout = inst.timeout;
		this.xhr.send(post_);
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnComplete = function (tag_)
	{
		return cr.equals_nocase(tag_, this.tag);
	};

	Cnds.prototype.OnAnyComplete = function ()
	{
		return true;
	};

	Cnds.prototype.OnError = function (tag_)
	{
		return cr.equals_nocase(tag_, this.tag);
	};

	Cnds.prototype.OnAnyError = function ()
	{
		return true;
	};

	Cnds.prototype.OnTimeout = function (tag_)
	{
		return cr.equals_nocase(tag_, this.tag);
	};

	Cnds.prototype.OnAnyTimeout = function ()
	{
		return true;
	};

	Cnds.prototype.IsEmpty = function ()
	{
		return this.data == "" || JSON.stringify(this.data) == "{}";
	};

	Cnds.prototype.IsLoading = function ()
	{
		return (this.xhr.readyState != 0 && this.xhr.readyState != 4);
	};

	pluginProto.cnds = new Cnds();
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.LoadJSON = function (tag_, url_, post_)
	{
		this.Load(tag_, url_, post_);
	};

	Acts.prototype.LoadLast = function ()
	{
		this.Load(this.last_tag, this.last_url, this.last_post);
	};

	Acts.prototype.SetJSON = function (tag_, str_)
	{
		this.tag = tag_;
		try {
			this.data = JSON.parse(str_);
			this.error = "";
			this.runtime.trigger(Cnds.prototype.OnComplete, this);
			this.runtime.trigger(Cnds.prototype.OnAnyComplete, this);
		} catch(e) {
			this.data = [];
			this.error = e;
			this.runtime.trigger(Cnds.prototype.OnError, this);
			this.runtime.trigger(Cnds.prototype.OnAnyError, this);
		}
	};

	Acts.prototype.Clear = function ()
	{
		this.tag = "";
		this.data = [];
		this.error = "";
		this.headers = {};
	};

	Acts.prototype.SetHeader = function (n, v)
	{
		this.headers[n] = v;
	};

	Acts.prototype.KeySet = function (value_, args_)
	{
		this.Construct("set", args_, value_);
	};

	Acts.prototype.KeyAdd = function (value_, args_)
	{
		this.Construct("add", args_, value_);
	};

	Acts.prototype.KeySub = function (value_, args_)
	{
		this.Construct("sub", args_, value_);
	};

	Acts.prototype.KeyDel = function (args_)
	{
		this.Construct("del", args_);
	};

	Acts.prototype.SetTimeout = function (value_)
	{
		this.timeout = value_ * 1000;
	};

	Acts.prototype.Abort = function ()
	{
		this.xhr.abort();
		this.tag = "";
		this.headers = {};
		this.data = [];
		this.error = "";
	};

	pluginProto.acts = new Acts();
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.GetTag = function (ret)
	{
		ret.set_string(this.tag);
	};

	Exps.prototype.GetError = function (ret)
	{
		ret.set_any(this.error);
	};
	
	Exps.prototype.GetValue = function (ret)
	{
		ret.set_any(this.Construct("value", arguments));
	};

	Exps.prototype.GetSizeOfJSONArray = function (ret)
	{
		ret.set_int(this.Construct("sizeofjs", arguments));
	};

	Exps.prototype.GetSize = function (ret)
	{
		ret.set_int(this.Construct("size", arguments));
	};

	Exps.prototype.GetKeyName = function (ret)
	{
		ret.set_string(this.Construct("name", arguments));
	};

	Exps.prototype.GetIndexOf = function (ret)
	{
		ret.set_int(this.Construct("indexOf", arguments));
	};

	Exps.prototype.GetTypeof = function (ret)
	{
		ret.set_string(this.Construct("typeof", arguments));
	};
	
	Exps.prototype.DocumentPercent = function (ret)
	{
		ret.set_float(this.download_percent);
	};

	Exps.prototype.DocumentLoaded = function (ret)
	{
		ret.set_float(this.download_loaded);
	};

	Exps.prototype.DocumentTotalSize = function (ret)
	{
		ret.set_float(this.download_size);
	};

	Exps.prototype.DocumentLength = function (ret)
	{
		if(typeof(this.datalength) === 'number'){
			ret.set_int(this.datalength);
		}else{
			ret.set_int(0);
		}
	};

	Exps.prototype.URL = function (ret)
	{
		ret.set_string(this.last_url);
	};
	
	pluginProto.exps = new Exps();

}());
