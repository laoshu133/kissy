function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/base/object.js']) {
  _$jscoverage['/base/object.js'] = {};
  _$jscoverage['/base/object.js'].lineData = [];
  _$jscoverage['/base/object.js'].lineData[6] = 0;
  _$jscoverage['/base/object.js'].lineData[7] = 0;
  _$jscoverage['/base/object.js'].lineData[8] = 0;
  _$jscoverage['/base/object.js'].lineData[9] = 0;
  _$jscoverage['/base/object.js'].lineData[23] = 0;
  _$jscoverage['/base/object.js'].lineData[24] = 0;
  _$jscoverage['/base/object.js'].lineData[28] = 0;
  _$jscoverage['/base/object.js'].lineData[29] = 0;
  _$jscoverage['/base/object.js'].lineData[49] = 0;
  _$jscoverage['/base/object.js'].lineData[59] = 0;
  _$jscoverage['/base/object.js'].lineData[60] = 0;
  _$jscoverage['/base/object.js'].lineData[64] = 0;
  _$jscoverage['/base/object.js'].lineData[66] = 0;
  _$jscoverage['/base/object.js'].lineData[70] = 0;
  _$jscoverage['/base/object.js'].lineData[71] = 0;
  _$jscoverage['/base/object.js'].lineData[72] = 0;
  _$jscoverage['/base/object.js'].lineData[73] = 0;
  _$jscoverage['/base/object.js'].lineData[74] = 0;
  _$jscoverage['/base/object.js'].lineData[75] = 0;
  _$jscoverage['/base/object.js'].lineData[76] = 0;
  _$jscoverage['/base/object.js'].lineData[81] = 0;
  _$jscoverage['/base/object.js'].lineData[82] = 0;
  _$jscoverage['/base/object.js'].lineData[84] = 0;
  _$jscoverage['/base/object.js'].lineData[85] = 0;
  _$jscoverage['/base/object.js'].lineData[89] = 0;
  _$jscoverage['/base/object.js'].lineData[90] = 0;
  _$jscoverage['/base/object.js'].lineData[93] = 0;
  _$jscoverage['/base/object.js'].lineData[99] = 0;
  _$jscoverage['/base/object.js'].lineData[102] = 0;
  _$jscoverage['/base/object.js'].lineData[108] = 0;
  _$jscoverage['/base/object.js'].lineData[111] = 0;
  _$jscoverage['/base/object.js'].lineData[117] = 0;
  _$jscoverage['/base/object.js'].lineData[130] = 0;
  _$jscoverage['/base/object.js'].lineData[135] = 0;
  _$jscoverage['/base/object.js'].lineData[136] = 0;
  _$jscoverage['/base/object.js'].lineData[137] = 0;
  _$jscoverage['/base/object.js'].lineData[138] = 0;
  _$jscoverage['/base/object.js'].lineData[139] = 0;
  _$jscoverage['/base/object.js'].lineData[142] = 0;
  _$jscoverage['/base/object.js'].lineData[149] = 0;
  _$jscoverage['/base/object.js'].lineData[150] = 0;
  _$jscoverage['/base/object.js'].lineData[154] = 0;
  _$jscoverage['/base/object.js'].lineData[155] = 0;
  _$jscoverage['/base/object.js'].lineData[158] = 0;
  _$jscoverage['/base/object.js'].lineData[163] = 0;
  _$jscoverage['/base/object.js'].lineData[164] = 0;
  _$jscoverage['/base/object.js'].lineData[167] = 0;
  _$jscoverage['/base/object.js'].lineData[168] = 0;
  _$jscoverage['/base/object.js'].lineData[189] = 0;
  _$jscoverage['/base/object.js'].lineData[190] = 0;
  _$jscoverage['/base/object.js'].lineData[193] = 0;
  _$jscoverage['/base/object.js'].lineData[398] = 0;
  _$jscoverage['/base/object.js'].lineData[400] = 0;
  _$jscoverage['/base/object.js'].lineData[403] = 0;
  _$jscoverage['/base/object.js'].lineData[404] = 0;
  _$jscoverage['/base/object.js'].lineData[405] = 0;
  _$jscoverage['/base/object.js'].lineData[406] = 0;
  _$jscoverage['/base/object.js'].lineData[408] = 0;
  _$jscoverage['/base/object.js'].lineData[409] = 0;
  _$jscoverage['/base/object.js'].lineData[410] = 0;
  _$jscoverage['/base/object.js'].lineData[413] = 0;
  _$jscoverage['/base/object.js'].lineData[415] = 0;
  _$jscoverage['/base/object.js'].lineData[421] = 0;
  _$jscoverage['/base/object.js'].lineData[422] = 0;
  _$jscoverage['/base/object.js'].lineData[423] = 0;
  _$jscoverage['/base/object.js'].lineData[424] = 0;
  _$jscoverage['/base/object.js'].lineData[425] = 0;
  _$jscoverage['/base/object.js'].lineData[428] = 0;
  _$jscoverage['/base/object.js'].lineData[431] = 0;
  _$jscoverage['/base/object.js'].lineData[434] = 0;
  _$jscoverage['/base/object.js'].lineData[435] = 0;
  _$jscoverage['/base/object.js'].lineData[436] = 0;
  _$jscoverage['/base/object.js'].lineData[440] = 0;
  _$jscoverage['/base/object.js'].lineData[441] = 0;
  _$jscoverage['/base/object.js'].lineData[445] = 0;
  _$jscoverage['/base/object.js'].lineData[446] = 0;
  _$jscoverage['/base/object.js'].lineData[449] = 0;
  _$jscoverage['/base/object.js'].lineData[451] = 0;
  _$jscoverage['/base/object.js'].lineData[452] = 0;
  _$jscoverage['/base/object.js'].lineData[453] = 0;
  _$jscoverage['/base/object.js'].lineData[456] = 0;
  _$jscoverage['/base/object.js'].lineData[459] = 0;
  _$jscoverage['/base/object.js'].lineData[463] = 0;
  _$jscoverage['/base/object.js'].lineData[467] = 0;
  _$jscoverage['/base/object.js'].lineData[468] = 0;
  _$jscoverage['/base/object.js'].lineData[471] = 0;
  _$jscoverage['/base/object.js'].lineData[474] = 0;
  _$jscoverage['/base/object.js'].lineData[478] = 0;
  _$jscoverage['/base/object.js'].lineData[482] = 0;
  _$jscoverage['/base/object.js'].lineData[483] = 0;
  _$jscoverage['/base/object.js'].lineData[486] = 0;
  _$jscoverage['/base/object.js'].lineData[489] = 0;
  _$jscoverage['/base/object.js'].lineData[493] = 0;
}
if (! _$jscoverage['/base/object.js'].functionData) {
  _$jscoverage['/base/object.js'].functionData = [];
  _$jscoverage['/base/object.js'].functionData[0] = 0;
  _$jscoverage['/base/object.js'].functionData[1] = 0;
  _$jscoverage['/base/object.js'].functionData[2] = 0;
  _$jscoverage['/base/object.js'].functionData[3] = 0;
  _$jscoverage['/base/object.js'].functionData[4] = 0;
  _$jscoverage['/base/object.js'].functionData[5] = 0;
  _$jscoverage['/base/object.js'].functionData[6] = 0;
  _$jscoverage['/base/object.js'].functionData[7] = 0;
  _$jscoverage['/base/object.js'].functionData[8] = 0;
  _$jscoverage['/base/object.js'].functionData[9] = 0;
}
if (! _$jscoverage['/base/object.js'].branchData) {
  _$jscoverage['/base/object.js'].branchData = {};
  _$jscoverage['/base/object.js'].branchData['23'] = [];
  _$jscoverage['/base/object.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['24'] = [];
  _$jscoverage['/base/object.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['28'] = [];
  _$jscoverage['/base/object.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['59'] = [];
  _$jscoverage['/base/object.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['64'] = [];
  _$jscoverage['/base/object.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['66'] = [];
  _$jscoverage['/base/object.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['70'] = [];
  _$jscoverage['/base/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['71'] = [];
  _$jscoverage['/base/object.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['74'] = [];
  _$jscoverage['/base/object.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['81'] = [];
  _$jscoverage['/base/object.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['84'] = [];
  _$jscoverage['/base/object.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['89'] = [];
  _$jscoverage['/base/object.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['93'] = [];
  _$jscoverage['/base/object.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['102'] = [];
  _$jscoverage['/base/object.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['111'] = [];
  _$jscoverage['/base/object.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'] = [];
  _$jscoverage['/base/object.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'] = [];
  _$jscoverage['/base/object.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'] = [];
  _$jscoverage['/base/object.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'] = [];
  _$jscoverage['/base/object.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'] = [];
  _$jscoverage['/base/object.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'] = [];
  _$jscoverage['/base/object.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['149'] = [];
  _$jscoverage['/base/object.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['154'] = [];
  _$jscoverage['/base/object.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['155'] = [];
  _$jscoverage['/base/object.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['193'] = [];
  _$jscoverage['/base/object.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['194'] = [];
  _$jscoverage['/base/object.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['404'] = [];
  _$jscoverage['/base/object.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['406'] = [];
  _$jscoverage['/base/object.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['409'] = [];
  _$jscoverage['/base/object.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['410'] = [];
  _$jscoverage['/base/object.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['422'] = [];
  _$jscoverage['/base/object.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['424'] = [];
  _$jscoverage['/base/object.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['440'] = [];
  _$jscoverage['/base/object.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['441'] = [];
  _$jscoverage['/base/object.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['445'] = [];
  _$jscoverage['/base/object.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['445'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['456'] = [];
  _$jscoverage['/base/object.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['467'] = [];
  _$jscoverage['/base/object.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['482'] = [];
  _$jscoverage['/base/object.js'].branchData['482'][1] = new BranchData();
}
_$jscoverage['/base/object.js'].branchData['482'][1].init(162, 17, 'e.stopPropagation');
function visit106_482_1(result) {
  _$jscoverage['/base/object.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['467'][1].init(161, 16, 'e.preventDefault');
function visit105_467_1(result) {
  _$jscoverage['/base/object.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['456'][1].init(5552, 37, 'originalEvent.timeStamp || util.now()');
function visit104_456_1(result) {
  _$jscoverage['/base/object.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['445'][2].init(5293, 26, 'self.target.nodeType === 3');
function visit103_445_2(result) {
  _$jscoverage['/base/object.js'].branchData['445'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['445'][1].init(5278, 41, 'self.target && self.target.nodeType === 3');
function visit102_445_1(result) {
  _$jscoverage['/base/object.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['441'][1].init(28, 36, 'originalEvent.srcElement || DOCUMENT');
function visit101_441_1(result) {
  _$jscoverage['/base/object.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['440'][1].init(5065, 24, '!self.target && isNative');
function visit100_440_1(result) {
  _$jscoverage['/base/object.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['424'][1].init(79, 14, 'normalizer.fix');
function visit99_424_1(result) {
  _$jscoverage['/base/object.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['422'][1].init(18, 26, 'type.match(normalizer.reg)');
function visit98_422_1(result) {
  _$jscoverage['/base/object.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['410'][1].init(35, 35, 'originalEvent.returnValue === FALSE');
function visit97_410_1(result) {
  _$jscoverage['/base/object.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['409'][1].init(4152, 30, '\'returnValue\' in originalEvent');
function visit96_409_1(result) {
  _$jscoverage['/base/object.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['406'][1].init(3933, 36, '\'getPreventDefault\' in originalEvent');
function visit95_406_1(result) {
  _$jscoverage['/base/object.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['404'][1].init(3786, 35, '\'defaultPrevented\' in originalEvent');
function visit94_404_1(result) {
  _$jscoverage['/base/object.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['194'][1].init(69, 47, 'typeof originalEvent.cancelBubble === \'boolean\'');
function visit93_194_1(result) {
  _$jscoverage['/base/object.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['193'][2].init(94, 51, 'typeof originalEvent.stopPropagation === \'function\'');
function visit92_193_2(result) {
  _$jscoverage['/base/object.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['193'][1].init(94, 118, '(typeof originalEvent.stopPropagation === \'function\') || (typeof originalEvent.cancelBubble === \'boolean\')');
function visit91_193_1(result) {
  _$jscoverage['/base/object.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['155'][1].init(49, 28, 'event.fromElement === target');
function visit90_155_1(result) {
  _$jscoverage['/base/object.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['154'][1].init(1379, 41, '!event.relatedTarget && event.fromElement');
function visit89_154_1(result) {
  _$jscoverage['/base/object.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['149'][2].init(1150, 20, 'button !== undefined');
function visit88_149_2(result) {
  _$jscoverage['/base/object.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['149'][1].init(1134, 36, '!event.which && button !== undefined');
function visit87_149_1(result) {
  _$jscoverage['/base/object.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][4].init(162, 22, 'body && body.clientTop');
function visit86_144_4(result) {
  _$jscoverage['/base/object.js'].branchData['144'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][3].init(162, 27, 'body && body.clientTop || 0');
function visit85_144_3(result) {
  _$jscoverage['/base/object.js'].branchData['144'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][2].init(138, 20, 'doc && doc.clientTop');
function visit84_144_2(result) {
  _$jscoverage['/base/object.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][1].init(138, 51, 'doc && doc.clientTop || body && body.clientTop || 0');
function visit83_144_1(result) {
  _$jscoverage['/base/object.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][4].init(77, 22, 'body && body.scrollTop');
function visit82_143_4(result) {
  _$jscoverage['/base/object.js'].branchData['143'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][3].init(77, 27, 'body && body.scrollTop || 0');
function visit81_143_3(result) {
  _$jscoverage['/base/object.js'].branchData['143'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][2].init(53, 20, 'doc && doc.scrollTop');
function visit80_143_2(result) {
  _$jscoverage['/base/object.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][1].init(53, 51, 'doc && doc.scrollTop || body && body.scrollTop || 0');
function visit79_143_1(result) {
  _$jscoverage['/base/object.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][4].init(165, 23, 'body && body.clientLeft');
function visit78_141_4(result) {
  _$jscoverage['/base/object.js'].branchData['141'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][3].init(165, 28, 'body && body.clientLeft || 0');
function visit77_141_3(result) {
  _$jscoverage['/base/object.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][2].init(140, 21, 'doc && doc.clientLeft');
function visit76_141_2(result) {
  _$jscoverage['/base/object.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][1].init(140, 53, 'doc && doc.clientLeft || body && body.clientLeft || 0');
function visit75_141_1(result) {
  _$jscoverage['/base/object.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][4].init(78, 23, 'body && body.scrollLeft');
function visit74_140_4(result) {
  _$jscoverage['/base/object.js'].branchData['140'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][3].init(78, 28, 'body && body.scrollLeft || 0');
function visit73_140_3(result) {
  _$jscoverage['/base/object.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][2].init(53, 21, 'doc && doc.scrollLeft');
function visit72_140_2(result) {
  _$jscoverage['/base/object.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][1].init(53, 53, 'doc && doc.scrollLeft || body && body.scrollLeft || 0');
function visit71_140_1(result) {
  _$jscoverage['/base/object.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][1].init(37, 32, 'target.ownerDocument || DOCUMENT');
function visit70_136_1(result) {
  _$jscoverage['/base/object.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][4].init(288, 29, 'originalEvent.clientX != null');
function visit69_135_4(result) {
  _$jscoverage['/base/object.js'].branchData['135'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][3].init(265, 19, 'event.pageX == null');
function visit68_135_3(result) {
  _$jscoverage['/base/object.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][2].init(265, 52, 'event.pageX == null && originalEvent.clientX != null');
function visit67_135_2(result) {
  _$jscoverage['/base/object.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][1].init(255, 62, 'target && event.pageX == null && originalEvent.clientX != null');
function visit66_135_1(result) {
  _$jscoverage['/base/object.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['111'][1].init(2397, 19, 'delta !== undefined');
function visit65_111_1(result) {
  _$jscoverage['/base/object.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['102'][1].init(2053, 20, 'deltaY !== undefined');
function visit64_102_1(result) {
  _$jscoverage['/base/object.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['93'][1].init(1709, 20, 'deltaX !== undefined');
function visit63_93_1(result) {
  _$jscoverage['/base/object.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['89'][1].init(1596, 18, '!deltaX && !deltaY');
function visit62_89_1(result) {
  _$jscoverage['/base/object.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['84'][1].init(1420, 25, 'wheelDeltaX !== undefined');
function visit61_84_1(result) {
  _$jscoverage['/base/object.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['81'][1].init(1290, 25, 'wheelDeltaY !== undefined');
function visit60_81_1(result) {
  _$jscoverage['/base/object.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['74'][1].init(191, 28, 'axis === event.VERTICAL_AXIS');
function visit59_74_1(result) {
  _$jscoverage['/base/object.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['71'][1].init(30, 30, 'axis === event.HORIZONTAL_AXIS');
function visit58_71_1(result) {
  _$jscoverage['/base/object.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['70'][1].init(853, 18, 'axis !== undefined');
function visit57_70_1(result) {
  _$jscoverage['/base/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['66'][1].init(114, 16, 'detail % 3 === 0');
function visit56_66_1(result) {
  _$jscoverage['/base/object.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['64'][1].init(609, 6, 'detail');
function visit55_64_1(result) {
  _$jscoverage['/base/object.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['59'][1].init(464, 10, 'wheelDelta');
function visit54_59_1(result) {
  _$jscoverage['/base/object.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['28'][1].init(314, 27, 'event.metaKey === undefined');
function visit53_28_1(result) {
  _$jscoverage['/base/object.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['24'][1].init(40, 30, 'originalEvent.charCode != null');
function visit52_24_1(result) {
  _$jscoverage['/base/object.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['23'][1].init(26, 19, 'event.which == null');
function visit51_23_1(result) {
  _$jscoverage['/base/object.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/object.js'].functionData[0]++;
  _$jscoverage['/base/object.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/object.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/base/object.js'].lineData[9]++;
  var DOCUMENT = S.Env.host.document, TRUE = true, FALSE = false, commonProps = ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'currentTarget', 'eventPhase', 'metaKey', 'shiftKey', 'target', 'timeStamp', 'view', 'type'], eventNormalizers = [{
  reg: /^key/, 
  props: ['char', 'charCode', 'key', 'keyCode', 'which'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[1]++;
  _$jscoverage['/base/object.js'].lineData[23]++;
  if (visit51_23_1(event.which == null)) {
    _$jscoverage['/base/object.js'].lineData[24]++;
    event.which = visit52_24_1(originalEvent.charCode != null) ? originalEvent.charCode : originalEvent.keyCode;
  }
  _$jscoverage['/base/object.js'].lineData[28]++;
  if (visit53_28_1(event.metaKey === undefined)) {
    _$jscoverage['/base/object.js'].lineData[29]++;
    event.metaKey = event.ctrlKey;
  }
}}, {
  reg: /^touch/, 
  props: ['touches', 'changedTouches', 'targetTouches']}, {
  reg: /^hashchange$/, 
  props: ['newURL', 'oldURL']}, {
  reg: /^gesturechange$/i, 
  props: ['rotation', 'scale']}, {
  reg: /^(mousewheel|DOMMouseScroll)$/, 
  props: [], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[2]++;
  _$jscoverage['/base/object.js'].lineData[49]++;
  var deltaX, deltaY, delta, wheelDelta = originalEvent.wheelDelta, axis = originalEvent.axis, wheelDeltaY = originalEvent.wheelDeltaY, wheelDeltaX = originalEvent.wheelDeltaX, detail = originalEvent.detail;
  _$jscoverage['/base/object.js'].lineData[59]++;
  if (visit54_59_1(wheelDelta)) {
    _$jscoverage['/base/object.js'].lineData[60]++;
    delta = wheelDelta / 120;
  }
  _$jscoverage['/base/object.js'].lineData[64]++;
  if (visit55_64_1(detail)) {
    _$jscoverage['/base/object.js'].lineData[66]++;
    delta = 0 - (visit56_66_1(detail % 3 === 0) ? detail / 3 : detail);
  }
  _$jscoverage['/base/object.js'].lineData[70]++;
  if (visit57_70_1(axis !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[71]++;
    if (visit58_71_1(axis === event.HORIZONTAL_AXIS)) {
      _$jscoverage['/base/object.js'].lineData[72]++;
      deltaY = 0;
      _$jscoverage['/base/object.js'].lineData[73]++;
      deltaX = 0 - delta;
    } else {
      _$jscoverage['/base/object.js'].lineData[74]++;
      if (visit59_74_1(axis === event.VERTICAL_AXIS)) {
        _$jscoverage['/base/object.js'].lineData[75]++;
        deltaX = 0;
        _$jscoverage['/base/object.js'].lineData[76]++;
        deltaY = delta;
      }
    }
  }
  _$jscoverage['/base/object.js'].lineData[81]++;
  if (visit60_81_1(wheelDeltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[82]++;
    deltaY = wheelDeltaY / 120;
  }
  _$jscoverage['/base/object.js'].lineData[84]++;
  if (visit61_84_1(wheelDeltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[85]++;
    deltaX = -1 * wheelDeltaX / 120;
  }
  _$jscoverage['/base/object.js'].lineData[89]++;
  if (visit62_89_1(!deltaX && !deltaY)) {
    _$jscoverage['/base/object.js'].lineData[90]++;
    deltaY = delta;
  }
  _$jscoverage['/base/object.js'].lineData[93]++;
  if (visit63_93_1(deltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[99]++;
    event.deltaX = deltaX;
  }
  _$jscoverage['/base/object.js'].lineData[102]++;
  if (visit64_102_1(deltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[108]++;
    event.deltaY = deltaY;
  }
  _$jscoverage['/base/object.js'].lineData[111]++;
  if (visit65_111_1(delta !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[117]++;
    event.delta = delta;
  }
}}, {
  reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i, 
  props: ['buttons', 'clientX', 'clientY', 'button', 'offsetX', 'relatedTarget', 'which', 'fromElement', 'toElement', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[3]++;
  _$jscoverage['/base/object.js'].lineData[130]++;
  var eventDoc, doc, body, target = event.target, button = originalEvent.button;
  _$jscoverage['/base/object.js'].lineData[135]++;
  if (visit66_135_1(target && visit67_135_2(visit68_135_3(event.pageX == null) && visit69_135_4(originalEvent.clientX != null)))) {
    _$jscoverage['/base/object.js'].lineData[136]++;
    eventDoc = visit70_136_1(target.ownerDocument || DOCUMENT);
    _$jscoverage['/base/object.js'].lineData[137]++;
    doc = eventDoc.documentElement;
    _$jscoverage['/base/object.js'].lineData[138]++;
    body = eventDoc.body;
    _$jscoverage['/base/object.js'].lineData[139]++;
    event.pageX = originalEvent.clientX + (visit71_140_1(visit72_140_2(doc && doc.scrollLeft) || visit73_140_3(visit74_140_4(body && body.scrollLeft) || 0))) - (visit75_141_1(visit76_141_2(doc && doc.clientLeft) || visit77_141_3(visit78_141_4(body && body.clientLeft) || 0)));
    _$jscoverage['/base/object.js'].lineData[142]++;
    event.pageY = originalEvent.clientY + (visit79_143_1(visit80_143_2(doc && doc.scrollTop) || visit81_143_3(visit82_143_4(body && body.scrollTop) || 0))) - (visit83_144_1(visit84_144_2(doc && doc.clientTop) || visit85_144_3(visit86_144_4(body && body.clientTop) || 0)));
  }
  _$jscoverage['/base/object.js'].lineData[149]++;
  if (visit87_149_1(!event.which && visit88_149_2(button !== undefined))) {
    _$jscoverage['/base/object.js'].lineData[150]++;
    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
  }
  _$jscoverage['/base/object.js'].lineData[154]++;
  if (visit89_154_1(!event.relatedTarget && event.fromElement)) {
    _$jscoverage['/base/object.js'].lineData[155]++;
    event.relatedTarget = (visit90_155_1(event.fromElement === target)) ? event.toElement : event.fromElement;
  }
  _$jscoverage['/base/object.js'].lineData[158]++;
  return event;
}}];
  _$jscoverage['/base/object.js'].lineData[163]++;
  function retTrue() {
    _$jscoverage['/base/object.js'].functionData[4]++;
    _$jscoverage['/base/object.js'].lineData[164]++;
    return TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[167]++;
  function retFalse() {
    _$jscoverage['/base/object.js'].functionData[5]++;
    _$jscoverage['/base/object.js'].lineData[168]++;
    return FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[189]++;
  function DomEventObject(originalEvent) {
    _$jscoverage['/base/object.js'].functionData[6]++;
    _$jscoverage['/base/object.js'].lineData[190]++;
    var self = this, type = originalEvent.type;
    _$jscoverage['/base/object.js'].lineData[193]++;
    var isNative = visit91_193_1((visit92_193_2(typeof originalEvent.stopPropagation === 'function')) || (visit93_194_1(typeof originalEvent.cancelBubble === 'boolean')));
    _$jscoverage['/base/object.js'].lineData[398]++;
    DomEventObject.superclass.constructor.call(self);
    _$jscoverage['/base/object.js'].lineData[400]++;
    self.originalEvent = originalEvent;
    _$jscoverage['/base/object.js'].lineData[403]++;
    var isDefaultPrevented = retFalse;
    _$jscoverage['/base/object.js'].lineData[404]++;
    if (visit94_404_1('defaultPrevented' in originalEvent)) {
      _$jscoverage['/base/object.js'].lineData[405]++;
      isDefaultPrevented = originalEvent.defaultPrevented ? retTrue : retFalse;
    } else {
      _$jscoverage['/base/object.js'].lineData[406]++;
      if (visit95_406_1('getPreventDefault' in originalEvent)) {
        _$jscoverage['/base/object.js'].lineData[408]++;
        isDefaultPrevented = originalEvent.getPreventDefault() ? retTrue : retFalse;
      } else {
        _$jscoverage['/base/object.js'].lineData[409]++;
        if (visit96_409_1('returnValue' in originalEvent)) {
          _$jscoverage['/base/object.js'].lineData[410]++;
          isDefaultPrevented = visit97_410_1(originalEvent.returnValue === FALSE) ? retTrue : retFalse;
        }
      }
    }
    _$jscoverage['/base/object.js'].lineData[413]++;
    self.isDefaultPrevented = isDefaultPrevented;
    _$jscoverage['/base/object.js'].lineData[415]++;
    var fixFns = [], fixFn, l, prop, props = commonProps.concat();
    _$jscoverage['/base/object.js'].lineData[421]++;
    util.each(eventNormalizers, function(normalizer) {
  _$jscoverage['/base/object.js'].functionData[7]++;
  _$jscoverage['/base/object.js'].lineData[422]++;
  if (visit98_422_1(type.match(normalizer.reg))) {
    _$jscoverage['/base/object.js'].lineData[423]++;
    props = props.concat(normalizer.props);
    _$jscoverage['/base/object.js'].lineData[424]++;
    if (visit99_424_1(normalizer.fix)) {
      _$jscoverage['/base/object.js'].lineData[425]++;
      fixFns.push(normalizer.fix);
    }
  }
  _$jscoverage['/base/object.js'].lineData[428]++;
  return undefined;
});
    _$jscoverage['/base/object.js'].lineData[431]++;
    l = props.length;
    _$jscoverage['/base/object.js'].lineData[434]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[435]++;
      prop = props[--l];
      _$jscoverage['/base/object.js'].lineData[436]++;
      self[prop] = originalEvent[prop];
    }
    _$jscoverage['/base/object.js'].lineData[440]++;
    if (visit100_440_1(!self.target && isNative)) {
      _$jscoverage['/base/object.js'].lineData[441]++;
      self.target = visit101_441_1(originalEvent.srcElement || DOCUMENT);
    }
    _$jscoverage['/base/object.js'].lineData[445]++;
    if (visit102_445_1(self.target && visit103_445_2(self.target.nodeType === 3))) {
      _$jscoverage['/base/object.js'].lineData[446]++;
      self.target = self.target.parentNode;
    }
    _$jscoverage['/base/object.js'].lineData[449]++;
    l = fixFns.length;
    _$jscoverage['/base/object.js'].lineData[451]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[452]++;
      fixFn = fixFns[--l];
      _$jscoverage['/base/object.js'].lineData[453]++;
      fixFn(self, originalEvent);
    }
    _$jscoverage['/base/object.js'].lineData[456]++;
    self.timeStamp = visit104_456_1(originalEvent.timeStamp || util.now());
  }
  _$jscoverage['/base/object.js'].lineData[459]++;
  util.extend(DomEventObject, BaseEvent.Object, {
  constructor: DomEventObject, 
  preventDefault: function() {
  _$jscoverage['/base/object.js'].functionData[8]++;
  _$jscoverage['/base/object.js'].lineData[463]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[467]++;
  if (visit105_467_1(e.preventDefault)) {
    _$jscoverage['/base/object.js'].lineData[468]++;
    e.preventDefault();
  } else {
    _$jscoverage['/base/object.js'].lineData[471]++;
    e.returnValue = FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[474]++;
  DomEventObject.superclass.preventDefault.call(self);
}, 
  stopPropagation: function() {
  _$jscoverage['/base/object.js'].functionData[9]++;
  _$jscoverage['/base/object.js'].lineData[478]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[482]++;
  if (visit106_482_1(e.stopPropagation)) {
    _$jscoverage['/base/object.js'].lineData[483]++;
    e.stopPropagation();
  } else {
    _$jscoverage['/base/object.js'].lineData[486]++;
    e.cancelBubble = TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[489]++;
  DomEventObject.superclass.stopPropagation.call(self);
}});
  _$jscoverage['/base/object.js'].lineData[493]++;
  return DomEventObject;
});