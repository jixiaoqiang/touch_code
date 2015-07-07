__DEV__ = 
true;
(
function(global){


if(global.require){
return;}


var __DEV__=global.__DEV__;

var toString=Object.prototype.toString;













var modulesMap={}, 






dependencyMap={}, 



predefinedRefCounts={}, 

_counter=0, 

REQUIRE_WHEN_READY=1, 
USED_AS_TRANSPORT=2, 

hop=Object.prototype.hasOwnProperty;

function _debugUnresolvedDependencies(names){
var unresolved=Array.prototype.slice.call(names);
var visited={};
var ii, name, module, dependency;

while(unresolved.length) {
name = unresolved.shift();
if(visited[name]){
continue;}

visited[name] = true;

module = modulesMap[name];
if(!module || !module.waiting){
continue;}


for(ii = 0; ii < module.dependencies.length; ii++) {
dependency = module.dependencies[ii];
if(!modulesMap[dependency] || modulesMap[dependency].waiting){
unresolved.push(dependency);}}}




for(name in visited) if(hop.call(visited, name)){
unresolved.push(name);}


var messages=[];
for(ii = 0; ii < unresolved.length; ii++) {
name = unresolved[ii];
var message=name;
module = modulesMap[name];
if(!module){
message += ' is not defined';}else 
if(!module.waiting){
message += ' is ready';}else 
{
var unresolvedDependencies=[];
for(var jj=0; jj < module.dependencies.length; jj++) {
dependency = module.dependencies[jj];
if(!modulesMap[dependency] || modulesMap[dependency].waiting){
unresolvedDependencies.push(dependency);}}


message += ' is waiting for ' + unresolvedDependencies.join(', ');}

messages.push(message);}

return messages.join('\n');}





function ModuleError(msg){
this.name = 'ModuleError';
this.message = msg;
this.stack = Error(msg).stack;
this.framesToPop = 2;}

ModuleError.prototype = Object.create(Error.prototype);
ModuleError.prototype.constructor = ModuleError;

var _performance=
global.performance || 
global.msPerformance || 
global.webkitPerformance || {};

if(!_performance.now){
_performance = global.Date;}


var _now=_performance?
_performance.now.bind(_performance):function(){return 0;};

var _factoryStackCount=0;
var _factoryTime=0;
var _totalFactories=0;
var _inGuard=false;
























































function require(id){
var module=modulesMap[id], dep, i, msg;
if(module && module.exports){


if(module.refcount-- === 1){
delete modulesMap[id];}

return module.exports;}

if(global.ErrorUtils && !_inGuard){
_inGuard = true;
try{
var ret=require.apply(this, arguments);}
catch(e) {
global.ErrorUtils.reportFatalError(e);}

_inGuard = false;
return ret;}


if(!module){
msg = 'Requiring unknown module "' + id + '"';
if(__DEV__){
msg += '. If you are sure the module is there, try restarting the packager.';}

throw new ModuleError(msg);}


if(module.hasError){
throw new ModuleError(
'Requiring module "' + id + '" which threw an exception');}



if(module.waiting){
throw new ModuleError(
'Requiring module "' + id + '" with unresolved dependencies: ' + 
_debugUnresolvedDependencies([id]));}



var exports=module.exports = {};
var factory=module.factory;
if(toString.call(factory) === '[object Function]'){
var args=[], 
dependencies=module.dependencies, 
length=dependencies.length, 
ret;
if(module.special & USED_AS_TRANSPORT){
length = Math.min(length, factory.length);}

try{
for(i = 0; args.length < length; i++) {
dep = dependencies[i];
if(!module.inlineRequires[dep]){
args.push(dep === 'module'?module:
dep === 'exports'?exports:
require.call(null, dep));}}



++_totalFactories;
if(_factoryStackCount++ === 0){
_factoryTime -= _now();}

try{
ret = factory.apply(module.context || global, args);}
catch(e) {
if(modulesMap.ex && modulesMap.erx){


var ex=require.call(null, 'ex');
var erx=require.call(null, 'erx');
var messageWithParams=erx(e.message);
if(messageWithParams[0].indexOf(' from module "%s"') < 0){
messageWithParams[0] += ' from module "%s"';
messageWithParams[messageWithParams.length] = id;}

e.message = ex.apply(null, messageWithParams);}

throw e;}finally 
{
if(--_factoryStackCount === 0){
_factoryTime += _now();}}}


catch(e) {
module.hasError = true;
module.exports = null;
throw e;}

if(ret){
if(__DEV__){
if(typeof ret != 'object' && typeof ret != 'function'){
throw new ModuleError(
'Factory for module "' + id + '" returned ' + 
'an invalid value "' + ret + '". ' + 
'Returned value should be either a function or an object.');}}



module.exports = ret;}}else 

{
module.exports = factory;}




if(module.refcount-- === 1){
delete modulesMap[id];}

return module.exports;}


require.__getFactoryTime = function(){
return (_factoryStackCount?_now():0) + _factoryTime;};


require.__getTotalFactories = function(){
return _totalFactories;};

























































function define(id, dependencies, factory, 
_special, _context, _refCount, _inlineRequires){
if(dependencies === undefined){
dependencies = [];
factory = id;
id = _uid();}else 
if(factory === undefined){
factory = dependencies;
if(toString.call(id) === '[object Array]'){
dependencies = id;
id = _uid();}else 
{
dependencies = [];}}





var canceler={cancel:_undefine.bind(this, id)};

var record=modulesMap[id];






if(record){
if(_refCount){
record.refcount += _refCount;}


return canceler;}else 
if(!dependencies && !factory && _refCount){


predefinedRefCounts[id] = (predefinedRefCounts[id] || 0) + _refCount;
return canceler;}else 
{

record = {id:id};
record.refcount = (predefinedRefCounts[id] || 0) + (_refCount || 0);
delete predefinedRefCounts[id];}


if(__DEV__){
if(
!factory || 
typeof factory != 'object' && typeof factory != 'function' && 
typeof factory != 'string'){
throw new ModuleError(
'Invalid factory "' + factory + '" for module "' + id + '". ' + 
'Factory should be either a function or an object.');}



if(toString.call(dependencies) !== '[object Array]'){
throw new ModuleError(
'Invalid dependencies for module "' + id + '". ' + 
'Dependencies must be passed as an array.');}}




record.factory = factory;
record.dependencies = dependencies;
record.context = _context;
record.special = _special;
record.inlineRequires = _inlineRequires || {};
record.waitingMap = {};
record.waiting = 0;
record.hasError = false;
modulesMap[id] = record;
_initDependencies(id);

return canceler;}


function _undefine(id){
if(!modulesMap[id]){
return;}


var module=modulesMap[id];
delete modulesMap[id];

for(var dep in module.waitingMap) {
if(module.waitingMap[dep]){
delete dependencyMap[dep][id];}}



for(var ii=0; ii < module.dependencies.length; ii++) {
dep = module.dependencies[ii];
if(modulesMap[dep]){
if(modulesMap[dep].refcount-- === 1){
_undefine(dep);}}else 

if(predefinedRefCounts[dep]){
predefinedRefCounts[dep]--;}}}













































function requireLazy(dependencies, factory, context){
return define(
dependencies, 
factory, 
undefined, 
REQUIRE_WHEN_READY, 
context, 
1);}



function _uid(){
return '__mod__' + _counter++;}


function _addDependency(module, dep){

if(!module.waitingMap[dep] && module.id !== dep){
module.waiting++;
module.waitingMap[dep] = 1;
dependencyMap[dep] || (dependencyMap[dep] = {});
dependencyMap[dep][module.id] = 1;}}



function _initDependencies(id){
var modulesToRequire=[];
var module=modulesMap[id];
var dep, i, subdep;


for(i = 0; i < module.dependencies.length; i++) {
dep = module.dependencies[i];
if(!modulesMap[dep]){
_addDependency(module, dep);}else 
if(modulesMap[dep].waiting){
for(subdep in modulesMap[dep].waitingMap) {
if(modulesMap[dep].waitingMap[subdep]){
_addDependency(module, subdep);}}}}




if(module.waiting === 0 && module.special & REQUIRE_WHEN_READY){
modulesToRequire.push(id);}



if(dependencyMap[id]){
var deps=dependencyMap[id];
var submodule;
dependencyMap[id] = undefined;
for(dep in deps) {
submodule = modulesMap[dep];


for(subdep in module.waitingMap) {
if(module.waitingMap[subdep]){
_addDependency(submodule, subdep);}}



if(submodule.waitingMap[id]){
submodule.waitingMap[id] = undefined;
submodule.waiting--;}

if(submodule.waiting === 0 && 
submodule.special & REQUIRE_WHEN_READY){
modulesToRequire.push(dep);}}}





for(i = 0; i < modulesToRequire.length; i++) {
require.call(null, modulesToRequire[i]);}}



function _register(id, exports){
var module=modulesMap[id] = {id:id};
module.exports = exports;
module.refcount = 0;}




_register('module', 0);
_register('exports', 0);

_register('global', global);
_register('require', require);
_register('requireDynamic', require);
_register('requireLazy', requireLazy);

global.require = require;
global.requireDynamic = require;
global.requireLazy = requireLazy;

require.__debug = {
modules:modulesMap, 
deps:dependencyMap, 
printDependencyInfo:function(){
if(!global.console){
return;}

var names=Object.keys(require.__debug.deps);
global.console.log(_debugUnresolvedDependencies(names));}};









global.__d = function(id, deps, factory, _special, _inlineRequires){
var defaultDeps=['global', 'require', 'requireDynamic', 'requireLazy', 
'module', 'exports'];
define(id, defaultDeps.concat(deps), factory, _special || USED_AS_TRANSPORT, 
null, null, _inlineRequires);};})(


this);
Object.

















assign = function(target, sources){
if(__DEV__){
if(target == null){
throw new TypeError('Object.assign target cannot be null or undefined');}

if(typeof target !== 'object' && typeof target !== 'function'){
throw new TypeError(
'In this environment the target of assign MUST be an object.' + 
'This error is a performance optimization and not spec compliant.');}}




for(var nextIndex=1; nextIndex < arguments.length; nextIndex++) {
var nextSource=arguments[nextIndex];
if(nextSource == null){
continue;}


if(__DEV__){
if(typeof nextSource !== 'object' && 
typeof nextSource !== 'function'){
throw new TypeError(
'In this environment the target of assign MUST be an object.' + 
'This error is a performance optimization and not spec compliant.');}}








for(var key in nextSource) {
if(__DEV__){
var hasOwnProperty=Object.prototype.hasOwnProperty;
if(!hasOwnProperty.call(nextSource, key)){
throw new TypeError(
'One of the sources to assign has an enumerable key on the ' + 
'prototype chain. This is an edge case that we do not support. ' + 
'This error is a performance optimization and not spec compliant.');}}



target[key] = nextSource[key];}}



return target;};
(















function(global){
'use strict';

var OBJECT_COLUMN_NAME='(index)';
var LOG_LEVELS={
trace:0, 
log:1, 
info:2, 
warn:3, 
error:4};


function setupConsole(global){

if(!global.nativeLoggingHook){
return;}


function getNativeLogFunction(level){
return function(){
var str=Array.prototype.map.call(arguments, function(arg){
var ret;
var type=typeof arg;
if(arg === null){
ret = 'null';}else 
if(arg === undefined){
ret = 'undefined';}else 
if(type === 'string'){
ret = '"' + arg + '"';}else 
if(type === 'function'){
try{
ret = arg.toString();}
catch(e) {
ret = '[function unknown]';}}else 

{


try{
ret = JSON.stringify(arg);}
catch(e) {
if(typeof arg.toString === 'function'){
try{
ret = arg.toString();}
catch(E) {}}}}



return ret || '["' + type + '" failed to stringify]';}).
join(', ');
global.nativeLoggingHook(str, level);};}



var repeat=function(element, n){
return Array.apply(null, Array(n)).map(function(){return element;});};


function consoleTablePolyfill(rows){

if(!Array.isArray(rows)){
var data=rows;
rows = [];
for(var key in data) {
if(data.hasOwnProperty(key)){
var row=data[key];
row[OBJECT_COLUMN_NAME] = key;
rows.push(row);}}}



if(rows.length === 0){
global.nativeLoggingHook('', LOG_LEVELS.log);
return;}


var columns=Object.keys(rows[0]).sort();
var stringRows=[];
var columnWidths=[];



columns.forEach(function(k, i){
columnWidths[i] = k.length;
for(var j=0; j < rows.length; j++) {
var cellStr=rows[j][k].toString();
stringRows[j] = stringRows[j] || [];
stringRows[j][i] = cellStr;
columnWidths[i] = Math.max(columnWidths[i], cellStr.length);}});





var joinRow=function(row, space){
var cells=row.map(function(cell, i){
var extraSpaces=repeat(' ', columnWidths[i] - cell.length).join('');
return cell + extraSpaces;});

space = space || ' ';
return cells.join(space + '|' + space);};


var separators=columnWidths.map(function(columnWidth){
return repeat('-', columnWidth).join('');});

var separatorRow=joinRow(separators, '-');
var header=joinRow(columns);
var table=[header, separatorRow];

for(var i=0; i < rows.length; i++) {
table.push(joinRow(stringRows[i]));}






global.nativeLoggingHook('\n' + table.join('\n'), LOG_LEVELS.log);}


global.console = {
error:getNativeLogFunction(LOG_LEVELS.error), 
info:getNativeLogFunction(LOG_LEVELS.info), 
log:getNativeLogFunction(LOG_LEVELS.log), 
warn:getNativeLogFunction(LOG_LEVELS.warn), 
trace:getNativeLogFunction(LOG_LEVELS.trace), 
table:consoleTablePolyfill};}




if(typeof module !== 'undefined'){
module.exports = setupConsole;}else 
{
setupConsole(global);}})(


this);
(















function(global){
var ErrorUtils={
_inGuard:0, 
_globalHandler:null, 
setGlobalHandler:function(fun){
ErrorUtils._globalHandler = fun;}, 

reportError:function(error){
ErrorUtils._globalHandler && ErrorUtils._globalHandler(error);}, 

reportFatalError:function(error){
ErrorUtils._globalHandler && ErrorUtils._globalHandler(error, true);}, 

applyWithGuard:function(fun, context, args){
try{
ErrorUtils._inGuard++;
return fun.apply(context, args);}
catch(e) {
ErrorUtils.reportError(e);}finally 
{
ErrorUtils._inGuard--;}}, 


applyWithGuardIfNeeded:function(fun, context, args){
if(ErrorUtils.inGuard()){
return fun.apply(context, args);}else 
{
ErrorUtils.applyWithGuard(fun, context, args);}}, 


inGuard:function(){
return ErrorUtils._inGuard;}, 

guard:function(fun, name, context){
if(typeof fun !== 'function'){
console.warn('A function must be passed to ErrorUtils.guard, got ', fun);
return null;}

name = name || fun.name || '<generated guard>';
function guarded(){
return (
ErrorUtils.applyWithGuard(
fun, 
context || this, 
arguments, 
null, 
name));}




return guarded;}};


global.ErrorUtils = ErrorUtils;





function setupErrorGuard(){
var onError=function(e){
global.console.error(
'Error: ' + 
'\n stack: ' + e.stack + 
'\n line: ' + e.line + 
'\n message: ' + e.message, 
e);};


global.ErrorUtils.setGlobalHandler(onError);}


setupErrorGuard();})(
this);
if(











!String.prototype.startsWith){
String.prototype.startsWith = function(search){
'use strict';
if(this == null){
throw TypeError();}

var string=String(this);
var pos=arguments.length > 1?
Number(arguments[1]) || 0:0;
var start=Math.min(Math.max(pos, 0), string.length);
return string.indexOf(String(search), pos) === start;};}



if(!String.prototype.endsWith){
String.prototype.endsWith = function(search){
'use strict';
if(this == null){
throw TypeError();}

var string=String(this);
var stringLength=string.length;
var searchString=String(search);
var pos=arguments.length > 1?
Number(arguments[1]) || 0:stringLength;
var end=Math.min(Math.max(pos, 0), stringLength);
var start=end - searchString.length;
if(start < 0){
return false;}

return string.lastIndexOf(searchString, start) === start;};}



if(!String.prototype.contains){
String.prototype.contains = function(search){
'use strict';
if(this == null){
throw TypeError();}

var string=String(this);
var pos=arguments.length > 1?
Number(arguments[1]) || 0:0;
return string.indexOf(String(search), pos) !== -1;};}



if(!String.prototype.repeat){
String.prototype.repeat = function(count){
'use strict';
if(this == null){
throw TypeError();}

var string=String(this);
count = Number(count) || 0;
if(count < 0 || count === Infinity){
throw RangeError();}

if(count === 1){
return string;}

var result='';
while(count) {
if(count & 1){
result += string;}

if(count >>= 1){
string += string;}}


return result;};}
(









function(undefined){

function findIndex(predicate, context){
if(this == null){
throw new TypeError(
'Array.prototype.findIndex called on null or undefined');}


if(typeof predicate !== 'function'){
throw new TypeError('predicate must be a function');}

var list=Object(this);
var length=list.length >>> 0;
for(var i=0; i < length; i++) {
if(predicate.call(context, list[i], i, list)){
return i;}}


return -1;}


if(!Array.prototype.findIndex){
Object.defineProperty(Array.prototype, 'findIndex', {
enumerable:false, 
writable:true, 
configurable:true, 
value:findIndex});}




if(!Array.prototype.find){
Object.defineProperty(Array.prototype, 'find', {
enumerable:false, 
writable:true, 
configurable:true, 
value:function(predicate, context){
if(this == null){
throw new TypeError(
'Array.prototype.find called on null or undefined');}


var index=findIndex.call(this, predicate, context);
return index === -1?undefined:this[index];}});}})();
(
function(GLOBAL){







function getInvalidGlobalUseError(name){
return new Error(
'You are trying to render the global ' + name + ' variable as a ' + 
'React element. You probably forgot to require ' + name + '.');}


GLOBAL.Text = {
get defaultProps() {
throw getInvalidGlobalUseError('Text');}};


GLOBAL.Image = {
get defaultProps() {
throw getInvalidGlobalUseError('Image');}};



if(GLOBAL.document){
GLOBAL.document.createElement = null;}




GLOBAL.MutationObserver = undefined;})(
this);
__d('UIExplorerApp',["react-native/Libraries/react-native/react-native","react-native/Examples/UIExplorer/UIExplorerList"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');
var UIExplorerList=require('react-native/Examples/UIExplorer/UIExplorerList');var 

AppRegistry=


React.AppRegistry;var NavigatorIOS=React.NavigatorIOS;var StyleSheet=React.StyleSheet;

var UIExplorerApp=React.createClass({displayName:'UIExplorerApp', 

getInitialState:function(){
return {
openExternalExample:null};}, 



render:function(){var _this=this;
if(this.state.openExternalExample){
var Example=this.state.openExternalExample;
return (
React.createElement(Example, {
onExampleExit:function(){
_this.setState({openExternalExample:null});}}));}




return (
React.createElement(NavigatorIOS, {
style:styles.container, 
initialRoute:{
title:'UIExplorer', 
component:UIExplorerList, 
passProps:{
onExternalExampleRequested:function(example){
_this.setState({openExternalExample:example});}}}, 



itemWrapperStyle:styles.itemWrapper, 
tintColor:'#008888'}));}});





var styles=StyleSheet.create({
container:{
flex:1}, 

itemWrapper:{
backgroundColor:'#eaeaea'}});



AppRegistry.registerComponent('UIExplorerApp', function(){return UIExplorerApp;});

module.exports = UIExplorerApp;});
__d('react-native/Libraries/react-native/react-native',["React","ActivityIndicatorIOS","DatePickerIOS","Image","ListView","MapView","Navigator","NavigatorIOS","PickerIOS","ProgressViewIOS","ScrollView","SegmentedControlIOS","SliderIOS","SwitchIOS","TabBarIOS","Text","TextInput","TouchableHighlight","TouchableOpacity","TouchableWithoutFeedback","View","WebView","AlertIOS","AppRegistry","AppStateIOS","AsyncStorage","CameraRoll","InteractionManager","LayoutAnimation","LinkingIOS","NetInfo","PanResponder","PixelRatio","PushNotificationIOS","StatusBarIOS","StyleSheet","VibrationIOS","RCTDeviceEventEmitter","RCTNativeAppEventEmitter","NativeModules","Platform","requireNativeComponent","EdgeInsetsPropType","PointPropType","LinkedStateMixin","ReactComponentWithPureRenderMixin","NativeModules","ReactUpdates","cloneWithProps","ReactFragment","update","ReactDefaultPerf","ReactTestUtils"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';


















var ReactNative=Object.assign(Object.create(require('React')), {

ActivityIndicatorIOS:require('ActivityIndicatorIOS'), 
DatePickerIOS:require('DatePickerIOS'), 
Image:require('Image'), 
ListView:require('ListView'), 
MapView:require('MapView'), 
Navigator:require('Navigator'), 
NavigatorIOS:require('NavigatorIOS'), 
PickerIOS:require('PickerIOS'), 
ProgressViewIOS:require('ProgressViewIOS'), 
ScrollView:require('ScrollView'), 
SegmentedControlIOS:require('SegmentedControlIOS'), 
SliderIOS:require('SliderIOS'), 
SwitchIOS:require('SwitchIOS'), 
TabBarIOS:require('TabBarIOS'), 
Text:require('Text'), 
TextInput:require('TextInput'), 
TouchableHighlight:require('TouchableHighlight'), 
TouchableOpacity:require('TouchableOpacity'), 
TouchableWithoutFeedback:require('TouchableWithoutFeedback'), 
View:require('View'), 
WebView:require('WebView'), 


AlertIOS:require('AlertIOS'), 
AppRegistry:require('AppRegistry'), 
AppStateIOS:require('AppStateIOS'), 
AsyncStorage:require('AsyncStorage'), 
CameraRoll:require('CameraRoll'), 
InteractionManager:require('InteractionManager'), 
LayoutAnimation:require('LayoutAnimation'), 
LinkingIOS:require('LinkingIOS'), 
NetInfo:require('NetInfo'), 
PanResponder:require('PanResponder'), 
PixelRatio:require('PixelRatio'), 
PushNotificationIOS:require('PushNotificationIOS'), 
StatusBarIOS:require('StatusBarIOS'), 
StyleSheet:require('StyleSheet'), 
VibrationIOS:require('VibrationIOS'), 


DeviceEventEmitter:require('RCTDeviceEventEmitter'), 
NativeAppEventEmitter:require('RCTNativeAppEventEmitter'), 
NativeModules:require('NativeModules'), 
Platform:require('Platform'), 
requireNativeComponent:require('requireNativeComponent'), 


EdgeInsetsPropType:require('EdgeInsetsPropType'), 
PointPropType:require('PointPropType'), 

addons:{
LinkedStateMixin:require('LinkedStateMixin'), 
Perf:undefined, 
PureRenderMixin:require('ReactComponentWithPureRenderMixin'), 
TestModule:require('NativeModules').TestModule, 
TestUtils:undefined, 
batchedUpdates:require('ReactUpdates').batchedUpdates, 
cloneWithProps:require('cloneWithProps'), 
createFragment:require('ReactFragment').create, 
update:require('update')}});



if(__DEV__){
ReactNative.addons.Perf = require('ReactDefaultPerf');
ReactNative.addons.TestUtils = require('ReactTestUtils');}


module.exports = ReactNative;});
__d('React',["ReactNative"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












module.exports = require('ReactNative');});
__d('ReactNative',["ReactChildren","ReactClass","ReactComponent","ReactContext","ReactCurrentOwner","ReactElement","ReactElementValidator","ReactInstanceHandles","ReactNativeDefaultInjection","ReactNativeMount","ReactPropTypes","deprecated","findNodeHandle","invariant","onlyChild","ReactReconciler","ReactNativeTextComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactChildren=require('ReactChildren');
var ReactClass=require('ReactClass');
var ReactComponent=require('ReactComponent');
var ReactContext=require('ReactContext');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactElement=require('ReactElement');
var ReactElementValidator=require('ReactElementValidator');
var ReactInstanceHandles=require('ReactInstanceHandles');
var ReactNativeDefaultInjection=require('ReactNativeDefaultInjection');
var ReactNativeMount=require('ReactNativeMount');
var ReactPropTypes=require('ReactPropTypes');

var deprecated=require('deprecated');
var findNodeHandle=require('findNodeHandle');
var invariant=require('invariant');
var onlyChild=require('onlyChild');

ReactNativeDefaultInjection.inject();

var createElement=ReactElement.createElement;
var createFactory=ReactElement.createFactory;
var cloneElement=ReactElement.cloneElement;

if(__DEV__){
createElement = ReactElementValidator.createElement;
createFactory = ReactElementValidator.createFactory;
cloneElement = ReactElementValidator.cloneElement;}


var resolveDefaultProps=function(element){

var defaultProps=element.type.defaultProps;
var props=element.props;
for(var propName in defaultProps) {
if(props[propName] === undefined){
props[propName] = defaultProps[propName];}}};





var augmentElement=function(element){
if(__DEV__){
invariant(
false, 
'This optimized path should never be used in DEV mode because ' + 
'it does not provide validation. Check your JSX transform.');}


element._owner = ReactCurrentOwner.current;
element._context = ReactContext.current;
if(element.type.defaultProps){
resolveDefaultProps(element);}

return element;};


var render=function(
element, 
mountInto, 
callback)
{
return ReactNativeMount.renderComponent(element, mountInto, callback);};


var ReactNative={
hasReactNativeInitialized:false, 
Children:{
map:ReactChildren.map, 
forEach:ReactChildren.forEach, 
count:ReactChildren.count, 
only:onlyChild}, 

Component:ReactComponent, 
PropTypes:ReactPropTypes, 
createClass:ReactClass.createClass, 
createElement:createElement, 
createFactory:createFactory, 
cloneElement:cloneElement, 
_augmentElement:augmentElement, 
findNodeHandle:findNodeHandle, 
render:render, 
unmountComponentAtNode:ReactNativeMount.unmountComponentAtNode, 


__spread:Object.assign, 

unmountComponentAtNodeAndRemoveContainer:ReactNativeMount.unmountComponentAtNodeAndRemoveContainer, 
isValidClass:ReactElement.isValidFactory, 
isValidElement:ReactElement.isValidElement, 


renderComponent:deprecated(
'React', 
'renderComponent', 
'render', 
this, 
render), 

isValidComponent:deprecated(
'React', 
'isValidComponent', 
'isValidElement', 
this, 
ReactElement.isValidElement)};






if(
typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' && 
typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function'){
__REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
CurrentOwner:ReactCurrentOwner, 
InstanceHandles:ReactInstanceHandles, 
Mount:ReactNativeMount, 
Reconciler:require('ReactReconciler'), 
TextComponent:require('ReactNativeTextComponent')});}



module.exports = ReactNative;});
__d('ReactChildren',["PooledClass","ReactFragment","traverseAllChildren","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var PooledClass=require('PooledClass');
var ReactFragment=require('ReactFragment');

var traverseAllChildren=require('traverseAllChildren');
var warning=require('warning');

var twoArgumentPooler=PooledClass.twoArgumentPooler;
var threeArgumentPooler=PooledClass.threeArgumentPooler;









function ForEachBookKeeping(forEachFunction, forEachContext){
this.forEachFunction = forEachFunction;
this.forEachContext = forEachContext;}

PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(traverseContext, child, name, i){
var forEachBookKeeping=traverseContext;
forEachBookKeeping.forEachFunction.call(
forEachBookKeeping.forEachContext, child, i);}












function forEachChildren(children, forEachFunc, forEachContext){
if(children == null){
return children;}


var traverseContext=
ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
traverseAllChildren(children, forEachSingleChild, traverseContext);
ForEachBookKeeping.release(traverseContext);}











function MapBookKeeping(mapResult, mapFunction, mapContext){
this.mapResult = mapResult;
this.mapFunction = mapFunction;
this.mapContext = mapContext;}

PooledClass.addPoolingTo(MapBookKeeping, threeArgumentPooler);

function mapSingleChildIntoContext(traverseContext, child, name, i){
var mapBookKeeping=traverseContext;
var mapResult=mapBookKeeping.mapResult;

var keyUnique=!mapResult.hasOwnProperty(name);
if(__DEV__){
warning(
keyUnique, 
'ReactChildren.map(...): Encountered two children with the same key, ' + 
'`%s`. Child keys must be unique; when two children share a key, only ' + 
'the first child will be used.', 
name);}



if(keyUnique){
var mappedChild=
mapBookKeeping.mapFunction.call(mapBookKeeping.mapContext, child, i);
mapResult[name] = mappedChild;}}

















function mapChildren(children, func, context){
if(children == null){
return children;}


var mapResult={};
var traverseContext=MapBookKeeping.getPooled(mapResult, func, context);
traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
MapBookKeeping.release(traverseContext);
return ReactFragment.create(mapResult);}


function forEachSingleChildDummy(traverseContext, child, name, i){
return null;}









function countChildren(children, context){
return traverseAllChildren(children, forEachSingleChildDummy, null);}


var ReactChildren={
forEach:forEachChildren, 
map:mapChildren, 
count:countChildren};


module.exports = ReactChildren;});
__d('PooledClass',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');








var oneArgumentPooler=function(copyFieldsFrom){
var Klass=this;
if(Klass.instancePool.length){
var instance=Klass.instancePool.pop();
Klass.call(instance, copyFieldsFrom);
return instance;}else 
{
return new Klass(copyFieldsFrom);}};



var twoArgumentPooler=function(a1, a2){
var Klass=this;
if(Klass.instancePool.length){
var instance=Klass.instancePool.pop();
Klass.call(instance, a1, a2);
return instance;}else 
{
return new Klass(a1, a2);}};



var threeArgumentPooler=function(a1, a2, a3){
var Klass=this;
if(Klass.instancePool.length){
var instance=Klass.instancePool.pop();
Klass.call(instance, a1, a2, a3);
return instance;}else 
{
return new Klass(a1, a2, a3);}};



var fiveArgumentPooler=function(a1, a2, a3, a4, a5){
var Klass=this;
if(Klass.instancePool.length){
var instance=Klass.instancePool.pop();
Klass.call(instance, a1, a2, a3, a4, a5);
return instance;}else 
{
return new Klass(a1, a2, a3, a4, a5);}};



var standardReleaser=function(instance){
var Klass=this;
invariant(
instance instanceof Klass, 
'Trying to release an instance into a pool of a different type.');

if(instance.destructor){
instance.destructor();}

if(Klass.instancePool.length < Klass.poolSize){
Klass.instancePool.push(instance);}};



var DEFAULT_POOL_SIZE=10;
var DEFAULT_POOLER=oneArgumentPooler;










var addPoolingTo=function(CopyConstructor, pooler){
var NewKlass=CopyConstructor;
NewKlass.instancePool = [];
NewKlass.getPooled = pooler || DEFAULT_POOLER;
if(!NewKlass.poolSize){
NewKlass.poolSize = DEFAULT_POOL_SIZE;}

NewKlass.release = standardReleaser;
return NewKlass;};


var PooledClass={
addPoolingTo:addPoolingTo, 
oneArgumentPooler:oneArgumentPooler, 
twoArgumentPooler:twoArgumentPooler, 
threeArgumentPooler:threeArgumentPooler, 
fiveArgumentPooler:fiveArgumentPooler};


module.exports = PooledClass;});
__d('invariant',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';























var invariant=function(condition, format, a, b, c, d, e, f){
if(__DEV__){
if(format === undefined){
throw new Error('invariant requires an error message argument');}}



if(!condition){
var error;
if(format === undefined){
error = new Error(
'Minified exception occurred; use the non-minified dev environment ' + 
'for the full error message and additional helpful warnings.');}else 

{
var args=[a, b, c, d, e, f];
var argIndex=0;
error = new Error(
'Invariant Violation: ' + 
format.replace(/%s/g, function(){return args[argIndex++];}));}



error.framesToPop = 1;
throw error;}};



module.exports = invariant;});
__d('ReactFragment',["ReactElement","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactElement=require('ReactElement');

var warning=require('warning');









if(__DEV__){
var fragmentKey='_reactFragment';
var didWarnKey='_reactDidWarn';
var canWarnForReactFragment=false;

try{



var dummy=function(){
return 1;};


Object.defineProperty(
{}, 
fragmentKey, 
{enumerable:false, value:true});


Object.defineProperty(
{}, 
'key', 
{enumerable:true, get:dummy});


canWarnForReactFragment = true;}
catch(x) {}

var proxyPropertyAccessWithWarning=function(obj, key){
Object.defineProperty(obj, key, {
enumerable:true, 
get:function(){
warning(
this[didWarnKey], 
'A ReactFragment is an opaque type. Accessing any of its ' + 
'properties is deprecated. Pass it to one of the React.Children ' + 
'helpers.');

this[didWarnKey] = true;
return this[fragmentKey][key];}, 

set:function(value){
warning(
this[didWarnKey], 
'A ReactFragment is an immutable opaque type. Mutating its ' + 
'properties is deprecated.');

this[didWarnKey] = true;
this[fragmentKey][key] = value;}});};




var issuedWarnings={};

var didWarnForFragment=function(fragment){


var fragmentCacheKey='';
for(var key in fragment) {
fragmentCacheKey += key + ':' + typeof fragment[key] + ',';}

var alreadyWarnedOnce=!!issuedWarnings[fragmentCacheKey];
issuedWarnings[fragmentCacheKey] = true;
return alreadyWarnedOnce;};}



var ReactFragment={


create:function(object){
if(__DEV__){
if(typeof object !== 'object' || !object || Array.isArray(object)){
warning(
false, 
'React.addons.createFragment only accepts a single object.', 
object);

return object;}

if(ReactElement.isValidElement(object)){
warning(
false, 
'React.addons.createFragment does not accept a ReactElement ' + 
'without a wrapper object.');

return object;}

if(canWarnForReactFragment){
var proxy={};
Object.defineProperty(proxy, fragmentKey, {
enumerable:false, 
value:object});

Object.defineProperty(proxy, didWarnKey, {
writable:true, 
enumerable:false, 
value:false});

for(var key in object) {
proxyPropertyAccessWithWarning(proxy, key);}

Object.preventExtensions(proxy);
return proxy;}}


return object;}, 



extract:function(fragment){
if(__DEV__){
if(canWarnForReactFragment){
if(!fragment[fragmentKey]){
warning(
didWarnForFragment(fragment), 
'Any use of a keyed object should be wrapped in ' + 
'React.addons.createFragment(object) before being passed as a ' + 
'child.');

return fragment;}

return fragment[fragmentKey];}}


return fragment;}, 




extractIfFragment:function(fragment){
if(__DEV__){
if(canWarnForReactFragment){

if(fragment[fragmentKey]){
return fragment[fragmentKey];}




for(var key in fragment) {
if(fragment.hasOwnProperty(key) && 
ReactElement.isValidElement(fragment[key])){


return ReactFragment.extract(fragment);}}}}




return fragment;}};



module.exports = ReactFragment;});
__d('ReactElement',["ReactContext","ReactCurrentOwner","Object.assign","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactContext=require('ReactContext');
var ReactCurrentOwner=require('ReactCurrentOwner');

var assign=require('Object.assign');
var warning=require('warning');

var RESERVED_PROPS={
key:true, 
ref:true};









function defineWarningProperty(object, key){
Object.defineProperty(object, key, {

configurable:false, 
enumerable:true, 

get:function(){
if(!this._store){
return null;}

return this._store[key];}, 


set:function(value){
warning(
false, 
'Don\'t set the %s property of the React element. Instead, ' + 
'specify the correct value when initially creating the element.', 
key);

this._store[key] = value;}});}








var useMutationMembrane=false;







function defineMutationMembrane(prototype){
try{
var pseudoFrozenProperties={
props:true};

for(var key in pseudoFrozenProperties) {
defineWarningProperty(prototype, key);}

useMutationMembrane = true;}
catch(x) {}}














var ReactElement=function(type, key, ref, owner, context, props){

this.type = type;
this.key = key;
this.ref = ref;


this._owner = owner;



this._context = context;

if(__DEV__){




this._store = {props:props, originalProps:assign({}, props)};





try{
Object.defineProperty(this._store, 'validated', {
configurable:false, 
enumerable:false, 
writable:true});}

catch(x) {}

this._store.validated = false;




if(useMutationMembrane){
Object.freeze(this);
return;}}



this.props = props;};




ReactElement.prototype = {
_isReactElement:true};


if(__DEV__){
defineMutationMembrane(ReactElement.prototype);}


ReactElement.createElement = function(type, config, children){
var propName;


var props={};

var key=null;
var ref=null;

if(config != null){
ref = config.ref === undefined?null:config.ref;
key = config.key === undefined?null:'' + config.key;

for(propName in config) {
if(config.hasOwnProperty(propName) && 
!RESERVED_PROPS.hasOwnProperty(propName)){
props[propName] = config[propName];}}}






var childrenLength=arguments.length - 2;
if(childrenLength === 1){
props.children = children;}else 
if(childrenLength > 1){
var childArray=Array(childrenLength);
for(var i=0; i < childrenLength; i++) {
childArray[i] = arguments[i + 2];}

props.children = childArray;}



if(type && type.defaultProps){
var defaultProps=type.defaultProps;
for(propName in defaultProps) {
if(typeof props[propName] === 'undefined'){
props[propName] = defaultProps[propName];}}}




return new ReactElement(
type, 
key, 
ref, 
ReactCurrentOwner.current, 
ReactContext.current, 
props);};



ReactElement.createFactory = function(type){
var factory=ReactElement.createElement.bind(null, type);





factory.type = type;
return factory;};


ReactElement.cloneAndReplaceProps = function(oldElement, newProps){
var newElement=new ReactElement(
oldElement.type, 
oldElement.key, 
oldElement.ref, 
oldElement._owner, 
oldElement._context, 
newProps);


if(__DEV__){

newElement._store.validated = oldElement._store.validated;}

return newElement;};


ReactElement.cloneElement = function(element, config, children){
var propName;


var props=assign({}, element.props);


var key=element.key;
var ref=element.ref;


var owner=element._owner;

if(config != null){
if(config.ref !== undefined){

ref = config.ref;
owner = ReactCurrentOwner.current;}

if(config.key !== undefined){
key = '' + config.key;}


for(propName in config) {
if(config.hasOwnProperty(propName) && 
!RESERVED_PROPS.hasOwnProperty(propName)){
props[propName] = config[propName];}}}






var childrenLength=arguments.length - 2;
if(childrenLength === 1){
props.children = children;}else 
if(childrenLength > 1){
var childArray=Array(childrenLength);
for(var i=0; i < childrenLength; i++) {
childArray[i] = arguments[i + 2];}

props.children = childArray;}


return new ReactElement(
element.type, 
key, 
ref, 
owner, 
element._context, 
props);};








ReactElement.isValidElement = function(object){




var isElement=!!(object && object._isReactElement);





return isElement;};


module.exports = ReactElement;});
__d('ReactContext',["Object.assign","emptyObject","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var assign=require('Object.assign');
var emptyObject=require('emptyObject');
var warning=require('warning');

var didWarn=false;







var ReactContext={





current:emptyObject, 

















withContext:function(newContext, scopedCallback){
if(__DEV__){
warning(
didWarn, 
'withContext is deprecated and will be removed in a future version. ' + 
'Use a wrapper component with getChildContext instead.');


didWarn = true;}


var result;
var previousContext=ReactContext.current;
ReactContext.current = assign({}, previousContext, newContext);
try{
result = scopedCallback();}finally 
{
ReactContext.current = previousContext;}

return result;}};




module.exports = ReactContext;});
__d('Object.assign',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














function assign(target, sources){
if(target == null){
throw new TypeError('Object.assign target cannot be null or undefined');}


var to=Object(target);
var hasOwnProperty=Object.prototype.hasOwnProperty;

for(var nextIndex=1; nextIndex < arguments.length; nextIndex++) {
var nextSource=arguments[nextIndex];
if(nextSource == null){
continue;}


var from=Object(nextSource);






for(var key in from) {
if(hasOwnProperty.call(from, key)){
to[key] = from[key];}}}




return to;}


module.exports = assign;});
__d('emptyObject',[],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";












var emptyObject={};

if(__DEV__){
Object.freeze(emptyObject);}


module.exports = emptyObject;});
__d('warning',["emptyFunction"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var emptyFunction=require('emptyFunction');








var warning=emptyFunction;

if(__DEV__){
warning = function(condition, format){for(var _len=arguments.length, args=Array(_len > 2?_len - 2:0), _key=2; _key < _len; _key++) {args[_key - 2] = arguments[_key];}
if(format === undefined){
throw new Error(
'`warning(condition, format, ...args)` requires a warning ' + 
'message argument');}



if(format.length < 10 || /^[s\W]*$/.test(format)){
throw new Error(
'The warning format should be able to uniquely identify this ' + 
'warning. Please, use a more descriptive format than: ' + format);}



if(format.indexOf('Failed Composite propType: ') === 0){
return;}


if(!condition){
var argIndex=0;
var message='Warning: ' + format.replace(/%s/g, function(){return args[argIndex++];});
console.warn(message);
try{



throw new Error(message);}
catch(x) {}}};}




module.exports = warning;});
__d('emptyFunction',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 










makeEmptyFunction(arg){
return function(){
return arg;};}








function emptyFunction(){}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function(){return this;};
emptyFunction.thatReturnsArgument = function(arg){return arg;};

module.exports = emptyFunction;});
__d('ReactCurrentOwner',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




















var ReactCurrentOwner={





current:null};



module.exports = ReactCurrentOwner;});
__d('traverseAllChildren',["ReactElement","ReactFragment","ReactInstanceHandles","getIteratorFn","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactElement=require('ReactElement');
var ReactFragment=require('ReactFragment');
var ReactInstanceHandles=require('ReactInstanceHandles');

var getIteratorFn=require('getIteratorFn');
var invariant=require('invariant');
var warning=require('warning');

var SEPARATOR=ReactInstanceHandles.SEPARATOR;
var SUBSEPARATOR=':';






var userProvidedKeyEscaperLookup={
'=':'=0', 
'.':'=1', 
':':'=2'};


var userProvidedKeyEscapeRegex=/[=.:]/g;

var didWarnAboutMaps=false;

function userProvidedKeyEscaper(match){
return userProvidedKeyEscaperLookup[match];}









function getComponentKey(component, index){
if(component && component.key != null){

return wrapUserProvidedKey(component.key);}


return index.toString(36);}








function escapeUserProvidedKey(text){
return ('' + text).replace(
userProvidedKeyEscapeRegex, 
userProvidedKeyEscaper);}










function wrapUserProvidedKey(key){
return '$' + escapeUserProvidedKey(key);}











function traverseAllChildrenImpl(
children, 
nameSoFar, 
indexSoFar, 
callback, 
traverseContext)
{
var type=typeof children;

if(type === 'undefined' || type === 'boolean'){

children = null;}


if(children === null || 
type === 'string' || 
type === 'number' || 
ReactElement.isValidElement(children)){
callback(
traverseContext, 
children, 


nameSoFar === ''?SEPARATOR + getComponentKey(children, 0):nameSoFar, 
indexSoFar);

return 1;}


var child, nextName, nextIndex;
var subtreeCount=0;

if(Array.isArray(children)){
for(var i=0; i < children.length; i++) {
child = children[i];
nextName = 
(nameSoFar !== ''?nameSoFar + SUBSEPARATOR:SEPARATOR) + 
getComponentKey(child, i);

nextIndex = indexSoFar + subtreeCount;
subtreeCount += traverseAllChildrenImpl(
child, 
nextName, 
nextIndex, 
callback, 
traverseContext);}}else 


{
var iteratorFn=getIteratorFn(children);
if(iteratorFn){
var iterator=iteratorFn.call(children);
var step;
if(iteratorFn !== children.entries){
var ii=0;
while(!(step = iterator.next()).done) {
child = step.value;
nextName = 
(nameSoFar !== ''?nameSoFar + SUBSEPARATOR:SEPARATOR) + 
getComponentKey(child, ii++);

nextIndex = indexSoFar + subtreeCount;
subtreeCount += traverseAllChildrenImpl(
child, 
nextName, 
nextIndex, 
callback, 
traverseContext);}}else 


{
if(__DEV__){
warning(
didWarnAboutMaps, 
'Using Maps as children is not yet fully supported. It is an ' + 
'experimental feature that might be removed. Convert it to a ' + 
'sequence / iterable of keyed ReactElements instead.');

didWarnAboutMaps = true;}


while(!(step = iterator.next()).done) {
var entry=step.value;
if(entry){
child = entry[1];
nextName = 
(nameSoFar !== ''?nameSoFar + SUBSEPARATOR:SEPARATOR) + 
wrapUserProvidedKey(entry[0]) + SUBSEPARATOR + 
getComponentKey(child, 0);

nextIndex = indexSoFar + subtreeCount;
subtreeCount += traverseAllChildrenImpl(
child, 
nextName, 
nextIndex, 
callback, 
traverseContext);}}}}else 




if(type === 'object'){
invariant(
children.nodeType !== 1, 
'traverseAllChildren(...): Encountered an invalid child; DOM ' + 
'elements are not valid children of React components.');

var fragment=ReactFragment.extract(children);
for(var key in fragment) {
if(fragment.hasOwnProperty(key)){
child = fragment[key];
nextName = 
(nameSoFar !== ''?nameSoFar + SUBSEPARATOR:SEPARATOR) + 
wrapUserProvidedKey(key) + SUBSEPARATOR + 
getComponentKey(child, 0);

nextIndex = indexSoFar + subtreeCount;
subtreeCount += traverseAllChildrenImpl(
child, 
nextName, 
nextIndex, 
callback, 
traverseContext);}}}}






return subtreeCount;}


















function traverseAllChildren(children, callback, traverseContext){
if(children == null){
return 0;}


return traverseAllChildrenImpl(children, '', 0, callback, traverseContext);}


module.exports = traverseAllChildren;});
__d('ReactInstanceHandles',["ReactRootIndex","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




















var ReactRootIndex=require('ReactRootIndex');

var invariant=require('invariant');

var SEPARATOR='.';
var SEPARATOR_LENGTH=SEPARATOR.length;




var MAX_TREE_DEPTH=100;








function getReactRootIDString(index){
return SEPARATOR + index.toString(36);}










function isBoundary(id, index){
return id.charAt(index) === SEPARATOR || index === id.length;}









function isValidID(id){
return id === '' || 
id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR;}











function isAncestorIDOf(ancestorID, descendantID){
return (
descendantID.indexOf(ancestorID) === 0 && 
isBoundary(descendantID, ancestorID.length));}










function getParentID(id){
return id?id.substr(0, id.lastIndexOf(SEPARATOR)):'';}











function getNextDescendantID(ancestorID, destinationID){
invariant(
isValidID(ancestorID) && isValidID(destinationID), 
'getNextDescendantID(%s, %s): Received an invalid React DOM ID.', 
ancestorID, 
destinationID);

invariant(
isAncestorIDOf(ancestorID, destinationID), 
'getNextDescendantID(...): React has made an invalid assumption about ' + 
'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.', 
ancestorID, 
destinationID);

if(ancestorID === destinationID){
return ancestorID;}



var start=ancestorID.length + SEPARATOR_LENGTH;
for(var i=start; i < destinationID.length; i++) {
if(isBoundary(destinationID, i)){
break;}}


return destinationID.substr(0, i);}













function getFirstCommonAncestorID(oneID, twoID){
var minLength=Math.min(oneID.length, twoID.length);
if(minLength === 0){
return '';}

var lastCommonMarkerIndex=0;

for(var i=0; i <= minLength; i++) {
if(isBoundary(oneID, i) && isBoundary(twoID, i)){
lastCommonMarkerIndex = i;}else 
if(oneID.charAt(i) !== twoID.charAt(i)){
break;}}


var longestCommonID=oneID.substr(0, lastCommonMarkerIndex);
invariant(
isValidID(longestCommonID), 
'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s', 
oneID, 
twoID, 
longestCommonID);

return longestCommonID;}














function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast){
start = start || '';
stop = stop || '';
invariant(
start !== stop, 
'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.', 
start);

var traverseUp=isAncestorIDOf(stop, start);
invariant(
traverseUp || isAncestorIDOf(start, stop), 
'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' + 
'not have a parent path.', 
start, 
stop);


var depth=0;
var traverse=traverseUp?getParentID:getNextDescendantID;
for(var id=start;; id = traverse(id, stop)) {
var ret;
if((!skipFirst || id !== start) && (!skipLast || id !== stop)){
ret = cb(id, traverseUp, arg);}

if(ret === false || id === stop){

break;}

invariant(
depth++ < MAX_TREE_DEPTH, 
'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' + 
'traversing the React DOM ID tree. This may be due to malformed IDs: %s', 
start, stop);}}











var ReactInstanceHandles={





createReactRootID:function(){
return getReactRootIDString(ReactRootIndex.createReactRootIndex());}, 










createReactID:function(rootID, name){
return rootID + name;}, 










getReactRootIDFromNodeID:function(id){
if(id && id.charAt(0) === SEPARATOR && id.length > 1){
var index=id.indexOf(SEPARATOR, 1);
return index > -1?id.substr(0, index):id;}

return null;}, 
















traverseEnterLeave:function(leaveID, enterID, cb, upArg, downArg){
var ancestorID=getFirstCommonAncestorID(leaveID, enterID);
if(ancestorID !== leaveID){
traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);}

if(ancestorID !== enterID){
traverseParentPath(ancestorID, enterID, cb, downArg, true, false);}}, 













traverseTwoPhase:function(targetID, cb, arg){
if(targetID){
traverseParentPath('', targetID, cb, arg, true, false);
traverseParentPath(targetID, '', cb, arg, false, true);}}, 






traverseTwoPhaseSkipTarget:function(targetID, cb, arg){
if(targetID){
traverseParentPath('', targetID, cb, arg, true, true);
traverseParentPath(targetID, '', cb, arg, true, true);}}, 















traverseAncestors:function(targetID, cb, arg){
traverseParentPath('', targetID, cb, arg, true, false);}, 






_getFirstCommonAncestorID:getFirstCommonAncestorID, 





_getNextDescendantID:getNextDescendantID, 

isAncestorIDOf:isAncestorIDOf, 

SEPARATOR:SEPARATOR};



module.exports = ReactInstanceHandles;});
__d('ReactRootIndex',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactRootIndexInjection={



injectCreateReactRootIndex:function(_createReactRootIndex){
ReactRootIndex.createReactRootIndex = _createReactRootIndex;}};



var ReactRootIndex={
createReactRootIndex:null, 
injection:ReactRootIndexInjection};


module.exports = ReactRootIndex;});
__d('getIteratorFn',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var ITERATOR_SYMBOL=typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL='@@iterator';















function getIteratorFn(maybeIterable){
var iteratorFn=maybeIterable && (
ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || 
maybeIterable[FAUX_ITERATOR_SYMBOL]);

if(typeof iteratorFn === 'function'){
return iteratorFn;}}



module.exports = getIteratorFn;});
__d('ReactClass',["ReactComponent","ReactCurrentOwner","ReactElement","ReactErrorUtils","ReactInstanceMap","ReactLifeCycle","ReactPropTypeLocations","ReactPropTypeLocationNames","ReactUpdateQueue","Object.assign","invariant","keyMirror","keyOf","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactComponent=require('ReactComponent');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactElement=require('ReactElement');
var ReactErrorUtils=require('ReactErrorUtils');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactLifeCycle=require('ReactLifeCycle');
var ReactPropTypeLocations=require('ReactPropTypeLocations');
var ReactPropTypeLocationNames=require('ReactPropTypeLocationNames');
var ReactUpdateQueue=require('ReactUpdateQueue');

var assign=require('Object.assign');
var invariant=require('invariant');
var keyMirror=require('keyMirror');
var keyOf=require('keyOf');
var warning=require('warning');

var MIXINS_KEY=keyOf({mixins:null});




var SpecPolicy=keyMirror({



DEFINE_ONCE:null, 




DEFINE_MANY:null, 



OVERRIDE_BASE:null, 





DEFINE_MANY_MERGED:null});



var injectedMixins=[];























var ReactClassInterface={







mixins:SpecPolicy.DEFINE_MANY, 








statics:SpecPolicy.DEFINE_MANY, 







propTypes:SpecPolicy.DEFINE_MANY, 







contextTypes:SpecPolicy.DEFINE_MANY, 







childContextTypes:SpecPolicy.DEFINE_MANY, 













getDefaultProps:SpecPolicy.DEFINE_MANY_MERGED, 















getInitialState:SpecPolicy.DEFINE_MANY_MERGED, 





getChildContext:SpecPolicy.DEFINE_MANY_MERGED, 

















render:SpecPolicy.DEFINE_ONCE, 












componentWillMount:SpecPolicy.DEFINE_MANY, 











componentDidMount:SpecPolicy.DEFINE_MANY, 




















componentWillReceiveProps:SpecPolicy.DEFINE_MANY, 





















shouldComponentUpdate:SpecPolicy.DEFINE_ONCE, 
















componentWillUpdate:SpecPolicy.DEFINE_MANY, 













componentDidUpdate:SpecPolicy.DEFINE_MANY, 












componentWillUnmount:SpecPolicy.DEFINE_MANY, 















updateComponent:SpecPolicy.OVERRIDE_BASE};












var RESERVED_SPEC_KEYS={
displayName:function(Constructor, displayName){
Constructor.displayName = displayName;}, 

mixins:function(Constructor, mixins){
if(mixins){
for(var i=0; i < mixins.length; i++) {
mixSpecIntoComponent(Constructor, mixins[i]);}}}, 



childContextTypes:function(Constructor, childContextTypes){
if(__DEV__){
validateTypeDef(
Constructor, 
childContextTypes, 
ReactPropTypeLocations.childContext);}


Constructor.childContextTypes = assign(
{}, 
Constructor.childContextTypes, 
childContextTypes);}, 


contextTypes:function(Constructor, contextTypes){
if(__DEV__){
validateTypeDef(
Constructor, 
contextTypes, 
ReactPropTypeLocations.context);}


Constructor.contextTypes = assign(
{}, 
Constructor.contextTypes, 
contextTypes);}, 






getDefaultProps:function(Constructor, getDefaultProps){
if(Constructor.getDefaultProps){
Constructor.getDefaultProps = createMergedResultFunction(
Constructor.getDefaultProps, 
getDefaultProps);}else 

{
Constructor.getDefaultProps = getDefaultProps;}}, 


propTypes:function(Constructor, propTypes){
if(__DEV__){
validateTypeDef(
Constructor, 
propTypes, 
ReactPropTypeLocations.prop);}


Constructor.propTypes = assign(
{}, 
Constructor.propTypes, 
propTypes);}, 


statics:function(Constructor, statics){
mixStaticSpecIntoComponent(Constructor, statics);}};



function validateTypeDef(Constructor, typeDef, location){
for(var propName in typeDef) {
if(typeDef.hasOwnProperty(propName)){


warning(
typeof typeDef[propName] === 'function', 
'%s: %s type `%s` is invalid; it must be a function, usually from ' + 
'React.PropTypes.', 
Constructor.displayName || 'ReactClass', 
ReactPropTypeLocationNames[location], 
propName);}}}





function validateMethodOverride(proto, name){
var specPolicy=ReactClassInterface.hasOwnProperty(name)?
ReactClassInterface[name]:
null;


if(ReactClassMixin.hasOwnProperty(name)){
invariant(
specPolicy === SpecPolicy.OVERRIDE_BASE, 
'ReactClassInterface: You are attempting to override ' + 
'`%s` from your class specification. Ensure that your method names ' + 
'do not overlap with React methods.', 
name);}




if(proto.hasOwnProperty(name)){
invariant(
specPolicy === SpecPolicy.DEFINE_MANY || 
specPolicy === SpecPolicy.DEFINE_MANY_MERGED, 
'ReactClassInterface: You are attempting to define ' + 
'`%s` on your component more than once. This conflict may be due ' + 
'to a mixin.', 
name);}}








function mixSpecIntoComponent(Constructor, spec){
if(!spec){
return;}


invariant(
typeof spec !== 'function', 
'ReactClass: You\'re attempting to ' + 
'use a component class as a mixin. Instead, just use a regular object.');

invariant(
!ReactElement.isValidElement(spec), 
'ReactClass: You\'re attempting to ' + 
'use a component as a mixin. Instead, just use a regular object.');


var proto=Constructor.prototype;




if(spec.hasOwnProperty(MIXINS_KEY)){
RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);}


for(var name in spec) {
if(!spec.hasOwnProperty(name)){
continue;}


if(name === MIXINS_KEY){

continue;}


var property=spec[name];
validateMethodOverride(proto, name);

if(RESERVED_SPEC_KEYS.hasOwnProperty(name)){
RESERVED_SPEC_KEYS[name](Constructor, property);}else 
{




var isReactClassMethod=
ReactClassInterface.hasOwnProperty(name);
var isAlreadyDefined=proto.hasOwnProperty(name);
var markedDontBind=property && property.__reactDontBind;
var isFunction=typeof property === 'function';
var shouldAutoBind=
isFunction && 
!isReactClassMethod && 
!isAlreadyDefined && 
!markedDontBind;

if(shouldAutoBind){
if(!proto.__reactAutoBindMap){
proto.__reactAutoBindMap = {};}

proto.__reactAutoBindMap[name] = property;
proto[name] = property;}else 
{
if(isAlreadyDefined){
var specPolicy=ReactClassInterface[name];


invariant(
isReactClassMethod && (
specPolicy === SpecPolicy.DEFINE_MANY_MERGED || 
specPolicy === SpecPolicy.DEFINE_MANY), 

'ReactClass: Unexpected spec policy %s for key %s ' + 
'when mixing in component specs.', 
specPolicy, 
name);




if(specPolicy === SpecPolicy.DEFINE_MANY_MERGED){
proto[name] = createMergedResultFunction(proto[name], property);}else 
if(specPolicy === SpecPolicy.DEFINE_MANY){
proto[name] = createChainedFunction(proto[name], property);}}else 

{
proto[name] = property;
if(__DEV__){


if(typeof property === 'function' && spec.displayName){
proto[name].displayName = spec.displayName + '_' + name;}}}}}}}








function mixStaticSpecIntoComponent(Constructor, statics){
if(!statics){
return;}

for(var name in statics) {
var property=statics[name];
if(!statics.hasOwnProperty(name)){
continue;}


var isReserved=(name in RESERVED_SPEC_KEYS);
invariant(
!isReserved, 
'ReactClass: You are attempting to define a reserved ' + 
'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' + 
'as an instance property instead; it will still be accessible on the ' + 
'constructor.', 
name);


var isInherited=(name in Constructor);
invariant(
!isInherited, 
'ReactClass: You are attempting to define ' + 
'`%s` on your component more than once. This conflict may be ' + 
'due to a mixin.', 
name);

Constructor[name] = property;}}










function mergeIntoWithNoDuplicateKeys(one, two){
invariant(
one && two && typeof one === 'object' && typeof two === 'object', 
'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.');


for(var key in two) {
if(two.hasOwnProperty(key)){
invariant(
one[key] === undefined, 
'mergeIntoWithNoDuplicateKeys(): ' + 
'Tried to merge two objects with the same key: `%s`. This conflict ' + 
'may be due to a mixin; in particular, this may be caused by two ' + 
'getInitialState() or getDefaultProps() methods returning objects ' + 
'with clashing keys.', 
key);

one[key] = two[key];}}


return one;}










function createMergedResultFunction(one, two){
return function mergedResult(){
var a=one.apply(this, arguments);
var b=two.apply(this, arguments);
if(a == null){
return b;}else 
if(b == null){
return a;}

var c={};
mergeIntoWithNoDuplicateKeys(c, a);
mergeIntoWithNoDuplicateKeys(c, b);
return c;};}











function createChainedFunction(one, two){
return function chainedFunction(){
one.apply(this, arguments);
two.apply(this, arguments);};}










function bindAutoBindMethod(component, method){
var boundMethod=method.bind(component);
if(__DEV__){
boundMethod.__reactBoundContext = component;
boundMethod.__reactBoundMethod = method;
boundMethod.__reactBoundArguments = null;
var componentName=component.constructor.displayName;
var _bind=boundMethod.bind;

boundMethod.bind = function(newThis){for(var _len=arguments.length, args=Array(_len > 1?_len - 1:0), _key=1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}



if(newThis !== component && newThis !== null){
warning(
false, 
'bind(): React component methods may only be bound to the ' + 
'component instance. See %s', 
componentName);}else 

if(!args.length){
warning(
false, 
'bind(): You are binding a component method to the component. ' + 
'React does this for you automatically in a high-performance ' + 
'way, so you can safely remove this call. See %s', 
componentName);

return boundMethod;}

var reboundMethod=_bind.apply(boundMethod, arguments);
reboundMethod.__reactBoundContext = component;
reboundMethod.__reactBoundMethod = method;
reboundMethod.__reactBoundArguments = args;
return reboundMethod;};}



return boundMethod;}







function bindAutoBindMethods(component){
for(var autoBindKey in component.__reactAutoBindMap) {
if(component.__reactAutoBindMap.hasOwnProperty(autoBindKey)){
var method=component.__reactAutoBindMap[autoBindKey];
component[autoBindKey] = bindAutoBindMethod(
component, 
ReactErrorUtils.guard(
method, 
component.constructor.displayName + '.' + autoBindKey));}}}






var typeDeprecationDescriptor={
enumerable:false, 
get:function(){
var displayName=this.displayName || this.name || 'Component';
warning(
false, 
'%s.type is deprecated. Use %s directly to access the class.', 
displayName, 
displayName);

Object.defineProperty(this, 'type', {
value:this});

return this;}};







var ReactClassMixin={





replaceState:function(newState, callback){
ReactUpdateQueue.enqueueReplaceState(this, newState);
if(callback){
ReactUpdateQueue.enqueueCallback(this, callback);}}, 









isMounted:function(){
if(__DEV__){
var owner=ReactCurrentOwner.current;
if(owner !== null){
warning(
owner._warnedAboutRefsInRender, 
'%s is accessing isMounted inside its render() function. ' + 
'render() should be a pure function of props and state. It should ' + 
'never access something that requires stale data from the previous ' + 
'render, such as refs. Move this logic to componentDidMount and ' + 
'componentDidUpdate instead.', 
owner.getName() || 'A component');

owner._warnedAboutRefsInRender = true;}}


var internalInstance=ReactInstanceMap.get(this);
return (
internalInstance && 
internalInstance !== ReactLifeCycle.currentlyMountingInstance);}, 












setProps:function(partialProps, callback){
ReactUpdateQueue.enqueueSetProps(this, partialProps);
if(callback){
ReactUpdateQueue.enqueueCallback(this, callback);}}, 












replaceProps:function(newProps, callback){
ReactUpdateQueue.enqueueReplaceProps(this, newProps);
if(callback){
ReactUpdateQueue.enqueueCallback(this, callback);}}};




var ReactClassComponent=function(){};
assign(
ReactClassComponent.prototype, 
ReactComponent.prototype, 
ReactClassMixin);







var ReactClass={








createClass:function(spec){
var Constructor=function(props, context){



if(__DEV__){
warning(
this instanceof Constructor, 
'Something is calling a React component directly. Use a factory or ' + 
'JSX instead. See: http://fb.me/react-legacyfactory');}




if(this.__reactAutoBindMap){
bindAutoBindMethods(this);}


this.props = props;
this.context = context;
this.state = null;




var initialState=this.getInitialState?this.getInitialState():null;
if(__DEV__){

if(typeof initialState === 'undefined' && 
this.getInitialState._isMockFunction){


initialState = null;}}


invariant(
typeof initialState === 'object' && !Array.isArray(initialState), 
'%s.getInitialState(): must return an object or null', 
Constructor.displayName || 'ReactCompositeComponent');


this.state = initialState;};

Constructor.prototype = new ReactClassComponent();
Constructor.prototype.constructor = Constructor;

injectedMixins.forEach(
mixSpecIntoComponent.bind(null, Constructor));


mixSpecIntoComponent(Constructor, spec);


if(Constructor.getDefaultProps){
Constructor.defaultProps = Constructor.getDefaultProps();}


if(__DEV__){




if(Constructor.getDefaultProps){
Constructor.getDefaultProps.isReactClassApproved = {};}

if(Constructor.prototype.getInitialState){
Constructor.prototype.getInitialState.isReactClassApproved = {};}}



invariant(
Constructor.prototype.render, 
'createClass(...): Class specification must implement a `render` method.');


if(__DEV__){
warning(
!Constructor.prototype.componentShouldUpdate, 
'%s has a method called ' + 
'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 
'The name is phrased as a question because the function is ' + 
'expected to return a value.', 
spec.displayName || 'A component');}




for(var methodName in ReactClassInterface) {
if(!Constructor.prototype[methodName]){
Constructor.prototype[methodName] = null;}}




Constructor.type = Constructor;
if(__DEV__){
try{
Object.defineProperty(Constructor, 'type', typeDeprecationDescriptor);}
catch(x) {}}




return Constructor;}, 


injection:{
injectMixin:function(mixin){
injectedMixins.push(mixin);}}};





module.exports = ReactClass;});
__d('ReactComponent',["ReactUpdateQueue","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactUpdateQueue=require('ReactUpdateQueue');

var invariant=require('invariant');
var warning=require('warning');




function ReactComponent(props, context){
this.props = props;
this.context = context;}



























ReactComponent.prototype.setState = function(partialState, callback){
invariant(
typeof partialState === 'object' || 
typeof partialState === 'function' || 
partialState == null, 
'setState(...): takes an object of state variables to update or a ' + 
'function which returns an object of state variables.');

if(__DEV__){
warning(
partialState != null, 
'setState(...): You passed an undefined or null state object; ' + 
'instead, use forceUpdate().');}


ReactUpdateQueue.enqueueSetState(this, partialState);
if(callback){
ReactUpdateQueue.enqueueCallback(this, callback);}};

















ReactComponent.prototype.forceUpdate = function(callback){
ReactUpdateQueue.enqueueForceUpdate(this);
if(callback){
ReactUpdateQueue.enqueueCallback(this, callback);}};








if(__DEV__){
var deprecatedAPIs={
getDOMNode:'getDOMNode', 
isMounted:'isMounted', 
replaceProps:'replaceProps', 
replaceState:'replaceState', 
setProps:'setProps'};

var defineDeprecationWarning=function(methodName, displayName){
try{
Object.defineProperty(ReactComponent.prototype, methodName, {
get:function(){
warning(
false, 
'%s(...) is deprecated in plain JavaScript React classes.', 
displayName);

return undefined;}});}


catch(x) {}};



for(var fnName in deprecatedAPIs) {
if(deprecatedAPIs.hasOwnProperty(fnName)){
defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);}}}




module.exports = ReactComponent;});
__d('ReactUpdateQueue',["ReactLifeCycle","ReactCurrentOwner","ReactElement","ReactInstanceMap","ReactUpdates","Object.assign","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactLifeCycle=require('ReactLifeCycle');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactElement=require('ReactElement');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactUpdates=require('ReactUpdates');

var assign=require('Object.assign');
var invariant=require('invariant');
var warning=require('warning');

function enqueueUpdate(internalInstance){
if(internalInstance !== ReactLifeCycle.currentlyMountingInstance){




ReactUpdates.enqueueUpdate(internalInstance);}}



function getInternalInstanceReadyForUpdate(publicInstance, callerName){
invariant(
ReactCurrentOwner.current == null, 
'%s(...): Cannot update during an existing state transition ' + 
'(such as within `render`). Render methods should be a pure function ' + 
'of props and state.', 
callerName);


var internalInstance=ReactInstanceMap.get(publicInstance);
if(!internalInstance){
if(__DEV__){



warning(
!callerName, 
'%s(...): Can only update a mounted or mounting component. ' + 
'This usually means you called %s() on an unmounted ' + 
'component. This is a no-op.', 
callerName, 
callerName);}


return null;}


if(internalInstance === ReactLifeCycle.currentlyUnmountingInstance){
return null;}


return internalInstance;}






var ReactUpdateQueue={









enqueueCallback:function(publicInstance, callback){
invariant(
typeof callback === 'function', 
'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + 
'`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 
'isn\'t callable.');

var internalInstance=getInternalInstanceReadyForUpdate(publicInstance);






if(!internalInstance || 
internalInstance === ReactLifeCycle.currentlyMountingInstance){
return null;}


if(internalInstance._pendingCallbacks){
internalInstance._pendingCallbacks.push(callback);}else 
{
internalInstance._pendingCallbacks = [callback];}





enqueueUpdate(internalInstance);}, 


enqueueCallbackInternal:function(internalInstance, callback){
invariant(
typeof callback === 'function', 
'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + 
'`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 
'isn\'t callable.');

if(internalInstance._pendingCallbacks){
internalInstance._pendingCallbacks.push(callback);}else 
{
internalInstance._pendingCallbacks = [callback];}

enqueueUpdate(internalInstance);}, 















enqueueForceUpdate:function(publicInstance){
var internalInstance=getInternalInstanceReadyForUpdate(
publicInstance, 
'forceUpdate');


if(!internalInstance){
return;}


internalInstance._pendingForceUpdate = true;

enqueueUpdate(internalInstance);}, 













enqueueReplaceState:function(publicInstance, completeState){
var internalInstance=getInternalInstanceReadyForUpdate(
publicInstance, 
'replaceState');


if(!internalInstance){
return;}


internalInstance._pendingStateQueue = [completeState];
internalInstance._pendingReplaceState = true;

enqueueUpdate(internalInstance);}, 












enqueueSetState:function(publicInstance, partialState){
var internalInstance=getInternalInstanceReadyForUpdate(
publicInstance, 
'setState');


if(!internalInstance){
return;}


var queue=
internalInstance._pendingStateQueue || (
internalInstance._pendingStateQueue = []);
queue.push(partialState);

enqueueUpdate(internalInstance);}, 









enqueueSetProps:function(publicInstance, partialProps){
var internalInstance=getInternalInstanceReadyForUpdate(
publicInstance, 
'setProps');


if(!internalInstance){
return;}


invariant(
internalInstance._isTopLevel, 
'setProps(...): You called `setProps` on a ' + 
'component with a parent. This is an anti-pattern since props will ' + 
'get reactively updated when rendered. Instead, change the owner\'s ' + 
'`render` method to pass the correct value as props to the component ' + 
'where it is created.');




var element=internalInstance._pendingElement || 
internalInstance._currentElement;
var props=assign({}, element.props, partialProps);
internalInstance._pendingElement = ReactElement.cloneAndReplaceProps(
element, 
props);


enqueueUpdate(internalInstance);}, 









enqueueReplaceProps:function(publicInstance, props){
var internalInstance=getInternalInstanceReadyForUpdate(
publicInstance, 
'replaceProps');


if(!internalInstance){
return;}


invariant(
internalInstance._isTopLevel, 
'replaceProps(...): You called `replaceProps` on a ' + 
'component with a parent. This is an anti-pattern since props will ' + 
'get reactively updated when rendered. Instead, change the owner\'s ' + 
'`render` method to pass the correct value as props to the component ' + 
'where it is created.');




var element=internalInstance._pendingElement || 
internalInstance._currentElement;
internalInstance._pendingElement = ReactElement.cloneAndReplaceProps(
element, 
props);


enqueueUpdate(internalInstance);}, 


enqueueElementInternal:function(internalInstance, newElement){
internalInstance._pendingElement = newElement;
enqueueUpdate(internalInstance);}};




module.exports = ReactUpdateQueue;});
__d('ReactLifeCycle',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




























var ReactLifeCycle={
currentlyMountingInstance:null, 
currentlyUnmountingInstance:null};


module.exports = ReactLifeCycle;});
__d('ReactInstanceMap',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




















var ReactInstanceMap={






remove:function(key){
key._reactInternalInstance = undefined;}, 


get:function(key){
return key._reactInternalInstance;}, 


has:function(key){
return key._reactInternalInstance !== undefined;}, 


set:function(key, value){
key._reactInternalInstance = value;}};




module.exports = ReactInstanceMap;});
__d('ReactUpdates',["CallbackQueue","PooledClass","ReactCurrentOwner","ReactPerf","ReactReconciler","Transaction","Object.assign","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var CallbackQueue=require('CallbackQueue');
var PooledClass=require('PooledClass');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactPerf=require('ReactPerf');
var ReactReconciler=require('ReactReconciler');
var Transaction=require('Transaction');

var assign=require('Object.assign');
var invariant=require('invariant');
var warning=require('warning');

var dirtyComponents=[];
var asapCallbackQueue=CallbackQueue.getPooled();
var asapEnqueued=false;

var batchingStrategy=null;

function ensureInjected(){
invariant(
ReactUpdates.ReactReconcileTransaction && batchingStrategy, 
'ReactUpdates: must inject a reconcile transaction class and batching ' + 
'strategy');}



var NESTED_UPDATES={
initialize:function(){
this.dirtyComponentsLength = dirtyComponents.length;}, 

close:function(){
if(this.dirtyComponentsLength !== dirtyComponents.length){





dirtyComponents.splice(0, this.dirtyComponentsLength);
flushBatchedUpdates();}else 
{
dirtyComponents.length = 0;}}};




var UPDATE_QUEUEING={
initialize:function(){
this.callbackQueue.reset();}, 

close:function(){
this.callbackQueue.notifyAll();}};



var TRANSACTION_WRAPPERS=[NESTED_UPDATES, UPDATE_QUEUEING];

function ReactUpdatesFlushTransaction(){
this.reinitializeTransaction();
this.dirtyComponentsLength = null;
this.callbackQueue = CallbackQueue.getPooled();
this.reconcileTransaction = 
ReactUpdates.ReactReconcileTransaction.getPooled();}


assign(
ReactUpdatesFlushTransaction.prototype, 
Transaction.Mixin, {
getTransactionWrappers:function(){
return TRANSACTION_WRAPPERS;}, 


destructor:function(){
this.dirtyComponentsLength = null;
CallbackQueue.release(this.callbackQueue);
this.callbackQueue = null;
ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
this.reconcileTransaction = null;}, 


perform:function(method, scope, a){


return Transaction.Mixin.perform.call(
this, 
this.reconcileTransaction.perform, 
this.reconcileTransaction, 
method, 
scope, 
a);}});




PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);

function batchedUpdates(callback, a, b, c, d){
ensureInjected();
batchingStrategy.batchedUpdates(callback, a, b, c, d);}









function mountOrderComparator(c1, c2){
return c1._mountOrder - c2._mountOrder;}


function runBatchedUpdates(transaction){
var len=transaction.dirtyComponentsLength;
invariant(
len === dirtyComponents.length, 
'Expected flush transaction\'s stored dirty-components length (%s) to ' + 
'match dirty-components array length (%s).', 
len, 
dirtyComponents.length);





dirtyComponents.sort(mountOrderComparator);

for(var i=0; i < len; i++) {



var component=dirtyComponents[i];




var callbacks=component._pendingCallbacks;
component._pendingCallbacks = null;

ReactReconciler.performUpdateIfNecessary(
component, 
transaction.reconcileTransaction);


if(callbacks){
for(var j=0; j < callbacks.length; j++) {
transaction.callbackQueue.enqueue(
callbacks[j], 
component.getPublicInstance());}}}}






var flushBatchedUpdates=function(){




while(dirtyComponents.length || asapEnqueued) {
if(dirtyComponents.length){
var transaction=ReactUpdatesFlushTransaction.getPooled();
transaction.perform(runBatchedUpdates, null, transaction);
ReactUpdatesFlushTransaction.release(transaction);}


if(asapEnqueued){
asapEnqueued = false;
var queue=asapCallbackQueue;
asapCallbackQueue = CallbackQueue.getPooled();
queue.notifyAll();
CallbackQueue.release(queue);}}};



flushBatchedUpdates = ReactPerf.measure(
'ReactUpdates', 
'flushBatchedUpdates', 
flushBatchedUpdates);






function enqueueUpdate(component){
ensureInjected();






warning(
ReactCurrentOwner.current == null, 
'enqueueUpdate(): Render methods should be a pure function of props ' + 
'and state; triggering nested component updates from render is not ' + 
'allowed. If necessary, trigger nested updates in ' + 
'componentDidUpdate.');


if(!batchingStrategy.isBatchingUpdates){
batchingStrategy.batchedUpdates(enqueueUpdate, component);
return;}


dirtyComponents.push(component);}






function asap(callback, context){
invariant(
batchingStrategy.isBatchingUpdates, 
'ReactUpdates.asap: Can\'t enqueue an asap callback in a context where' + 
'updates are not being batched.');

asapCallbackQueue.enqueue(callback, context);
asapEnqueued = true;}


var ReactUpdatesInjection={
injectReconcileTransaction:function(ReconcileTransaction){
invariant(
ReconcileTransaction, 
'ReactUpdates: must provide a reconcile transaction class');

ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;}, 


injectBatchingStrategy:function(_batchingStrategy){
invariant(
_batchingStrategy, 
'ReactUpdates: must provide a batching strategy');

invariant(
typeof _batchingStrategy.batchedUpdates === 'function', 
'ReactUpdates: must provide a batchedUpdates() function');

invariant(
typeof _batchingStrategy.isBatchingUpdates === 'boolean', 
'ReactUpdates: must provide an isBatchingUpdates boolean attribute');

batchingStrategy = _batchingStrategy;}};



var ReactUpdates={






ReactReconcileTransaction:null, 

batchedUpdates:batchedUpdates, 
enqueueUpdate:enqueueUpdate, 
flushBatchedUpdates:flushBatchedUpdates, 
injection:ReactUpdatesInjection, 
asap:asap};


module.exports = ReactUpdates;});
__d('CallbackQueue',["PooledClass","Object.assign","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var PooledClass=require('PooledClass');

var assign=require('Object.assign');
var invariant=require('invariant');












function CallbackQueue(){
this._callbacks = null;
this._contexts = null;}


assign(CallbackQueue.prototype, {








enqueue:function(callback, context){
this._callbacks = this._callbacks || [];
this._contexts = this._contexts || [];
this._callbacks.push(callback);
this._contexts.push(context);}, 








notifyAll:function(){
var callbacks=this._callbacks;
var contexts=this._contexts;
if(callbacks){
invariant(
callbacks.length === contexts.length, 
'Mismatched list of contexts in callback queue');

this._callbacks = null;
this._contexts = null;
for(var i=0, l=callbacks.length; i < l; i++) {
callbacks[i].call(contexts[i]);}

callbacks.length = 0;
contexts.length = 0;}}, 








reset:function(){
this._callbacks = null;
this._contexts = null;}, 





destructor:function(){
this.reset();}});




PooledClass.addPoolingTo(CallbackQueue);

module.exports = CallbackQueue;});
__d('ReactPerf',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var ReactPerf={




enableMeasure:false, 





storedMeasure:_noMeasure, 






measureMethods:function(object, objectName, methodNames){
if(__DEV__){
for(var key in methodNames) {
if(!methodNames.hasOwnProperty(key)){
continue;}

object[key] = ReactPerf.measure(
objectName, 
methodNames[key], 
object[key]);}}}, 













measure:function(objName, fnName, func){
if(__DEV__){
var measuredFunc=null;
var wrapper=function(){
if(ReactPerf.enableMeasure){
if(!measuredFunc){
measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);}

return measuredFunc.apply(this, arguments);}

return func.apply(this, arguments);};

wrapper.displayName = objName + '_' + fnName;
return wrapper;}

return func;}, 


injection:{



injectMeasure:function(measure){
ReactPerf.storedMeasure = measure;}}};












function _noMeasure(objName, fnName, func){
return func;}


module.exports = ReactPerf;});
__d('ReactReconciler',["ReactRef","ReactElementValidator"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactRef=require('ReactRef');
var ReactElementValidator=require('ReactElementValidator');





function attachRefs(){
ReactRef.attachRefs(this, this._currentElement);}


var ReactReconciler={











mountComponent:function(internalInstance, rootID, transaction, context){
var markup=internalInstance.mountComponent(rootID, transaction, context);
if(__DEV__){
ReactElementValidator.checkAndWarnForMutatedProps(
internalInstance._currentElement);}


transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
return markup;}, 








unmountComponent:function(internalInstance){
ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
internalInstance.unmountComponent();}, 











receiveComponent:function(
internalInstance, nextElement, transaction, context)
{
var prevElement=internalInstance._currentElement;

if(nextElement === prevElement && nextElement._owner != null){







return;}


if(__DEV__){
ReactElementValidator.checkAndWarnForMutatedProps(nextElement);}


var refsChanged=ReactRef.shouldUpdateRefs(
prevElement, 
nextElement);


if(refsChanged){
ReactRef.detachRefs(internalInstance, prevElement);}


internalInstance.receiveComponent(nextElement, transaction, context);

if(refsChanged){
transaction.getReactMountReady().enqueue(attachRefs, internalInstance);}}, 










performUpdateIfNecessary:function(
internalInstance, 
transaction)
{
internalInstance.performUpdateIfNecessary(transaction);}};




module.exports = ReactReconciler;});
__d('ReactRef',["ReactOwner"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactOwner=require('ReactOwner');

var ReactRef={};

function attachRef(ref, component, owner){
if(typeof ref === 'function'){
ref(component.getPublicInstance());}else 
{

ReactOwner.addComponentAsRefTo(component, ref, owner);}}



function detachRef(ref, component, owner){
if(typeof ref === 'function'){
ref(null);}else 
{

ReactOwner.removeComponentAsRefFrom(component, ref, owner);}}



ReactRef.attachRefs = function(instance, element){
var ref=element.ref;
if(ref != null){
attachRef(ref, instance, element._owner);}};



ReactRef.shouldUpdateRefs = function(prevElement, nextElement){












return (
nextElement._owner !== prevElement._owner || 
nextElement.ref !== prevElement.ref);};



ReactRef.detachRefs = function(instance, element){
var ref=element.ref;
if(ref != null){
detachRef(ref, instance, element._owner);}};



module.exports = ReactRef;});
__d('ReactOwner',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');































var ReactOwner={






isValidOwner:function(object){
return !!(
object && 
typeof object.attachRef === 'function' && 
typeof object.detachRef === 'function');}, 












addComponentAsRefTo:function(component, ref, owner){
invariant(
ReactOwner.isValidOwner(owner), 
'addComponentAsRefTo(...): Only a ReactOwner can have refs. This ' + 
'usually means that you\'re trying to add a ref to a component that ' + 
'doesn\'t have an owner (that is, was not created inside of another ' + 
'component\'s `render` method). Try rendering this component inside of ' + 
'a new top-level component which will hold the ref.');

owner.attachRef(ref, component);}, 











removeComponentAsRefFrom:function(component, ref, owner){
invariant(
ReactOwner.isValidOwner(owner), 
'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. This ' + 
'usually means that you\'re trying to remove a ref to a component that ' + 
'doesn\'t have an owner (that is, was not created inside of another ' + 
'component\'s `render` method). Try rendering this component inside of ' + 
'a new top-level component which will hold the ref.');



if(owner.getPublicInstance().refs[ref] === component.getPublicInstance()){
owner.detachRef(ref);}}};





module.exports = ReactOwner;});
__d('ReactElementValidator',["ReactElement","ReactFragment","ReactPropTypeLocations","ReactPropTypeLocationNames","ReactCurrentOwner","ReactNativeComponent","getIteratorFn","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



















var ReactElement=require('ReactElement');
var ReactFragment=require('ReactFragment');
var ReactPropTypeLocations=require('ReactPropTypeLocations');
var ReactPropTypeLocationNames=require('ReactPropTypeLocationNames');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactNativeComponent=require('ReactNativeComponent');

var getIteratorFn=require('getIteratorFn');
var invariant=require('invariant');
var warning=require('warning');

function getDeclarationErrorAddendum(){
if(ReactCurrentOwner.current){
var name=ReactCurrentOwner.current.getName();
if(name){
return ' Check the render method of `' + name + '`.';}}


return '';}







var ownerHasKeyUseWarning={};

var loggedTypeFailures={};

var NUMERIC_PROPERTY_REGEX=/^\d+$/;







function getName(instance){
var publicInstance=instance && instance.getPublicInstance();
if(!publicInstance){
return undefined;}

var constructor=publicInstance.constructor;
if(!constructor){
return undefined;}

return constructor.displayName || constructor.name || undefined;}








function getCurrentOwnerDisplayName(){
var current=ReactCurrentOwner.current;
return (
current && getName(current) || undefined);}













function validateExplicitKey(element, parentType){
if(element._store.validated || element.key != null){
return;}

element._store.validated = true;

warnAndMonitorForKeyUse(
'Each child in an array or iterator should have a unique "key" prop.', 
element, 
parentType);}












function validatePropertyKey(name, element, parentType){
if(!NUMERIC_PROPERTY_REGEX.test(name)){
return;}

warnAndMonitorForKeyUse(
'Child objects should have non-numeric keys so ordering is preserved.', 
element, 
parentType);}











function warnAndMonitorForKeyUse(message, element, parentType){
var ownerName=getCurrentOwnerDisplayName();
var parentName=typeof parentType === 'string'?
parentType:parentType.displayName || parentType.name;

var useName=ownerName || parentName;
var memoizer=ownerHasKeyUseWarning[message] || (
ownerHasKeyUseWarning[message] = {});

if(memoizer.hasOwnProperty(useName)){
return;}

memoizer[useName] = true;

var parentOrOwnerAddendum=
ownerName?' Check the render method of ' + ownerName + '.':
parentName?' Check the React.render call using <' + parentName + '>.':
'';




var childOwnerAddendum='';
if(element && 
element._owner && 
element._owner !== ReactCurrentOwner.current){

var childOwnerName=getName(element._owner);

childOwnerAddendum = ' It was passed a child from ' + childOwnerName + '.';}


warning(
false, 
message + '%s%s See http://fb.me/react-warning-keys for more information.', 
parentOrOwnerAddendum, 
childOwnerAddendum);}












function validateChildKeys(node, parentType){
if(Array.isArray(node)){
for(var i=0; i < node.length; i++) {
var child=node[i];
if(ReactElement.isValidElement(child)){
validateExplicitKey(child, parentType);}}}else 


if(ReactElement.isValidElement(node)){

node._store.validated = true;}else 
if(node){
var iteratorFn=getIteratorFn(node);

if(iteratorFn){
if(iteratorFn !== node.entries){
var iterator=iteratorFn.call(node);
var step;
while(!(step = iterator.next()).done) {
if(ReactElement.isValidElement(step.value)){
validateExplicitKey(step.value, parentType);}}}}else 



if(typeof node === 'object'){
var fragment=ReactFragment.extractIfFragment(node);
for(var key in fragment) {
if(fragment.hasOwnProperty(key)){
validatePropertyKey(key, fragment[key], parentType);}}}}}















function checkPropTypes(componentName, propTypes, props, location){
for(var propName in propTypes) {
if(propTypes.hasOwnProperty(propName)){
var error;



try{


invariant(
typeof propTypes[propName] === 'function', 
'%s: %s type `%s` is invalid; it must be a function, usually from ' + 
'React.PropTypes.', 
componentName || 'React class', 
ReactPropTypeLocationNames[location], 
propName);

error = propTypes[propName](props, propName, componentName, location);}
catch(ex) {
error = ex;}

if(error instanceof Error && !(error.message in loggedTypeFailures)){


loggedTypeFailures[error.message] = true;

var addendum=getDeclarationErrorAddendum(this);
warning(false, 'Failed propType: %s%s', error.message, addendum);}}}}





var warnedPropsMutations={};







function warnForPropsMutation(propName, element){
var type=element.type;
var elementName=typeof type === 'string'?type:type.displayName;
var ownerName=element._owner?
element._owner.getPublicInstance().constructor.displayName:null;

var warningKey=propName + '|' + elementName + '|' + ownerName;
if(warnedPropsMutations.hasOwnProperty(warningKey)){
return;}

warnedPropsMutations[warningKey] = true;

var elementInfo='';
if(elementName){
elementInfo = ' <' + elementName + ' />';}

var ownerInfo='';
if(ownerName){
ownerInfo = ' The element was created by ' + ownerName + '.';}


warning(
false, 
'Don\'t set .props.%s of the React component%s. Instead, specify the ' + 
'correct value when initially creating the element or use ' + 
'React.cloneElement to make a new element with updated props.%s', 
propName, 
elementInfo, 
ownerInfo);}




function is(a, b){
if(a !== a){

return b !== b;}

if(a === 0 && b === 0){

return 1 / a === 1 / b;}

return a === b;}










function checkAndWarnForMutatedProps(element){
if(!element._store){


return;}


var originalProps=element._store.originalProps;
var props=element.props;

for(var propName in props) {
if(props.hasOwnProperty(propName)){
if(!originalProps.hasOwnProperty(propName) || 
!is(originalProps[propName], props[propName])){
warnForPropsMutation(propName, element);


originalProps[propName] = props[propName];}}}}











function validatePropTypes(element){
if(element.type == null){

return;}





var componentClass=ReactNativeComponent.getComponentClassForElement(
element);

var name=componentClass.displayName || componentClass.name;
if(componentClass.propTypes){
checkPropTypes(
name, 
componentClass.propTypes, 
element.props, 
ReactPropTypeLocations.prop);}


if(typeof componentClass.getDefaultProps === 'function'){
warning(
componentClass.getDefaultProps.isReactClassApproved, 
'getDefaultProps is only used on classic React.createClass ' + 
'definitions. Use a static property named `defaultProps` instead.');}}




var ReactElementValidator={

checkAndWarnForMutatedProps:checkAndWarnForMutatedProps, 

createElement:function(type, props, children){


warning(
type != null, 
'React.createElement: type should not be null or undefined. It should ' + 
'be a string (for DOM elements) or a ReactClass (for composite ' + 
'components).');


var element=ReactElement.createElement.apply(this, arguments);



if(element == null){
return element;}


for(var i=2; i < arguments.length; i++) {
validateChildKeys(arguments[i], type);}


validatePropTypes(element);

return element;}, 


createFactory:function(type){
var validatedFactory=ReactElementValidator.createElement.bind(
null, 
type);


validatedFactory.type = type;

if(__DEV__){
try{
Object.defineProperty(
validatedFactory, 
'type', 
{
enumerable:false, 
get:function(){
warning(
false, 
'Factory.type is deprecated. Access the class directly ' + 
'before passing it to createFactory.');

Object.defineProperty(this, 'type', {
value:type});

return type;}});}



catch(x) {}}





return validatedFactory;}, 


cloneElement:function(element, props, children){
var newElement=ReactElement.cloneElement.apply(this, arguments);
for(var i=2; i < arguments.length; i++) {
validateChildKeys(arguments[i], newElement.type);}

validatePropTypes(newElement);
return newElement;}};




module.exports = ReactElementValidator;});
__d('ReactPropTypeLocations',["keyMirror"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var keyMirror=require('keyMirror');

var ReactPropTypeLocations=keyMirror({
prop:null, 
context:null, 
childContext:null});


module.exports = ReactPropTypeLocations;});
__d('keyMirror',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var invariant=require('invariant');



















var keyMirror=function(obj){
var ret={};
var key;
invariant(
obj instanceof Object && !Array.isArray(obj), 
'keyMirror(...): Argument must be an object.');

for(key in obj) {
if(!obj.hasOwnProperty(key)){
continue;}

ret[key] = key;}

return ret;};


module.exports = keyMirror;});
__d('ReactPropTypeLocationNames',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactPropTypeLocationNames={};

if(__DEV__){
ReactPropTypeLocationNames = {
prop:'prop', 
context:'context', 
childContext:'child context'};}



module.exports = ReactPropTypeLocationNames;});
__d('ReactNativeComponent',["Object.assign","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var assign=require('Object.assign');
var invariant=require('invariant');

var autoGenerateWrapperClass=null;
var genericComponentClass=null;

var tagToComponentClass={};
var textComponentClass=null;

var ReactNativeComponentInjection={


injectGenericComponentClass:function(componentClass){
genericComponentClass = componentClass;}, 



injectTextComponentClass:function(componentClass){
textComponentClass = componentClass;}, 



injectComponentClasses:function(componentClasses){
assign(tagToComponentClass, componentClasses);}, 



injectAutoWrapper:function(wrapperFactory){
autoGenerateWrapperClass = wrapperFactory;}};









function getComponentClassForElement(element){
if(typeof element.type === 'function'){
return element.type;}

var tag=element.type;
var componentClass=tagToComponentClass[tag];
if(componentClass == null){
tagToComponentClass[tag] = componentClass = autoGenerateWrapperClass(tag);}

return componentClass;}








function createInternalComponent(element){
invariant(
genericComponentClass, 
'There is no registered component for the tag %s', 
element.type);

return new genericComponentClass(element.type, element.props);}






function createInstanceForText(text){
return new textComponentClass(text);}






function isTextComponent(component){
return component instanceof textComponentClass;}


var ReactNativeComponent={
getComponentClassForElement:getComponentClassForElement, 
createInternalComponent:createInternalComponent, 
createInstanceForText:createInstanceForText, 
isTextComponent:isTextComponent, 
injection:ReactNativeComponentInjection};


module.exports = ReactNativeComponent;});
__d('Transaction',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');






























































var Mixin={







reinitializeTransaction:function(){
this.transactionWrappers = this.getTransactionWrappers();
if(!this.wrapperInitData){
this.wrapperInitData = [];}else 
{
this.wrapperInitData.length = 0;}

this._isInTransaction = false;}, 


_isInTransaction:false, 





getTransactionWrappers:null, 

isInTransaction:function(){
return !!this._isInTransaction;}, 













perform:function(method, scope, a, b, c, d, e, f){
invariant(
!this.isInTransaction(), 
'Transaction.perform(...): Cannot initialize a transaction when there ' + 
'is already an outstanding transaction.');

var errorThrown;
var ret;
try{
this._isInTransaction = true;




errorThrown = true;
this.initializeAll(0);
ret = method.call(scope, a, b, c, d, e, f);
errorThrown = false;}finally 
{
try{
if(errorThrown){


try{
this.closeAll(0);}
catch(err) {}}else 

{


this.closeAll(0);}}finally 

{
this._isInTransaction = false;}}


return ret;}, 


initializeAll:function(startIndex){
var transactionWrappers=this.transactionWrappers;
for(var i=startIndex; i < transactionWrappers.length; i++) {
var wrapper=transactionWrappers[i];
try{




this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
this.wrapperInitData[i] = wrapper.initialize?
wrapper.initialize.call(this):
null;}finally 
{
if(this.wrapperInitData[i] === Transaction.OBSERVED_ERROR){



try{
this.initializeAll(i + 1);}
catch(err) {}}}}}, 












closeAll:function(startIndex){
invariant(
this.isInTransaction(), 
'Transaction.closeAll(): Cannot close transaction when none are open.');

var transactionWrappers=this.transactionWrappers;
for(var i=startIndex; i < transactionWrappers.length; i++) {
var wrapper=transactionWrappers[i];
var initData=this.wrapperInitData[i];
var errorThrown;
try{




errorThrown = true;
if(initData !== Transaction.OBSERVED_ERROR && wrapper.close){
wrapper.close.call(this, initData);}

errorThrown = false;}finally 
{
if(errorThrown){



try{
this.closeAll(i + 1);}
catch(e) {}}}}




this.wrapperInitData.length = 0;}};



var Transaction={

Mixin:Mixin, 




OBSERVED_ERROR:{}};



module.exports = Transaction;});
__d('ReactErrorUtils',[],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";













var ReactErrorUtils={









guard:function(func, name){
return func;}};



module.exports = ReactErrorUtils;});
__d('keyOf',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var 




















keyOf=function(oneKeyObj){
var key;
for(key in oneKeyObj) {
if(!oneKeyObj.hasOwnProperty(key)){
continue;}

return key;}

return null;};



module.exports = keyOf;});
__d('ReactNativeDefaultInjection',["InitializeJavaScriptAppEngine","EventPluginHub","EventPluginUtils","IOSDefaultEventPluginOrder","IOSNativeBridgeEventPlugin","NodeHandle","ReactComponentEnvironment","ReactDefaultBatchingStrategy","ReactEmptyComponent","ReactInstanceHandles","ReactNativeComponentEnvironment","ReactNativeGlobalInteractionHandler","ReactNativeGlobalResponderHandler","ReactNativeMount","ReactNativeTextComponent","ReactNativeComponent","ReactUpdates","ResponderEventPlugin","UniversalWorkerNodeHandle","createReactNativeComponentClass","invariant","RCTEventEmitter","RCTLog","RCTJSTimers"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';















require('InitializeJavaScriptAppEngine');
var EventPluginHub=require('EventPluginHub');
var EventPluginUtils=require('EventPluginUtils');
var IOSDefaultEventPluginOrder=require('IOSDefaultEventPluginOrder');
var IOSNativeBridgeEventPlugin=require('IOSNativeBridgeEventPlugin');
var NodeHandle=require('NodeHandle');
var ReactComponentEnvironment=require('ReactComponentEnvironment');
var ReactDefaultBatchingStrategy=require('ReactDefaultBatchingStrategy');
var ReactEmptyComponent=require('ReactEmptyComponent');
var ReactInstanceHandles=require('ReactInstanceHandles');
var ReactNativeComponentEnvironment=require('ReactNativeComponentEnvironment');
var ReactNativeGlobalInteractionHandler=require('ReactNativeGlobalInteractionHandler');
var ReactNativeGlobalResponderHandler=require('ReactNativeGlobalResponderHandler');
var ReactNativeMount=require('ReactNativeMount');
var ReactNativeTextComponent=require('ReactNativeTextComponent');
var ReactNativeComponent=require('ReactNativeComponent');
var ReactUpdates=require('ReactUpdates');
var ResponderEventPlugin=require('ResponderEventPlugin');
var UniversalWorkerNodeHandle=require('UniversalWorkerNodeHandle');

var createReactNativeComponentClass=require('createReactNativeComponentClass');
var invariant=require('invariant');


require('RCTEventEmitter');
require('RCTLog');
require('RCTJSTimers');

function inject(){



EventPluginHub.injection.injectEventPluginOrder(IOSDefaultEventPluginOrder);
EventPluginHub.injection.injectInstanceHandle(ReactInstanceHandles);

ResponderEventPlugin.injection.injectGlobalResponderHandler(
ReactNativeGlobalResponderHandler);


ResponderEventPlugin.injection.injectGlobalInteractionHandler(
ReactNativeGlobalInteractionHandler);






EventPluginHub.injection.injectEventPluginsByName({
'ResponderEventPlugin':ResponderEventPlugin, 
'IOSNativeBridgeEventPlugin':IOSNativeBridgeEventPlugin});


ReactUpdates.injection.injectReconcileTransaction(
ReactNativeComponentEnvironment.ReactReconcileTransaction);


ReactUpdates.injection.injectBatchingStrategy(
ReactDefaultBatchingStrategy);


ReactComponentEnvironment.injection.injectEnvironment(
ReactNativeComponentEnvironment);



var RCTView=createReactNativeComponentClass({
validAttributes:{}, 
uiViewClassName:'RCTView'});

ReactEmptyComponent.injection.injectEmptyComponent(RCTView);

EventPluginUtils.injection.injectMount(ReactNativeMount);

ReactNativeComponent.injection.injectTextComponentClass(
ReactNativeTextComponent);

ReactNativeComponent.injection.injectAutoWrapper(function(tag){

var info='';
if(typeof tag === 'string' && /^[a-z]/.test(tag)){
info += ' Each component name should start with an uppercase letter.';}

invariant(false, 'Expected a component class, got %s.%s', tag, info);});


NodeHandle.injection.injectImplementation(UniversalWorkerNodeHandle);}


module.exports = {
inject:inject};});
__d('InitializeJavaScriptAppEngine',["RCTDeviceEventEmitter","ExceptionsManager","ErrorUtils","ExceptionsManager","Platform","JSTimers","NativeModules","Promise","XMLHttpRequest","FormData","fetch","Geolocation","WebSocket"],function(global, require, requireDynamic, requireLazy, module, exports) {  require(
























'RCTDeviceEventEmitter');

if(typeof GLOBAL === 'undefined'){
GLOBAL = this;}


if(typeof window === 'undefined'){
window = GLOBAL;}


function handleError(e, isFatal){
try{
require('ExceptionsManager').handleException(e, isFatal);}
catch(ee) {
console.log('Failed to print error: ', ee.message);}}



function setUpRedBoxErrorHandler(){
var ErrorUtils=require('ErrorUtils');
ErrorUtils.setGlobalHandler(handleError);}


function setUpRedBoxConsoleErrorHandler(){

var ExceptionsManager=require('ExceptionsManager');
var Platform=require('Platform');

if(__DEV__ && Platform.OS === 'ios'){
ExceptionsManager.installConsoleErrorReporter();}}










function setUpTimers(){
var JSTimers=require('JSTimers');
GLOBAL.setTimeout = JSTimers.setTimeout;
GLOBAL.setInterval = JSTimers.setInterval;
GLOBAL.setImmediate = JSTimers.setImmediate;
GLOBAL.clearTimeout = JSTimers.clearTimeout;
GLOBAL.clearInterval = JSTimers.clearInterval;
GLOBAL.clearImmediate = JSTimers.clearImmediate;
GLOBAL.cancelAnimationFrame = JSTimers.clearInterval;
GLOBAL.requestAnimationFrame = function(cb){

return JSTimers.requestAnimationFrame(cb);};}



function setUpAlert(){
var RCTAlertManager=require('NativeModules').AlertManager;
if(!GLOBAL.alert){
GLOBAL.alert = function(text){
var alertOpts={
title:'Alert', 
message:'' + text, 
buttons:[{'cancel':'OK'}]};

RCTAlertManager.alertWithArgs(alertOpts, null);};}}




function setUpPromise(){


GLOBAL.Promise = require('Promise');}


function setUpXHR(){


GLOBAL.XMLHttpRequest = require('XMLHttpRequest');
GLOBAL.FormData = require('FormData');

var fetchPolyfill=require('fetch');
GLOBAL.fetch = fetchPolyfill.fetch;
GLOBAL.Headers = fetchPolyfill.Headers;
GLOBAL.Request = fetchPolyfill.Request;
GLOBAL.Response = fetchPolyfill.Response;}


function setUpGeolocation(){
GLOBAL.navigator = GLOBAL.navigator || {};
GLOBAL.navigator.geolocation = require('Geolocation');}


function setUpWebSockets(){
GLOBAL.WebSocket = require('WebSocket');}


function setupProfile(){
console.profile = console.profile || GLOBAL.consoleProfile || function(){};
console.profileEnd = console.profileEnd || GLOBAL.consoleProfileEnd || function(){};}


setUpRedBoxErrorHandler();
setUpTimers();
setUpAlert();
setUpPromise();
setUpXHR();
setUpRedBoxConsoleErrorHandler();
setUpGeolocation();
setUpWebSockets();
setupProfile();});
__d('RCTDeviceEventEmitter',["EventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventEmitter=require('EventEmitter');

var RCTDeviceEventEmitter=new EventEmitter();

module.exports = RCTDeviceEventEmitter;});
__d('EventEmitter',["EmitterSubscription","ErrorUtils","EventSubscriptionVendor","emptyFunction","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}

















var EmitterSubscription=require('EmitterSubscription');
var ErrorUtils=require('ErrorUtils');
var EventSubscriptionVendor=require('EventSubscriptionVendor');
var emptyFunction=require('emptyFunction');
var invariant=require('invariant');var 














EventEmitter=(function(){



function EventEmitter(){_classCallCheck(this, EventEmitter);
this._subscriber = new EventSubscriptionVendor();}_createClass(EventEmitter, [{key:'addListener', value:
















function addListener(
eventType, listener, context){
return this._subscriber.addSubscription(
eventType, 
new EmitterSubscription(this._subscriber, listener, context));}}, {key:'once', value:












function once(eventType, listener, context){
var emitter=this;
return this.addListener(eventType, function(){
emitter.removeCurrentListener();
listener.apply(context, arguments);});}}, {key:'removeAllListeners', value:










function removeAllListeners(eventType){
this._subscriber.removeAllSubscriptions(eventType);}}, {key:'removeCurrentListener', value:























function removeCurrentListener(){
invariant(
!!this._currentSubscription, 
'Not in an emitting cycle; there is no current subscription');

this._subscriber.removeSubscription(this._currentSubscription);}}, {key:'listeners', value:









function listeners(eventType){
var subscriptions=this._subscriber.getSubscriptionsForType(eventType);
return subscriptions?
subscriptions.filter(emptyFunction.thatReturnsTrue).map(
function(subscription){
return subscription.listener;}):

[];}}, {key:'emit', value:
















function emit(eventType){
var subscriptions=this._subscriber.getSubscriptionsForType(eventType);
if(subscriptions){
var keys=Object.keys(subscriptions);
for(var ii=0; ii < keys.length; ii++) {
var key=keys[ii];
var subscription=subscriptions[key];


if(subscription){
this._currentSubscription = subscription;

ErrorUtils.applyWithGuard(
subscription.listener, 
subscription.context, 
Array.prototype.slice.call(arguments, 1), 
null, 
'EventEmitter:' + eventType);}}



this._currentSubscription = null;}}}]);return EventEmitter;})();




module.exports = EventEmitter;});
__d('EmitterSubscription',["EventSubscription"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}


















var EventSubscription=require('EventSubscription');var 




EmitterSubscription=(function(_EventSubscription){









function EmitterSubscription(subscriber, listener, context){_classCallCheck(this, EmitterSubscription);
_get(Object.getPrototypeOf(EmitterSubscription.prototype), 'constructor', this).call(this, subscriber);
this.listener = listener;
this.context = context;}_inherits(EmitterSubscription, _EventSubscription);return EmitterSubscription;})(EventSubscription);



module.exports = EmitterSubscription;});
__d('EventSubscription',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var 






















EventSubscription=(function(){





function EventSubscription(subscriber){_classCallCheck(this, EventSubscription);
this.subscriber = subscriber;}_createClass(EventSubscription, [{key:'remove', value:





function remove(){
this.subscriber.removeSubscription(this);}}]);return EventSubscription;})();



module.exports = EventSubscription;});
__d('ErrorUtils',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var 











GLOBAL=this;













module.exports = GLOBAL.ErrorUtils;});
__d('EventSubscriptionVendor',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}


















var invariant=require('invariant');var 





EventSubscriptionVendor=(function(){

function EventSubscriptionVendor(){_classCallCheck(this, EventSubscriptionVendor);
this._subscriptionsForType = {};
this._currentSubscription = null;}_createClass(EventSubscriptionVendor, [{key:'addSubscription', value:








function addSubscription(
eventType, subscription){
invariant(
subscription.subscriber === this, 
'The subscriber of the subscription is incorrectly set.');
if(!this._subscriptionsForType[eventType]){
this._subscriptionsForType[eventType] = [];}

var key=this._subscriptionsForType[eventType].length;
this._subscriptionsForType[eventType].push(subscription);
subscription.eventType = eventType;
subscription.key = key;
return subscription;}}, {key:'removeAllSubscriptions', value:








function removeAllSubscriptions(eventType){
if(eventType === undefined){
this._subscriptionsForType = {};}else 
{
delete this._subscriptionsForType[eventType];}}}, {key:'removeSubscription', value:









function removeSubscription(subscription){
var eventType=subscription.eventType;
var key=subscription.key;

var subscriptionsForType=this._subscriptionsForType[eventType];
if(subscriptionsForType){
delete subscriptionsForType[key];}}}, {key:'getSubscriptionsForType', value:















function getSubscriptionsForType(eventType){
return this._subscriptionsForType[eventType];}}]);return EventSubscriptionVendor;})();



module.exports = EventSubscriptionVendor;});
__d('ExceptionsManager',["NativeModules","loadSourceMap","parseErrorStack","stringifySafe"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTExceptionsManager=require('NativeModules').ExceptionsManager;

var loadSourceMap=require('loadSourceMap');
var parseErrorStack=require('parseErrorStack');
var stringifySafe=require('stringifySafe');

var sourceMapPromise;







function reportException(e, isFatal, stack){
if(RCTExceptionsManager){
if(!stack){
stack = parseErrorStack(e);}

if(isFatal){
RCTExceptionsManager.reportFatalException(e.message, stack);}else 
{
RCTExceptionsManager.reportSoftException(e.message, stack);}

if(__DEV__){
(sourceMapPromise = sourceMapPromise || loadSourceMap()).
then(function(map){
var prettyStack=parseErrorStack(e, map);
RCTExceptionsManager.updateExceptionMessage(e.message, prettyStack);}).

catch(function(error){


console.warn('Unable to load source map: ' + error.message);});}}}





function handleException(e, isFatal){
var stack=parseErrorStack(e);
var msg=
'Error: ' + e.message + 
'\n stack: \n' + stackToString(stack) + 
'\n URL: ' + e.sourceURL + 
'\n line: ' + e.line + 
'\n message: ' + e.message;
if(console.errorOriginal){
console.errorOriginal(msg);}else 
{
console.error(msg);}

reportException(e, isFatal, stack);}






function installConsoleErrorReporter(){
if(console.reportException){
return;}

console.reportException = reportException;
console.errorOriginal = console.error.bind(console);
console.error = function reactConsoleError(){
console.errorOriginal.apply(null, arguments);
if(!console.reportErrorsAsExceptions){
return;}

var str=Array.prototype.map.call(arguments, stringifySafe).join(', ');
var error=new Error('console.error: ' + str);
error.framesToPop = 1;
reportException(error, false);};

if(console.reportErrorsAsExceptions === undefined){
console.reportErrorsAsExceptions = true;}}



function stackToString(stack){
var maxLength=Math.max.apply(null, stack.map(function(frame){return frame.methodName.length;}));
return stack.map(function(frame){return stackFrameToString(frame, maxLength);}).join('\n');}


function stackFrameToString(stackFrame, maxLength){
var fileNameParts=stackFrame.file.split('/');
var fileName=fileNameParts[fileNameParts.length - 1];

if(fileName.length > 18){
fileName = fileName.substr(0, 17) + 'â€¦';}


var spaces=fillSpaces(maxLength - stackFrame.methodName.length);
return '  ' + stackFrame.methodName + spaces + '  ' + fileName + ':' + stackFrame.lineNumber;}


function fillSpaces(n){
return new Array(n + 1).join(' ');}


module.exports = {handleException:handleException, installConsoleErrorReporter:installConsoleErrorReporter};});
__d('NativeModules',["BatchedBridge","nativeModulePrefixNormalizer"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeModules=require('BatchedBridge').RemoteModules;

var nativeModulePrefixNormalizer=require('nativeModulePrefixNormalizer');

nativeModulePrefixNormalizer(NativeModules);

module.exports = NativeModules;});
__d('BatchedBridge',["BatchedBridgeFactory","MessageQueue"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var BatchedBridgeFactory=require('BatchedBridgeFactory');
var MessageQueue=require('MessageQueue');










var remoteModulesConfig=__fbBatchedBridgeConfig.remoteModuleConfig;
var localModulesConfig=__fbBatchedBridgeConfig.localModulesConfig;


var BatchedBridge=BatchedBridgeFactory.create(
MessageQueue, 
remoteModulesConfig, 
localModulesConfig);


BatchedBridge._config = remoteModulesConfig;

module.exports = BatchedBridge;});
__d('BatchedBridgeFactory',["invariant","keyMirror","mapObject","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';function _objectWithoutProperties(obj, keys){var target={};for(var i in obj) {if(keys.indexOf(i) >= 0)continue;if(!Object.prototype.hasOwnProperty.call(obj, i))continue;target[i] = obj[i];}return target;}











var invariant=require('invariant');
var keyMirror=require('keyMirror');
var mapObject=require('mapObject');
var warning=require('warning');

var slice=Array.prototype.slice;

var MethodTypes=keyMirror({
remote:null, 
remoteAsync:null, 
local:null});












var BatchedBridgeFactory={
MethodTypes:MethodTypes, 







_createBridgedModule:function(messageQueue, moduleConfig, moduleName){
var remoteModule=mapObject(moduleConfig.methods, function(methodConfig, memberName){
switch(methodConfig.type){
case MethodTypes.remoteAsync:
return function(){for(var _len=arguments.length, args=Array(_len), _key=0; _key < _len; _key++) {args[_key] = arguments[_key];}
return new Promise(function(resolve, reject){
messageQueue.call(moduleName, memberName, args, resolve, function(errorData){
var error=_createErrorFromErrorData(errorData);
reject(error);});});};




case MethodTypes.local:
return null;

default:
return function(){
var lastArg=arguments.length > 0?arguments[arguments.length - 1]:null;
var secondLastArg=arguments.length > 1?arguments[arguments.length - 2]:null;
var hasSuccCB=typeof lastArg === 'function';
var hasErrorCB=typeof secondLastArg === 'function';
hasErrorCB && invariant(
hasSuccCB, 
'Cannot have a non-function arg after a function arg.');

var numCBs=(hasSuccCB?1:0) + (hasErrorCB?1:0);
var args=slice.call(arguments, 0, arguments.length - numCBs);
var onSucc=hasSuccCB?lastArg:null;
var onFail=hasErrorCB?secondLastArg:null;
return messageQueue.call(moduleName, memberName, args, onFail, onSucc);};}});



for(var constName in moduleConfig.constants) {
warning(!remoteModule[constName], 'saw constant and method named %s', constName);
remoteModule[constName] = moduleConfig.constants[constName];}

return remoteModule;}, 


create:function(MessageQueue, modulesConfig, localModulesConfig){
var messageQueue=new MessageQueue(modulesConfig, localModulesConfig);
return {
callFunction:messageQueue.callFunction.bind(messageQueue), 
callFunctionReturnFlushedQueue:
messageQueue.callFunctionReturnFlushedQueue.bind(messageQueue), 
invokeCallback:messageQueue.invokeCallback.bind(messageQueue), 
invokeCallbackAndReturnFlushedQueue:
messageQueue.invokeCallbackAndReturnFlushedQueue.bind(messageQueue), 
flushedQueue:messageQueue.flushedQueue.bind(messageQueue), 
RemoteModules:mapObject(modulesConfig, this._createBridgedModule.bind(this, messageQueue)), 
setLoggingEnabled:messageQueue.setLoggingEnabled.bind(messageQueue), 
getLoggedOutgoingItems:messageQueue.getLoggedOutgoingItems.bind(messageQueue), 
getLoggedIncomingItems:messageQueue.getLoggedIncomingItems.bind(messageQueue), 
replayPreviousLog:messageQueue.replayPreviousLog.bind(messageQueue), 
processBatch:messageQueue.processBatch.bind(messageQueue)};}};




function _createErrorFromErrorData(errorData){var 

message=

errorData.message;var extraErrorInfo=_objectWithoutProperties(errorData, ['message']);
var error=new Error(message);
error.framesToPop = 1;
return Object.assign(error, extraErrorInfo);}


module.exports = BatchedBridgeFactory;});
__d('mapObject',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var hasOwnProperty=Object.prototype.hasOwnProperty;























function mapObject(object, callback, context){
if(!object){
return null;}

var result={};
for(var name in object) {
if(hasOwnProperty.call(object, name)){
result[name] = callback.call(context, object[name], name, object);}}


return result;}


module.exports = mapObject;});
__d('MessageQueue',["ErrorUtils","ReactUpdates","invariant","warning","BridgeProfiling","JSTimersExecution"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ErrorUtils=require('ErrorUtils');
var ReactUpdates=require('ReactUpdates');

var invariant=require('invariant');
var warning=require('warning');

var BridgeProfiling=require('BridgeProfiling');
var JSTimersExecution=require('JSTimersExecution');

var INTERNAL_ERROR='Error in MessageQueue implementation';


var DEBUG_SPY_MODE=false;
















var requireFunc=require;







var jsCall=function(module, methodName, params){
return module[methodName].apply(module, params);};














var MessageQueue=function(
remoteModulesConfig, 
localModulesConfig, 
customRequire)
{
this._requireFunc = customRequire || requireFunc;
this._initBookeeping();
this._initNamingMap(remoteModulesConfig, localModulesConfig);};



var REQUEST_MODULE_IDS=0;
var REQUEST_METHOD_IDS=1;
var REQUEST_PARAMSS=2;

var RESPONSE_CBIDS=3;
var RESPONSE_RETURN_VALUES=4;

var applyWithErrorReporter=function(fun, context, args){
try{
return fun.apply(context, args);}
catch(e) {
ErrorUtils.reportFatalError(e);}};

















var guardReturn=function(operation, operationArguments, getReturnValue, context){
if(operation){
applyWithErrorReporter(operation, context, operationArguments);}

if(getReturnValue){
return applyWithErrorReporter(getReturnValue, context, null);}

return null;};
















var createBookkeeping=function(){
return {




GUID:1, 
errorCallbackIDForSuccessCallbackID:function(successID){
return successID + 1;}, 

successCallbackIDForErrorCallbackID:function(errorID){
return errorID - 1;}, 

allocateCallbackIDs:function(res){
res.successCallbackID = this.GUID++;
res.errorCallbackID = this.GUID++;}, 

isSuccessCallback:function(id){
return id % 2 === 1;}};};




var MessageQueueMixin={







_initNamingMap:function(
remoteModulesConfig, 
localModulesConfig)
{
this._remoteModuleNameToModuleID = {};
this._remoteModuleIDToModuleName = {};

this._remoteModuleNameToMethodNameToID = {};
this._remoteModuleNameToMethodIDToName = {};

this._localModuleNameToModuleID = {};
this._localModuleIDToModuleName = {};

this._localModuleNameToMethodNameToID = {};
this._localModuleNameToMethodIDToName = {};

function fillMappings(
modulesConfig, 
moduleNameToModuleID, 
moduleIDToModuleName, 
moduleNameToMethodNameToID, 
moduleNameToMethodIDToName)
{
for(var moduleName in modulesConfig) {
var moduleConfig=modulesConfig[moduleName];
var moduleID=moduleConfig.moduleID;
moduleNameToModuleID[moduleName] = moduleID;
moduleIDToModuleName[moduleID] = moduleName;

moduleNameToMethodNameToID[moduleName] = {};
moduleNameToMethodIDToName[moduleName] = {};
var methods=moduleConfig.methods;
for(var methodName in methods) {
var methodID=methods[methodName].methodID;
moduleNameToMethodNameToID[moduleName][methodName] = 
methodID;
moduleNameToMethodIDToName[moduleName][methodID] = 
methodName;}}}



fillMappings(
remoteModulesConfig, 
this._remoteModuleNameToModuleID, 
this._remoteModuleIDToModuleName, 
this._remoteModuleNameToMethodNameToID, 
this._remoteModuleNameToMethodIDToName);


fillMappings(
localModulesConfig, 
this._localModuleNameToModuleID, 
this._localModuleIDToModuleName, 
this._localModuleNameToMethodNameToID, 
this._localModuleNameToMethodIDToName);}, 




_initBookeeping:function(){
this._POOLED_CBIDS = {errorCallbackID:null, successCallbackID:null};
this._bookkeeping = createBookkeeping();






this._threadLocalCallbacksByID = [];
this._threadLocalScopesByID = [];















this._outgoingItems = [
[], 
[], 
[], 

[], 

[]];






this._outgoingItemsSwap = [[], [], [], [], []];}, 


invokeCallback:function(cbID, args){
return guardReturn(this._invokeCallback, [cbID, args], null, this);}, 


_invokeCallback:function(cbID, args){
try{
var cb=this._threadLocalCallbacksByID[cbID];
var scope=this._threadLocalScopesByID[cbID];
warning(
cb, 
'Cannot find callback with CBID %s. Native module may have invoked ' + 
'both the success callback and the error callback.', 
cbID);

if(DEBUG_SPY_MODE){
console.log('N->JS: Callback#' + cbID + '(' + JSON.stringify(args) + ')');}

BridgeProfiling.profile('Callback#' + cbID + '(' + JSON.stringify(args) + ')');
cb.apply(scope, args);
BridgeProfiling.profileEnd();}
catch(ie_requires_catch) {
throw ie_requires_catch;}finally 
{

this._freeResourcesForCallbackID(cbID);}}, 



invokeCallbackAndReturnFlushedQueue:function(cbID, args){
if(this._enableLogging){
this._loggedIncomingItems.push([new Date().getTime(), cbID, args]);}

return guardReturn(
this._invokeCallback, 
[cbID, args], 
this._flushedQueueUnguarded, 
this);}, 



callFunction:function(moduleID, methodID, params){
return guardReturn(this._callFunction, [moduleID, methodID, params], null, this);}, 


_callFunction:function(moduleID, methodID, params){
var moduleName=this._localModuleIDToModuleName[moduleID];

var methodName=this._localModuleNameToMethodIDToName[moduleName][methodID];
if(DEBUG_SPY_MODE){
console.log(
'N->JS: ' + moduleName + '.' + methodName + 
'(' + JSON.stringify(params) + ')');}

BridgeProfiling.profile(moduleName + '.' + methodName + '(' + JSON.stringify(params) + ')');
var ret=jsCall(this._requireFunc(moduleName), methodName, params);
BridgeProfiling.profileEnd();

return ret;}, 


callFunctionReturnFlushedQueue:function(moduleID, methodID, params){
if(this._enableLogging){
this._loggedIncomingItems.push([new Date().getTime(), moduleID, methodID, params]);}

return guardReturn(
this._callFunction, 
[moduleID, methodID, params], 
this._flushedQueueUnguarded, 
this);}, 



processBatch:function(batch){
var self=this;
BridgeProfiling.profile('MessageQueue.processBatch()');
var flushedQueue=guardReturn(function(){
ReactUpdates.batchedUpdates(function(){
batch.forEach(function(call){
invariant(
call.module === 'BatchedBridge', 
'All the calls should pass through the BatchedBridge module');

if(call.method === 'callFunctionReturnFlushedQueue'){
self._callFunction.apply(self, call.args);}else 
if(call.method === 'invokeCallbackAndReturnFlushedQueue'){
self._invokeCallback.apply(self, call.args);}else 
{
throw new Error(
'Unrecognized method called on BatchedBridge: ' + call.method);}});


BridgeProfiling.profile('React.batchedUpdates()');});

BridgeProfiling.profileEnd();}, 
null, this._flushedQueueUnguarded, this);
BridgeProfiling.profileEnd();
return flushedQueue;}, 


setLoggingEnabled:function(enabled){
this._enableLogging = enabled;
this._loggedIncomingItems = [];
this._loggedOutgoingItems = [[], [], [], [], []];}, 


getLoggedIncomingItems:function(){
return this._loggedIncomingItems;}, 


getLoggedOutgoingItems:function(){
return this._loggedOutgoingItems;}, 


replayPreviousLog:function(previousLog){
this._outgoingItems = previousLog;}, 







_swapAndReinitializeBuffer:function(){

var currentOutgoingItems=this._outgoingItems;
var nextOutgoingItems=this._outgoingItemsSwap;

nextOutgoingItems[REQUEST_MODULE_IDS].length = 0;
nextOutgoingItems[REQUEST_METHOD_IDS].length = 0;
nextOutgoingItems[REQUEST_PARAMSS].length = 0;


nextOutgoingItems[RESPONSE_CBIDS].length = 0;
nextOutgoingItems[RESPONSE_RETURN_VALUES].length = 0;

this._outgoingItemsSwap = currentOutgoingItems;
this._outgoingItems = nextOutgoingItems;}, 








_pushRequestToOutgoingItems:function(moduleID, methodName, params){
this._outgoingItems[REQUEST_MODULE_IDS].push(moduleID);
this._outgoingItems[REQUEST_METHOD_IDS].push(methodName);
this._outgoingItems[REQUEST_PARAMSS].push(params);

if(this._enableLogging){
this._loggedOutgoingItems[REQUEST_MODULE_IDS].push(moduleID);
this._loggedOutgoingItems[REQUEST_METHOD_IDS].push(methodName);
this._loggedOutgoingItems[REQUEST_PARAMSS].push(params);}}, 








_pushResponseToOutgoingItems:function(cbID, returnValue){
this._outgoingItems[RESPONSE_CBIDS].push(cbID);
this._outgoingItems[RESPONSE_RETURN_VALUES].push(returnValue);}, 


_freeResourcesForCallbackID:function(cbID){
var correspondingCBID=this._bookkeeping.isSuccessCallback(cbID)?
this._bookkeeping.errorCallbackIDForSuccessCallbackID(cbID):
this._bookkeeping.successCallbackIDForErrorCallbackID(cbID);
this._threadLocalCallbacksByID[cbID] = null;
this._threadLocalScopesByID[cbID] = null;
if(this._threadLocalCallbacksByID[correspondingCBID]){
this._threadLocalCallbacksByID[correspondingCBID] = null;
this._threadLocalScopesByID[correspondingCBID] = null;}}, 











_storeCallbacksInCurrentThread:function(onFail, onSucc, scope){
invariant(onFail || onSucc, INTERNAL_ERROR);
this._bookkeeping.allocateCallbackIDs(this._POOLED_CBIDS);
var succCBID=this._POOLED_CBIDS.successCallbackID;
var errorCBID=this._POOLED_CBIDS.errorCallbackID;
this._threadLocalCallbacksByID[errorCBID] = onFail;
this._threadLocalCallbacksByID[succCBID] = onSucc;
this._threadLocalScopesByID[errorCBID] = scope;
this._threadLocalScopesByID[succCBID] = scope;}, 




















flushedQueue:function(){
return guardReturn(null, null, this._flushedQueueUnguarded, this);}, 


_flushedQueueUnguarded:function(){
BridgeProfiling.profile('JSTimersExecution.callImmediates()');

JSTimersExecution.callImmediates();
BridgeProfiling.profileEnd();

var currentOutgoingItems=this._outgoingItems;
this._swapAndReinitializeBuffer();
var ret=currentOutgoingItems[REQUEST_MODULE_IDS].length || 
currentOutgoingItems[RESPONSE_RETURN_VALUES].length?currentOutgoingItems:null;

if(DEBUG_SPY_MODE && ret){
for(var i=0; i < currentOutgoingItems[0].length; i++) {
var moduleName=this._remoteModuleIDToModuleName[currentOutgoingItems[0][i]];
var methodName=
this._remoteModuleNameToMethodIDToName[moduleName][currentOutgoingItems[1][i]];
console.log(
'JS->N: ' + moduleName + '.' + methodName + 
'(' + JSON.stringify(currentOutgoingItems[2][i]) + ')');}}



return ret;}, 


call:function(moduleName, methodName, params, onFail, onSucc, scope){
invariant(
(!onFail || typeof onFail === 'function') && (
!onSucc || typeof onSucc === 'function'), 
'Callbacks must be functions');



if(onFail || onSucc){
this._storeCallbacksInCurrentThread(onFail, onSucc, scope, this._POOLED_CBIDS);
onFail && params.push(this._POOLED_CBIDS.errorCallbackID);
onSucc && params.push(this._POOLED_CBIDS.successCallbackID);}

var moduleID=this._remoteModuleNameToModuleID[moduleName];
if(moduleID === undefined || moduleID === null){
throw new Error('Unrecognized module name:' + moduleName);}

var methodID=this._remoteModuleNameToMethodNameToID[moduleName][methodName];
if(methodID === undefined || moduleID === null){
throw new Error('Unrecognized method name:' + methodName);}

this._pushRequestToOutgoingItems(moduleID, methodID, params);}, 

__numPendingCallbacksOnlyUseMeInTestCases:function(){
var callbacks=this._threadLocalCallbacksByID;
var total=0;
for(var i=0; i < callbacks.length; i++) {
if(callbacks[i]){
total++;}}


return total;}};



Object.assign(MessageQueue.prototype, MessageQueueMixin);
module.exports = MessageQueue;});
__d('BridgeProfiling',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var GLOBAL=GLOBAL || this;

var BridgeProfiling={
profile:function(profileName, args){
if(GLOBAL.__BridgeProfilingIsProfiling){
if(args){
try{
args = JSON.stringify(args);}
catch(err) {
args = err.message;}}


console.profile(profileName, args);}}, 



profileEnd:function(){
if(GLOBAL.__BridgeProfilingIsProfiling){
console.profileEnd();}}};




module.exports = BridgeProfiling;});
__d('JSTimersExecution',["invariant","keyMirror","performanceNow","warning","JSTimers","JSTimers"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var invariant=require('invariant');
var keyMirror=require('keyMirror');
var performanceNow=require('performanceNow');
var warning=require('warning');






var JSTimersExecution={
GUID:1, 
Type:keyMirror({
setTimeout:null, 
setInterval:null, 
requestAnimationFrame:null, 
setImmediate:null}), 



callbacks:[], 
types:[], 
timerIDs:[], 
immediates:[], 






callTimer:function(timerID){
warning(timerID <= JSTimersExecution.GUID, 'Tried to call timer with ID ' + timerID + ' but no such timer exists');
var timerIndex=JSTimersExecution.timerIDs.indexOf(timerID);





if(timerIndex === -1){
return;}

var type=JSTimersExecution.types[timerIndex];
var callback=JSTimersExecution.callbacks[timerIndex];


if(type === JSTimersExecution.Type.setTimeout || 
type === JSTimersExecution.Type.setImmediate || 
type === JSTimersExecution.Type.requestAnimationFrame){
JSTimersExecution._clearIndex(timerIndex);}


try{
if(type === JSTimersExecution.Type.setTimeout || 
type === JSTimersExecution.Type.setInterval || 
type === JSTimersExecution.Type.setImmediate){
callback();}else 
if(type === JSTimersExecution.Type.requestAnimationFrame){
var currentTime=performanceNow();
callback(currentTime);}else 
{
console.error('Tried to call a callback with invalid type: ' + type);
return;}}

catch(e) {

JSTimersExecution.errors = JSTimersExecution.errors || [];
JSTimersExecution.errors.push(e);}}, 







callTimers:function(timerIDs){
invariant(timerIDs.length !== 0, 'Probably shouldn\'t call "callTimers" with no timerIDs');

JSTimersExecution.errors = null;
timerIDs.forEach(JSTimersExecution.callTimer);

var errors=JSTimersExecution.errors;
if(errors){
var errorCount=errors.length;
if(errorCount > 1){


for(var ii=1; ii < errorCount; ii++) {
require('JSTimers').setTimeout(
(function(error){throw error;}).bind(null, errors[ii]), 
0);}}



throw errors[0];}}, 







callImmediates:function(){
JSTimersExecution.errors = null;
while(JSTimersExecution.immediates.length !== 0) {
JSTimersExecution.callTimer(JSTimersExecution.immediates.shift());}

if(JSTimersExecution.errors){
JSTimersExecution.errors.forEach(function(error){return (
require('JSTimers').setTimeout(function(){throw error;}, 0));});}}, 




_clearIndex:function(i){
JSTimersExecution.timerIDs[i] = null;
JSTimersExecution.callbacks[i] = null;
JSTimersExecution.types[i] = null;}};



module.exports = JSTimersExecution;});
__d('performanceNow',["performance"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 











performance=require('performance');






if(!performance || !performance.now){
performance = Date;}


var performanceNow=performance.now.bind(performance);

module.exports = performanceNow;});
__d('performance',["ExecutionEnvironment"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";













var ExecutionEnvironment=require("ExecutionEnvironment");

var performance;

if(ExecutionEnvironment.canUseDOM){
performance = 
window.performance || 
window.msPerformance || 
window.webkitPerformance;}


module.exports = performance || {};});
__d('ExecutionEnvironment',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var canUseDOM=!!(
typeof window !== 'undefined' && 
window.document && 
window.document.createElement);








var ExecutionEnvironment={

canUseDOM:canUseDOM, 

canUseWorkers:typeof Worker !== 'undefined', 

canUseEventListeners:
canUseDOM && !!(window.addEventListener || window.attachEvent), 

canUseViewport:canUseDOM && !!window.screen, 

isInWorker:!canUseDOM};



module.exports = ExecutionEnvironment;});
__d('JSTimers',["NativeModules","JSTimersExecution"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var RCTTiming=require('NativeModules').Timing;
var JSTimersExecution=require('JSTimersExecution');






var JSTimers={
Types:JSTimersExecution.Types, 





_getFreeIndex:function(){
var freeIndex=JSTimersExecution.timerIDs.indexOf(null);
if(freeIndex === -1){
freeIndex = JSTimersExecution.timerIDs.length;}

return freeIndex;}, 






setTimeout:function(func, duration){for(var _len=arguments.length, args=Array(_len > 2?_len - 2:0), _key=2; _key < _len; _key++) {args[_key - 2] = arguments[_key];}
var newID=JSTimersExecution.GUID++;
var freeIndex=JSTimers._getFreeIndex();
JSTimersExecution.timerIDs[freeIndex] = newID;
JSTimersExecution.callbacks[freeIndex] = function(){
return func.apply(undefined, args);};

JSTimersExecution.types[freeIndex] = JSTimersExecution.Type.setTimeout;
RCTTiming.createTimer(newID, duration, Date.now(), false);
return newID;}, 






setInterval:function(func, duration){for(var _len2=arguments.length, args=Array(_len2 > 2?_len2 - 2:0), _key2=2; _key2 < _len2; _key2++) {args[_key2 - 2] = arguments[_key2];}
var newID=JSTimersExecution.GUID++;
var freeIndex=JSTimers._getFreeIndex();
JSTimersExecution.timerIDs[freeIndex] = newID;
JSTimersExecution.callbacks[freeIndex] = function(){
return func.apply(undefined, args);};

JSTimersExecution.types[freeIndex] = JSTimersExecution.Type.setInterval;
RCTTiming.createTimer(newID, duration, Date.now(), true);
return newID;}, 






setImmediate:function(func){for(var _len3=arguments.length, args=Array(_len3 > 1?_len3 - 1:0), _key3=1; _key3 < _len3; _key3++) {args[_key3 - 1] = arguments[_key3];}
var newID=JSTimersExecution.GUID++;
var freeIndex=JSTimers._getFreeIndex();
JSTimersExecution.timerIDs[freeIndex] = newID;
JSTimersExecution.callbacks[freeIndex] = function(){
return func.apply(undefined, args);};

JSTimersExecution.types[freeIndex] = JSTimersExecution.Type.setImmediate;
JSTimersExecution.immediates.push(newID);
return newID;}, 





requestAnimationFrame:function(func){
var newID=JSTimersExecution.GUID++;
var freeIndex=JSTimers._getFreeIndex();
JSTimersExecution.timerIDs[freeIndex] = newID;
JSTimersExecution.callbacks[freeIndex] = func;
JSTimersExecution.types[freeIndex] = JSTimersExecution.Type.requestAnimationFrame;
RCTTiming.createTimer(newID, 1, Date.now(), false);
return newID;}, 


clearTimeout:function(timerID){
JSTimers._clearTimerID(timerID);}, 


clearInterval:function(timerID){
JSTimers._clearTimerID(timerID);}, 


clearImmediate:function(timerID){
JSTimers._clearTimerID(timerID);
JSTimersExecution.immediates.splice(
JSTimersExecution.immediates.indexOf(timerID), 
1);}, 



cancelAnimationFrame:function(timerID){
JSTimers._clearTimerID(timerID);}, 


_clearTimerID:function(timerID){


if(timerID == null){
return;}


var index=JSTimersExecution.timerIDs.indexOf(timerID);

if(index !== -1){
JSTimersExecution._clearIndex(index);
if(JSTimersExecution.types[index] !== JSTimersExecution.Type.setImmediate){
RCTTiming.deleteTimer(timerID);}}}};





module.exports = JSTimers;});
__d('nativeModulePrefixNormalizer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













function nativeModulePrefixNormalizer(
modules)
{
Object.keys(modules).forEach(function(moduleName){
var strippedName=moduleName.replace(/^(RCT|RK)/, '');
if(modules['RCT' + strippedName] && modules['RK' + strippedName]){
throw new Error(
'Module cannot be registered as both RCT and RK: ' + moduleName);}


if(strippedName !== moduleName){
modules[strippedName] = modules[moduleName];
delete modules[moduleName];}});}




module.exports = nativeModulePrefixNormalizer;});
__d('loadSourceMap',["Promise","NativeModules","SourceMap","react-native/Libraries/JavaScriptAppEngine/Initialization/source-map-url"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var Promise=require('Promise');
var NativeModules=require('NativeModules');
var SourceMapConsumer=require('SourceMap').SourceMapConsumer;
var SourceMapURL=require('react-native/Libraries/JavaScriptAppEngine/Initialization/source-map-url');

var RCTSourceCode=NativeModules.SourceCode;
var RCTDataManager=NativeModules.DataManager;

function loadSourceMap(){
return fetchSourceMap().
then(function(map){return new SourceMapConsumer(map);});}


function fetchSourceMap(){
if(global.RAW_SOURCE_MAP){
return Promise.resolve(global.RAW_SOURCE_MAP);}


if(!RCTSourceCode){
return Promise.reject(new Error('RCTSourceCode module is not available'));}


if(!RCTDataManager){

return Promise.reject(new Error('RCTDataManager module is not available'));}


return new Promise(RCTSourceCode.getScriptText).
then(extractSourceMapURL).
then(function(url){
if(url === null){
return Promise.reject(new Error('No source map URL found. May be running from bundled file.'));}

return Promise.resolve(url);}).

then(fetch).
then(function(response){return response.text();});}


function extractSourceMapURL(_ref){var url=_ref.url;var text=_ref.text;var fullSourceMappingURL=_ref.fullSourceMappingURL;
if(fullSourceMappingURL){
return fullSourceMappingURL;}

var mapURL=SourceMapURL.getFrom(text);
if(!mapURL){
return null;}

var baseURL=url.match(/(.+:\/\/.*?)\//)[1];
return baseURL + mapURL;}


module.exports = loadSourceMap;});
__d('Promise',["setImmediate","promise/setimmediate/es6-extensions","promise/setimmediate/done"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';























global.setImmediate = require('setImmediate');
var Promise=require('promise/setimmediate/es6-extensions');
require('promise/setimmediate/done');




Promise.prototype.finally = function(onSettled){
return this.then(onSettled, onSettled);};



module.exports = Promise;});
__d('setImmediate',["ImmediateImplementation"],function(global, require, requireDynamic, requireLazy, module, exports) {  module.
















exports = global.setImmediate || 
require('ImmediateImplementation').setImmediate;});
__d('ImmediateImplementation',[],function(global, require, requireDynamic, requireLazy, module, exports) {  (







































function(global, undefined){
"use strict";

var nextHandle=1;
var tasksByHandle={};
var queueHead={};
var queueTail=queueHead;
var currentlyRunningATask=false;
var doc=global.document;
var setImmediate;

function addFromSetImmediateArguments(args){
var handler=args[0];
args = Array.prototype.slice.call(args, 1);
tasksByHandle[nextHandle] = function(){
handler.apply(undefined, args);};

queueTail = queueTail.next = {handle:nextHandle++};
return queueTail.handle;}


function flushQueue(){
var next, task;
while(!currentlyRunningATask && (next = queueHead.next)) {
queueHead = next;
if(task = tasksByHandle[next.handle]){
currentlyRunningATask = true;
try{
task();
currentlyRunningATask = false;}finally 
{
clearImmediate(next.handle);
if(currentlyRunningATask){
currentlyRunningATask = false;






if(queueHead.next){
setImmediate(flushQueue);}}}}}}







function clearImmediate(handle){
delete tasksByHandle[handle];}


function canUsePostMessage(){


if(global.postMessage && !global.importScripts){
var postMessageIsAsynchronous=true;

var onMessage=function(){
postMessageIsAsynchronous = false;
if(global.removeEventListener){
global.removeEventListener("message", onMessage, false);}else 
{
global.detachEvent("onmessage", onMessage);}};



if(global.addEventListener){
global.addEventListener("message", onMessage, false);}else 
if(global.attachEvent){
global.attachEvent("onmessage", onMessage);}else 
{
return false;}


global.postMessage("", "*");
return postMessageIsAsynchronous;}}



function installPostMessageImplementation(){


var messagePrefix="setImmediate$" + Math.random() + "$";
var onGlobalMessage=function(event){
if(event.source === global && 
typeof event.data === "string" && 
event.data.indexOf(messagePrefix) === 0){
flushQueue();}};



if(global.addEventListener){
global.addEventListener("message", onGlobalMessage, false);}else 
{
global.attachEvent("onmessage", onGlobalMessage);}


setImmediate = function(){
var handle=addFromSetImmediateArguments(arguments);
global.postMessage(messagePrefix + handle, "*");
return handle;};}



function installMessageChannelImplementation(){
var channel=new MessageChannel();
channel.port1.onmessage = flushQueue;
setImmediate = function(){
var handle=addFromSetImmediateArguments(arguments);
channel.port2.postMessage(handle);
return handle;};}



function installReadyStateChangeImplementation(){
var html=doc.documentElement;
setImmediate = function(){
var handle=addFromSetImmediateArguments(arguments);


var script=doc.createElement("script");
script.onreadystatechange = function(){
script.onreadystatechange = null;
html.removeChild(script);
script = null;
flushQueue();};

html.appendChild(script);
return handle;};}



function installSetTimeoutImplementation(){
setImmediate = function(){
setTimeout(flushQueue, 0);
return addFromSetImmediateArguments(arguments);};}



if(canUsePostMessage()){

installPostMessageImplementation();}else 

if(global.MessageChannel){

installMessageChannelImplementation();}else 

if(doc && "onreadystatechange" in doc.createElement("script")){

installReadyStateChangeImplementation();}else 

{

installSetTimeoutImplementation();}


exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;})(
Function("return this")());});
__d('promise/setimmediate/es6-extensions',["promise/setimmediate/core"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



var Promise=require('promise/setimmediate/core');


module.exports = Promise;



var TRUE=valuePromise(true);
var FALSE=valuePromise(false);
var NULL=valuePromise(null);
var UNDEFINED=valuePromise(undefined);
var ZERO=valuePromise(0);
var EMPTYSTRING=valuePromise('');

function valuePromise(value){
var p=new Promise(Promise._83);
p._32 = 1;
p._8 = value;
return p;}

Promise.resolve = function(value){
if(value instanceof Promise)return value;

if(value === null)return NULL;
if(value === undefined)return UNDEFINED;
if(value === true)return TRUE;
if(value === false)return FALSE;
if(value === 0)return ZERO;
if(value === '')return EMPTYSTRING;

if(typeof value === 'object' || typeof value === 'function'){
try{
var then=value.then;
if(typeof then === 'function'){
return new Promise(then.bind(value));}}

catch(ex) {
return new Promise(function(resolve, reject){
reject(ex);});}}



return valuePromise(value);};


Promise.all = function(arr){
var args=Array.prototype.slice.call(arr);

return new Promise(function(resolve, reject){
if(args.length === 0)return resolve([]);
var remaining=args.length;
function res(i, val){
if(val && (typeof val === 'object' || typeof val === 'function')){
if(val instanceof Promise && val.then === Promise.prototype.then){
while(val._32 === 3) {
val = val._8;}

if(val._32 === 1)return res(i, val._8);
if(val._32 === 2)reject(val._8);
val.then(function(val){
res(i, val);}, 
reject);
return;}else 
{
var then=val.then;
if(typeof then === 'function'){
var p=new Promise(then.bind(val));
p.then(function(val){
res(i, val);}, 
reject);
return;}}}



args[i] = val;
if(--remaining === 0){
resolve(args);}}


for(var i=0; i < args.length; i++) {
res(i, args[i]);}});};




Promise.reject = function(value){
return new Promise(function(resolve, reject){
reject(value);});};



Promise.race = function(values){
return new Promise(function(resolve, reject){
values.forEach(function(value){
Promise.resolve(value).then(resolve, reject);});});};






Promise.prototype['catch'] = function(onRejected){
return this.then(null, onRejected);};});
__d('promise/setimmediate/core',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



function noop(){}


















var LAST_ERROR=null;
var IS_ERROR={};
function getThen(obj){
try{
return obj.then;}
catch(ex) {
LAST_ERROR = ex;
return IS_ERROR;}}



function tryCallOne(fn, a){
try{
return fn(a);}
catch(ex) {
LAST_ERROR = ex;
return IS_ERROR;}}


function tryCallTwo(fn, a, b){
try{
fn(a, b);}
catch(ex) {
LAST_ERROR = ex;
return IS_ERROR;}}



module.exports = Promise;

function Promise(fn){
if(typeof this !== 'object'){
throw new TypeError('Promises must be constructed via new');}

if(typeof fn !== 'function'){
throw new TypeError('not a function');}

this._32 = 0;
this._8 = null;
this._89 = [];
if(fn === noop)return;
doResolve(fn, this);}

Promise._83 = noop;

Promise.prototype.then = function(onFulfilled, onRejected){
if(this.constructor !== Promise){
return safeThen(this, onFulfilled, onRejected);}

var res=new Promise(noop);
handle(this, new Handler(onFulfilled, onRejected, res));
return res;};


function safeThen(self, onFulfilled, onRejected){
return new self.constructor(function(resolve, reject){
var res=new Promise(noop);
res.then(resolve, reject);
handle(self, new Handler(onFulfilled, onRejected, res));});}

;
function handle(self, deferred){
while(self._32 === 3) {
self = self._8;}

if(self._32 === 0){
self._89.push(deferred);
return;}

setImmediate(function(){
var cb=self._32 === 1?deferred.onFulfilled:deferred.onRejected;
if(cb === null){
if(self._32 === 1){
resolve(deferred.promise, self._8);}else 
{
reject(deferred.promise, self._8);}

return;}

var ret=tryCallOne(cb, self._8);
if(ret === IS_ERROR){
reject(deferred.promise, LAST_ERROR);}else 
{
resolve(deferred.promise, ret);}});}



function resolve(self, newValue){

if(newValue === self){
return reject(
self, 
new TypeError('A promise cannot be resolved with itself.'));}


if(
newValue && (
typeof newValue === 'object' || typeof newValue === 'function'))
{
var then=getThen(newValue);
if(then === IS_ERROR){
return reject(self, LAST_ERROR);}

if(
then === self.then && 
newValue instanceof Promise)
{
self._32 = 3;
self._8 = newValue;
finale(self);
return;}else 
if(typeof then === 'function'){
doResolve(then.bind(newValue), self);
return;}}


self._32 = 1;
self._8 = newValue;
finale(self);}


function reject(self, newValue){
self._32 = 2;
self._8 = newValue;
finale(self);}

function finale(self){
for(var i=0; i < self._89.length; i++) {
handle(self, self._89[i]);}

self._89 = null;}


function Handler(onFulfilled, onRejected, promise){
this.onFulfilled = typeof onFulfilled === 'function'?onFulfilled:null;
this.onRejected = typeof onRejected === 'function'?onRejected:null;
this.promise = promise;}








function doResolve(fn, promise){
var done=false;
var res=tryCallTwo(fn, function(value){
if(done)return;
done = true;
resolve(promise, value);}, 
function(reason){
if(done)return;
done = true;
reject(promise, reason);});

if(!done && res === IS_ERROR){
done = true;
reject(promise, LAST_ERROR);}}});
__d('promise/setimmediate/done',["promise/setimmediate/core"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

var Promise=require('promise/setimmediate/core');

module.exports = Promise;
Promise.prototype.done = function(onFulfilled, onRejected){
var self=arguments.length?this.then.apply(this, arguments):this;
self.then(null, function(err){
setTimeout(function(){
throw err;}, 
0);});};});
__d('SourceMap',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var 





















scope={};
wrapper.call(scope);

module.exports = scope.sourceMap;

function wrapper(){














function define(moduleName, deps, payload){
if(typeof moduleName != "string"){
throw new TypeError("Expected string, got: " + moduleName);}


if(arguments.length == 2){
payload = deps;}


if(moduleName in define.modules){
throw new Error("Module already defined: " + moduleName);}

define.modules[moduleName] = payload;}
;




define.modules = {};










function Domain(){
this.modules = {};
this._currentModule = null;}


(function(){
















Domain.prototype.require = function(deps, callback){
if(Array.isArray(deps)){
var params=deps.map(function(dep){
return this.lookup(dep);}, 
this);
if(callback){
callback.apply(null, params);}

return undefined;}else 

{
return this.lookup(deps);}};



function normalize(path){
var bits=path.split("/");
var i=1;
while(i < bits.length) {
if(bits[i] === ".."){
bits.splice(i - 1, 1);}else 
if(bits[i] === "."){
bits.splice(i, 1);}else 
{
i++;}}


return bits.join("/");}


function join(a, b){
a = a.trim();
b = b.trim();
if(/^\//.test(b)){
return b;}else 
{
return a.replace(/\/*$/, "/") + b;}}



function dirname(path){
var bits=path.split("/");
bits.pop();
return bits.join("/");}








Domain.prototype.lookup = function(moduleName){
if(/^\./.test(moduleName)){
moduleName = normalize(join(dirname(this._currentModule), moduleName));}


if(moduleName in this.modules){
var module=this.modules[moduleName];
return module;}


if(!(moduleName in define.modules)){
throw new Error("Module not defined: " + moduleName);}


var module=define.modules[moduleName];

if(typeof module == "function"){
var exports={};
var previousModule=this._currentModule;
this._currentModule = moduleName;
module(this.require.bind(this), exports, {id:moduleName, uri:""});
this._currentModule = previousModule;
module = exports;}



this.modules[moduleName] = module;

return module;};})();




define.Domain = Domain;
define.globalDomain = new Domain();
var require=define.globalDomain.require.bind(define.globalDomain);






define("source-map/source-map-generator", ["require", "exports", "module", "source-map/base64-vlq", "source-map/util", "source-map/array-set"], function(require, exports, module){

var base64VLQ=require("./base64-vlq");
var util=require("./util");
var ArraySet=require("./array-set").ArraySet;









function SourceMapGenerator(aArgs){
this._file = util.getArg(aArgs, "file");
this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
this._sources = new ArraySet();
this._names = new ArraySet();
this._mappings = [];
this._sourcesContents = null;}


SourceMapGenerator.prototype._version = 3;






SourceMapGenerator.fromSourceMap = 
function SourceMapGenerator_fromSourceMap(aSourceMapConsumer){
var sourceRoot=aSourceMapConsumer.sourceRoot;
var generator=new SourceMapGenerator({
file:aSourceMapConsumer.file, 
sourceRoot:sourceRoot});

aSourceMapConsumer.eachMapping(function(mapping){
var newMapping={
generated:{
line:mapping.generatedLine, 
column:mapping.generatedColumn}};



if(mapping.source){
newMapping.source = mapping.source;
if(sourceRoot){
newMapping.source = util.relative(sourceRoot, newMapping.source);}


newMapping.original = {
line:mapping.originalLine, 
column:mapping.originalColumn};


if(mapping.name){
newMapping.name = mapping.name;}}



generator.addMapping(newMapping);});

aSourceMapConsumer.sources.forEach(function(sourceFile){
var content=aSourceMapConsumer.sourceContentFor(sourceFile);
if(content){
generator.setSourceContent(sourceFile, content);}});


return generator;};












SourceMapGenerator.prototype.addMapping = 
function SourceMapGenerator_addMapping(aArgs){
var generated=util.getArg(aArgs, "generated");
var original=util.getArg(aArgs, "original", null);
var source=util.getArg(aArgs, "source", null);
var name=util.getArg(aArgs, "name", null);

this._validateMapping(generated, original, source, name);

if(source && !this._sources.has(source)){
this._sources.add(source);}


if(name && !this._names.has(name)){
this._names.add(name);}


this._mappings.push({
generatedLine:generated.line, 
generatedColumn:generated.column, 
originalLine:original != null && original.line, 
originalColumn:original != null && original.column, 
source:source, 
name:name});};






SourceMapGenerator.prototype.setSourceContent = 
function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent){
var source=aSourceFile;
if(this._sourceRoot){
source = util.relative(this._sourceRoot, source);}


if(aSourceContent !== null){


if(!this._sourcesContents){
this._sourcesContents = {};}

this._sourcesContents[util.toSetString(source)] = aSourceContent;}else 
{


delete this._sourcesContents[util.toSetString(source)];
if(Object.keys(this._sourcesContents).length === 0){
this._sourcesContents = null;}}};














SourceMapGenerator.prototype.applySourceMap = 
function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile){

if(!aSourceFile){
aSourceFile = aSourceMapConsumer.file;}

var sourceRoot=this._sourceRoot;

if(sourceRoot){
aSourceFile = util.relative(sourceRoot, aSourceFile);}



var newSources=new ArraySet();
var newNames=new ArraySet();


this._mappings.forEach(function(mapping){
if(mapping.source === aSourceFile && mapping.originalLine){

var original=aSourceMapConsumer.originalPositionFor({
line:mapping.originalLine, 
column:mapping.originalColumn});

if(original.source !== null){

if(sourceRoot){
mapping.source = util.relative(sourceRoot, original.source);}else 
{
mapping.source = original.source;}

mapping.originalLine = original.line;
mapping.originalColumn = original.column;
if(original.name !== null && mapping.name !== null){


mapping.name = original.name;}}}




var source=mapping.source;
if(source && !newSources.has(source)){
newSources.add(source);}


var name=mapping.name;
if(name && !newNames.has(name)){
newNames.add(name);}}, 


this);
this._sources = newSources;
this._names = newNames;


aSourceMapConsumer.sources.forEach(function(sourceFile){
var content=aSourceMapConsumer.sourceContentFor(sourceFile);
if(content){
if(sourceRoot){
sourceFile = util.relative(sourceRoot, sourceFile);}

this.setSourceContent(sourceFile, content);}}, 

this);};













SourceMapGenerator.prototype._validateMapping = 
function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, 
aName){
if(aGenerated && "line" in aGenerated && "column" in aGenerated && 
aGenerated.line > 0 && aGenerated.column >= 0 && 
!aOriginal && !aSource && !aName){

return;}else 

if(aGenerated && "line" in aGenerated && "column" in aGenerated && 
aOriginal && "line" in aOriginal && "column" in aOriginal && 
aGenerated.line > 0 && aGenerated.column >= 0 && 
aOriginal.line > 0 && aOriginal.column >= 0 && 
aSource){

return;}else 

{
throw new Error("Invalid mapping: " + JSON.stringify({
generated:aGenerated, 
source:aSource, 
orginal:aOriginal, 
name:aName}));}};








SourceMapGenerator.prototype._serializeMappings = 
function SourceMapGenerator_serializeMappings(){
var previousGeneratedColumn=0;
var previousGeneratedLine=1;
var previousOriginalColumn=0;
var previousOriginalLine=0;
var previousName=0;
var previousSource=0;
var result="";
var mapping;






this._mappings.sort(util.compareByGeneratedPositions);

for(var i=0, len=this._mappings.length; i < len; i++) {
mapping = this._mappings[i];

if(mapping.generatedLine !== previousGeneratedLine){
previousGeneratedColumn = 0;
while(mapping.generatedLine !== previousGeneratedLine) {
result += ";";
previousGeneratedLine++;}}else 


{
if(i > 0){
if(!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])){
continue;}

result += ",";}}



result += base64VLQ.encode(mapping.generatedColumn - 
previousGeneratedColumn);
previousGeneratedColumn = mapping.generatedColumn;

if(mapping.source){
result += base64VLQ.encode(this._sources.indexOf(mapping.source) - 
previousSource);
previousSource = this._sources.indexOf(mapping.source);


result += base64VLQ.encode(mapping.originalLine - 1 - 
previousOriginalLine);
previousOriginalLine = mapping.originalLine - 1;

result += base64VLQ.encode(mapping.originalColumn - 
previousOriginalColumn);
previousOriginalColumn = mapping.originalColumn;

if(mapping.name){
result += base64VLQ.encode(this._names.indexOf(mapping.name) - 
previousName);
previousName = this._names.indexOf(mapping.name);}}}




return result;};


SourceMapGenerator.prototype._generateSourcesContent = 
function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot){
return aSources.map(function(source){
if(!this._sourcesContents){
return null;}

if(aSourceRoot){
source = util.relative(aSourceRoot, source);}

var key=util.toSetString(source);
return Object.prototype.hasOwnProperty.call(this._sourcesContents, 
key)?
this._sourcesContents[key]:
null;}, 
this);};





SourceMapGenerator.prototype.toJSON = 
function SourceMapGenerator_toJSON(){
var map={
version:this._version, 
file:this._file, 
sources:this._sources.toArray(), 
names:this._names.toArray(), 
mappings:this._serializeMappings()};

if(this._sourceRoot){
map.sourceRoot = this._sourceRoot;}

if(this._sourcesContents){
map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);}


return map;};





SourceMapGenerator.prototype.toString = 
function SourceMapGenerator_toString(){
return JSON.stringify(this);};


exports.SourceMapGenerator = SourceMapGenerator;});






































define("source-map/base64-vlq", ["require", "exports", "module", "source-map/base64"], function(require, exports, module){

var base64=require("./base64");













var VLQ_BASE_SHIFT=5;


var VLQ_BASE=1 << VLQ_BASE_SHIFT;


var VLQ_BASE_MASK=VLQ_BASE - 1;


var VLQ_CONTINUATION_BIT=VLQ_BASE;







function toVLQSigned(aValue){
return aValue < 0?
(-aValue << 1) + 1:
(aValue << 1) + 0;}








function fromVLQSigned(aValue){
var isNegative=(aValue & 1) === 1;
var shifted=aValue >> 1;
return isNegative?
-shifted:
shifted;}





exports.encode = function base64VLQ_encode(aValue){
var encoded="";
var digit;

var vlq=toVLQSigned(aValue);

do {
digit = vlq & VLQ_BASE_MASK;
vlq >>>= VLQ_BASE_SHIFT;
if(vlq > 0){


digit |= VLQ_CONTINUATION_BIT;}

encoded += base64.encode(digit);}while(
vlq > 0);

return encoded;};






exports.decode = function base64VLQ_decode(aStr){
var i=0;
var strLen=aStr.length;
var result=0;
var shift=0;
var continuation, digit;

do {
if(i >= strLen){
throw new Error("Expected more digits in base 64 VLQ value.");}

digit = base64.decode(aStr.charAt(i++));
continuation = !!(digit & VLQ_CONTINUATION_BIT);
digit &= VLQ_BASE_MASK;
result = result + (digit << shift);
shift += VLQ_BASE_SHIFT;}while(
continuation);

return {
value:fromVLQSigned(result), 
rest:aStr.slice(i)};};});










define("source-map/base64", ["require", "exports", "module"], function(require, exports, module){

var charToIntMap={};
var intToCharMap={};

"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".
split("").
forEach(function(ch, index){
charToIntMap[ch] = index;
intToCharMap[index] = ch;});





exports.encode = function base64_encode(aNumber){
if(aNumber in intToCharMap){
return intToCharMap[aNumber];}

throw new TypeError("Must be between 0 and 63: " + aNumber);};





exports.decode = function base64_decode(aChar){
if(aChar in charToIntMap){
return charToIntMap[aChar];}

throw new TypeError("Not a valid base 64 digit: " + aChar);};});









define("source-map/util", ["require", "exports", "module"], function(require, exports, module){











function getArg(aArgs, aName, aDefaultValue){
if(aName in aArgs){
return aArgs[aName];}else 
if(arguments.length === 3){
return aDefaultValue;}else 
{
throw new Error("\"" + aName + "\" is a required argument.");}}


exports.getArg = getArg;

var urlRegexp=/([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
var dataUrlRegexp=/^data:.+\,.+/;

function urlParse(aUrl){
var match=aUrl.match(urlRegexp);
if(!match){
return null;}

return {
scheme:match[1], 
auth:match[3], 
host:match[4], 
port:match[6], 
path:match[7]};}


exports.urlParse = urlParse;

function urlGenerate(aParsedUrl){
var url=aParsedUrl.scheme + "://";
if(aParsedUrl.auth){
url += aParsedUrl.auth + "@";}

if(aParsedUrl.host){
url += aParsedUrl.host;}

if(aParsedUrl.port){
url += ":" + aParsedUrl.port;}

if(aParsedUrl.path){
url += aParsedUrl.path;}

return url;}

exports.urlGenerate = urlGenerate;

function join(aRoot, aPath){
var url;

if(aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)){
return aPath;}


if(aPath.charAt(0) === "/" && (url = urlParse(aRoot))){
url.path = aPath;
return urlGenerate(url);}


return aRoot.replace(/\/$/, "") + "/" + aPath;}

exports.join = join;










function toSetString(aStr){
return "$" + aStr;}

exports.toSetString = toSetString;

function fromSetString(aStr){
return aStr.substr(1);}

exports.fromSetString = fromSetString;

function relative(aRoot, aPath){
aRoot = aRoot.replace(/\/$/, "");

var url=urlParse(aRoot);
if(aPath.charAt(0) == "/" && url && url.path == "/"){
return aPath.slice(1);}


return aPath.indexOf(aRoot + "/") === 0?
aPath.substr(aRoot.length + 1):
aPath;}

exports.relative = relative;

function strcmp(aStr1, aStr2){
var s1=aStr1 || "";
var s2=aStr2 || "";
return (s1 > s2) - (s1 < s2);}










function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal){
var cmp;

cmp = strcmp(mappingA.source, mappingB.source);
if(cmp){
return cmp;}


cmp = mappingA.originalLine - mappingB.originalLine;
if(cmp){
return cmp;}


cmp = mappingA.originalColumn - mappingB.originalColumn;
if(cmp || onlyCompareOriginal){
return cmp;}


cmp = strcmp(mappingA.name, mappingB.name);
if(cmp){
return cmp;}


cmp = mappingA.generatedLine - mappingB.generatedLine;
if(cmp){
return cmp;}


return mappingA.generatedColumn - mappingB.generatedColumn;}
;
exports.compareByOriginalPositions = compareByOriginalPositions;










function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated){
var cmp;

cmp = mappingA.generatedLine - mappingB.generatedLine;
if(cmp){
return cmp;}


cmp = mappingA.generatedColumn - mappingB.generatedColumn;
if(cmp || onlyCompareGenerated){
return cmp;}


cmp = strcmp(mappingA.source, mappingB.source);
if(cmp){
return cmp;}


cmp = mappingA.originalLine - mappingB.originalLine;
if(cmp){
return cmp;}


cmp = mappingA.originalColumn - mappingB.originalColumn;
if(cmp){
return cmp;}


return strcmp(mappingA.name, mappingB.name);}
;
exports.compareByGeneratedPositions = compareByGeneratedPositions;});








define("source-map/array-set", ["require", "exports", "module", "source-map/util"], function(require, exports, module){

var util=require("./util");







function ArraySet(){
this._array = [];
this._set = {};}





ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates){
var set=new ArraySet();
for(var i=0, len=aArray.length; i < len; i++) {
set.add(aArray[i], aAllowDuplicates);}

return set;};







ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates){
var isDuplicate=this.has(aStr);
var idx=this._array.length;
if(!isDuplicate || aAllowDuplicates){
this._array.push(aStr);}

if(!isDuplicate){
this._set[util.toSetString(aStr)] = idx;}};








ArraySet.prototype.has = function ArraySet_has(aStr){
return Object.prototype.hasOwnProperty.call(this._set, 
util.toSetString(aStr));};







ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr){
if(this.has(aStr)){
return this._set[util.toSetString(aStr)];}

throw new Error("\"" + aStr + "\" is not in the set.");};







ArraySet.prototype.at = function ArraySet_at(aIdx){
if(aIdx >= 0 && aIdx < this._array.length){
return this._array[aIdx];}

throw new Error("No element indexed by " + aIdx);};







ArraySet.prototype.toArray = function ArraySet_toArray(){
return this._array.slice();};


exports.ArraySet = ArraySet;});








define("source-map/source-map-consumer", ["require", "exports", "module", "source-map/util", "source-map/binary-search", "source-map/array-set", "source-map/base64-vlq"], function(require, exports, module){

var util=require("./util");
var binarySearch=require("./binary-search");
var ArraySet=require("./array-set").ArraySet;
var base64VLQ=require("./base64-vlq");































function SourceMapConsumer(aSourceMap){
var sourceMap=aSourceMap;
if(typeof aSourceMap === "string"){
sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));}


var version=util.getArg(sourceMap, "version");
var sources=util.getArg(sourceMap, "sources");


var names=util.getArg(sourceMap, "names", []);
var sourceRoot=util.getArg(sourceMap, "sourceRoot", null);
var sourcesContent=util.getArg(sourceMap, "sourcesContent", null);
var mappings=util.getArg(sourceMap, "mappings");
var file=util.getArg(sourceMap, "file", null);



if(version != this._version){
throw new Error("Unsupported version: " + version);}






this._names = ArraySet.fromArray(names, true);
this._sources = ArraySet.fromArray(sources, true);

this.sourceRoot = sourceRoot;
this.sourcesContent = sourcesContent;
this._mappings = mappings;
this.file = file;}









SourceMapConsumer.fromSourceMap = 
function SourceMapConsumer_fromSourceMap(aSourceMap){
var smc=Object.create(SourceMapConsumer.prototype);

smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
smc.sourceRoot = aSourceMap._sourceRoot;
smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), 
smc.sourceRoot);
smc.file = aSourceMap._file;

smc.__generatedMappings = aSourceMap._mappings.slice().
sort(util.compareByGeneratedPositions);
smc.__originalMappings = aSourceMap._mappings.slice().
sort(util.compareByOriginalPositions);

return smc;};





SourceMapConsumer.prototype._version = 3;




Object.defineProperty(SourceMapConsumer.prototype, "sources", {
get:function(){
return this._sources.toArray().map(function(s){
return this.sourceRoot?util.join(this.sourceRoot, s):s;}, 
this);}});

































SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
get:function(){
if(!this.__generatedMappings){
this.__generatedMappings = [];
this.__originalMappings = [];
this._parseMappings(this._mappings, this.sourceRoot);}


return this.__generatedMappings;}});



SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
get:function(){
if(!this.__originalMappings){
this.__generatedMappings = [];
this.__originalMappings = [];
this._parseMappings(this._mappings, this.sourceRoot);}


return this.__originalMappings;}});








SourceMapConsumer.prototype._parseMappings = 
function SourceMapConsumer_parseMappings(aStr, aSourceRoot){
var generatedLine=1;
var previousGeneratedColumn=0;
var previousOriginalLine=0;
var previousOriginalColumn=0;
var previousSource=0;
var previousName=0;
var mappingSeparator=/^[,;]/;
var str=aStr;
var mapping;
var temp;

while(str.length > 0) {
if(str.charAt(0) === ";"){
generatedLine++;
str = str.slice(1);
previousGeneratedColumn = 0;}else 

if(str.charAt(0) === ","){
str = str.slice(1);}else 

{
mapping = {};
mapping.generatedLine = generatedLine;


temp = base64VLQ.decode(str);
mapping.generatedColumn = previousGeneratedColumn + temp.value;
previousGeneratedColumn = mapping.generatedColumn;
str = temp.rest;

if(str.length > 0 && !mappingSeparator.test(str.charAt(0))){

temp = base64VLQ.decode(str);
mapping.source = this._sources.at(previousSource + temp.value);
previousSource += temp.value;
str = temp.rest;
if(str.length === 0 || mappingSeparator.test(str.charAt(0))){
throw new Error("Found a source, but no line and column");}



temp = base64VLQ.decode(str);
mapping.originalLine = previousOriginalLine + temp.value;
previousOriginalLine = mapping.originalLine;

mapping.originalLine += 1;
str = temp.rest;
if(str.length === 0 || mappingSeparator.test(str.charAt(0))){
throw new Error("Found a source and line, but no column");}



temp = base64VLQ.decode(str);
mapping.originalColumn = previousOriginalColumn + temp.value;
previousOriginalColumn = mapping.originalColumn;
str = temp.rest;

if(str.length > 0 && !mappingSeparator.test(str.charAt(0))){

temp = base64VLQ.decode(str);
mapping.name = this._names.at(previousName + temp.value);
previousName += temp.value;
str = temp.rest;}}



this.__generatedMappings.push(mapping);
if(typeof mapping.originalLine === "number"){
this.__originalMappings.push(mapping);}}}




this.__originalMappings.sort(util.compareByOriginalPositions);};






SourceMapConsumer.prototype._findMapping = 
function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, 
aColumnName, aComparator){





if(aNeedle[aLineName] <= 0){
throw new TypeError("Line must be greater than or equal to 1, got " + 
aNeedle[aLineName]);}

if(aNeedle[aColumnName] < 0){
throw new TypeError("Column must be greater than or equal to 0, got " + 
aNeedle[aColumnName]);}


return binarySearch.search(aNeedle, aMappings, aComparator);};

















SourceMapConsumer.prototype.originalPositionFor = 
function SourceMapConsumer_originalPositionFor(aArgs){
var needle={
generatedLine:util.getArg(aArgs, "line"), 
generatedColumn:util.getArg(aArgs, "column")};


var mapping=this._findMapping(needle, 
this._generatedMappings, 
"generatedLine", 
"generatedColumn", 
util.compareByGeneratedPositions);

if(mapping){
var source=util.getArg(mapping, "source", null);
if(source && this.sourceRoot){
source = util.join(this.sourceRoot, source);}

return {
source:source, 
line:util.getArg(mapping, "originalLine", null), 
column:util.getArg(mapping, "originalColumn", null), 
name:util.getArg(mapping, "name", null)};}



return {
source:null, 
line:null, 
column:null, 
name:null};};








SourceMapConsumer.prototype.sourceContentFor = 
function SourceMapConsumer_sourceContentFor(aSource){
if(!this.sourcesContent){
return null;}


if(this.sourceRoot){
aSource = util.relative(this.sourceRoot, aSource);}


if(this._sources.has(aSource)){
return this.sourcesContent[this._sources.indexOf(aSource)];}


var url;
if(this.sourceRoot && (
url = util.urlParse(this.sourceRoot))){




var fileUriAbsPath=aSource.replace(/^file:\/\//, "");
if(url.scheme == "file" && 
this._sources.has(fileUriAbsPath)){
return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];}


if((!url.path || url.path == "/") && 
this._sources.has("/" + aSource)){
return this.sourcesContent[this._sources.indexOf("/" + aSource)];}}



throw new Error("\"" + aSource + "\" is not in the SourceMap.");};
















SourceMapConsumer.prototype.generatedPositionFor = 
function SourceMapConsumer_generatedPositionFor(aArgs){
var needle={
source:util.getArg(aArgs, "source"), 
originalLine:util.getArg(aArgs, "line"), 
originalColumn:util.getArg(aArgs, "column")};


if(this.sourceRoot){
needle.source = util.relative(this.sourceRoot, needle.source);}


var mapping=this._findMapping(needle, 
this._originalMappings, 
"originalLine", 
"originalColumn", 
util.compareByOriginalPositions);

if(mapping){
return {
line:util.getArg(mapping, "generatedLine", null), 
column:util.getArg(mapping, "generatedColumn", null)};}



return {
line:null, 
column:null};};



SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

















SourceMapConsumer.prototype.eachMapping = 
function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder){
var context=aContext || null;
var order=aOrder || SourceMapConsumer.GENERATED_ORDER;

var mappings;
switch(order){
case SourceMapConsumer.GENERATED_ORDER:
mappings = this._generatedMappings;
break;
case SourceMapConsumer.ORIGINAL_ORDER:
mappings = this._originalMappings;
break;
default:
throw new Error("Unknown order of iteration.");}


var sourceRoot=this.sourceRoot;
mappings.map(function(mapping){
var source=mapping.source;
if(source && sourceRoot){
source = util.join(sourceRoot, source);}

return {
source:source, 
generatedLine:mapping.generatedLine, 
generatedColumn:mapping.generatedColumn, 
originalLine:mapping.originalLine, 
originalColumn:mapping.originalColumn, 
name:mapping.name};}).

forEach(aCallback, context);};


exports.SourceMapConsumer = SourceMapConsumer;});








define("source-map/binary-search", ["require", "exports", "module"], function(require, exports, module){










function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare){










var mid=Math.floor((aHigh - aLow) / 2) + aLow;
var cmp=aCompare(aNeedle, aHaystack[mid], true);
if(cmp === 0){

return aHaystack[mid];}else 

if(cmp > 0){

if(aHigh - mid > 1){

return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);}



return aHaystack[mid];}else 

{

if(mid - aLow > 1){

return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);}



return aLow < 0?
null:
aHaystack[aLow];}}
















exports.search = function search(aNeedle, aHaystack, aCompare){
return aHaystack.length > 0?
recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare):
null;};});









define("source-map/source-node", ["require", "exports", "module", "source-map/source-map-generator", "source-map/util"], function(require, exports, module){

var SourceMapGenerator=require("./source-map-generator").SourceMapGenerator;
var util=require("./util");













function SourceNode(aLine, aColumn, aSource, aChunks, aName){
this.children = [];
this.sourceContents = {};
this.line = aLine === undefined?null:aLine;
this.column = aColumn === undefined?null:aColumn;
this.source = aSource === undefined?null:aSource;
this.name = aName === undefined?null:aName;
if(aChunks != null)this.add(aChunks);}








SourceNode.fromStringWithSourceMap = 
function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer){


var node=new SourceNode();



var remainingLines=aGeneratedCode.split("\n");


var lastGeneratedLine=1, lastGeneratedColumn=0;




var lastMapping=null;

aSourceMapConsumer.eachMapping(function(mapping){
if(lastMapping === null){



while(lastGeneratedLine < mapping.generatedLine) {
node.add(remainingLines.shift() + "\n");
lastGeneratedLine++;}

if(lastGeneratedColumn < mapping.generatedColumn){
var nextLine=remainingLines[0];
node.add(nextLine.substr(0, mapping.generatedColumn));
remainingLines[0] = nextLine.substr(mapping.generatedColumn);
lastGeneratedColumn = mapping.generatedColumn;}}else 

{


if(lastGeneratedLine < mapping.generatedLine){
var code="";

do {
code += remainingLines.shift() + "\n";
lastGeneratedLine++;
lastGeneratedColumn = 0;}while(
lastGeneratedLine < mapping.generatedLine);


if(lastGeneratedColumn < mapping.generatedColumn){
var nextLine=remainingLines[0];
code += nextLine.substr(0, mapping.generatedColumn);
remainingLines[0] = nextLine.substr(mapping.generatedColumn);
lastGeneratedColumn = mapping.generatedColumn;}


addMappingWithCode(lastMapping, code);}else 
{



var nextLine=remainingLines[0];
var code=nextLine.substr(0, mapping.generatedColumn - 
lastGeneratedColumn);
remainingLines[0] = nextLine.substr(mapping.generatedColumn - 
lastGeneratedColumn);
lastGeneratedColumn = mapping.generatedColumn;
addMappingWithCode(lastMapping, code);}}


lastMapping = mapping;}, 
this);



addMappingWithCode(lastMapping, remainingLines.join("\n"));


aSourceMapConsumer.sources.forEach(function(sourceFile){
var content=aSourceMapConsumer.sourceContentFor(sourceFile);
if(content){
node.setSourceContent(sourceFile, content);}});



return node;

function addMappingWithCode(mapping, code){
if(mapping === null || mapping.source === undefined){
node.add(code);}else 
{
node.add(new SourceNode(mapping.originalLine, 
mapping.originalColumn, 
mapping.source, 
code, 
mapping.name));}}};










SourceNode.prototype.add = function SourceNode_add(aChunk){
if(Array.isArray(aChunk)){
aChunk.forEach(function(chunk){
this.add(chunk);}, 
this);}else 

if(aChunk instanceof SourceNode || typeof aChunk === "string"){
if(aChunk){
this.children.push(aChunk);}}else 


{
throw new TypeError(
"Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);}


return this;};








SourceNode.prototype.prepend = function SourceNode_prepend(aChunk){
if(Array.isArray(aChunk)){
for(var i=aChunk.length - 1; i >= 0; i--) {
this.prepend(aChunk[i]);}}else 


if(aChunk instanceof SourceNode || typeof aChunk === "string"){
this.children.unshift(aChunk);}else 

{
throw new TypeError(
"Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);}


return this;};









SourceNode.prototype.walk = function SourceNode_walk(aFn){
var chunk;
for(var i=0, len=this.children.length; i < len; i++) {
chunk = this.children[i];
if(chunk instanceof SourceNode){
chunk.walk(aFn);}else 

{
if(chunk !== ""){
aFn(chunk, {source:this.source, 
line:this.line, 
column:this.column, 
name:this.name});}}}};











SourceNode.prototype.join = function SourceNode_join(aSep){
var newChildren;
var i;
var len=this.children.length;
if(len > 0){
newChildren = [];
for(i = 0; i < len - 1; i++) {
newChildren.push(this.children[i]);
newChildren.push(aSep);}

newChildren.push(this.children[i]);
this.children = newChildren;}

return this;};









SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement){
var lastChild=this.children[this.children.length - 1];
if(lastChild instanceof SourceNode){
lastChild.replaceRight(aPattern, aReplacement);}else 

if(typeof lastChild === "string"){
this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);}else 

{
this.children.push("".replace(aPattern, aReplacement));}

return this;};









SourceNode.prototype.setSourceContent = 
function SourceNode_setSourceContent(aSourceFile, aSourceContent){
this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;};








SourceNode.prototype.walkSourceContents = 
function SourceNode_walkSourceContents(aFn){
for(var i=0, len=this.children.length; i < len; i++) {
if(this.children[i] instanceof SourceNode){
this.children[i].walkSourceContents(aFn);}}



var sources=Object.keys(this.sourceContents);
for(var i=0, len=sources.length; i < len; i++) {
aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);}};







SourceNode.prototype.toString = function SourceNode_toString(){
var str="";
this.walk(function(chunk){
str += chunk;});

return str;};






SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs){
var generated={
code:"", 
line:1, 
column:0};

var map=new SourceMapGenerator(aArgs);
var sourceMappingActive=false;
var lastOriginalSource=null;
var lastOriginalLine=null;
var lastOriginalColumn=null;
var lastOriginalName=null;
this.walk(function(chunk, original){
generated.code += chunk;
if(original.source !== null && 
original.line !== null && 
original.column !== null){
if(lastOriginalSource !== original.source || 
lastOriginalLine !== original.line || 
lastOriginalColumn !== original.column || 
lastOriginalName !== original.name){
map.addMapping({
source:original.source, 
original:{
line:original.line, 
column:original.column}, 

generated:{
line:generated.line, 
column:generated.column}, 

name:original.name});}


lastOriginalSource = original.source;
lastOriginalLine = original.line;
lastOriginalColumn = original.column;
lastOriginalName = original.name;
sourceMappingActive = true;}else 
if(sourceMappingActive){
map.addMapping({
generated:{
line:generated.line, 
column:generated.column}});


lastOriginalSource = null;
sourceMappingActive = false;}

chunk.split("").forEach(function(ch){
if(ch === "\n"){
generated.line++;
generated.column = 0;}else 
{
generated.column++;}});});



this.walkSourceContents(function(sourceFile, sourceContent){
map.setSourceContent(sourceFile, sourceContent);});


return {code:generated.code, map:map};};


exports.SourceNode = SourceNode;});





this.sourceMap = {
SourceMapConsumer:require("source-map/source-map-consumer").SourceMapConsumer, 
SourceMapGenerator:require("source-map/source-map-generator").SourceMapGenerator, 
SourceNode:require("source-map/source-node").SourceNode};}});
__d('react-native/Libraries/JavaScriptAppEngine/Initialization/source-map-url',[],function(global, require, requireDynamic, requireLazy, module, exports) {  (














function(){
var define=null;




void (function(root, factory){
if(typeof define === "function" && define.amd){
define(factory);}else 
if(typeof exports === "object"){
module.exports = factory();}else 
{
root.sourceMappingURL = factory();}})(

this, function(){

var innerRegex=/[#@] sourceMappingURL=([^\s'"]*)/;

var regex=RegExp(
"(?:" + 
"/\\*" + 
"(?:\\s*\r?\n(?://)?)?" + 
"(?:" + innerRegex.source + ")" + 
"\\s*" + 
"\\*/" + 
"|" + 
"//(?:" + innerRegex.source + ")" + 
")" + 
"\\s*$");


return {

regex:regex, 
_innerRegex:innerRegex, 

getFrom:function(code){
var match=code.match(regex);
return match?match[1] || match[2] || "":null;}, 


existsIn:function(code){
return regex.test(code);}, 


removeFrom:function(code){
return code.replace(regex, "");}, 


insertBefore:function(code, string){
var match=code.match(regex);
if(match){
return code.slice(0, match.index) + string + code.slice(match.index);}else 
{
return code + string;}}};});})();});
__d('parseErrorStack',["stacktrace-parser/index"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var stacktraceParser=require('stacktrace-parser/index');

function resolveSourceMaps(sourceMapInstance, stackFrame){
try{
var orig=sourceMapInstance.originalPositionFor({
line:stackFrame.lineNumber, 
column:stackFrame.column});

if(orig){
stackFrame.file = orig.source;
stackFrame.lineNumber = orig.line;
stackFrame.column = orig.column;}}

catch(innerEx) {}}



function parseErrorStack(e, sourceMapInstance){
var stack=stacktraceParser.parse(e.stack);

var framesToPop=e.framesToPop || 0;
while(framesToPop--) {
stack.shift();}


if(sourceMapInstance){
stack.forEach(resolveSourceMaps.bind(null, sourceMapInstance));}


return stack;}


module.exports = parseErrorStack;});
__d('stacktrace-parser/index',["stacktrace-parser/lib/stacktrace-parser"],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = require('stacktrace-parser/lib/stacktrace-parser');});
__d('stacktrace-parser/lib/stacktrace-parser',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var 

UNKNOWN_FUNCTION='<unknown>';

var StackTraceParser={




parse:function(stackString){
var chrome=/^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i, 
gecko=/^(?:\s*(\S*)(?:\((.*?)\))?@)?((?:\w).*?):(\d+)(?::(\d+))?\s*$/i, 
node=/^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i, 
lines=stackString.split('\n'), 
stack=[], 
parts, 
element;

for(var i=0, j=lines.length; i < j; ++i) {
if(parts = gecko.exec(lines[i])){
element = {
'file':parts[3], 
'methodName':parts[1] || UNKNOWN_FUNCTION, 
'lineNumber':+parts[4], 
'column':parts[5]?+parts[5]:null};}else 

if(parts = chrome.exec(lines[i])){
element = {
'file':parts[2], 
'methodName':parts[1] || UNKNOWN_FUNCTION, 
'lineNumber':+parts[3], 
'column':parts[4]?+parts[4]:null};}else 

if(parts = node.exec(lines[i])){
element = {
'file':parts[2], 
'methodName':parts[1] || UNKNOWN_FUNCTION, 
'lineNumber':+parts[3], 
'column':parts[4]?+parts[4]:null};}else 

{
continue;}


stack.push(element);}


return stack;}};




module.exports = StackTraceParser;});
__d('stringifySafe',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















function stringifySafe(arg){
var ret;
var type=typeof arg;
if(arg === undefined){
ret = 'undefined';}else 
if(arg === null){
ret = 'null';}else 
if(type === 'string'){
ret = '"' + arg + '"';}else 
if(type === 'function'){
try{
ret = arg.toString();}
catch(e) {
ret = '[function unknown]';}}else 

{


try{
ret = JSON.stringify(arg);}
catch(e) {
if(typeof arg.toString === 'function'){
try{
ret = arg.toString();}
catch(E) {}}}}



return ret || '["' + type + '" failed to stringify]';}


module.exports = stringifySafe;});
__d('Platform',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var Platform={
OS:'ios'};


module.exports = Platform;});
__d('XMLHttpRequest',["FormData","NativeModules","RCTDeviceEventEmitter","XMLHttpRequestBase"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var FormData=require('FormData');
var RCTDataManager=require('NativeModules').DataManager;
var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');

var XMLHttpRequestBase=require('XMLHttpRequestBase');var 

XMLHttpRequest=(function(_XMLHttpRequestBase){




function XMLHttpRequest(){_classCallCheck(this, XMLHttpRequest);
_get(Object.getPrototypeOf(XMLHttpRequest.prototype), 'constructor', this).call(this);
this._requestId = null;
this._subscriptions = [];}_inherits(XMLHttpRequest, _XMLHttpRequestBase);_createClass(XMLHttpRequest, [{key:'_didCreateRequest', value:


function _didCreateRequest(requestId){var _this=this;
this._requestId = requestId;
this._subscriptions.push(RCTDeviceEventEmitter.addListener(
'didReceiveNetworkResponse', 
function(args){return _this._didReceiveResponse.call(_this, args[0], args[1], args[2]);}));

this._subscriptions.push(RCTDeviceEventEmitter.addListener(
'didReceiveNetworkData', 
function(args){return _this._didReceiveData.call(_this, args[0], args[1]);}));

this._subscriptions.push(RCTDeviceEventEmitter.addListener(
'didCompleteNetworkResponse', 
function(args){return _this._didCompleteResponse.call(_this, args[0], args[1]);}));}}, {key:'_didReceiveResponse', value:



function _didReceiveResponse(requestId, status, responseHeaders){
if(requestId === this._requestId){
this.status = status;
this.setResponseHeaders(responseHeaders);
this.setReadyState(this.HEADERS_RECEIVED);}}}, {key:'_didReceiveData', value:



function _didReceiveData(requestId, responseText){
if(requestId === this._requestId){
if(!this.responseText){
this.responseText = responseText;}else 
{
this.responseText += responseText;}

this.setReadyState(this.LOADING);}}}, {key:'_didCompleteResponse', value:



function _didCompleteResponse(requestId, error){
if(requestId === this._requestId){
if(error){
this.responseText = error;}

this._clearSubscriptions();
this._requestId = null;
this.setReadyState(this.DONE);}}}, {key:'_clearSubscriptions', value:



function _clearSubscriptions(){
for(var i=0; i < this._subscriptions.length; i++) {
var sub=this._subscriptions[i];
sub.remove();}

this._subscriptions = [];}}, {key:'sendImpl', value:


function sendImpl(method, url, headers, data){
if(typeof data === 'string'){
data = {string:data};}

if(data instanceof FormData){
data = {formData:data.getParts()};}

RCTDataManager.sendRequest(
{
method:method, 
url:url, 
data:data, 
headers:headers, 
incrementalUpdates:this.onreadystatechange?true:false}, 

this._didCreateRequest.bind(this));}}, {key:'abortImpl', value:



function abortImpl(){
if(this._requestId){
RCTDataManager.cancelRequest(this._requestId);
this._clearSubscriptions();
this._requestId = null;}}}]);return XMLHttpRequest;})(XMLHttpRequestBase);




module.exports = XMLHttpRequest;});
__d('FormData',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _slicedToArray(arr, i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if(i && _arr.length === i)break;}}catch(err) {_d = true;_e = err;}finally {try{if(!_n && _i['return'])_i['return']();}finally {if(_d)throw _e;}}return _arr;}else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}}function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var 



















FormData=(function(){



function FormData(){_classCallCheck(this, FormData);
this._parts = [];
this._partsByKey = {};}_createClass(FormData, [{key:'append', value:


function append(key, value){
var parts=this._partsByKey[key];
if(parts){




parts[1] = value;
return;}

parts = [key, value];
this._parts.push(parts);
this._partsByKey[key] = parts;}}, {key:'getParts', value:


function getParts(){
return this._parts.map(function(_ref){var _ref2=_slicedToArray(_ref, 2);var name=_ref2[0];var value=_ref2[1];
if(typeof value === 'string'){
return {
string:value, 
headers:{
'content-disposition':'form-data; name="' + name + '"'}};}



var contentDisposition='form-data; name="' + name + '"';
if(typeof value.name === 'string'){
contentDisposition += '; filename="' + value.name + '"';}

return _extends({}, 
value, {
headers:{'content-disposition':contentDisposition}});});}}]);return FormData;})();





module.exports = FormData;});
__d('XMLHttpRequestBase',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var 















XMLHttpRequestBase=(function(){






















function XMLHttpRequestBase(){_classCallCheck(this, XMLHttpRequestBase);
this.UNSENT = 0;
this.OPENED = 1;
this.HEADERS_RECEIVED = 2;
this.LOADING = 3;
this.DONE = 4;

this.onreadystatechange = null;
this.onload = null;
this.upload = undefined;

this._reset();
this._method = null;
this._url = null;
this._aborted = false;}_createClass(XMLHttpRequestBase, [{key:'_reset', value:


function _reset(){
this.readyState = this.UNSENT;
this.responseHeaders = undefined;
this.responseText = '';
this.status = 0;

this._headers = {};
this._sent = false;
this._lowerCaseResponseHeaders = {};}}, {key:'getAllResponseHeaders', value:


function getAllResponseHeaders(){
if(!this.responseHeaders){

return null;}

var headers=this.responseHeaders || {};
return Object.keys(headers).map(function(headerName){
return headerName + ': ' + headers[headerName];}).
join('\n');}}, {key:'getResponseHeader', value:


function getResponseHeader(header){
var value=this._lowerCaseResponseHeaders[header.toLowerCase()];
return value !== undefined?value:null;}}, {key:'setRequestHeader', value:


function setRequestHeader(header, value){
if(this.readyState !== this.OPENED){
throw new Error('Request has not been opened');}

this._headers[header.toLowerCase()] = value;}}, {key:'open', value:


function open(method, url, async){

if(this.readyState !== this.UNSENT){
throw new Error('Cannot open, already sending');}

if(async !== undefined && !async){

throw new Error('Synchronous http requests are not supported');}

this._reset();
this._method = method;
this._url = url;
this._aborted = false;
this.setReadyState(this.OPENED);}}, {key:'sendImpl', value:


function sendImpl(method, url, headers, data){
throw new Error('Subclass must define sendImpl method');}}, {key:'abortImpl', value:


function abortImpl(){
throw new Error('Subclass must define abortImpl method');}}, {key:'send', value:


function send(data){
if(this.readyState !== this.OPENED){
throw new Error('Request has not been opened');}

if(this._sent){
throw new Error('Request has already been sent');}

this._sent = true;
this.sendImpl(this._method, this._url, this._headers, data);}}, {key:'abort', value:


function abort(){
this._aborted = true;
this.abortImpl();


if(!(this.readyState === this.UNSENT || 
this.readyState === this.OPENED && !this._sent || 
this.readyState === this.DONE)){
this._reset();
this.setReadyState(this.DONE);}


this._reset();}}, {key:'callback', value:


function callback(status, responseHeaders, responseText){
if(this._aborted){
return;}

this.status = status;
this.setResponseHeaders(responseHeaders);
this.responseText = responseText;
this.setReadyState(this.DONE);}}, {key:'setResponseHeaders', value:


function setResponseHeaders(responseHeaders){
this.responseHeaders = responseHeaders || null;
var headers=responseHeaders || {};
this._lowerCaseResponseHeaders = 
Object.keys(headers).reduce(function(lcaseHeaders, headerName){
lcaseHeaders[headerName.toLowerCase()] = headers[headerName];
return headers;}, 
{});}}, {key:'setReadyState', value:


function setReadyState(newState){
this.readyState = newState;

var onreadystatechange=this.onreadystatechange;
if(onreadystatechange){


onreadystatechange(null);}

if(newState === this.DONE && !this._aborted){
this._sendLoad();}}}, {key:'_sendLoad', value:



function _sendLoad(){

var onload=this.onload;
if(onload){


onload(null);}}}]);return XMLHttpRequestBase;})();




module.exports = XMLHttpRequestBase;});
__d('fetch',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var self={};

























(function(){
'use strict';

if(self.fetch){
return;}


function normalizeName(name){
if(typeof name !== 'string'){
name = name.toString();}

if(/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)){
throw new TypeError('Invalid character in header field name');}

return name.toLowerCase();}


function normalizeValue(value){
if(typeof value !== 'string'){
value = value.toString();}

return value;}


function Headers(headers){
this.map = {};

var self=this;
if(headers instanceof Headers){
headers.forEach(function(name, values){
values.forEach(function(value){
self.append(name, value);});});}else 



if(headers){
Object.getOwnPropertyNames(headers).forEach(function(name){
self.append(name, headers[name]);});}}




Headers.prototype.append = function(name, value){
name = normalizeName(name);
value = normalizeValue(value);
var list=this.map[name];
if(!list){
list = [];
this.map[name] = list;}

list.push(value);};


Headers.prototype['delete'] = function(name){
delete this.map[normalizeName(name)];};


Headers.prototype.get = function(name){
var values=this.map[normalizeName(name)];
return values?values[0]:null;};


Headers.prototype.getAll = function(name){
return this.map[normalizeName(name)] || [];};


Headers.prototype.has = function(name){
return this.map.hasOwnProperty(normalizeName(name));};


Headers.prototype.set = function(name, value){
this.map[normalizeName(name)] = [normalizeValue(value)];};



Headers.prototype.forEach = function(callback){
var self=this;
Object.getOwnPropertyNames(this.map).forEach(function(name){
callback(name, self.map[name]);});};



function consumed(body){
if(body.bodyUsed){
return Promise.reject(new TypeError('Already read'));}

body.bodyUsed = true;}


function fileReaderReady(reader){
return new Promise(function(resolve, reject){
reader.onload = function(){
resolve(reader.result);};

reader.onerror = function(){
reject(reader.error);};});}




function readBlobAsArrayBuffer(blob){
var reader=new FileReader();
reader.readAsArrayBuffer(blob);
return fileReaderReady(reader);}


function readBlobAsText(blob){
var reader=new FileReader();
reader.readAsText(blob);
return fileReaderReady(reader);}


var support={
blob:'FileReader' in self && 'Blob' in self && (function(){
try{
new Blob();
return true;}
catch(e) {
return false;}})(), 


formData:'FormData' in self};


function Body(){
this.bodyUsed = false;


this._initBody = function(body){
this._bodyInit = body;
if(typeof body === 'string'){
this._bodyText = body;}else 
if(support.blob && Blob.prototype.isPrototypeOf(body)){
this._bodyBlob = body;}else 
if(support.formData && FormData.prototype.isPrototypeOf(body)){
this._bodyFormData = body;}else 
if(!body){
this._bodyText = '';}else 
{
throw new Error('unsupported BodyInit type');}};



if(support.blob){
this.blob = function(){
var rejected=consumed(this);
if(rejected){
return rejected;}


if(this._bodyBlob){
return Promise.resolve(this._bodyBlob);}else 
if(this._bodyFormData){
throw new Error('could not read FormData body as blob');}else 
{
return Promise.resolve(new Blob([this._bodyText]));}};



this.arrayBuffer = function(){
return this.blob().then(readBlobAsArrayBuffer);};


this.text = function(){
var rejected=consumed(this);
if(rejected){
return rejected;}


if(this._bodyBlob){
return readBlobAsText(this._bodyBlob);}else 
if(this._bodyFormData){
throw new Error('could not read FormData body as text');}else 
{
return Promise.resolve(this._bodyText);}};}else 


{
this.text = function(){
var rejected=consumed(this);
return rejected?rejected:Promise.resolve(this._bodyText);};}



if(support.formData){
this.formData = function(){
return this.text().then(decode);};}



this.json = function(){
return this.text().then(JSON.parse);};


return this;}



var methods=['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

function normalizeMethod(method){
var upcased=method.toUpperCase();
return methods.indexOf(upcased) > -1?upcased:method;}


function Request(url, options){
options = options || {};
this.url = url;

this.credentials = options.credentials || 'omit';
this.headers = new Headers(options.headers);
this.method = normalizeMethod(options.method || 'GET');
this.mode = options.mode || null;
this.referrer = null;

if((this.method === 'GET' || this.method === 'HEAD') && options.body){
throw new TypeError('Body not allowed for GET or HEAD requests');}

this._initBody(options.body);}


function decode(body){
var form=new FormData();
body.trim().split('&').forEach(function(bytes){
if(bytes){
var split=bytes.split('=');
var name=split.shift().replace(/\+/g, ' ');
var value=split.join('=').replace(/\+/g, ' ');
form.append(decodeURIComponent(name), decodeURIComponent(value));}});


return form;}


function headers(xhr){
var head=new Headers();
var pairs=xhr.getAllResponseHeaders().trim().split('\n');
pairs.forEach(function(header){
var split=header.trim().split(':');
var key=split.shift().trim();
var value=split.join(':').trim();
head.append(key, value);});

return head;}


Body.call(Request.prototype);

function Response(bodyInit, options){
if(!options){
options = {};}


this._initBody(bodyInit);
this.type = 'default';
this.url = null;
this.status = options.status;
this.ok = this.status >= 200 && this.status < 300;
this.statusText = options.statusText;
this.headers = options.headers instanceof Headers?options.headers:new Headers(options.headers);
this.url = options.url || '';}


Body.call(Response.prototype);

self.Headers = Headers;
self.Request = Request;
self.Response = Response;

self.fetch = function(input, init){

var request;
if(Request.prototype.isPrototypeOf(input) && !init){
request = input;}else 
{
request = new Request(input, init);}


return new Promise(function(resolve, reject){
var xhr=new XMLHttpRequest();
if(request.credentials === 'cors'){
xhr.withCredentials = true;}


function responseURL(){
if('responseURL' in xhr){
return xhr.responseURL;}



if(/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())){
return xhr.getResponseHeader('X-Request-URL');}


return;}


xhr.onload = function(){
var status=xhr.status === 1223?204:xhr.status;
if(status < 100 || status > 599){
reject(new TypeError('Network request failed'));
return;}

var options={
status:status, 
statusText:xhr.statusText, 
headers:headers(xhr), 
url:responseURL()};

var body='response' in xhr?xhr.response:xhr.responseText;
resolve(new Response(body, options));};


xhr.onerror = function(){
reject(new TypeError('Network request failed'));};


xhr.open(request.method, request.url, true);

if('responseType' in xhr && support.blob){
xhr.responseType = 'blob';}


request.headers.forEach(function(name, values){
values.forEach(function(value){
xhr.setRequestHeader(name, value);});});



xhr.send(typeof request._bodyInit === 'undefined'?null:request._bodyInit);});};


self.fetch.polyfill = true;})();




module.exports = self;});
__d('Geolocation',["RCTDeviceEventEmitter","NativeModules","invariant","logError","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var RCTLocationObserver=require('NativeModules').LocationObserver;

var invariant=require('invariant');
var logError=require('logError');
var warning=require('warning');

var subscriptions=[];

var updatesEnabled=false;















var Geolocation={





getCurrentPosition:function(
geo_success, 
geo_error, 
geo_options)
{
invariant(
typeof geo_success === 'function', 
'Must provide a valid geo_success callback.');

RCTLocationObserver.getCurrentPosition(
geo_options || {}, 
geo_success, 
geo_error || logError);}, 







watchPosition:function(success, error, options){
if(!updatesEnabled){
RCTLocationObserver.startObserving(options || {});
updatesEnabled = true;}

var watchID=subscriptions.length;
subscriptions.push([
RCTDeviceEventEmitter.addListener(
'geolocationDidChange', 
success), 

error?RCTDeviceEventEmitter.addListener(
'geolocationError', 
error):
null]);

return watchID;}, 


clearWatch:function(watchID){
var sub=subscriptions[watchID];
if(!sub){


return;}


sub[0].remove();

var sub1=sub[1];sub1 && sub1.remove();
subscriptions[watchID] = undefined;
var noWatchers=true;
for(var ii=0; ii < subscriptions.length; ii++) {
if(subscriptions[ii]){
noWatchers = false;}}


if(noWatchers){
Geolocation.stopObserving();}}, 



stopObserving:function(){
if(updatesEnabled){
RCTLocationObserver.stopObserving();
updatesEnabled = false;
for(var ii=0; ii < subscriptions.length; ii++) {
var sub=subscriptions[ii];
if(sub){
warning('Called stopObserving with existing subscriptions.');
sub[0].remove();

var sub1=sub[1];sub1 && sub1.remove();}}


subscriptions = [];}}};




module.exports = Geolocation;});
__d('logError',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var logError=function(){
if(arguments.length === 1 && arguments[0] instanceof Error){
var err=arguments[0];
console.error('Error: "' + err.message + '".  Stack:\n' + err.stack);}else 
{
console.error.apply(console, arguments);}};



module.exports = logError;});
__d('WebSocket',["RCTDeviceEventEmitter","NativeModules","WebSocketBase"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var RCTWebSocketManager=require('NativeModules').WebSocketManager;

var WebSocketBase=require('WebSocketBase');

var WebSocketId=0;var 

WebSocket=(function(_WebSocketBase){function WebSocket(){_classCallCheck(this, WebSocket);if(_WebSocketBase != null){_WebSocketBase.apply(this, arguments);}}_inherits(WebSocket, _WebSocketBase);_createClass(WebSocket, [{key:'connectToSocketImpl', value:



function connectToSocketImpl(url){
this._socketId = WebSocketId++;
RCTWebSocketManager.connect(url, this._socketId);
this._registerEvents(this._socketId);}}, {key:'closeConnectionImpl', value:


function closeConnectionImpl(){
RCTWebSocketManager.close(this._socketId);}}, {key:'cancelConnectionImpl', value:


function cancelConnectionImpl(){
RCTWebSocketManager.close(this._socketId);}}, {key:'sendStringImpl', value:


function sendStringImpl(message){
RCTWebSocketManager.send(message, this._socketId);}}, {key:'sendArrayBufferImpl', value:


function sendArrayBufferImpl(){

console.warn('Sending ArrayBuffers is not yet supported');}}, {key:'_unregisterEvents', value:


function _unregisterEvents(){
this._subs.forEach(function(e){return e.remove();});
this._subs = [];}}, {key:'_registerEvents', value:


function _registerEvents(id){
this._subs = [
RCTDeviceEventEmitter.addListener(
'websocketMessage', 
(function(ev){
if(ev.id !== id){
return;}

this.onmessage && this.onmessage({
data:ev.data});}).

bind(this)), 

RCTDeviceEventEmitter.addListener(
'websocketOpen', 
(function(ev){
if(ev.id !== id){
return;}

this.readyState = this.OPEN;
this.onopen && this.onopen();}).
bind(this)), 

RCTDeviceEventEmitter.addListener(
'websocketClosed', 
(function(ev){
if(ev.id !== id){
return;}

this.readyState = this.CLOSED;
this.onclose && this.onclose(ev);
this._unregisterEvents();
RCTWebSocketManager.close(id);}).
bind(this)), 

RCTDeviceEventEmitter.addListener(
'websocketFailed', 
(function(ev){
if(ev.id !== id){
return;}

this.onerror && this.onerror(new Error(ev.message));
this._unregisterEvents();
RCTWebSocketManager.close(id);}).
bind(this))];}}]);return WebSocket;})(WebSocketBase);






module.exports = WebSocket;});
__d('WebSocketBase',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var 















WebSocketBase=(function(){

















function WebSocketBase(url, protocols){_classCallCheck(this, WebSocketBase);
this.CONNECTING = 0;
this.OPEN = 1;
this.CLOSING = 2;
this.CLOSED = 3;

if(!protocols){
protocols = [];}


this.connectToSocketImpl(url);}_createClass(WebSocketBase, [{key:'close', value:


function close(){
if(this.readyState === WebSocketBase.CLOSING || 
this.readyState === WebSocketBase.CLOSED){
return;}


if(this.readyState === WebSocketBase.CONNECTING){
this.cancelConnectionImpl();}


this.closeConnectionImpl();}}, {key:'send', value:


function send(data){
if(this.readyState === WebSocketBase.CONNECTING){
throw new Error('INVALID_STATE_ERR');}


if(typeof data === 'string'){
this.sendStringImpl(data);}else 
if(data instanceof ArrayBuffer){
this.sendArrayBufferImpl(data);}else 
{
throw new Error('Not supported data type');}}}, {key:'closeConnectionImpl', value:



function closeConnectionImpl(){
throw new Error('Subclass must define closeConnectionImpl method');}}, {key:'connectToSocketImpl', value:


function connectToSocketImpl(){
throw new Error('Subclass must define connectToSocketImpl method');}}, {key:'cancelConnectionImpl', value:


function cancelConnectionImpl(){
throw new Error('Subclass must define cancelConnectionImpl method');}}, {key:'sendStringImpl', value:


function sendStringImpl(){
throw new Error('Subclass must define sendStringImpl method');}}, {key:'sendArrayBufferImpl', value:


function sendArrayBufferImpl(){
throw new Error('Subclass must define sendArrayBufferImpl method');}}]);return WebSocketBase;})();




module.exports = WebSocketBase;});
__d('EventPluginHub',["EventPluginRegistry","EventPluginUtils","accumulateInto","forEachAccumulated","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventPluginRegistry=require('EventPluginRegistry');
var EventPluginUtils=require('EventPluginUtils');

var accumulateInto=require('accumulateInto');
var forEachAccumulated=require('forEachAccumulated');
var invariant=require('invariant');




var listenerBank={};





var eventQueue=null;







var executeDispatchesAndRelease=function(event){
if(event){
var executeDispatch=EventPluginUtils.executeDispatch;

var PluginModule=EventPluginRegistry.getPluginModuleForEvent(event);
if(PluginModule && PluginModule.executeDispatch){
executeDispatch = PluginModule.executeDispatch;}

EventPluginUtils.executeDispatchesInOrder(event, executeDispatch);

if(!event.isPersistent()){
event.constructor.release(event);}}};








var InstanceHandle=null;

function validateInstanceHandle(){
var valid=
InstanceHandle && 
InstanceHandle.traverseTwoPhase && 
InstanceHandle.traverseEnterLeave;
invariant(
valid, 
'InstanceHandle not injected before use!');}

























var EventPluginHub={




injection:{





injectMount:EventPluginUtils.injection.injectMount, 





injectInstanceHandle:function(InjectedInstanceHandle){
InstanceHandle = InjectedInstanceHandle;
if(__DEV__){
validateInstanceHandle();}}, 



getInstanceHandle:function(){
if(__DEV__){
validateInstanceHandle();}

return InstanceHandle;}, 






injectEventPluginOrder:EventPluginRegistry.injectEventPluginOrder, 




injectEventPluginsByName:EventPluginRegistry.injectEventPluginsByName}, 



eventNameDispatchConfigs:EventPluginRegistry.eventNameDispatchConfigs, 

registrationNameModules:EventPluginRegistry.registrationNameModules, 








putListener:function(id, registrationName, listener){
invariant(
!listener || typeof listener === 'function', 
'Expected %s listener to be a function, instead got type %s', 
registrationName, typeof listener);


var bankForRegistrationName=
listenerBank[registrationName] || (listenerBank[registrationName] = {});
bankForRegistrationName[id] = listener;}, 







getListener:function(id, registrationName){
var bankForRegistrationName=listenerBank[registrationName];
return bankForRegistrationName && bankForRegistrationName[id];}, 








deleteListener:function(id, registrationName){
var bankForRegistrationName=listenerBank[registrationName];
if(bankForRegistrationName){
delete bankForRegistrationName[id];}}, 








deleteAllListeners:function(id){
for(var registrationName in listenerBank) {
delete listenerBank[registrationName][id];}}, 














extractEvents:function(
topLevelType, 
topLevelTarget, 
topLevelTargetID, 
nativeEvent){
var events;
var plugins=EventPluginRegistry.plugins;
for(var i=0, l=plugins.length; i < l; i++) {

var possiblePlugin=plugins[i];
if(possiblePlugin){
var extractedEvents=possiblePlugin.extractEvents(
topLevelType, 
topLevelTarget, 
topLevelTargetID, 
nativeEvent);

if(extractedEvents){
events = accumulateInto(events, extractedEvents);}}}



return events;}, 









enqueueEvents:function(events){
if(events){
eventQueue = accumulateInto(eventQueue, events);}}, 








processEventQueue:function(){


var processingEventQueue=eventQueue;
eventQueue = null;
forEachAccumulated(processingEventQueue, executeDispatchesAndRelease);
invariant(
!eventQueue, 
'processEventQueue(): Additional events were enqueued while processing ' + 
'an event queue. Support for this has not yet been implemented.');}, 






__purge:function(){
listenerBank = {};}, 


__getListenerBank:function(){
return listenerBank;}};




module.exports = EventPluginHub;});
__d('EventPluginRegistry',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var invariant=require('invariant');




var EventPluginOrder=null;




var namesToPlugins={};






function recomputePluginOrdering(){
if(!EventPluginOrder){

return;}

for(var pluginName in namesToPlugins) {
var PluginModule=namesToPlugins[pluginName];
var pluginIndex=EventPluginOrder.indexOf(pluginName);
invariant(
pluginIndex > -1, 
'EventPluginRegistry: Cannot inject event plugins that do not exist in ' + 
'the plugin ordering, `%s`.', 
pluginName);

if(EventPluginRegistry.plugins[pluginIndex]){
continue;}

invariant(
PluginModule.extractEvents, 
'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 
'method, but `%s` does not.', 
pluginName);

EventPluginRegistry.plugins[pluginIndex] = PluginModule;
var publishedEvents=PluginModule.eventTypes;
for(var eventName in publishedEvents) {
invariant(
publishEventForPlugin(
publishedEvents[eventName], 
PluginModule, 
eventName), 

'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', 
eventName, 
pluginName);}}}













function publishEventForPlugin(dispatchConfig, PluginModule, eventName){
invariant(
!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName), 
'EventPluginHub: More than one plugin attempted to publish the same ' + 
'event name, `%s`.', 
eventName);

EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

var phasedRegistrationNames=dispatchConfig.phasedRegistrationNames;
if(phasedRegistrationNames){
for(var phaseName in phasedRegistrationNames) {
if(phasedRegistrationNames.hasOwnProperty(phaseName)){
var phasedRegistrationName=phasedRegistrationNames[phaseName];
publishRegistrationName(
phasedRegistrationName, 
PluginModule, 
eventName);}}



return true;}else 
if(dispatchConfig.registrationName){
publishRegistrationName(
dispatchConfig.registrationName, 
PluginModule, 
eventName);

return true;}

return false;}










function publishRegistrationName(registrationName, PluginModule, eventName){
invariant(
!EventPluginRegistry.registrationNameModules[registrationName], 
'EventPluginHub: More than one plugin attempted to publish the same ' + 
'registration name, `%s`.', 
registrationName);

EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
EventPluginRegistry.registrationNameDependencies[registrationName] = 
PluginModule.eventTypes[eventName].dependencies;}







var EventPluginRegistry={




plugins:[], 




eventNameDispatchConfigs:{}, 




registrationNameModules:{}, 




registrationNameDependencies:{}, 










injectEventPluginOrder:function(InjectedEventPluginOrder){
invariant(
!EventPluginOrder, 
'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 
'once. You are likely trying to load more than one copy of React.');


EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
recomputePluginOrdering();}, 












injectEventPluginsByName:function(injectedNamesToPlugins){
var isOrderingDirty=false;
for(var pluginName in injectedNamesToPlugins) {
if(!injectedNamesToPlugins.hasOwnProperty(pluginName)){
continue;}

var PluginModule=injectedNamesToPlugins[pluginName];
if(!namesToPlugins.hasOwnProperty(pluginName) || 
namesToPlugins[pluginName] !== PluginModule){
invariant(
!namesToPlugins[pluginName], 
'EventPluginRegistry: Cannot inject two different event plugins ' + 
'using the same name, `%s`.', 
pluginName);

namesToPlugins[pluginName] = PluginModule;
isOrderingDirty = true;}}


if(isOrderingDirty){
recomputePluginOrdering();}}, 










getPluginModuleForEvent:function(event){
var dispatchConfig=event.dispatchConfig;
if(dispatchConfig.registrationName){
return EventPluginRegistry.registrationNameModules[
dispatchConfig.registrationName] || 
null;}

for(var phase in dispatchConfig.phasedRegistrationNames) {
if(!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)){
continue;}

var PluginModule=EventPluginRegistry.registrationNameModules[
dispatchConfig.phasedRegistrationNames[phase]];

if(PluginModule){
return PluginModule;}}


return null;}, 






_resetEventPlugins:function(){
EventPluginOrder = null;
for(var pluginName in namesToPlugins) {
if(namesToPlugins.hasOwnProperty(pluginName)){
delete namesToPlugins[pluginName];}}


EventPluginRegistry.plugins.length = 0;

var eventNameDispatchConfigs=EventPluginRegistry.eventNameDispatchConfigs;
for(var eventName in eventNameDispatchConfigs) {
if(eventNameDispatchConfigs.hasOwnProperty(eventName)){
delete eventNameDispatchConfigs[eventName];}}



var registrationNameModules=EventPluginRegistry.registrationNameModules;
for(var registrationName in registrationNameModules) {
if(registrationNameModules.hasOwnProperty(registrationName)){
delete registrationNameModules[registrationName];}}}};






module.exports = EventPluginRegistry;});
__d('EventPluginUtils',["EventConstants","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventConstants=require('EventConstants');

var invariant=require('invariant');









var injection={
Mount:null, 
injectMount:function(InjectedMount){
injection.Mount = InjectedMount;
if(__DEV__){
invariant(
InjectedMount && InjectedMount.getNode, 
'EventPluginUtils.injection.injectMount(...): Injected Mount module ' + 
'is missing getNode.');}}};





var topLevelTypes=EventConstants.topLevelTypes;

function isEndish(topLevelType){
return topLevelType === topLevelTypes.topMouseUp || 
topLevelType === topLevelTypes.topTouchEnd || 
topLevelType === topLevelTypes.topTouchCancel;}


function isMoveish(topLevelType){
return topLevelType === topLevelTypes.topMouseMove || 
topLevelType === topLevelTypes.topTouchMove;}

function isStartish(topLevelType){
return topLevelType === topLevelTypes.topMouseDown || 
topLevelType === topLevelTypes.topTouchStart;}



var validateEventDispatches;
if(__DEV__){
validateEventDispatches = function(event){
var dispatchListeners=event._dispatchListeners;
var dispatchIDs=event._dispatchIDs;

var listenersIsArr=Array.isArray(dispatchListeners);
var idsIsArr=Array.isArray(dispatchIDs);
var IDsLen=idsIsArr?dispatchIDs.length:dispatchIDs?1:0;
var listenersLen=listenersIsArr?
dispatchListeners.length:
dispatchListeners?1:0;

invariant(
idsIsArr === listenersIsArr && IDsLen === listenersLen, 
'EventPluginUtils: Invalid `event`.');};}









function forEachEventDispatch(event, cb){
var dispatchListeners=event._dispatchListeners;
var dispatchIDs=event._dispatchIDs;
if(__DEV__){
validateEventDispatches(event);}

if(Array.isArray(dispatchListeners)){
for(var i=0; i < dispatchListeners.length; i++) {
if(event.isPropagationStopped()){
break;}


cb(event, dispatchListeners[i], dispatchIDs[i]);}}else 

if(dispatchListeners){
cb(event, dispatchListeners, dispatchIDs);}}









function executeDispatch(event, listener, domID){
event.currentTarget = injection.Mount.getNode(domID);
var returnValue=listener(event, domID);
event.currentTarget = null;
return returnValue;}





function executeDispatchesInOrder(event, cb){
forEachEventDispatch(event, cb);
event._dispatchListeners = null;
event._dispatchIDs = null;}









function executeDispatchesInOrderStopAtTrueImpl(event){
var dispatchListeners=event._dispatchListeners;
var dispatchIDs=event._dispatchIDs;
if(__DEV__){
validateEventDispatches(event);}

if(Array.isArray(dispatchListeners)){
for(var i=0; i < dispatchListeners.length; i++) {
if(event.isPropagationStopped()){
break;}


if(dispatchListeners[i](event, dispatchIDs[i])){
return dispatchIDs[i];}}}else 


if(dispatchListeners){
if(dispatchListeners(event, dispatchIDs)){
return dispatchIDs;}}


return null;}





function executeDispatchesInOrderStopAtTrue(event){
var ret=executeDispatchesInOrderStopAtTrueImpl(event);
event._dispatchIDs = null;
event._dispatchListeners = null;
return ret;}











function executeDirectDispatch(event){
if(__DEV__){
validateEventDispatches(event);}

var dispatchListener=event._dispatchListeners;
var dispatchID=event._dispatchIDs;
invariant(
!Array.isArray(dispatchListener), 
'executeDirectDispatch(...): Invalid `event`.');

var res=dispatchListener?
dispatchListener(event, dispatchID):
null;
event._dispatchListeners = null;
event._dispatchIDs = null;
return res;}






function hasDispatches(event){
return !!event._dispatchListeners;}





var EventPluginUtils={
isEndish:isEndish, 
isMoveish:isMoveish, 
isStartish:isStartish, 

executeDirectDispatch:executeDirectDispatch, 
executeDispatch:executeDispatch, 
executeDispatchesInOrder:executeDispatchesInOrder, 
executeDispatchesInOrderStopAtTrue:executeDispatchesInOrderStopAtTrue, 
hasDispatches:hasDispatches, 
injection:injection, 
useTouchEvents:false};


module.exports = EventPluginUtils;});
__d('EventConstants',["keyMirror"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var keyMirror=require('keyMirror');

var PropagationPhases=keyMirror({bubbled:null, captured:null});




var topLevelTypes=keyMirror({
topBlur:null, 
topChange:null, 
topClick:null, 
topCompositionEnd:null, 
topCompositionStart:null, 
topCompositionUpdate:null, 
topContextMenu:null, 
topCopy:null, 
topCut:null, 
topDoubleClick:null, 
topDrag:null, 
topDragEnd:null, 
topDragEnter:null, 
topDragExit:null, 
topDragLeave:null, 
topDragOver:null, 
topDragStart:null, 
topDrop:null, 
topError:null, 
topFocus:null, 
topInput:null, 
topKeyDown:null, 
topKeyPress:null, 
topKeyUp:null, 
topLoad:null, 
topMouseDown:null, 
topMouseMove:null, 
topMouseOut:null, 
topMouseOver:null, 
topMouseUp:null, 
topPaste:null, 
topReset:null, 
topScroll:null, 
topSelectionChange:null, 
topSubmit:null, 
topTextInput:null, 
topTouchCancel:null, 
topTouchEnd:null, 
topTouchMove:null, 
topTouchStart:null, 
topWheel:null});


var EventConstants={
topLevelTypes:topLevelTypes, 
PropagationPhases:PropagationPhases};


module.exports = EventConstants;});
__d('accumulateInto',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');















function accumulateInto(current, next){
invariant(
next != null, 
'accumulateInto(...): Accumulated items must not be null or undefined.');

if(current == null){
return next;}




var currentIsArray=Array.isArray(current);
var nextIsArray=Array.isArray(next);

if(currentIsArray && nextIsArray){
current.push.apply(current, next);
return current;}


if(currentIsArray){
current.push(next);
return current;}


if(nextIsArray){

return [current].concat(next);}


return [current, next];}


module.exports = accumulateInto;});
__d('forEachAccumulated',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



















var forEachAccumulated=function(arr, cb, scope){
if(Array.isArray(arr)){
arr.forEach(cb, scope);}else 
if(arr){
cb.call(scope, arr);}};



module.exports = forEachAccumulated;});
__d('IOSDefaultEventPluginOrder',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var IOSDefaultEventPluginOrder=[
'ResponderEventPlugin', 
'IOSNativeBridgeEventPlugin'];


module.exports = IOSDefaultEventPluginOrder;});
__d('IOSNativeBridgeEventPlugin',["EventPropagators","NativeModules","SyntheticEvent","merge","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventPropagators=require('EventPropagators');
var NativeModules=require('NativeModules');
var SyntheticEvent=require('SyntheticEvent');

var merge=require('merge');
var warning=require('warning');

var RCTUIManager=NativeModules.UIManager;

var customBubblingEventTypes=RCTUIManager.customBubblingEventTypes;
var customDirectEventTypes=RCTUIManager.customDirectEventTypes;

var allTypesByEventName={};

for(var bubblingTypeName in customBubblingEventTypes) {
allTypesByEventName[bubblingTypeName] = customBubblingEventTypes[bubblingTypeName];}


for(var directTypeName in customDirectEventTypes) {
warning(
!customBubblingEventTypes[directTypeName], 
'Event cannot be both direct and bubbling: %s', 
directTypeName);

allTypesByEventName[directTypeName] = customDirectEventTypes[directTypeName];}


var IOSNativeBridgeEventPlugin={

eventTypes:merge(customBubblingEventTypes, customDirectEventTypes), 









extractEvents:function(
topLevelType, 
topLevelTarget, 
topLevelTargetID, 
nativeEvent)
{
var bubbleDispatchConfig=customBubblingEventTypes[topLevelType];
var directDispatchConfig=customDirectEventTypes[topLevelType];
var event=SyntheticEvent.getPooled(
bubbleDispatchConfig || directDispatchConfig, 
topLevelTargetID, 
nativeEvent);

if(bubbleDispatchConfig){
EventPropagators.accumulateTwoPhaseDispatches(event);}else 
if(directDispatchConfig){
EventPropagators.accumulateDirectDispatches(event);}else 
{
return null;}

return event;}};



module.exports = IOSNativeBridgeEventPlugin;});
__d('EventPropagators',["EventConstants","EventPluginHub","accumulateInto","forEachAccumulated"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



















var EventConstants=require('EventConstants');
var EventPluginHub=require('EventPluginHub');

var accumulateInto=require('accumulateInto');
var forEachAccumulated=require('forEachAccumulated');

var PropagationPhases=EventConstants.PropagationPhases;
var getListener=EventPluginHub.getListener;





function listenerAtPhase(id, event, propagationPhase){
var registrationName=
event.dispatchConfig.phasedRegistrationNames[propagationPhase];
return getListener(id, registrationName);}








function accumulateDirectionalDispatches(domID, upwards, event){
if(__DEV__){
if(!domID){
throw new Error('Dispatching id must not be null');}}


var phase=upwards?PropagationPhases.bubbled:PropagationPhases.captured;
var listener=listenerAtPhase(domID, event, phase);
if(listener){
event._dispatchListeners = 
accumulateInto(event._dispatchListeners, listener);
event._dispatchIDs = accumulateInto(event._dispatchIDs, domID);}}










function accumulateTwoPhaseDispatchesSingle(event){
if(event && event.dispatchConfig.phasedRegistrationNames){
EventPluginHub.injection.getInstanceHandle().traverseTwoPhase(
event.dispatchMarker, 
accumulateDirectionalDispatches, 
event);}}







function accumulateTwoPhaseDispatchesSingleSkipTarget(event){
if(event && event.dispatchConfig.phasedRegistrationNames){
EventPluginHub.injection.getInstanceHandle().traverseTwoPhaseSkipTarget(
event.dispatchMarker, 
accumulateDirectionalDispatches, 
event);}}










function accumulateDispatches(id, ignoredDirection, event){
if(event && event.dispatchConfig.registrationName){
var registrationName=event.dispatchConfig.registrationName;
var listener=getListener(id, registrationName);
if(listener){
event._dispatchListeners = 
accumulateInto(event._dispatchListeners, listener);
event._dispatchIDs = accumulateInto(event._dispatchIDs, id);}}}









function accumulateDirectDispatchesSingle(event){
if(event && event.dispatchConfig.registrationName){
accumulateDispatches(event.dispatchMarker, null, event);}}



function accumulateTwoPhaseDispatches(events){
forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);}


function accumulateTwoPhaseDispatchesSkipTarget(events){
forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget);}


function accumulateEnterLeaveDispatches(leave, enter, fromID, toID){
EventPluginHub.injection.getInstanceHandle().traverseEnterLeave(
fromID, 
toID, 
accumulateDispatches, 
leave, 
enter);}




function accumulateDirectDispatches(events){
forEachAccumulated(events, accumulateDirectDispatchesSingle);}















var EventPropagators={
accumulateTwoPhaseDispatches:accumulateTwoPhaseDispatches, 
accumulateTwoPhaseDispatchesSkipTarget:accumulateTwoPhaseDispatchesSkipTarget, 
accumulateDirectDispatches:accumulateDirectDispatches, 
accumulateEnterLeaveDispatches:accumulateEnterLeaveDispatches};


module.exports = EventPropagators;});
__d('SyntheticEvent',["PooledClass","Object.assign","emptyFunction","getEventTarget"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var PooledClass=require('PooledClass');

var assign=require('Object.assign');
var emptyFunction=require('emptyFunction');
var getEventTarget=require('getEventTarget');





var EventInterface={
type:null, 
target:getEventTarget, 

currentTarget:emptyFunction.thatReturnsNull, 
eventPhase:null, 
bubbles:null, 
cancelable:null, 
timeStamp:function(event){
return event.timeStamp || Date.now();}, 

defaultPrevented:null, 
isTrusted:null};



















function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent){
this.dispatchConfig = dispatchConfig;
this.dispatchMarker = dispatchMarker;
this.nativeEvent = nativeEvent;

var Interface=this.constructor.Interface;
for(var propName in Interface) {
if(!Interface.hasOwnProperty(propName)){
continue;}

var normalize=Interface[propName];
if(normalize){
this[propName] = normalize(nativeEvent);}else 
{
this[propName] = nativeEvent[propName];}}



var defaultPrevented=nativeEvent.defaultPrevented != null?
nativeEvent.defaultPrevented:
nativeEvent.returnValue === false;
if(defaultPrevented){
this.isDefaultPrevented = emptyFunction.thatReturnsTrue;}else 
{
this.isDefaultPrevented = emptyFunction.thatReturnsFalse;}

this.isPropagationStopped = emptyFunction.thatReturnsFalse;}


assign(SyntheticEvent.prototype, {

preventDefault:function(){
this.defaultPrevented = true;
var event=this.nativeEvent;
if(event.preventDefault){
event.preventDefault();}else 
{
event.returnValue = false;}

this.isDefaultPrevented = emptyFunction.thatReturnsTrue;}, 


stopPropagation:function(){
var event=this.nativeEvent;
if(event.stopPropagation){
event.stopPropagation();}else 
{
event.cancelBubble = true;}

this.isPropagationStopped = emptyFunction.thatReturnsTrue;}, 







persist:function(){
this.isPersistent = emptyFunction.thatReturnsTrue;}, 







isPersistent:emptyFunction.thatReturnsFalse, 




destructor:function(){
var Interface=this.constructor.Interface;
for(var propName in Interface) {
this[propName] = null;}

this.dispatchConfig = null;
this.dispatchMarker = null;
this.nativeEvent = null;}});




SyntheticEvent.Interface = EventInterface;







SyntheticEvent.augmentClass = function(Class, Interface){
var Super=this;

var prototype=Object.create(Super.prototype);
assign(prototype, Class.prototype);
Class.prototype = prototype;
Class.prototype.constructor = Class;

Class.Interface = assign({}, Super.Interface, Interface);
Class.augmentClass = Super.augmentClass;

PooledClass.addPoolingTo(Class, PooledClass.threeArgumentPooler);};


PooledClass.addPoolingTo(SyntheticEvent, PooledClass.threeArgumentPooler);

module.exports = SyntheticEvent;});
__d('getEventTarget',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




















function getEventTarget(nativeEvent){
var target=nativeEvent.target || nativeEvent.srcElement || window;


return target.nodeType === 3?target.parentNode:target;}


module.exports = getEventTarget;});
__d('merge',["mergeInto"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";
































var mergeInto=require("mergeInto");








var merge=function(one, two){
var result={};
mergeInto(result, one);
mergeInto(result, two);
return result;};


module.exports = merge;});
__d('mergeInto',["mergeHelpers"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";

































var mergeHelpers=require("mergeHelpers");

var checkMergeObjectArg=mergeHelpers.checkMergeObjectArg;
var checkMergeIntoObjectArg=mergeHelpers.checkMergeIntoObjectArg;







function mergeInto(one, two){
checkMergeIntoObjectArg(one);
if(two != null){
checkMergeObjectArg(two);
for(var key in two) {
if(!two.hasOwnProperty(key)){
continue;}

one[key] = two[key];}}}




module.exports = mergeInto;});
__d('mergeHelpers',["invariant","keyMirror"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';


































var invariant=require('invariant');
var keyMirror=require('keyMirror');





var MAX_MERGE_DEPTH=36;







var isTerminal=function(o){
return typeof o !== 'object' || o === null;};


var mergeHelpers={

MAX_MERGE_DEPTH:MAX_MERGE_DEPTH, 

isTerminal:isTerminal, 







normalizeMergeArg:function(arg){
return arg === undefined || arg === null?{}:arg;}, 










checkMergeArrayArgs:function(one, two){
invariant(
Array.isArray(one) && Array.isArray(two), 
'Tried to merge arrays, instead got %s and %s.', 
one, 
two);}, 







checkMergeObjectArgs:function(one, two){
mergeHelpers.checkMergeObjectArg(one);
mergeHelpers.checkMergeObjectArg(two);}, 





checkMergeObjectArg:function(arg){
invariant(
!isTerminal(arg) && !Array.isArray(arg), 
'Tried to merge an object, instead got %s.', 
arg);}, 






checkMergeIntoObjectArg:function(arg){
invariant(
(!isTerminal(arg) || typeof arg === 'function') && !Array.isArray(arg), 
'Tried to merge into an object, instead got %s.', 
arg);}, 









checkMergeLevel:function(level){
invariant(
level < MAX_MERGE_DEPTH, 
'Maximum deep merge depth exceeded. You may be attempting to merge ' + 
'circular structures in an unsupported way.');}, 








checkArrayStrategy:function(strategy){
invariant(
strategy === undefined || strategy in mergeHelpers.ArrayStrategies, 
'You must provide an array strategy to deep merge functions to ' + 
'instruct the deep merge how to resolve merging two arrays.');}, 










ArrayStrategies:keyMirror({
Clobber:true, 
IndexByIndex:true})};




module.exports = mergeHelpers;});
__d('NodeHandle',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var 




























































NodeHandle={



injection:{
injectImplementation:function(Impl){
NodeHandle._Implementation = Impl;}}, 



_Implementation:null, 





getRootNodeID:function(nodeHandle){
return NodeHandle._Implementation.getRootNodeID(nodeHandle);}};



module.exports = NodeHandle;});
__d('ReactComponentEnvironment',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');

var injected=false;

var ReactComponentEnvironment={






unmountIDFromEnvironment:null, 





replaceNodeWithMarkupByID:null, 





processChildrenUpdates:null, 

injection:{
injectEnvironment:function(environment){
invariant(
!injected, 
'ReactCompositeComponent: injectEnvironment() can only be called once.');

ReactComponentEnvironment.unmountIDFromEnvironment = 
environment.unmountIDFromEnvironment;
ReactComponentEnvironment.replaceNodeWithMarkupByID = 
environment.replaceNodeWithMarkupByID;
ReactComponentEnvironment.processChildrenUpdates = 
environment.processChildrenUpdates;
injected = true;}}};





module.exports = ReactComponentEnvironment;});
__d('ReactDefaultBatchingStrategy',["ReactUpdates","Transaction","Object.assign","emptyFunction"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactUpdates=require('ReactUpdates');
var Transaction=require('Transaction');

var assign=require('Object.assign');
var emptyFunction=require('emptyFunction');

var RESET_BATCHED_UPDATES={
initialize:emptyFunction, 
close:function(){
ReactDefaultBatchingStrategy.isBatchingUpdates = false;}};



var FLUSH_BATCHED_UPDATES={
initialize:emptyFunction, 
close:ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)};


var TRANSACTION_WRAPPERS=[FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction(){
this.reinitializeTransaction();}


assign(
ReactDefaultBatchingStrategyTransaction.prototype, 
Transaction.Mixin, 
{
getTransactionWrappers:function(){
return TRANSACTION_WRAPPERS;}});




var transaction=new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy={
isBatchingUpdates:false, 





batchedUpdates:function(callback, a, b, c, d){
var alreadyBatchingUpdates=ReactDefaultBatchingStrategy.isBatchingUpdates;

ReactDefaultBatchingStrategy.isBatchingUpdates = true;


if(alreadyBatchingUpdates){
callback(a, b, c, d);}else 
{
transaction.perform(callback, null, a, b, c, d);}}};




module.exports = ReactDefaultBatchingStrategy;});
__d('ReactEmptyComponent',["ReactElement","ReactInstanceMap","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactElement=require('ReactElement');
var ReactInstanceMap=require('ReactInstanceMap');

var invariant=require('invariant');

var component;


var nullComponentIDsRegistry={};

var ReactEmptyComponentInjection={
injectEmptyComponent:function(emptyComponent){
component = ReactElement.createFactory(emptyComponent);}};



var ReactEmptyComponentType=function(){};
ReactEmptyComponentType.prototype.componentDidMount = function(){
var internalInstance=ReactInstanceMap.get(this);




if(!internalInstance){
return;}

registerNullComponentID(internalInstance._rootNodeID);};

ReactEmptyComponentType.prototype.componentWillUnmount = function(){
var internalInstance=ReactInstanceMap.get(this);

if(!internalInstance){
return;}

deregisterNullComponentID(internalInstance._rootNodeID);};

ReactEmptyComponentType.prototype.render = function(){
invariant(
component, 
'Trying to return null from a render, but no null placeholder component ' + 
'was injected.');

return component();};


var emptyElement=ReactElement.createElement(ReactEmptyComponentType);





function registerNullComponentID(id){
nullComponentIDsRegistry[id] = true;}






function deregisterNullComponentID(id){
delete nullComponentIDsRegistry[id];}






function isNullComponentID(id){
return !!nullComponentIDsRegistry[id];}


var ReactEmptyComponent={
emptyElement:emptyElement, 
injection:ReactEmptyComponentInjection, 
isNullComponentID:isNullComponentID};


module.exports = ReactEmptyComponent;});
__d('ReactNativeComponentEnvironment',["ReactNativeDOMIDOperations","ReactNativeReconcileTransaction"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactNativeDOMIDOperations=require('ReactNativeDOMIDOperations');
var ReactNativeReconcileTransaction=require('ReactNativeReconcileTransaction');

var ReactNativeComponentEnvironment={

processChildrenUpdates:ReactNativeDOMIDOperations.dangerouslyProcessChildrenUpdates, 

replaceNodeWithMarkupByID:ReactNativeDOMIDOperations.dangerouslyReplaceNodeWithMarkupByID, 






unmountIDFromEnvironment:function(){}, 






clearNode:function(){}, 



ReactReconcileTransaction:ReactNativeReconcileTransaction};


module.exports = ReactNativeComponentEnvironment;});
__d('ReactNativeDOMIDOperations',["ReactNativeTagHandles","ReactMultiChildUpdateTypes","NativeModules","ReactPerf"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactNativeTagHandles=require('ReactNativeTagHandles');
var ReactMultiChildUpdateTypes=require('ReactMultiChildUpdateTypes');
var RCTUIManager=require('NativeModules').UIManager;
var ReactPerf=require('ReactPerf');













var dangerouslyProcessChildrenUpdates=function(childrenUpdates, markupList){
if(!childrenUpdates.length){
return;}

var byContainerTag={};


for(var i=0; i < childrenUpdates.length; i++) {
var update=childrenUpdates[i];
var containerTag=ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(update.parentID);
var updates=byContainerTag[containerTag] || (byContainerTag[containerTag] = {});
if(update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING){
(updates.moveFromIndices || (updates.moveFromIndices = [])).push(update.fromIndex);
(updates.moveToIndices || (updates.moveToIndices = [])).push(update.toIndex);}else 
if(update.type === ReactMultiChildUpdateTypes.REMOVE_NODE){
(updates.removeAtIndices || (updates.removeAtIndices = [])).push(update.fromIndex);}else 
if(update.type === ReactMultiChildUpdateTypes.INSERT_MARKUP){
var mountImage=markupList[update.markupIndex];
var tag=mountImage.tag;
var rootNodeID=mountImage.rootNodeID;
ReactNativeTagHandles.associateRootNodeIDWithMountedNodeHandle(rootNodeID, tag);
(updates.addAtIndices || (updates.addAtIndices = [])).push(update.toIndex);
(updates.addChildTags || (updates.addChildTags = [])).push(tag);}}





for(var updateParentTagString in byContainerTag) {
var updateParentTagNumber=+updateParentTagString;
var childUpdatesToSend=byContainerTag[updateParentTagNumber];
RCTUIManager.manageChildren(
updateParentTagNumber, 
childUpdatesToSend.moveFromIndices, 
childUpdatesToSend.moveToIndices, 
childUpdatesToSend.addChildTags, 
childUpdatesToSend.addAtIndices, 
childUpdatesToSend.removeAtIndices);}};








var ReactNativeDOMIDOperations={
dangerouslyProcessChildrenUpdates:ReactPerf.measure(

'ReactDOMIDOperations', 
'dangerouslyProcessChildrenUpdates', 
dangerouslyProcessChildrenUpdates), 








dangerouslyReplaceNodeWithMarkupByID:ReactPerf.measure(
'ReactDOMIDOperations', 
'dangerouslyReplaceNodeWithMarkupByID', 
function(id, mountImage){
var oldTag=ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(id);
RCTUIManager.replaceExistingNonRootView(oldTag, mountImage.tag);
ReactNativeTagHandles.associateRootNodeIDWithMountedNodeHandle(id, mountImage.tag);})};




module.exports = ReactNativeDOMIDOperations;});
__d('ReactNativeTagHandles',["invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');
var warning=require('warning');














var INITIAL_TAG_COUNT=1;
var ReactNativeTagHandles={
tagsStartAt:INITIAL_TAG_COUNT, 
tagCount:INITIAL_TAG_COUNT, 

allocateTag:function(){

while(this.reactTagIsNativeTopRootID(ReactNativeTagHandles.tagCount)) {
ReactNativeTagHandles.tagCount++;}

var tag=ReactNativeTagHandles.tagCount;
ReactNativeTagHandles.tagCount++;
return tag;}, 











associateRootNodeIDWithMountedNodeHandle:function(
rootNodeID, 
tag)
{
warning(rootNodeID && tag, 'Root node or tag is null when associating');
if(rootNodeID && tag){
ReactNativeTagHandles.tagToRootNodeID[tag] = rootNodeID;
ReactNativeTagHandles.rootNodeIDToTag[rootNodeID] = tag;}}, 



allocateRootNodeIDForTag:function(tag){
invariant(
this.reactTagIsNativeTopRootID(tag), 
'Expect a native root tag, instead got ', tag);

return '.r[' + tag + ']{TOP_LEVEL}';}, 


reactTagIsNativeTopRootID:function(reactTag){

return reactTag % 10 === 1;}, 














mostRecentMountedNodeHandleForRootNodeID:function(
rootNodeID)
{
return ReactNativeTagHandles.rootNodeIDToTag[rootNodeID];}, 


tagToRootNodeID:[], 

rootNodeIDToTag:{}};


module.exports = ReactNativeTagHandles;});
__d('ReactMultiChildUpdateTypes',["keyMirror"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var keyMirror=require('keyMirror');









var ReactMultiChildUpdateTypes=keyMirror({
INSERT_MARKUP:null, 
MOVE_EXISTING:null, 
REMOVE_NODE:null, 
TEXT_CONTENT:null});


module.exports = ReactMultiChildUpdateTypes;});
__d('ReactNativeReconcileTransaction',["CallbackQueue","PooledClass","Transaction"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var CallbackQueue=require('CallbackQueue');
var PooledClass=require('PooledClass');
var Transaction=require('Transaction');





var ON_DOM_READY_QUEUEING={



initialize:function(){
this.reactMountReady.reset();}, 





close:function(){
this.reactMountReady.notifyAll();}};








var TRANSACTION_WRAPPERS=[ON_DOM_READY_QUEUEING];















function ReactNativeReconcileTransaction(){
this.reinitializeTransaction();
this.reactMountReady = CallbackQueue.getPooled(null);}


var Mixin={







getTransactionWrappers:function(){
return TRANSACTION_WRAPPERS;}, 






getReactMountReady:function(){
return this.reactMountReady;}, 






destructor:function(){
CallbackQueue.release(this.reactMountReady);
this.reactMountReady = null;}};



Object.assign(
ReactNativeReconcileTransaction.prototype, 
Transaction.Mixin, 
ReactNativeReconcileTransaction, 
Mixin);


PooledClass.addPoolingTo(ReactNativeReconcileTransaction);

module.exports = ReactNativeReconcileTransaction;});
__d('ReactNativeGlobalInteractionHandler',["InteractionManager"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var InteractionManager=require('InteractionManager');



var interactionHandle=null;

var ReactNativeGlobalInteractionHandler={
onChange:function(numberActiveTouches){
if(numberActiveTouches === 0){
if(interactionHandle){
InteractionManager.clearInteractionHandle(interactionHandle);
interactionHandle = null;}}else 

if(!interactionHandle){
interactionHandle = InteractionManager.createInteractionHandle();}}};




module.exports = ReactNativeGlobalInteractionHandler;});
__d('InteractionManager',["ErrorUtils","EventEmitter","Set","invariant","keyMirror","setImmediate"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ErrorUtils=require('ErrorUtils');
var EventEmitter=require('EventEmitter');
var Set=require('Set');

var invariant=require('invariant');
var keyMirror=require('keyMirror');
var setImmediate=require('setImmediate');






var DEV_TIMEOUT=2000;

var _emitter=new EventEmitter();
var _interactionSet=new Set();
var _addInteractionSet=new Set();
var _deleteInteractionSet=new Set();
var _nextUpdateHandle=null;
var _queue=[];
var _inc=0;




































var InteractionManager={
Events:keyMirror({
interactionStart:true, 
interactionComplete:true}), 





runAfterInteractions:function(callback){
invariant(
typeof callback === 'function', 
'Must specify a function to schedule.');

scheduleUpdate();
_queue.push(callback);}, 





createInteractionHandle:function(){
scheduleUpdate();
var handle=++_inc;
_addInteractionSet.add(handle);
if(__DEV__){

var error=new Error(
'InteractionManager: interaction handle not cleared within ' + 
DEV_TIMEOUT + ' ms.');

setDevTimeoutHandle(handle, error, DEV_TIMEOUT);}

return handle;}, 





clearInteractionHandle:function(handle){
invariant(
!!handle, 
'Must provide a handle to clear.');

scheduleUpdate();
_addInteractionSet.delete(handle);
_deleteInteractionSet.add(handle);}, 


addListener:_emitter.addListener.bind(_emitter)};





function scheduleUpdate(){
if(!_nextUpdateHandle){
_nextUpdateHandle = setImmediate(processUpdate);}}






function processUpdate(){
_nextUpdateHandle = null;

var interactionCount=_interactionSet.size;
_addInteractionSet.forEach(function(handle){return (
_interactionSet.add(handle));});

_deleteInteractionSet.forEach(function(handle){return (
_interactionSet.delete(handle));});

var nextInteractionCount=_interactionSet.size;

if(interactionCount !== 0 && nextInteractionCount === 0){

_emitter.emit(InteractionManager.Events.interactionComplete);}else 
if(interactionCount === 0 && nextInteractionCount !== 0){

_emitter.emit(InteractionManager.Events.interactionStart);}



if(nextInteractionCount === 0){
var queue=_queue;
_queue = [];
queue.forEach(function(callback){
ErrorUtils.applyWithGuard(callback);});}



_addInteractionSet.clear();
_deleteInteractionSet.clear();}





function setDevTimeoutHandle(
handle, 
error, 
timeout)
{
setTimeout(function(){
if(_interactionSet.has(handle)){
console.warn(error.message + '\n' + error.stack);}}, 

timeout);}


module.exports = InteractionManager;});
__d('Set',["Map","toIterator","_shouldPolyfillES6Collection"],function(global, require, requireDynamic, requireLazy, module, exports) {  var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}



















var Map=require('Map');
var toIterator=require('toIterator');
var _shouldPolyfillES6Collection=require('_shouldPolyfillES6Collection');

module.exports = (function(global, undefined){





if(!_shouldPolyfillES6Collection('Set')){
return global.Set;}var 











































Set=(function(){










function Set(iterable){_classCallCheck(this, Set);
if(this == null || 
typeof this !== 'object' && typeof this !== 'function'){
throw new TypeError('Wrong set object type.');}


initSet(this);

if(iterable != null){
var it=toIterator(iterable);
var next;
while(!(next = it.next()).done) {
this.add(next.value);}}}_createClass(Set, [{key:'add', value:












function add(value){
this._map.set(value, value);
this.size = this._map.size;
return this;}}, {key:'clear', value:







function clear(){
initSet(this);}}, {key:'delete', value:











function _delete(value){
var ret=this._map.delete(value);
this.size = this._map.size;
return ret;}}, {key:'entries', value:







function entries(){
return this._map.entries();}}, {key:'forEach', value:









function forEach(callback){
var thisArg=arguments[1];
var it=this._map.keys();
var next;
while(!(next = it.next()).done) {
callback.call(thisArg, next.value, next.value, this);}}}, {key:'has', value:











function has(value){
return this._map.has(value);}}, {key:'values', value:







function values(){
return this._map.values();}}]);return Set;})();




Set.prototype[toIterator.ITERATOR_SYMBOL] = Set.prototype.values;


Set.prototype.keys = Set.prototype.values;

function initSet(set){
set._map = new Map();
set.size = set._map.size;}


return Set;})(
Function('return this')());});
__d('Map',["guid","isNode","toIterator","_shouldPolyfillES6Collection"],function(global, require, requireDynamic, requireLazy, module, exports) {  var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}



















var guid=require('guid');
var isNode=require('isNode');
var toIterator=require('toIterator');
var _shouldPolyfillES6Collection=require('_shouldPolyfillES6Collection');

module.exports = (function(global, undefined){




if(!_shouldPolyfillES6Collection('Map')){
return global.Map;}

























































var KIND_KEY='key';
var KIND_VALUE='value';
var KIND_KEY_VALUE='key+value';



var KEY_PREFIX='$map_';



var SECRET_SIZE_PROP;
if(__DEV__){
SECRET_SIZE_PROP = '$size' + guid();}



var OLD_IE_HASH_PREFIX='IE_HASH_';var 

Map=(function(){










function Map(iterable){_classCallCheck(this, Map);
if(!isObject(this)){
throw new TypeError('Wrong map object type.');}


initMap(this);

if(iterable != null){
var it=toIterator(iterable);
var next;
while(!(next = it.next()).done) {
if(!isObject(next.value)){
throw new TypeError('Expected iterable items to be pair objects.');}

this.set(next.value[0], next.value[1]);}}}_createClass(Map, [{key:'clear', value:








function clear(){
initMap(this);}}, {key:'has', value:









function has(key){
var index=getIndex(this, key);
return !!(index != null && this._mapData[index]);}}, {key:'set', value:










function set(key, value){
var index=getIndex(this, key);

if(index != null && this._mapData[index]){
this._mapData[index][1] = value;}else 
{
index = this._mapData.push([
key, 
value]) - 
1;
setIndex(this, key, index);
if(__DEV__){
this[SECRET_SIZE_PROP] += 1;}else 
{
this.size += 1;}}



return this;}}, {key:'get', value:









function get(key){
var index=getIndex(this, key);
if(index == null){
return undefined;}else 
{
return this._mapData[index][1];}}}, {key:'delete', value:











function _delete(key){
var index=getIndex(this, key);
if(index != null && this._mapData[index]){
setIndex(this, key, undefined);
this._mapData[index] = undefined;
if(__DEV__){
this[SECRET_SIZE_PROP] -= 1;}else 
{
this.size -= 1;}

return true;}else 
{
return false;}}}, {key:'entries', value:










function entries(){
return new MapIterator(this, KIND_KEY_VALUE);}}, {key:'keys', value:








function keys(){
return new MapIterator(this, KIND_KEY);}}, {key:'values', value:








function values(){
return new MapIterator(this, KIND_VALUE);}}, {key:'forEach', value:











function forEach(callback, thisArg){
if(typeof callback !== 'function'){
throw new TypeError('Callback must be callable.');}


var boundCallback=callback.bind(thisArg || undefined);
var mapData=this._mapData;




for(var i=0; i < mapData.length; i++) {
var entry=mapData[i];
if(entry != null){
boundCallback(entry[1], entry[0], this);}}}}]);return Map;})();






Map.prototype[toIterator.ITERATOR_SYMBOL] = Map.prototype.entries;var 

MapIterator=(function(){









function MapIterator(map, kind){_classCallCheck(this, MapIterator);
if(!(isObject(map) && map['_mapData'])){
throw new TypeError('Object is not a map.');}


if([KIND_KEY, KIND_KEY_VALUE, KIND_VALUE].indexOf(kind) === -1){
throw new Error('Invalid iteration kind.');}


this._map = map;
this._nextIndex = 0;
this._kind = kind;}_createClass(MapIterator, [{key:'next', value:








function next(){
if(!this instanceof Map){
throw new TypeError('Expected to be called on a MapIterator.');}


var map=this._map;
var index=this._nextIndex;
var kind=this._kind;

if(map == null){
return createIterResultObject(undefined, true);}


var entries=map['_mapData'];

while(index < entries.length) {
var record=entries[index];

index += 1;
this._nextIndex = index;

if(record){
if(kind === KIND_KEY){
return createIterResultObject(record[0], false);}else 
if(kind === KIND_VALUE){
return createIterResultObject(record[1], false);}else 
if(kind){
return createIterResultObject(record, false);}}}




this._map = undefined;

return createIterResultObject(undefined, true);}}]);return MapIterator;})();






MapIterator.prototype[toIterator.ITERATOR_SYMBOL] = function(){
return this;};













function getIndex(map, key){
if(isObject(key)){
var hash=getHash(key);
return map._objectIndex[hash];}else 
{
var prefixedKey=KEY_PREFIX + key;
if(typeof key === 'string'){
return map._stringIndex[prefixedKey];}else 
{
return map._otherIndex[prefixedKey];}}}










function setIndex(map, key, index){
var shouldDelete=index == null;

if(isObject(key)){
var hash=getHash(key);
if(shouldDelete){
delete map._objectIndex[hash];}else 
{
map._objectIndex[hash] = index;}}else 

{
var prefixedKey=KEY_PREFIX + key;
if(typeof key === 'string'){
if(shouldDelete){
delete map._stringIndex[prefixedKey];}else 
{
map._stringIndex[prefixedKey] = index;}}else 

{
if(shouldDelete){
delete map._otherIndex[prefixedKey];}else 
{
map._otherIndex[prefixedKey] = index;}}}}










function initMap(map){






map._mapData = [];







map._objectIndex = {};


map._stringIndex = {};


map._otherIndex = {};







if(__DEV__){
if(isES5){



if(map.hasOwnProperty(SECRET_SIZE_PROP)){
map[SECRET_SIZE_PROP] = 0;}else 
{
Object.defineProperty(map, SECRET_SIZE_PROP, {
value:0, 
writable:true});

Object.defineProperty(map, 'size', {
set:function(v){
console.error(
'PLEASE FIX ME: You are changing the map size property which ' + 
'should not be writable and will break in production.');

throw new Error('The map size property is not writable.');}, 

get:function(){return map[SECRET_SIZE_PROP];}});}




return;}}





map.size = 0;}








function isObject(o){
return o != null && (typeof o === 'object' || typeof o === 'function');}









function createIterResultObject(value, done){
return {value:value, done:done};}



var isES5=(function(){
try{
Object.defineProperty({}, 'x', {});
return true;}
catch(e) {
return false;}})();









function isExtensible(o){
if(!isES5){
return true;}else 
{
return Object.isExtensible(o);}}











function getIENodeHash(node){
var uniqueID;
switch(node.nodeType){
case 1:
uniqueID = node.uniqueID;
break;
case 9:
uniqueID = node.documentElement.uniqueID;
break;
default:
return null;}


if(uniqueID){
return OLD_IE_HASH_PREFIX + uniqueID;}else 
{
return null;}}



var getHash=(function(){
var propIsEnumerable=Object.prototype.propertyIsEnumerable;
var hashProperty=guid();
var hashCounter=0;







return function getHash(o){
if(o[hashProperty]){
return o[hashProperty];}else 
if(!isES5 && 
o.propertyIsEnumerable && 
o.propertyIsEnumerable[hashProperty]){
return o.propertyIsEnumerable[hashProperty];}else 
if(!isES5 && 
isNode(o) && 
getIENodeHash(o)){
return getIENodeHash(o);}else 
if(!isES5 && o[hashProperty]){
return o[hashProperty];}


if(isExtensible(o)){
hashCounter += 1;
if(isES5){
Object.defineProperty(o, hashProperty, {
enumerable:false, 
writable:false, 
configurable:false, 
value:hashCounter});}else 

if(o.propertyIsEnumerable){




o.propertyIsEnumerable = function(){
return propIsEnumerable.apply(this, arguments);};

o.propertyIsEnumerable[hashProperty] = hashCounter;}else 
if(isNode(o)){




o[hashProperty] = hashCounter;}else 
{
throw new Error('Unable to set a non-enumerable property on object.');}

return hashCounter;}else 
{
throw new Error('Non-extensible objects are not allowed as keys.');}};})();




return Map;})(
Function('return this')());});
__d('guid',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 

























guid(){
return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');}


module.exports = guid;});
__d('isNode',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 















isNode(object){
return !!(object && (
typeof Node === 'function'?object instanceof Node:
typeof object === 'object' && 
typeof object.nodeType === 'number' && 
typeof object.nodeName === 'string'));}



module.exports = isNode;});
__d('toIterator',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}






























var KIND_KEY='key';
var KIND_VALUE='value';
var KIND_KEY_VAL='key+value';

var ITERATOR_SYMBOL=typeof Symbol === 'function'?
Symbol.iterator:
'@@iterator';

var toIterator=(function(){
if(!(Array.prototype[ITERATOR_SYMBOL] && 
String.prototype[ITERATOR_SYMBOL])){

return (function(){var 
ArrayIterator=(function(){

function ArrayIterator(array, kind){_classCallCheck(this, ArrayIterator);
if(!Array.isArray(array)){
throw new TypeError('Object is not an Array');}

this._iteratedObject = array;
this._kind = kind;
this._nextIndex = 0;}_createClass(ArrayIterator, [{key:'next', value:



function next(){
if(!this instanceof ArrayIterator){
throw new TypeError('Object is not an ArrayIterator');}


if(this._iteratedObject == null){
return createIterResultObject(undefined, true);}


var array=this._iteratedObject;
var len=this._iteratedObject.length;
var index=this._nextIndex;
var kind=this._kind;

if(index >= len){
this._iteratedObject = undefined;
return createIterResultObject(undefined, true);}


this._nextIndex = index + 1;

if(kind === KIND_KEY){
return createIterResultObject(index, false);}else 
if(kind === KIND_VALUE){
return createIterResultObject(array[index], false);}else 
if(kind === KIND_KEY_VAL){
return createIterResultObject([index, array[index]], false);}}}, {key:




'@@iterator', value:function iterator(){
return this;}}]);return ArrayIterator;})();var 



StringIterator=(function(){

function StringIterator(string){_classCallCheck(this, StringIterator);
if(typeof string !== 'string'){
throw new TypeError('Object is not a string');}

this._iteratedString = string;
this._nextIndex = 0;}_createClass(StringIterator, [{key:'next', value:



function next(){
if(!this instanceof StringIterator){
throw new TypeError('Object is not a StringIterator');}


if(this._iteratedString == null){
return createIterResultObject(undefined, true);}


var index=this._nextIndex;
var s=this._iteratedString;
var len=s.length;

if(index >= len){
this._iteratedString = undefined;
return createIterResultObject(undefined, true);}


var ret;
var first=s.charCodeAt(index);

if(first < 55296 || first > 56319 || index + 1 === len){
ret = s[index];}else 
{
var second=s.charCodeAt(index + 1);
if(second < 56320 || second > 57343){
ret = s[index];}else 
{
ret = s[index] + s[index + 1];}}



this._nextIndex = index + ret.length;

return createIterResultObject(ret, false);}}, {key:



'@@iterator', value:function iterator(){
return this;}}]);return StringIterator;})();




function createIterResultObject(value, done){
return {value:value, done:done};}


return function(object, kind){
if(typeof object === 'string'){
return new StringIterator(object);}else 
if(Array.isArray(object)){
return new ArrayIterator(object, kind || KIND_VALUE);}else 
{
return object[ITERATOR_SYMBOL]();}};})();}else 



{
return function(object){
return object[ITERATOR_SYMBOL]();};}})();








Object.assign(toIterator, {
KIND_KEY:KIND_KEY, 
KIND_VALUE:KIND_VALUE, 
KIND_KEY_VAL:KIND_KEY_VAL, 
ITERATOR_SYMBOL:ITERATOR_SYMBOL});


module.exports = toIterator;});
__d('_shouldPolyfillES6Collection',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}

























function shouldPolyfillES6Collection(collectionName){
var Collection=global[collectionName];
if(Collection == null){
return true;}


var proto=Collection.prototype;


return Collection == null || 
typeof Collection !== 'function' || 
typeof proto.clear !== 'function' || 
new Collection().size !== 0 || 
typeof proto.keys !== 'function' || 
typeof proto.forEach !== 'function' || 
isCallableWithoutNew(Collection) || 
!supportsSubclassing(Collection);}







function supportsSubclassing(Collection){var 
SubCollection=(function(_Collection){function SubCollection(){_classCallCheck(this, SubCollection);if(_Collection != null){_Collection.apply(this, arguments);}}_inherits(SubCollection, _Collection);return SubCollection;})(Collection);
try{
var s=new SubCollection([]);


s.size;
return s instanceof Collection;}
catch(e) {
return false;}}








function isCallableWithoutNew(Collection){
try{
Collection();}
catch(e) {
return false;}

return true;}


module.exports = shouldPolyfillES6Collection;});
__d('ReactNativeGlobalResponderHandler',["NativeModules","ReactNativeTagHandles"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTUIManager=require('NativeModules').UIManager;
var ReactNativeTagHandles=require('ReactNativeTagHandles');

var ReactNativeGlobalResponderHandler={
onChange:function(from, to){
if(to !== null){
RCTUIManager.setJSResponder(
ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(to));}else 

{
RCTUIManager.clearJSResponder();}}};




module.exports = ReactNativeGlobalResponderHandler;});
__d('ReactNativeMount',["NativeModules","ReactNativeTagHandles","ReactPerf","ReactReconciler","ReactUpdateQueue","ReactUpdates","emptyObject","instantiateReactComponent","shouldUpdateReactComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTUIManager=require('NativeModules').UIManager;

var ReactNativeTagHandles=require('ReactNativeTagHandles');
var ReactPerf=require('ReactPerf');
var ReactReconciler=require('ReactReconciler');
var ReactUpdateQueue=require('ReactUpdateQueue');
var ReactUpdates=require('ReactUpdates');

var emptyObject=require('emptyObject');
var instantiateReactComponent=require('instantiateReactComponent');
var shouldUpdateReactComponent=require('shouldUpdateReactComponent');

function instanceNumberToChildRootID(rootNodeID, instanceNumber){
return rootNodeID + '[' + instanceNumber + ']';}










function mountComponentIntoNode(
componentInstance, 
rootID, 
container, 
transaction){
var markup=ReactReconciler.mountComponent(
componentInstance, rootID, transaction, emptyObject);

componentInstance._isTopLevel = true;
ReactNativeMount._mountImageIntoNode(markup, container);}









function batchedMountComponentIntoNode(
componentInstance, 
rootID, 
container){
var transaction=ReactUpdates.ReactReconcileTransaction.getPooled();
transaction.perform(
mountComponentIntoNode, 
null, 
componentInstance, 
rootID, 
container, 
transaction);

ReactUpdates.ReactReconcileTransaction.release(transaction);}






var ReactNativeMount={
instanceCount:0, 

_instancesByContainerID:{}, 





renderComponent:function(
nextElement, 
containerTag, 
callback)
{
var topRootNodeID=ReactNativeTagHandles.tagToRootNodeID[containerTag];
if(topRootNodeID){
var prevComponent=ReactNativeMount._instancesByContainerID[topRootNodeID];
if(prevComponent){
var prevElement=prevComponent._currentElement;
if(shouldUpdateReactComponent(prevElement, nextElement)){
ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
if(callback){
ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);}

return prevComponent;}else 
{
ReactNativeMount.unmountComponentAtNode(containerTag);}}}




if(!ReactNativeTagHandles.reactTagIsNativeTopRootID(containerTag)){
console.error('You cannot render into anything but a top root');
return;}


var topRootNodeID=ReactNativeTagHandles.allocateRootNodeIDForTag(containerTag);
ReactNativeTagHandles.associateRootNodeIDWithMountedNodeHandle(
topRootNodeID, 
containerTag);


var instance=instantiateReactComponent(nextElement);
ReactNativeMount._instancesByContainerID[topRootNodeID] = instance;

var childRootNodeID=instanceNumberToChildRootID(
topRootNodeID, 
ReactNativeMount.instanceCount++);






ReactUpdates.batchedUpdates(
batchedMountComponentIntoNode, 
instance, 
childRootNodeID, 
topRootNodeID);

var component=instance.getPublicInstance();
if(callback){
callback.call(component);}

return component;}, 






_mountImageIntoNode:ReactPerf.measure(

'ReactComponentBrowserEnvironment', 
'mountImageIntoNode', 
function(mountImage, containerID){


ReactNativeTagHandles.associateRootNodeIDWithMountedNodeHandle(
mountImage.rootNodeID, 
mountImage.tag);

var addChildTags=[mountImage.tag];
var addAtIndices=[0];
RCTUIManager.manageChildren(
ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(containerID), 
null, 
null, 
addChildTags, 
addAtIndices, 
null);}), 












unmountComponentAtNodeAndRemoveContainer:function(
containerTag)
{
ReactNativeMount.unmountComponentAtNode(containerTag);

RCTUIManager.removeRootView(containerTag);}, 







unmountComponentAtNode:function(containerTag){
if(!ReactNativeTagHandles.reactTagIsNativeTopRootID(containerTag)){
console.error('You cannot render into anything but a top root');
return false;}


var containerID=ReactNativeTagHandles.tagToRootNodeID[containerTag];
var instance=ReactNativeMount._instancesByContainerID[containerID];
if(!instance){
return false;}

ReactNativeMount.unmountComponentFromNode(instance, containerID);
delete ReactNativeMount._instancesByContainerID[containerID];
return true;}, 











unmountComponentFromNode:function(
instance, 
containerID)
{

ReactReconciler.unmountComponent(instance);
var containerTag=
ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(containerID);
RCTUIManager.removeSubviewsFromContainerWithID(containerTag);}, 


getNode:function(id){
return id;}};



ReactNativeMount.renderComponent = ReactPerf.measure(
'ReactMount', 
'_renderNewRootComponent', 
ReactNativeMount.renderComponent);


module.exports = ReactNativeMount;});
__d('instantiateReactComponent',["ReactCompositeComponent","ReactEmptyComponent","ReactNativeComponent","Object.assign","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactCompositeComponent=require('ReactCompositeComponent');
var ReactEmptyComponent=require('ReactEmptyComponent');
var ReactNativeComponent=require('ReactNativeComponent');

var assign=require('Object.assign');
var invariant=require('invariant');
var warning=require('warning');


var ReactCompositeComponentWrapper=function(){};
assign(
ReactCompositeComponentWrapper.prototype, 
ReactCompositeComponent.Mixin, 
{
_instantiateReactComponent:instantiateReactComponent});










function isInternalComponentType(type){
return (
typeof type === 'function' && 
typeof type.prototype !== 'undefined' && 
typeof type.prototype.mountComponent === 'function' && 
typeof type.prototype.receiveComponent === 'function');}











function instantiateReactComponent(node, parentCompositeType){
var instance;

if(node === null || node === false){
node = ReactEmptyComponent.emptyElement;}


if(typeof node === 'object'){
var element=node;
if(__DEV__){
warning(
element && (typeof element.type === 'function' || 
typeof element.type === 'string'), 
'Only functions or strings can be mounted as React components.');}




if(parentCompositeType === element.type && 
typeof element.type === 'string'){

instance = ReactNativeComponent.createInternalComponent(element);}else 


if(isInternalComponentType(element.type)){



instance = new element.type(element);}else 
{
instance = new ReactCompositeComponentWrapper();}}else 

if(typeof node === 'string' || typeof node === 'number'){
instance = ReactNativeComponent.createInstanceForText(node);}else 
{
invariant(
false, 
'Encountered invalid React node of type %s', 
typeof node);}



if(__DEV__){
warning(
typeof instance.construct === 'function' && 
typeof instance.mountComponent === 'function' && 
typeof instance.receiveComponent === 'function' && 
typeof instance.unmountComponent === 'function', 
'Only React Components can be mounted.');}




instance.construct(node);




instance._mountIndex = 0;
instance._mountImage = null;

if(__DEV__){
instance._isOwnerNecessary = false;
instance._warnedAboutRefsInRender = false;}




if(__DEV__){
if(Object.preventExtensions){
Object.preventExtensions(instance);}}



return instance;}


module.exports = instantiateReactComponent;});
__d('ReactCompositeComponent',["ReactComponentEnvironment","ReactContext","ReactCurrentOwner","ReactElement","ReactElementValidator","ReactInstanceMap","ReactLifeCycle","ReactNativeComponent","ReactPerf","ReactPropTypeLocations","ReactPropTypeLocationNames","ReactReconciler","ReactUpdates","Object.assign","emptyObject","invariant","shouldUpdateReactComponent","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactComponentEnvironment=require('ReactComponentEnvironment');
var ReactContext=require('ReactContext');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactElement=require('ReactElement');
var ReactElementValidator=require('ReactElementValidator');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactLifeCycle=require('ReactLifeCycle');
var ReactNativeComponent=require('ReactNativeComponent');
var ReactPerf=require('ReactPerf');
var ReactPropTypeLocations=require('ReactPropTypeLocations');
var ReactPropTypeLocationNames=require('ReactPropTypeLocationNames');
var ReactReconciler=require('ReactReconciler');
var ReactUpdates=require('ReactUpdates');

var assign=require('Object.assign');
var emptyObject=require('emptyObject');
var invariant=require('invariant');
var shouldUpdateReactComponent=require('shouldUpdateReactComponent');
var warning=require('warning');

function getDeclarationErrorAddendum(component){
var owner=component._currentElement._owner || null;
if(owner){
var name=owner.getName();
if(name){
return ' Check the render method of `' + name + '`.';}}


return '';}



































var nextMountID=1;




var ReactCompositeComponentMixin={








construct:function(element){
this._currentElement = element;
this._rootNodeID = null;
this._instance = null;


this._pendingElement = null;
this._pendingStateQueue = null;
this._pendingReplaceState = false;
this._pendingForceUpdate = false;

this._renderedComponent = null;

this._context = null;
this._mountOrder = 0;
this._isTopLevel = false;


this._pendingCallbacks = null;}, 











mountComponent:function(rootID, transaction, context){
this._context = context;
this._mountOrder = nextMountID++;
this._rootNodeID = rootID;

var publicProps=this._processProps(this._currentElement.props);
var publicContext=this._processContext(this._currentElement._context);

var Component=ReactNativeComponent.getComponentClassForElement(
this._currentElement);



var inst=new Component(publicProps, publicContext);

if(__DEV__){


warning(
inst.render != null, 
'%s(...): No `render` method found on the returned component ' + 
'instance: you may have forgotten to define `render` in your ' + 
'component or you may have accidentally tried to render an element ' + 
'whose type is a function that isn\'t a React component.', 
Component.displayName || Component.name || 'Component');}





inst.props = publicProps;
inst.context = publicContext;
inst.refs = emptyObject;

this._instance = inst;


ReactInstanceMap.set(inst, this);

if(__DEV__){
this._warnIfContextsDiffer(this._currentElement._context, context);}


if(__DEV__){



warning(
!inst.getInitialState || 
inst.getInitialState.isReactClassApproved, 
'getInitialState was defined on %s, a plain JavaScript class. ' + 
'This is only supported for classes created using React.createClass. ' + 
'Did you mean to define a state property instead?', 
this.getName() || 'a component');

warning(
!inst.getDefaultProps || 
inst.getDefaultProps.isReactClassApproved, 
'getDefaultProps was defined on %s, a plain JavaScript class. ' + 
'This is only supported for classes created using React.createClass. ' + 
'Use a static property to define defaultProps instead.', 
this.getName() || 'a component');

warning(
!inst.propTypes, 
'propTypes was defined as an instance property on %s. Use a static ' + 
'property to define propTypes instead.', 
this.getName() || 'a component');

warning(
!inst.contextTypes, 
'contextTypes was defined as an instance property on %s. Use a ' + 
'static property to define contextTypes instead.', 
this.getName() || 'a component');

warning(
typeof inst.componentShouldUpdate !== 'function', 
'%s has a method called ' + 
'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 
'The name is phrased as a question because the function is ' + 
'expected to return a value.', 
this.getName() || 'A component');}



var initialState=inst.state;
if(initialState === undefined){
inst.state = initialState = null;}

invariant(
typeof initialState === 'object' && !Array.isArray(initialState), 
'%s.state: must be set to an object or null', 
this.getName() || 'ReactCompositeComponent');


this._pendingStateQueue = null;
this._pendingReplaceState = false;
this._pendingForceUpdate = false;

var renderedElement;

var previouslyMounting=ReactLifeCycle.currentlyMountingInstance;
ReactLifeCycle.currentlyMountingInstance = this;
try{
if(inst.componentWillMount){
inst.componentWillMount();


if(this._pendingStateQueue){
inst.state = this._processPendingState(inst.props, inst.context);}}



renderedElement = this._renderValidatedComponent();}finally 
{
ReactLifeCycle.currentlyMountingInstance = previouslyMounting;}


this._renderedComponent = this._instantiateReactComponent(
renderedElement, 
this._currentElement.type);


var markup=ReactReconciler.mountComponent(
this._renderedComponent, 
rootID, 
transaction, 
this._processChildContext(context));

if(inst.componentDidMount){
transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);}


return markup;}, 








unmountComponent:function(){
var inst=this._instance;

if(inst.componentWillUnmount){
var previouslyUnmounting=ReactLifeCycle.currentlyUnmountingInstance;
ReactLifeCycle.currentlyUnmountingInstance = this;
try{
inst.componentWillUnmount();}finally 
{
ReactLifeCycle.currentlyUnmountingInstance = previouslyUnmounting;}}



ReactReconciler.unmountComponent(this._renderedComponent);
this._renderedComponent = null;


this._pendingStateQueue = null;
this._pendingReplaceState = false;
this._pendingForceUpdate = false;
this._pendingCallbacks = null;
this._pendingElement = null;



this._context = null;
this._rootNodeID = null;




ReactInstanceMap.remove(inst);}, 
















_setPropsInternal:function(partialProps, callback){


var element=this._pendingElement || this._currentElement;
this._pendingElement = ReactElement.cloneAndReplaceProps(
element, 
assign({}, element.props, partialProps));

ReactUpdates.enqueueUpdate(this, callback);}, 










_maskContext:function(context){
var maskedContext=null;


if(typeof this._currentElement.type === 'string'){
return emptyObject;}

var contextTypes=this._currentElement.type.contextTypes;
if(!contextTypes){
return emptyObject;}

maskedContext = {};
for(var contextName in contextTypes) {
maskedContext[contextName] = context[contextName];}

return maskedContext;}, 










_processContext:function(context){
var maskedContext=this._maskContext(context);
if(__DEV__){
var Component=ReactNativeComponent.getComponentClassForElement(
this._currentElement);

if(Component.contextTypes){
this._checkPropTypes(
Component.contextTypes, 
maskedContext, 
ReactPropTypeLocations.context);}}



return maskedContext;}, 







_processChildContext:function(currentContext){
var inst=this._instance;
var childContext=inst.getChildContext && inst.getChildContext();
if(childContext){
invariant(
typeof inst.constructor.childContextTypes === 'object', 
'%s.getChildContext(): childContextTypes must be defined in order to ' + 
'use getChildContext().', 
this.getName() || 'ReactCompositeComponent');

if(__DEV__){
this._checkPropTypes(
inst.constructor.childContextTypes, 
childContext, 
ReactPropTypeLocations.childContext);}


for(var name in childContext) {
invariant(
name in inst.constructor.childContextTypes, 
'%s.getChildContext(): key "%s" is not defined in childContextTypes.', 
this.getName() || 'ReactCompositeComponent', 
name);}


return assign({}, currentContext, childContext);}

return currentContext;}, 











_processProps:function(newProps){
if(__DEV__){
var Component=ReactNativeComponent.getComponentClassForElement(
this._currentElement);

if(Component.propTypes){
this._checkPropTypes(
Component.propTypes, 
newProps, 
ReactPropTypeLocations.prop);}}



return newProps;}, 










_checkPropTypes:function(propTypes, props, location){


var componentName=this.getName();
for(var propName in propTypes) {
if(propTypes.hasOwnProperty(propName)){
var error;
try{


invariant(
typeof propTypes[propName] === 'function', 
'%s: %s type `%s` is invalid; it must be a function, usually ' + 
'from React.PropTypes.', 
componentName || 'React class', 
ReactPropTypeLocationNames[location], 
propName);

error = propTypes[propName](props, propName, componentName, location);}
catch(ex) {
error = ex;}

if(error instanceof Error){



var addendum=getDeclarationErrorAddendum(this);

if(location === ReactPropTypeLocations.prop){

warning(
false, 
'Failed Composite propType: %s%s', 
error.message, 
addendum);}else 

{
warning(
false, 
'Failed Context Types: %s%s', 
error.message, 
addendum);}}}}}, 







receiveComponent:function(nextElement, transaction, nextContext){
var prevElement=this._currentElement;
var prevContext=this._context;

this._pendingElement = null;

this.updateComponent(
transaction, 
prevElement, 
nextElement, 
prevContext, 
nextContext);}, 










performUpdateIfNecessary:function(transaction){
if(this._pendingElement != null){
ReactReconciler.receiveComponent(
this, 
this._pendingElement || this._currentElement, 
transaction, 
this._context);}



if(this._pendingStateQueue !== null || this._pendingForceUpdate){
if(__DEV__){
ReactElementValidator.checkAndWarnForMutatedProps(
this._currentElement);}



this.updateComponent(
transaction, 
this._currentElement, 
this._currentElement, 
this._context, 
this._context);}}, 








_warnIfContextsDiffer:function(ownerBasedContext, parentBasedContext){
ownerBasedContext = this._maskContext(ownerBasedContext);
parentBasedContext = this._maskContext(parentBasedContext);
var parentKeys=Object.keys(parentBasedContext).sort();
var displayName=this.getName() || 'ReactCompositeComponent';
for(var i=0; i < parentKeys.length; i++) {
var key=parentKeys[i];
warning(
ownerBasedContext[key] === parentBasedContext[key], 
'owner-based and parent-based contexts differ ' + 
'(values: `%s` vs `%s`) for key (%s) while mounting %s ' + 
'(see: http://fb.me/react-context-by-parent)', 
ownerBasedContext[key], 
parentBasedContext[key], 
key, 
displayName);}}, 



















updateComponent:function(
transaction, 
prevParentElement, 
nextParentElement, 
prevUnmaskedContext, 
nextUnmaskedContext)
{
var inst=this._instance;

var nextContext=inst.context;
var nextProps=inst.props;


if(prevParentElement !== nextParentElement){
nextContext = this._processContext(nextParentElement._context);
nextProps = this._processProps(nextParentElement.props);

if(__DEV__){
if(nextUnmaskedContext != null){
this._warnIfContextsDiffer(
nextParentElement._context, 
nextUnmaskedContext);}}








if(inst.componentWillReceiveProps){
inst.componentWillReceiveProps(nextProps, nextContext);}}



var nextState=this._processPendingState(nextProps, nextContext);

var shouldUpdate=
this._pendingForceUpdate || 
!inst.shouldComponentUpdate || 
inst.shouldComponentUpdate(nextProps, nextState, nextContext);

if(__DEV__){
warning(
typeof shouldUpdate !== 'undefined', 
'%s.shouldComponentUpdate(): Returned undefined instead of a ' + 
'boolean value. Make sure to return true or false.', 
this.getName() || 'ReactCompositeComponent');}



if(shouldUpdate){
this._pendingForceUpdate = false;

this._performComponentUpdate(
nextParentElement, 
nextProps, 
nextState, 
nextContext, 
transaction, 
nextUnmaskedContext);}else 

{


this._currentElement = nextParentElement;
this._context = nextUnmaskedContext;
inst.props = nextProps;
inst.state = nextState;
inst.context = nextContext;}}, 



_processPendingState:function(props, context){
var inst=this._instance;
var queue=this._pendingStateQueue;
var replace=this._pendingReplaceState;
this._pendingReplaceState = false;
this._pendingStateQueue = null;

if(!queue){
return inst.state;}


var nextState=assign({}, replace?queue[0]:inst.state);
for(var i=replace?1:0; i < queue.length; i++) {
var partial=queue[i];
assign(
nextState, 
typeof partial === 'function'?
partial.call(inst, nextState, props, context):
partial);}



return nextState;}, 














_performComponentUpdate:function(
nextElement, 
nextProps, 
nextState, 
nextContext, 
transaction, 
unmaskedContext)
{
var inst=this._instance;

var prevProps=inst.props;
var prevState=inst.state;
var prevContext=inst.context;

if(inst.componentWillUpdate){
inst.componentWillUpdate(nextProps, nextState, nextContext);}


this._currentElement = nextElement;
this._context = unmaskedContext;
inst.props = nextProps;
inst.state = nextState;
inst.context = nextContext;

this._updateRenderedComponent(transaction, unmaskedContext);

if(inst.componentDidUpdate){
transaction.getReactMountReady().enqueue(
inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), 
inst);}}, 










_updateRenderedComponent:function(transaction, context){
var prevComponentInstance=this._renderedComponent;
var prevRenderedElement=prevComponentInstance._currentElement;
var nextRenderedElement=this._renderValidatedComponent();
if(shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)){
ReactReconciler.receiveComponent(
prevComponentInstance, 
nextRenderedElement, 
transaction, 
this._processChildContext(context));}else 

{

var thisID=this._rootNodeID;
var prevComponentID=prevComponentInstance._rootNodeID;
ReactReconciler.unmountComponent(prevComponentInstance);

this._renderedComponent = this._instantiateReactComponent(
nextRenderedElement, 
this._currentElement.type);

var nextMarkup=ReactReconciler.mountComponent(
this._renderedComponent, 
thisID, 
transaction, 
this._processChildContext(context));

this._replaceNodeWithMarkupByID(prevComponentID, nextMarkup);}}, 






_replaceNodeWithMarkupByID:function(prevComponentID, nextMarkup){
ReactComponentEnvironment.replaceNodeWithMarkupByID(
prevComponentID, 
nextMarkup);}, 






_renderValidatedComponentWithoutOwnerOrContext:function(){
var inst=this._instance;
var renderedComponent=inst.render();
if(__DEV__){

if(typeof renderedComponent === 'undefined' && 
inst.render._isMockFunction){


renderedComponent = null;}}



return renderedComponent;}, 





_renderValidatedComponent:function(){
var renderedComponent;
var previousContext=ReactContext.current;
ReactContext.current = this._processChildContext(
this._currentElement._context);

ReactCurrentOwner.current = this;
try{
renderedComponent = 
this._renderValidatedComponentWithoutOwnerOrContext();}finally 
{
ReactContext.current = previousContext;
ReactCurrentOwner.current = null;}

invariant(

renderedComponent === null || renderedComponent === false || 
ReactElement.isValidElement(renderedComponent), 
'%s.render(): A valid ReactComponent must be returned. You may have ' + 
'returned undefined, an array or some other invalid object.', 
this.getName() || 'ReactCompositeComponent');

return renderedComponent;}, 










attachRef:function(ref, component){
var inst=this.getPublicInstance();
var refs=inst.refs === emptyObject?inst.refs = {}:inst.refs;
refs[ref] = component.getPublicInstance();}, 









detachRef:function(ref){
var refs=this.getPublicInstance().refs;
delete refs[ref];}, 








getName:function(){
var type=this._currentElement.type;
var constructor=this._instance && this._instance.constructor;
return (
type.displayName || constructor && constructor.displayName || 
type.name || constructor && constructor.name || 
null);}, 











getPublicInstance:function(){
return this._instance;}, 



_instantiateReactComponent:null};



ReactPerf.measureMethods(
ReactCompositeComponentMixin, 
'ReactCompositeComponent', 
{
mountComponent:'mountComponent', 
updateComponent:'updateComponent', 
_renderValidatedComponent:'_renderValidatedComponent'});



var ReactCompositeComponent={

Mixin:ReactCompositeComponentMixin};



module.exports = ReactCompositeComponent;});
__d('shouldUpdateReactComponent',["warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var warning=require('warning');












function shouldUpdateReactComponent(prevElement, nextElement){
if(prevElement != null && nextElement != null){
var prevType=typeof prevElement;
var nextType=typeof nextElement;
if(prevType === 'string' || prevType === 'number'){
return nextType === 'string' || nextType === 'number';}else 
{
if(nextType === 'object' && 
prevElement.type === nextElement.type && 
prevElement.key === nextElement.key){
var ownersMatch=prevElement._owner === nextElement._owner;
var prevName=null;
var nextName=null;
var nextDisplayName=null;
if(__DEV__){
if(!ownersMatch){
if(prevElement._owner != null && 
prevElement._owner.getPublicInstance() != null && 
prevElement._owner.getPublicInstance().constructor != null){
prevName = 
prevElement._owner.getPublicInstance().constructor.displayName;}

if(nextElement._owner != null && 
nextElement._owner.getPublicInstance() != null && 
nextElement._owner.getPublicInstance().constructor != null){
nextName = 
nextElement._owner.getPublicInstance().constructor.displayName;}

if(nextElement.type != null && 
nextElement.type.displayName != null){
nextDisplayName = nextElement.type.displayName;}

if(nextElement.type != null && typeof nextElement.type === 'string'){
nextDisplayName = nextElement.type;}

if(typeof nextElement.type !== 'string' || 
nextElement.type === 'input' || 
nextElement.type === 'textarea'){
if(prevElement._owner != null && 
prevElement._owner._isOwnerNecessary === false || 
nextElement._owner != null && 
nextElement._owner._isOwnerNecessary === false){
if(prevElement._owner != null){
prevElement._owner._isOwnerNecessary = true;}

if(nextElement._owner != null){
nextElement._owner._isOwnerNecessary = true;}

warning(
false, 
'<%s /> is being rendered by both %s and %s using the same ' + 
'key (%s) in the same place. Currently, this means that ' + 
'they don\'t preserve state. This behavior should be very ' + 
'rare so we\'re considering deprecating it. Please contact ' + 
'the React team and explain your use case so that we can ' + 
'take that into consideration.', 
nextDisplayName || 'Unknown Component', 
prevName || '[Unknown]', 
nextName || '[Unknown]', 
prevElement.key);}}}}





return ownersMatch;}}}



return false;}


module.exports = shouldUpdateReactComponent;});
__d('ReactNativeTextComponent',["ReactNativeTagHandles","NativeModules","Object.assign"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactNativeTagHandles=require('ReactNativeTagHandles');
var RCTUIManager=require('NativeModules').UIManager;

var assign=require('Object.assign');

var ReactNativeTextComponent=function(props){};



assign(ReactNativeTextComponent.prototype, {

construct:function(text){

this._currentElement = text;
this._stringText = '' + text;
this._rootNodeID = null;}, 


mountComponent:function(rootID, transaction, context){
this._rootNodeID = rootID;
var tag=ReactNativeTagHandles.allocateTag();
RCTUIManager.createView(tag, 'RCTRawText', {text:this._stringText});
return {
rootNodeID:rootID, 
tag:tag};}, 



receiveComponent:function(nextText, transaction, context){
if(nextText !== this._currentElement){
this._currentElement = nextText;
var nextStringText='' + nextText;
if(nextStringText !== this._stringText){
this._stringText = nextStringText;
RCTUIManager.updateView(
ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(
this._rootNodeID), 

'RCTRawText', 
{text:this._stringText});}}}, 





unmountComponent:function(){
this._currentElement = null;
this._stringText = null;
this._rootNodeID = null;}});




module.exports = ReactNativeTextComponent;});
__d('ResponderEventPlugin',["EventConstants","EventPluginUtils","EventPropagators","NodeHandle","ReactInstanceHandles","ResponderSyntheticEvent","ResponderTouchHistoryStore","accumulate","invariant","keyOf"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



















var EventConstants=require('EventConstants');
var EventPluginUtils=require('EventPluginUtils');
var EventPropagators=require('EventPropagators');
var NodeHandle=require('NodeHandle');
var ReactInstanceHandles=require('ReactInstanceHandles');
var ResponderSyntheticEvent=require('ResponderSyntheticEvent');
var ResponderTouchHistoryStore=require('ResponderTouchHistoryStore');

var accumulate=require('accumulate');
var invariant=require('invariant');
var keyOf=require('keyOf');

var isStartish=EventPluginUtils.isStartish;
var isMoveish=EventPluginUtils.isMoveish;
var isEndish=EventPluginUtils.isEndish;
var executeDirectDispatch=EventPluginUtils.executeDirectDispatch;
var hasDispatches=EventPluginUtils.hasDispatches;
var executeDispatchesInOrderStopAtTrue=
EventPluginUtils.executeDispatchesInOrderStopAtTrue;





var responderID=null;





var trackedTouchCount=0;




var previousActiveTouches=0;

var changeResponder=function(nextResponderID){
var oldResponderID=responderID;
responderID = nextResponderID;
if(ResponderEventPlugin.GlobalResponderHandler !== null){
ResponderEventPlugin.GlobalResponderHandler.onChange(
oldResponderID, 
nextResponderID);}};




var eventTypes={




startShouldSetResponder:{
phasedRegistrationNames:{
bubbled:keyOf({onStartShouldSetResponder:null}), 
captured:keyOf({onStartShouldSetResponderCapture:null})}}, 












scrollShouldSetResponder:{
phasedRegistrationNames:{
bubbled:keyOf({onScrollShouldSetResponder:null}), 
captured:keyOf({onScrollShouldSetResponderCapture:null})}}, 










selectionChangeShouldSetResponder:{
phasedRegistrationNames:{
bubbled:keyOf({onSelectionChangeShouldSetResponder:null}), 
captured:keyOf({onSelectionChangeShouldSetResponderCapture:null})}}, 







moveShouldSetResponder:{
phasedRegistrationNames:{
bubbled:keyOf({onMoveShouldSetResponder:null}), 
captured:keyOf({onMoveShouldSetResponderCapture:null})}}, 






responderStart:{registrationName:keyOf({onResponderStart:null})}, 
responderMove:{registrationName:keyOf({onResponderMove:null})}, 
responderEnd:{registrationName:keyOf({onResponderEnd:null})}, 
responderRelease:{registrationName:keyOf({onResponderRelease:null})}, 
responderTerminationRequest:{
registrationName:keyOf({onResponderTerminationRequest:null})}, 

responderGrant:{registrationName:keyOf({onResponderGrant:null})}, 
responderReject:{registrationName:keyOf({onResponderReject:null})}, 
responderTerminate:{registrationName:keyOf({onResponderTerminate:null})}};






































































































































































































function setResponderAndExtractTransfer(
topLevelType, 
topLevelTargetID, 
nativeEvent){
var shouldSetEventType=
isStartish(topLevelType)?eventTypes.startShouldSetResponder:
isMoveish(topLevelType)?eventTypes.moveShouldSetResponder:
topLevelType === EventConstants.topLevelTypes.topSelectionChange?
eventTypes.selectionChangeShouldSetResponder:
eventTypes.scrollShouldSetResponder;


var bubbleShouldSetFrom=!responderID?
topLevelTargetID:
ReactInstanceHandles._getFirstCommonAncestorID(responderID, topLevelTargetID);





var skipOverBubbleShouldSetFrom=bubbleShouldSetFrom === responderID;
var shouldSetEvent=ResponderSyntheticEvent.getPooled(
shouldSetEventType, 
bubbleShouldSetFrom, 
nativeEvent);

shouldSetEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
if(skipOverBubbleShouldSetFrom){
EventPropagators.accumulateTwoPhaseDispatchesSkipTarget(shouldSetEvent);}else 
{
EventPropagators.accumulateTwoPhaseDispatches(shouldSetEvent);}

var wantsResponderID=executeDispatchesInOrderStopAtTrue(shouldSetEvent);
if(!shouldSetEvent.isPersistent()){
shouldSetEvent.constructor.release(shouldSetEvent);}


if(!wantsResponderID || wantsResponderID === responderID){
return null;}

var extracted;
var grantEvent=ResponderSyntheticEvent.getPooled(
eventTypes.responderGrant, 
wantsResponderID, 
nativeEvent);

grantEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;

EventPropagators.accumulateDirectDispatches(grantEvent);
if(responderID){

var terminationRequestEvent=ResponderSyntheticEvent.getPooled(
eventTypes.responderTerminationRequest, 
responderID, 
nativeEvent);

terminationRequestEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
EventPropagators.accumulateDirectDispatches(terminationRequestEvent);
var shouldSwitch=!hasDispatches(terminationRequestEvent) || 
executeDirectDispatch(terminationRequestEvent);
if(!terminationRequestEvent.isPersistent()){
terminationRequestEvent.constructor.release(terminationRequestEvent);}


if(shouldSwitch){
var terminateType=eventTypes.responderTerminate;
var terminateEvent=ResponderSyntheticEvent.getPooled(
terminateType, 
responderID, 
nativeEvent);

terminateEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
EventPropagators.accumulateDirectDispatches(terminateEvent);
extracted = accumulate(extracted, [grantEvent, terminateEvent]);
changeResponder(wantsResponderID);}else 
{
var rejectEvent=ResponderSyntheticEvent.getPooled(
eventTypes.responderReject, 
wantsResponderID, 
nativeEvent);

rejectEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
EventPropagators.accumulateDirectDispatches(rejectEvent);
extracted = accumulate(extracted, rejectEvent);}}else 

{
extracted = accumulate(extracted, grantEvent);
changeResponder(wantsResponderID);}

return extracted;}










function canTriggerTransfer(topLevelType, topLevelTargetID){
return topLevelTargetID && (
topLevelType === EventConstants.topLevelTypes.topScroll || 
trackedTouchCount > 0 && 
topLevelType === EventConstants.topLevelTypes.topSelectionChange || 
isStartish(topLevelType) || 
isMoveish(topLevelType));}










function noResponderTouches(nativeEvent){
var touches=nativeEvent.touches;
if(!touches || touches.length === 0){
return true;}

for(var i=0; i < touches.length; i++) {
var activeTouch=touches[i];
var target=activeTouch.target;
if(target !== null && target !== undefined && target !== 0){

var commonAncestor=
ReactInstanceHandles._getFirstCommonAncestorID(
responderID, 
NodeHandle.getRootNodeID(target));

if(commonAncestor === responderID){
return false;}}}



return true;}



var ResponderEventPlugin={

getResponderID:function(){
return responderID;}, 


eventTypes:eventTypes, 













extractEvents:function(
topLevelType, 
topLevelTarget, 
topLevelTargetID, 
nativeEvent){

if(isStartish(topLevelType)){
trackedTouchCount += 1;}else 
if(isEndish(topLevelType)){
trackedTouchCount -= 1;
invariant(
trackedTouchCount >= 0, 
'Ended a touch event which was not counted in trackedTouchCount.');}



ResponderTouchHistoryStore.recordTouchTrack(topLevelType, nativeEvent);

var extracted=canTriggerTransfer(topLevelType, topLevelTargetID)?
setResponderAndExtractTransfer(topLevelType, topLevelTargetID, nativeEvent):
null;










var isResponderTouchStart=responderID && isStartish(topLevelType);
var isResponderTouchMove=responderID && isMoveish(topLevelType);
var isResponderTouchEnd=responderID && isEndish(topLevelType);
var incrementalTouch=
isResponderTouchStart?eventTypes.responderStart:
isResponderTouchMove?eventTypes.responderMove:
isResponderTouchEnd?eventTypes.responderEnd:
null;

if(incrementalTouch){
var gesture=
ResponderSyntheticEvent.getPooled(incrementalTouch, responderID, nativeEvent);
gesture.touchHistory = ResponderTouchHistoryStore.touchHistory;
EventPropagators.accumulateDirectDispatches(gesture);
extracted = accumulate(extracted, gesture);}


var isResponderTerminate=
responderID && 
topLevelType === EventConstants.topLevelTypes.topTouchCancel;
var isResponderRelease=
responderID && 
!isResponderTerminate && 
isEndish(topLevelType) && 
noResponderTouches(nativeEvent);
var finalTouch=
isResponderTerminate?eventTypes.responderTerminate:
isResponderRelease?eventTypes.responderRelease:
null;
if(finalTouch){
var finalEvent=
ResponderSyntheticEvent.getPooled(finalTouch, responderID, nativeEvent);
finalEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
EventPropagators.accumulateDirectDispatches(finalEvent);
extracted = accumulate(extracted, finalEvent);
changeResponder(null);}


var numberActiveTouches=
ResponderTouchHistoryStore.touchHistory.numberActiveTouches;
if(ResponderEventPlugin.GlobalInteractionHandler && 
numberActiveTouches !== previousActiveTouches){
ResponderEventPlugin.GlobalInteractionHandler.onChange(
numberActiveTouches);}


previousActiveTouches = numberActiveTouches;

return extracted;}, 


GlobalResponderHandler:null, 
GlobalInteractionHandler:null, 

injection:{





injectGlobalResponderHandler:function(GlobalResponderHandler){
ResponderEventPlugin.GlobalResponderHandler = GlobalResponderHandler;}, 






injectGlobalInteractionHandler:function(GlobalInteractionHandler){
ResponderEventPlugin.GlobalInteractionHandler = GlobalInteractionHandler;}}};




module.exports = ResponderEventPlugin;});
__d('ResponderSyntheticEvent',["SyntheticEvent"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";




















var SyntheticEvent=require("SyntheticEvent");






var ResponderEventInterface={
touchHistory:function(nativeEvent){
return null;}};









function ResponderSyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent){
SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);}


SyntheticEvent.augmentClass(ResponderSyntheticEvent, ResponderEventInterface);

module.exports = ResponderSyntheticEvent;});
__d('ResponderTouchHistoryStore',["EventPluginUtils","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';





var EventPluginUtils=require('EventPluginUtils');

var invariant=require('invariant');

var isMoveish=EventPluginUtils.isMoveish;
var isStartish=EventPluginUtils.isStartish;
var isEndish=EventPluginUtils.isEndish;

var MAX_TOUCH_BANK=20;
















var touchHistory={
touchBank:[], 
numberActiveTouches:0, 



indexOfSingleActiveTouch:-1, 
mostRecentTimeStamp:0};


var timestampForTouch=function(touch){



return touch.timeStamp || touch.timestamp;};







var initializeTouchData=function(touch){
return {
touchActive:true, 
startTimeStamp:timestampForTouch(touch), 
startPageX:touch.pageX, 
startPageY:touch.pageY, 
currentPageX:touch.pageX, 
currentPageY:touch.pageY, 
currentTimeStamp:timestampForTouch(touch), 
previousPageX:touch.pageX, 
previousPageY:touch.pageY, 
previousTimeStamp:timestampForTouch(touch)};};



var reinitializeTouchTrack=function(touchTrack, touch){
touchTrack.touchActive = true;
touchTrack.startTimeStamp = timestampForTouch(touch);
touchTrack.startPageX = touch.pageX;
touchTrack.startPageY = touch.pageY;
touchTrack.currentPageX = touch.pageX;
touchTrack.currentPageY = touch.pageY;
touchTrack.currentTimeStamp = timestampForTouch(touch);
touchTrack.previousPageX = touch.pageX;
touchTrack.previousPageY = touch.pageY;
touchTrack.previousTimeStamp = timestampForTouch(touch);};


var validateTouch=function(touch){
var identifier=touch.identifier;
invariant(identifier != null, 'Touch object is missing identifier');
if(identifier > MAX_TOUCH_BANK){
console.warn(
'Touch identifier ' + identifier + ' is greater than maximum ' + 
'supported ' + MAX_TOUCH_BANK + ' which causes performance issues ' + 
'backfilling array locations for all of the indices.');}};




var recordStartTouchData=function(touch){
var touchBank=touchHistory.touchBank;
var identifier=touch.identifier;
var touchTrack=touchBank[identifier];
if(__DEV__){
validateTouch(touch);}

if(!touchTrack){
touchBank[touch.identifier] = initializeTouchData(touch);}else 
{
reinitializeTouchTrack(touchTrack, touch);}

touchHistory.mostRecentTimeStamp = timestampForTouch(touch);};


var recordMoveTouchData=function(touch){
var touchBank=touchHistory.touchBank;
var touchTrack=touchBank[touch.identifier];
if(__DEV__){
validateTouch(touch);
invariant(touchTrack, 'Touch data should have been recorded on start');}

touchTrack.touchActive = true;
touchTrack.previousPageX = touchTrack.currentPageX;
touchTrack.previousPageY = touchTrack.currentPageY;
touchTrack.previousTimeStamp = touchTrack.currentTimeStamp;
touchTrack.currentPageX = touch.pageX;
touchTrack.currentPageY = touch.pageY;
touchTrack.currentTimeStamp = timestampForTouch(touch);
touchHistory.mostRecentTimeStamp = timestampForTouch(touch);};


var recordEndTouchData=function(touch){
var touchBank=touchHistory.touchBank;
var touchTrack=touchBank[touch.identifier];
if(__DEV__){
validateTouch(touch);
invariant(touchTrack, 'Touch data should have been recorded on start');}

touchTrack.previousPageX = touchTrack.currentPageX;
touchTrack.previousPageY = touchTrack.currentPageY;
touchTrack.previousTimeStamp = touchTrack.currentTimeStamp;
touchTrack.currentPageX = touch.pageX;
touchTrack.currentPageY = touch.pageY;
touchTrack.currentTimeStamp = timestampForTouch(touch);
touchTrack.touchActive = false;
touchHistory.mostRecentTimeStamp = timestampForTouch(touch);};


var ResponderTouchHistoryStore={
recordTouchTrack:function(topLevelType, nativeEvent){
var touchBank=touchHistory.touchBank;
if(isMoveish(topLevelType)){
nativeEvent.changedTouches.forEach(recordMoveTouchData);}else 
if(isStartish(topLevelType)){
nativeEvent.changedTouches.forEach(recordStartTouchData);
touchHistory.numberActiveTouches = nativeEvent.touches.length;
if(touchHistory.numberActiveTouches === 1){
touchHistory.indexOfSingleActiveTouch = nativeEvent.touches[0].identifier;}}else 

if(isEndish(topLevelType)){
nativeEvent.changedTouches.forEach(recordEndTouchData);
touchHistory.numberActiveTouches = nativeEvent.touches.length;
if(touchHistory.numberActiveTouches === 1){
for(var i=0; i < touchBank.length; i++) {
var touchTrackToCheck=touchBank[i];
if(touchTrackToCheck != null && touchTrackToCheck.touchActive){
touchHistory.indexOfSingleActiveTouch = i;
break;}}


if(__DEV__){
var activeTouchData=touchBank[touchHistory.indexOfSingleActiveTouch];
var foundActive=activeTouchData != null && !!activeTouchData.touchActive;
invariant(foundActive, 'Cannot find single active touch');}}}}, 





touchHistory:touchHistory};



module.exports = ResponderTouchHistoryStore;});
__d('accumulate',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');








function accumulate(current, next){
invariant(
next != null, 
'accumulate(...): Accumulated items must be not be null or undefined.');

if(current == null){
return next;}else 
{


var currentIsArray=Array.isArray(current);
var nextIsArray=Array.isArray(next);
if(currentIsArray){
return current.concat(next);}else 
{
if(nextIsArray){
return [current].concat(next);}else 
{
return [current, next];}}}}





module.exports = accumulate;});
__d('UniversalWorkerNodeHandle',["ReactNativeTagHandles","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 



ReactNativeTagHandles=require('ReactNativeTagHandles');

var invariant=require('invariant');

var UniversalWorkerNodeHandle={
getRootNodeID:function(nodeHandle){
invariant(
nodeHandle !== undefined && nodeHandle !== null && nodeHandle !== 0, 
'No node handle defined');

return ReactNativeTagHandles.tagToRootNodeID[nodeHandle];}};



module.exports = UniversalWorkerNodeHandle;});
__d('createReactNativeComponentClass',["ReactNativeBaseComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactNativeBaseComponent=require('ReactNativeBaseComponent');











var createReactNativeComponentClass=function(
viewConfig)
{
var Constructor=function(element){
this._currentElement = element;

this._rootNodeID = null;
this._renderedChildren = null;
this.previousFlattenedStyle = null;};

Constructor.displayName = viewConfig.uiViewClassName;
Constructor.viewConfig = viewConfig;
Constructor.prototype = new ReactNativeBaseComponent(viewConfig);
Constructor.prototype.constructor = Constructor;

return Constructor;};


module.exports = createReactNativeComponentClass;});
__d('ReactNativeBaseComponent',["NativeMethodsMixin","ReactNativeEventEmitter","ReactNativeStyleAttributes","ReactNativeTagHandles","ReactMultiChild","NativeModules","styleDiffer","deepFreezeAndThrowOnMutationInDev","diffRawProperties","flattenStyle","precomputeStyle","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeMethodsMixin=require('NativeMethodsMixin');
var ReactNativeEventEmitter=require('ReactNativeEventEmitter');
var ReactNativeStyleAttributes=require('ReactNativeStyleAttributes');
var ReactNativeTagHandles=require('ReactNativeTagHandles');
var ReactMultiChild=require('ReactMultiChild');
var RCTUIManager=require('NativeModules').UIManager;

var styleDiffer=require('styleDiffer');
var deepFreezeAndThrowOnMutationInDev=require('deepFreezeAndThrowOnMutationInDev');
var diffRawProperties=require('diffRawProperties');
var flattenStyle=require('flattenStyle');
var precomputeStyle=require('precomputeStyle');
var warning=require('warning');

var registrationNames=ReactNativeEventEmitter.registrationNames;
var putListener=ReactNativeEventEmitter.putListener;
var deleteAllListeners=ReactNativeEventEmitter.deleteAllListeners;












var ReactNativeBaseComponent=function(
viewConfig)
{
this.viewConfig = viewConfig;};












var cachedIndexArray=function(size){
var cachedResult=cachedIndexArray._cache[size];
if(!cachedResult){
var arr=[];
for(var i=0; i < size; i++) {
arr[i] = i;}

cachedIndexArray._cache[size] = arr;
return arr;}else 
{
return cachedResult;}};


cachedIndexArray._cache = {};





ReactNativeBaseComponent.Mixin = {
getPublicInstance:function(){

return this;}, 


construct:function(element){
this._currentElement = element;}, 


unmountComponent:function(){
deleteAllListeners(this._rootNodeID);
this.unmountChildren();
this._rootNodeID = null;}, 










initializeChildren:function(children, containerTag, transaction, context){
var mountImages=this.mountChildren(children, transaction, context);



if(mountImages.length){
var indexes=cachedIndexArray(mountImages.length);


var createdTags=[];
for(var i=0; i < mountImages.length; i++) {
var mountImage=mountImages[i];
var childTag=mountImage.tag;
var childID=mountImage.rootNodeID;
warning(
mountImage && mountImage.rootNodeID && mountImage.tag, 
'Mount image returned does not have required data');

ReactNativeTagHandles.associateRootNodeIDWithMountedNodeHandle(
childID, 
childTag);

createdTags[i] = mountImage.tag;}

RCTUIManager.
manageChildren(containerTag, null, null, createdTags, indexes, null);}}, 












computeUpdatedProperties:function(prevProps, nextProps, validAttributes){
if(__DEV__){
for(var key in nextProps) {
if(nextProps.hasOwnProperty(key) && 
nextProps[key] && 
validAttributes[key]){
deepFreezeAndThrowOnMutationInDev(nextProps[key]);}}}




var updatePayload=diffRawProperties(
null, 
prevProps, 
nextProps, 
validAttributes);







if(styleDiffer(nextProps.style, prevProps.style)){
var nextFlattenedStyle=precomputeStyle(flattenStyle(nextProps.style));
updatePayload = diffRawProperties(
updatePayload, 
this.previousFlattenedStyle, 
nextFlattenedStyle, 
ReactNativeStyleAttributes);

this.previousFlattenedStyle = nextFlattenedStyle;}


return updatePayload;}, 











receiveComponent:function(nextElement, transaction, context){
var prevElement=this._currentElement;
this._currentElement = nextElement;

var updatePayload=this.computeUpdatedProperties(
prevElement.props, 
nextElement.props, 
this.viewConfig.validAttributes);


if(updatePayload){
RCTUIManager.updateView(
ReactNativeTagHandles.mostRecentMountedNodeHandleForRootNodeID(this._rootNodeID), 
this.viewConfig.uiViewClassName, 
updatePayload);}



this._reconcileListenersUponUpdate(
prevElement.props, 
nextElement.props);

this.updateChildren(nextElement.props.children, transaction, context);}, 





_registerListenersUponCreation:function(initialProps){
for(var key in initialProps) {


if(registrationNames[key] && initialProps[key]){
var listener=initialProps[key];
putListener(this._rootNodeID, key, listener);}}}, 









_reconcileListenersUponUpdate:function(prevProps, nextProps){
for(var key in nextProps) {
if(registrationNames[key] && nextProps[key] !== prevProps[key]){
putListener(this._rootNodeID, key, nextProps[key]);}}}, 









mountComponent:function(rootID, transaction, context){
this._rootNodeID = rootID;

var tag=ReactNativeTagHandles.allocateTag();

this.previousFlattenedStyle = {};
var updatePayload=this.computeUpdatedProperties(
{}, 
this._currentElement.props, 
this.viewConfig.validAttributes);

RCTUIManager.createView(tag, this.viewConfig.uiViewClassName, updatePayload);

this._registerListenersUponCreation(this._currentElement.props);
this.initializeChildren(
this._currentElement.props.children, 
tag, 
transaction, 
context);

return {
rootNodeID:rootID, 
tag:tag};}};








Object.assign(
ReactNativeBaseComponent.prototype, 
ReactMultiChild.Mixin, 
ReactNativeBaseComponent.Mixin, 
NativeMethodsMixin);


module.exports = ReactNativeBaseComponent;});
__d('NativeMethodsMixin',["NativeModules","TextInputState","findNodeHandle","flattenStyle","invariant","mergeFast","precomputeStyle"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeModules=require('NativeModules');
var RCTPOPAnimationManager=NativeModules.POPAnimationManager;
var RCTUIManager=NativeModules.UIManager;
var TextInputState=require('TextInputState');

var findNodeHandle=require('findNodeHandle');
var flattenStyle=require('flattenStyle');
var invariant=require('invariant');
var mergeFast=require('mergeFast');
var precomputeStyle=require('precomputeStyle');

















var animationIDInvariant=function(
funcName, 
anim)
{
invariant(
anim, 
funcName + ' must be called with a valid animation ID returned from' + 
' POPAnimation.createAnimation, received: "' + anim + '"');};



var NativeMethodsMixin={
addAnimation:function(anim, callback){
animationIDInvariant('addAnimation', anim);
RCTPOPAnimationManager.addAnimation(
findNodeHandle(this), 
anim, 
mountSafeCallback(this, callback));}, 



removeAnimation:function(anim){
animationIDInvariant('removeAnimation', anim);
RCTPOPAnimationManager.removeAnimation(findNodeHandle(this), anim);}, 


measure:function(callback){
RCTUIManager.measure(
findNodeHandle(this), 
mountSafeCallback(this, callback));}, 



measureLayout:function(
relativeToNativeNode, 
onSuccess, 
onFail)
{
RCTUIManager.measureLayout(
findNodeHandle(this), 
relativeToNativeNode, 
mountSafeCallback(this, onFail), 
mountSafeCallback(this, onSuccess));}, 








setNativeProps:function(nativeProps){





var hasOnlyStyle=true;
for(var key in nativeProps) {
if(key !== 'style'){
hasOnlyStyle = false;
break;}}


var style=precomputeStyle(flattenStyle(nativeProps.style));

var props=null;
if(hasOnlyStyle){
props = style;}else 
if(!style){
props = nativeProps;}else 
{
props = mergeFast(nativeProps, style);}


RCTUIManager.updateView(
findNodeHandle(this), 
this.viewConfig.uiViewClassName, 
props);}, 



focus:function(){
TextInputState.focusTextInput(findNodeHandle(this));}, 


blur:function(){
TextInputState.blurTextInput(findNodeHandle(this));}};



function throwOnStylesProp(component, props){
if(props.styles !== undefined){
var owner=component._owner || null;
var name=component.constructor.displayName;
var msg='`styles` is not a supported property of `' + name + '`, did ' + 
'you mean `style` (singular)?';
if(owner && owner.constructor && owner.constructor.displayName){
msg += '\n\nCheck the `' + owner.constructor.displayName + '` parent ' + 
' component.';}

throw new Error(msg);}}


if(__DEV__){



var NativeMethodsMixin_DEV=NativeMethodsMixin;
invariant(
!NativeMethodsMixin_DEV.componentWillMount && 
!NativeMethodsMixin_DEV.componentWillReceiveProps, 
'Do not override existing functions.');

NativeMethodsMixin_DEV.componentWillMount = function(){
throwOnStylesProp(this, this.props);};

NativeMethodsMixin_DEV.componentWillReceiveProps = function(newProps){
throwOnStylesProp(this, newProps);};}







var mountSafeCallback=function(context, callback){
return function(){
if(!callback || context.isMounted && !context.isMounted()){
return;}

return callback.apply(context, arguments);};};



module.exports = NativeMethodsMixin;});
__d('TextInputState',["NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var RCTUIManager=require('NativeModules').UIManager;

var TextInputState={



_currentlyFocusedID:null, 





currentlyFocusedField:function(){
return this._currentlyFocusedID;}, 







focusTextInput:function(textFieldID){
if(this._currentlyFocusedID !== textFieldID && textFieldID !== null){
this._currentlyFocusedID = textFieldID;
RCTUIManager.focus(textFieldID);}}, 








blurTextInput:function(textFieldID){
if(this._currentlyFocusedID === textFieldID && textFieldID !== null){
this._currentlyFocusedID = null;
RCTUIManager.blur(textFieldID);}}};




module.exports = TextInputState;});
__d('findNodeHandle',["ReactCurrentOwner","ReactInstanceMap","ReactNativeTagHandles","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactNativeTagHandles=require('ReactNativeTagHandles');

var invariant=require('invariant');
var warning=require('warning');































function findNodeHandle(componentOrHandle){
if(__DEV__){
var owner=ReactCurrentOwner.current;
if(owner !== null){
warning(
owner._warnedAboutRefsInRender, 
'%s is accessing findNodeHandle inside its render(). ' + 
'render() should be a pure function of props and state. It should ' + 
'never access something that requires stale data from the previous ' + 
'render, such as refs. Move this logic to componentDidMount and ' + 
'componentDidUpdate instead.', 
owner.getName() || 'A component');

owner._warnedAboutRefsInRender = true;}}


if(componentOrHandle == null){
return null;}

if(typeof componentOrHandle === 'number'){

return componentOrHandle;}


var component=componentOrHandle;



var internalInstance=ReactInstanceMap.get(component);
if(internalInstance){
return ReactNativeTagHandles.rootNodeIDToTag[internalInstance._rootNodeID];}else 
{
var rootNodeID=component._rootNodeID;
if(rootNodeID){
return ReactNativeTagHandles.rootNodeIDToTag[rootNodeID];}else 
{
invariant(


typeof component === 'object' && 
'_rootNodeID' in component || 


component.render != null && 
typeof component.render === 'function', 

'findNodeHandle(...): Argument is not a component ' + 
'(type: %s, keys: %s)', 
typeof component, 
Object.keys(component));

invariant(
false, 
'findNodeHandle(...): Unable to find node handle for unmounted ' + 
'component.');}}}





module.exports = findNodeHandle;});
__d('flattenStyle',["StyleSheetRegistry","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var StyleSheetRegistry=require('StyleSheetRegistry');
var invariant=require('invariant');




function getStyle(style){
if(typeof style === 'number'){
return StyleSheetRegistry.getStyleByID(style);}

return style;}


function flattenStyle(style){
if(!style){
return undefined;}

invariant(style !== true, 'style may be false but not true');

if(!Array.isArray(style)){
return getStyle(style);}


var result={};
for(var i=0; i < style.length; ++i) {
var computedStyle=flattenStyle(style[i]);
if(computedStyle){
for(var key in computedStyle) {
result[key] = computedStyle[key];

if(__DEV__){
var value=computedStyle[key];}}}}




return result;}


module.exports = flattenStyle;});
__d('StyleSheetRegistry',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var styles={};
var uniqueID=1;
var emptyStyle={};var 

StyleSheetRegistry=(function(){function StyleSheetRegistry(){_classCallCheck(this, StyleSheetRegistry);}_createClass(StyleSheetRegistry, null, [{key:'registerStyle', value:
function registerStyle(style){
var id=++uniqueID;
if(__DEV__){
Object.freeze(style);}

styles[id] = style;
return id;}}, {key:'getStyleByID', value:


function getStyleByID(id){
if(!id){


return emptyStyle;}


var style=styles[id];
if(!style){
console.warn('Invalid style with id `' + id + '`. Skipping ...');
return emptyStyle;}

return style;}}]);return StyleSheetRegistry;})();



module.exports = StyleSheetRegistry;});
__d('mergeFast',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';





















var mergeFast=function(one, two){
var ret={};
for(var keyOne in one) {
ret[keyOne] = one[keyOne];}

for(var keyTwo in two) {
ret[keyTwo] = two[keyTwo];}

return ret;};


module.exports = mergeFast;});
__d('precomputeStyle',["MatrixMath","Platform","deepFreezeAndThrowOnMutationInDev","invariant","stringifySafe"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var MatrixMath=require('MatrixMath');
var Platform=require('Platform');

var deepFreezeAndThrowOnMutationInDev=require('deepFreezeAndThrowOnMutationInDev');
var invariant=require('invariant');
var stringifySafe=require('stringifySafe');





function precomputeStyle(style){
if(!style || !style.transform){
return style;}

invariant(
!style.transformMatrix, 
'transformMatrix and transform styles cannot be used on the same component');

var newStyle=_precomputeTransforms(_extends({}, style));
deepFreezeAndThrowOnMutationInDev(newStyle);
return newStyle;}










function _precomputeTransforms(style){var 
transform=style.transform;
var result=MatrixMath.createIdentityMatrix();

transform.forEach(function(transformation){
var key=Object.keys(transformation)[0];
var value=transformation[key];
if(__DEV__){
_validateTransform(key, value, transformation);}


switch(key){
case 'matrix':
MatrixMath.multiplyInto(result, result, value);
break;
case 'rotate':
_multiplyTransform(result, MatrixMath.reuseRotateZCommand, [_convertToRadians(value)]);
break;
case 'scale':
_multiplyTransform(result, MatrixMath.reuseScaleCommand, [value]);
break;
case 'scaleX':
_multiplyTransform(result, MatrixMath.reuseScaleXCommand, [value]);
break;
case 'scaleY':
_multiplyTransform(result, MatrixMath.reuseScaleYCommand, [value]);
break;
case 'translate':
_multiplyTransform(result, MatrixMath.reuseTranslate3dCommand, [value[0], value[1], value[2] || 0]);
break;
case 'translateX':
_multiplyTransform(result, MatrixMath.reuseTranslate2dCommand, [value, 0]);
break;
case 'translateY':
_multiplyTransform(result, MatrixMath.reuseTranslate2dCommand, [0, value]);
break;
default:
throw new Error('Invalid transform name: ' + key);}});







if(Platform.OS === 'android'){
return _extends({}, 
style, {
transformMatrix:result, 
decomposedMatrix:MatrixMath.decomposeMatrix(result)});}


return _extends({}, 
style, {
transformMatrix:result});}






function _multiplyTransform(
result, 
matrixMathFunction, 
args)
{
var matrixToApply=MatrixMath.createIdentityMatrix();
var argsWithIdentity=[matrixToApply].concat(args);
matrixMathFunction.apply(this, argsWithIdentity);
MatrixMath.multiplyInto(result, result, matrixToApply);}






function _convertToRadians(value){
var floatValue=parseFloat(value, 10);
return value.indexOf('rad') > -1?floatValue:floatValue * Math.PI / 180;}


function _validateTransform(key, value, transformation){
invariant(
!value.getValue, 
'You passed an Animated.Value to a normal component. ' + 
'You need to wrap that component in an Animated. For example, ' + 
'replace <View /> by <Animated.View />.');


var multivalueTransforms=[
'matrix', 
'translate'];

if(multivalueTransforms.indexOf(key) !== -1){
invariant(
Array.isArray(value), 
'Transform with key of %s must have an array as the value: %s', 
key, 
stringifySafe(transformation));}


switch(key){
case 'matrix':
invariant(
value.length === 9 || value.length === 16, 
'Matrix transform must have a length of 9 (2d) or 16 (3d). ' + 
'Provided matrix has a length of %s: %s', 
value.length, 
stringifySafe(transformation));

break;
case 'translate':
break;
case 'rotate':
invariant(
typeof value === 'string', 
'Transform with key of "%s" must be a string: %s', 
key, 
stringifySafe(transformation));

invariant(
value.indexOf('deg') > -1 || value.indexOf('rad') > -1, 
'Rotate transform must be expressed in degrees (deg) or radians ' + 
'(rad): %s', 
stringifySafe(transformation));

break;
default:
invariant(
typeof value === 'number', 
'Transform with key of "%s" must be a number: %s', 
key, 
stringifySafe(transformation));}}




module.exports = precomputeStyle;});
__d('MatrixMath',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';







var invariant=require('invariant');





var MatrixMath={
createIdentityMatrix:function(){
return [
1, 0, 0, 0, 
0, 1, 0, 0, 
0, 0, 1, 0, 
0, 0, 0, 1];}, 



createCopy:function(m){
return [
m[0], m[1], m[2], m[3], 
m[4], m[5], m[6], m[7], 
m[8], m[9], m[10], m[11], 
m[12], m[13], m[14], m[15]];}, 



createTranslate2d:function(x, y){
var mat=MatrixMath.createIdentityMatrix();
MatrixMath.reuseTranslate2dCommand(mat, x, y);
return mat;}, 


reuseTranslate2dCommand:function(matrixCommand, x, y){
matrixCommand[12] = x;
matrixCommand[13] = y;}, 


reuseTranslate3dCommand:function(matrixCommand, x, y, z){
matrixCommand[12] = x;
matrixCommand[13] = y;
matrixCommand[14] = z;}, 


createScale:function(factor){
var mat=MatrixMath.createIdentityMatrix();
MatrixMath.reuseScaleCommand(mat, factor);
return mat;}, 


reuseScaleCommand:function(matrixCommand, factor){
matrixCommand[0] = factor;
matrixCommand[5] = factor;}, 


reuseScale3dCommand:function(matrixCommand, x, y, z){
matrixCommand[0] = x;
matrixCommand[5] = y;
matrixCommand[10] = z;}, 


reuseScaleXCommand:function(matrixCommand, factor){
matrixCommand[0] = factor;}, 


reuseScaleYCommand:function(matrixCommand, factor){
matrixCommand[5] = factor;}, 


reuseScaleZCommand:function(matrixCommand, factor){
matrixCommand[10] = factor;}, 


reuseRotateXCommand:function(matrixCommand, radians){
matrixCommand[5] = Math.cos(radians);
matrixCommand[6] = Math.sin(radians);
matrixCommand[9] = -Math.sin(radians);
matrixCommand[10] = Math.cos(radians);}, 


reuseRotateYCommand:function(matrixCommand, amount){
matrixCommand[0] = Math.cos(amount);
matrixCommand[2] = -Math.sin(amount);
matrixCommand[8] = Math.sin(amount);
matrixCommand[10] = Math.cos(amount);}, 



reuseRotateZCommand:function(matrixCommand, radians){
matrixCommand[0] = Math.cos(radians);
matrixCommand[1] = Math.sin(radians);
matrixCommand[4] = -Math.sin(radians);
matrixCommand[5] = Math.cos(radians);}, 


createRotateZ:function(radians){
var mat=MatrixMath.createIdentityMatrix();
MatrixMath.reuseRotateZCommand(mat, radians);
return mat;}, 


multiplyInto:function(out, a, b){
var a00=a[0], a01=a[1], a02=a[2], a03=a[3], 
a10=a[4], a11=a[5], a12=a[6], a13=a[7], 
a20=a[8], a21=a[9], a22=a[10], a23=a[11], 
a30=a[12], a31=a[13], a32=a[14], a33=a[15];

var b0=b[0], b1=b[1], b2=b[2], b3=b[3];
out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;}, 


determinant:function(matrix){var 

m00=



matrix[0];var m01=matrix[1];var m02=matrix[2];var m03=matrix[3];var m10=matrix[4];var m11=matrix[5];var m12=matrix[6];var m13=matrix[7];var m20=matrix[8];var m21=matrix[9];var m22=matrix[10];var m23=matrix[11];var m30=matrix[12];var m31=matrix[13];var m32=matrix[14];var m33=matrix[15];
return (
m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 - 
m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 + 
m02 * m11 * m23 * m30 - m01 * m12 * m23 * m30 - 
m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 + 
m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31 - 
m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 + 
m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 - 
m03 * m10 * m21 * m32 + m00 * m13 * m21 * m32 + 
m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 - 
m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33 + 
m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 - 
m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33);}, 










inverse:function(matrix){
var det=MatrixMath.determinant(matrix);
if(!det){
return matrix;}var 


m00=



matrix[0];var m01=matrix[1];var m02=matrix[2];var m03=matrix[3];var m10=matrix[4];var m11=matrix[5];var m12=matrix[6];var m13=matrix[7];var m20=matrix[8];var m21=matrix[9];var m22=matrix[10];var m23=matrix[11];var m30=matrix[12];var m31=matrix[13];var m32=matrix[14];var m33=matrix[15];
return [
(m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33) / det, 
(m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 + m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33) / det, 
(m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 - m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33) / det, 
(m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 + m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23) / det, 
(m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 + m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33) / det, 
(m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 - m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33) / det, 
(m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 + m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33) / det, 
(m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 - m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23) / det, 
(m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 - m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33) / det, 
(m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 + m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33) / det, 
(m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 - m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33) / det, 
(m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 + m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23) / det, 
(m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 + m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32) / det, 
(m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 - m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32) / det, 
(m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 + m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32) / det, 
(m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22) / det];}, 






transpose:function(m){
return [
m[0], m[4], m[8], m[12], 
m[1], m[5], m[9], m[13], 
m[2], m[6], m[10], m[14], 
m[3], m[7], m[11], m[15]];}, 






multiplyVectorByMatrix:function(
v, 
m)
{var 
vx=v[0];var vy=v[1];var vz=v[2];var vw=v[3];
return [
vx * m[0] + vy * m[4] + vz * m[8] + vw * m[12], 
vx * m[1] + vy * m[5] + vz * m[9] + vw * m[13], 
vx * m[2] + vy * m[6] + vz * m[10] + vw * m[14], 
vx * m[3] + vy * m[7] + vz * m[11] + vw * m[15]];}, 






v3Length:function(a){
return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);}, 





v3Normalize:function(
vector, 
v3Length)
{
var im=1 / (v3Length || MatrixMath.v3Length(vector));
return [
vector[0] * im, 
vector[1] * im, 
vector[2] * im];}, 







v3Dot:function(a, b){
return a[0] * b[0] + 
a[1] * b[1] + 
a[2] * b[2];}, 






v3Combine:function(
a, 
b, 
aScale, 
bScale)
{
return [
aScale * a[0] + bScale * b[0], 
aScale * a[1] + bScale * b[1], 
aScale * a[2] + bScale * b[2]];}, 







v3Cross:function(a, b){
return [
a[1] * b[2] - a[2] * b[1], 
a[2] * b[0] - a[0] * b[2], 
a[0] * b[1] - a[1] * b[0]];}, 



















quaternionToDegreesXYZ:function(q, matrix, row){var 
qx=q[0];var qy=q[1];var qz=q[2];var qw=q[3];
var qw2=qw * qw;
var qx2=qx * qx;
var qy2=qy * qy;
var qz2=qz * qz;
var test=qx * qy + qz * qw;
var unit=qw2 + qx2 + qy2 + qz2;
var conv=180 / Math.PI;

if(test > 0.49999 * unit){
return [0, 2 * Math.atan2(qx, qw) * conv, 90];}

if(test < -0.49999 * unit){
return [0, -2 * Math.atan2(qx, qw) * conv, -90];}


return [
MatrixMath.roundTo3Places(
Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx2 - 2 * qz2) * conv), 

MatrixMath.roundTo3Places(
Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy2 - 2 * qz2) * conv), 

MatrixMath.roundTo3Places(
Math.asin(2 * qx * qy + 2 * qz * qw) * conv)];}, 








roundTo3Places:function(n){
var arr=n.toString().split('e');
return Math.round(arr[0] + 'e' + (arr[1]?+arr[1] - 3:3)) * 0.001;}, 













decomposeMatrix:function(transformMatrix){

invariant(
transformMatrix.length === 16, 
'Matrix decomposition needs a list of 3d matrix values, received %s', 
transformMatrix);



var perspective=[];
var quaternion=[];
var scale=[];
var skew=[];
var translation=[];



if(!transformMatrix[15]){
return;}

var matrix=[];
var perspectiveMatrix=[];
for(var i=0; i < 4; i++) {
matrix.push([]);
for(var j=0; j < 4; j++) {
var value=transformMatrix[i * 4 + j] / transformMatrix[15];
matrix[i].push(value);
perspectiveMatrix.push(j === 3?0:value);}}


perspectiveMatrix[15] = 1;


if(!MatrixMath.determinant(perspectiveMatrix)){
return;}



if(matrix[0][3] !== 0 || matrix[1][3] !== 0 || matrix[2][3] !== 0){


var rightHandSide=[
matrix[0][3], 
matrix[1][3], 
matrix[2][3], 
matrix[3][3]];




var inversePerspectiveMatrix=MatrixMath.inverse3x3(
perspectiveMatrix);

var transposedInversePerspectiveMatrix=MatrixMath.transpose4x4(
inversePerspectiveMatrix);

var perspective=MatrixMath.multiplyVectorByMatrix(
rightHandSide, 
transposedInversePerspectiveMatrix);}else 

{

perspective[0] = perspective[1] = perspective[2] = 0;
perspective[3] = 1;}



for(var i=0; i < 3; i++) {
translation[i] = matrix[3][i];}




var row=[];
for(i = 0; i < 3; i++) {
row[i] = [
matrix[i][0], 
matrix[i][1], 
matrix[i][2]];}




scale[0] = MatrixMath.v3Length(row[0]);
row[0] = MatrixMath.v3Normalize(row[0], scale[0]);


skew[0] = MatrixMath.v3Dot(row[0], row[1]);
row[1] = MatrixMath.v3Combine(row[1], row[0], 1, -skew[0]);


skew[0] = MatrixMath.v3Dot(row[0], row[1]);
row[1] = MatrixMath.v3Combine(row[1], row[0], 1, -skew[0]);


scale[1] = MatrixMath.v3Length(row[1]);
row[1] = MatrixMath.v3Normalize(row[1], scale[1]);
skew[0] /= scale[1];


skew[1] = MatrixMath.v3Dot(row[0], row[2]);
row[2] = MatrixMath.v3Combine(row[2], row[0], 1, -skew[1]);
skew[2] = MatrixMath.v3Dot(row[1], row[2]);
row[2] = MatrixMath.v3Combine(row[2], row[1], 1, -skew[2]);


scale[2] = MatrixMath.v3Length(row[2]);
row[2] = MatrixMath.v3Normalize(row[2], scale[2]);
skew[1] /= scale[2];
skew[2] /= scale[2];




var pdum3=MatrixMath.v3Cross(row[1], row[2]);
if(MatrixMath.v3Dot(row[0], pdum3) < 0){
for(i = 0; i < 3; i++) {
scale[i] *= -1;
row[i][0] *= -1;
row[i][1] *= -1;
row[i][2] *= -1;}}




quaternion[0] = 
0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0));
quaternion[1] = 
0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0));
quaternion[2] = 
0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0));
quaternion[3] = 
0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0));

if(row[2][1] > row[1][2]){
quaternion[0] = -quaternion[0];}

if(row[0][2] > row[2][0]){
quaternion[1] = -quaternion[1];}

if(row[1][0] > row[0][1]){
quaternion[2] = -quaternion[2];}



var rotationDegrees;
if(
quaternion[0] < 0.001 && quaternion[0] >= 0 && 
quaternion[1] < 0.001 && quaternion[1] >= 0)
{

rotationDegrees = [0, 0, MatrixMath.roundTo3Places(
Math.atan2(row[0][1], row[0][0]) * 180 / Math.PI)];}else 

{
rotationDegrees = MatrixMath.quaternionToDegreesXYZ(quaternion, matrix, row);}



return {
rotationDegrees:rotationDegrees, 
perspective:perspective, 
quaternion:quaternion, 
scale:scale, 
skew:skew, 
translation:translation, 

rotate:rotationDegrees[2], 
scaleX:scale[0], 
scaleY:scale[1], 
translateX:translation[0], 
translateY:translation[1]};}};





module.exports = MatrixMath;});
__d('deepFreezeAndThrowOnMutationInDev',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';






























function deepFreezeAndThrowOnMutationInDev(object){
if(__DEV__){
if(typeof object !== 'object' || 
object === null || 
Object.isFrozen(object) || 
Object.isSealed(object)){
return;}


for(var key in object) {
if(object.hasOwnProperty(key)){
object.__defineGetter__(key, identity.bind(null, object[key]));
object.__defineSetter__(key, throwOnImmutableMutation.bind(null, key));
deepFreezeAndThrowOnMutationInDev(object[key]);}}


Object.freeze(object);
Object.seal(object);}}



function throwOnImmutableMutation(key, value){
throw Error(
'You attempted to set the key `' + key + '` with the value `' + 
JSON.stringify(value) + '` on an object that is meant to be immutable ' + 
'and has been frozen.');}



function identity(value){
return value;}


module.exports = deepFreezeAndThrowOnMutationInDev;});
__d('ReactNativeEventEmitter',["EventPluginHub","ReactEventEmitterMixin","ReactNativeTagHandles","NodeHandle","EventConstants","merge","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventPluginHub=require('EventPluginHub');
var ReactEventEmitterMixin=require('ReactEventEmitterMixin');
var ReactNativeTagHandles=require('ReactNativeTagHandles');
var NodeHandle=require('NodeHandle');
var EventConstants=require('EventConstants');

var merge=require('merge');
var warning=require('warning');

var topLevelTypes=EventConstants.topLevelTypes;







var EMPTY_NATIVE_EVENT={};








var touchSubsequence=function(touches, indices){
var ret=[];
for(var i=0; i < indices.length; i++) {
ret.push(touches[indices[i]]);}

return ret;};













var removeTouchesAtIndices=function(
touches, 
indices)
{
var rippedOut=[];


var temp=touches;
for(var i=0; i < indices.length; i++) {
var index=indices[i];
rippedOut.push(touches[index]);
temp[index] = null;}

var fillAt=0;
for(var j=0; j < temp.length; j++) {
var cur=temp[j];
if(cur !== null){
temp[fillAt++] = cur;}}


temp.length = fillAt;
return rippedOut;};











var ReactNativeEventEmitter=merge(ReactEventEmitterMixin, {

registrationNames:EventPluginHub.registrationNameModules, 

putListener:EventPluginHub.putListener, 

getListener:EventPluginHub.getListener, 

deleteListener:EventPluginHub.deleteListener, 

deleteAllListeners:EventPluginHub.deleteAllListeners, 











_receiveRootNodeIDEvent:function(
rootNodeID, 
topLevelType, 
nativeEventParam)
{
var nativeEvent=nativeEventParam || EMPTY_NATIVE_EVENT;
ReactNativeEventEmitter.handleTopLevel(
topLevelType, 
rootNodeID, 
rootNodeID, 
nativeEvent);}, 










receiveEvent:function(
tag, 
topLevelType, 
nativeEventParam)
{
var rootNodeID=ReactNativeTagHandles.tagToRootNodeID[tag];
ReactNativeEventEmitter._receiveRootNodeIDEvent(
rootNodeID, 
topLevelType, 
nativeEventParam);}, 



























receiveTouches:function(
eventTopLevelType, 
touches, 
changedIndices)
{
var changedTouches=
eventTopLevelType === topLevelTypes.topTouchEnd || 
eventTopLevelType === topLevelTypes.topTouchCancel?
removeTouchesAtIndices(touches, changedIndices):
touchSubsequence(touches, changedIndices);

for(var jj=0; jj < changedTouches.length; jj++) {
var touch=changedTouches[jj];


touch.changedTouches = changedTouches;
touch.touches = touches;
var nativeEvent=touch;
var rootNodeID=null;
var target=nativeEvent.target;
if(target !== null && target !== undefined){
if(target < ReactNativeTagHandles.tagsStartAt){
if(__DEV__){
warning(
false, 
'A view is reporting that a touch occured on tag zero.');}}else 


{
rootNodeID = NodeHandle.getRootNodeID(target);}}


ReactNativeEventEmitter._receiveRootNodeIDEvent(
rootNodeID, 
eventTopLevelType, 
nativeEvent);}}});





module.exports = ReactNativeEventEmitter;});
__d('ReactEventEmitterMixin',["EventPluginHub"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventPluginHub=require('EventPluginHub');

function runEventQueueInBatch(events){
EventPluginHub.enqueueEvents(events);
EventPluginHub.processEventQueue();}


var ReactEventEmitterMixin={










handleTopLevel:function(
topLevelType, 
topLevelTarget, 
topLevelTargetID, 
nativeEvent){
var events=EventPluginHub.extractEvents(
topLevelType, 
topLevelTarget, 
topLevelTargetID, 
nativeEvent);


runEventQueueInBatch(events);}};



module.exports = ReactEventEmitterMixin;});
__d('ReactNativeStyleAttributes',["ImageStylePropTypes","TextStylePropTypes","ViewStylePropTypes","keyMirror","matricesDiffer","sizesDiffer"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};













var ImageStylePropTypes=require('ImageStylePropTypes');
var TextStylePropTypes=require('TextStylePropTypes');
var ViewStylePropTypes=require('ViewStylePropTypes');

var keyMirror=require('keyMirror');
var matricesDiffer=require('matricesDiffer');
var sizesDiffer=require('sizesDiffer');

var ReactNativeStyleAttributes=_extends({}, 
keyMirror(ViewStylePropTypes), 
keyMirror(TextStylePropTypes), 
keyMirror(ImageStylePropTypes));


ReactNativeStyleAttributes.transformMatrix = {diff:matricesDiffer};
ReactNativeStyleAttributes.shadowOffset = {diff:sizesDiffer};


ReactNativeStyleAttributes.decomposedMatrix = 'decomposedMatrix';

module.exports = ReactNativeStyleAttributes;});
__d('ImageStylePropTypes',["ImageResizeMode","LayoutPropTypes","ReactPropTypes","TransformPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var ImageResizeMode=require('ImageResizeMode');
var LayoutPropTypes=require('LayoutPropTypes');
var ReactPropTypes=require('ReactPropTypes');
var TransformPropTypes=require('TransformPropTypes');

var ImageStylePropTypes=_extends({}, 
LayoutPropTypes, 
TransformPropTypes, {
resizeMode:ReactPropTypes.oneOf(Object.keys(ImageResizeMode)), 
backgroundColor:ReactPropTypes.string, 
borderColor:ReactPropTypes.string, 
borderWidth:ReactPropTypes.number, 
borderRadius:ReactPropTypes.number, 



tintColor:ReactPropTypes.string, 
opacity:ReactPropTypes.number});


module.exports = ImageStylePropTypes;});
__d('ImageResizeMode',["keyMirror"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var keyMirror=require('keyMirror');





var ImageResizeMode=keyMirror({




contain:null, 




cover:null, 





stretch:null});


module.exports = ImageResizeMode;});
__d('LayoutPropTypes',["ReactPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactPropTypes=require('ReactPropTypes');






var LayoutPropTypes={
width:ReactPropTypes.number, 
height:ReactPropTypes.number, 
top:ReactPropTypes.number, 
left:ReactPropTypes.number, 
right:ReactPropTypes.number, 
bottom:ReactPropTypes.number, 
margin:ReactPropTypes.number, 
marginVertical:ReactPropTypes.number, 
marginHorizontal:ReactPropTypes.number, 
marginTop:ReactPropTypes.number, 
marginBottom:ReactPropTypes.number, 
marginLeft:ReactPropTypes.number, 
marginRight:ReactPropTypes.number, 
padding:ReactPropTypes.number, 
paddingVertical:ReactPropTypes.number, 
paddingHorizontal:ReactPropTypes.number, 
paddingTop:ReactPropTypes.number, 
paddingBottom:ReactPropTypes.number, 
paddingLeft:ReactPropTypes.number, 
paddingRight:ReactPropTypes.number, 
borderWidth:ReactPropTypes.number, 
borderTopWidth:ReactPropTypes.number, 
borderRightWidth:ReactPropTypes.number, 
borderBottomWidth:ReactPropTypes.number, 
borderLeftWidth:ReactPropTypes.number, 

position:ReactPropTypes.oneOf([
'absolute', 
'relative']), 



flexDirection:ReactPropTypes.oneOf([
'row', 
'column']), 



flexWrap:ReactPropTypes.oneOf([
'wrap', 
'nowrap']), 




justifyContent:ReactPropTypes.oneOf([
'flex-start', 
'flex-end', 
'center', 
'space-between', 
'space-around']), 




alignItems:ReactPropTypes.oneOf([
'flex-start', 
'flex-end', 
'center', 
'stretch']), 




alignSelf:ReactPropTypes.oneOf([
'auto', 
'flex-start', 
'flex-end', 
'center', 
'stretch']), 



flex:ReactPropTypes.number};


module.exports = LayoutPropTypes;});
__d('ReactPropTypes',["ReactElement","ReactFragment","ReactPropTypeLocationNames","emptyFunction"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactElement=require('ReactElement');
var ReactFragment=require('ReactFragment');
var ReactPropTypeLocationNames=require('ReactPropTypeLocationNames');

var emptyFunction=require('emptyFunction');
















































var ANONYMOUS='<<anonymous>>';

var elementTypeChecker=createElementTypeChecker();
var nodeTypeChecker=createNodeChecker();

var ReactPropTypes={
array:createPrimitiveTypeChecker('array'), 
bool:createPrimitiveTypeChecker('boolean'), 
func:createPrimitiveTypeChecker('function'), 
number:createPrimitiveTypeChecker('number'), 
object:createPrimitiveTypeChecker('object'), 
string:createPrimitiveTypeChecker('string'), 

any:createAnyTypeChecker(), 
arrayOf:createArrayOfTypeChecker, 
element:elementTypeChecker, 
instanceOf:createInstanceTypeChecker, 
node:nodeTypeChecker, 
objectOf:createObjectOfTypeChecker, 
oneOf:createEnumTypeChecker, 
oneOfType:createUnionTypeChecker, 
shape:createShapeTypeChecker};


function createChainableTypeChecker(validate){
function checkType(isRequired, props, propName, componentName, location){
componentName = componentName || ANONYMOUS;
if(props[propName] == null){
var locationName=ReactPropTypeLocationNames[location];
if(isRequired){
return new Error(
'Required ' + locationName + ' `' + propName + '` was not specified in ' + ('`' + 
componentName + '`.'));}


return null;}else 
{
return validate(props, propName, componentName, location);}}



var chainedCheckType=checkType.bind(null, false);
chainedCheckType.isRequired = checkType.bind(null, true);

return chainedCheckType;}


function createPrimitiveTypeChecker(expectedType){
function validate(props, propName, componentName, location){
var propValue=props[propName];
var propType=getPropType(propValue);
if(propType !== expectedType){
var locationName=ReactPropTypeLocationNames[location];



var preciseType=getPreciseType(propValue);

return new Error(
'Invalid ' + locationName + ' `' + propName + '` of type `' + preciseType + '` ' + ('supplied to `' + 
componentName + '`, expected `' + expectedType + '`.'));}


return null;}

return createChainableTypeChecker(validate);}


function createAnyTypeChecker(){
return createChainableTypeChecker(emptyFunction.thatReturns(null));}


function createArrayOfTypeChecker(typeChecker){
function validate(props, propName, componentName, location){
var propValue=props[propName];
if(!Array.isArray(propValue)){
var locationName=ReactPropTypeLocationNames[location];
var propType=getPropType(propValue);
return new Error(
'Invalid ' + locationName + ' `' + propName + '` of type ' + ('`' + 
propType + '` supplied to `' + componentName + '`, expected an array.'));}


for(var i=0; i < propValue.length; i++) {
var error=typeChecker(propValue, i, componentName, location);
if(error instanceof Error){
return error;}}


return null;}

return createChainableTypeChecker(validate);}


function createElementTypeChecker(){
function validate(props, propName, componentName, location){
if(!ReactElement.isValidElement(props[propName])){
var locationName=ReactPropTypeLocationNames[location];
return new Error(
'Invalid ' + locationName + ' `' + propName + '` supplied to ' + ('`' + 
componentName + '`, expected a ReactElement.'));}


return null;}

return createChainableTypeChecker(validate);}


function createInstanceTypeChecker(expectedClass){
function validate(props, propName, componentName, location){
if(!(props[propName] instanceof expectedClass)){
var locationName=ReactPropTypeLocationNames[location];
var expectedClassName=expectedClass.name || ANONYMOUS;
return new Error(
'Invalid ' + locationName + ' `' + propName + '` supplied to ' + ('`' + 
componentName + '`, expected instance of `' + expectedClassName + '`.'));}


return null;}

return createChainableTypeChecker(validate);}


function createEnumTypeChecker(expectedValues){
function validate(props, propName, componentName, location){
var propValue=props[propName];
for(var i=0; i < expectedValues.length; i++) {
if(propValue === expectedValues[i]){
return null;}}



var locationName=ReactPropTypeLocationNames[location];
var valuesString=JSON.stringify(expectedValues);
return new Error(
'Invalid ' + locationName + ' `' + propName + '` of value `' + propValue + '` ' + ('supplied to `' + 
componentName + '`, expected one of ' + valuesString + '.'));}


return createChainableTypeChecker(validate);}


function createObjectOfTypeChecker(typeChecker){
function validate(props, propName, componentName, location){
var propValue=props[propName];
var propType=getPropType(propValue);
if(propType !== 'object'){
var locationName=ReactPropTypeLocationNames[location];
return new Error(
'Invalid ' + locationName + ' `' + propName + '` of type ' + ('`' + 
propType + '` supplied to `' + componentName + '`, expected an object.'));}


for(var key in propValue) {
if(propValue.hasOwnProperty(key)){
var error=typeChecker(propValue, key, componentName, location);
if(error instanceof Error){
return error;}}}



return null;}

return createChainableTypeChecker(validate);}


function createUnionTypeChecker(arrayOfTypeCheckers){
function validate(props, propName, componentName, location){
for(var i=0; i < arrayOfTypeCheckers.length; i++) {
var checker=arrayOfTypeCheckers[i];
if(checker(props, propName, componentName, location) == null){
return null;}}



var locationName=ReactPropTypeLocationNames[location];
return new Error(
'Invalid ' + locationName + ' `' + propName + '` supplied to ' + ('`' + 
componentName + '`.'));}


return createChainableTypeChecker(validate);}


function createNodeChecker(){
function validate(props, propName, componentName, location){
if(!isNode(props[propName])){
var locationName=ReactPropTypeLocationNames[location];
return new Error(
'Invalid ' + locationName + ' `' + propName + '` supplied to ' + ('`' + 
componentName + '`, expected a ReactNode.'));}


return null;}

return createChainableTypeChecker(validate);}


function createShapeTypeChecker(shapeTypes){
function validate(props, propName, componentName, location){
var propValue=props[propName];
var propType=getPropType(propValue);
if(propType !== 'object'){
var locationName=ReactPropTypeLocationNames[location];
return new Error(
'Invalid ' + locationName + ' `' + propName + '` of type `' + propType + '` ' + ('supplied to `' + 
componentName + '`, expected `object`.'));}


for(var key in shapeTypes) {
var checker=shapeTypes[key];
if(!checker){
continue;}

var error=checker(propValue, key, componentName, location);
if(error){
return error;}}


return null;}

return createChainableTypeChecker(validate);}


function isNode(propValue){
switch(typeof propValue){
case 'number':
case 'string':
case 'undefined':
return true;
case 'boolean':
return !propValue;
case 'object':
if(Array.isArray(propValue)){
return propValue.every(isNode);}

if(propValue === null || ReactElement.isValidElement(propValue)){
return true;}

propValue = ReactFragment.extractIfFragment(propValue);
for(var k in propValue) {
if(!isNode(propValue[k])){
return false;}}


return true;
default:
return false;}}




function getPropType(propValue){
var propType=typeof propValue;
if(Array.isArray(propValue)){
return 'array';}

if(propValue instanceof RegExp){



return 'object';}

return propType;}




function getPreciseType(propValue){
var propType=getPropType(propValue);
if(propType === 'object'){
if(propValue instanceof Date){
return 'date';}else 
if(propValue instanceof RegExp){
return 'regexp';}}


return propType;}


module.exports = ReactPropTypes;});
__d('TransformPropTypes',["ReactPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactPropTypes=require('ReactPropTypes');

var TransformPropTypes={
transform:ReactPropTypes.arrayOf(
ReactPropTypes.oneOfType([
ReactPropTypes.shape({rotate:ReactPropTypes.string}), 
ReactPropTypes.shape({scaleX:ReactPropTypes.number}), 
ReactPropTypes.shape({scaleY:ReactPropTypes.number}), 
ReactPropTypes.shape({translateX:ReactPropTypes.number}), 
ReactPropTypes.shape({translateY:ReactPropTypes.number})])), 








transformMatrix:ReactPropTypes.arrayOf(ReactPropTypes.number), 


rotation:ReactPropTypes.number, 
scaleX:ReactPropTypes.number, 
scaleY:ReactPropTypes.number, 
translateX:ReactPropTypes.number, 
translateY:ReactPropTypes.number};


module.exports = TransformPropTypes;});
__d('TextStylePropTypes',["ReactPropTypes","ViewStylePropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactPropTypes=require('ReactPropTypes');
var ViewStylePropTypes=require('ViewStylePropTypes');


var TextStylePropTypes=Object.assign(Object.create(ViewStylePropTypes), {
fontFamily:ReactPropTypes.string, 
fontSize:ReactPropTypes.number, 
fontWeight:ReactPropTypes.oneOf(
['normal', 'bold', 
'100', '200', '300', '400', '500', '600', '700', '800', '900']), 

fontStyle:ReactPropTypes.oneOf(['normal', 'italic']), 
lineHeight:ReactPropTypes.number, 
color:ReactPropTypes.string, 
containerBackgroundColor:ReactPropTypes.string, 
textAlign:ReactPropTypes.oneOf(
['auto', 'left', 'right', 'center']), 

writingDirection:ReactPropTypes.oneOf(
['auto', 'ltr', 'rtl']), 

letterSpacing:ReactPropTypes.number});



var unsupportedProps=Object.keys({
padding:null, 
paddingTop:null, 
paddingLeft:null, 
paddingRight:null, 
paddingBottom:null, 
paddingVertical:null, 
paddingHorizontal:null});


for(var ii=0; ii < unsupportedProps.length; ii++) {
delete TextStylePropTypes[unsupportedProps[ii]];}


module.exports = TextStylePropTypes;});
__d('ViewStylePropTypes',["LayoutPropTypes","ReactPropTypes","TransformPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var LayoutPropTypes=require('LayoutPropTypes');
var ReactPropTypes=require('ReactPropTypes');
var TransformPropTypes=require('TransformPropTypes');




var ViewStylePropTypes=_extends({}, 
LayoutPropTypes, 
TransformPropTypes, {
backgroundColor:ReactPropTypes.string, 
borderColor:ReactPropTypes.string, 
borderTopColor:ReactPropTypes.string, 
borderRightColor:ReactPropTypes.string, 
borderBottomColor:ReactPropTypes.string, 
borderLeftColor:ReactPropTypes.string, 
borderRadius:ReactPropTypes.number, 
borderTopLeftRadius:ReactPropTypes.number, 
borderTopRightRadius:ReactPropTypes.number, 
borderBottomLeftRadius:ReactPropTypes.number, 
borderBottomRightRadius:ReactPropTypes.number, 
opacity:ReactPropTypes.number, 
overflow:ReactPropTypes.oneOf(['visible', 'hidden']), 
shadowColor:ReactPropTypes.string, 
shadowOffset:ReactPropTypes.shape(
{width:ReactPropTypes.number, height:ReactPropTypes.number}), 

shadowOpacity:ReactPropTypes.number, 
shadowRadius:ReactPropTypes.number});


module.exports = ViewStylePropTypes;});
__d('matricesDiffer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




















var matricesDiffer=function(one, two){
if(one === two){
return false;}

return !one || !two || 
one[12] !== two[12] || 
one[13] !== two[13] || 
one[14] !== two[14] || 
one[5] !== two[5] || 
one[10] !== two[10] || 
one[1] !== two[1] || 
one[2] !== two[2] || 
one[3] !== two[3] || 
one[4] !== two[4] || 
one[6] !== two[6] || 
one[7] !== two[7] || 
one[8] !== two[8] || 
one[9] !== two[9] || 
one[11] !== two[11] || 
one[15] !== two[15];};


module.exports = matricesDiffer;});
__d('sizesDiffer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';






var dummySize={width:undefined, height:undefined};

var sizesDiffer=function(one, two){
one = one || dummySize;
two = two || dummySize;
return one !== two && (
one.width !== two.width || 
one.height !== two.height);};



module.exports = sizesDiffer;});
__d('ReactMultiChild',["ReactComponentEnvironment","ReactMultiChildUpdateTypes","ReactReconciler","ReactChildReconciler"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactComponentEnvironment=require('ReactComponentEnvironment');
var ReactMultiChildUpdateTypes=require('ReactMultiChildUpdateTypes');

var ReactReconciler=require('ReactReconciler');
var ReactChildReconciler=require('ReactChildReconciler');








var updateDepth=0;









var updateQueue=[];







var markupQueue=[];









function enqueueMarkup(parentID, markup, toIndex){

updateQueue.push({
parentID:parentID, 
parentNode:null, 
type:ReactMultiChildUpdateTypes.INSERT_MARKUP, 
markupIndex:markupQueue.push(markup) - 1, 
textContent:null, 
fromIndex:null, 
toIndex:toIndex});}











function enqueueMove(parentID, fromIndex, toIndex){

updateQueue.push({
parentID:parentID, 
parentNode:null, 
type:ReactMultiChildUpdateTypes.MOVE_EXISTING, 
markupIndex:null, 
textContent:null, 
fromIndex:fromIndex, 
toIndex:toIndex});}










function enqueueRemove(parentID, fromIndex){

updateQueue.push({
parentID:parentID, 
parentNode:null, 
type:ReactMultiChildUpdateTypes.REMOVE_NODE, 
markupIndex:null, 
textContent:null, 
fromIndex:fromIndex, 
toIndex:null});}










function enqueueTextContent(parentID, textContent){

updateQueue.push({
parentID:parentID, 
parentNode:null, 
type:ReactMultiChildUpdateTypes.TEXT_CONTENT, 
markupIndex:null, 
textContent:textContent, 
fromIndex:null, 
toIndex:null});}








function processQueue(){
if(updateQueue.length){
ReactComponentEnvironment.processChildrenUpdates(
updateQueue, 
markupQueue);

clearQueue();}}








function clearQueue(){
updateQueue.length = 0;
markupQueue.length = 0;}








var ReactMultiChild={








Mixin:{









mountChildren:function(nestedChildren, transaction, context){
var children=ReactChildReconciler.instantiateChildren(
nestedChildren, transaction, context);

this._renderedChildren = children;
var mountImages=[];
var index=0;
for(var name in children) {
if(children.hasOwnProperty(name)){
var child=children[name];

var rootID=this._rootNodeID + name;
var mountImage=ReactReconciler.mountComponent(
child, 
rootID, 
transaction, 
context);

child._mountIndex = index;
mountImages.push(mountImage);
index++;}}


return mountImages;}, 








updateTextContent:function(nextContent){
updateDepth++;
var errorThrown=true;
try{
var prevChildren=this._renderedChildren;

ReactChildReconciler.unmountChildren(prevChildren);

for(var name in prevChildren) {
if(prevChildren.hasOwnProperty(name)){
this._unmountChildByName(prevChildren[name], name);}}



this.setTextContent(nextContent);
errorThrown = false;}finally 
{
updateDepth--;
if(!updateDepth){
if(errorThrown){
clearQueue();}else 
{
processQueue();}}}}, 












updateChildren:function(nextNestedChildren, transaction, context){
updateDepth++;
var errorThrown=true;
try{
this._updateChildren(nextNestedChildren, transaction, context);
errorThrown = false;}finally 
{
updateDepth--;
if(!updateDepth){
if(errorThrown){
clearQueue();}else 
{
processQueue();}}}}, 















_updateChildren:function(nextNestedChildren, transaction, context){
var prevChildren=this._renderedChildren;
var nextChildren=ReactChildReconciler.updateChildren(
prevChildren, nextNestedChildren, transaction, context);

this._renderedChildren = nextChildren;
if(!nextChildren && !prevChildren){
return;}

var name;


var lastIndex=0;
var nextIndex=0;
for(name in nextChildren) {
if(!nextChildren.hasOwnProperty(name)){
continue;}

var prevChild=prevChildren && prevChildren[name];
var nextChild=nextChildren[name];
if(prevChild === nextChild){
this.moveChild(prevChild, nextIndex, lastIndex);
lastIndex = Math.max(prevChild._mountIndex, lastIndex);
prevChild._mountIndex = nextIndex;}else 
{
if(prevChild){

lastIndex = Math.max(prevChild._mountIndex, lastIndex);
this._unmountChildByName(prevChild, name);}


this._mountChildByNameAtIndex(
nextChild, name, nextIndex, transaction, context);}


nextIndex++;}


for(name in prevChildren) {
if(prevChildren.hasOwnProperty(name) && 
!(nextChildren && nextChildren.hasOwnProperty(name))){
this._unmountChildByName(prevChildren[name], name);}}}, 










unmountChildren:function(){
var renderedChildren=this._renderedChildren;
ReactChildReconciler.unmountChildren(renderedChildren);
this._renderedChildren = null;}, 










moveChild:function(child, toIndex, lastIndex){



if(child._mountIndex < lastIndex){
enqueueMove(this._rootNodeID, child._mountIndex, toIndex);}}, 










createChild:function(child, mountImage){
enqueueMarkup(this._rootNodeID, mountImage, child._mountIndex);}, 








removeChild:function(child){
enqueueRemove(this._rootNodeID, child._mountIndex);}, 








setTextContent:function(textContent){
enqueueTextContent(this._rootNodeID, textContent);}, 













_mountChildByNameAtIndex:function(
child, 
name, 
index, 
transaction, 
context){

var rootID=this._rootNodeID + name;
var mountImage=ReactReconciler.mountComponent(
child, 
rootID, 
transaction, 
context);

child._mountIndex = index;
this.createChild(child, mountImage);}, 











_unmountChildByName:function(child, name){
this.removeChild(child);
child._mountIndex = null;}}};






module.exports = ReactMultiChild;});
__d('ReactChildReconciler',["ReactReconciler","flattenChildren","instantiateReactComponent","shouldUpdateReactComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactReconciler=require('ReactReconciler');

var flattenChildren=require('flattenChildren');
var instantiateReactComponent=require('instantiateReactComponent');
var shouldUpdateReactComponent=require('shouldUpdateReactComponent');






var ReactChildReconciler={









instantiateChildren:function(nestedChildNodes, transaction, context){
var children=flattenChildren(nestedChildNodes);
for(var name in children) {
if(children.hasOwnProperty(name)){
var child=children[name];


var childInstance=instantiateReactComponent(child, null);
children[name] = childInstance;}}


return children;}, 












updateChildren:function(
prevChildren, 
nextNestedChildNodes, 
transaction, 
context){





var nextChildren=flattenChildren(nextNestedChildNodes);
if(!nextChildren && !prevChildren){
return null;}

var name;
for(name in nextChildren) {
if(!nextChildren.hasOwnProperty(name)){
continue;}

var prevChild=prevChildren && prevChildren[name];
var prevElement=prevChild && prevChild._currentElement;
var nextElement=nextChildren[name];
if(shouldUpdateReactComponent(prevElement, nextElement)){
ReactReconciler.receiveComponent(
prevChild, nextElement, transaction, context);

nextChildren[name] = prevChild;}else 
{
if(prevChild){
ReactReconciler.unmountComponent(prevChild, name);}


var nextChildInstance=instantiateReactComponent(
nextElement, 
null);

nextChildren[name] = nextChildInstance;}}



for(name in prevChildren) {
if(prevChildren.hasOwnProperty(name) && 
!(nextChildren && nextChildren.hasOwnProperty(name))){
ReactReconciler.unmountComponent(prevChildren[name]);}}


return nextChildren;}, 









unmountChildren:function(renderedChildren){
for(var name in renderedChildren) {
var renderedChild=renderedChildren[name];
ReactReconciler.unmountComponent(renderedChild);}}};





module.exports = ReactChildReconciler;});
__d('flattenChildren',["traverseAllChildren","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var traverseAllChildren=require('traverseAllChildren');
var warning=require('warning');






function flattenSingleChildIntoContext(traverseContext, child, name){

var result=traverseContext;
var keyUnique=!result.hasOwnProperty(name);
if(__DEV__){
warning(
keyUnique, 
'flattenChildren(...): Encountered two children with the same key, ' + 
'`%s`. Child keys must be unique; when two children share a key, only ' + 
'the first child will be used.', 
name);}


if(keyUnique && child != null){
result[name] = child;}}








function flattenChildren(children){
if(children == null){
return children;}

var result={};
traverseAllChildren(children, flattenSingleChildIntoContext, result);
return result;}


module.exports = flattenChildren;});
__d('styleDiffer',["deepDiffer"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var deepDiffer=require('deepDiffer');

function styleDiffer(a, b){
return !styleEqual(a, b);}


function styleEqual(a, b){
if(!a){
return !b;}

if(!b){
return !a;}

if(typeof a !== typeof b){
return false;}

if(typeof a === 'number'){
return a === b;}


if(Array.isArray(a)){
if(!Array.isArray(b) || a.length !== b.length){
return false;}

for(var i=0; i < a.length; ++i) {
if(!styleEqual(a[i], b[i])){
return false;}}


return true;}


for(var key in a) {
if(deepDiffer(a[key], b[key])){
return false;}}



for(var key in b) {
if(!a.hasOwnProperty(key)){
return false;}}



return true;}


module.exports = styleDiffer;});
__d('deepDiffer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';















var deepDiffer=function(one, two){
if(one === two){

return false;}

if(typeof one === 'function' && typeof two === 'function'){

return false;}

if(typeof one !== 'object' || one === null){

return one !== two;}

if(typeof two !== 'object' || two === null){


return true;}

if(one.constructor !== two.constructor){
return true;}

if(Array.isArray(one)){

var len=one.length;
if(two.length !== len){
return true;}

for(var ii=0; ii < len; ii++) {
if(deepDiffer(one[ii], two[ii])){
return true;}}}else 


{
for(var key in one) {
if(deepDiffer(one[key], two[key])){
return true;}}


for(var twoKey in two) {


if(one[twoKey] === undefined && two[twoKey] !== undefined){
return true;}}}



return false;};


module.exports = deepDiffer;});
__d('diffRawProperties',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';























function diffRawProperties(
updatePayload, 
prevProps, 
nextProps, 
validAttributes)
{
var validAttributeConfig;
var nextProp;
var prevProp;
var isScalar;
var shouldUpdate;

if(nextProps){
for(var propKey in nextProps) {
validAttributeConfig = validAttributes[propKey];
if(!validAttributeConfig){
continue;}

prevProp = prevProps && prevProps[propKey];
nextProp = nextProps[propKey];



if(typeof prevProp === 'function'){
prevProp = true;}

if(typeof nextProp === 'function'){
nextProp = true;}


if(prevProp !== nextProp){




isScalar = typeof nextProp !== 'object' || nextProp === null;
shouldUpdate = isScalar || 
!prevProp || 
validAttributeConfig.diff && 
validAttributeConfig.diff(prevProp, nextProp);

if(shouldUpdate){
updatePayload = updatePayload || {};
updatePayload[propKey] = nextProp;}}}}








if(prevProps){
for(var propKey in prevProps) {
validAttributeConfig = validAttributes[propKey];
if(!validAttributeConfig){
continue;}

if(updatePayload && updatePayload[propKey] !== undefined){
continue;}

prevProp = prevProps[propKey];
nextProp = nextProps && nextProps[propKey];



if(typeof prevProp === 'function'){
prevProp = true;}

if(typeof nextProp === 'function'){
nextProp = true;}


if(prevProp !== nextProp){
if(nextProp === undefined){
nextProp = null;}





isScalar = typeof nextProp !== 'object' || nextProp === null;
shouldUpdate = isScalar && prevProp !== nextProp || 
validAttributeConfig.diff && 
validAttributeConfig.diff(prevProp, nextProp);
if(shouldUpdate){
updatePayload = updatePayload || {};
updatePayload[propKey] = nextProp;}}}}




return updatePayload;}


module.exports = diffRawProperties;});
__d('RCTEventEmitter',["ReactNativeEventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactNativeEventEmitter=require('ReactNativeEventEmitter');


module.exports = ReactNativeEventEmitter;});
__d('RCTLog',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var invariant=require('invariant');

var levelsMap={
log:'log', 
info:'info', 
warn:'warn', 
error:'error', 
mustfix:'error'};var 


RCTLog=(function(){function RCTLog(){_classCallCheck(this, RCTLog);}_createClass(RCTLog, null, [{key:'logIfNoNativeHook', value:

function logIfNoNativeHook(){
var args=Array.prototype.slice.call(arguments);
var level=args.shift();
var logFn=levelsMap[level];
invariant(
logFn, 
'Level "' + level + '" not one of ' + Object.keys(levelsMap));

if(typeof global.nativeLoggingHook === 'undefined'){

console[logFn].apply(console, args);}

return true;}}]);return RCTLog;})();



module.exports = RCTLog;});
__d('RCTJSTimers',["JSTimersExecution"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var JSTimersExecution=require('JSTimersExecution');

var RCTJSTimers=JSTimersExecution;

module.exports = RCTJSTimers;});
__d('deprecated',["Object.assign","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var assign=require('Object.assign');
var warning=require('warning');












function deprecated(namespace, oldName, newName, ctx, fn){
var warned=false;
if(__DEV__){
var newFn=function(){
warning(
warned, 
'%s.%s will be deprecated in a future version. ' + 
'Use %s.%s instead.', 
namespace, 
oldName, 
namespace, 
newName);

warned = true;
return fn.apply(ctx, arguments);};

newFn.displayName = '' + namespace + '_' + oldName;


return assign(newFn, fn);}


return fn;}


module.exports = deprecated;});
__d('onlyChild',["ReactElement","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var ReactElement=require('ReactElement');

var invariant=require('invariant');












function onlyChild(children){
invariant(
ReactElement.isValidElement(children), 
'onlyChild must be passed a children with exactly one child.');

return children;}


module.exports = onlyChild;});
__d('ActivityIndicatorIOS',["NativeMethodsMixin","ReactPropTypes","React","StyleSheet","View","requireNativeComponent","verifyPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';function _objectWithoutProperties(obj, keys){var target={};for(var i in obj) {if(keys.indexOf(i) >= 0)continue;if(!Object.prototype.hasOwnProperty.call(obj, i))continue;target[i] = obj[i];}return target;}












var NativeMethodsMixin=require('NativeMethodsMixin');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var StyleSheet=require('StyleSheet');
var View=require('View');

var requireNativeComponent=require('requireNativeComponent');
var verifyPropTypes=require('verifyPropTypes');

var GRAY='#999999';








var ActivityIndicatorIOS=React.createClass({displayName:'ActivityIndicatorIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{



animating:PropTypes.bool, 



color:PropTypes.string, 



hidesWhenStopped:PropTypes.bool, 



size:PropTypes.oneOf([
'small', 
'large']), 






onLayout:PropTypes.func}, 


getDefaultProps:function(){
return {
animating:true, 
color:GRAY, 
hidesWhenStopped:true, 
size:'small'};}, 



render:function(){var _props=
this.props;var onLayout=_props.onLayout;var style=_props.style;var props=_objectWithoutProperties(_props, ['onLayout', 'style']);
var sizeStyle=this.props.size === 'large'?styles.sizeLarge:styles.sizeSmall;
return (
React.createElement(View, {
onLayout:onLayout, 
style:[styles.container, sizeStyle, style]}, 
React.createElement(RCTActivityIndicatorView, props)));}});





var styles=StyleSheet.create({
container:{
alignItems:'center', 
justifyContent:'center'}, 

sizeSmall:{
height:20}, 

sizeLarge:{
height:36}});



var RCTActivityIndicatorView=requireNativeComponent(
'RCTActivityIndicatorView', 
null);

if(__DEV__){
var nativeOnlyProps={activityIndicatorViewStyle:true};
verifyPropTypes(
ActivityIndicatorIOS, 
RCTActivityIndicatorView.viewConfig, 
nativeOnlyProps);}



module.exports = ActivityIndicatorIOS;});
__d('StyleSheet',["StyleSheetRegistry","StyleSheetValidation"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var StyleSheetRegistry=require('StyleSheetRegistry');
var StyleSheetValidation=require('StyleSheetValidation');var 













































StyleSheet=(function(){function StyleSheet(){_classCallCheck(this, StyleSheet);}_createClass(StyleSheet, null, [{key:'create', value:
function create(obj){
var result={};
for(var key in obj) {
StyleSheetValidation.validateStyle(key, obj);
result[key] = StyleSheetRegistry.registerStyle(obj[key]);}

return result;}}]);return StyleSheet;})();



module.exports = StyleSheet;});
__d('StyleSheetValidation',["ImageStylePropTypes","ReactPropTypeLocations","TextStylePropTypes","ViewStylePropTypes","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var ImageStylePropTypes=require('ImageStylePropTypes');
var ReactPropTypeLocations=require('ReactPropTypeLocations');
var TextStylePropTypes=require('TextStylePropTypes');
var ViewStylePropTypes=require('ViewStylePropTypes');

var invariant=require('invariant');var 

StyleSheetValidation=(function(){function StyleSheetValidation(){_classCallCheck(this, StyleSheetValidation);}_createClass(StyleSheetValidation, null, [{key:'validateStyleProp', value:
function validateStyleProp(prop, style, caller){
if(!__DEV__){
return;}

if(allStylePropTypes[prop] === undefined){
var message1='"' + prop + '" is not a valid style property.';
var message2='\nValid style props: ' + 
JSON.stringify(Object.keys(allStylePropTypes), null, '  ');
styleError(message1, style, caller, message2);}

var error=allStylePropTypes[prop](
style, 
prop, 
caller, 
ReactPropTypeLocations.prop);

if(error){
styleError(error.message, style, caller);}}}, {key:'validateStyle', value:



function validateStyle(name, styles){
if(!__DEV__){
return;}

for(var prop in styles[name]) {
StyleSheetValidation.validateStyleProp(prop, styles[name], 'StyleSheet ' + name);}}}, {key:'addValidStylePropTypes', value:



function addValidStylePropTypes(stylePropTypes){
for(var key in stylePropTypes) {
invariant(
allStylePropTypes[key] === undefined || 
allStylePropTypes[key] === stylePropTypes[key], 
'Attemped to redefine existing style prop type "' + key + '".');

allStylePropTypes[key] = stylePropTypes[key];}}}]);return StyleSheetValidation;})();




var styleError=function(message1, style, caller, message2){
invariant(
false, 
message1 + '\n' + (caller || '<<unknown>>') + ': ' + 
JSON.stringify(style, null, '  ') + (message2 || ''));};



var allStylePropTypes={};

StyleSheetValidation.addValidStylePropTypes(ImageStylePropTypes);
StyleSheetValidation.addValidStylePropTypes(TextStylePropTypes);
StyleSheetValidation.addValidStylePropTypes(ViewStylePropTypes);

module.exports = StyleSheetValidation;});
__d('View',["NativeMethodsMixin","ReactPropTypes","NativeModules","React","ReactNativeStyleAttributes","ReactNativeViewAttributes","StyleSheetPropType","ViewStylePropTypes","createReactNativeComponentClass"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeMethodsMixin=require('NativeMethodsMixin');
var PropTypes=require('ReactPropTypes');
var RCTUIManager=require('NativeModules').UIManager;
var React=require('React');
var ReactNativeStyleAttributes=require('ReactNativeStyleAttributes');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var StyleSheetPropType=require('StyleSheetPropType');
var ViewStylePropTypes=require('ViewStylePropTypes');

var createReactNativeComponentClass=require('createReactNativeComponentClass');

var stylePropType=StyleSheetPropType(ViewStylePropTypes);

var AccessibilityTraits=[
'none', 
'button', 
'link', 
'header', 
'search', 
'image', 
'selected', 
'plays', 
'key', 
'text', 
'summary', 
'disabled', 
'frequentUpdates', 
'startsMedia', 
'adjustable', 
'allowsDirectInteraction', 
'pageTurn'];






















var View=React.createClass({displayName:'View', 
mixins:[NativeMethodsMixin], 





viewConfig:{
uiViewClassName:'RCTView', 
validAttributes:ReactNativeViewAttributes.RCTView}, 


propTypes:{




accessible:PropTypes.bool, 






accessibilityLabel:PropTypes.string, 





accessibilityTraits:PropTypes.oneOfType([
PropTypes.oneOf(AccessibilityTraits), 
PropTypes.arrayOf(PropTypes.oneOf(AccessibilityTraits))]), 






onAcccessibilityTap:PropTypes.func, 





onMagicTap:PropTypes.func, 




testID:PropTypes.string, 






onMoveShouldSetResponder:PropTypes.func, 
onResponderGrant:PropTypes.func, 
onResponderMove:PropTypes.func, 
onResponderReject:PropTypes.func, 
onResponderRelease:PropTypes.func, 
onResponderTerminate:PropTypes.func, 
onResponderTerminationRequest:PropTypes.func, 
onStartShouldSetResponder:PropTypes.func, 
onStartShouldSetResponderCapture:PropTypes.func, 






onLayout:PropTypes.func, 































pointerEvents:PropTypes.oneOf([
'box-none', 
'none', 
'box-only', 
'auto']), 

style:stylePropType, 









removeClippedSubviews:PropTypes.bool, 













renderToHardwareTextureAndroid:PropTypes.bool}, 


render:function(){
return React.createElement(RCTView, this.props);}});



var RCTView=createReactNativeComponentClass({
validAttributes:ReactNativeViewAttributes.RCTView, 
uiViewClassName:'RCTView'});

RCTView.propTypes = View.propTypes;
if(__DEV__){
var viewConfig=RCTUIManager.viewConfigs && RCTUIManager.viewConfigs.RCTView || {};
for(var prop in viewConfig.nativeProps) {
var viewAny=View;
if(!viewAny.propTypes[prop] && !ReactNativeStyleAttributes[prop]){
throw new Error(
'View is missing propType for native prop `' + prop + '`');}}}





var ViewToExport=RCTView;
if(__DEV__){
ViewToExport = View;}


module.exports = ViewToExport;});
__d('ReactNativeViewAttributes',["merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var merge=require('merge');

var ReactNativeViewAttributes={};

ReactNativeViewAttributes.UIView = {
pointerEvents:true, 
accessible:true, 
accessibilityLabel:true, 
accessibilityTraits:true, 
testID:true, 
onLayout:true, 
onAccessibilityTap:true, 
onMagicTap:true};


ReactNativeViewAttributes.RCTView = merge(
ReactNativeViewAttributes.UIView, {






removeClippedSubviews:true});


module.exports = ReactNativeViewAttributes;});
__d('StyleSheetPropType',["createStrictShapeTypeChecker","flattenStyle"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var createStrictShapeTypeChecker=require('createStrictShapeTypeChecker');
var flattenStyle=require('flattenStyle');

function StyleSheetPropType(
shape)
{
var shapePropType=createStrictShapeTypeChecker(shape);
return function(props, propName, componentName, location){
var newProps=props;
if(props[propName]){

newProps = {};
newProps[propName] = flattenStyle(props[propName]);}

return shapePropType(newProps, propName, componentName, location);};}



module.exports = StyleSheetPropType;});
__d('createStrictShapeTypeChecker',["ReactPropTypeLocationNames","invariant","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactPropTypeLocationNames=require('ReactPropTypeLocationNames');

var invariant=require('invariant');
var merge=require('merge');

function createStrictShapeTypeChecker(
shapeTypes)
{
function checkType(isRequired, props, propName, componentName, location){
if(!props[propName]){
if(isRequired){
invariant(
false, 
'Required object `' + propName + '` was not specified in ' + ('`' + 
componentName + '`.'));}


return;}

var propValue=props[propName];
var propType=typeof propValue;
var locationName=
location && ReactPropTypeLocationNames[location] || '(unknown)';
if(propType !== 'object'){
invariant(
false, 
'Invalid ' + locationName + ' `' + propName + '` of type `' + propType + '` ' + ('supplied to `' + 
componentName + '`, expected `object`.'));}




var allKeys=merge(props[propName], shapeTypes);
for(var key in allKeys) {
var checker=shapeTypes[key];
if(!checker){
invariant(
false, 
'Invalid props.' + propName + ' key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + 
JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + 
JSON.stringify(Object.keys(shapeTypes), null, '  '));}


var error=checker(propValue, key, componentName, location);
if(error){
invariant(
false, 
error.message + '\nBad object: ' + 
JSON.stringify(props[propName], null, '  '));}}}




function chainedCheckType(
props, 
propName, 
componentName, 
location)
{
return checkType(false, props, propName, componentName, location);}

chainedCheckType.isRequired = checkType.bind(null, true);
return chainedCheckType;}


module.exports = createStrictShapeTypeChecker;});
__d('requireNativeComponent',["NativeModules","UnimplementedView","createReactNativeComponentClass","deepDiffer","insetsDiffer","pointsDiffer","matricesDiffer","sizesDiffer","verifyPropTypes","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var RCTUIManager=require('NativeModules').UIManager;
var UnimplementedView=require('UnimplementedView');

var createReactNativeComponentClass=require('createReactNativeComponentClass');
var deepDiffer=require('deepDiffer');
var insetsDiffer=require('insetsDiffer');
var pointsDiffer=require('pointsDiffer');
var matricesDiffer=require('matricesDiffer');
var sizesDiffer=require('sizesDiffer');
var verifyPropTypes=require('verifyPropTypes');
var warning=require('warning');
















function requireNativeComponent(
viewName, 
wrapperComponent)
{
var viewConfig=RCTUIManager[viewName];
if(!viewConfig || !viewConfig.NativeProps){
warning(false, 'Native component for "%s" does not exist', viewName);
return UnimplementedView;}

var nativeProps=_extends({}, 
RCTUIManager.RCTView.NativeProps, 
viewConfig.NativeProps);

viewConfig.uiViewClassName = viewName;
viewConfig.validAttributes = {};
for(var key in nativeProps) {

var differ=TypeToDifferMap[nativeProps[key]] || deepDiffer;
viewConfig.validAttributes[key] = {diff:differ};}

if(__DEV__){
wrapperComponent && verifyPropTypes(wrapperComponent, viewConfig);}

return createReactNativeComponentClass(viewConfig);}


var TypeToDifferMap={

CATransform3D:matricesDiffer, 
CGPoint:pointsDiffer, 
CGSize:sizesDiffer, 
UIEdgeInsets:insetsDiffer};




module.exports = requireNativeComponent;});
__d('UnimplementedView',["React","StyleSheet","View"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';








var React=require('React');
var StyleSheet=require('StyleSheet');
var View=require('View');

var UnimplementedView=React.createClass({displayName:'UnimplementedView', 
setNativeProps:function(){}, 




render:function(){
return (
React.createElement(View, {style:[styles.unimplementedView, this.props.style]}, 
this.props.children));}});





var styles=StyleSheet.create({
unimplementedView:{
borderWidth:1, 
borderColor:'red', 
alignSelf:'flex-start'}});



module.exports = UnimplementedView;});
__d('insetsDiffer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



















var dummyInsets={
top:undefined, 
left:undefined, 
right:undefined, 
bottom:undefined};


var insetsDiffer=function(
one, 
two)
{
one = one || dummyInsets;
two = two || dummyInsets;
return one !== two && (
one.top !== two.top || 
one.left !== two.left || 
one.right !== two.right || 
one.bottom !== two.bottom);};



module.exports = insetsDiffer;});
__d('pointsDiffer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var dummyPoint={x:undefined, y:undefined};

var pointsDiffer=function(one, two){
one = one || dummyPoint;
two = two || dummyPoint;
return one !== two && (
one.x !== two.x || 
one.y !== two.y);};



module.exports = pointsDiffer;});
__d('verifyPropTypes',["ReactNativeStyleAttributes","View"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactNativeStyleAttributes=require('ReactNativeStyleAttributes');
var View=require('View');

function verifyPropTypes(
component, 
viewConfig, 
nativePropsToIgnore)
{
if(!viewConfig){
return;}

var componentName=component.name || component.displayName;
if(!component.propTypes){
throw new Error(
'`' + componentName + '` has no propTypes defined`');}



var nativeProps=viewConfig.NativeProps;
for(var prop in nativeProps) {
if(!component.propTypes[prop] && 
!View.propTypes[prop] && 
!ReactNativeStyleAttributes[prop] && (
!nativePropsToIgnore || !nativePropsToIgnore[prop])){
throw new Error(
'`' + componentName + '` has no propType for native prop `' + 
viewConfig.uiViewClassName + '.' + prop + '` of native type `' + 
nativeProps[prop] + '`');}}}





module.exports = verifyPropTypes;});
__d('DatePickerIOS',["NativeMethodsMixin","ReactPropTypes","React","NativeModules","StyleSheet","View","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var NativeMethodsMixin=require('NativeMethodsMixin');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var RCTDatePickerIOSConsts=require('NativeModules').UIManager.RCTDatePicker.Constants;
var StyleSheet=require('StyleSheet');
var View=require('View');

var requireNativeComponent=require('requireNativeComponent');

var DATEPICKER='datepicker';














var DatePickerIOS=React.createClass({displayName:'DatePickerIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{



date:PropTypes.instanceOf(Date).isRequired, 








onDateChange:PropTypes.func.isRequired, 






maximumDate:PropTypes.instanceOf(Date), 






minimumDate:PropTypes.instanceOf(Date), 




mode:PropTypes.oneOf(['date', 'time', 'datetime']), 




minuteInterval:PropTypes.oneOf([1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30]), 








timeZoneOffsetInMinutes:PropTypes.number}, 


getDefaultProps:function(){
return {
mode:'datetime'};}, 



_onChange:function(event){
var nativeTimeStamp=event.nativeEvent.timestamp;
this.props.onDateChange && this.props.onDateChange(
new Date(nativeTimeStamp));

this.props.onChange && this.props.onChange(event);





var propsTimeStamp=this.props.date.getTime();
if(nativeTimeStamp !== propsTimeStamp){
this.refs[DATEPICKER].setNativeProps({
date:propsTimeStamp});}}, 




render:function(){
var props=this.props;
return (
React.createElement(View, {style:props.style}, 
React.createElement(RCTDatePickerIOS, {
ref:DATEPICKER, 
style:styles.datePickerIOS, 
date:props.date.getTime(), 
maximumDate:
props.maximumDate?props.maximumDate.getTime():undefined, 

minimumDate:
props.minimumDate?props.minimumDate.getTime():undefined, 

mode:props.mode, 
minuteInterval:props.minuteInterval, 
timeZoneOffsetInMinutes:props.timeZoneOffsetInMinutes, 
onChange:this._onChange})));}});






var styles=StyleSheet.create({
datePickerIOS:{
height:RCTDatePickerIOSConsts.ComponentHeight, 
width:RCTDatePickerIOSConsts.ComponentWidth}});



var RCTDatePickerIOS=requireNativeComponent('RCTDatePicker', DatePickerIOS);

module.exports = DatePickerIOS;});
__d('Image',["EdgeInsetsPropType","ImageResizeMode","ImageStylePropTypes","NativeMethodsMixin","NativeModules","ReactPropTypes","React","ReactNativeViewAttributes","StyleSheet","StyleSheetPropType","flattenStyle","invariant","merge","requireNativeComponent","resolveAssetSource","verifyPropTypes","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EdgeInsetsPropType=require('EdgeInsetsPropType');
var ImageResizeMode=require('ImageResizeMode');
var ImageStylePropTypes=require('ImageStylePropTypes');
var NativeMethodsMixin=require('NativeMethodsMixin');
var NativeModules=require('NativeModules');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var StyleSheet=require('StyleSheet');
var StyleSheetPropType=require('StyleSheetPropType');

var flattenStyle=require('flattenStyle');
var invariant=require('invariant');
var merge=require('merge');
var requireNativeComponent=require('requireNativeComponent');
var resolveAssetSource=require('resolveAssetSource');
var verifyPropTypes=require('verifyPropTypes');
var warning=require('warning');


























var Image=React.createClass({displayName:'Image', 
propTypes:{





source:PropTypes.shape({
uri:PropTypes.string}), 





defaultSource:PropTypes.shape({
uri:PropTypes.string}), 




accessible:PropTypes.bool, 



accessibilityLabel:PropTypes.string, 







capInsets:EdgeInsetsPropType, 




resizeMode:PropTypes.oneOf(['cover', 'contain', 'stretch']), 
style:StyleSheetPropType(ImageStylePropTypes), 




testID:PropTypes.string, 





onLayout:PropTypes.func}, 


statics:{
resizeMode:ImageResizeMode}, 


mixins:[NativeMethodsMixin], 





viewConfig:{
uiViewClassName:'UIView', 
validAttributes:ReactNativeViewAttributes.UIView}, 


render:function(){
for(var prop in nativeOnlyProps) {
if(this.props[prop] !== undefined){
console.warn('Prop `' + prop + ' = ' + this.props[prop] + '` should ' + 
'not be set directly on Image.');}}


var source=resolveAssetSource(this.props.source) || {};var 

width=source.width;var height=source.height;
var style=flattenStyle([{width:width, height:height}, styles.base, this.props.style]);
invariant(style, 'style must be initialized');

var isNetwork=source.uri && source.uri.match(/^https?:/);
invariant(
!(isNetwork && source.isStatic), 
'static image uris cannot start with "http": "' + source.uri + '"');

var isStored=!source.isStatic && !isNetwork;
var RawImage=isNetwork?RCTNetworkImage:RCTStaticImage;

if(this.props.style && this.props.style.tintColor){
warning(RawImage === RCTStaticImage, 'tintColor style only supported on static images.');}

var resizeMode=this.props.resizeMode || style.resizeMode || 'cover';

var nativeProps=merge(this.props, {
style:style, 
resizeMode:resizeMode, 
tintColor:style.tintColor});

if(isStored){
nativeProps.imageTag = source.uri;}else 
{
nativeProps.src = source.uri;}

if(this.props.defaultSource){
nativeProps.defaultImageSrc = this.props.defaultSource.uri;}

return React.createElement(RawImage, nativeProps);}});



var styles=StyleSheet.create({
base:{
overflow:'hidden'}});



var RCTNetworkImage=requireNativeComponent('RCTNetworkImageView', null);
var RCTStaticImage=requireNativeComponent('RCTStaticImage', null);

var nativeOnlyProps={
src:true, 
defaultImageSrc:true, 
imageTag:true, 
resizeMode:true};

if(__DEV__){
verifyPropTypes(Image, RCTStaticImage.viewConfig, nativeOnlyProps);
verifyPropTypes(Image, RCTNetworkImage.viewConfig, nativeOnlyProps);}


module.exports = Image;});
__d('EdgeInsetsPropType',["ReactPropTypes","createStrictShapeTypeChecker"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var PropTypes=require('ReactPropTypes');

var createStrictShapeTypeChecker=require('createStrictShapeTypeChecker');

var EdgeInsetsPropType=createStrictShapeTypeChecker({
top:PropTypes.number, 
left:PropTypes.number, 
bottom:PropTypes.number, 
right:PropTypes.number});


module.exports = EdgeInsetsPropType;});
__d('resolveAssetSource',["AssetRegistry","PixelRatio","Platform","NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var AssetRegistry=require('AssetRegistry');
var PixelRatio=require('PixelRatio');
var Platform=require('Platform');
var SourceCode=require('NativeModules').SourceCode;

var _serverURL;

function getDevServerURL(){
if(!__DEV__){

return null;}

if(_serverURL === undefined){
var scriptURL=SourceCode.scriptURL;
var match=scriptURL && scriptURL.match(/^https?:\/\/.*?\//);
if(match){

_serverURL = match[0];}else 
{

_serverURL = null;}}



return _serverURL;}





function getPathInArchive(asset){
if(Platform.OS === 'android'){
var assetDir=getBasePath(asset);


return (assetDir + '/' + asset.name).
toLowerCase().
replace(/\//g, '_').
replace(/([^a-z0-9_])/g, '').
replace(/^assets_/, '');}else 
{

return getScaledAssetPath(asset);}}







function getPathOnDevserver(devServerUrl, asset){
return devServerUrl + getScaledAssetPath(asset) + '?hash=' + asset.hash;}





function getBasePath(asset){


var path=asset.httpServerLocation;
if(path[0] === '/'){
path = path.substr(1);}

return path;}





function getScaledAssetPath(asset){
var scale=pickScale(asset.scales, PixelRatio.get());
var scaleSuffix=scale === 1?'':'@' + scale + 'x';
var assetDir=getBasePath(asset);
return assetDir + '/' + asset.name + scaleSuffix + '.' + asset.type;}


function pickScale(scales, deviceScale){

for(var i=0; i < scales.length; i++) {
if(scales[i] >= deviceScale){
return scales[i];}}






return scales[scales.length - 1] || 1;}


function resolveAssetSource(source){
if(typeof source === 'object'){
return source;}


var asset=AssetRegistry.getAssetByID(source);
if(asset){
return assetToImageSource(asset);}


return null;}


function assetToImageSource(asset){
var devServerURL=getDevServerURL();
if(devServerURL){
return {
width:asset.width, 
height:asset.height, 
uri:getPathOnDevserver(devServerURL, asset), 
isStatic:false};}else 

{
return {
width:asset.width, 
height:asset.height, 
uri:getPathInArchive(asset), 
isStatic:true};}}




module.exports = resolveAssetSource;
module.exports.pickScale = pickScale;});
__d('AssetRegistry',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';






var assets=[];

function registerAsset(asset){


return assets.push(asset);}


function getAssetByID(assetId){
return assets[assetId - 1];}


module.exports = {registerAsset:registerAsset, getAssetByID:getAssetByID};});
__d('PixelRatio',["Dimensions"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var Dimensions=require('Dimensions');var 






























PixelRatio=(function(){function PixelRatio(){_classCallCheck(this, PixelRatio);}_createClass(PixelRatio, null, [{key:'get', value:












function get(){
return Dimensions.get('window').scale;}}, {key:'getFontScale', value:












function getFontScale(){
return Dimensions.get('window').fontScale || PixelRatio.get();}}, {key:'getPixelSizeForLayoutSize', value:







function getPixelSizeForLayoutSize(layoutSize){
return Math.round(layoutSize * PixelRatio.get());}}, {key:'startDetecting', value:



function startDetecting(){}}]);return PixelRatio;})();


module.exports = PixelRatio;});
__d('Dimensions',["NativeModules","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var NativeModules=require('NativeModules');

var invariant=require('invariant');

var dimensions=NativeModules.UIManager.Dimensions;




if(dimensions && dimensions.windowPhysicalPixels){

dimensions = JSON.parse(JSON.stringify(dimensions));

var windowPhysicalPixels=dimensions.windowPhysicalPixels;
dimensions.window = {
width:windowPhysicalPixels.width / windowPhysicalPixels.scale, 
height:windowPhysicalPixels.height / windowPhysicalPixels.scale, 
scale:windowPhysicalPixels.scale, 
fontScale:windowPhysicalPixels.fontScale};



delete dimensions.windowPhysicalPixels;}var 


Dimensions=(function(){function Dimensions(){_classCallCheck(this, Dimensions);}_createClass(Dimensions, null, [{key:'set', value:





function set(dims){
Object.assign(dimensions, dims);
return true;}}, {key:'get', value:















function get(dim){
invariant(dimensions[dim], 'No dimension set for key ' + dim);
return dimensions[dim];}}]);return Dimensions;})();



module.exports = Dimensions;});
__d('ListView',["ListViewDataSource","React","NativeModules","ScrollView","ScrollResponder","StaticRenderer","react-timer-mixin/TimerMixin","logError","merge","isEmpty"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};



























var ListViewDataSource=require('ListViewDataSource');
var React=require('React');
var RCTUIManager=require('NativeModules').UIManager;
var ScrollView=require('ScrollView');
var ScrollResponder=require('ScrollResponder');
var StaticRenderer=require('StaticRenderer');
var TimerMixin=require('react-timer-mixin/TimerMixin');

var logError=require('logError');
var merge=require('merge');
var isEmpty=require('isEmpty');

var PropTypes=React.PropTypes;

var DEFAULT_PAGE_SIZE=1;
var DEFAULT_INITIAL_ROWS=10;
var DEFAULT_SCROLL_RENDER_AHEAD=1000;
var DEFAULT_END_REACHED_THRESHOLD=1000;
var DEFAULT_SCROLL_CALLBACK_THROTTLE=50;
var SCROLLVIEW_REF='listviewscroll';


















































var ListView=React.createClass({displayName:'ListView', 
mixins:[ScrollResponder.Mixin, TimerMixin], 

statics:{
DataSource:ListViewDataSource}, 









propTypes:_extends({}, 
ScrollView.propTypes, {

dataSource:PropTypes.instanceOf(ListViewDataSource).isRequired, 







renderSeparator:PropTypes.func, 










renderRow:PropTypes.func.isRequired, 





initialListSize:PropTypes.number, 





onEndReached:PropTypes.func, 



onEndReachedThreshold:PropTypes.number, 



pageSize:PropTypes.number, 








renderFooter:PropTypes.func, 
renderHeader:PropTypes.func, 









renderSectionHeader:PropTypes.func, 




scrollRenderAheadDistance:React.PropTypes.number, 









onChangeVisibleRows:React.PropTypes.func, 





removeClippedSubviews:React.PropTypes.bool}), 





getMetrics:function(){
return {
contentHeight:this.scrollProperties.contentHeight, 
totalRows:this.props.dataSource.getRowCount(), 
renderedRows:this.state.curRenderedRowsCount, 
visibleRows:Object.keys(this._visibleRows).length};}, 







getScrollResponder:function(){
return this.refs[SCROLLVIEW_REF];}, 


setNativeProps:function(props){
this.refs[SCROLLVIEW_REF].setNativeProps(props);}, 






getDefaultProps:function(){
return {
initialListSize:DEFAULT_INITIAL_ROWS, 
pageSize:DEFAULT_PAGE_SIZE, 
scrollRenderAheadDistance:DEFAULT_SCROLL_RENDER_AHEAD, 
onEndReachedThreshold:DEFAULT_END_REACHED_THRESHOLD};}, 



getInitialState:function(){
return {
curRenderedRowsCount:this.props.initialListSize, 
prevRenderedRowsCount:0, 
highlightedRow:{}};}, 



componentWillMount:function(){

this.scrollProperties = {
visibleHeight:null, 
contentHeight:null, 
offsetY:0};

this._childFrames = [];
this._visibleRows = {};}, 


componentDidMount:function(){var _this=this;


this.requestAnimationFrame(function(){
_this._measureAndUpdateScrollProps();});}, 



componentWillReceiveProps:function(nextProps){
if(this.props.dataSource !== nextProps.dataSource){
this.setState({prevRenderedRowsCount:0});}}, 



onRowHighlighted:function(sectionID, rowID){
this.setState({highlightedRow:{sectionID:sectionID, rowID:rowID}});}, 


render:function(){
var bodyComponents=[];

var dataSource=this.props.dataSource;
var allRowIDs=dataSource.rowIdentities;
var rowCount=0;
var sectionHeaderIndices=[];

var header=this.props.renderHeader && this.props.renderHeader();
var footer=this.props.renderFooter && this.props.renderFooter();
var totalIndex=header?1:0;

for(var sectionIdx=0; sectionIdx < allRowIDs.length; sectionIdx++) {
var sectionID=dataSource.sectionIdentities[sectionIdx];
var rowIDs=allRowIDs[sectionIdx];
if(rowIDs.length === 0){
continue;}


if(this.props.renderSectionHeader){
var shouldUpdateHeader=rowCount >= this.state.prevRenderedRowsCount && 
dataSource.sectionHeaderShouldUpdate(sectionIdx);
bodyComponents.push(
React.createElement(StaticRenderer, {
key:'s_' + sectionID, 
shouldUpdate:!!shouldUpdateHeader, 
render:this.props.renderSectionHeader.bind(
null, 
dataSource.getSectionHeaderData(sectionIdx), 
sectionID)}));



sectionHeaderIndices.push(totalIndex++);}


for(var rowIdx=0; rowIdx < rowIDs.length; rowIdx++) {
var rowID=rowIDs[rowIdx];
var comboID=sectionID + rowID;
var shouldUpdateRow=rowCount >= this.state.prevRenderedRowsCount && 
dataSource.rowShouldUpdate(sectionIdx, rowIdx);
var row=
React.createElement(StaticRenderer, {
key:'r_' + comboID, 
shouldUpdate:!!shouldUpdateRow, 
render:this.props.renderRow.bind(
null, 
dataSource.getRowData(sectionIdx, rowIdx), 
sectionID, 
rowID, 
this.onRowHighlighted)});


bodyComponents.push(row);
totalIndex++;

if(this.props.renderSeparator && (
rowIdx !== rowIDs.length - 1 || sectionIdx === allRowIDs.length - 1)){
var adjacentRowHighlighted=
this.state.highlightedRow.sectionID === sectionID && (
this.state.highlightedRow.rowID === rowID || 
this.state.highlightedRow.rowID === rowIDs[rowIdx + 1]);

var separator=this.props.renderSeparator(
sectionID, 
rowID, 
adjacentRowHighlighted);

bodyComponents.push(separator);
totalIndex++;}

if(++rowCount === this.state.curRenderedRowsCount){
break;}}


if(rowCount >= this.state.curRenderedRowsCount){
break;}}



var props=merge(
this.props, {
onScroll:this._onScroll, 
stickyHeaderIndices:sectionHeaderIndices});


if(!props.scrollEventThrottle){
props.scrollEventThrottle = DEFAULT_SCROLL_CALLBACK_THROTTLE;}


return (
React.createElement(ScrollView, _extends({}, props, {
ref:SCROLLVIEW_REF}), 
header, 
bodyComponents, 
footer));}, 








_measureAndUpdateScrollProps:function(){
RCTUIManager.measureLayout(
this.refs[SCROLLVIEW_REF].getInnerViewNode(), 
React.findNodeHandle(this.refs[SCROLLVIEW_REF]), 
logError, 
this._setScrollContentHeight);

RCTUIManager.measureLayoutRelativeToParent(
React.findNodeHandle(this.refs[SCROLLVIEW_REF]), 
logError, 
this._setScrollVisibleHeight);}, 



_setScrollContentHeight:function(left, top, width, height){
this.scrollProperties.contentHeight = height;}, 


_setScrollVisibleHeight:function(left, top, width, height){
this.scrollProperties.visibleHeight = height;
this._updateVisibleRows();
this._renderMoreRowsIfNeeded();}, 


_renderMoreRowsIfNeeded:function(){
if(this.scrollProperties.contentHeight === null || 
this.scrollProperties.visibleHeight === null || 
this.state.curRenderedRowsCount === this.props.dataSource.getRowCount()){
return;}


var distanceFromEnd=this._getDistanceFromEnd(this.scrollProperties);
if(distanceFromEnd < this.props.scrollRenderAheadDistance){
this._pageInNewRows();}}, 



_pageInNewRows:function(){var _this2=this;
var rowsToRender=Math.min(
this.state.curRenderedRowsCount + this.props.pageSize, 
this.props.dataSource.getRowCount());

this.setState(
{
prevRenderedRowsCount:this.state.curRenderedRowsCount, 
curRenderedRowsCount:rowsToRender}, 

function(){
_this2._measureAndUpdateScrollProps();
_this2.setState({
prevRenderedRowsCount:_this2.state.curRenderedRowsCount});});}, 





_getDistanceFromEnd:function(scrollProperties){
return scrollProperties.contentHeight - 
scrollProperties.visibleHeight - 
scrollProperties.offsetY;}, 


_updateVisibleRows:function(e){var _this3=this;
if(!this.props.onChangeVisibleRows){
return;}

var updatedFrames=e && e.nativeEvent.updatedChildFrames;
if(updatedFrames){
updatedFrames.forEach(function(newFrame){
_this3._childFrames[newFrame.index] = merge(newFrame);});}


var dataSource=this.props.dataSource;
var visibleTop=this.scrollProperties.offsetY;
var visibleBottom=visibleTop + this.scrollProperties.visibleHeight;
var allRowIDs=dataSource.rowIdentities;

var header=this.props.renderHeader && this.props.renderHeader();
var totalIndex=header?1:0;
var visibilityChanged=false;
var changedRows={};
for(var sectionIdx=0; sectionIdx < allRowIDs.length; sectionIdx++) {
var rowIDs=allRowIDs[sectionIdx];
if(rowIDs.length === 0){
continue;}

var sectionID=dataSource.sectionIdentities[sectionIdx];
if(this.props.renderSectionHeader){
totalIndex++;}

var visibleSection=this._visibleRows[sectionID];
if(!visibleSection){
visibleSection = {};}

for(var rowIdx=0; rowIdx < rowIDs.length; rowIdx++) {
var rowID=rowIDs[rowIdx];
var frame=this._childFrames[totalIndex];
totalIndex++;
if(!frame){
break;}

var rowVisible=visibleSection[rowID];
var top=frame.y;
var bottom=top + frame.height;
if(top > visibleBottom || bottom < visibleTop){
if(rowVisible){
visibilityChanged = true;
delete visibleSection[rowID];
if(!changedRows[sectionID]){
changedRows[sectionID] = {};}

changedRows[sectionID][rowID] = false;}}else 

if(!rowVisible){
visibilityChanged = true;
visibleSection[rowID] = true;
if(!changedRows[sectionID]){
changedRows[sectionID] = {};}

changedRows[sectionID][rowID] = true;}}


if(!isEmpty(visibleSection)){
this._visibleRows[sectionID] = visibleSection;}else 
if(this._visibleRows[sectionID]){
delete this._visibleRows[sectionID];}}


visibilityChanged && this.props.onChangeVisibleRows(this._visibleRows, changedRows);}, 


_onScroll:function(e){
this.scrollProperties.visibleHeight = e.nativeEvent.layoutMeasurement.height;
this.scrollProperties.contentHeight = e.nativeEvent.contentSize.height;
this.scrollProperties.offsetY = e.nativeEvent.contentOffset.y;
this._updateVisibleRows(e);
var nearEnd=this._getDistanceFromEnd(this.scrollProperties) < this.props.onEndReachedThreshold;
if(nearEnd && 
this.props.onEndReached && 
this.scrollProperties.contentHeight !== this._sentEndForContentHeight && 
this.state.curRenderedRowsCount === this.props.dataSource.getRowCount()){
this._sentEndForContentHeight = this.scrollProperties.contentHeight;
this.props.onEndReached(e);}else 
{
this._renderMoreRowsIfNeeded();}


this.props.onScroll && this.props.onScroll(e);}});



module.exports = ListView;});
__d('ListViewDataSource',["invariant","isEmpty","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}





























var invariant=require('invariant');
var isEmpty=require('isEmpty');
var warning=require('warning');

function defaultGetRowData(
dataBlob, 
sectionID, 
rowID)
{
return dataBlob[sectionID][rowID];}


function defaultGetSectionHeaderData(
dataBlob, 
sectionID)
{
return dataBlob[sectionID];}var 













































ListViewDataSource=(function(){


























function ListViewDataSource(params){_classCallCheck(this, ListViewDataSource);
invariant(
params && typeof params.rowHasChanged === 'function', 
'Must provide a rowHasChanged function.');

this._rowHasChanged = params.rowHasChanged;
this._getRowData = params.getRowData || defaultGetRowData;
this._sectionHeaderHasChanged = params.sectionHeaderHasChanged;
this._getSectionHeaderData = 
params.getSectionHeaderData || defaultGetSectionHeaderData;

this._dataBlob = null;
this._dirtyRows = [];
this._dirtySections = [];
this._cachedRowCount = 0;



this.rowIdentities = [];
this.sectionIdentities = [];}_createClass(ListViewDataSource, [{key:'cloneWithRows', value:


















function cloneWithRows(
dataBlob, 
rowIdentities)
{
var rowIds=rowIdentities?[rowIdentities]:null;
if(!this._sectionHeaderHasChanged){
this._sectionHeaderHasChanged = function(){return false;};}

return this.cloneWithRowsAndSections({s1:dataBlob}, ['s1'], rowIds);}}, {key:'cloneWithRowsAndSections', value:













function cloneWithRowsAndSections(
dataBlob, 
sectionIdentities, 
rowIdentities)
{
invariant(
typeof this._sectionHeaderHasChanged === 'function', 
'Must provide a sectionHeaderHasChanged function with section data.');

var newSource=new ListViewDataSource({
getRowData:this._getRowData, 
getSectionHeaderData:this._getSectionHeaderData, 
rowHasChanged:this._rowHasChanged, 
sectionHeaderHasChanged:this._sectionHeaderHasChanged});

newSource._dataBlob = dataBlob;
if(sectionIdentities){
newSource.sectionIdentities = sectionIdentities;}else 
{
newSource.sectionIdentities = Object.keys(dataBlob);}

if(rowIdentities){
newSource.rowIdentities = rowIdentities;}else 
{
newSource.rowIdentities = [];
newSource.sectionIdentities.forEach(function(sectionID){
newSource.rowIdentities.push(Object.keys(dataBlob[sectionID]));});}


newSource._cachedRowCount = countRows(newSource.rowIdentities);

newSource._calculateDirtyArrays(
this._dataBlob, 
this.sectionIdentities, 
this.rowIdentities);


return newSource;}}, {key:'getRowCount', value:


function getRowCount(){
return this._cachedRowCount;}}, {key:'rowShouldUpdate', value:





function rowShouldUpdate(sectionIndex, rowIndex){
var needsUpdate=this._dirtyRows[sectionIndex][rowIndex];
warning(needsUpdate !== undefined, 
'missing dirtyBit for section, row: ' + sectionIndex + ', ' + rowIndex);
return needsUpdate;}}, {key:'getRowData', value:





function getRowData(sectionIndex, rowIndex){
var sectionID=this.sectionIdentities[sectionIndex];
var rowID=this.rowIdentities[sectionIndex][rowIndex];
warning(
sectionID !== undefined && rowID !== undefined, 
'rendering invalid section, row: ' + sectionIndex + ', ' + rowIndex);

return this._getRowData(this._dataBlob, sectionID, rowID);}}, {key:'getRowIDForFlatIndex', value:






function getRowIDForFlatIndex(index){
var accessIndex=index;
for(var ii=0; ii < this.sectionIdentities.length; ii++) {
if(accessIndex >= this.rowIdentities[ii].length){
accessIndex -= this.rowIdentities[ii].length;}else 
{
return this.rowIdentities[ii][accessIndex];}}


return null;}}, {key:'getSectionIDForFlatIndex', value:






function getSectionIDForFlatIndex(index){
var accessIndex=index;
for(var ii=0; ii < this.sectionIdentities.length; ii++) {
if(accessIndex >= this.rowIdentities[ii].length){
accessIndex -= this.rowIdentities[ii].length;}else 
{
return this.sectionIdentities[ii];}}


return null;}}, {key:'getSectionLengths', value:





function getSectionLengths(){
var results=[];
for(var ii=0; ii < this.sectionIdentities.length; ii++) {
results.push(this.rowIdentities[ii].length);}

return results;}}, {key:'sectionHeaderShouldUpdate', value:





function sectionHeaderShouldUpdate(sectionIndex){
var needsUpdate=this._dirtySections[sectionIndex];
warning(needsUpdate !== undefined, 
'missing dirtyBit for section: ' + sectionIndex);
return needsUpdate;}}, {key:'getSectionHeaderData', value:





function getSectionHeaderData(sectionIndex){
if(!this._getSectionHeaderData){
return null;}

var sectionID=this.sectionIdentities[sectionIndex];
warning(sectionID !== undefined, 
'renderSection called on invalid section: ' + sectionIndex);
return this._getSectionHeaderData(this._dataBlob, sectionID);}}, {key:'_calculateDirtyArrays', value:





















function _calculateDirtyArrays(
prevDataBlob, 
prevSectionIDs, 
prevRowIDs)
{

var prevSectionsHash=keyedDictionaryFromArray(prevSectionIDs);
var prevRowsHash={};
for(var ii=0; ii < prevRowIDs.length; ii++) {
var sectionID=prevSectionIDs[ii];
warning(
!prevRowsHash[sectionID], 
'SectionID appears more than once: ' + sectionID);

prevRowsHash[sectionID] = keyedDictionaryFromArray(prevRowIDs[ii]);}



this._dirtySections = [];
this._dirtyRows = [];

var dirty;
for(var sIndex=0; sIndex < this.sectionIdentities.length; sIndex++) {
var sectionID=this.sectionIdentities[sIndex];

dirty = !prevSectionsHash[sectionID];
var sectionHeaderHasChanged=this._sectionHeaderHasChanged;
if(!dirty && sectionHeaderHasChanged){
dirty = sectionHeaderHasChanged(
this._getSectionHeaderData(prevDataBlob, sectionID), 
this._getSectionHeaderData(this._dataBlob, sectionID));}


this._dirtySections.push(!!dirty);

this._dirtyRows[sIndex] = [];
for(var rIndex=0; rIndex < this.rowIdentities[sIndex].length; rIndex++) {
var rowID=this.rowIdentities[sIndex][rIndex];

dirty = 
!prevSectionsHash[sectionID] || 
!prevRowsHash[sectionID][rowID] || 
this._rowHasChanged(
this._getRowData(prevDataBlob, sectionID, rowID), 
this._getRowData(this._dataBlob, sectionID, rowID));

this._dirtyRows[sIndex].push(!!dirty);}}}}]);return ListViewDataSource;})();





function countRows(allRowIDs){
var totalRows=0;
for(var sectionIdx=0; sectionIdx < allRowIDs.length; sectionIdx++) {
var rowIDs=allRowIDs[sectionIdx];
totalRows += rowIDs.length;}

return totalRows;}


function keyedDictionaryFromArray(arr){
if(isEmpty(arr)){
return {};}

var result={};
for(var ii=0; ii < arr.length; ii++) {
var key=arr[ii];
warning(!result[key], 'Value appears more than once in array: ' + key);
result[key] = true;}

return result;}



module.exports = ListViewDataSource;});
__d('isEmpty',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 



















isEmpty(obj){
if(Array.isArray(obj)){
return obj.length === 0;}else 
if(typeof obj === 'object'){
for(var i in obj) {
return false;}

return true;}else 
{
return !obj;}}



module.exports = isEmpty;});
__d('ScrollView',["EdgeInsetsPropType","Platform","PointPropType","NativeModules","React","ReactNativeViewAttributes","NativeModules","ScrollResponder","StyleSheet","StyleSheetPropType","View","ViewStylePropTypes","createReactNativeComponentClass","deepDiffer","flattenStyle","insetsDiffer","invariant","pointsDiffer","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var EdgeInsetsPropType=require('EdgeInsetsPropType');
var Platform=require('Platform');
var PointPropType=require('PointPropType');
var RCTScrollView=require('NativeModules').UIManager.RCTScrollView;
var RCTScrollViewConsts=RCTScrollView.Constants;
var React=require('React');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var RCTUIManager=require('NativeModules').UIManager;
var ScrollResponder=require('ScrollResponder');
var StyleSheet=require('StyleSheet');
var StyleSheetPropType=require('StyleSheetPropType');
var View=require('View');
var ViewStylePropTypes=require('ViewStylePropTypes');

var createReactNativeComponentClass=require('createReactNativeComponentClass');
var deepDiffer=require('deepDiffer');
var flattenStyle=require('flattenStyle');
var insetsDiffer=require('insetsDiffer');
var invariant=require('invariant');
var pointsDiffer=require('pointsDiffer');
var requireNativeComponent=require('requireNativeComponent');

var PropTypes=React.PropTypes;

var SCROLLVIEW='ScrollView';
var INNERVIEW='InnerScrollView';









var ScrollView=React.createClass({displayName:'ScrollView', 
propTypes:{
automaticallyAdjustContentInsets:PropTypes.bool, 
contentInset:EdgeInsetsPropType, 
contentOffset:PointPropType, 
onScroll:PropTypes.func, 
onScrollAnimationEnd:PropTypes.func, 
scrollEnabled:PropTypes.bool, 
scrollIndicatorInsets:EdgeInsetsPropType, 
showsHorizontalScrollIndicator:PropTypes.bool, 
showsVerticalScrollIndicator:PropTypes.bool, 
style:StyleSheetPropType(ViewStylePropTypes), 
scrollEventThrottle:PropTypes.number, 







bounces:PropTypes.bool, 





bouncesZoom:PropTypes.bool, 





alwaysBounceHorizontal:PropTypes.bool, 





alwaysBounceVertical:PropTypes.bool, 






centerContent:PropTypes.bool, 















contentContainerStyle:StyleSheetPropType(ViewStylePropTypes), 






decelerationRate:PropTypes.number, 




horizontal:PropTypes.bool, 




directionalLockEnabled:PropTypes.bool, 




canCancelContentTouches:PropTypes.bool, 








keyboardDismissMode:PropTypes.oneOf([
'none', 
'interactive', 
'on-drag']), 







keyboardShouldPersistTaps:PropTypes.bool, 



maximumZoomScale:PropTypes.number, 



minimumZoomScale:PropTypes.number, 





pagingEnabled:PropTypes.bool, 




scrollsToTop:PropTypes.bool, 







stickyHeaderIndices:PropTypes.arrayOf(PropTypes.number), 






removeClippedSubviews:PropTypes.bool, 



zoomScale:PropTypes.number}, 


mixins:[ScrollResponder.Mixin], 

getInitialState:function(){
return this.scrollResponderMixinGetInitialState();}, 


setNativeProps:function(props){
this.refs[SCROLLVIEW].setNativeProps(props);}, 








getScrollResponder:function(){
return this;}, 


getInnerViewNode:function(){
return React.findNodeHandle(this.refs[INNERVIEW]);}, 


scrollTo:function(destY, destX){
if(Platform.OS === 'android'){
RCTUIManager.dispatchViewManagerCommand(
React.findNodeHandle(this), 
RCTUIManager.RCTScrollView.Commands.scrollTo, 
[destX || 0, destY || 0]);}else 

{
RCTUIManager.scrollTo(
React.findNodeHandle(this), 
destX || 0, 
destY || 0);}}, 




scrollWithoutAnimationTo:function(destY, destX){
RCTUIManager.scrollWithoutAnimationTo(
React.findNodeHandle(this), 
destX || 0, 
destY || 0);}, 



render:function(){
var contentContainerStyle=[
this.props.horizontal && styles.contentContainerHorizontal, 
this.props.contentContainerStyle];

if(__DEV__ && this.props.style){
var style=flattenStyle(this.props.style);
var childLayoutProps=['alignItems', 'justifyContent'].
filter(function(prop){return style && style[prop] !== undefined;});
invariant(
childLayoutProps.length === 0, 
'ScrollView child layout (' + JSON.stringify(childLayoutProps) + 
') must by applied through the contentContainerStyle prop.');}


if(__DEV__){
if(this.props.onScroll && !this.props.scrollEventThrottle){
var onScroll=this.props.onScroll;
this.props.onScroll = function(){
console.log(
'You specified `onScroll` on a <ScrollView> but not ' + 
'`scrollEventThrottle`. You will only receive one event. ' + 
'Using `16` you get all the events but be aware that it may ' + 
'cause frame drops, use a bigger number if you don\'t need as ' + 
'much precision.');

onScroll.apply(this, arguments);};}}




var contentContainer=
React.createElement(View, {
ref:INNERVIEW, 
style:contentContainerStyle, 
removeClippedSubviews:this.props.removeClippedSubviews}, 
this.props.children);


var alwaysBounceHorizontal=
this.props.alwaysBounceHorizontal !== undefined?
this.props.alwaysBounceHorizontal:
this.props.horizontal;

var alwaysBounceVertical=
this.props.alwaysBounceVertical !== undefined?
this.props.alwaysBounceVertical:
!this.props.horizontal;

var props=_extends({}, 
this.props, {
alwaysBounceHorizontal:alwaysBounceHorizontal, 
alwaysBounceVertical:alwaysBounceVertical, 
style:[styles.base, this.props.style], 
onTouchStart:this.scrollResponderHandleTouchStart, 
onTouchMove:this.scrollResponderHandleTouchMove, 
onTouchEnd:this.scrollResponderHandleTouchEnd, 
onScrollBeginDrag:this.scrollResponderHandleScrollBeginDrag, 
onScrollEndDrag:this.scrollResponderHandleScrollEndDrag, 
onMomentumScrollBegin:this.scrollResponderHandleMomentumScrollBegin, 
onMomentumScrollEnd:this.scrollResponderHandleMomentumScrollEnd, 
onStartShouldSetResponder:this.scrollResponderHandleStartShouldSetResponder, 
onStartShouldSetResponderCapture:this.scrollResponderHandleStartShouldSetResponderCapture, 
onScrollShouldSetResponder:this.scrollResponderHandleScrollShouldSetResponder, 
onScroll:this.scrollResponderHandleScroll, 
onResponderGrant:this.scrollResponderHandleResponderGrant, 
onResponderTerminationRequest:this.scrollResponderHandleTerminationRequest, 
onResponderTerminate:this.scrollResponderHandleTerminate, 
onResponderRelease:this.scrollResponderHandleResponderRelease, 
onResponderReject:this.scrollResponderHandleResponderReject});


var ScrollViewClass;
if(Platform.OS === 'ios'){
ScrollViewClass = RCTScrollView;}else 
if(Platform.OS === 'android'){
if(this.props.horizontal){
ScrollViewClass = AndroidHorizontalScrollView;}else 
{
ScrollViewClass = AndroidScrollView;}

var keyboardDismissModeConstants={
'none':RCTScrollViewConsts.KeyboardDismissMode.None, 
'interactive':RCTScrollViewConsts.KeyboardDismissMode.Interactive, 
'on-drag':RCTScrollViewConsts.KeyboardDismissMode.OnDrag};

props.keyboardDismissMode = props.keyboardDismissMode?
keyboardDismissModeConstants[props.keyboardDismissMode]:undefined;}

invariant(
ScrollViewClass !== undefined, 
'ScrollViewClass must not be undefined');


return (
React.createElement(ScrollViewClass, _extends({}, props, {ref:SCROLLVIEW}), 
contentContainer));}});





var styles=StyleSheet.create({
base:{
flex:1}, 

contentContainerHorizontal:{
alignSelf:'flex-start', 
flexDirection:'row'}});



var validAttributes=_extends({}, 
ReactNativeViewAttributes.UIView, {
alwaysBounceHorizontal:true, 
alwaysBounceVertical:true, 
automaticallyAdjustContentInsets:true, 
bounces:true, 
centerContent:true, 
contentInset:{diff:insetsDiffer}, 
contentOffset:{diff:pointsDiffer}, 
decelerationRate:true, 
horizontal:true, 
keyboardDismissMode:true, 
keyboardShouldPersistTaps:true, 
maximumZoomScale:true, 
minimumZoomScale:true, 
pagingEnabled:true, 
removeClippedSubviews:true, 
scrollEnabled:true, 
scrollIndicatorInsets:{diff:insetsDiffer}, 
scrollsToTop:true, 
showsHorizontalScrollIndicator:true, 
showsVerticalScrollIndicator:true, 
stickyHeaderIndices:{diff:deepDiffer}, 
scrollEventThrottle:true, 
zoomScale:true});


if(Platform.OS === 'android'){
var AndroidScrollView=createReactNativeComponentClass({
validAttributes:validAttributes, 
uiViewClassName:'RCTScrollView'});

var AndroidHorizontalScrollView=createReactNativeComponentClass({
validAttributes:validAttributes, 
uiViewClassName:'AndroidHorizontalScrollView'});}else 

if(Platform.OS === 'ios'){
var RCTScrollView=requireNativeComponent('RCTScrollView', ScrollView);}


module.exports = ScrollView;});
__d('PointPropType',["ReactPropTypes","createStrictShapeTypeChecker"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var PropTypes=require('ReactPropTypes');

var createStrictShapeTypeChecker=require('createStrictShapeTypeChecker');

var PointPropType=createStrictShapeTypeChecker({
x:PropTypes.number, 
y:PropTypes.number});


module.exports = PointPropType;});
__d('ScrollResponder',["NativeModules","RCTDeviceEventEmitter","React","Subscribable","TextInputState","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeModules=require('NativeModules');
var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var React=require('React');
var Subscribable=require('Subscribable');
var TextInputState=require('TextInputState');

var RCTUIManager=NativeModules.UIManager;
var RCTUIManagerDeprecated=NativeModules.UIManager;
var RCTScrollViewConsts=RCTUIManager.RCTScrollView.Constants;

var warning=require('warning');















































































var IS_ANIMATING_TOUCH_START_THRESHOLD_MS=16;










var ScrollResponderMixin={
mixins:[Subscribable.Mixin], 
statics:RCTScrollViewConsts, 
scrollResponderMixinGetInitialState:function(){
return {
isTouching:false, 
lastMomentumScrollBeginTime:0, 
lastMomentumScrollEndTime:0, 






observedScrollSinceBecomingResponder:false, 
becameResponderWhileAnimating:false};}, 






scrollResponderHandleScrollShouldSetResponder:function(){
return this.state.isTouching;}, 



























scrollResponderHandleStartShouldSetResponder:function(){
return false;}, 













scrollResponderHandleStartShouldSetResponderCapture:function(e){

var currentlyFocusedTextInput=TextInputState.currentlyFocusedField();
if(!this.props.keyboardShouldPersistTaps && 
currentlyFocusedTextInput != null && 
e.target !== currentlyFocusedTextInput){
return true;}

return this.scrollResponderIsAnimating();}, 












scrollResponderHandleResponderReject:function(){
warning(false, 'ScrollView doesn\'t take rejection well - scrolls anyway');}, 

















scrollResponderHandleTerminationRequest:function(){
return !this.state.observedScrollSinceBecomingResponder;}, 







scrollResponderHandleTouchEnd:function(e){
var nativeEvent=e.nativeEvent;
this.state.isTouching = nativeEvent.touches.length !== 0;
this.props.onTouchEnd && this.props.onTouchEnd(e);}, 





scrollResponderHandleResponderRelease:function(e){
this.props.onResponderRelease && this.props.onResponderRelease(e);



var currentlyFocusedTextInput=TextInputState.currentlyFocusedField();
if(!this.props.keyboardShouldPersistTaps && 
currentlyFocusedTextInput != null && 
e.target !== currentlyFocusedTextInput && 
!this.state.observedScrollSinceBecomingResponder && 
!this.state.becameResponderWhileAnimating){
this.props.onScrollResponderKeyboardDismissed && 
this.props.onScrollResponderKeyboardDismissed(e);
TextInputState.blurTextInput(currentlyFocusedTextInput);}}, 



scrollResponderHandleScroll:function(e){
this.state.observedScrollSinceBecomingResponder = true;
this.props.onScroll && this.props.onScroll(e);}, 





scrollResponderHandleResponderGrant:function(e){
this.state.observedScrollSinceBecomingResponder = false;
this.props.onResponderGrant && this.props.onResponderGrant(e);
this.state.becameResponderWhileAnimating = this.scrollResponderIsAnimating();}, 









scrollResponderHandleScrollBeginDrag:function(e){
this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(e);}, 





scrollResponderHandleScrollEndDrag:function(e){
this.props.onScrollEndDrag && this.props.onScrollEndDrag(e);}, 





scrollResponderHandleMomentumScrollBegin:function(e){
this.state.lastMomentumScrollBeginTime = Date.now();
this.props.onMomentumScrollBegin && this.props.onMomentumScrollBegin(e);}, 





scrollResponderHandleMomentumScrollEnd:function(e){
this.state.lastMomentumScrollEndTime = Date.now();
this.props.onMomentumScrollEnd && this.props.onMomentumScrollEnd(e);}, 













scrollResponderHandleTouchStart:function(e){
this.state.isTouching = true;
this.props.onTouchStart && this.props.onTouchStart(e);}, 













scrollResponderHandleTouchMove:function(e){
this.props.onTouchMove && this.props.onTouchMove(e);}, 







scrollResponderIsAnimating:function(){
var now=Date.now();
var timeSinceLastMomentumScrollEnd=now - this.state.lastMomentumScrollEndTime;
var isAnimating=timeSinceLastMomentumScrollEnd < IS_ANIMATING_TOUCH_START_THRESHOLD_MS || 
this.state.lastMomentumScrollEndTime < this.state.lastMomentumScrollBeginTime;
return isAnimating;}, 







scrollResponderScrollTo:function(offsetX, offsetY){
RCTUIManagerDeprecated.scrollTo(React.findNodeHandle(this), offsetX, offsetY);}, 






scrollResponderZoomTo:function(rect){
RCTUIManagerDeprecated.zoomToRect(React.findNodeHandle(this), rect);}, 












scrollResponderScrollNativeHandleToKeyboard:function(nodeHandle, additionalOffset, preventNegativeScrollOffset){
this.additionalScrollOffset = additionalOffset || 0;
this.preventNegativeScrollOffset = !!preventNegativeScrollOffset;
RCTUIManager.measureLayout(
nodeHandle, 
React.findNodeHandle(this), 
this.scrollResponderTextInputFocusError, 
this.scrollResponderInputMeasureAndScrollToKeyboard);}, 













scrollResponderInputMeasureAndScrollToKeyboard:function(left, top, width, height){
if(this.keyboardWillOpenTo){
var scrollOffsetY=
top - this.keyboardWillOpenTo.endCoordinates.screenY + height + 
this.additionalScrollOffset;





if(this.preventNegativeScrollOffset){
scrollOffsetY = Math.max(0, scrollOffsetY);}

this.scrollResponderScrollTo(0, scrollOffsetY);}

this.additionalOffset = 0;
this.preventNegativeScrollOffset = false;}, 


scrollResponderTextInputFocusError:function(e){
console.error('Error measuring text field: ', e);}, 








componentWillMount:function(){
this.keyboardWillOpenTo = null;
this.additionalScrollOffset = 0;
this.addListenerOn(RCTDeviceEventEmitter, 'keyboardWillShow', this.scrollResponderKeyboardWillShow);
this.addListenerOn(RCTDeviceEventEmitter, 'keyboardWillHide', this.scrollResponderKeyboardWillHide);
this.addListenerOn(RCTDeviceEventEmitter, 'keyboardDidShow', this.scrollResponderKeyboardDidShow);
this.addListenerOn(RCTDeviceEventEmitter, 'keyboardDidHide', this.scrollResponderKeyboardDidHide);}, 






























scrollResponderKeyboardWillShow:function(e){
this.keyboardWillOpenTo = e;
this.props.onKeyboardWillShow && this.props.onKeyboardWillShow(e);}, 


scrollResponderKeyboardWillHide:function(e){
this.keyboardWillOpenTo = null;
this.props.onKeyboardWillHide && this.props.onKeyboardWillHide(e);}, 


scrollResponderKeyboardDidShow:function(){
this.keyboardWillOpenTo = null;
this.props.onKeyboardDidShow && this.props.onKeyboardDidShow();}, 


scrollResponderKeyboardDidHide:function(){
this.keyboardWillOpenTo = null;
this.props.onKeyboardDidHide && this.props.onKeyboardDidHide();}};




var ScrollResponder={
Mixin:ScrollResponderMixin};


module.exports = ScrollResponder;});
__d('Subscribable',["EventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';






















var Subscribable={};

Subscribable.Mixin = {

componentWillMount:function(){
this._subscribableSubscriptions = [];}, 


componentWillUnmount:function(){
this._subscribableSubscriptions.forEach(
function(subscription){return subscription.remove();});

this._subscribableSubscriptions = null;}, 















addListenerOn:function(
eventEmitter, 
eventType, 
listener, 
context)
{
this._subscribableSubscriptions.push(
eventEmitter.addListener(eventType, listener, context));}};




module.exports = Subscribable;});
__d('StaticRenderer',["React"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var React=require('React');

var StaticRenderer=React.createClass({displayName:'StaticRenderer', 
propTypes:{
shouldUpdate:React.PropTypes.bool.isRequired, 
render:React.PropTypes.func.isRequired}, 


shouldComponentUpdate:function(nextProps){
return nextProps.shouldUpdate;}, 


render:function(){
return this.props.render();}});



module.exports = StaticRenderer;});
__d('react-timer-mixin/TimerMixin',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';










var setter=function(_setter, _clearer, array){
return function(callback, delta){
var id=_setter((function(){
_clearer.call(this, id);
callback.apply(this, arguments);}).
bind(this), delta);

if(!this[array]){
this[array] = [id];}else 
{
this[array].push(id);}

return id;};};



var clearer=function(_clearer, array){
return function(id){
if(this[array]){
var index=this[array].indexOf(id);
if(index !== -1){
this[array].splice(index, 1);}}


_clearer(id);};};



var _timeouts='TimerMixin_timeouts';
var _clearTimeout=clearer(clearTimeout, _timeouts);
var _setTimeout=setter(setTimeout, _clearTimeout, _timeouts);

var _intervals='TimerMixin_intervals';
var _clearInterval=clearer(clearInterval, _intervals);
var _setInterval=setter(setInterval, function(){}, _intervals);

var _immediates='TimerMixin_immediates';
var _clearImmediate=clearer(clearImmediate, _immediates);
var _setImmediate=setter(setImmediate, _clearImmediate, _immediates);

var _rafs='TimerMixin_rafs';
var _cancelAnimationFrame=clearer(cancelAnimationFrame, _rafs);
var _requestAnimationFrame=setter(requestAnimationFrame, _cancelAnimationFrame, _rafs);

var TimerMixin={
componentWillUnmount:function(){
this[_timeouts] && this[_timeouts].forEach(this.clearTimeout);
this[_intervals] && this[_intervals].forEach(this.clearInterval);
this[_immediates] && this[_immediates].forEach(this.clearImmediate);
this[_rafs] && this[_rafs].forEach(this.cancelAnimationFrame);}, 


setTimeout:_setTimeout, 
clearTimeout:_clearTimeout, 

setInterval:_setInterval, 
clearInterval:_clearInterval, 

setImmediate:_setImmediate, 
clearImmediate:_clearImmediate, 

requestAnimationFrame:_requestAnimationFrame, 
cancelAnimationFrame:_cancelAnimationFrame};


module.exports = TimerMixin;});
__d('MapView',["EdgeInsetsPropType","NativeMethodsMixin","Platform","React","ReactNativeViewAttributes","View","createReactNativeComponentClass","deepDiffer","insetsDiffer","merge","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var EdgeInsetsPropType=require('EdgeInsetsPropType');
var NativeMethodsMixin=require('NativeMethodsMixin');
var Platform=require('Platform');
var React=require('React');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var View=require('View');

var createReactNativeComponentClass=require('createReactNativeComponentClass');
var deepDiffer=require('deepDiffer');
var insetsDiffer=require('insetsDiffer');
var merge=require('merge');
var requireNativeComponent=require('requireNativeComponent');









var MapView=React.createClass({displayName:'MapView', 
mixins:[NativeMethodsMixin], 

propTypes:{




style:View.propTypes.style, 









showsUserLocation:React.PropTypes.bool, 





zoomEnabled:React.PropTypes.bool, 








rotateEnabled:React.PropTypes.bool, 








pitchEnabled:React.PropTypes.bool, 





scrollEnabled:React.PropTypes.bool, 








mapType:React.PropTypes.oneOf([
'standard', 
'satellite', 
'hybrid']), 








region:React.PropTypes.shape({



latitude:React.PropTypes.number.isRequired, 
longitude:React.PropTypes.number.isRequired, 





latitudeDelta:React.PropTypes.number.isRequired, 
longitudeDelta:React.PropTypes.number.isRequired}), 





annotations:React.PropTypes.arrayOf(React.PropTypes.shape({



latitude:React.PropTypes.number.isRequired, 
longitude:React.PropTypes.number.isRequired, 




title:React.PropTypes.string, 
subtitle:React.PropTypes.string})), 





maxDelta:React.PropTypes.number, 




minDelta:React.PropTypes.number, 





legalLabelInsets:EdgeInsetsPropType, 




onRegionChange:React.PropTypes.func, 




onRegionChangeComplete:React.PropTypes.func}, 


_onChange:function(event){
if(event.nativeEvent.continuous){
this.props.onRegionChange && 
this.props.onRegionChange(event.nativeEvent.region);}else 
{
this.props.onRegionChangeComplete && 
this.props.onRegionChangeComplete(event.nativeEvent.region);}}, 



render:function(){
return React.createElement(RCTMap, _extends({}, this.props, {onChange:this._onChange}));}});



if(Platform.OS === 'android'){
var RCTMap=createReactNativeComponentClass({
validAttributes:merge(
ReactNativeViewAttributes.UIView, {
showsUserLocation:true, 
zoomEnabled:true, 
rotateEnabled:true, 
pitchEnabled:true, 
scrollEnabled:true, 
region:{diff:deepDiffer}, 
annotations:{diff:deepDiffer}, 
maxDelta:true, 
minDelta:true, 
legalLabelInsets:{diff:insetsDiffer}}), 


uiViewClassName:'RCTMap'});}else 

{
var RCTMap=requireNativeComponent('RCTMap', MapView);}


module.exports = MapView;});
__d('Navigator',["NativeModules","Dimensions","InteractionMixin","NavigatorBreadcrumbNavigationBar","NavigatorNavigationBar","NavigatorSceneConfigs","PanResponder","Platform","React","StaticContainer.react","StyleSheet","Subscribable","react-timer-mixin/TimerMixin","View","clamp","flattenStyle","invariant","rebound/rebound"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};




























var AnimationsDebugModule=require('NativeModules').AnimationsDebugModule;
var Dimensions=require('Dimensions');
var InteractionMixin=require('InteractionMixin');
var NavigatorBreadcrumbNavigationBar=require('NavigatorBreadcrumbNavigationBar');
var NavigatorNavigationBar=require('NavigatorNavigationBar');
var NavigatorSceneConfigs=require('NavigatorSceneConfigs');
var PanResponder=require('PanResponder');
var Platform=require('Platform');
var React=require('React');
var StaticContainer=require('StaticContainer.react');
var StyleSheet=require('StyleSheet');
var Subscribable=require('Subscribable');
var TimerMixin=require('react-timer-mixin/TimerMixin');
var View=require('View');

var clamp=require('clamp');
var flattenStyle=require('flattenStyle');
var invariant=require('invariant');
var rebound=require('rebound/rebound');

var PropTypes=React.PropTypes;




var SCREEN_WIDTH=Dimensions.get('window').width;
var SCREEN_HEIGHT=Dimensions.get('window').height;
var SCENE_DISABLED_NATIVE_PROPS={
style:{
left:SCREEN_WIDTH, 
opacity:0}};



var __uid=0;
function getuid(){
return __uid++;}



var styles=StyleSheet.create({
container:{
flex:1, 
overflow:'hidden'}, 

defaultSceneStyle:{
position:'absolute', 
left:0, 
right:0, 
bottom:0, 
top:0}, 

baseScene:{
position:'absolute', 
overflow:'hidden', 
left:0, 
right:0, 
bottom:0, 
top:0}, 

disabledScene:{
left:SCREEN_WIDTH}, 

transitioner:{
flex:1, 
backgroundColor:'transparent', 
overflow:'hidden'}});



var GESTURE_ACTIONS=[
'pop', 
'jumpBack', 
'jumpForward'];





























































var Navigator=React.createClass({displayName:'Navigator', 

propTypes:{









configureScene:PropTypes.func, 










renderScene:PropTypes.func.isRequired, 







initialRoute:PropTypes.object, 






initialRouteStack:PropTypes.arrayOf(PropTypes.object), 




onWillFocus:PropTypes.func, 





onDidFocus:PropTypes.func, 




onItemRef:PropTypes.func, 





navigationBar:PropTypes.node, 




navigator:PropTypes.object, 




sceneStyle:View.propTypes.style}, 


statics:{
BreadcrumbNavigationBar:NavigatorBreadcrumbNavigationBar, 
NavigationBar:NavigatorNavigationBar, 
SceneConfigs:NavigatorSceneConfigs}, 


mixins:[TimerMixin, InteractionMixin, Subscribable.Mixin], 

getDefaultProps:function(){
return {
configureScene:function(){return NavigatorSceneConfigs.PushFromRight;}, 
sceneStyle:styles.defaultSceneStyle};}, 



getInitialState:function(){var _this=this;
var routeStack=this.props.initialRouteStack || [this.props.initialRoute];
invariant(
routeStack.length >= 1, 
'Navigator requires props.initialRoute or props.initialRouteStack.');

var initialRouteIndex=routeStack.length - 1;
if(this.props.initialRoute){
initialRouteIndex = routeStack.indexOf(this.props.initialRoute);
invariant(
initialRouteIndex !== -1, 
'initialRoute is not in initialRouteStack.');}


return {
sceneConfigStack:routeStack.map(
function(route){return _this.props.configureScene(route);}), 

idStack:routeStack.map(function(){return getuid();}), 
routeStack:routeStack, 


updatingRangeStart:0, 
updatingRangeLength:routeStack.length, 
presentedIndex:initialRouteIndex, 
transitionFromIndex:null, 
activeGesture:null, 
pendingGestureProgress:null, 
transitionQueue:[]};}, 



componentWillMount:function(){var _this2=this;
this._subRouteFocus = [];
this.parentNavigator = this.props.navigator;
this._handlers = {};
this.springSystem = new rebound.SpringSystem();
this.spring = this.springSystem.createSpring();
this.spring.setRestSpeedThreshold(0.05);
this.spring.setCurrentValue(0).setAtRest();
this.spring.addListener({
onSpringEndStateChange:function(){
if(!_this2._interactionHandle){
_this2._interactionHandle = _this2.createInteractionHandle();}}, 


onSpringUpdate:function(){
_this2._handleSpringUpdate();}, 

onSpringAtRest:function(){
_this2._completeTransition();}});


this.panGesture = PanResponder.create({
onMoveShouldSetPanResponder:this._handleMoveShouldSetPanResponder, 
onPanResponderGrant:this._handlePanResponderGrant, 
onPanResponderRelease:this._handlePanResponderRelease, 
onPanResponderMove:this._handlePanResponderMove, 
onPanResponderTerminate:this._handlePanResponderTerminate});

this._itemRefs = {};
this._interactionHandle = null;
this._emitWillFocus(this.state.routeStack[this.state.presentedIndex]);}, 


componentDidMount:function(){
this._handleSpringUpdate();
this._emitDidFocus(this.state.routeStack[this.state.presentedIndex]);}, 


componentWillUnmount:function(){}, 










immediatelyResetRouteStack:function(nextRouteStack){var _this3=this;
var destIndex=nextRouteStack.length - 1;
this.setState({
idStack:nextRouteStack.map(getuid), 
routeStack:nextRouteStack, 
sceneConfigStack:nextRouteStack.map(
this.props.configureScene), 

updatingRangeStart:0, 
updatingRangeLength:nextRouteStack.length, 
presentedIndex:destIndex, 
activeGesture:null, 
transitionFromIndex:null, 
transitionQueue:[]}, 
function(){
_this3._handleSpringUpdate();});}, 



_transitionTo:function(destIndex, velocity, jumpSpringTo, cb){
if(destIndex === this.state.presentedIndex){
return;}

if(this.state.transitionFromIndex !== null){
this.state.transitionQueue.push({
destIndex:destIndex, 
velocity:velocity, 
cb:cb});

return;}

this.state.transitionFromIndex = this.state.presentedIndex;
this.state.presentedIndex = destIndex;
this.state.transitionCb = cb;
this._onAnimationStart();
if(AnimationsDebugModule){
AnimationsDebugModule.startRecordingFps();}

var sceneConfig=this.state.sceneConfigStack[this.state.transitionFromIndex] || 
this.state.sceneConfigStack[this.state.presentedIndex];
invariant(
sceneConfig, 
'Cannot configure scene at index ' + this.state.transitionFromIndex);

if(jumpSpringTo != null){
this.spring.setCurrentValue(jumpSpringTo);}

this.spring.setOvershootClampingEnabled(true);
this.spring.getSpringConfig().friction = sceneConfig.springFriction;
this.spring.getSpringConfig().tension = sceneConfig.springTension;
this.spring.setVelocity(velocity || sceneConfig.defaultTransitionVelocity);
this.spring.setEndValue(1);
this._emitWillFocus(this.state.routeStack[this.state.presentedIndex]);}, 






_handleSpringUpdate:function(){

if(this.state.transitionFromIndex != null){
this._transitionBetween(
this.state.transitionFromIndex, 
this.state.presentedIndex, 
this.spring.getCurrentValue());}else 

if(this.state.activeGesture != null){
var presentedToIndex=this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
if(presentedToIndex > -1){
this._transitionBetween(
this.state.presentedIndex, 
presentedToIndex, 
this.spring.getCurrentValue());}}}, 








_completeTransition:function(){
if(this.spring.getCurrentValue() !== 1 && this.spring.getCurrentValue() !== 0){


if(this.state.pendingGestureProgress){
this.state.pendingGestureProgress = null;}

return;}

this._onAnimationEnd();
var presentedIndex=this.state.presentedIndex;
var didFocusRoute=this._subRouteFocus[presentedIndex] || this.state.routeStack[presentedIndex];
this._emitDidFocus(didFocusRoute);
if(AnimationsDebugModule){
AnimationsDebugModule.stopRecordingFps(Date.now());}

this.state.transitionFromIndex = null;
this.spring.setCurrentValue(0).setAtRest();
this._hideScenes();
if(this.state.transitionCb){
this.state.transitionCb();
this.state.transitionCb = null;}

if(this._interactionHandle){
this.clearInteractionHandle(this._interactionHandle);
this._interactionHandle = null;}

if(this.state.pendingGestureProgress){


var gestureToIndex=this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
this._enableScene(gestureToIndex);
this.spring.setEndValue(this.state.pendingGestureProgress);
return;}

if(this.state.transitionQueue.length){
var queuedTransition=this.state.transitionQueue.shift();
this._enableScene(queuedTransition.destIndex);
this._transitionTo(
queuedTransition.destIndex, 
queuedTransition.velocity, 
null, 
queuedTransition.cb);}}, 




_emitDidFocus:function(route){
if(this.props.onDidFocus){
this.props.onDidFocus(route);}}, 



_emitWillFocus:function(route){
var navBar=this._navBar;
if(navBar && navBar.handleWillFocus){
navBar.handleWillFocus(route);}

if(this.props.onWillFocus){
this.props.onWillFocus(route);}}, 






_hideScenes:function(){
var gesturingToIndex=null;
if(this.state.activeGesture){
gesturingToIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);}

for(var i=0; i < this.state.routeStack.length; i++) {
if(i === this.state.presentedIndex || 
i === this.state.transitionFromIndex || 
i === gesturingToIndex){
continue;}

this._disableScene(i);}}, 






_disableScene:function(sceneIndex){
this.refs['scene_' + sceneIndex] && 
this.refs['scene_' + sceneIndex].setNativeProps(SCENE_DISABLED_NATIVE_PROPS);}, 





_enableScene:function(sceneIndex){

var sceneStyle=flattenStyle([styles.baseScene, this.props.sceneStyle]);

var enabledSceneNativeProps={
left:sceneStyle.left};

if(sceneIndex !== this.state.transitionFromIndex && 
sceneIndex !== this.state.presentedIndex){


enabledSceneNativeProps.opacity = 0;}

this.refs['scene_' + sceneIndex] && 
this.refs['scene_' + sceneIndex].setNativeProps(enabledSceneNativeProps);}, 


_onAnimationStart:function(){
var fromIndex=this.state.presentedIndex;
var toIndex=this.state.presentedIndex;
if(this.state.transitionFromIndex != null){
fromIndex = this.state.transitionFromIndex;}else 
if(this.state.activeGesture){
toIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);}

this._setRenderSceneToHarwareTextureAndroid(fromIndex, true);
this._setRenderSceneToHarwareTextureAndroid(toIndex, true);
var navBar=this._navBar;
if(navBar && navBar.onAnimationStart){
navBar.onAnimationStart(fromIndex, toIndex);}}, 



_onAnimationEnd:function(){
var max=this.state.routeStack.length - 1;
for(var index=0; index <= max; index++) {
this._setRenderSceneToHarwareTextureAndroid(index, false);}


var navBar=this._navBar;
if(navBar && navBar.onAnimationEnd){
navBar.onAnimationEnd();}}, 



_setRenderSceneToHarwareTextureAndroid:function(sceneIndex, shouldRenderToHardwareTexture){
var viewAtIndex=this.refs['scene_' + sceneIndex];
if(viewAtIndex === null || viewAtIndex === undefined){
return;}

viewAtIndex.setNativeProps({renderToHardwareTextureAndroid:shouldRenderToHardwareTexture});}, 


_handleTouchStart:function(){
this._eligibleGestures = GESTURE_ACTIONS;}, 


_handleMoveShouldSetPanResponder:function(e, gestureState){
var sceneConfig=this.state.sceneConfigStack[this.state.presentedIndex];
this._expectingGestureGrant = this._matchGestureAction(this._eligibleGestures, sceneConfig.gestures, gestureState);
return !!this._expectingGestureGrant;}, 


_doesGestureOverswipe:function(gestureName){
var wouldOverswipeBack=this.state.presentedIndex <= 0 && (
gestureName === 'pop' || gestureName === 'jumpBack');
var wouldOverswipeForward=this.state.presentedIndex >= this.state.routeStack.length - 1 && 
gestureName === 'jumpForward';
return wouldOverswipeForward || wouldOverswipeBack;}, 


_handlePanResponderGrant:function(e, gestureState){
invariant(
this._expectingGestureGrant, 
'Responder granted unexpectedly.');

this._attachGesture(this._expectingGestureGrant);
this._onAnimationStart();
this._expectingGestureGrant = null;}, 


_deltaForGestureAction:function(gestureAction){
switch(gestureAction){
case 'pop':
case 'jumpBack':
return -1;
case 'jumpForward':
return 1;
default:
invariant(false, 'Unsupported gesture action ' + gestureAction);
return;}}, 



_handlePanResponderRelease:function(e, gestureState){var _this4=this;
var sceneConfig=this.state.sceneConfigStack[this.state.presentedIndex];
var releaseGestureAction=this.state.activeGesture;
if(!releaseGestureAction){

return;}

var releaseGesture=sceneConfig.gestures[releaseGestureAction];
var destIndex=this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
if(this.spring.getCurrentValue() === 0){

this.spring.setCurrentValue(0).setAtRest();
this._completeTransition();
return;}

var isTravelVertical=releaseGesture.direction === 'top-to-bottom' || releaseGesture.direction === 'bottom-to-top';
var isTravelInverted=releaseGesture.direction === 'right-to-left' || releaseGesture.direction === 'bottom-to-top';
var velocity, gestureDistance;
if(isTravelVertical){
velocity = isTravelInverted?-gestureState.vy:gestureState.vy;
gestureDistance = isTravelInverted?-gestureState.dy:gestureState.dy;}else 
{
velocity = isTravelInverted?-gestureState.vx:gestureState.vx;
gestureDistance = isTravelInverted?-gestureState.dx:gestureState.dx;}

var transitionVelocity=clamp(-10, velocity, 10);
if(Math.abs(velocity) < releaseGesture.notMoving){

var hasGesturedEnoughToComplete=gestureDistance > releaseGesture.fullDistance * releaseGesture.stillCompletionRatio;
transitionVelocity = hasGesturedEnoughToComplete?releaseGesture.snapVelocity:-releaseGesture.snapVelocity;}

if(transitionVelocity < 0 || this._doesGestureOverswipe(releaseGestureAction)){


if(this.state.transitionFromIndex == null){

var transitionBackToPresentedIndex=this.state.presentedIndex;

this.state.presentedIndex = destIndex;
this._transitionTo(
transitionBackToPresentedIndex, 
-transitionVelocity, 
1 - this.spring.getCurrentValue());}}else 


{

this._transitionTo(
destIndex, 
transitionVelocity, 
null, 
function(){
if(releaseGestureAction === 'pop'){
_this4._cleanScenesPastIndex(destIndex);}});}




this._detachGesture();}, 


_handlePanResponderTerminate:function(e, gestureState){
var destIndex=this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
this._detachGesture();
var transitionBackToPresentedIndex=this.state.presentedIndex;

this.state.presentedIndex = destIndex;
this._transitionTo(
transitionBackToPresentedIndex, 
null, 
1 - this.spring.getCurrentValue());}, 



_attachGesture:function(gestureId){
this.state.activeGesture = gestureId;
var gesturingToIndex=this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
this._enableScene(gesturingToIndex);}, 


_detachGesture:function(){
this.state.activeGesture = null;
this.state.pendingGestureProgress = null;
this._hideScenes();}, 


_handlePanResponderMove:function(e, gestureState){
var sceneConfig=this.state.sceneConfigStack[this.state.presentedIndex];
if(this.state.activeGesture){
var gesture=sceneConfig.gestures[this.state.activeGesture];
return this._moveAttachedGesture(gesture, gestureState);}

var matchedGesture=this._matchGestureAction(GESTURE_ACTIONS, sceneConfig.gestures, gestureState);
if(matchedGesture){
this._attachGesture(matchedGesture);}}, 



_moveAttachedGesture:function(gesture, gestureState){
var isTravelVertical=gesture.direction === 'top-to-bottom' || gesture.direction === 'bottom-to-top';
var isTravelInverted=gesture.direction === 'right-to-left' || gesture.direction === 'bottom-to-top';
var distance=isTravelVertical?gestureState.dy:gestureState.dx;
distance = isTravelInverted?-distance:distance;
var gestureDetectMovement=gesture.gestureDetectMovement;
var nextProgress=(distance - gestureDetectMovement) / (
gesture.fullDistance - gestureDetectMovement);
if(nextProgress < 0 && gesture.isDetachable){
var gesturingToIndex=this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
this._transitionBetween(this.state.presentedIndex, gesturingToIndex, 0);
this._detachGesture();
if(this.state.pendingGestureProgress != null){
this.spring.setCurrentValue(0);}

return;}

if(this._doesGestureOverswipe(this.state.activeGesture)){
var frictionConstant=gesture.overswipe.frictionConstant;
var frictionByDistance=gesture.overswipe.frictionByDistance;
var frictionRatio=1 / (frictionConstant + Math.abs(nextProgress) * frictionByDistance);
nextProgress *= frictionRatio;}

nextProgress = clamp(0, nextProgress, 1);
if(this.state.transitionFromIndex != null){
this.state.pendingGestureProgress = nextProgress;}else 
if(this.state.pendingGestureProgress){
this.spring.setEndValue(nextProgress);}else 
{
this.spring.setCurrentValue(nextProgress);}}, 



_matchGestureAction:function(eligibleGestures, gestures, gestureState){var _this5=this;
if(!gestures){
return null;}

var matchedGesture=null;
eligibleGestures.some(function(gestureName, gestureIndex){
var gesture=gestures[gestureName];
if(!gesture){
return;}

if(gesture.overswipe == null && _this5._doesGestureOverswipe(gestureName)){

return false;}

var isTravelVertical=gesture.direction === 'top-to-bottom' || gesture.direction === 'bottom-to-top';
var isTravelInverted=gesture.direction === 'right-to-left' || gesture.direction === 'bottom-to-top';
var currentLoc=isTravelVertical?gestureState.moveY:gestureState.moveX;
var travelDist=isTravelVertical?gestureState.dy:gestureState.dx;
var oppositeAxisTravelDist=
isTravelVertical?gestureState.dx:gestureState.dy;
var edgeHitWidth=gesture.edgeHitWidth;
if(isTravelInverted){
currentLoc = -currentLoc;
travelDist = -travelDist;
oppositeAxisTravelDist = -oppositeAxisTravelDist;
edgeHitWidth = isTravelVertical?
-(SCREEN_HEIGHT - edgeHitWidth):
-(SCREEN_WIDTH - edgeHitWidth);}

var moveStartedInRegion=gesture.edgeHitWidth == null || 
currentLoc < edgeHitWidth;
if(!moveStartedInRegion){
return false;}

var moveTravelledFarEnough=travelDist >= gesture.gestureDetectMovement;
if(!moveTravelledFarEnough){
return false;}

var directionIsCorrect=Math.abs(travelDist) > Math.abs(oppositeAxisTravelDist) * gesture.directionRatio;
if(directionIsCorrect){
matchedGesture = gestureName;
return true;}else 
{
_this5._eligibleGestures = _this5._eligibleGestures.slice().splice(gestureIndex, 1);}});


return matchedGesture;}, 


_transitionSceneStyle:function(fromIndex, toIndex, progress, index){
var viewAtIndex=this.refs['scene_' + index];
if(viewAtIndex === null || viewAtIndex === undefined){
return;}


var sceneConfigIndex=fromIndex < toIndex?toIndex:fromIndex;
var sceneConfig=this.state.sceneConfigStack[sceneConfigIndex];

if(!sceneConfig){
sceneConfig = this.state.sceneConfigStack[sceneConfigIndex - 1];}

var styleToUse={};
var useFn=index < fromIndex || index < toIndex?
sceneConfig.animationInterpolators.out:
sceneConfig.animationInterpolators.into;
var directionAdjustedProgress=fromIndex < toIndex?progress:1 - progress;
var didChange=useFn(styleToUse, directionAdjustedProgress);
if(didChange){
viewAtIndex.setNativeProps({style:styleToUse});}}, 



_transitionBetween:function(fromIndex, toIndex, progress){
this._transitionSceneStyle(fromIndex, toIndex, progress, fromIndex);
this._transitionSceneStyle(fromIndex, toIndex, progress, toIndex);
var navBar=this._navBar;
if(navBar && navBar.updateProgress){
navBar.updateProgress(progress, fromIndex, toIndex);}}, 



_handleResponderTerminationRequest:function(){
return false;}, 


_resetUpdatingRange:function(){
this.state.updatingRangeStart = 0;
this.state.updatingRangeLength = this.state.routeStack.length;}, 


_getDestIndexWithinBounds:function(n){
var currentIndex=this.state.presentedIndex;
var destIndex=currentIndex + n;
invariant(
destIndex >= 0, 
'Cannot jump before the first route.');

var maxIndex=this.state.routeStack.length - 1;
invariant(
maxIndex >= destIndex, 
'Cannot jump past the last route.');

return destIndex;}, 


_jumpN:function(n){var _this6=this;
var destIndex=this._getDestIndexWithinBounds(n);
var requestTransitionAndResetUpdatingRange=function(){
_this6._enableScene(destIndex);
_this6._transitionTo(destIndex);
_this6._resetUpdatingRange();};

this.setState({
updatingRangeStart:destIndex, 
updatingRangeLength:1}, 
requestTransitionAndResetUpdatingRange);}, 


jumpTo:function(route){
var destIndex=this.state.routeStack.indexOf(route);
invariant(
destIndex !== -1, 
'Cannot jump to route that is not in the route stack');

this._jumpN(destIndex - this.state.presentedIndex);}, 


jumpForward:function(){
this._jumpN(1);}, 


jumpBack:function(){
this._jumpN(-1);}, 


push:function(route){var _this7=this;
invariant(!!route, 'Must supply route to push');
var activeLength=this.state.presentedIndex + 1;
var activeStack=this.state.routeStack.slice(0, activeLength);
var activeIDStack=this.state.idStack.slice(0, activeLength);
var activeAnimationConfigStack=this.state.sceneConfigStack.slice(0, activeLength);
var nextStack=activeStack.concat([route]);
var destIndex=nextStack.length - 1;
var nextIDStack=activeIDStack.concat([getuid()]);
var nextAnimationConfigStack=activeAnimationConfigStack.concat([
this.props.configureScene(route)]);

var requestTransitionAndResetUpdatingRange=function(){
_this7._enableScene(destIndex);
_this7._transitionTo(destIndex);
_this7._resetUpdatingRange();};

this.setState({
idStack:nextIDStack, 
routeStack:nextStack, 
sceneConfigStack:nextAnimationConfigStack, 
updatingRangeStart:nextStack.length - 1, 
updatingRangeLength:1}, 
requestTransitionAndResetUpdatingRange);}, 


_popN:function(n){var _this8=this;
if(n === 0){
return;}

invariant(
this.state.presentedIndex - n >= 0, 
'Cannot pop below zero');

var popIndex=this.state.presentedIndex - n;
this._enableScene(popIndex);
this._transitionTo(
popIndex, 
null, 
null, 
function(){
_this8._cleanScenesPastIndex(popIndex);});}, 




pop:function(){
this._popN(1);}, 








replaceAtIndex:function(route, index, cb){var _this9=this;
invariant(!!route, 'Must supply route to replace');
if(index < 0){
index += this.state.routeStack.length;}


if(this.state.routeStack.length <= index){
return;}




var nextIDStack=this.state.idStack.slice();
var nextRouteStack=this.state.routeStack.slice();
var nextAnimationModeStack=this.state.sceneConfigStack.slice();
nextIDStack[index] = getuid();
nextRouteStack[index] = route;
nextAnimationModeStack[index] = this.props.configureScene(route);

this.setState({
idStack:nextIDStack, 
routeStack:nextRouteStack, 
sceneConfigStack:nextAnimationModeStack, 
updatingRangeStart:index, 
updatingRangeLength:1}, 
function(){
_this9._resetUpdatingRange();
if(index === _this9.state.presentedIndex){
_this9._emitWillFocus(route);
_this9._emitDidFocus(route);}

cb && cb();});}, 






replace:function(route){
this.replaceAtIndex(route, this.state.presentedIndex);}, 





replacePrevious:function(route){
this.replaceAtIndex(route, this.state.presentedIndex - 1);}, 


popToTop:function(){
this.popToRoute(this.state.routeStack[0]);}, 


popToRoute:function(route){
var indexOfRoute=this.state.routeStack.indexOf(route);
invariant(
indexOfRoute !== -1, 
'Calling popToRoute for a route that doesn\'t exist!');

var numToPop=this.state.presentedIndex - indexOfRoute;
this._popN(numToPop);}, 


replacePreviousAndPop:function(route){
if(this.state.routeStack.length < 2){
return;}

this.replacePrevious(route);
this.pop();}, 


resetTo:function(route){var _this10=this;
invariant(!!route, 'Must supply route to push');
this.replaceAtIndex(route, 0, function(){


if(_this10.state.presentedIndex > 0){
_this10._popN(_this10.state.presentedIndex);}});}, 




getCurrentRoutes:function(){
return this.state.routeStack;}, 


_handleItemRef:function(itemId, route, ref){
this._itemRefs[itemId] = ref;
var itemIndex=this.state.idStack.indexOf(itemId);
if(itemIndex === -1){
return;}

this.props.onItemRef && this.props.onItemRef(ref, itemIndex, route);}, 


_cleanScenesPastIndex:function(index){var _this11=this;
var newStackLength=index + 1;

if(newStackLength < this.state.routeStack.length){
var updatingRangeStart=newStackLength;
var updatingRangeLength=this.state.routeStack.length - newStackLength + 1;
this.state.idStack.slice(newStackLength).map(function(removingId){
_this11._itemRefs[removingId] = null;});

this.setState({
updatingRangeStart:updatingRangeStart, 
updatingRangeLength:updatingRangeLength, 
sceneConfigStack:this.state.sceneConfigStack.slice(0, newStackLength), 
idStack:this.state.idStack.slice(0, newStackLength), 
routeStack:this.state.routeStack.slice(0, newStackLength)}, 
this._resetUpdatingRange);}}, 



_renderOptimizedScenes:function(){







var shouldRenderScenes=this.state.updatingRangeLength !== 0;
if(shouldRenderScenes){
return (
React.createElement(StaticContainer, {shouldUpdate:true}, 
React.createElement(View, _extends({
style:styles.transitioner}, 
this.panGesture.panHandlers, {
onTouchStart:this._handleTouchStart, 
onResponderTerminationRequest:
this._handleResponderTerminationRequest}), 

this.state.routeStack.map(this._renderOptimizedScene))));}









return (
React.createElement(StaticContainer, {shouldUpdate:false}));}, 



_renderOptimizedScene:function(route, i){
var shouldRenderScene=
i >= this.state.updatingRangeStart && 
i <= this.state.updatingRangeStart + this.state.updatingRangeLength;
var scene=shouldRenderScene?this._renderScene(route, i):null;
return (
React.createElement(StaticContainer, {
key:'nav' + i, 
shouldUpdate:shouldRenderScene}, 
scene));}, 




_renderScene:function(route, i){var _this12=this;
var child=this.props.renderScene(
route, 
this);

var disabledSceneStyle=null;
if(i !== this.state.presentedIndex){
disabledSceneStyle = styles.disabledScene;}

var originalRef=child.ref;
if(originalRef != null && typeof originalRef !== 'function'){
console.warn(
'String refs are not supported for navigator scenes. Use a callback ' + 
'ref instead. Ignoring ref: ' + originalRef);

originalRef = null;}

return (
React.createElement(View, {
key:this.state.idStack[i], 
ref:'scene_' + i, 
onStartShouldSetResponderCapture:function(){
return _this12.state.transitionFromIndex != null || _this12.state.transitionFromIndex != null;}, 

style:[styles.baseScene, this.props.sceneStyle, disabledSceneStyle]}, 
React.cloneElement(child, {
ref:function(component){
_this12._handleItemRef(_this12.state.idStack[i], route, component);
if(originalRef){
originalRef(component);}}})));}, 







_renderNavigationBar:function(){var _this13=this;
if(!this.props.navigationBar){
return null;}

return React.cloneElement(this.props.navigationBar, {
ref:function(navBar){_this13._navBar = navBar;}, 
navigator:this, 
navState:this.state});}, 



render:function(){
return (
React.createElement(View, {style:[styles.container, this.props.style]}, 
this._renderOptimizedScenes(), 
this._renderNavigationBar()));}});





module.exports = Navigator;});
__d('InteractionMixin',["InteractionManager"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';







var InteractionManager=require('InteractionManager');






var InteractionMixin={
componentWillUnmount:function(){
while(this._interactionMixinHandles.length) {
InteractionManager.clearInteractionHandle(
this._interactionMixinHandles.pop());}}, 




_interactionMixinHandles:[], 

createInteractionHandle:function(){
var handle=InteractionManager.createInteractionHandle();
this._interactionMixinHandles.push(handle);
return handle;}, 


clearInteractionHandle:function(clearHandle){
InteractionManager.clearInteractionHandle(clearHandle);
this._interactionMixinHandles = this._interactionMixinHandles.filter(
function(handle){return handle !== clearHandle;});}, 








runAfterInteractions:function(callback){
InteractionManager.runAfterInteractions(callback);}};



module.exports = InteractionMixin;});
__d('NavigatorBreadcrumbNavigationBar',["NavigatorBreadcrumbNavigationBarStyles","NavigatorNavigationBarStyles","React","StaticContainer.react","StyleSheet","View","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



























var NavigatorBreadcrumbNavigationBarStyles=require('NavigatorBreadcrumbNavigationBarStyles');
var NavigatorNavigationBarStyles=require('NavigatorNavigationBarStyles');
var React=require('React');
var StaticContainer=require('StaticContainer.react');
var StyleSheet=require('StyleSheet');
var View=require('View');

var invariant=require('invariant');

var Interpolators=NavigatorBreadcrumbNavigationBarStyles.Interpolators;
var PropTypes=React.PropTypes;




var CRUMB_PROPS=Interpolators.map(function(){return {style:{}};});
var ICON_PROPS=Interpolators.map(function(){return {style:{}};});
var SEPARATOR_PROPS=Interpolators.map(function(){return {style:{}};});
var TITLE_PROPS=Interpolators.map(function(){return {style:{}};});
var RIGHT_BUTTON_PROPS=Interpolators.map(function(){return {style:{}};});


var navStatePresentedIndex=function(navState){
if(navState.presentedIndex !== undefined){
return navState.presentedIndex;}


return navState.observedTopOfStack;};










var initStyle=function(index, presentedIndex){
return index === presentedIndex?NavigatorBreadcrumbNavigationBarStyles.Center[index]:
index < presentedIndex?NavigatorBreadcrumbNavigationBarStyles.Left[index]:
NavigatorBreadcrumbNavigationBarStyles.Right[index];};


var NavigatorBreadcrumbNavigationBar=React.createClass({displayName:'NavigatorBreadcrumbNavigationBar', 
propTypes:{
navigator:PropTypes.shape({
push:PropTypes.func, 
pop:PropTypes.func, 
replace:PropTypes.func, 
popToRoute:PropTypes.func, 
popToTop:PropTypes.func}), 

routeMapper:PropTypes.shape({
rightContentForRoute:PropTypes.func, 
titleContentForRoute:PropTypes.func, 
iconForRoute:PropTypes.func}), 

navState:React.PropTypes.shape({
routeStack:React.PropTypes.arrayOf(React.PropTypes.object), 
idStack:React.PropTypes.arrayOf(React.PropTypes.number), 
presentedIndex:React.PropTypes.number}), 

style:View.propTypes.style}, 


statics:{
Styles:NavigatorBreadcrumbNavigationBarStyles}, 


_updateIndexProgress:function(progress, index, fromIndex, toIndex){
var amount=toIndex > fromIndex?progress:1 - progress;
var oldDistToCenter=index - fromIndex;
var newDistToCenter=index - toIndex;
var interpolate;
invariant(
Interpolators[index], 
'Cannot find breadcrumb interpolators for ' + index);

if(oldDistToCenter > 0 && newDistToCenter === 0 || 
newDistToCenter > 0 && oldDistToCenter === 0){
interpolate = Interpolators[index].RightToCenter;}else 
if(oldDistToCenter < 0 && newDistToCenter === 0 || 
newDistToCenter < 0 && oldDistToCenter === 0){
interpolate = Interpolators[index].CenterToLeft;}else 
if(oldDistToCenter === newDistToCenter){
interpolate = Interpolators[index].RightToCenter;}else 
{
interpolate = Interpolators[index].RightToLeft;}


if(interpolate.Crumb(CRUMB_PROPS[index].style, amount)){
this.refs['crumb_' + index].setNativeProps(CRUMB_PROPS[index]);}

if(interpolate.Icon(ICON_PROPS[index].style, amount)){
this.refs['icon_' + index].setNativeProps(ICON_PROPS[index]);}

if(interpolate.Separator(SEPARATOR_PROPS[index].style, amount)){
this.refs['separator_' + index].setNativeProps(SEPARATOR_PROPS[index]);}

if(interpolate.Title(TITLE_PROPS[index].style, amount)){
this.refs['title_' + index].setNativeProps(TITLE_PROPS[index]);}

var right=this.refs['right_' + index];
if(right && 
interpolate.RightItem(RIGHT_BUTTON_PROPS[index].style, amount)){
right.setNativeProps(RIGHT_BUTTON_PROPS[index]);}}, 



updateProgress:function(progress, fromIndex, toIndex){
var max=Math.max(fromIndex, toIndex);
var min=Math.min(fromIndex, toIndex);
for(var index=min; index <= max; index++) {
this._updateIndexProgress(progress, index, fromIndex, toIndex);}}, 



onAnimationStart:function(fromIndex, toIndex){
var max=Math.max(fromIndex, toIndex);
var min=Math.min(fromIndex, toIndex);
for(var index=min; index <= max; index++) {
this._setRenderViewsToHardwareTextureAndroid(index, true);}}, 



onAnimationEnd:function(){
var max=this.props.navState.routeStack.length - 1;
for(var index=0; index <= max; index++) {
this._setRenderViewsToHardwareTextureAndroid(index, false);}}, 



_setRenderViewsToHardwareTextureAndroid:function(index, renderToHardwareTexture){
var props={
renderToHardwareTextureAndroid:renderToHardwareTexture};


this.refs['icon_' + index].setNativeProps(props);
this.refs['separator_' + index].setNativeProps(props);
this.refs['title_' + index].setNativeProps(props);
var right=this.refs['right_' + index];
if(right){
right.setNativeProps(props);}}, 



render:function(){
var navState=this.props.navState;
var icons=navState && navState.routeStack.map(this._renderOrReturnBreadcrumb);
var titles=navState.routeStack.map(this._renderOrReturnTitle);
var buttons=navState.routeStack.map(this._renderOrReturnRightButton);
return (
React.createElement(View, {style:[styles.breadCrumbContainer, this.props.style]}, 
titles, 
icons, 
buttons));}, 




_renderOrReturnBreadcrumb:function(route, index){
var uid=this.props.navState.idStack[index];
var navBarRouteMapper=this.props.routeMapper;
var navOps=this.props.navigator;
var alreadyRendered=this.refs['crumbContainer' + uid];
if(alreadyRendered){

return (
React.createElement(StaticContainer, {
ref:'crumbContainer' + uid, 
key:'crumbContainer' + uid, 
shouldUpdate:false}));}



var firstStyles=initStyle(index, navStatePresentedIndex(this.props.navState));
return (
React.createElement(StaticContainer, {
ref:'crumbContainer' + uid, 
key:'crumbContainer' + uid, 
shouldUpdate:false}, 
React.createElement(View, {ref:'crumb_' + index, style:firstStyles.Crumb}, 
React.createElement(View, {ref:'icon_' + index, style:firstStyles.Icon}, 
navBarRouteMapper.iconForRoute(route, navOps)), 

React.createElement(View, {ref:'separator_' + index, style:firstStyles.Separator}, 
navBarRouteMapper.separatorForRoute(route, navOps)))));}, 






_renderOrReturnTitle:function(route, index){
var navState=this.props.navState;
var uid=navState.idStack[index];
var alreadyRendered=this.refs['titleContainer' + uid];
if(alreadyRendered){

return (
React.createElement(StaticContainer, {
ref:'titleContainer' + uid, 
key:'titleContainer' + uid, 
shouldUpdate:false}));}



var navBarRouteMapper=this.props.routeMapper;
var titleContent=navBarRouteMapper.titleContentForRoute(
navState.routeStack[index], 
this.props.navigator);

var firstStyles=initStyle(index, navStatePresentedIndex(this.props.navState));
return (
React.createElement(StaticContainer, {
ref:'titleContainer' + uid, 
key:'titleContainer' + uid, 
shouldUpdate:false}, 
React.createElement(View, {ref:'title_' + index, style:firstStyles.Title}, 
titleContent)));}, 





_renderOrReturnRightButton:function(route, index){
var navState=this.props.navState;
var navBarRouteMapper=this.props.routeMapper;
var uid=navState.idStack[index];
var alreadyRendered=this.refs['rightContainer' + uid];
if(alreadyRendered){

return (
React.createElement(StaticContainer, {
ref:'rightContainer' + uid, 
key:'rightContainer' + uid, 
shouldUpdate:false}));}



var rightContent=navBarRouteMapper.rightContentForRoute(
navState.routeStack[index], 
this.props.navigator);

if(!rightContent){
return null;}

var firstStyles=initStyle(index, navStatePresentedIndex(this.props.navState));
return (
React.createElement(StaticContainer, {
ref:'rightContainer' + uid, 
key:'rightContainer' + uid, 
shouldUpdate:false}, 
React.createElement(View, {ref:'right_' + index, style:firstStyles.RightItem}, 
rightContent)));}});






var styles=StyleSheet.create({
breadCrumbContainer:{
overflow:'hidden', 
position:'absolute', 
height:NavigatorNavigationBarStyles.General.TotalNavHeight, 
top:0, 
left:0, 
right:0}});



module.exports = NavigatorBreadcrumbNavigationBar;});
__d('NavigatorBreadcrumbNavigationBarStyles',["Dimensions","NavigatorNavigationBarStyles","buildStyleInterpolator","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



























var Dimensions=require('Dimensions');
var NavigatorNavigationBarStyles=require('NavigatorNavigationBarStyles');

var buildStyleInterpolator=require('buildStyleInterpolator');
var merge=require('merge');

var SCREEN_WIDTH=Dimensions.get('window').width;
var STATUS_BAR_HEIGHT=NavigatorNavigationBarStyles.General.StatusBarHeight;
var NAV_BAR_HEIGHT=NavigatorNavigationBarStyles.General.NavBarHeight;

var SPACING=4;
var ICON_WIDTH=40;
var SEPARATOR_WIDTH=9;
var CRUMB_WIDTH=ICON_WIDTH + SEPARATOR_WIDTH;

var OPACITY_RATIO=100;
var ICON_INACTIVE_OPACITY=0.6;
var MAX_BREADCRUMBS=10;

var CRUMB_BASE={
position:'absolute', 
flexDirection:'row', 
top:STATUS_BAR_HEIGHT, 
width:CRUMB_WIDTH, 
height:NAV_BAR_HEIGHT, 
backgroundColor:'transparent'};


var ICON_BASE={
width:ICON_WIDTH, 
height:NAV_BAR_HEIGHT};


var SEPARATOR_BASE={
width:SEPARATOR_WIDTH, 
height:NAV_BAR_HEIGHT};


var TITLE_BASE={
position:'absolute', 
top:STATUS_BAR_HEIGHT, 
height:NAV_BAR_HEIGHT, 
backgroundColor:'transparent'};



var FIRST_TITLE_BASE=merge(TITLE_BASE, {
left:0, 
right:0, 
alignItems:'center', 
height:NAV_BAR_HEIGHT});


var RIGHT_BUTTON_BASE={
position:'absolute', 
top:STATUS_BAR_HEIGHT, 
right:SPACING, 
overflow:'hidden', 
opacity:1, 
height:NAV_BAR_HEIGHT, 
backgroundColor:'transparent'};






var LEFT=[];
var CENTER=[];
var RIGHT=[];
for(var i=0; i < MAX_BREADCRUMBS; i++) {
var crumbLeft=CRUMB_WIDTH * i + SPACING;
LEFT[i] = {
Crumb:merge(CRUMB_BASE, {left:crumbLeft}), 
Icon:merge(ICON_BASE, {opacity:ICON_INACTIVE_OPACITY}), 
Separator:merge(SEPARATOR_BASE, {opacity:1}), 
Title:merge(TITLE_BASE, {left:crumbLeft, opacity:0}), 
RightItem:merge(RIGHT_BUTTON_BASE, {opacity:0})};

CENTER[i] = {
Crumb:merge(CRUMB_BASE, {left:crumbLeft}), 
Icon:merge(ICON_BASE, {opacity:1}), 
Separator:merge(SEPARATOR_BASE, {opacity:0}), 
Title:merge(TITLE_BASE, {
left:crumbLeft + ICON_WIDTH, 
opacity:1}), 

RightItem:merge(RIGHT_BUTTON_BASE, {opacity:1})};

var crumbRight=SCREEN_WIDTH - 100;
RIGHT[i] = {
Crumb:merge(CRUMB_BASE, {left:crumbRight}), 
Icon:merge(ICON_BASE, {opacity:0}), 
Separator:merge(SEPARATOR_BASE, {opacity:0}), 
Title:merge(TITLE_BASE, {
left:crumbRight + ICON_WIDTH, 
opacity:0}), 

RightItem:merge(RIGHT_BUTTON_BASE, {opacity:0})};}




CENTER[0] = {
Crumb:merge(CRUMB_BASE, {left:SCREEN_WIDTH / 4}), 
Icon:merge(ICON_BASE, {opacity:0}), 
Separator:merge(SEPARATOR_BASE, {opacity:0}), 
Title:merge(FIRST_TITLE_BASE, {opacity:1}), 
RightItem:CENTER[0].RightItem};

LEFT[0].Title = merge(FIRST_TITLE_BASE, {left:-SCREEN_WIDTH / 4, opacity:0});
RIGHT[0].Title = merge(FIRST_TITLE_BASE, {opacity:0});


var buildIndexSceneInterpolator=function(startStyles, endStyles){
return {
Crumb:buildStyleInterpolator({
left:{
type:'linear', 
from:startStyles.Crumb.left, 
to:endStyles.Crumb.left, 
min:0, 
max:1, 
extrapolate:true}}), 


Icon:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.Icon.opacity, 
to:endStyles.Icon.opacity, 
min:0, 
max:1}}), 


Separator:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.Separator.opacity, 
to:endStyles.Separator.opacity, 
min:0, 
max:1}}), 


Title:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.Title.opacity, 
to:endStyles.Title.opacity, 
min:0, 
max:1}, 

left:{
type:'linear', 
from:startStyles.Title.left, 
to:endStyles.Title.left, 
min:0, 
max:1, 
extrapolate:true}}), 


RightItem:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.RightItem.opacity, 
to:endStyles.RightItem.opacity, 
min:0, 
max:1, 
round:OPACITY_RATIO}})};};





var Interpolators=CENTER.map(function(_, ii){
return {

RightToCenter:buildIndexSceneInterpolator(RIGHT[ii], CENTER[ii]), 

CenterToLeft:buildIndexSceneInterpolator(CENTER[ii], LEFT[ii]), 

RightToLeft:buildIndexSceneInterpolator(RIGHT[ii], LEFT[ii])};});







module.exports = {
Interpolators:Interpolators, 
Left:LEFT, 
Center:CENTER, 
Right:RIGHT, 
IconWidth:ICON_WIDTH, 
IconHeight:NAV_BAR_HEIGHT, 
SeparatorWidth:SEPARATOR_WIDTH, 
SeparatorHeight:NAV_BAR_HEIGHT};});
__d('NavigatorNavigationBarStyles',["Dimensions","buildStyleInterpolator","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



























var Dimensions=require('Dimensions');

var buildStyleInterpolator=require('buildStyleInterpolator');
var merge=require('merge');

var SCREEN_WIDTH=Dimensions.get('window').width;
var NAV_BAR_HEIGHT=44;
var STATUS_BAR_HEIGHT=20;
var NAV_HEIGHT=NAV_BAR_HEIGHT + STATUS_BAR_HEIGHT;

var BASE_STYLES={
Title:{
position:'absolute', 
top:STATUS_BAR_HEIGHT, 
left:0, 
alignItems:'center', 
width:SCREEN_WIDTH, 
height:NAV_BAR_HEIGHT, 
backgroundColor:'transparent'}, 

LeftButton:{
position:'absolute', 
top:STATUS_BAR_HEIGHT, 
left:0, 
overflow:'hidden', 
opacity:1, 
width:SCREEN_WIDTH / 3, 
height:NAV_BAR_HEIGHT, 
backgroundColor:'transparent'}, 

RightButton:{
position:'absolute', 
top:STATUS_BAR_HEIGHT, 
left:2 * SCREEN_WIDTH / 3, 
overflow:'hidden', 
opacity:1, 
alignItems:'flex-end', 
width:SCREEN_WIDTH / 3, 
height:NAV_BAR_HEIGHT, 
backgroundColor:'transparent'}};










var Stages={
Left:{
Title:merge(BASE_STYLES.Title, {left:-SCREEN_WIDTH / 2, opacity:0}), 
LeftButton:merge(BASE_STYLES.LeftButton, {left:-SCREEN_WIDTH / 3, opacity:1}), 
RightButton:merge(BASE_STYLES.RightButton, {left:SCREEN_WIDTH / 3, opacity:0})}, 

Center:{
Title:merge(BASE_STYLES.Title, {left:0, opacity:1}), 
LeftButton:merge(BASE_STYLES.LeftButton, {left:0, opacity:1}), 
RightButton:merge(BASE_STYLES.RightButton, {left:2 * SCREEN_WIDTH / 3 - 0, opacity:1})}, 

Right:{
Title:merge(BASE_STYLES.Title, {left:SCREEN_WIDTH / 2, opacity:0}), 
LeftButton:merge(BASE_STYLES.LeftButton, {left:0, opacity:0}), 
RightButton:merge(BASE_STYLES.RightButton, {left:SCREEN_WIDTH, opacity:0})}};




var opacityRatio=100;

function buildSceneInterpolators(startStyles, endStyles){
return {
Title:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.Title.opacity, 
to:endStyles.Title.opacity, 
min:0, 
max:1}, 

left:{
type:'linear', 
from:startStyles.Title.left, 
to:endStyles.Title.left, 
min:0, 
max:1, 
extrapolate:true}}), 


LeftButton:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.LeftButton.opacity, 
to:endStyles.LeftButton.opacity, 
min:0, 
max:1, 
round:opacityRatio}, 

left:{
type:'linear', 
from:startStyles.LeftButton.left, 
to:endStyles.LeftButton.left, 
min:0, 
max:1}}), 


RightButton:buildStyleInterpolator({
opacity:{
type:'linear', 
from:startStyles.RightButton.opacity, 
to:endStyles.RightButton.opacity, 
min:0, 
max:1, 
round:opacityRatio}, 

left:{
type:'linear', 
from:startStyles.RightButton.left, 
to:endStyles.RightButton.left, 
min:0, 
max:1, 
extrapolate:true}})};}





var Interpolators={

RightToCenter:buildSceneInterpolators(Stages.Right, Stages.Center), 

CenterToLeft:buildSceneInterpolators(Stages.Center, Stages.Left), 

RightToLeft:buildSceneInterpolators(Stages.Right, Stages.Left)};



module.exports = {
General:{
NavBarHeight:NAV_BAR_HEIGHT, 
StatusBarHeight:STATUS_BAR_HEIGHT, 
TotalNavHeight:NAV_HEIGHT}, 

Interpolators:Interpolators, 
Stages:Stages};});
__d('buildStyleInterpolator',["keyOf"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 










keyOf=require('keyOf');

var X_DIM=keyOf({x:null});
var Y_DIM=keyOf({y:null});
var Z_DIM=keyOf({z:null});
var W_DIM=keyOf({w:null});

var TRANSFORM_ROTATE_NAME=keyOf({transformRotateRadians:null});

var ShouldAllocateReusableOperationVars={
transformRotateRadians:true, 
transformScale:true, 
transformTranslate:true};


var InitialOperationField={
transformRotateRadians:[0, 0, 0, 1], 
transformTranslate:[0, 0, 0], 
transformScale:[1, 1, 1]};



























































var ARGUMENT_NAMES_RE=/([^\s,]+)/g;



















var inline=function(func, replaceWithArgs){
var fnStr=func.toString();
var parameterNames=fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).
match(ARGUMENT_NAMES_RE) || 
[];
var replaceRegexStr=parameterNames.map(function(paramName){
return '\\b' + paramName + '\\b';}).
join('|');
var replaceRegex=new RegExp(replaceRegexStr, 'g');
var fnBody=fnStr.substring(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}') - 1);
var newFnBody=fnBody.replace(replaceRegex, function(parameterName){
var indexInParameterNames=parameterNames.indexOf(parameterName);
var replacementName=replaceWithArgs[indexInParameterNames];
return replacementName;});

return newFnBody.split('\n');};






var MatrixOps={
unroll:function(matVar, m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15){
m0 = matVar[0];
m1 = matVar[1];
m2 = matVar[2];
m3 = matVar[3];
m4 = matVar[4];
m5 = matVar[5];
m6 = matVar[6];
m7 = matVar[7];
m8 = matVar[8];
m9 = matVar[9];
m10 = matVar[10];
m11 = matVar[11];
m12 = matVar[12];
m13 = matVar[13];
m14 = matVar[14];
m15 = matVar[15];}, 


matrixDiffers:function(retVar, matVar, m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15){
retVar = retVar || 
m0 !== matVar[0] || 
m1 !== matVar[1] || 
m2 !== matVar[2] || 
m3 !== matVar[3] || 
m4 !== matVar[4] || 
m5 !== matVar[5] || 
m6 !== matVar[6] || 
m7 !== matVar[7] || 
m8 !== matVar[8] || 
m9 !== matVar[9] || 
m10 !== matVar[10] || 
m11 !== matVar[11] || 
m12 !== matVar[12] || 
m13 !== matVar[13] || 
m14 !== matVar[14] || 
m15 !== matVar[15];}, 


transformScale:function(matVar, opVar){

var x=opVar[0];
var y=opVar[1];
var z=opVar[2];
matVar[0] = matVar[0] * x;
matVar[1] = matVar[1] * x;
matVar[2] = matVar[2] * x;
matVar[3] = matVar[3] * x;
matVar[4] = matVar[4] * y;
matVar[5] = matVar[5] * y;
matVar[6] = matVar[6] * y;
matVar[7] = matVar[7] * y;
matVar[8] = matVar[8] * z;
matVar[9] = matVar[9] * z;
matVar[10] = matVar[10] * z;
matVar[11] = matVar[11] * z;
matVar[12] = matVar[12];
matVar[13] = matVar[13];
matVar[14] = matVar[14];
matVar[15] = matVar[15];}, 






transformTranslate:function(matVar, opVar){

var x=opVar[0];
var y=opVar[1];
var z=opVar[2];
matVar[12] = matVar[0] * x + matVar[4] * y + matVar[8] * z + matVar[12];
matVar[13] = matVar[1] * x + matVar[5] * y + matVar[9] * z + matVar[13];
matVar[14] = matVar[2] * x + matVar[6] * y + matVar[10] * z + matVar[14];
matVar[15] = matVar[3] * x + matVar[7] * y + matVar[11] * z + matVar[15];}, 






transformRotateRadians:function(matVar, q){

var xQuat=q[0], yQuat=q[1], zQuat=q[2], wQuat=q[3];
var x2Quat=xQuat + xQuat;
var y2Quat=yQuat + yQuat;
var z2Quat=zQuat + zQuat;
var xxQuat=xQuat * x2Quat;
var xyQuat=xQuat * y2Quat;
var xzQuat=xQuat * z2Quat;
var yyQuat=yQuat * y2Quat;
var yzQuat=yQuat * z2Quat;
var zzQuat=zQuat * z2Quat;
var wxQuat=wQuat * x2Quat;
var wyQuat=wQuat * y2Quat;
var wzQuat=wQuat * z2Quat;

var quatMat0=1 - (yyQuat + zzQuat);
var quatMat1=xyQuat + wzQuat;
var quatMat2=xzQuat - wyQuat;
var quatMat4=xyQuat - wzQuat;
var quatMat5=1 - (xxQuat + zzQuat);
var quatMat6=yzQuat + wxQuat;
var quatMat8=xzQuat + wyQuat;
var quatMat9=yzQuat - wxQuat;
var quatMat10=1 - (xxQuat + yyQuat);



var a00=matVar[0];
var a01=matVar[1];
var a02=matVar[2];
var a03=matVar[3];
var a10=matVar[4];
var a11=matVar[5];
var a12=matVar[6];
var a13=matVar[7];
var a20=matVar[8];
var a21=matVar[9];
var a22=matVar[10];
var a23=matVar[11];

var b0=quatMat0, b1=quatMat1, b2=quatMat2;
matVar[0] = b0 * a00 + b1 * a10 + b2 * a20;
matVar[1] = b0 * a01 + b1 * a11 + b2 * a21;
matVar[2] = b0 * a02 + b1 * a12 + b2 * a22;
matVar[3] = b0 * a03 + b1 * a13 + b2 * a23;
b0 = quatMat4;b1 = quatMat5;b2 = quatMat6;
matVar[4] = b0 * a00 + b1 * a10 + b2 * a20;
matVar[5] = b0 * a01 + b1 * a11 + b2 * a21;
matVar[6] = b0 * a02 + b1 * a12 + b2 * a22;
matVar[7] = b0 * a03 + b1 * a13 + b2 * a23;
b0 = quatMat8;b1 = quatMat9;b2 = quatMat10;
matVar[8] = b0 * a00 + b1 * a10 + b2 * a20;
matVar[9] = b0 * a01 + b1 * a11 + b2 * a21;
matVar[10] = b0 * a02 + b1 * a12 + b2 * a22;
matVar[11] = b0 * a03 + b1 * a13 + b2 * a23;}};





var MatrixOpsInitial={
transformScale:function(matVar, opVar){

matVar[0] = opVar[0];
matVar[1] = 0;
matVar[2] = 0;
matVar[3] = 0;
matVar[4] = 0;
matVar[5] = opVar[1];
matVar[6] = 0;
matVar[7] = 0;
matVar[8] = 0;
matVar[9] = 0;
matVar[10] = opVar[2];
matVar[11] = 0;
matVar[12] = 0;
matVar[13] = 0;
matVar[14] = 0;
matVar[15] = 1;}, 


transformTranslate:function(matVar, opVar){

matVar[0] = 1;
matVar[1] = 0;
matVar[2] = 0;
matVar[3] = 0;
matVar[4] = 0;
matVar[5] = 1;
matVar[6] = 0;
matVar[7] = 0;
matVar[8] = 0;
matVar[9] = 0;
matVar[10] = 1;
matVar[11] = 0;
matVar[12] = opVar[0];
matVar[13] = opVar[1];
matVar[14] = opVar[2];
matVar[15] = 1;}, 







transformRotateRadians:function(matVar, q){


var xQuat=q[0], yQuat=q[1], zQuat=q[2], wQuat=q[3];
var x2Quat=xQuat + xQuat;
var y2Quat=yQuat + yQuat;
var z2Quat=zQuat + zQuat;
var xxQuat=xQuat * x2Quat;
var xyQuat=xQuat * y2Quat;
var xzQuat=xQuat * z2Quat;
var yyQuat=yQuat * y2Quat;
var yzQuat=yQuat * z2Quat;
var zzQuat=zQuat * z2Quat;
var wxQuat=wQuat * x2Quat;
var wyQuat=wQuat * y2Quat;
var wzQuat=wQuat * z2Quat;

var quatMat0=1 - (yyQuat + zzQuat);
var quatMat1=xyQuat + wzQuat;
var quatMat2=xzQuat - wyQuat;
var quatMat4=xyQuat - wzQuat;
var quatMat5=1 - (xxQuat + zzQuat);
var quatMat6=yzQuat + wxQuat;
var quatMat8=xzQuat + wyQuat;
var quatMat9=yzQuat - wxQuat;
var quatMat10=1 - (xxQuat + yyQuat);



var b0=quatMat0, b1=quatMat1, b2=quatMat2;
matVar[0] = b0;
matVar[1] = b1;
matVar[2] = b2;
matVar[3] = 0;
b0 = quatMat4;b1 = quatMat5;b2 = quatMat6;
matVar[4] = b0;
matVar[5] = b1;
matVar[6] = b2;
matVar[7] = 0;
b0 = quatMat8;b1 = quatMat9;b2 = quatMat10;
matVar[8] = b0;
matVar[9] = b1;
matVar[10] = b2;
matVar[11] = 0;
matVar[12] = 0;
matVar[13] = 0;
matVar[14] = 0;
matVar[15] = 1;}};




var setNextValAndDetectChange=function(name, tmpVarName){
return (
'  if (!didChange) {\n' + 
'    var prevVal = result.' + name + ';\n' + 
'    result.' + name + ' = ' + tmpVarName + ';\n' + 
'    didChange = didChange  || (' + tmpVarName + ' !== prevVal);\n' + 
'  } else {\n' + 
'    result.' + name + ' = ' + tmpVarName + ';\n' + 
'  }\n');};



var computeNextValLinear=function(anim, from, to, tmpVarName){
var hasRoundRatio=('round' in anim);
var roundRatio=anim.round;
var fn='  ratio = (value - ' + anim.min + ') / ' + (anim.max - anim.min) + ';\n';
if(!anim.extrapolate){
fn += '  ratio = ratio > 1 ? 1 : (ratio < 0 ? 0 : ratio);\n';}


var roundOpen=hasRoundRatio?'Math.round(' + roundRatio + ' * ':'';
var roundClose=hasRoundRatio?') / ' + roundRatio:'';
fn += 
'  ' + tmpVarName + ' = ' + 
roundOpen + 
'(' + from + ' * (1 - ratio) + ' + to + ' * ratio)' + 
roundClose + ';\n';
return fn;};


var computeNextValLinearScalar=function(anim){
return computeNextValLinear(anim, anim.from, anim.to, 'nextScalarVal');};


var computeNextValConstant=function(anim){
var constantExpression=JSON.stringify(anim.value);
return '  nextScalarVal = ' + constantExpression + ';\n';};


var computeNextValStep=function(anim){
return (
'  nextScalarVal = value >= ' + (
anim.threshold + ' ? ' + anim.to + ' : ' + anim.from) + ';\n');};



var computeNextValIdentity=function(anim){
return '  nextScalarVal = value;\n';};


var operationVar=function(name){
return name + 'ReuseOp';};


var createReusableOperationVars=function(anims){
var ret='';
for(var name in anims) {
if(ShouldAllocateReusableOperationVars[name]){
ret += 'var ' + operationVar(name) + ' = [];\n';}}


return ret;};


var newlines=function(statements){
return '\n' + statements.join('\n') + '\n';};








var computeNextMatrixOperationField=function(anim, name, dimension, index){
var fieldAccess=operationVar(name) + '[' + index + ']';
if(anim.from[dimension] !== undefined && anim.to[dimension] !== undefined){
return '  ' + anim.from[dimension] !== anim.to[dimension]?
computeNextValLinear(anim, anim.from[dimension], anim.to[dimension], fieldAccess):
fieldAccess + ' = ' + anim.from[dimension] + ';';}else 
{
return '  ' + fieldAccess + ' = ' + InitialOperationField[name][index] + ';';}};



var unrolledVars=[];
for(var varIndex=0; varIndex < 16; varIndex++) {
unrolledVars.push('m' + varIndex);}

var setNextMatrixAndDetectChange=function(orderedMatrixOperations){
var fn=[
'  var transformMatrix = result.transformMatrix !== undefined ? ' + 
'result.transformMatrix : (result.transformMatrix = []);'];

fn.push.apply(
fn, 
inline(MatrixOps.unroll, ['transformMatrix'].concat(unrolledVars)));

for(var i=0; i < orderedMatrixOperations.length; i++) {
var opName=orderedMatrixOperations[i];
if(i === 0){
fn.push.apply(
fn, 
inline(MatrixOpsInitial[opName], ['transformMatrix', operationVar(opName)]));}else 

{
fn.push.apply(
fn, 
inline(MatrixOps[opName], ['transformMatrix', operationVar(opName)]));}}



fn.push.apply(
fn, 
inline(MatrixOps.matrixDiffers, ['didChange', 'transformMatrix'].concat(unrolledVars)));

return fn;};


var InterpolateMatrix={
transformTranslate:true, 
transformRotateRadians:true, 
transformScale:true};


var createFunctionString=function(anims){


var orderedMatrixOperations=[];



var fn='return (function() {\n';
fn += createReusableOperationVars(anims);
fn += 'return function(result, value) {\n';
fn += '  var didChange = false;\n';
fn += '  var nextScalarVal;\n';
fn += '  var ratio;\n';

for(var name in anims) {
var anim=anims[name];
if(anim.type === 'linear'){
if(InterpolateMatrix[name]){
orderedMatrixOperations.push(name);
var setOperations=[
computeNextMatrixOperationField(anim, name, X_DIM, 0), 
computeNextMatrixOperationField(anim, name, Y_DIM, 1), 
computeNextMatrixOperationField(anim, name, Z_DIM, 2)];

if(name === TRANSFORM_ROTATE_NAME){
setOperations.push(computeNextMatrixOperationField(anim, name, W_DIM, 3));}

fn += newlines(setOperations);}else 
{
fn += computeNextValLinearScalar(anim, 'nextScalarVal');
fn += setNextValAndDetectChange(name, 'nextScalarVal');}}else 

if(anim.type === 'constant'){
fn += computeNextValConstant(anim);
fn += setNextValAndDetectChange(name, 'nextScalarVal');}else 
if(anim.type === 'step'){
fn += computeNextValStep(anim);
fn += setNextValAndDetectChange(name, 'nextScalarVal');}else 
if(anim.type === 'identity'){
fn += computeNextValIdentity(anim);
fn += setNextValAndDetectChange(name, 'nextScalarVal');}}


if(orderedMatrixOperations.length){
fn += newlines(setNextMatrixAndDetectChange(orderedMatrixOperations));}

fn += '  return didChange;\n';
fn += '};\n';
fn += '})()';
return fn;};







var buildStyleInterpolator=function(anims){
return Function(createFunctionString(anims))();};



module.exports = buildStyleInterpolator;});
__d('StaticContainer.react',["React","onlyChild"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 

















React=require('React');

var onlyChild=require('onlyChild');
















var StaticContainer=React.createClass({displayName:'StaticContainer', 

shouldComponentUpdate:function(nextProps){
return nextProps.shouldUpdate;}, 


render:function(){
return onlyChild(this.props.children);}});




module.exports = StaticContainer;});
__d('NavigatorNavigationBar',["React","NavigatorNavigationBarStyles","StaticContainer.react","StyleSheet","View"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



























var React=require('React');
var NavigatorNavigationBarStyles=require('NavigatorNavigationBarStyles');
var StaticContainer=require('StaticContainer.react');
var StyleSheet=require('StyleSheet');
var View=require('View');

var COMPONENT_NAMES=['Title', 'LeftButton', 'RightButton'];

var navStatePresentedIndex=function(navState){
if(navState.presentedIndex !== undefined){
return navState.presentedIndex;}


return navState.observedTopOfStack;};


var NavigatorNavigationBar=React.createClass({displayName:'NavigatorNavigationBar', 

propTypes:{
navigator:React.PropTypes.object, 
routeMapper:React.PropTypes.shape({
Title:React.PropTypes.func.isRequired, 
LeftButton:React.PropTypes.func.isRequired, 
RightButton:React.PropTypes.func.isRequired}), 

navState:React.PropTypes.shape({
routeStack:React.PropTypes.arrayOf(React.PropTypes.object), 
idStack:React.PropTypes.arrayOf(React.PropTypes.number), 
presentedIndex:React.PropTypes.number}), 

style:View.propTypes.style}, 


statics:{
Styles:NavigatorNavigationBarStyles}, 


_getReusableProps:function(
componentName, 
index)
{
if(!this._reusableProps){
this._reusableProps = {};}

var propStack=this._reusableProps[componentName];
if(!propStack){
propStack = this._reusableProps[componentName] = [];}

var props=propStack[index];
if(!props){
props = propStack[index] = {style:{}};}

return props;}, 


_updateIndexProgress:function(
progress, 
index, 
fromIndex, 
toIndex)
{
var amount=toIndex > fromIndex?progress:1 - progress;
var oldDistToCenter=index - fromIndex;
var newDistToCenter=index - toIndex;
var interpolate;
if(oldDistToCenter > 0 && newDistToCenter === 0 || 
newDistToCenter > 0 && oldDistToCenter === 0){
interpolate = NavigatorNavigationBarStyles.Interpolators.RightToCenter;}else 
if(oldDistToCenter < 0 && newDistToCenter === 0 || 
newDistToCenter < 0 && oldDistToCenter === 0){
interpolate = NavigatorNavigationBarStyles.Interpolators.CenterToLeft;}else 
if(oldDistToCenter === newDistToCenter){
interpolate = NavigatorNavigationBarStyles.Interpolators.RightToCenter;}else 
{
interpolate = NavigatorNavigationBarStyles.Interpolators.RightToLeft;}


COMPONENT_NAMES.forEach(function(componentName){
var component=this.refs[componentName + index];
var props=this._getReusableProps(componentName, index);
if(component && interpolate[componentName](props.style, amount)){
component.setNativeProps(props);}}, 

this);}, 


updateProgress:function(
progress, 
fromIndex, 
toIndex)
{
var max=Math.max(fromIndex, toIndex);
var min=Math.min(fromIndex, toIndex);
for(var index=min; index <= max; index++) {
this._updateIndexProgress(progress, index, fromIndex, toIndex);}}, 



render:function(){
var navState=this.props.navState;
var components=COMPONENT_NAMES.map(function(componentName){
return navState.routeStack.map(
this._renderOrReturnComponent.bind(this, componentName));}, 

this);

return (
React.createElement(View, {style:[styles.navBarContainer, this.props.style]}, 
components));}, 




_renderOrReturnComponent:function(
componentName, 
route, 
index)
{
var navState=this.props.navState;
var uid=navState.idStack[index];
var containerRef=componentName + 'Container' + uid;
var alreadyRendered=this.refs[containerRef];
if(alreadyRendered){

return (
React.createElement(StaticContainer, {
ref:containerRef, 
key:containerRef, 
shouldUpdate:false}));}




var content=this.props.routeMapper[componentName](
navState.routeStack[index], 
this.props.navigator, 
index, 
this.props.navState);

if(!content){
return null;}


var initialStage=index === navStatePresentedIndex(this.props.navState)?
NavigatorNavigationBarStyles.Stages.Center:NavigatorNavigationBarStyles.Stages.Left;
return (
React.createElement(StaticContainer, {
ref:containerRef, 
key:containerRef, 
shouldUpdate:false}, 
React.createElement(View, {ref:componentName + index, style:initialStage[componentName]}, 
content)));}});








var styles=StyleSheet.create({
navBarContainer:{
position:'absolute', 
height:NavigatorNavigationBarStyles.General.TotalNavHeight, 
top:0, 
left:0, 
right:0, 
backgroundColor:'transparent'}});



module.exports = NavigatorNavigationBar;});
__d('NavigatorSceneConfigs',["Dimensions","PixelRatio","buildStyleInterpolator"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};



























var Dimensions=require('Dimensions');
var PixelRatio=require('PixelRatio');

var buildStyleInterpolator=require('buildStyleInterpolator');

var SCREEN_WIDTH=Dimensions.get('window').width;
var SCREEN_HEIGHT=Dimensions.get('window').height;

var FadeToTheLeft={


transformTranslate:{
from:{x:0, y:0, z:0}, 
to:{x:-Math.round(Dimensions.get('window').width * 0.3), y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 












transformScale:{
from:{x:1, y:1, z:1}, 
to:{x:0.95, y:0.95, z:1}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true}, 

opacity:{
from:1, 
to:0.3, 
min:0, 
max:1, 
type:'linear', 
extrapolate:false, 
round:100}, 

translateX:{
from:0, 
to:-Math.round(Dimensions.get('window').width * 0.3), 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

scaleX:{
from:1, 
to:0.95, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true}, 

scaleY:{
from:1, 
to:0.95, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true}};



var FadeToTheRight=_extends({}, 
FadeToTheLeft, {
transformTranslate:{
from:{x:0, y:0, z:0}, 
to:{x:Math.round(SCREEN_WIDTH * 0.3), y:0, z:0}}, 

translateX:{
from:0, 
to:Math.round(SCREEN_WIDTH * 0.3)}});



var FadeIn={
opacity:{
from:0, 
to:1, 
min:0.5, 
max:1, 
type:'linear', 
extrapolate:false, 
round:100}};



var FadeOut={
opacity:{
from:1, 
to:0, 
min:0, 
max:0.5, 
type:'linear', 
extrapolate:false, 
round:100}};



var ToTheLeft={
transformTranslate:{
from:{x:0, y:0, z:0}, 
to:{x:-Dimensions.get('window').width, y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

opacity:{
value:1, 
type:'constant'}, 


translateX:{
from:0, 
to:-Dimensions.get('window').width, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}};



var FromTheRight={
opacity:{
value:1, 
type:'constant'}, 


transformTranslate:{
from:{x:Dimensions.get('window').width, y:0, z:0}, 
to:{x:0, y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 


translateX:{
from:Dimensions.get('window').width, 
to:0, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 


scaleX:{
value:1, 
type:'constant'}, 

scaleY:{
value:1, 
type:'constant'}};



var FromTheLeft=_extends({}, 
FromTheRight, {
transformTranslate:{
from:{x:-SCREEN_WIDTH, y:0, z:0}, 
to:{x:0, y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

translateX:{
from:-SCREEN_WIDTH, 
to:0, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}});



var ToTheBack={


transformTranslate:{
from:{x:0, y:0, z:0}, 
to:{x:0, y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

transformScale:{
from:{x:1, y:1, z:1}, 
to:{x:0.95, y:0.95, z:1}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true}, 

opacity:{
from:1, 
to:0.3, 
min:0, 
max:1, 
type:'linear', 
extrapolate:false, 
round:100}, 

scaleX:{
from:1, 
to:0.95, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true}, 

scaleY:{
from:1, 
to:0.95, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true}};



var FromTheFront={
opacity:{
value:1, 
type:'constant'}, 


transformTranslate:{
from:{x:0, y:Dimensions.get('window').height, z:0}, 
to:{x:0, y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

translateY:{
from:Dimensions.get('window').height, 
to:0, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

scaleX:{
value:1, 
type:'constant'}, 

scaleY:{
value:1, 
type:'constant'}};



var ToTheBackAndroid={
opacity:{
value:1, 
type:'constant'}};



var FromTheFrontAndroid={
opacity:{
from:0, 
to:1, 
min:0.5, 
max:1, 
type:'linear', 
extrapolate:false, 
round:100}, 

transformTranslate:{
from:{x:0, y:100, z:0}, 
to:{x:0, y:0, z:0}, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}, 

translateY:{
from:100, 
to:0, 
min:0, 
max:1, 
type:'linear', 
extrapolate:true, 
round:PixelRatio.get()}};



var BaseOverswipeConfig={
frictionConstant:1, 
frictionByDistance:1.5};


var BaseLeftToRightGesture={


isDetachable:false, 


gestureDetectMovement:2, 


notMoving:0.3, 


directionRatio:0.66, 


snapVelocity:2, 


edgeHitWidth:30, 


stillCompletionRatio:3 / 5, 

fullDistance:SCREEN_WIDTH, 

direction:'left-to-right'};



var BaseRightToLeftGesture=_extends({}, 
BaseLeftToRightGesture, {
direction:'right-to-left'});


var BaseConfig={

gestures:{
pop:BaseLeftToRightGesture}, 



springFriction:26, 
springTension:200, 


defaultTransitionVelocity:1.5, 


animationInterpolators:{
into:buildStyleInterpolator(FromTheRight), 
out:buildStyleInterpolator(FadeToTheLeft)}};



var NavigatorSceneConfigs={
PushFromRight:_extends({}, 
BaseConfig), 


FloatFromRight:_extends({}, 
BaseConfig), 


FloatFromLeft:_extends({}, 
BaseConfig, {
animationInterpolators:{
into:buildStyleInterpolator(FromTheLeft), 
out:buildStyleInterpolator(FadeToTheRight)}}), 


FloatFromBottom:_extends({}, 
BaseConfig, {
gestures:{
pop:_extends({}, 
BaseLeftToRightGesture, {
edgeHitWidth:150, 
direction:'top-to-bottom', 
fullDistance:SCREEN_HEIGHT})}, 


animationInterpolators:{
into:buildStyleInterpolator(FromTheFront), 
out:buildStyleInterpolator(ToTheBack)}}), 


FloatFromBottomAndroid:_extends({}, 
BaseConfig, {
gestures:null, 
defaultTransitionVelocity:3, 
springFriction:20, 
animationInterpolators:{
into:buildStyleInterpolator(FromTheFrontAndroid), 
out:buildStyleInterpolator(ToTheBackAndroid)}}), 


FadeAndroid:_extends({}, 
BaseConfig, {
gestures:null, 
animationInterpolators:{
into:buildStyleInterpolator(FadeIn), 
out:buildStyleInterpolator(FadeOut)}}), 


HorizontalSwipeJump:_extends({}, 
BaseConfig, {
gestures:{
jumpBack:_extends({}, 
BaseLeftToRightGesture, {
overswipe:BaseOverswipeConfig, 
edgeHitWidth:null, 
isDetachable:true}), 

jumpForward:_extends({}, 
BaseRightToLeftGesture, {
overswipe:BaseOverswipeConfig, 
edgeHitWidth:null, 
isDetachable:true})}, 


animationInterpolators:{
into:buildStyleInterpolator(FromTheRight), 
out:buildStyleInterpolator(ToTheLeft)}})};




module.exports = NavigatorSceneConfigs;});
__d('PanResponder',["TouchHistoryMath"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";





var TouchHistoryMath=require("TouchHistoryMath");

var currentCentroidXOfTouchesChangedAfter=
TouchHistoryMath.currentCentroidXOfTouchesChangedAfter;
var currentCentroidYOfTouchesChangedAfter=
TouchHistoryMath.currentCentroidYOfTouchesChangedAfter;
var previousCentroidXOfTouchesChangedAfter=
TouchHistoryMath.previousCentroidXOfTouchesChangedAfter;
var previousCentroidYOfTouchesChangedAfter=
TouchHistoryMath.previousCentroidYOfTouchesChangedAfter;
var currentCentroidX=TouchHistoryMath.currentCentroidX;
var currentCentroidY=TouchHistoryMath.currentCentroidY;










































































var PanResponder={
































































_initializeGestureState:function(gestureState){
gestureState.moveX = 0;
gestureState.moveY = 0;
gestureState.x0 = 0;
gestureState.y0 = 0;
gestureState.dx = 0;
gestureState.dy = 0;
gestureState.vx = 0;
gestureState.vy = 0;
gestureState.numberActiveTouches = 0;

gestureState._accountsForMovesUpTo = 0;}, 


























_updateGestureStateOnMove:function(gestureState, touchHistory){
gestureState.numberActiveTouches = touchHistory.numberActiveTouches;
gestureState.moveX = currentCentroidXOfTouchesChangedAfter(
touchHistory, 
gestureState._accountsForMovesUpTo);

gestureState.moveY = currentCentroidYOfTouchesChangedAfter(
touchHistory, 
gestureState._accountsForMovesUpTo);

var movedAfter=gestureState._accountsForMovesUpTo;
var prevX=previousCentroidXOfTouchesChangedAfter(touchHistory, movedAfter);
var x=currentCentroidXOfTouchesChangedAfter(touchHistory, movedAfter);
var prevY=previousCentroidYOfTouchesChangedAfter(touchHistory, movedAfter);
var y=currentCentroidYOfTouchesChangedAfter(touchHistory, movedAfter);
var nextDX=gestureState.dx + (x - prevX);
var nextDY=gestureState.dy + (y - prevY);


var dt=
touchHistory.mostRecentTimeStamp - gestureState._accountsForMovesUpTo;
gestureState.vx = (nextDX - gestureState.dx) / dt;
gestureState.vy = (nextDY - gestureState.dy) / dt;

gestureState.dx = nextDX;
gestureState.dy = nextDY;
gestureState._accountsForMovesUpTo = touchHistory.mostRecentTimeStamp;}, 

































create:function(config){
var gestureState={

stateID:Math.random()};

PanResponder._initializeGestureState(gestureState);
var panHandlers={
onStartShouldSetResponder:function(e){
return config.onStartShouldSetPanResponder === undefined?false:
config.onStartShouldSetPanResponder(e, gestureState);}, 

onMoveShouldSetResponder:function(e){
return config.onMoveShouldSetPanResponder === undefined?false:
config.onMoveShouldSetPanResponder(e, gestureState);}, 

onStartShouldSetResponderCapture:function(e){


if(e.nativeEvent.touches.length === 1){
PanResponder._initializeGestureState(gestureState);}

gestureState.numberActiveTouches = e.touchHistory.numberActiveTouches;
return config.onStartShouldSetPanResponderCapture !== undefined?
config.onStartShouldSetPanResponderCapture(e, gestureState):false;}, 


onMoveShouldSetResponderCapture:function(e){
var touchHistory=e.touchHistory;



if(gestureState._accountsForMovesUpTo === touchHistory.mostRecentTimeStamp){
return false;}

PanResponder._updateGestureStateOnMove(gestureState, touchHistory);
return config.onMoveShouldSetResponderCapture?
config.onMoveShouldSetPanResponderCapture(e, gestureState):false;}, 


onResponderGrant:function(e){
gestureState.x0 = currentCentroidX(e.touchHistory);
gestureState.y0 = currentCentroidY(e.touchHistory);
gestureState.dx = 0;
gestureState.dy = 0;
config.onPanResponderGrant && config.onPanResponderGrant(e, gestureState);}, 


onResponderReject:function(e){
config.onPanResponderReject && config.onPanResponderReject(e, gestureState);}, 


onResponderRelease:function(e){
config.onPanResponderRelease && config.onPanResponderRelease(e, gestureState);
PanResponder._initializeGestureState(gestureState);}, 


onResponderStart:function(e){
var touchHistory=e.touchHistory;
gestureState.numberActiveTouches = touchHistory.numberActiveTouches;
config.onPanResponderStart && config.onPanResponderStart(e, gestureState);}, 


onResponderMove:function(e){
var touchHistory=e.touchHistory;


if(gestureState._accountsForMovesUpTo === touchHistory.mostRecentTimeStamp){
return;}



PanResponder._updateGestureStateOnMove(gestureState, touchHistory);
config.onPanResponderMove && config.onPanResponderMove(e, gestureState);}, 


onResponderEnd:function(e){
var touchHistory=e.touchHistory;
gestureState.numberActiveTouches = touchHistory.numberActiveTouches;
config.onPanResponderEnd && config.onPanResponderEnd(e, gestureState);}, 


onResponderTerminate:function(e){
config.onPanResponderTerminate && 
config.onPanResponderTerminate(e, gestureState);
PanResponder._initializeGestureState(gestureState);}, 


onResponderTerminationRequest:function(e){
return config.onPanResponderTerminationRequest === undefined?true:
config.onPanResponderTerminationRequest(e, gestureState);}};


return {panHandlers:panHandlers};}};



module.exports = PanResponder;});
__d('TouchHistoryMath',[],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";





var TouchHistoryMath={
















centroidDimension:function(touchHistory, touchesChangedAfter, isXAxis, ofCurrent){
var touchBank=touchHistory.touchBank;
var total=0;
var count=0;

var oneTouchData=touchHistory.numberActiveTouches === 1?
touchHistory.touchBank[touchHistory.indexOfSingleActiveTouch]:null;

if(oneTouchData !== null){
if(oneTouchData.touchActive && oneTouchData.currentTimeStamp > touchesChangedAfter){
total += ofCurrent && isXAxis?oneTouchData.currentPageX:
ofCurrent && !isXAxis?oneTouchData.currentPageY:
!ofCurrent && isXAxis?oneTouchData.previousPageX:
oneTouchData.previousPageY;
count = 1;}}else 

{
for(var i=0; i < touchBank.length; i++) {
var touchTrack=touchBank[i];
if(touchTrack !== null && 
touchTrack !== undefined && 
touchTrack.touchActive && 
touchTrack.currentTimeStamp >= touchesChangedAfter){
var toAdd;
if(ofCurrent && isXAxis){
toAdd = touchTrack.currentPageX;}else 
if(ofCurrent && !isXAxis){
toAdd = touchTrack.currentPageY;}else 
if(!ofCurrent && isXAxis){
toAdd = touchTrack.previousPageX;}else 
{
toAdd = touchTrack.previousPageY;}

total += toAdd;
count++;}}}



return count > 0?total / count:TouchHistoryMath.noCentroid;}, 


currentCentroidXOfTouchesChangedAfter:function(touchHistory, touchesChangedAfter){
return TouchHistoryMath.centroidDimension(
touchHistory, 
touchesChangedAfter, 
true, 
true);}, 



currentCentroidYOfTouchesChangedAfter:function(touchHistory, touchesChangedAfter){
return TouchHistoryMath.centroidDimension(
touchHistory, 
touchesChangedAfter, 
false, 
true);}, 



previousCentroidXOfTouchesChangedAfter:function(touchHistory, touchesChangedAfter){
return TouchHistoryMath.centroidDimension(
touchHistory, 
touchesChangedAfter, 
true, 
false);}, 



previousCentroidYOfTouchesChangedAfter:function(touchHistory, touchesChangedAfter){
return TouchHistoryMath.centroidDimension(
touchHistory, 
touchesChangedAfter, 
false, 
false);}, 



currentCentroidX:function(touchHistory){
return TouchHistoryMath.centroidDimension(
touchHistory, 
0, 
true, 
true);}, 



currentCentroidY:function(touchHistory){
return TouchHistoryMath.centroidDimension(
touchHistory, 
0, 
false, 
true);}, 



noCentroid:-1};


module.exports = TouchHistoryMath;});
__d('clamp',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 























clamp(min, value, max){
if(value < min){
return min;}

if(value > max){
return max;}

return value;}


module.exports = clamp;});
__d('rebound/rebound',[],function(global, require, requireDynamic, requireLazy, module, exports) {  (


























































































































function(){
var rebound={};
var util=rebound.util = {};
var concat=Array.prototype.concat;
var slice=Array.prototype.slice;


util.bind = function bind(func, context){
var args=slice.call(arguments, 2);
return function(){
func.apply(context, concat.call(args, slice.call(arguments)));};};




util.extend = function extend(target, source){
for(var key in source) {
if(source.hasOwnProperty(key)){
target[key] = source[key];}}};









var SpringSystem=rebound.SpringSystem = function SpringSystem(looper){
this._springRegistry = {};
this._activeSprings = [];
this.listeners = [];
this._idleSpringIndices = [];
this.looper = looper || new AnimationLooper();
this.looper.springSystem = this;};


util.extend(SpringSystem.prototype, {

_springRegistry:null, 

_isIdle:true, 

_lastTimeMillis:-1, 

_activeSprings:null, 

listeners:null, 

_idleSpringIndices:null, 






setLooper:function(looper){
this.looper = looper;
looper.springSystem = this;}, 






createSpring:function(tension, friction){
var springConfig;
if(tension === undefined || friction === undefined){
springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;}else 
{
springConfig = 
SpringConfig.fromOrigamiTensionAndFriction(tension, friction);}

return this.createSpringWithConfig(springConfig);}, 





createSpringWithBouncinessAndSpeed:function(bounciness, speed){
var springConfig;
if(bounciness === undefined || speed === undefined){
springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;}else 
{
springConfig = 
SpringConfig.fromBouncinessAndSpeed(bounciness, speed);}

return this.createSpringWithConfig(springConfig);}, 



createSpringWithConfig:function(springConfig){
var spring=new Spring(this);
this.registerSpring(spring);
spring.setSpringConfig(springConfig);
return spring;}, 






getIsIdle:function(){
return this._isIdle;}, 





getSpringById:function(id){
return this._springRegistry[id];}, 




getAllSprings:function(){
var vals=[];
for(var id in this._springRegistry) {
if(this._springRegistry.hasOwnProperty(id)){
vals.push(this._springRegistry[id]);}}


return vals;}, 






registerSpring:function(spring){
this._springRegistry[spring.getId()] = spring;}, 






deregisterSpring:function(spring){
removeFirst(this._activeSprings, spring);
delete this._springRegistry[spring.getId()];}, 


advance:function(time, deltaTime){
while(this._idleSpringIndices.length > 0) this._idleSpringIndices.pop();
for(var i=0, len=this._activeSprings.length; i < len; i++) {
var spring=this._activeSprings[i];
if(spring.systemShouldAdvance()){
spring.advance(time / 1000, deltaTime / 1000);}else 
{
this._idleSpringIndices.push(this._activeSprings.indexOf(spring));}}


while(this._idleSpringIndices.length > 0) {
var idx=this._idleSpringIndices.pop();
idx >= 0 && this._activeSprings.splice(idx, 1);}}, 
















loop:function(currentTimeMillis){
var listener;
if(this._lastTimeMillis === -1){
this._lastTimeMillis = currentTimeMillis - 1;}

var ellapsedMillis=currentTimeMillis - this._lastTimeMillis;
this._lastTimeMillis = currentTimeMillis;

var i=0, len=this.listeners.length;
for(i = 0; i < len; i++) {
listener = this.listeners[i];
listener.onBeforeIntegrate && listener.onBeforeIntegrate(this);}


this.advance(currentTimeMillis, ellapsedMillis);
if(this._activeSprings.length === 0){
this._isIdle = true;
this._lastTimeMillis = -1;}


for(i = 0; i < len; i++) {
listener = this.listeners[i];
listener.onAfterIntegrate && listener.onAfterIntegrate(this);}


if(!this._isIdle){
this.looper.run();}}, 






activateSpring:function(springId){
var spring=this._springRegistry[springId];
if(this._activeSprings.indexOf(spring) == -1){
this._activeSprings.push(spring);}

if(this.getIsIdle()){
this._isIdle = false;
this.looper.run();}}, 






addListener:function(listener){
this.listeners.push(listener);}, 



removeListener:function(listener){
removeFirst(this.listeners, listener);}, 



removeAllListeners:function(){
this.listeners = [];}});


















var Spring=rebound.Spring = function Spring(springSystem){
this._id = 's' + Spring._ID++;
this._springSystem = springSystem;
this.listeners = [];
this._currentState = new PhysicsState();
this._previousState = new PhysicsState();
this._tempState = new PhysicsState();};


util.extend(Spring, {
_ID:0, 

MAX_DELTA_TIME_SEC:0.064, 

SOLVER_TIMESTEP_SEC:0.001});



util.extend(Spring.prototype, {

_id:0, 

_springConfig:null, 

_overshootClampingEnabled:false, 

_currentState:null, 

_previousState:null, 

_tempState:null, 

_startValue:0, 

_endValue:0, 

_wasAtRest:true, 

_restSpeedThreshold:0.001, 

_displacementFromRestThreshold:0.001, 

listeners:null, 

_timeAccumulator:0, 

_springSystem:null, 


destroy:function(){
this.listeners = [];
this.frames = [];
this._springSystem.deregisterSpring(this);}, 




getId:function(){
return this._id;}, 





setSpringConfig:function(springConfig){
this._springConfig = springConfig;
return this;}, 



getSpringConfig:function(){
return this._springConfig;}, 





























setCurrentValue:function(currentValue, skipSetAtRest){
this._startValue = currentValue;
this._currentState.position = currentValue;
if(!skipSetAtRest){
this.setAtRest();}

this.notifyPositionUpdated(false, false);
return this;}, 





getStartValue:function(){
return this._startValue;}, 



getCurrentValue:function(){
return this._currentState.position;}, 




getCurrentDisplacementDistance:function(){
return this.getDisplacementDistanceForState(this._currentState);}, 


getDisplacementDistanceForState:function(state){
return Math.abs(this._endValue - state.position);}, 








setEndValue:function(endValue){
if(this._endValue == endValue && this.isAtRest()){
return this;}

this._startValue = this.getCurrentValue();
this._endValue = endValue;
this._springSystem.activateSpring(this.getId());
for(var i=0, len=this.listeners.length; i < len; i++) {
var listener=this.listeners[i];
var onChange=listener.onSpringEndStateChange;
onChange && onChange(this);}

return this;}, 



getEndValue:function(){
return this._endValue;}, 









setVelocity:function(velocity){
if(velocity === this._currentState.velocity){
return this;}

this._currentState.velocity = velocity;
this._springSystem.activateSpring(this.getId());
return this;}, 



getVelocity:function(){
return this._currentState.velocity;}, 




setRestSpeedThreshold:function(restSpeedThreshold){
this._restSpeedThreshold = restSpeedThreshold;
return this;}, 



getRestSpeedThreshold:function(){
return this._restSpeedThreshold;}, 





setRestDisplacementThreshold:function(displacementFromRestThreshold){
this._displacementFromRestThreshold = displacementFromRestThreshold;}, 



getRestDisplacementThreshold:function(){
return this._displacementFromRestThreshold;}, 







setOvershootClampingEnabled:function(enabled){
this._overshootClampingEnabled = enabled;
return this;}, 



isOvershootClampingEnabled:function(){
return this._overshootClampingEnabled;}, 





isOvershooting:function(){
var start=this._startValue;
var end=this._endValue;
return this._springConfig.tension > 0 && (
start < end && this.getCurrentValue() > end || 
start > end && this.getCurrentValue() < end);}, 







advance:function(time, realDeltaTime){
var isAtRest=this.isAtRest();

if(isAtRest && this._wasAtRest){
return;}


var adjustedDeltaTime=realDeltaTime;
if(realDeltaTime > Spring.MAX_DELTA_TIME_SEC){
adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;}


this._timeAccumulator += adjustedDeltaTime;

var tension=this._springConfig.tension, 
friction=this._springConfig.friction, 

position=this._currentState.position, 
velocity=this._currentState.velocity, 
tempPosition=this._tempState.position, 
tempVelocity=this._tempState.velocity, 

aVelocity, aAcceleration, 
bVelocity, bAcceleration, 
cVelocity, cAcceleration, 
dVelocity, dAcceleration, 

dxdt, dvdt;

while(this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {

this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

if(this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC){
this._previousState.position = position;
this._previousState.velocity = velocity;}


aVelocity = velocity;
aAcceleration = 
tension * (this._endValue - tempPosition) - friction * velocity;

tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
tempVelocity = 
velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
bVelocity = tempVelocity;
bAcceleration = 
tension * (this._endValue - tempPosition) - friction * tempVelocity;

tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
tempVelocity = 
velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
cVelocity = tempVelocity;
cAcceleration = 
tension * (this._endValue - tempPosition) - friction * tempVelocity;

tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
tempVelocity = 
velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
dVelocity = tempVelocity;
dAcceleration = 
tension * (this._endValue - tempPosition) - friction * tempVelocity;

dxdt = 
1 / 6 * (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity);
dvdt = 1 / 6 * (
aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration);


position += dxdt * Spring.SOLVER_TIMESTEP_SEC;
velocity += dvdt * Spring.SOLVER_TIMESTEP_SEC;}


this._tempState.position = tempPosition;
this._tempState.velocity = tempVelocity;

this._currentState.position = position;
this._currentState.velocity = velocity;

if(this._timeAccumulator > 0){
this.interpolate(this._timeAccumulator / Spring.SOLVER_TIMESTEP_SEC);}


if(this.isAtRest() || 
this._overshootClampingEnabled && this.isOvershooting()){

if(this._springConfig.tension > 0){
this._startValue = this._endValue;
this._currentState.position = this._endValue;}else 
{
this._endValue = this._currentState.position;
this._startValue = this._endValue;}

this.setVelocity(0);
isAtRest = true;}


var notifyActivate=false;
if(this._wasAtRest){
this._wasAtRest = false;
notifyActivate = true;}


var notifyAtRest=false;
if(isAtRest){
this._wasAtRest = true;
notifyAtRest = true;}


this.notifyPositionUpdated(notifyActivate, notifyAtRest);}, 


notifyPositionUpdated:function(notifyActivate, notifyAtRest){
for(var i=0, len=this.listeners.length; i < len; i++) {
var listener=this.listeners[i];
if(notifyActivate && listener.onSpringActivate){
listener.onSpringActivate(this);}


if(listener.onSpringUpdate){
listener.onSpringUpdate(this);}


if(notifyAtRest && listener.onSpringAtRest){
listener.onSpringAtRest(this);}}}, 









systemShouldAdvance:function(){
return !this.isAtRest() || !this.wasAtRest();}, 


wasAtRest:function(){
return this._wasAtRest;}, 








isAtRest:function(){
return Math.abs(this._currentState.velocity) < this._restSpeedThreshold && (
this.getDisplacementDistanceForState(this._currentState) <= 
this._displacementFromRestThreshold || 
this._springConfig.tension === 0);}, 






setAtRest:function(){
this._endValue = this._currentState.position;
this._tempState.position = this._currentState.position;
this._currentState.velocity = 0;
return this;}, 


interpolate:function(alpha){
this._currentState.position = this._currentState.position * 
alpha + this._previousState.position * (1 - alpha);
this._currentState.velocity = this._currentState.velocity * 
alpha + this._previousState.velocity * (1 - alpha);}, 


getListeners:function(){
return this.listeners;}, 


addListener:function(newListener){
this.listeners.push(newListener);
return this;}, 


removeListener:function(listenerToRemove){
removeFirst(this.listeners, listenerToRemove);
return this;}, 


removeAllListeners:function(){
this.listeners = [];
return this;}, 


currentValueIsApproximately:function(value){
return Math.abs(this.getCurrentValue() - value) <= 
this.getRestDisplacementThreshold();}});









var PhysicsState=function PhysicsState(){};

util.extend(PhysicsState.prototype, {
position:0, 
velocity:0});








var SpringConfig=rebound.SpringConfig = 
function SpringConfig(tension, friction){
this.tension = tension;
this.friction = friction;};







var AnimationLooper=rebound.AnimationLooper = function AnimationLooper(){
this.springSystem = null;
var _this=this;
var _run=function(){
_this.springSystem.loop(Date.now());};


this.run = function(){
util.onFrame(_run);};};









rebound.SimulationLooper = function SimulationLooper(timestep){
this.springSystem = null;
var time=0;
var running=false;
timestep = timestep || 16.667;

this.run = function(){
if(running){
return;}

running = true;
while(!this.springSystem.getIsIdle()) {
this.springSystem.loop(time += timestep);}

running = false;};};








rebound.SteppingSimulationLooper = function(timestep){
this.springSystem = null;
var time=0;



this.run = function(){};


this.step = function(timestep){
this.springSystem.loop(time += timestep);};};








var OrigamiValueConverter=rebound.OrigamiValueConverter = {
tensionFromOrigamiValue:function(oValue){
return (oValue - 30) * 3.62 + 194;}, 


origamiValueFromTension:function(tension){
return (tension - 194) / 3.62 + 30;}, 


frictionFromOrigamiValue:function(oValue){
return (oValue - 8) * 3 + 25;}, 


origamiFromFriction:function(friction){
return (friction - 25) / 3 + 8;}};










var BouncyConversion=rebound.BouncyConversion = function(bounciness, speed){
this.bounciness = bounciness;
this.speed = speed;
var b=this.normalize(bounciness / 1.7, 0, 20);
b = this.projectNormal(b, 0, 0.8);
var s=this.normalize(speed / 1.7, 0, 20);
this.bouncyTension = this.projectNormal(s, 0.5, 200);
this.bouncyFriction = this.quadraticOutInterpolation(
b, 
this.b3Nobounce(this.bouncyTension), 
0.01);};


util.extend(BouncyConversion.prototype, {

normalize:function(value, startValue, endValue){
return (value - startValue) / (endValue - startValue);}, 


projectNormal:function(n, start, end){
return start + n * (end - start);}, 


linearInterpolation:function(t, start, end){
return t * end + (1 - t) * start;}, 


quadraticOutInterpolation:function(t, start, end){
return this.linearInterpolation(2 * t - t * t, start, end);}, 


b3Friction1:function(x){
return 0.0007 * Math.pow(x, 3) - 
0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;}, 


b3Friction2:function(x){
return 0.000044 * Math.pow(x, 3) - 
0.006 * Math.pow(x, 2) + 0.36 * x + 2;}, 


b3Friction3:function(x){
return 4.5e-7 * Math.pow(x, 3) - 
0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;}, 


b3Nobounce:function(tension){
var friction=0;
if(tension <= 18){
friction = this.b3Friction1(tension);}else 
if(tension > 18 && tension <= 44){
friction = this.b3Friction2(tension);}else 
{
friction = this.b3Friction3(tension);}

return friction;}});



util.extend(SpringConfig, {




fromOrigamiTensionAndFriction:function(tension, friction){
return new SpringConfig(
OrigamiValueConverter.tensionFromOrigamiValue(tension), 
OrigamiValueConverter.frictionFromOrigamiValue(friction));}, 





fromBouncinessAndSpeed:function(bounciness, speed){
var bouncyConversion=new rebound.BouncyConversion(bounciness, speed);
return this.fromOrigamiTensionAndFriction(
bouncyConversion.bouncyTension, 
bouncyConversion.bouncyFriction);}, 




coastingConfigWithOrigamiFriction:function(friction){
return new SpringConfig(
0, 
OrigamiValueConverter.frictionFromOrigamiValue(friction));}});




SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG = 
SpringConfig.fromOrigamiTensionAndFriction(40, 7);

util.extend(SpringConfig.prototype, {friction:0, tension:0});




var colorCache={};
util.hexToRGB = function(color){
if(colorCache[color]){
return colorCache[color];}

color = color.replace('#', '');
if(color.length === 3){
color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];}

var parts=color.match(/.{2}/g);

var ret={
r:parseInt(parts[0], 16), 
g:parseInt(parts[1], 16), 
b:parseInt(parts[2], 16)};


colorCache[color] = ret;
return ret;};


util.rgbToHex = function(r, g, b){
r = r.toString(16);
g = g.toString(16);
b = b.toString(16);
r = r.length < 2?'0' + r:r;
g = g.length < 2?'0' + g:g;
b = b.length < 2?'0' + b:b;
return '#' + r + g + b;};


var MathUtil=rebound.MathUtil = {








mapValueInRange:function(value, fromLow, fromHigh, toLow, toHigh){
var fromRangeSize=fromHigh - fromLow;
var toRangeSize=toHigh - toLow;
var valueScale=(value - fromLow) / fromRangeSize;
return toLow + valueScale * toRangeSize;}, 





interpolateColor:
function(val, startColor, endColor, fromLow, fromHigh, asRGB){
fromLow = fromLow === undefined?0:fromLow;
fromHigh = fromHigh === undefined?1:fromHigh;
startColor = util.hexToRGB(startColor);
endColor = util.hexToRGB(endColor);
var r=Math.floor(
util.mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r));

var g=Math.floor(
util.mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g));

var b=Math.floor(
util.mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b));

if(asRGB){
return 'rgb(' + r + ',' + g + ',' + b + ')';}else 
{
return util.rgbToHex(r, g, b);}}, 



degreesToRadians:function(deg){
return deg * Math.PI / 180;}, 


radiansToDegrees:function(rad){
return rad * 180 / Math.PI;}};




util.extend(util, MathUtil);







function removeFirst(array, item){
var idx=array.indexOf(item);
idx != -1 && array.splice(idx, 1);}


var _onFrame;
if(typeof window !== 'undefined'){
_onFrame = window.requestAnimationFrame || 
window.webkitRequestAnimationFrame || 
window.mozRequestAnimationFrame || 
window.msRequestAnimationFrame || 
window.oRequestAnimationFrame;}

if(!_onFrame && typeof process !== 'undefined' && process.title === 'node'){
_onFrame = setImmediate;}



util.onFrame = function onFrame(func){
return _onFrame(func);};




if(typeof exports != 'undefined'){
util.extend(exports, rebound);}else 
if(typeof window != 'undefined'){
window.rebound = rebound;}})();});
__d('NavigatorIOS',["EventEmitter","Image","React","ReactNativeViewAttributes","NativeModules","StyleSheet","StaticContainer.react","View","createReactNativeComponentClass","invariant","logError","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var EventEmitter=require('EventEmitter');
var Image=require('Image');
var React=require('React');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var RCTNavigatorManager=require('NativeModules').NavigatorManager;
var StyleSheet=require('StyleSheet');
var StaticContainer=require('StaticContainer.react');
var View=require('View');

var createReactNativeComponentClass=
require('createReactNativeComponentClass');
var invariant=require('invariant');
var logError=require('logError');
var merge=require('merge');

var TRANSITIONER_REF='transitionerRef';

var PropTypes=React.PropTypes;

var __uid=0;
function getuid(){
return __uid++;}


var RCTNavigator=createReactNativeComponentClass({
validAttributes:merge(ReactNativeViewAttributes.UIView, {
requestedTopOfStack:true}), 

uiViewClassName:'RCTNavigator'});


var RCTNavigatorItem=createReactNativeComponentClass({
validAttributes:{


title:true, 
barTintColor:true, 
leftButtonIcon:true, 
leftButtonTitle:true, 
onNavLeftButtonTap:true, 
rightButtonIcon:true, 
rightButtonTitle:true, 
onNavRightButtonTap:true, 
backButtonIcon:true, 
backButtonTitle:true, 
tintColor:true, 
navigationBarHidden:true, 
titleTextColor:true, 
style:true}, 

uiViewClassName:'RCTNavItem'});


var NavigatorTransitionerIOS=React.createClass({displayName:'NavigatorTransitionerIOS', 
requestSchedulingNavigation:function(cb){
RCTNavigatorManager.requestSchedulingJavaScriptNavigation(
React.findNodeHandle(this), 
logError, 
cb);}, 



render:function(){
return (
React.createElement(RCTNavigator, this.props));}});

























































































































var NavigatorIOS=React.createClass({displayName:'NavigatorIOS', 

propTypes:{






initialRoute:PropTypes.shape({



component:PropTypes.func.isRequired, 




title:PropTypes.string.isRequired, 





passProps:PropTypes.object, 






backButtonIcon:Image.propTypes.source, 






backButtonTitle:PropTypes.string, 




leftButtonIcon:Image.propTypes.source, 




leftButtonTitle:PropTypes.string, 




onLeftButtonPress:PropTypes.func, 




rightButtonIcon:Image.propTypes.source, 




rightButtonTitle:PropTypes.string, 




onRightButtonPress:PropTypes.func, 




wrapperStyle:View.propTypes.style}).

isRequired, 




navigationBarHidden:PropTypes.bool, 





itemWrapperStyle:View.propTypes.style, 




tintColor:PropTypes.string, 




barTintColor:PropTypes.string, 




titleTextColor:PropTypes.string}, 



navigator:undefined, 

componentWillMount:function(){


this.navigator = {
push:this.push, 
pop:this.pop, 
popN:this.popN, 
replace:this.replace, 
replacePrevious:this.replacePrevious, 
replacePreviousAndPop:this.replacePreviousAndPop, 
resetTo:this.resetTo, 
popToRoute:this.popToRoute, 
popToTop:this.popToTop};}, 



getInitialState:function(){
return {
idStack:[getuid()], 
routeStack:[this.props.initialRoute], 

requestedTopOfStack:0, 






observedTopOfStack:0, 
progress:1, 
fromIndex:0, 
toIndex:0, 


makingNavigatorRequest:false, 



updatingAllIndicesAtOrBeyond:0};}, 



_toFocusOnNavigationComplete:undefined, 

_handleFocusRequest:function(item){
if(this.state.makingNavigatorRequest){
this._toFocusOnNavigationComplete = item;}else 
{
this._getFocusEmitter().emit('focus', item);}}, 



_focusEmitter:undefined, 

_getFocusEmitter:function(){

var focusEmitter=this._focusEmitter;
if(!focusEmitter){
focusEmitter = new EventEmitter();
this._focusEmitter = focusEmitter;}

return focusEmitter;}, 


getChildContext:function()


{
return {
onFocusRequested:this._handleFocusRequest, 
focusEmitter:this._getFocusEmitter()};}, 



childContextTypes:{
onFocusRequested:React.PropTypes.func, 
focusEmitter:React.PropTypes.instanceOf(EventEmitter)}, 


_tryLockNavigator:function(cb){
this.refs[TRANSITIONER_REF].requestSchedulingNavigation(
function(acquiredLock){return acquiredLock && cb();});}, 



_handleNavigatorStackChanged:function(e){
var newObservedTopOfStack=e.nativeEvent.stackLength - 1;
invariant(
newObservedTopOfStack <= this.state.requestedTopOfStack, 
'No navigator item should be pushed without JS knowing about it %s %s', newObservedTopOfStack, this.state.requestedTopOfStack);

var wasWaitingForConfirmation=
this.state.requestedTopOfStack !== this.state.observedTopOfStack;
if(wasWaitingForConfirmation){
invariant(
newObservedTopOfStack === this.state.requestedTopOfStack, 
'If waiting for observedTopOfStack to reach requestedTopOfStack, ' + 
'the only valid observedTopOfStack should be requestedTopOfStack.');}











var nextState={
observedTopOfStack:newObservedTopOfStack, 
makingNavigatorRequest:false, 
updatingAllIndicesAtOrBeyond:null, 
progress:1, 
toIndex:newObservedTopOfStack, 
fromIndex:newObservedTopOfStack};

this.setState(nextState, this._eliminateUnneededChildren);}, 


_eliminateUnneededChildren:function(){



var updatingAllIndicesAtOrBeyond=
this.state.routeStack.length > this.state.observedTopOfStack + 1?
this.state.observedTopOfStack + 1:
null;
this.setState({
idStack:this.state.idStack.slice(0, this.state.observedTopOfStack + 1), 
routeStack:this.state.routeStack.slice(0, this.state.observedTopOfStack + 1), 

requestedTopOfStack:this.state.observedTopOfStack, 
makingNavigatorRequest:true, 
updatingAllIndicesAtOrBeyond:updatingAllIndicesAtOrBeyond});}, 



push:function(route){var _this=this;
invariant(!!route, 'Must supply route to push');

if(this.state.requestedTopOfStack === this.state.observedTopOfStack){
this._tryLockNavigator(function(){
var nextStack=_this.state.routeStack.concat([route]);
var nextIDStack=_this.state.idStack.concat([getuid()]);
_this.setState({


idStack:nextIDStack, 
routeStack:nextStack, 
requestedTopOfStack:nextStack.length - 1, 
makingNavigatorRequest:true, 
updatingAllIndicesAtOrBeyond:nextStack.length - 1});});}}, 





popN:function(n){var _this2=this;
if(n === 0){
return;}


if(this.state.requestedTopOfStack === this.state.observedTopOfStack){
if(this.state.requestedTopOfStack > 0){
this._tryLockNavigator(function(){
invariant(
_this2.state.requestedTopOfStack - n >= 0, 
'Cannot pop below 0');

_this2.setState({
requestedTopOfStack:_this2.state.requestedTopOfStack - n, 
makingNavigatorRequest:true, 


updatingAllIndicesAtOrBeyond:null});});}}}, 






pop:function(){
this.popN(1);}, 








replaceAtIndex:function(route, index){
invariant(!!route, 'Must supply route to replace');
if(index < 0){
index += this.state.routeStack.length;}


if(this.state.routeStack.length <= index){
return;}




var nextIDStack=this.state.idStack.slice();
var nextRouteStack=this.state.routeStack.slice();
nextIDStack[index] = getuid();
nextRouteStack[index] = route;

this.setState({
idStack:nextIDStack, 
routeStack:nextRouteStack, 
makingNavigatorRequest:false, 
updatingAllIndicesAtOrBeyond:index});}, 






replace:function(route){
this.replaceAtIndex(route, -1);}, 





replacePrevious:function(route){
this.replaceAtIndex(route, -2);}, 


popToTop:function(){
this.popToRoute(this.state.routeStack[0]);}, 


popToRoute:function(route){
var indexOfRoute=this.state.routeStack.indexOf(route);
invariant(
indexOfRoute !== -1, 
'Calling pop to route for a route that doesn\'t exist!');

var numToPop=this.state.routeStack.length - indexOfRoute - 1;
this.popN(numToPop);}, 


replacePreviousAndPop:function(route){var _this3=this;

if(this.state.requestedTopOfStack !== this.state.observedTopOfStack){
return;}

if(this.state.routeStack.length < 2){
return;}

this._tryLockNavigator(function(){
_this3.replacePrevious(route);
_this3.setState({
requestedTopOfStack:_this3.state.requestedTopOfStack - 1, 
makingNavigatorRequest:true});});}, 




resetTo:function(route){
invariant(!!route, 'Must supply route to push');

if(this.state.requestedTopOfStack !== this.state.observedTopOfStack){
return;}

this.replaceAtIndex(route, 0);
this.popToRoute(route);}, 


handleNavigationComplete:function(e){
if(this._toFocusOnNavigationComplete){
this._getFocusEmitter().emit('focus', this._toFocusOnNavigationComplete);
this._toFocusOnNavigationComplete = null;}

this._handleNavigatorStackChanged(e);}, 


_routeToStackItem:function(route, i){
var Component=route.component;
var shouldUpdateChild=this.state.updatingAllIndicesAtOrBeyond !== null && 
this.state.updatingAllIndicesAtOrBeyond >= i;

return (
React.createElement(StaticContainer, {key:'nav' + i, shouldUpdate:shouldUpdateChild}, 
React.createElement(RCTNavigatorItem, {
title:route.title, 
style:[
styles.stackItem, 
this.props.itemWrapperStyle, 
route.wrapperStyle], 

backButtonIcon:this._imageNameFromSource(route.backButtonIcon), 
backButtonTitle:route.backButtonTitle, 
leftButtonIcon:this._imageNameFromSource(route.leftButtonIcon), 
leftButtonTitle:route.leftButtonTitle, 
onNavLeftButtonTap:route.onLeftButtonPress, 
rightButtonIcon:this._imageNameFromSource(route.rightButtonIcon), 
rightButtonTitle:route.rightButtonTitle, 
onNavRightButtonTap:route.onRightButtonPress, 
navigationBarHidden:this.props.navigationBarHidden, 
tintColor:this.props.tintColor, 
barTintColor:this.props.barTintColor, 
titleTextColor:this.props.titleTextColor}, 
React.createElement(Component, _extends({
navigator:this.navigator, 
route:route}, 
route.passProps)))));}, 






_imageNameFromSource:function(source){
return source?source.uri:undefined;}, 


renderNavigationStackItems:function(){
var shouldRecurseToNavigator=
this.state.makingNavigatorRequest || 
this.state.updatingAllIndicesAtOrBeyond !== null;


var items=shouldRecurseToNavigator?
this.state.routeStack.map(this._routeToStackItem):null;
return (
React.createElement(StaticContainer, {shouldUpdate:shouldRecurseToNavigator}, 
React.createElement(NavigatorTransitionerIOS, {
ref:TRANSITIONER_REF, 
style:styles.transitioner, 
vertical:this.props.vertical, 
requestedTopOfStack:this.state.requestedTopOfStack, 
onNavigationComplete:this.handleNavigationComplete}, 
items)));}, 





render:function(){
return (
React.createElement(View, {style:this.props.style}, 
this.renderNavigationStackItems()));}});





var styles=StyleSheet.create({
stackItem:{
backgroundColor:'white', 
overflow:'hidden', 
position:'absolute', 
top:0, 
left:0, 
right:0, 
bottom:0}, 

transitioner:{
flex:1}});



module.exports = NavigatorIOS;});
__d('PickerIOS',["NativeMethodsMixin","React","ReactChildren","ReactNativeViewAttributes","NativeModules","StyleSheet","View","requireNativeComponent","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var NativeMethodsMixin=require('NativeMethodsMixin');
var React=require('React');
var ReactChildren=require('ReactChildren');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var RCTPickerIOSConsts=require('NativeModules').UIManager.RCTPicker.Constants;
var StyleSheet=require('StyleSheet');
var View=require('View');

var requireNativeComponent=require('requireNativeComponent');
var merge=require('merge');

var PICKER='picker';

var PickerIOS=React.createClass({displayName:'PickerIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{
onValueChange:React.PropTypes.func, 
selectedValue:React.PropTypes.any}, 


getInitialState:function(){
return this._stateFromProps(this.props);}, 


componentWillReceiveProps:function(nextProps){
this.setState(this._stateFromProps(nextProps));}, 



_stateFromProps:function(props){
var selectedIndex=0;
var items=[];
ReactChildren.forEach(props.children, function(child, index){
if(child.props.value === props.selectedValue){
selectedIndex = index;}

items.push({value:child.props.value, label:child.props.label});});

return {selectedIndex:selectedIndex, items:items};}, 


render:function(){
return (
React.createElement(View, {style:this.props.style}, 
React.createElement(RCTPickerIOS, {
ref:PICKER, 
style:styles.pickerIOS, 
items:this.state.items, 
selectedIndex:this.state.selectedIndex, 
onChange:this._onChange})));}, 





_onChange:function(event){
if(this.props.onChange){
this.props.onChange(event);}

if(this.props.onValueChange){
this.props.onValueChange(event.nativeEvent.newValue);}








if(this.state.selectedIndex !== event.nativeEvent.newIndex){
this.refs[PICKER].setNativeProps({
selectedIndex:this.state.selectedIndex});}}});





PickerIOS.Item = React.createClass({displayName:'Item', 
propTypes:{
value:React.PropTypes.any, 
label:React.PropTypes.string}, 


render:function(){

return null;}});



var styles=StyleSheet.create({
pickerIOS:{



height:RCTPickerIOSConsts.ComponentHeight}});



var RCTPickerIOS=requireNativeComponent('RCTPicker', null);

module.exports = PickerIOS;});
__d('ProgressViewIOS',["Image","NativeMethodsMixin","NativeModules","ReactPropTypes","React","StyleSheet","requireNativeComponent","verifyPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var Image=require('Image');
var NativeMethodsMixin=require('NativeMethodsMixin');
var NativeModules=require('NativeModules');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var StyleSheet=require('StyleSheet');

var requireNativeComponent=require('requireNativeComponent');
var verifyPropTypes=require('verifyPropTypes');




var ProgressViewIOS=React.createClass({displayName:'ProgressViewIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{



progressViewStyle:PropTypes.oneOf(['default', 'bar']), 




progress:PropTypes.number, 




progressTintColor:PropTypes.string, 




trackTintColor:PropTypes.string, 




progressImage:Image.propTypes.source, 




trackImage:Image.propTypes.source}, 


render:function(){
return (
React.createElement(RCTProgressView, _extends({}, 
this.props, {
style:[styles.progressView, this.props.style]})));}});





var styles=StyleSheet.create({
progressView:{
height:NativeModules.ProgressViewManager.ComponentHeight}});



var RCTProgressView=requireNativeComponent(
'RCTProgressView', 
ProgressViewIOS);


module.exports = ProgressViewIOS;});
__d('SegmentedControlIOS',["NativeMethodsMixin","NativeModules","ReactPropTypes","React","StyleSheet","requireNativeComponent","verifyPropTypes"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var NativeMethodsMixin=require('NativeMethodsMixin');
var NativeModules=require('NativeModules');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var StyleSheet=require('StyleSheet');

var requireNativeComponent=require('requireNativeComponent');
var verifyPropTypes=require('verifyPropTypes');






var SEGMENTED_CONTROL_REFERENCE='segmentedcontrol';






var SegmentedControlIOS=React.createClass({displayName:'SegmentedControlIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{



values:PropTypes.arrayOf(PropTypes.string), 




selectedIndex:PropTypes.number, 





onValueChange:PropTypes.func, 





onChange:PropTypes.func, 





enabled:PropTypes.bool, 




tintColor:PropTypes.string, 





momentary:PropTypes.bool}, 


getDefaultProps:function(){
return {
values:[], 
enabled:true};}, 



_onChange:function(event){
this.props.onChange && this.props.onChange(event);
this.props.onValueChange && this.props.onValueChange(event.nativeEvent.value);}, 


render:function(){
return (
React.createElement(RCTSegmentedControl, _extends({}, 
this.props, {
ref:SEGMENTED_CONTROL_REFERENCE, 
style:[styles.segmentedControl, this.props.style], 
onChange:this._onChange})));}});





var styles=StyleSheet.create({
segmentedControl:{
height:NativeModules.SegmentedControlManager.ComponentHeight}});



var RCTSegmentedControl=requireNativeComponent(
'RCTSegmentedControl', 
SegmentedControlIOS);


module.exports = SegmentedControlIOS;});
__d('SliderIOS',["NativeMethodsMixin","ReactPropTypes","React","StyleSheet","View","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeMethodsMixin=require('NativeMethodsMixin');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var StyleSheet=require('StyleSheet');
var View=require('View');

var requireNativeComponent=require('requireNativeComponent');



var SliderIOS=React.createClass({displayName:'SliderIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{




style:View.propTypes.style, 









value:PropTypes.number, 




minimumValue:PropTypes.number, 




maximumValue:PropTypes.number, 





minimumTrackTintColor:PropTypes.string, 





maximumTrackTintColor:PropTypes.string, 




onValueChange:PropTypes.func, 





onSlidingComplete:PropTypes.func}, 


_onValueChange:function(event){
this.props.onChange && this.props.onChange(event);
if(event.nativeEvent.continuous){
this.props.onValueChange && 
this.props.onValueChange(event.nativeEvent.value);}else 
{
this.props.onSlidingComplete && event.nativeEvent.value !== undefined && 
this.props.onSlidingComplete(event.nativeEvent.value);}}, 



render:function(){
return (
React.createElement(RCTSlider, {
style:[styles.slider, this.props.style], 
value:this.props.value, 
maximumValue:this.props.maximumValue, 
minimumValue:this.props.minimumValue, 
minimumTrackTintColor:this.props.minimumTrackTintColor, 
maximumTrackTintColor:this.props.maximumTrackTintColor, 
onChange:this._onValueChange}));}});





var styles=StyleSheet.create({
slider:{
height:40}});



var RCTSlider=requireNativeComponent('RCTSlider', SliderIOS);

module.exports = SliderIOS;});
__d('SwitchIOS',["NativeMethodsMixin","ReactPropTypes","React","StyleSheet","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};














var NativeMethodsMixin=require('NativeMethodsMixin');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var StyleSheet=require('StyleSheet');

var requireNativeComponent=require('requireNativeComponent');

var SWITCH='switch';















var SwitchIOS=React.createClass({displayName:'SwitchIOS', 
mixins:[NativeMethodsMixin], 

propTypes:{




value:PropTypes.bool, 





disabled:PropTypes.bool, 




onValueChange:PropTypes.func, 




onTintColor:PropTypes.string, 




thumbTintColor:PropTypes.string, 




tintColor:PropTypes.string}, 


getDefaultProps:function(){
return {
value:false, 
disabled:false};}, 



_onChange:function(event){
this.props.onChange && this.props.onChange(event);
this.props.onValueChange && this.props.onValueChange(event.nativeEvent.value);



this.refs[SWITCH].setNativeProps({value:this.props.value});}, 


render:function(){
return (
React.createElement(RCTSwitch, _extends({}, 
this.props, {
ref:SWITCH, 
onChange:this._onChange, 
style:[styles.rkSwitch, this.props.style]})));}});





var styles=StyleSheet.create({
rkSwitch:{
height:31, 
width:51}});



var RCTSwitch=requireNativeComponent('RCTSwitch', SwitchIOS);

module.exports = SwitchIOS;});
__d('TabBarIOS',["React","StyleSheet","TabBarItemIOS","View","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var React=require('React');
var StyleSheet=require('StyleSheet');
var TabBarItemIOS=require('TabBarItemIOS');
var View=require('View');

var requireNativeComponent=require('requireNativeComponent');

var TabBarIOS=React.createClass({displayName:'TabBarIOS', 
statics:{
Item:TabBarItemIOS}, 


propTypes:{
style:View.propTypes.style, 



tintColor:React.PropTypes.string, 



barTintColor:React.PropTypes.string}, 


render:function(){
return (
React.createElement(RCTTabBar, {
style:[styles.tabGroup, this.props.style], 
tintColor:this.props.tintColor, 
barTintColor:this.props.barTintColor}, 
this.props.children));}});





var styles=StyleSheet.create({
tabGroup:{
flex:1}});



var RCTTabBar=requireNativeComponent('RCTTabBar', TabBarIOS);

module.exports = TabBarIOS;});
__d('TabBarItemIOS',["Image","React","StaticContainer.react","StyleSheet","View","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var Image=require('Image');
var React=require('React');
var StaticContainer=require('StaticContainer.react');
var StyleSheet=require('StyleSheet');
var View=require('View');

var requireNativeComponent=require('requireNativeComponent');

var TabBarItemIOS=React.createClass({displayName:'TabBarItemIOS', 
propTypes:{



badge:React.PropTypes.oneOfType([
React.PropTypes.string, 
React.PropTypes.number]), 






systemIcon:React.PropTypes.oneOf([
'bookmarks', 
'contacts', 
'downloads', 
'favorites', 
'featured', 
'history', 
'more', 
'most-recent', 
'most-viewed', 
'recents', 
'search', 
'top-rated']), 




icon:Image.propTypes.source, 




selectedIcon:Image.propTypes.source, 




onPress:React.PropTypes.func, 




selected:React.PropTypes.bool, 



style:View.propTypes.style, 




title:React.PropTypes.string}, 


getInitialState:function(){
return {
hasBeenSelected:false};}, 



componentWillMount:function(){
if(this.props.selected){
this.setState({hasBeenSelected:true});}}, 



componentWillReceiveProps:function(nextProps){
if(this.state.hasBeenSelected || nextProps.selected){
this.setState({hasBeenSelected:true});}}, 



render:function(){
var tabContents=null;


if(this.state.hasBeenSelected){
tabContents = 
React.createElement(StaticContainer, {shouldUpdate:this.props.selected}, 
this.props.children);}else 

{
tabContents = React.createElement(View, null);}


var icon=this.props.systemIcon || 
this.props.icon && this.props.icon.uri;


var badge=typeof this.props.badge === 'number'?
'' + this.props.badge:
this.props.badge;

return (
React.createElement(RCTTabBarItem, {
icon:icon, 
selectedIcon:this.props.selectedIcon && this.props.selectedIcon.uri, 
onPress:this.props.onPress, 
selected:this.props.selected, 
badge:badge, 
title:this.props.title, 
style:[styles.tab, this.props.style]}, 
tabContents));}});





var styles=StyleSheet.create({
tab:{
position:'absolute', 
top:0, 
right:0, 
bottom:0, 
left:0}});



var RCTTabBarItem=requireNativeComponent('RCTTabBarItem', TabBarItemIOS);

module.exports = TabBarItemIOS;});
__d('Text',["NativeMethodsMixin","Platform","React","ReactInstanceMap","ReactNativeViewAttributes","StyleSheetPropType","TextStylePropTypes","Touchable","createReactNativeComponentClass","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeMethodsMixin=require('NativeMethodsMixin');
var Platform=require('Platform');
var React=require('React');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var StyleSheetPropType=require('StyleSheetPropType');
var TextStylePropTypes=require('TextStylePropTypes');
var Touchable=require('Touchable');

var createReactNativeComponentClass=
require('createReactNativeComponentClass');
var merge=require('merge');

var stylePropType=StyleSheetPropType(TextStylePropTypes);

var viewConfig={
validAttributes:merge(ReactNativeViewAttributes.UIView, {
isHighlighted:true, 
numberOfLines:true}), 

uiViewClassName:'RCTText'};



































var Text=React.createClass({displayName:'Text', 

mixins:[Touchable.Mixin, NativeMethodsMixin], 

propTypes:{





numberOfLines:React.PropTypes.number, 





onPress:React.PropTypes.func, 




suppressHighlighting:React.PropTypes.bool, 
style:stylePropType, 



testID:React.PropTypes.string, 





onLayout:React.PropTypes.func}, 


viewConfig:viewConfig, 

getInitialState:function(){
return merge(this.touchableGetInitialState(), {
isHighlighted:false});}, 



onStartShouldSetResponder:function(){
var shouldSetFromProps=this.props.onStartShouldSetResponder && 
this.props.onStartShouldSetResponder();
return shouldSetFromProps || !!this.props.onPress;}, 





handleResponderTerminationRequest:function(){


var allowTermination=this.touchableHandleResponderTerminationRequest();
if(allowTermination && this.props.onResponderTerminationRequest){
allowTermination = this.props.onResponderTerminationRequest();}

return allowTermination;}, 


handleResponderGrant:function(e, dispatchID){
this.touchableHandleResponderGrant(e, dispatchID);
this.props.onResponderGrant && 
this.props.onResponderGrant.apply(this, arguments);}, 


handleResponderMove:function(e){
this.touchableHandleResponderMove(e);
this.props.onResponderMove && 
this.props.onResponderMove.apply(this, arguments);}, 


handleResponderRelease:function(e){
this.touchableHandleResponderRelease(e);
this.props.onResponderRelease && 
this.props.onResponderRelease.apply(this, arguments);}, 


handleResponderTerminate:function(e){
this.touchableHandleResponderTerminate(e);
this.props.onResponderTerminate && 
this.props.onResponderTerminate.apply(this, arguments);}, 


touchableHandleActivePressIn:function(){
if(this.props.suppressHighlighting || !this.props.onPress){
return;}

this.setState({
isHighlighted:true});}, 



touchableHandleActivePressOut:function(){
if(this.props.suppressHighlighting || !this.props.onPress){
return;}

this.setState({
isHighlighted:false});}, 



touchableHandlePress:function(){
this.props.onPress && this.props.onPress();}, 


touchableGetPressRectOffset:function(){
return PRESS_RECT_OFFSET;}, 


getChildContext:function(){
return {isInAParentText:true};}, 


childContextTypes:{
isInAParentText:React.PropTypes.bool}, 


render:function(){
var props={};
for(var key in this.props) {
props[key] = this.props[key];}


if(props.accessible !== false){
props.accessible = true;}

props.isHighlighted = this.state.isHighlighted;
props.onStartShouldSetResponder = this.onStartShouldSetResponder;
props.onResponderTerminationRequest = 
this.handleResponderTerminationRequest;
props.onResponderGrant = this.handleResponderGrant;
props.onResponderMove = this.handleResponderMove;
props.onResponderRelease = this.handleResponderRelease;
props.onResponderTerminate = this.handleResponderTerminate;


var context=ReactInstanceMap.get(this)._context;
if(context.isInAParentText){
return React.createElement(RCTVirtualText, props);}else 
{
return React.createElement(RCTText, props);}}});











var PRESS_RECT_OFFSET={top:20, left:20, right:20, bottom:30};

var RCTText=createReactNativeComponentClass(viewConfig);
var RCTVirtualText=RCTText;

if(Platform.OS === 'android'){
RCTVirtualText = createReactNativeComponentClass({
validAttributes:merge(ReactNativeViewAttributes.UIView, {
isHighlighted:true}), 

uiViewClassName:'RCTVirtualText'});}



module.exports = Text;});
__d('Touchable',["BoundingDimensions","Position","TouchEventUtils","keyMirror","queryLayoutByID"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';





var BoundingDimensions=require('BoundingDimensions');
var Position=require('Position');
var TouchEventUtils=require('TouchEventUtils');

var keyMirror=require('keyMirror');
var queryLayoutByID=require('queryLayoutByID');

























































































var States=keyMirror({
NOT_RESPONDER:null, 
RESPONDER_INACTIVE_PRESS_IN:null, 
RESPONDER_INACTIVE_PRESS_OUT:null, 
RESPONDER_ACTIVE_PRESS_IN:null, 
RESPONDER_ACTIVE_PRESS_OUT:null, 
RESPONDER_ACTIVE_LONG_PRESS_IN:null, 
RESPONDER_ACTIVE_LONG_PRESS_OUT:null, 
ERROR:null});





var IsActive={
RESPONDER_ACTIVE_PRESS_OUT:true, 
RESPONDER_ACTIVE_PRESS_IN:true};






var IsPressingIn={
RESPONDER_INACTIVE_PRESS_IN:true, 
RESPONDER_ACTIVE_PRESS_IN:true, 
RESPONDER_ACTIVE_LONG_PRESS_IN:true};


var IsLongPressingIn={
RESPONDER_ACTIVE_LONG_PRESS_IN:true};





var Signals=keyMirror({
DELAY:null, 
RESPONDER_GRANT:null, 
RESPONDER_RELEASE:null, 
RESPONDER_TERMINATED:null, 
ENTER_PRESS_RECT:null, 
LEAVE_PRESS_RECT:null, 
LONG_PRESS_DETECTED:null});





var Transitions={
NOT_RESPONDER:{
DELAY:States.ERROR, 
RESPONDER_GRANT:States.RESPONDER_INACTIVE_PRESS_IN, 
RESPONDER_RELEASE:States.ERROR, 
RESPONDER_TERMINATED:States.ERROR, 
ENTER_PRESS_RECT:States.ERROR, 
LEAVE_PRESS_RECT:States.ERROR, 
LONG_PRESS_DETECTED:States.ERROR}, 

RESPONDER_INACTIVE_PRESS_IN:{
DELAY:States.RESPONDER_ACTIVE_PRESS_IN, 
RESPONDER_GRANT:States.ERROR, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.RESPONDER_INACTIVE_PRESS_IN, 
LEAVE_PRESS_RECT:States.RESPONDER_INACTIVE_PRESS_OUT, 
LONG_PRESS_DETECTED:States.ERROR}, 

RESPONDER_INACTIVE_PRESS_OUT:{
DELAY:States.RESPONDER_ACTIVE_PRESS_OUT, 
RESPONDER_GRANT:States.ERROR, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.RESPONDER_INACTIVE_PRESS_IN, 
LEAVE_PRESS_RECT:States.RESPONDER_INACTIVE_PRESS_OUT, 
LONG_PRESS_DETECTED:States.ERROR}, 

RESPONDER_ACTIVE_PRESS_IN:{
DELAY:States.ERROR, 
RESPONDER_GRANT:States.ERROR, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.RESPONDER_ACTIVE_PRESS_IN, 
LEAVE_PRESS_RECT:States.RESPONDER_ACTIVE_PRESS_OUT, 
LONG_PRESS_DETECTED:States.RESPONDER_ACTIVE_LONG_PRESS_IN}, 

RESPONDER_ACTIVE_PRESS_OUT:{
DELAY:States.ERROR, 
RESPONDER_GRANT:States.ERROR, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.RESPONDER_ACTIVE_PRESS_IN, 
LEAVE_PRESS_RECT:States.RESPONDER_ACTIVE_PRESS_OUT, 
LONG_PRESS_DETECTED:States.ERROR}, 

RESPONDER_ACTIVE_LONG_PRESS_IN:{
DELAY:States.ERROR, 
RESPONDER_GRANT:States.ERROR, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.RESPONDER_ACTIVE_LONG_PRESS_IN, 
LEAVE_PRESS_RECT:States.RESPONDER_ACTIVE_LONG_PRESS_OUT, 
LONG_PRESS_DETECTED:States.RESPONDER_ACTIVE_LONG_PRESS_IN}, 

RESPONDER_ACTIVE_LONG_PRESS_OUT:{
DELAY:States.ERROR, 
RESPONDER_GRANT:States.ERROR, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.RESPONDER_ACTIVE_LONG_PRESS_IN, 
LEAVE_PRESS_RECT:States.RESPONDER_ACTIVE_LONG_PRESS_OUT, 
LONG_PRESS_DETECTED:States.ERROR}, 

error:{
DELAY:States.NOT_RESPONDER, 
RESPONDER_GRANT:States.RESPONDER_INACTIVE_PRESS_IN, 
RESPONDER_RELEASE:States.NOT_RESPONDER, 
RESPONDER_TERMINATED:States.NOT_RESPONDER, 
ENTER_PRESS_RECT:States.NOT_RESPONDER, 
LEAVE_PRESS_RECT:States.NOT_RESPONDER, 
LONG_PRESS_DETECTED:States.NOT_RESPONDER}};






var HIGHLIGHT_DELAY_MS=130;

var PRESS_EXPAND_PX=20;

var LONG_PRESS_THRESHOLD=500;

var LONG_PRESS_DELAY_MS=LONG_PRESS_THRESHOLD - HIGHLIGHT_DELAY_MS;

var LONG_PRESS_ALLOWED_MOVEMENT=10;



































































var TouchableMixin={







touchableGetInitialState:function(){
return {
touchable:{touchState:undefined, responderID:null}};}, 







touchableHandleResponderTerminationRequest:function(){
return !this.props.rejectResponderTermination;}, 





touchableHandleStartShouldSetResponder:function(){
return true;}, 





touchableLongPressCancelsPress:function(){
return true;}, 








touchableHandleResponderGrant:function(e, dispatchID){



e.persist();

this.pressOutDelayTimeout && clearTimeout(this.pressOutDelayTimeout);
this.pressOutDelayTimeout = null;

this.state.touchable.touchState = States.NOT_RESPONDER;
this.state.touchable.responderID = dispatchID;
this._receiveSignal(Signals.RESPONDER_GRANT, e);
var delayMS=
this.touchableGetHighlightDelayMS !== undefined?
Math.max(this.touchableGetHighlightDelayMS(), 0):HIGHLIGHT_DELAY_MS;
delayMS = isNaN(delayMS)?HIGHLIGHT_DELAY_MS:delayMS;
if(delayMS !== 0){
this.touchableDelayTimeout = setTimeout(
this._handleDelay.bind(this, e), 
delayMS);}else 

{
this._handleDelay(e);}


var longDelayMS=
this.touchableGetLongPressDelayMS !== undefined?
Math.max(this.touchableGetLongPressDelayMS(), 10):LONG_PRESS_DELAY_MS;
longDelayMS = isNaN(longDelayMS)?LONG_PRESS_DELAY_MS:longDelayMS;
this.longPressDelayTimeout = setTimeout(
this._handleLongDelay.bind(this, e), 
longDelayMS + delayMS);}, 






touchableHandleResponderRelease:function(e){
this._receiveSignal(Signals.RESPONDER_RELEASE, e);}, 





touchableHandleResponderTerminate:function(e){
this._receiveSignal(Signals.RESPONDER_TERMINATED, e);}, 





touchableHandleResponderMove:function(e){


if(this.state.touchable.touchState === States.RESPONDER_INACTIVE_PRESS_IN){
return;}



if(!this.state.touchable.positionOnActivate){
return;}


var positionOnActivate=this.state.touchable.positionOnActivate;
var dimensionsOnActivate=this.state.touchable.dimensionsOnActivate;
var pressRectOffset=this.touchableGetPressRectOffset?
this.touchableGetPressRectOffset():null;
var pressExpandLeft=
pressRectOffset.left != null?pressRectOffset.left:PRESS_EXPAND_PX;
var pressExpandTop=
pressRectOffset.top != null?pressRectOffset.top:PRESS_EXPAND_PX;
var pressExpandRight=
pressRectOffset.right != null?pressRectOffset.right:PRESS_EXPAND_PX;
var pressExpandBottom=
pressRectOffset.bottom != null?pressRectOffset.bottom:PRESS_EXPAND_PX;

var touch=TouchEventUtils.extractSingleTouch(e.nativeEvent);
var pageX=touch && touch.pageX;
var pageY=touch && touch.pageY;

if(this.pressInLocation){
var movedDistance=this._getDistanceBetweenPoints(pageX, pageY, this.pressInLocation.pageX, this.pressInLocation.pageY);
if(movedDistance > LONG_PRESS_ALLOWED_MOVEMENT){
this._cancelLongPressDelayTimeout();}}



var isTouchWithinActive=
pageX > positionOnActivate.left - pressExpandLeft && 
pageY > positionOnActivate.top - pressExpandTop && 
pageX < 
positionOnActivate.left + 
dimensionsOnActivate.width + 
pressExpandRight && 
pageY < 
positionOnActivate.top + 
dimensionsOnActivate.height + 
pressExpandBottom;
if(isTouchWithinActive){
this._receiveSignal(Signals.ENTER_PRESS_RECT, e);}else 
{
this._cancelLongPressDelayTimeout();
this._receiveSignal(Signals.LEAVE_PRESS_RECT, e);}}, 

















































































_remeasureMetricsOnActivation:function(){
queryLayoutByID(
this.state.touchable.responderID, 
null, 
this._handleQueryLayout);}, 



_handleQueryLayout:function(l, t, w, h, globalX, globalY){
this.state.touchable.positionOnActivate && 
Position.release(this.state.touchable.positionOnActivate);
this.state.touchable.dimensionsOnActivate && 
BoundingDimensions.release(this.state.touchable.dimensionsOnActivate);
this.state.touchable.positionOnActivate = Position.getPooled(globalX, globalY);
this.state.touchable.dimensionsOnActivate = BoundingDimensions.getPooled(w, h);}, 


_handleDelay:function(e){
this.touchableDelayTimeout = null;
this._receiveSignal(Signals.DELAY, e);}, 


_handleLongDelay:function(e){
this.longPressDelayTimeout = null;
this._receiveSignal(Signals.LONG_PRESS_DETECTED, e);}, 










_receiveSignal:function(signal, e){
var curState=this.state.touchable.touchState;
if(!(Transitions[curState] && Transitions[curState][signal])){
throw new Error(
'Unrecognized signal `' + signal + '` or state `' + curState + 
'` for Touchable responder `' + this.state.touchable.responderID + '`');}


var nextState=Transitions[curState][signal];
if(nextState === States.ERROR){
throw new Error(
'Touchable cannot transition from `' + curState + '` to `' + signal + 
'` for responder `' + this.state.touchable.responderID + '`');}


if(curState !== nextState){
this._performSideEffectsForTransition(curState, nextState, signal, e);
this.state.touchable.touchState = nextState;}}, 



_cancelLongPressDelayTimeout:function(){
this.longPressDelayTimeout && clearTimeout(this.longPressDelayTimeout);
this.longPressDelayTimeout = null;}, 


_isHighlight:function(state){
return state === States.RESPONDER_ACTIVE_PRESS_IN || 
state === States.RESPONDER_ACTIVE_LONG_PRESS_IN;}, 


_savePressInLocation:function(e){
var touch=TouchEventUtils.extractSingleTouch(e.nativeEvent);
var pageX=touch && touch.pageX;
var pageY=touch && touch.pageY;
this.pressInLocation = {pageX:pageX, pageY:pageY};}, 


_getDistanceBetweenPoints:function(aX, aY, bX, bY){
var deltaX=aX - bX;
var deltaY=aY - bY;
return Math.sqrt(deltaX * deltaX + deltaY * deltaY);}, 













_performSideEffectsForTransition:function(curState, nextState, signal, e){
var curIsHighlight=this._isHighlight(curState);
var newIsHighlight=this._isHighlight(nextState);

var isFinalSignal=
signal === Signals.RESPONDER_TERMINATED || 
signal === Signals.RESPONDER_RELEASE;

if(isFinalSignal){
this._cancelLongPressDelayTimeout();}


if(!IsActive[curState] && IsActive[nextState]){
this._remeasureMetricsOnActivation();}


if(IsPressingIn[curState] && signal === Signals.LONG_PRESS_DETECTED){
this.touchableHandleLongPress && this.touchableHandleLongPress();}


if(newIsHighlight && !curIsHighlight){
this._savePressInLocation(e);
this.touchableHandleActivePressIn && this.touchableHandleActivePressIn();}else 
if(!newIsHighlight && curIsHighlight && this.touchableHandleActivePressOut){
if(this.touchableGetPressOutDelayMS && this.touchableGetPressOutDelayMS()){
this.pressOutDelayTimeout = this.setTimeout(function(){
this.touchableHandleActivePressOut();}, 
this.touchableGetPressOutDelayMS());}else 
{
this.touchableHandleActivePressOut();}}



if(IsPressingIn[curState] && signal === Signals.RESPONDER_RELEASE){
var hasLongPressHandler=!!this.props.onLongPress;
var pressIsLongButStillCallOnPress=
IsLongPressingIn[curState] && (
!hasLongPressHandler || 
!this.touchableLongPressCancelsPress());


var shouldInvokePress=!IsLongPressingIn[curState] || pressIsLongButStillCallOnPress;
if(shouldInvokePress && this.touchableHandlePress){
this.touchableHandlePress(e);}}



this.touchableDelayTimeout && clearTimeout(this.touchableDelayTimeout);
this.touchableDelayTimeout = null;}};




var Touchable={
Mixin:TouchableMixin};


module.exports = Touchable;});
__d('BoundingDimensions',["PooledClass"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";





var PooledClass=require("PooledClass");

var twoArgumentPooler=PooledClass.twoArgumentPooler;








function BoundingDimensions(width, height){
this.width = width;
this.height = height;}






BoundingDimensions.getPooledFromElement = function(element){
return BoundingDimensions.getPooled(
element.offsetWidth, 
element.offsetHeight);};



PooledClass.addPoolingTo(BoundingDimensions, twoArgumentPooler);

module.exports = BoundingDimensions;});
__d('Position',["PooledClass"],function(global, require, requireDynamic, requireLazy, module, exports) {  "use strict";





var PooledClass=require("PooledClass");

var twoArgumentPooler=PooledClass.twoArgumentPooler;









function Position(left, top){
this.left = left;
this.top = top;}


PooledClass.addPoolingTo(Position, twoArgumentPooler);

module.exports = Position;});
__d('TouchEventUtils',[],function(global, require, requireDynamic, requireLazy, module, exports) {  var 










TouchEventUtils={










extractSingleTouch:function(nativeEvent){
var touches=nativeEvent.touches;
var changedTouches=nativeEvent.changedTouches;
var hasTouches=touches && touches.length > 0;
var hasChangedTouches=changedTouches && changedTouches.length > 0;

return !hasTouches && hasChangedTouches?changedTouches[0]:
hasTouches?touches[0]:
nativeEvent;}};



module.exports = TouchEventUtils;});
__d('queryLayoutByID',["ReactNativeTagHandles","NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactNativeTagHandles=require('ReactNativeTagHandles');
var RCTUIManager=require('NativeModules').UIManager;
































var queryLayoutByID=function(
rootNodeID, 
onError, 
onSuccess)
{

RCTUIManager.measure(
ReactNativeTagHandles.rootNodeIDToTag[rootNodeID], 
onSuccess);};



module.exports = queryLayoutByID;});
__d('TextInput',["DocumentSelectionState","EventEmitter","NativeMethodsMixin","NativeModules","Platform","ReactPropTypes","React","ReactChildren","StyleSheet","Text","TextInputState","react-timer-mixin/TimerMixin","TouchableWithoutFeedback","createReactNativeComponentClass","emptyFunction","invariant","requireNativeComponent"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};












var DocumentSelectionState=require('DocumentSelectionState');
var EventEmitter=require('EventEmitter');
var NativeMethodsMixin=require('NativeMethodsMixin');
var RCTUIManager=require('NativeModules').UIManager;
var Platform=require('Platform');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var ReactChildren=require('ReactChildren');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var TextInputState=require('TextInputState');
var TimerMixin=require('react-timer-mixin/TimerMixin');
var TouchableWithoutFeedback=require('TouchableWithoutFeedback');

var createReactNativeComponentClass=require('createReactNativeComponentClass');
var emptyFunction=require('emptyFunction');
var invariant=require('invariant');
var requireNativeComponent=require('requireNativeComponent');

var onlyMultiline={
onSelectionChange:true, 
onTextInput:true, 
children:true};


var notMultiline={
onSubmitEditing:true};


var AndroidTextInputAttributes={
autoCapitalize:true, 
autoCorrect:true, 
autoFocus:true, 
keyboardType:true, 
multiline:true, 
password:true, 
placeholder:true, 
text:true, 
testID:true};


var viewConfigAndroid={
uiViewClassName:'AndroidTextInput', 
validAttributes:AndroidTextInputAttributes};


var RCTTextView=requireNativeComponent('RCTTextView', null);
var RCTTextField=requireNativeComponent('RCTTextField', null);








































var TextInput=React.createClass({displayName:'TextInput', 
propTypes:{








autoCapitalize:PropTypes.oneOf([
'none', 
'sentences', 
'words', 
'characters']), 




autoCorrect:PropTypes.bool, 



autoFocus:PropTypes.bool, 



editable:PropTypes.bool, 



keyboardType:PropTypes.oneOf([

'default', 
'numeric', 
'email-address', 

'ascii-capable', 
'numbers-and-punctuation', 
'url', 
'number-pad', 
'phone-pad', 
'name-phone-pad', 
'decimal-pad', 
'twitter', 
'web-search']), 




returnKeyType:PropTypes.oneOf([
'default', 
'go', 
'google', 
'join', 
'next', 
'route', 
'search', 
'send', 
'yahoo', 
'done', 
'emergency-call']), 





enablesReturnKeyAutomatically:PropTypes.bool, 



multiline:PropTypes.bool, 



onBlur:PropTypes.func, 



onFocus:PropTypes.func, 



onChange:PropTypes.func, 
onChangeText:PropTypes.func, 



onEndEditing:PropTypes.func, 



onSubmitEditing:PropTypes.func, 



onLayout:PropTypes.func, 




password:PropTypes.bool, 



placeholder:PropTypes.string, 



placeholderTextColor:PropTypes.string, 




selectionState:PropTypes.instanceOf(DocumentSelectionState), 



value:PropTypes.string, 






bufferDelay:PropTypes.number, 





controlled:PropTypes.bool, 



clearButtonMode:PropTypes.oneOf([
'never', 
'while-editing', 
'unless-editing', 
'always']), 




clearTextOnFocus:PropTypes.bool, 



selectTextOnFocus:PropTypes.bool, 



style:Text.propTypes.style, 



testID:PropTypes.string}, 






mixins:[NativeMethodsMixin, TimerMixin], 

viewConfig:Platform.OS === 'ios'?RCTTextField.viewConfig:
Platform.OS === 'android'?viewConfigAndroid:{}, 

isFocused:function(){
return TextInputState.currentlyFocusedField() === 
React.findNodeHandle(this.refs.input);}, 


getDefaultProps:function(){
return {
bufferDelay:100};}, 



getInitialState:function(){
return {
mostRecentEventCounter:0, 
bufferedValue:this.props.value};}, 



contextTypes:{
onFocusRequested:React.PropTypes.func, 
focusEmitter:React.PropTypes.instanceOf(EventEmitter)}, 


_focusSubscription:undefined, 

componentDidMount:function(){var _this=this;
if(!this.context.focusEmitter){
if(this.props.autoFocus){
this.requestAnimationFrame(this.focus);}

return;}

this._focusSubscription = this.context.focusEmitter.addListener(
'focus', 
function(el){
if(_this === el){
_this.requestAnimationFrame(_this.focus);}else 
if(_this.isFocused()){
_this.blur();}});



if(this.props.autoFocus){
this.context.onFocusRequested(this);}}, 



componentWillUnmount:function(){
this._focusSubscription && this._focusSubscription.remove();
if(this.isFocused()){
this.blur();}}, 



_bufferTimeout:undefined, 

componentWillReceiveProps:function(newProps){var _this2=this;
if(newProps.value !== this.props.value){
if(!this.isFocused()){


this.setState({bufferedValue:newProps.value});}else 
{




























this.clearTimeout(this._bufferTimeout);
this._bufferTimeout = this.setTimeout(
function(){return _this2.setState({bufferedValue:newProps.value});}, 
this.props.bufferDelay);}}}, 





getChildContext:function(){
return {isInAParentText:true};}, 


childContextTypes:{
isInAParentText:React.PropTypes.bool}, 


render:function(){
if(Platform.OS === 'ios'){
return this._renderIOS();}else 
if(Platform.OS === 'android'){
return this._renderAndroid();}}, 



_renderIOS:function(){
var textContainer;

var props=this.props;
props.style = [styles.input, this.props.style];

if(!props.multiline){
for(var propKey in onlyMultiline) {
if(props[propKey]){
throw new Error(
'TextInput prop `' + propKey + '` is only supported with multiline.');}}



textContainer = 
React.createElement(RCTTextField, _extends({
ref:'input'}, 
props, {
onFocus:this._onFocus, 
onBlur:this._onBlur, 
onChange:this._onChange, 
onSelectionChangeShouldSetResponder:function(){return true;}, 
text:this.state.bufferedValue}));}else 

{
for(var propKey in notMultiline) {
if(props[propKey]){
throw new Error(
'TextInput prop `' + propKey + '` cannot be used with multiline.');}}




var children=props.children;
var childCount=0;
ReactChildren.forEach(children, function(){return ++childCount;});
invariant(
!(props.value && childCount), 
'Cannot specify both value and children.');

if(childCount > 1){
children = React.createElement(Text, null, children);}

if(props.inputView){
children = [children, props.inputView];}

textContainer = 
React.createElement(RCTTextView, _extends({
ref:'input'}, 
props, {
children:children, 
mostRecentEventCounter:this.state.mostRecentEventCounter, 
onFocus:this._onFocus, 
onBlur:this._onBlur, 
onChange:this._onChange, 
onSelectionChange:this._onSelectionChange, 
onTextInput:this._onTextInput, 
onSelectionChangeShouldSetResponder:emptyFunction.thatReturnsTrue, 
text:this.state.bufferedValue}));}



return (
React.createElement(TouchableWithoutFeedback, {
onPress:this._onPress, 
rejectResponderTermination:true, 
testID:props.testID}, 
textContainer));}, 




_renderAndroid:function(){
var autoCapitalize=RCTUIManager.UIText.AutocapitalizationType[this.props.autoCapitalize];
var children=this.props.children;
var childCount=0;
ReactChildren.forEach(children, function(){return ++childCount;});
invariant(
!(this.props.value && childCount), 
'Cannot specify both value and children.');

if(childCount > 1){
children = React.createElement(Text, null, children);}

var textContainer=
React.createElement(AndroidTextInput, {
ref:'input', 
style:[this.props.style], 
autoCapitalize:autoCapitalize, 
autoCorrect:this.props.autoCorrect, 
keyboardType:this.props.keyboardType, 
multiline:this.props.multiline, 
onFocus:this._onFocus, 
onBlur:this._onBlur, 
onChange:this._onChange, 
onTextInput:this._onTextInput, 
onEndEditing:this.props.onEndEditing, 
onSubmitEditing:this.props.onSubmitEditing, 
onLayout:this.props.onLayout, 
password:this.props.password || this.props.secureTextEntry, 
placeholder:this.props.placeholder, 
text:this.state.bufferedValue, 
children:children});


return (
React.createElement(TouchableWithoutFeedback, {
onPress:this._onPress, 
testID:this.props.testID}, 
textContainer));}, 




_onFocus:function(event){
if(this.props.onFocus){
this.props.onFocus(event);}}, 



_onPress:function(event){
this.focus();}, 


_onChange:function(event){
if(this.props.controlled && event.nativeEvent.text !== this.props.value){
this.refs.input.setNativeProps({text:this.props.value});}

this.props.onChange && this.props.onChange(event);
this.props.onChangeText && this.props.onChangeText(event.nativeEvent.text);}, 


_onBlur:function(event){
this.blur();
if(this.props.onBlur){
this.props.onBlur(event);}}, 



_onSelectionChange:function(event){
if(this.props.selectionState){
var selection=event.nativeEvent.selection;
this.props.selectionState.update(selection.start, selection.end);}

this.props.onSelectionChange && this.props.onSelectionChange(event);}, 


_onTextInput:function(event){
this.props.onTextInput && this.props.onTextInput(event);
var counter=event.nativeEvent.eventCounter;
if(counter > this.state.mostRecentEventCounter){
this.setState({mostRecentEventCounter:counter});}}});




var styles=StyleSheet.create({
input:{
alignSelf:'stretch'}});



var AndroidTextInput=createReactNativeComponentClass({
validAttributes:AndroidTextInputAttributes, 
uiViewClassName:'AndroidTextInput'});


module.exports = TextInput;});
__d('DocumentSelectionState',["mixInEventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}

















var mixInEventEmitter=require('mixInEventEmitter');var 










DocumentSelectionState=(function(){




function DocumentSelectionState(anchor, focus){_classCallCheck(this, DocumentSelectionState);
this._anchorOffset = anchor;
this._focusOffset = focus;
this._hasFocus = false;}_createClass(DocumentSelectionState, [{key:'update', value:









function update(anchor, focus){
if(this._anchorOffset !== anchor || this._focusOffset !== focus){
this._anchorOffset = anchor;
this._focusOffset = focus;
this.emit('update');}}}, {key:'constrainLength', value:









function constrainLength(maxLength){
this.update(
Math.min(this._anchorOffset, maxLength), 
Math.min(this._focusOffset, maxLength));}}, {key:'focus', value:



function focus(){
if(!this._hasFocus){
this._hasFocus = true;
this.emit('focus');}}}, {key:'blur', value:



function blur(){
if(this._hasFocus){
this._hasFocus = false;
this.emit('blur');}}}, {key:'hasFocus', value:






function hasFocus(){
return this._hasFocus;}}, {key:'isCollapsed', value:





function isCollapsed(){
return this._anchorOffset === this._focusOffset;}}, {key:'isBackward', value:





function isBackward(){
return this._anchorOffset > this._focusOffset;}}, {key:'getAnchorOffset', value:





function getAnchorOffset(){
return this._hasFocus?this._anchorOffset:null;}}, {key:'getFocusOffset', value:





function getFocusOffset(){
return this._hasFocus?this._focusOffset:null;}}, {key:'getStartOffset', value:





function getStartOffset(){
return (
this._hasFocus?Math.min(this._anchorOffset, this._focusOffset):null);}}, {key:'getEndOffset', value:






function getEndOffset(){
return (
this._hasFocus?Math.max(this._anchorOffset, this._focusOffset):null);}}, {key:'overlaps', value:








function overlaps(start, end){
return (
this.hasFocus() && 
this.getStartOffset() <= end && start <= this.getEndOffset());}}]);return DocumentSelectionState;})();




mixInEventEmitter(DocumentSelectionState, {
'blur':true, 
'focus':true, 
'update':true});


module.exports = DocumentSelectionState;});
__d('mixInEventEmitter',["EventEmitter","EventEmitterWithHolding","EventHolder","EventValidator","copyProperties","invariant","keyOf"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 
















EventEmitter=require('EventEmitter');
var EventEmitterWithHolding=require('EventEmitterWithHolding');
var EventHolder=require('EventHolder');
var EventValidator=require('EventValidator');

var copyProperties=require('copyProperties');
var invariant=require('invariant');
var keyOf=require('keyOf');

var TYPES_KEY=keyOf({__types:true});






















function mixInEventEmitter(klass, types){
invariant(types, 'Must supply set of valid event types');
invariant(!this.__eventEmitter, 'An active emitter is already mixed in');



var target=klass.prototype || klass;

var ctor=klass.constructor;
if(ctor){
invariant(
ctor === Object || ctor === Function, 
'Mix EventEmitter into a class, not an instance');}





if(target.hasOwnProperty(TYPES_KEY)){
copyProperties(target.__types, types);}else 
if(target.__types){
target.__types = copyProperties({}, target.__types, types);}else 
{
target.__types = types;}

copyProperties(target, EventEmitterMixin);}


var EventEmitterMixin={
emit:function(eventType, a, b, c, d, e, _){
return this.__getEventEmitter().emit(eventType, a, b, c, d, e, _);}, 


emitAndHold:function(eventType, a, b, c, d, e, _){
return this.__getEventEmitter().emitAndHold(eventType, a, b, c, d, e, _);}, 


addListener:function(eventType, listener, context){
return this.__getEventEmitter().addListener(eventType, listener, context);}, 


once:function(eventType, listener, context){
return this.__getEventEmitter().once(eventType, listener, context);}, 


addRetroactiveListener:function(eventType, listener, context){
return this.__getEventEmitter().addRetroactiveListener(
eventType, 
listener, 
context);}, 



addListenerMap:function(listenerMap, context){
return this.__getEventEmitter().addListenerMap(listenerMap, context);}, 


addRetroactiveListenerMap:function(listenerMap, context){
return this.__getEventEmitter().addListenerMap(listenerMap, context);}, 


removeAllListeners:function(){
this.__getEventEmitter().removeAllListeners();}, 


removeCurrentListener:function(){
this.__getEventEmitter().removeCurrentListener();}, 


releaseHeldEventType:function(eventType){
this.__getEventEmitter().releaseHeldEventType(eventType);}, 


__getEventEmitter:function(){
if(!this.__eventEmitter){
var emitter=new EventEmitter();
emitter = EventValidator.addValidation(emitter, this.__types);

var holder=new EventHolder();
this.__eventEmitter = new EventEmitterWithHolding(emitter, holder);}

return this.__eventEmitter;}};



module.exports = mixInEventEmitter;});
__d('EventEmitterWithHolding',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var 






























EventEmitterWithHolding=(function(){







function EventEmitterWithHolding(emitter, holder){_classCallCheck(this, EventEmitterWithHolding);
this._emitter = emitter;
this._eventHolder = holder;
this._currentEventToken = null;
this._emittingHeldEvents = false;}_createClass(EventEmitterWithHolding, [{key:'addListener', value:





function addListener(eventType, listener, context){
return this._emitter.addListener(eventType, listener, context);}}, {key:'once', value:





function once(eventType, listener, context){
return this._emitter.once(eventType, listener, context);}}, {key:'addRetroactiveListener', value:






















function addRetroactiveListener(
eventType, listener, context){
var subscription=this._emitter.addListener(eventType, listener, context);

this._emittingHeldEvents = true;
this._eventHolder.emitToListener(eventType, listener, context);
this._emittingHeldEvents = false;

return subscription;}}, {key:'removeAllListeners', value:





function removeAllListeners(eventType){
this._emitter.removeAllListeners(eventType);}}, {key:'removeCurrentListener', value:





function removeCurrentListener(){
this._emitter.removeCurrentListener();}}, {key:'listeners', value:





function listeners(eventType){
return this._emitter.listeners(eventType);}}, {key:'emit', value:





function emit(eventType, a, b, c, d, e, _){
this._emitter.emit(eventType, a, b, c, d, e, _);}}, {key:'emitAndHold', value:

















function emitAndHold(eventType, a, b, c, d, e, _){
this._currentEventToken = this._eventHolder.holdEvent(
eventType, 
a, b, c, d, e, _);

this._emitter.emit(eventType, a, b, c, d, e, _);
this._currentEventToken = null;}}, {key:'releaseCurrentEvent', value:





function releaseCurrentEvent(){
if(this._currentEventToken !== null){
this._eventHolder.releaseEvent(this._currentEventToken);}else 
if(this._emittingHeldEvents){
this._eventHolder.releaseCurrentEvent();}}}, {key:'releaseHeldEventType', value:







function releaseHeldEventType(eventType){
this._eventHolder.releaseEventType(eventType);}}]);return EventEmitterWithHolding;})();



module.exports = EventEmitterWithHolding;});
__d('EventHolder',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}


















var invariant=require('invariant');var 

EventHolder=(function(){
function EventHolder(){_classCallCheck(this, EventHolder);
this._heldEvents = {};
this._currentEventKey = null;}_createClass(EventHolder, [{key:'holdEvent', value:























function holdEvent(eventType, a, b, c, d, e, _){
this._heldEvents[eventType] = this._heldEvents[eventType] || [];
var eventsOfType=this._heldEvents[eventType];
var key={
eventType:eventType, 
index:eventsOfType.length};

eventsOfType.push([a, b, c, d, e, _]);
return key;}}, {key:'emitToListener', value:










function emitToListener(eventType, listener, context){var _this=this;
var eventsOfType=this._heldEvents[eventType];
if(!eventsOfType){
return;}

var origEventKey=this._currentEventKey;
eventsOfType.forEach(function(eventHeld, index){
if(!eventHeld){
return;}

_this._currentEventKey = {
eventType:eventType, 
index:index};

listener.apply(context, eventHeld);});

this._currentEventKey = origEventKey;}}, {key:'releaseCurrentEvent', value:










function releaseCurrentEvent(){
invariant(
this._currentEventKey !== null, 
'Not in an emitting cycle; there is no current event');

this.releaseEvent(this._currentEventKey);}}, {key:'releaseEvent', value:








function releaseEvent(token){
delete this._heldEvents[token.eventType][token.index];}}, {key:'releaseEventType', value:







function releaseEventType(type){
this._heldEvents[type] = [];}}]);return EventHolder;})();



module.exports = EventHolder;});
__d('EventValidator',["copyProperties"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var copyProperties=require('copyProperties');










var EventValidator={










addValidation:function(emitter, types){
var eventTypes=Object.keys(types);
var emitterWithValidation=Object.create(emitter);

copyProperties(emitterWithValidation, {
emit:function emit(type, a, b, c, d, e, _){
assertAllowsEventType(type, eventTypes);
return emitter.emit.call(this, type, a, b, c, d, e, _);}});



return emitterWithValidation;}};



function assertAllowsEventType(type, allowedTypes){
if(allowedTypes.indexOf(type) === -1){
throw new TypeError(errorMessageFor(type, allowedTypes));}}



function errorMessageFor(type, allowedTypes){
var message='Unknown event type "' + type + '". ';
if(__DEV__){
message += recommendationFor(type, allowedTypes);}

message += 'Known event types: ' + allowedTypes.join(', ') + '.';
return message;}



if(__DEV__){
var recommendationFor=function(type, allowedTypes){
var closestTypeRecommendation=closestTypeFor(type, allowedTypes);
if(isCloseEnough(closestTypeRecommendation, type)){
return 'Did you mean "' + closestTypeRecommendation.type + '"? ';}else 
{
return '';}};



var closestTypeFor=function(type, allowedTypes){
var typeRecommendations=allowedTypes.map(
typeRecommendationFor.bind(this, type));

return typeRecommendations.sort(recommendationSort)[0];};


var typeRecommendationFor=function(type, recomendedType){
return {
type:recomendedType, 
distance:damerauLevenshteinDistance(type, recomendedType)};};



var recommendationSort=function(recommendationA, recommendationB){
if(recommendationA.distance < recommendationB.distance){
return -1;}else 
if(recommendationA.distance > recommendationB.distance){
return 1;}else 
{
return 0;}};



var isCloseEnough=function(closestType, actualType){
return closestType.distance / actualType.length < 0.334;};


var damerauLevenshteinDistance=function(a, b){
var i, j;
var d=[];

for(i = 0; i <= a.length; i++) {
d[i] = [i];}


for(j = 1; j <= b.length; j++) {
d[0][j] = j;}


for(i = 1; i <= a.length; i++) {
for(j = 1; j <= b.length; j++) {
var cost=a.charAt(i - 1) === b.charAt(j - 1)?0:1;

d[i][j] = Math.min(
d[i - 1][j] + 1, 
d[i][j - 1] + 1, 
d[i - 1][j - 1] + cost);


if(i > 1 && j > 1 && 
a.charAt(i - 1) == b.charAt(j - 2) && 
a.charAt(i - 2) == b.charAt(j - 1)){
d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);}}}




return d[a.length][b.length];};}



module.exports = EventValidator;});
__d('copyProperties',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 























copyProperties(obj, a, b, c, d, e, f){
obj = obj || {};

if(__DEV__){
if(f){
throw new Error('Too many arguments passed to copyProperties');}}



var args=[a, b, c, d, e];
var ii=0, v;
while(args[ii]) {
v = args[ii++];
for(var k in v) {
obj[k] = v[k];}




if(v.hasOwnProperty && v.hasOwnProperty('toString') && 
typeof v.toString != 'undefined' && obj.toString !== v.toString){
obj.toString = v.toString;}}



return obj;}


module.exports = copyProperties;});
__d('TouchableWithoutFeedback',["React","react-timer-mixin/TimerMixin","Touchable","ensurePositiveDelayProps","onlyChild"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var React=require('React');
var TimerMixin=require('react-timer-mixin/TimerMixin');
var Touchable=require('Touchable');
var ensurePositiveDelayProps=require('ensurePositiveDelayProps');
var onlyChild=require('onlyChild');







var PRESS_RECT_OFFSET={top:20, left:20, right:20, bottom:30};








var TouchableWithoutFeedback=React.createClass({displayName:'TouchableWithoutFeedback', 
mixins:[TimerMixin, Touchable.Mixin], 

propTypes:{




accessible:React.PropTypes.bool, 
onPress:React.PropTypes.func, 
onPressIn:React.PropTypes.func, 
onPressOut:React.PropTypes.func, 
onLongPress:React.PropTypes.func, 



delayPressIn:React.PropTypes.number, 



delayPressOut:React.PropTypes.number, 



delayLongPress:React.PropTypes.number}, 


getInitialState:function(){
return this.touchableGetInitialState();}, 


componentDidMount:function(){
ensurePositiveDelayProps(this.props);}, 


componentWillReceiveProps:function(nextProps){
ensurePositiveDelayProps(nextProps);}, 






touchableHandlePress:function(e){
this.props.onPress && this.props.onPress(e);}, 


touchableHandleActivePressIn:function(){
this.props.onPressIn && this.props.onPressIn();}, 


touchableHandleActivePressOut:function(){
this.props.onPressOut && this.props.onPressOut();}, 


touchableHandleLongPress:function(){
this.props.onLongPress && this.props.onLongPress();}, 


touchableGetPressRectOffset:function(){
return PRESS_RECT_OFFSET;}, 


touchableGetHighlightDelayMS:function(){
return this.props.delayPressIn || 0;}, 


touchableGetLongPressDelayMS:function(){
return this.props.delayLongPress === 0?0:
this.props.delayLongPress || 500;}, 


touchableGetPressOutDelayMS:function(){
return this.props.delayPressOut || 0;}, 


render:function(){

return React.cloneElement(onlyChild(this.props.children), {
accessible:this.props.accessible !== false, 
testID:this.props.testID, 
onStartShouldSetResponder:this.touchableHandleStartShouldSetResponder, 
onResponderTerminationRequest:this.touchableHandleResponderTerminationRequest, 
onResponderGrant:this.touchableHandleResponderGrant, 
onResponderMove:this.touchableHandleResponderMove, 
onResponderRelease:this.touchableHandleResponderRelease, 
onResponderTerminate:this.touchableHandleResponderTerminate});}});




module.exports = TouchableWithoutFeedback;});
__d('ensurePositiveDelayProps',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');

var ensurePositiveDelayProps=function(props){
invariant(
!(props.delayPressIn < 0 || props.delayPressOut < 0 || 
props.delayLongPress < 0), 
'Touchable components cannot have negative delay properties');};



module.exports = ensurePositiveDelayProps;});
__d('TouchableHighlight',["NativeMethodsMixin","React","ReactNativeViewAttributes","StyleSheet","react-timer-mixin/TimerMixin","Touchable","TouchableWithoutFeedback","View","cloneWithProps","ensureComponentIsNative","ensurePositiveDelayProps","keyOf","merge","onlyChild"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};













var NativeMethodsMixin=require('NativeMethodsMixin');
var React=require('React');
var ReactNativeViewAttributes=require('ReactNativeViewAttributes');
var StyleSheet=require('StyleSheet');
var TimerMixin=require('react-timer-mixin/TimerMixin');
var Touchable=require('Touchable');
var TouchableWithoutFeedback=require('TouchableWithoutFeedback');
var View=require('View');

var cloneWithProps=require('cloneWithProps');
var ensureComponentIsNative=require('ensureComponentIsNative');
var ensurePositiveDelayProps=require('ensurePositiveDelayProps');
var keyOf=require('keyOf');
var merge=require('merge');
var onlyChild=require('onlyChild');

var DEFAULT_PROPS={
activeOpacity:0.8, 
underlayColor:'black'};


























var TouchableHighlight=React.createClass({displayName:'TouchableHighlight', 
propTypes:_extends({}, 
TouchableWithoutFeedback.propTypes, {




activeOpacity:React.PropTypes.number, 




underlayColor:React.PropTypes.string, 
style:View.propTypes.style, 



onShowUnderlay:React.PropTypes.func, 



onHideUnderlay:React.PropTypes.func}), 


mixins:[NativeMethodsMixin, TimerMixin, Touchable.Mixin], 

getDefaultProps:function(){return DEFAULT_PROPS;}, 


computeSyntheticState:function(props){
return {
activeProps:{
style:{
opacity:props.activeOpacity}}, 


activeUnderlayProps:{
style:{
backgroundColor:props.underlayColor}}, 


underlayStyle:[
INACTIVE_UNDERLAY_PROPS.style, 
props.style]};}, 




getInitialState:function(){
return merge(
this.touchableGetInitialState(), this.computeSyntheticState(this.props));}, 



componentDidMount:function(){
ensurePositiveDelayProps(this.props);
ensureComponentIsNative(this.refs[CHILD_REF]);}, 


componentDidUpdate:function(){
ensureComponentIsNative(this.refs[CHILD_REF]);}, 


componentWillReceiveProps:function(nextProps){
ensurePositiveDelayProps(nextProps);
if(nextProps.activeOpacity !== this.props.activeOpacity || 
nextProps.underlayColor !== this.props.underlayColor || 
nextProps.style !== this.props.style){
this.setState(this.computeSyntheticState(nextProps));}}, 



viewConfig:{
uiViewClassName:'RCTView', 
validAttributes:ReactNativeViewAttributes.RCTView}, 






touchableHandleActivePressIn:function(){
this.clearTimeout(this._hideTimeout);
this._hideTimeout = null;
this._showUnderlay();
this.props.onPressIn && this.props.onPressIn();}, 


touchableHandleActivePressOut:function(){
if(!this._hideTimeout){
this._hideUnderlay();}

this.props.onPressOut && this.props.onPressOut();}, 


touchableHandlePress:function(){
this.clearTimeout(this._hideTimeout);
this._showUnderlay();
this._hideTimeout = this.setTimeout(this._hideUnderlay, 
this.props.delayPressOut || 100);
this.props.onPress && this.props.onPress();}, 


touchableHandleLongPress:function(){
this.props.onLongPress && this.props.onLongPress();}, 


touchableGetPressRectOffset:function(){
return PRESS_RECT_OFFSET;}, 


touchableGetHighlightDelayMS:function(){
return this.props.delayPressIn;}, 


touchableGetLongPressDelayMS:function(){
return this.props.delayLongPress;}, 


touchableGetPressOutDelayMS:function(){
return this.props.delayPressOut;}, 


_showUnderlay:function(){
this.refs[UNDERLAY_REF].setNativeProps(this.state.activeUnderlayProps);
this.refs[CHILD_REF].setNativeProps(this.state.activeProps);
this.props.onShowUnderlay && this.props.onShowUnderlay();}, 


_hideUnderlay:function(){
this.clearTimeout(this._hideTimeout);
this._hideTimeout = null;
if(this.refs[UNDERLAY_REF]){
this.refs[CHILD_REF].setNativeProps(INACTIVE_CHILD_PROPS);
this.refs[UNDERLAY_REF].setNativeProps(_extends({}, 
INACTIVE_UNDERLAY_PROPS, {
style:this.state.underlayStyle}));

this.props.onHideUnderlay && this.props.onHideUnderlay();}}, 



render:function(){
return (
React.createElement(View, {
ref:UNDERLAY_REF, 
style:this.state.underlayStyle, 
onStartShouldSetResponder:this.touchableHandleStartShouldSetResponder, 
onResponderTerminationRequest:this.touchableHandleResponderTerminationRequest, 
onResponderGrant:this.touchableHandleResponderGrant, 
onResponderMove:this.touchableHandleResponderMove, 
onResponderRelease:this.touchableHandleResponderRelease, 
onResponderTerminate:this.touchableHandleResponderTerminate}, 
cloneWithProps(
onlyChild(this.props.children), 
{
ref:CHILD_REF, 
accessible:true, 
testID:this.props.testID})));}});







var PRESS_RECT_OFFSET={top:20, left:20, right:20, bottom:30};
var CHILD_REF=keyOf({childRef:null});
var UNDERLAY_REF=keyOf({underlayRef:null});
var INACTIVE_CHILD_PROPS={
style:StyleSheet.create({x:{opacity:1}}).x};

var INACTIVE_UNDERLAY_PROPS={
style:StyleSheet.create({x:{backgroundColor:'transparent'}}).x};


module.exports = TouchableHighlight;});
__d('cloneWithProps',["ReactElement","ReactPropTransferer","keyOf","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactElement=require('ReactElement');
var ReactPropTransferer=require('ReactPropTransferer');

var keyOf=require('keyOf');
var warning=require('warning');

var CHILDREN_PROP=keyOf({children:null});










function cloneWithProps(child, props){
if(__DEV__){
warning(
!child.ref, 
'You are calling cloneWithProps() on a child with a ref. This is ' + 
'dangerous because you\'re creating a new child which will not be ' + 
'added as a ref to its parent.');}



var newProps=ReactPropTransferer.mergeProps(props, child.props);


if(!newProps.hasOwnProperty(CHILDREN_PROP) && 
child.props.hasOwnProperty(CHILDREN_PROP)){
newProps.children = child.props.children;}




return ReactElement.createElement(child.type, newProps);}


module.exports = cloneWithProps;});
__d('ReactPropTransferer',["Object.assign","emptyFunction","joinClasses"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var assign=require('Object.assign');
var emptyFunction=require('emptyFunction');
var joinClasses=require('joinClasses');








function createTransferStrategy(mergeStrategy){
return function(props, key, value){
if(!props.hasOwnProperty(key)){
props[key] = value;}else 
{
props[key] = mergeStrategy(props[key], value);}};}




var transferStrategyMerge=createTransferStrategy(function(a, b){



return assign({}, b, a);});







var TransferStrategies={



children:emptyFunction, 



className:createTransferStrategy(joinClasses), 



style:transferStrategyMerge};










function transferInto(props, newProps){
for(var thisKey in newProps) {
if(!newProps.hasOwnProperty(thisKey)){
continue;}


var transferStrategy=TransferStrategies[thisKey];

if(transferStrategy && TransferStrategies.hasOwnProperty(thisKey)){
transferStrategy(props, thisKey, newProps[thisKey]);}else 
if(!props.hasOwnProperty(thisKey)){
props[thisKey] = newProps[thisKey];}}


return props;}








var ReactPropTransferer={








mergeProps:function(oldProps, newProps){
return transferInto(assign({}, oldProps), newProps);}};




module.exports = ReactPropTransferer;});
__d('joinClasses',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




















function joinClasses(className){
if(!className){
className = '';}

var nextClass;
var argLength=arguments.length;
if(argLength > 1){
for(var ii=1; ii < argLength; ii++) {
nextClass = arguments[ii];
if(nextClass){
className = (className?className + ' ':'') + nextClass;}}}



return className;}


module.exports = joinClasses;});
__d('ensureComponentIsNative',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');

var ensureComponentIsNative=function(component){
invariant(
component && typeof component.setNativeProps === 'function', 
'Touchable child must either be native or forward setNativeProps to a ' + 
'native component');};



module.exports = ensureComponentIsNative;});
__d('TouchableOpacity',["NativeMethodsMixin","POPAnimationMixin","React","react-timer-mixin/TimerMixin","Touchable","TouchableWithoutFeedback","cloneWithProps","ensureComponentIsNative","ensurePositiveDelayProps","flattenStyle","keyOf","onlyChild"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};













var NativeMethodsMixin=require('NativeMethodsMixin');
var POPAnimationMixin=require('POPAnimationMixin');
var React=require('React');
var TimerMixin=require('react-timer-mixin/TimerMixin');
var Touchable=require('Touchable');
var TouchableWithoutFeedback=require('TouchableWithoutFeedback');

var cloneWithProps=require('cloneWithProps');
var ensureComponentIsNative=require('ensureComponentIsNative');
var ensurePositiveDelayProps=require('ensurePositiveDelayProps');
var flattenStyle=require('flattenStyle');
var keyOf=require('keyOf');
var onlyChild=require('onlyChild');


























var TouchableOpacity=React.createClass({displayName:'TouchableOpacity', 
mixins:[TimerMixin, Touchable.Mixin, NativeMethodsMixin, POPAnimationMixin], 

propTypes:_extends({}, 
TouchableWithoutFeedback.propTypes, {




activeOpacity:React.PropTypes.number}), 


getDefaultProps:function(){
return {
activeOpacity:0.2};}, 



getInitialState:function(){
return this.touchableGetInitialState();}, 


componentDidMount:function(){
ensurePositiveDelayProps(this.props);
ensureComponentIsNative(this.refs[CHILD_REF]);}, 


componentDidUpdate:function(){
ensureComponentIsNative(this.refs[CHILD_REF]);}, 


componentWillReceiveProps:function(nextProps){
ensurePositiveDelayProps(nextProps);}, 


setOpacityTo:function(value){
if(POPAnimationMixin){

this.stopAllAnimations();
var anim={
type:this.AnimationTypes.linear, 
property:this.AnimationProperties.opacity, 
duration:0.15, 
toValue:value};

this.startAnimation(CHILD_REF, anim);}else 
{

this.refs[CHILD_REF].setNativeProps({
opacity:value});}}, 








touchableHandleActivePressIn:function(){
this.clearTimeout(this._hideTimeout);
this._hideTimeout = null;
this._opacityActive();
this.props.onPressIn && this.props.onPressIn();}, 


touchableHandleActivePressOut:function(){
if(!this._hideTimeout){
this._opacityInactive();}

this.props.onPressOut && this.props.onPressOut();}, 


touchableHandlePress:function(){
this.clearTimeout(this._hideTimeout);
this._opacityActive();
this._hideTimeout = this.setTimeout(
this._opacityInactive, 
this.props.delayPressOut || 100);

this.props.onPress && this.props.onPress();}, 


touchableHandleLongPress:function(){
this.props.onLongPress && this.props.onLongPress();}, 


touchableGetPressRectOffset:function(){
return PRESS_RECT_OFFSET;}, 


touchableGetHighlightDelayMS:function(){
return this.props.delayPressIn || 0;}, 


touchableGetLongPressDelayMS:function(){
return this.props.delayLongPress === 0?0:
this.props.delayLongPress || 500;}, 


touchableGetPressOutDelayMS:function(){
return this.props.delayPressOut;}, 


_opacityActive:function(){
this.setOpacityTo(this.props.activeOpacity);}, 


_opacityInactive:function(){
this.clearTimeout(this._hideTimeout);
this._hideTimeout = null;
var child=onlyChild(this.props.children);
var childStyle=flattenStyle(child.props.style) || {};
this.setOpacityTo(
childStyle.opacity === undefined?1:childStyle.opacity);}, 



render:function(){
return cloneWithProps(onlyChild(this.props.children), {
ref:CHILD_REF, 
accessible:true, 
testID:this.props.testID, 
onStartShouldSetResponder:this.touchableHandleStartShouldSetResponder, 
onResponderTerminationRequest:this.touchableHandleResponderTerminationRequest, 
onResponderGrant:this.touchableHandleResponderGrant, 
onResponderMove:this.touchableHandleResponderMove, 
onResponderRelease:this.touchableHandleResponderRelease, 
onResponderTerminate:this.touchableHandleResponderTerminate});}});










var PRESS_RECT_OFFSET={top:20, left:20, right:20, bottom:30};

var CHILD_REF=keyOf({childRef:null});

module.exports = TouchableOpacity;});
__d('POPAnimationMixin',["POPAnimation","React","invariant","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var POPAnimationOrNull=require('POPAnimation');
var React=require('React');

if(!POPAnimationOrNull){


module.exports = null;}else 
{



var POPAnimation=POPAnimationOrNull;

var invariant=require('invariant');
var warning=require('warning');

var POPAnimationMixin={




AnimationTypes:POPAnimation.Types, 
AnimationProperties:POPAnimation.Properties, 

getInitialState:function(){
return {
_currentAnimationsByNodeHandle:{}};}, 



_ensureBookkeepingSetup:function(nodeHandle){
if(!this.state._currentAnimationsByNodeHandle[nodeHandle]){
this.state._currentAnimationsByNodeHandle[nodeHandle] = [];}}, 

















startAnimation:function(
refKey, 
anim, 
doneCallback)
{
var animID=0;
if(typeof anim === 'number'){
animID = anim;}else 
{
invariant(
anim instanceof Object && 
anim.type !== undefined && 
anim.property !== undefined, 
'Animation definitions must specify a type of animation and a ' + 
'property to animate.');

animID = POPAnimation.createAnimation(anim.type, anim);}

invariant(
this.refs[refKey], 
'Invalid refKey ' + refKey + ' for anim:\n' + JSON.stringify(anim) + 
'\nvalid refs: ' + JSON.stringify(Object.keys(this.refs)));

var refNodeHandle=React.findNodeHandle(this.refs[refKey]);
this.startAnimationWithNodeHandle(refNodeHandle, animID, doneCallback);}, 








startAnimationWithNodeHandle:function(
nodeHandle, 
animID, 
doneCallback)
{var _this=this;
this._ensureBookkeepingSetup(nodeHandle);
var animations=this.state._currentAnimationsByNodeHandle[nodeHandle];
var animIndex=animations.length;
animations.push(animID);
var cleanupWrapper=function(finished){
if(!_this.isMounted()){
return;}

animations[animIndex] = 0;
var allDone=true;
for(var ii=0; ii < animations.length; ii++) {
if(animations[ii]){
allDone = false;
break;}}


if(allDone){
_this.state._currentAnimationsByNodeHandle[nodeHandle] = undefined;}

doneCallback && doneCallback(finished);};

POPAnimation.addAnimation(nodeHandle, animID, cleanupWrapper);}, 













startAnimations:function(
animations, 
onSuccess, 
onFailure)
{var _this2=this;
var numReturned=0;
var numFinished=0;
var numAnimations=animations.length;
var metaCallback=function(finished){
if(finished){
++numFinished;}

if(++numReturned === numAnimations){
onSuccess && onSuccess(numFinished === numAnimations);}};


animations.forEach(function(anim){
warning(
anim.ref != null || anim.nodeHandle != null && 
!anim.ref !== !anim.nodeHandle, 
'Animations must be specified with either ref xor nodeHandle');

if(anim.ref){
_this2.startAnimation(anim.ref, anim.anim, metaCallback);}else 
if(anim.nodeHandle){
_this2.startAnimationWithNodeHandle(anim.nodeHandle, anim.anim, metaCallback);}});}, 











stopNodeHandleAnimations:function(nodeHandle){
if(!this.state._currentAnimationsByNodeHandle[nodeHandle]){
return;}

var anims=this.state._currentAnimationsByNodeHandle[nodeHandle];
for(var i=0; i < anims.length; i++) {
var anim=anims[i];
if(anim){

POPAnimation.removeAnimation(+nodeHandle, anim);}}


this.state._currentAnimationsByNodeHandle[nodeHandle] = undefined;}, 







stopAnimations:function(refKey){
invariant(this.refs[refKey], 'invalid ref');
this.stopNodeHandleAnimations(React.findNodeHandle(this.refs[refKey]));}, 






stopAllAnimations:function(){
for(var nodeHandle in this.state._currentAnimationsByNodeHandle) {
this.stopNodeHandleAnimations(nodeHandle);}}, 



















animateToFrame:function(
refKey, 
frame, 
type, 
velocity, 
doneCallback)
{
var animFrame={
x:frame.left + frame.width / 2, 
y:frame.top + frame.height / 2, 
w:frame.width, 
h:frame.height};

var posAnim=POPAnimation.createAnimation(type, {
property:POPAnimation.Properties.position, 
toValue:[animFrame.x, animFrame.y], 
velocity:velocity || [0, 0]});

var sizeAnim=POPAnimation.createAnimation(type, {
property:POPAnimation.Properties.size, 
toValue:[animFrame.w, animFrame.h]});

this.startAnimation(refKey, posAnim, doneCallback);
this.startAnimation(refKey, sizeAnim);}, 



componentWillUnmount:function(){
this.stopAllAnimations();}};



module.exports = POPAnimationMixin;}});
__d('POPAnimation',["NativeModules","ReactPropTypes","createStrictShapeTypeChecker","getObjectValues","invariant","merge"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var RCTPOPAnimationManager=require('NativeModules').POPAnimationManager;
if(!RCTPOPAnimationManager){




module.exports = null;}else 
{

var ReactPropTypes=require('ReactPropTypes');
var createStrictShapeTypeChecker=require('createStrictShapeTypeChecker');
var getObjectValues=require('getObjectValues');
var invariant=require('invariant');
var merge=require('merge');

var RCTTypes=RCTPOPAnimationManager.Types;
var RCTProperties=RCTPOPAnimationManager.Properties;

var Properties={
bounds:RCTProperties.bounds, 
opacity:RCTProperties.opacity, 
position:RCTProperties.position, 
positionX:RCTProperties.positionX, 
positionY:RCTProperties.positionY, 
zPosition:RCTProperties.zPosition, 
rotation:RCTProperties.rotation, 
rotationX:RCTProperties.rotationX, 
rotationY:RCTProperties.rotationY, 
scaleX:RCTProperties.scaleX, 
scaleXY:RCTProperties.scaleXY, 
scaleY:RCTProperties.scaleY, 
shadowColor:RCTProperties.shadowColor, 
shadowOffset:RCTProperties.shadowOffset, 
shadowOpacity:RCTProperties.shadowOpacity, 
shadowRadius:RCTProperties.shadowRadius, 
size:RCTProperties.size, 
subscaleXY:RCTProperties.subscaleXY, 
subtranslationX:RCTProperties.subtranslationX, 
subtranslationXY:RCTProperties.subtranslationXY, 
subtranslationY:RCTProperties.subtranslationY, 
subtranslationZ:RCTProperties.subtranslationZ, 
translationX:RCTProperties.translationX, 
translationXY:RCTProperties.translationXY, 
translationY:RCTProperties.translationY, 
translationZ:RCTProperties.translationZ};


var Types={
decay:RCTTypes.decay, 
easeIn:RCTTypes.easeIn, 
easeInEaseOut:RCTTypes.easeInEaseOut, 
easeOut:RCTTypes.easeOut, 
linear:RCTTypes.linear, 
spring:RCTTypes.spring};
















var POPAnimation={
Types:Types, 
Properties:Properties, 

attributeChecker:createStrictShapeTypeChecker({
type:ReactPropTypes.oneOf(getObjectValues(Types)), 
property:ReactPropTypes.oneOf(getObjectValues(Properties)), 
fromValue:ReactPropTypes.any, 
toValue:ReactPropTypes.any, 
duration:ReactPropTypes.any, 
velocity:ReactPropTypes.any, 
deceleration:ReactPropTypes.any, 
springBounciness:ReactPropTypes.any, 
dynamicsFriction:ReactPropTypes.any, 
dynamicsMass:ReactPropTypes.any, 
dynamicsTension:ReactPropTypes.any}), 


lastUsedTag:0, 
allocateTagForAnimation:function(){
return ++this.lastUsedTag;}, 


createAnimation:function(typeName, attrs){
var tag=this.allocateTagForAnimation();

if(__DEV__){
POPAnimation.attributeChecker(
{attrs:attrs}, 
'attrs', 
'POPAnimation.createAnimation');

POPAnimation.attributeChecker(
{attrs:{type:typeName}}, 
'attrs', 
'POPAnimation.createAnimation');}



RCTPOPAnimationManager.createAnimationInternal(tag, typeName, attrs);
return tag;}, 


createSpringAnimation:function(attrs){
return this.createAnimation(this.Types.spring, attrs);}, 


createDecayAnimation:function(attrs){
return this.createAnimation(this.Types.decay, attrs);}, 


createLinearAnimation:function(attrs){
return this.createAnimation(this.Types.linear, attrs);}, 


createEaseInAnimation:function(attrs){
return this.createAnimation(this.Types.easeIn, attrs);}, 


createEaseOutAnimation:function(attrs){
return this.createAnimation(this.Types.easeOut, attrs);}, 


createEaseInEaseOutAnimation:function(attrs){
return this.createAnimation(this.Types.easeInEaseOut, attrs);}, 


addAnimation:function(nodeHandle, anim, callback){
RCTPOPAnimationManager.addAnimation(nodeHandle, anim, callback);}, 


removeAnimation:function(nodeHandle, anim){
RCTPOPAnimationManager.removeAnimation(nodeHandle, anim);}};





if(__DEV__){
var allProperties=merge(
RCTPOPAnimationManager.Properties, 
RCTPOPAnimationManager.Properties);

for(var key in allProperties) {
invariant(
POPAnimation.Properties[key] === RCTPOPAnimationManager.Properties[key], 
'POPAnimation doesn\'t copy property ' + key + ' correctly');}



var allTypes=merge(
RCTPOPAnimationManager.Types, 
RCTPOPAnimationManager.Types);

for(var key in allTypes) {
invariant(
POPAnimation.Types[key] === RCTPOPAnimationManager.Types[key], 
'POPAnimation doesn\'t copy type ' + key + ' correctly');}}




module.exports = POPAnimation;}});
__d('getObjectValues',[],function(global, require, requireDynamic, requireLazy, module, exports) {  function 


























getObjectValues(obj){
var values=[];
for(var key in obj) {
values.push(obj[key]);}

return values;}


module.exports = getObjectValues;});
__d('WebView',["ActivityIndicatorIOS","EdgeInsetsPropType","React","StyleSheet","Text","View","invariant","keyMirror","requireNativeComponent","NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ActivityIndicatorIOS=require('ActivityIndicatorIOS');
var EdgeInsetsPropType=require('EdgeInsetsPropType');
var React=require('React');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var View=require('View');

var invariant=require('invariant');
var keyMirror=require('keyMirror');
var requireNativeComponent=require('requireNativeComponent');

var PropTypes=React.PropTypes;
var RCTWebViewManager=require('NativeModules').WebViewManager;

var BGWASH='rgba(255,255,255,0.8)';
var RCT_WEBVIEW_REF='webview';

var WebViewState=keyMirror({
IDLE:null, 
LOADING:null, 
ERROR:null});


var NavigationType={
click:RCTWebViewManager.NavigationType.LinkClicked, 
formsubmit:RCTWebViewManager.NavigationType.FormSubmitted, 
backforward:RCTWebViewManager.NavigationType.BackForward, 
reload:RCTWebViewManager.NavigationType.Reload, 
formresubmit:RCTWebViewManager.NavigationType.FormResubmitted, 
other:RCTWebViewManager.NavigationType.Other};










var defaultRenderLoading=function(){return (
React.createElement(View, {style:styles.loadingView}, 
React.createElement(ActivityIndicatorIOS, null)));};


var defaultRenderError=function(errorDomain, errorCode, errorDesc){return (
React.createElement(View, {style:styles.errorContainer}, 
React.createElement(Text, {style:styles.errorTextTitle}, 'Error loading page'), 


React.createElement(Text, {style:styles.errorText}, 
'Domain: ' + errorDomain), 

React.createElement(Text, {style:styles.errorText}, 
'Error Code: ' + errorCode), 

React.createElement(Text, {style:styles.errorText}, 
'Description: ' + errorDesc)));};




var WebView=React.createClass({displayName:'WebView', 
statics:{
NavigationType:NavigationType}, 


propTypes:{
url:PropTypes.string, 
html:PropTypes.string, 
renderError:PropTypes.func, 
renderLoading:PropTypes.func, 
bounces:PropTypes.bool, 
scrollEnabled:PropTypes.bool, 
automaticallyAdjustContentInsets:PropTypes.bool, 
shouldInjectAJAXHandler:PropTypes.bool, 
contentInset:EdgeInsetsPropType, 
onNavigationStateChange:PropTypes.func, 
startInLoadingState:PropTypes.bool, 
style:View.propTypes.style, 



javaScriptEnabledAndroid:PropTypes.bool}, 


getInitialState:function(){
return {
viewState:WebViewState.IDLE, 
lastErrorEvent:null, 
startInLoadingState:true};}, 



componentWillMount:function(){
if(this.props.startInLoadingState){
this.setState({viewState:WebViewState.LOADING});}}, 



render:function(){
var otherView=null;

if(this.state.viewState === WebViewState.LOADING){
otherView = (this.props.renderLoading || defaultRenderLoading)();}else 
if(this.state.viewState === WebViewState.ERROR){
var errorEvent=this.state.lastErrorEvent;
invariant(
errorEvent != null, 
'lastErrorEvent expected to be non-null');

otherView = (this.props.renderError || defaultRenderError)(
errorEvent.domain, 
errorEvent.code, 
errorEvent.description);}else 

if(this.state.viewState !== WebViewState.IDLE){
console.error(
'RCTWebView invalid state encountered: ' + this.state.loading);}



var webViewStyles=[styles.container, styles.webView, this.props.style];
if(this.state.viewState === WebViewState.LOADING || 
this.state.viewState === WebViewState.ERROR){

webViewStyles.push(styles.hidden);}


var webView=
React.createElement(RCTWebView, {
ref:RCT_WEBVIEW_REF, 
key:'webViewKey', 
style:webViewStyles, 
url:this.props.url, 
html:this.props.html, 
bounces:this.props.bounces, 
scrollEnabled:this.props.scrollEnabled, 
shouldInjectAJAXHandler:this.props.shouldInjectAJAXHandler, 
contentInset:this.props.contentInset, 
automaticallyAdjustContentInsets:this.props.automaticallyAdjustContentInsets, 
onLoadingStart:this.onLoadingStart, 
onLoadingFinish:this.onLoadingFinish, 
onLoadingError:this.onLoadingError});


return (
React.createElement(View, {style:styles.container}, 
webView, 
otherView));}, 




goForward:function(){
RCTWebViewManager.goForward(this.getWebWiewHandle());}, 


goBack:function(){
RCTWebViewManager.goBack(this.getWebWiewHandle());}, 


reload:function(){
RCTWebViewManager.reload(this.getWebWiewHandle());}, 






updateNavigationState:function(event){
if(this.props.onNavigationStateChange){
this.props.onNavigationStateChange(event.nativeEvent);}}, 



getWebWiewHandle:function(){
return React.findNodeHandle(this.refs[RCT_WEBVIEW_REF]);}, 


onLoadingStart:function(event){
this.updateNavigationState(event);}, 


onLoadingError:function(event){
event.persist();
console.error('Encountered an error loading page', event.nativeEvent);

this.setState({
lastErrorEvent:event.nativeEvent, 
viewState:WebViewState.ERROR});}, 



onLoadingFinish:function(event){
this.setState({
viewState:WebViewState.IDLE});

this.updateNavigationState(event);}});



var RCTWebView=requireNativeComponent('RCTWebView', WebView);

var styles=StyleSheet.create({
container:{
flex:1}, 

errorContainer:{
flex:1, 
justifyContent:'center', 
alignItems:'center', 
backgroundColor:BGWASH}, 

errorText:{
fontSize:14, 
textAlign:'center', 
marginBottom:2}, 

errorTextTitle:{
fontSize:15, 
fontWeight:'500', 
marginBottom:10}, 

hidden:{
height:0, 
flex:0}, 

loadingView:{
backgroundColor:BGWASH, 
flex:1, 
justifyContent:'center', 
alignItems:'center'}, 

webView:{
backgroundColor:'#ffffff'}});



module.exports = WebView;});
__d('AlertIOS',["NativeModules","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var RCTAlertManager=require('NativeModules').AlertManager;
var invariant=require('invariant');

var DEFAULT_BUTTON_TEXT='OK';
var DEFAULT_BUTTON={
text:DEFAULT_BUTTON_TEXT, 
onPress:null};var 
























AlertIOS=(function(){function AlertIOS(){_classCallCheck(this, AlertIOS);}_createClass(AlertIOS, null, [{key:'alert', value:
function alert(
title, 
message, 
buttons, 



type)
{
var callbacks=[];
var buttonsSpec=[];
title = title || '';
message = message || '';
buttons = buttons || [DEFAULT_BUTTON];
type = type || '';

buttons.forEach(function(btn, index){
callbacks[index] = btn.onPress;
var btnDef={};
btnDef[index] = btn.text || DEFAULT_BUTTON_TEXT;
buttonsSpec.push(btnDef);});

RCTAlertManager.alertWithArgs({
title:title, 
message:message, 
buttons:buttonsSpec, 
type:type}, 
function(id, value){
var cb=callbacks[id];
cb && cb(value);});}}, {key:'prompt', value:



function prompt(
title, 
value, 
buttons, 



callback)
{
if(arguments.length === 2){
if(typeof value === 'object'){
buttons = value;
value = undefined;}else 
if(typeof value === 'function'){
callback = value;
value = undefined;}}else 

if(arguments.length === 3 && typeof buttons === 'function'){
callback = buttons;
buttons = undefined;}


invariant(
!(callback && buttons) && (callback || buttons), 
'Must provide either a button list or a callback, but not both');


if(!buttons){
buttons = [{
text:'Cancel'}, 
{
text:'OK', 
onPress:callback}];}


this.alert(title, value, buttons, 'plain-text');}}]);return AlertIOS;})();



module.exports = AlertIOS;});
__d('AppRegistry',["invariant","renderApplication","RCTRenderingPerf"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var invariant=require('invariant');
var renderApplication=require('renderApplication');

if(__DEV__){


require('RCTRenderingPerf');}


var runnables={};


















var AppRegistry={
registerConfig:function(config){
for(var i=0; i < config.length; ++i) {
var appConfig=config[i];
if(appConfig.run){
AppRegistry.registerRunnable(appConfig.appKey, appConfig.run);}else 
{
AppRegistry.registerComponent(appConfig.appKey, appConfig.component);}}}, 




registerComponent:function(appKey, getComponentFunc){
runnables[appKey] = {
run:function(appParameters){return (
renderApplication(getComponentFunc(), appParameters.initialProps, appParameters.rootTag));}};

return appKey;}, 


registerRunnable:function(appKey, func){
runnables[appKey] = {run:func};
return appKey;}, 


runApplication:function(appKey, appParameters){
console.log(
'Running application "' + appKey + '" with appParams: ' + 
JSON.stringify(appParameters) + '. ' + 
'__DEV__ === ' + __DEV__ + 
', development-level warning are ' + (__DEV__?'ON':'OFF') + 
', performance optimizations are ' + (__DEV__?'OFF':'ON'));

invariant(
runnables[appKey] && runnables[appKey].run, 
'Application ' + appKey + ' has not been registered. This ' + 
'is either due to a require() error during initialization ' + 
'or failure to call AppRegistry.registerComponent.');

runnables[appKey].run(appParameters);}};



module.exports = AppRegistry;});
__d('renderApplication',["Inspector","RCTDeviceEventEmitter","React","StyleSheet","Subscribable","View","WarningBox","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var Inspector=require('Inspector');
var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var React=require('React');
var StyleSheet=require('StyleSheet');
var Subscribable=require('Subscribable');
var View=require('View');
var WarningBox=require('WarningBox');

var invariant=require('invariant');

var AppContainer=React.createClass({displayName:'AppContainer', 
mixins:[Subscribable.Mixin], 

getInitialState:function(){
return {inspector:null};}, 


toggleElementInspector:function(){
var inspector=this.state.inspector?
null:
React.createElement(Inspector, {
rootTag:this.props.rootTag, 
inspectedViewTag:React.findNodeHandle(this.refs.main)});

this.setState({inspector:inspector});}, 


componentDidMount:function(){
this.addListenerOn(
RCTDeviceEventEmitter, 
'toggleElementInspector', 
this.toggleElementInspector);}, 



render:function(){
var shouldRenderWarningBox=__DEV__ && console.yellowBoxEnabled;
var warningBox=shouldRenderWarningBox?React.createElement(WarningBox, null):null;
return (
React.createElement(View, {style:styles.appContainer}, 
React.createElement(View, {style:styles.appContainer, ref:'main'}, 
this.props.children), 

warningBox, 
this.state.inspector));}});





function renderApplication(
RootComponent, 
initialProps, 
rootTag)
{
invariant(
rootTag, 
'Expect to have a valid rootTag, instead got ', rootTag);

React.render(
React.createElement(AppContainer, {rootTag:rootTag}, 
React.createElement(RootComponent, 
initialProps)), 


rootTag);}



var styles=StyleSheet.create({
appContainer:{
position:'absolute', 
left:0, 
top:0, 
right:0, 
bottom:0}});



module.exports = renderApplication;});
__d('Inspector',["Dimensions","InspectorOverlay","InspectorPanel","InspectorUtils","React","StyleSheet","NativeModules","View"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var Dimensions=require('Dimensions');
var InspectorOverlay=require('InspectorOverlay');
var InspectorPanel=require('InspectorPanel');
var InspectorUtils=require('InspectorUtils');
var React=require('React');
var StyleSheet=require('StyleSheet');
var UIManager=require('NativeModules').UIManager;
var View=require('View');var 

Inspector=(function(_React$Component){
function Inspector(props){_classCallCheck(this, Inspector);
_get(Object.getPrototypeOf(Inspector.prototype), 'constructor', this).call(this, props);
this.state = {
panelPos:'bottom', 
inspecting:true, 
inspected:null};}_inherits(Inspector, _React$Component);_createClass(Inspector, [{key:'setSelection', value:



function setSelection(i){var _this=this;
var instance=this.state.hierarchy[i];
var publicInstance=instance.getPublicInstance();
UIManager.measure(React.findNodeHandle(instance), function(x, y, width, height, left, top){
_this.setState({
inspected:{
frame:{left:left, top:top, width:width, height:height}, 
style:publicInstance.props?publicInstance.props.style:{}}, 

selection:i});});}}, {key:'onTouchInstance', value:




function onTouchInstance(instance, frame, pointerY){
var hierarchy=InspectorUtils.getOwnerHierarchy(instance);
var publicInstance=instance.getPublicInstance();
var props=publicInstance.props || {};
this.setState({
panelPos:pointerY > Dimensions.get('window').height / 2?'top':'bottom', 
selection:hierarchy.length - 1, 
hierarchy:hierarchy, 
inspected:{
style:props.style || {}, 
frame:frame}});}}, {key:'setInspecting', value:




function setInspecting(val){
this.setState({
inspecting:val});}}, {key:'render', value:



function render(){
var panelPosition;
if(this.state.panelPos === 'bottom'){
panelPosition = {bottom:-Dimensions.get('window').height};}else 
{
panelPosition = {top:0};}

return (
React.createElement(View, {style:styles.container}, 
this.state.inspecting && 
React.createElement(InspectorOverlay, {
rootTag:this.props.rootTag, 
inspected:this.state.inspected, 
inspectedViewTag:this.props.inspectedViewTag, 
onTouchInstance:this.onTouchInstance.bind(this)}), 

React.createElement(View, {style:[styles.panelContainer, panelPosition]}, 
React.createElement(InspectorPanel, {
inspecting:this.state.inspecting, 
setInspecting:this.setInspecting.bind(this), 
inspected:this.state.inspected, 
hierarchy:this.state.hierarchy, 
selection:this.state.selection, 
setSelection:this.setSelection.bind(this)}))));}}]);return Inspector;})(React.Component);







var styles=StyleSheet.create({
container:{
position:'absolute', 
backgroundColor:'transparent', 
top:0, 
left:0, 
right:0, 
height:0}, 

panelContainer:{
position:'absolute', 
left:0, 
right:0}});



module.exports = Inspector;});
__d('InspectorOverlay',["Dimensions","InspectorUtils","React","StyleSheet","NativeModules","View","ElementBox"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var Dimensions=require('Dimensions');
var InspectorUtils=require('InspectorUtils');
var React=require('React');
var StyleSheet=require('StyleSheet');
var UIManager=require('NativeModules').UIManager;
var View=require('View');
var ElementBox=require('ElementBox');

var PropTypes=React.PropTypes;





var InspectorOverlay=React.createClass({displayName:'InspectorOverlay', 
propTypes:{
inspectedViewTag:PropTypes.object, 
onTouchInstance:PropTypes.func.isRequired}, 


findViewForTouchEvent:function(e){var _this=this;var _e$nativeEvent$touches$0=
e.nativeEvent.touches[0];var locationX=_e$nativeEvent$touches$0.locationX;var locationY=_e$nativeEvent$touches$0.locationY;
UIManager.findSubviewIn(
this.props.inspectedViewTag, 
[locationX, locationY], 
function(nativeViewTag, left, top, width, height){
var instance=InspectorUtils.findInstanceByNativeTag(_this.props.rootTag, nativeViewTag);
if(!instance){
return;}

_this.props.onTouchInstance(instance, {left:left, top:top, width:width, height:height}, locationY);});}, 




shouldSetResponser:function(e){
this.findViewForTouchEvent(e);
return true;}, 


render:function(){
var content=null;
if(this.props.inspected){
content = React.createElement(ElementBox, {frame:this.props.inspected.frame, style:this.props.inspected.style});}


return (
React.createElement(View, {
onStartShouldSetResponder:this.shouldSetResponser, 
onResponderMove:this.findViewForTouchEvent, 
style:[styles.inspector, {height:Dimensions.get('window').height}]}, 
content));}});





var styles=StyleSheet.create({
inspector:{
backgroundColor:'transparent', 
position:'absolute', 
left:0, 
top:0, 
right:0}});



module.exports = InspectorOverlay;});
__d('InspectorUtils',["ReactInstanceHandles","ReactInstanceMap","ReactNativeMount","ReactNativeTagHandles"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';











var ReactInstanceHandles=require('ReactInstanceHandles');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactNativeMount=require('ReactNativeMount');
var ReactNativeTagHandles=require('ReactNativeTagHandles');

function traverseOwnerTreeUp(hierarchy, instance){
if(instance){
hierarchy.unshift(instance);
traverseOwnerTreeUp(hierarchy, instance._currentElement._owner);}}



function findInstance(component, targetID){
if(targetID === findRootNodeID(component)){
return component;}

if(component._renderedComponent){
return findInstance(component._renderedComponent, targetID);}else 
{
for(var key in component._renderedChildren) {
var child=component._renderedChildren[key];
if(ReactInstanceHandles.isAncestorIDOf(findRootNodeID(child), targetID)){
var instance=findInstance(child, targetID);
if(instance){
return instance;}}}}}






function findRootNodeID(component){
var internalInstance=ReactInstanceMap.get(component);
return internalInstance?internalInstance._rootNodeID:component._rootNodeID;}


function findInstanceByNativeTag(rootTag, nativeTag){
var containerID=ReactNativeTagHandles.tagToRootNodeID[rootTag];
var rootInstance=ReactNativeMount._instancesByContainerID[containerID];
var targetID=ReactNativeTagHandles.tagToRootNodeID[nativeTag];
if(!targetID){
return undefined;}

return findInstance(rootInstance, targetID);}


function getOwnerHierarchy(instance){
var hierarchy=[];
traverseOwnerTreeUp(hierarchy, instance);
return hierarchy;}


module.exports = {findInstanceByNativeTag:findInstanceByNativeTag, getOwnerHierarchy:getOwnerHierarchy};});
__d('ElementBox',["React","View","StyleSheet","BorderBox","resolveBoxStyle","flattenStyle"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var React=require('React');
var View=require('View');
var StyleSheet=require('StyleSheet');
var BorderBox=require('BorderBox');
var resolveBoxStyle=require('resolveBoxStyle');

var flattenStyle=require('flattenStyle');var 

ElementBox=(function(_React$Component){function ElementBox(){_classCallCheck(this, ElementBox);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(ElementBox, _React$Component);_createClass(ElementBox, [{key:'render', value:
function render(){
var style=flattenStyle(this.props.style) || {};
var margin=resolveBoxStyle('margin', style);
var padding=resolveBoxStyle('padding', style);
var frameStyle=this.props.frame;
if(margin){
frameStyle = {
top:frameStyle.top - margin.top, 
left:frameStyle.left - margin.left, 
height:frameStyle.height + margin.top + margin.bottom, 
width:frameStyle.width + margin.left + margin.right};}


var contentStyle={
width:this.props.frame.width, 
height:this.props.frame.height};

if(padding){
contentStyle = {
width:contentStyle.width - padding.left - padding.right, 
height:contentStyle.height - padding.top - padding.bottom};}


return (
React.createElement(View, {style:[styles.frame, frameStyle], pointerEvents:'none'}, 
React.createElement(BorderBox, {box:margin, style:styles.margin}, 
React.createElement(BorderBox, {box:padding, style:styles.padding}, 
React.createElement(View, {style:[styles.content, contentStyle]})))));}}]);return ElementBox;})(React.Component);







var styles=StyleSheet.create({
frame:{
position:'absolute'}, 

content:{
backgroundColor:'rgba(200, 230, 255, 0.8)'}, 

padding:{
borderColor:'rgba(77, 255, 0, 0.3)'}, 

margin:{
borderColor:'rgba(255, 132, 0, 0.3)'}});



module.exports = ElementBox;});
__d('BorderBox',["React","View"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var React=require('React');
var View=require('View');var 

BorderBox=(function(_React$Component){function BorderBox(){_classCallCheck(this, BorderBox);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(BorderBox, _React$Component);_createClass(BorderBox, [{key:'render', value:
function render(){
var box=this.props.box;
if(!box){
return this.props.children;}

var style={
borderTopWidth:box.top, 
borderBottomWidth:box.bottom, 
borderLeftWidth:box.left, 
borderRightWidth:box.right};

return (
React.createElement(View, {style:[style, this.props.style]}, 
this.props.children));}}]);return BorderBox;})(React.Component);





module.exports = BorderBox;});
__d('resolveBoxStyle',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';





















function resolveBoxStyle(prefix, style){
var res={};
var subs=['top', 'left', 'bottom', 'right'];
var set=false;
subs.forEach(function(sub){
res[sub] = style[prefix] || 0;});

if(style[prefix]){
set = true;}

if(style[prefix + 'Vertical']){
res.top = res.bottom = style[prefix + 'Vertical'];
set = true;}

if(style[prefix + 'Horizontal']){
res.left = res.right = style[prefix + 'Horizontal'];
set = true;}

subs.forEach(function(sub){
var val=style[prefix + capFirst(sub)];
if(val){
res[sub] = val;
set = true;}});


if(!set){
return;}

return res;}


function capFirst(text){
return text[0].toUpperCase() + text.slice(1);}


module.exports = resolveBoxStyle;});
__d('InspectorPanel',["React","StyleSheet","Text","View","ElementProperties","TouchableHighlight"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var React=require('React');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var View=require('View');
var ElementProperties=require('ElementProperties');
var TouchableHighlight=require('TouchableHighlight');

var PropTypes=React.PropTypes;var 

InspectorPanel=(function(_React$Component){function InspectorPanel(){_classCallCheck(this, InspectorPanel);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(InspectorPanel, _React$Component);_createClass(InspectorPanel, [{key:'renderWaiting', value:
function renderWaiting(){
if(this.props.inspecting){
return (
React.createElement(Text, {style:styles.waitingText}, 'Tap something to inspect it'));}




return React.createElement(Text, {style:styles.waitingText}, 'Nothing is inspected');}}, {key:'render', value:


function render(){
var contents;
if(this.props.inspected){
contents = 
React.createElement(ElementProperties, {
style:this.props.inspected.style, 
frame:this.props.inspected.frame, 
hierarchy:this.props.hierarchy, 
selection:this.props.selection, 
setSelection:this.props.setSelection});}else 


{
contents = 
React.createElement(View, {style:styles.waiting}, 
this.renderWaiting());}



return (
React.createElement(View, {style:styles.container}, 
contents, 
React.createElement(View, {style:styles.buttonRow}, 
React.createElement(Button, {
title:'Inspect', 
pressed:this.props.inspecting, 
onClick:this.props.setInspecting}))));}}]);return InspectorPanel;})(React.Component);






InspectorPanel.propTypes = {
inspecting:PropTypes.bool, 
setInspecting:PropTypes.func, 
inspected:PropTypes.object};var 


Button=(function(_React$Component2){function Button(){_classCallCheck(this, Button);if(_React$Component2 != null){_React$Component2.apply(this, arguments);}}_inherits(Button, _React$Component2);_createClass(Button, [{key:'render', value:
function render(){var _this=this;
return (
React.createElement(TouchableHighlight, {onPress:function(){return _this.props.onClick(!_this.props.pressed);}, style:[
styles.button, 
this.props.pressed && styles.buttonPressed]}, 

React.createElement(Text, {style:styles.buttonText}, this.props.title)));}}]);return Button;})(React.Component);





var styles=StyleSheet.create({
buttonRow:{
flexDirection:'row'}, 

button:{
backgroundColor:'rgba(0, 0, 0, 0.3)', 
margin:2, 
height:30, 
justifyContent:'center', 
alignItems:'center'}, 

buttonPressed:{
backgroundColor:'rgba(255, 255, 255, 0.3)'}, 

buttonText:{
textAlign:'center', 
color:'white', 
margin:5}, 

container:{
backgroundColor:'rgba(0, 0, 0, 0.7)'}, 

waiting:{
height:100}, 

waitingText:{
fontSize:20, 
textAlign:'center', 
marginVertical:20}});



module.exports = InspectorPanel;});
__d('ElementProperties',["BoxInspector","ReactPropTypes","React","StyleInspector","StyleSheet","Text","TouchableHighlight","TouchableWithoutFeedback","View","flattenStyle","mapWithSeparator"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var BoxInspector=require('BoxInspector');
var PropTypes=require('ReactPropTypes');
var React=require('React');
var StyleInspector=require('StyleInspector');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var TouchableHighlight=require('TouchableHighlight');
var TouchableWithoutFeedback=require('TouchableWithoutFeedback');
var View=require('View');

var flattenStyle=require('flattenStyle');
var mapWithSeparator=require('mapWithSeparator');

var ElementProperties=React.createClass({displayName:'ElementProperties', 
propTypes:{
hierarchy:PropTypes.array.isRequired, 
style:PropTypes.array.isRequired}, 


render:function(){var _this=this;
var style=flattenStyle(this.props.style);
var selection=this.props.selection;


return (
React.createElement(TouchableWithoutFeedback, null, 
React.createElement(View, {style:styles.info}, 
React.createElement(View, {style:styles.breadcrumb}, 
mapWithSeparator(
this.props.hierarchy, 
function(item, i){return (
React.createElement(TouchableHighlight, {
style:[styles.breadItem, i === selection && styles.selected], 
onPress:function(){return _this.props.setSelection(i);}}, 
React.createElement(Text, {style:styles.breadItemText}, 
item.getName?item.getName():'Unknown')));}, 



function(){return React.createElement(Text, {style:styles.breadSep}, 'â–¸');})), 


React.createElement(View, {style:styles.row}, 
React.createElement(StyleInspector, {style:style}), 
React.createElement(BoxInspector, {style:style, frame:this.props.frame})))));}});







var styles=StyleSheet.create({
breadSep:{
fontSize:8, 
color:'white'}, 

breadcrumb:{
flexDirection:'row', 
flexWrap:'wrap', 
marginBottom:5}, 

selected:{
borderColor:'white', 
borderRadius:5}, 

breadItem:{
borderWidth:1, 
borderColor:'transparent', 
marginHorizontal:2}, 

breadItemText:{
fontSize:10, 
color:'white', 
marginHorizontal:5}, 

row:{
flexDirection:'row', 
alignItems:'center', 
justifyContent:'space-between'}, 

info:{
padding:10}, 

path:{
color:'white', 
fontSize:9}});



module.exports = ElementProperties;});
__d('BoxInspector',["React","StyleSheet","Text","View","resolveBoxStyle"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var React=require('React');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var View=require('View');
var resolveBoxStyle=require('resolveBoxStyle');

var blank={
top:0, 
left:0, 
right:0, 
bottom:0};var 


BoxInspector=(function(_React$Component){function BoxInspector(){_classCallCheck(this, BoxInspector);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(BoxInspector, _React$Component);_createClass(BoxInspector, [{key:'render', value:
function render(){
var frame=this.props.frame;
var style=this.props.style;
var margin=style && resolveBoxStyle('margin', style) || blank;
var padding=style && resolveBoxStyle('padding', style) || blank;
return (
React.createElement(BoxContainer, {title:'margin', titleStyle:styles.marginLabel, box:margin}, 
React.createElement(BoxContainer, {title:'padding', box:padding}, 
React.createElement(View, null, 
React.createElement(Text, {style:styles.innerText}, '(', 
frame.left, ', ', frame.top, ')'), 

React.createElement(Text, {style:styles.innerText}, 
frame.width, ' Ã— ', frame.height)))));}}]);return BoxInspector;})(React.Component);var 








BoxContainer=(function(_React$Component2){function BoxContainer(){_classCallCheck(this, BoxContainer);if(_React$Component2 != null){_React$Component2.apply(this, arguments);}}_inherits(BoxContainer, _React$Component2);_createClass(BoxContainer, [{key:'render', value:
function render(){
var box=this.props.box;
return (
React.createElement(View, {style:styles.box}, 
React.createElement(View, {style:styles.row}, 
React.createElement(Text, {style:[this.props.titleStyle, styles.label]}, this.props.title), 
React.createElement(Text, {style:styles.boxText}, box.top)), 

React.createElement(View, {style:styles.row}, 
React.createElement(Text, {style:styles.boxText}, box.left), 
this.props.children, 
React.createElement(Text, {style:styles.boxText}, box.right)), 

React.createElement(Text, {style:styles.boxText}, box.bottom)));}}]);return BoxContainer;})(React.Component);





var styles=StyleSheet.create({
row:{
flexDirection:'row', 
alignItems:'center', 
justifyContent:'space-around'}, 

marginLabel:{
width:60}, 

label:{
fontSize:10, 
color:'rgb(255,100,0)', 
marginLeft:5, 
flex:1, 
textAlign:'left', 
top:-3}, 

buffer:{
fontSize:10, 
color:'yellow', 
flex:1, 
textAlign:'center'}, 

innerText:{
color:'yellow', 
fontSize:12, 
textAlign:'center', 
width:70}, 

box:{
borderWidth:1, 
borderColor:'grey'}, 

boxText:{
color:'white', 
fontSize:12, 
marginHorizontal:3, 
marginVertical:2, 
textAlign:'center'}});



module.exports = BoxInspector;});
__d('StyleInspector',["React","StyleSheet","Text","View"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}












var React=require('React');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var View=require('View');var 

StyleInspector=(function(_React$Component){function StyleInspector(){_classCallCheck(this, StyleInspector);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(StyleInspector, _React$Component);_createClass(StyleInspector, [{key:'render', value:
function render(){var _this=this;
if(!this.props.style){
return React.createElement(Text, {style:styles.noStyle}, 'No style');}

var names=Object.keys(this.props.style);
return (
React.createElement(View, {style:styles.container}, 
React.createElement(View, null, 
names.map(function(name){return React.createElement(Text, {style:styles.attr}, name, ':');})), 

React.createElement(View, null, 
names.map(function(name){return React.createElement(Text, {style:styles.value}, _this.props.style[name]);}))));}}]);return StyleInspector;})(React.Component);






var styles=StyleSheet.create({
container:{
flexDirection:'row'}, 

row:{
flexDirection:'row', 
alignItems:'center', 
justifyContent:'space-around'}, 

attr:{
fontSize:10, 
color:'#ccc'}, 

value:{
fontSize:10, 
color:'white', 
marginLeft:10}, 

noStyle:{
color:'white', 
fontSize:10}});



module.exports = StyleInspector;});
__d('mapWithSeparator',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';






function mapWithSeparator(array, valueFunction, separatorFunction){
var results=[];
for(var i=0; i < array.length; i++) {
results.push(valueFunction(array[i], i, array));
if(i !== array.length - 1){
results.push(separatorFunction(i));}}


return results;}


module.exports = mapWithSeparator;});
__d('WarningBox',["AsyncStorage","EventEmitter","Map","PanResponder","React","StyleSheet","Text","TouchableOpacity","View","invariant","rebound/rebound","stringifySafe","Dimensions"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};











var AsyncStorage=require('AsyncStorage');
var EventEmitter=require('EventEmitter');
var Map=require('Map');
var PanResponder=require('PanResponder');
var React=require('React');
var StyleSheet=require('StyleSheet');
var Text=require('Text');
var TouchableOpacity=require('TouchableOpacity');
var View=require('View');

var invariant=require('invariant');
var rebound=require('rebound/rebound');
var stringifySafe=require('stringifySafe');

var SCREEN_WIDTH=require('Dimensions').get('window').width;
var IGNORED_WARNINGS_KEY='__DEV_WARNINGS_IGNORED';

var consoleWarn=console.warn.bind(console);

var warningCounts=new Map();
var ignoredWarnings=[];
var totalWarningCount=0;
var warningCountEvents=new EventEmitter();























if(__DEV__){
console.warn = function(){
consoleWarn.apply(null, arguments);
if(!console.yellowBoxEnabled){
return;}

var warning=Array.prototype.map.call(arguments, stringifySafe).join(' ');
if(!console.yellowBoxResetIgnored && 
ignoredWarnings.indexOf(warning) !== -1){
return;}

var count=warningCounts.has(warning)?warningCounts.get(warning) + 1:1;
warningCounts.set(warning, count);
totalWarningCount += 1;
warningCountEvents.emit('count', totalWarningCount);};}



function saveIgnoredWarnings(){
AsyncStorage.setItem(
IGNORED_WARNINGS_KEY, 
JSON.stringify(ignoredWarnings), 
function(err){
if(err){
console.warn('Could not save ignored warnings.', err);}});}





AsyncStorage.getItem(IGNORED_WARNINGS_KEY, function(err, data){
if(!err && data && !console.yellowBoxResetIgnored){
ignoredWarnings = JSON.parse(data);}});



var WarningRow=React.createClass({displayName:'WarningRow', 
componentWillMount:function(){var _this=this;
this.springSystem = new rebound.SpringSystem();
this.dismissalSpring = this.springSystem.createSpring();
this.dismissalSpring.setRestSpeedThreshold(0.05);
this.dismissalSpring.setCurrentValue(0);
this.dismissalSpring.addListener({
onSpringUpdate:function(){
var val=_this.dismissalSpring.getCurrentValue();
_this.text && _this.text.setNativeProps({
left:SCREEN_WIDTH * val});

_this.container && _this.container.setNativeProps({
opacity:1 - val});

_this.closeButton && _this.closeButton.setNativeProps({
opacity:1 - val * 5});}, 


onSpringAtRest:function(){
if(_this.dismissalSpring.getCurrentValue()){
_this.collapseSpring.setEndValue(1);}}});



this.collapseSpring = this.springSystem.createSpring();
this.collapseSpring.setRestSpeedThreshold(0.05);
this.collapseSpring.setCurrentValue(0);
this.collapseSpring.getSpringConfig().friction = 20;
this.collapseSpring.getSpringConfig().tension = 200;
this.collapseSpring.addListener({
onSpringUpdate:function(){
var val=_this.collapseSpring.getCurrentValue();
_this.container && _this.container.setNativeProps({
height:Math.abs(46 - val * 46)});}, 


onSpringAtRest:function(){
_this.props.onDismissed();}});


this.panGesture = PanResponder.create({
onStartShouldSetPanResponder:function(){
return !!_this.dismissalSpring.getCurrentValue();}, 

onMoveShouldSetPanResponder:function(){return true;}, 
onPanResponderGrant:function(){
_this.isResponderOnlyToBlockTouches = 
!!_this.dismissalSpring.getCurrentValue();}, 

onPanResponderMove:function(e, gestureState){
if(_this.isResponderOnlyToBlockTouches){
return;}

_this.dismissalSpring.setCurrentValue(gestureState.dx / SCREEN_WIDTH);}, 

onPanResponderRelease:function(e, gestureState){
if(_this.isResponderOnlyToBlockTouches){
return;}

var gestureCompletion=gestureState.dx / SCREEN_WIDTH;
var doesGestureRelease=gestureState.vx + gestureCompletion > 0.5;
_this.dismissalSpring.setEndValue(doesGestureRelease?1:0);}});}, 



render:function(){var _this2=this;
var countText;
if(warningCounts.get(this.props.warning) > 1){
countText = 
React.createElement(Text, {style:styles.bold}, '(', 
warningCounts.get(this.props.warning), ')', ' ');}



return (
React.createElement(View, _extends({
style:styles.warningBox, 
ref:function(container){_this2.container = container;}}, 
this.panGesture.panHandlers), 
React.createElement(TouchableOpacity, {
onPress:this.props.onOpened}, 
React.createElement(View, null, 
React.createElement(Text, {
style:styles.warningText, 
numberOfLines:2, 
ref:function(text){_this2.text = text;}}, 
countText, 
this.props.warning))), 



React.createElement(View, {
ref:function(closeButton){_this2.closeButton = closeButton;}, 
style:styles.closeButton}, 
React.createElement(TouchableOpacity, {
onPress:function(){
_this2.dismissalSpring.setEndValue(1);}}, 

React.createElement(Text, {style:styles.closeButtonText}, 'âœ•')))));}});







var WarningBoxOpened=React.createClass({displayName:'WarningBoxOpened', 
render:function(){
var countText;
if(warningCounts.get(this.props.warning) > 1){
countText = 
React.createElement(Text, {style:styles.bold}, '(', 
warningCounts.get(this.props.warning), ')', ' ');}



return (
React.createElement(TouchableOpacity, {
activeOpacity:0.9, 
onPress:this.props.onClose}, 
React.createElement(View, {style:styles.yellowBox}, 
React.createElement(Text, {style:styles.yellowBoxText}, 
countText, 
this.props.warning), 

React.createElement(View, {style:styles.yellowBoxButtons}, 
React.createElement(View, {style:styles.yellowBoxButton}, 
React.createElement(TouchableOpacity, {
onPress:this.props.onDismissed}, 
React.createElement(Text, {style:styles.yellowBoxButtonText}, 'Dismiss'))), 




React.createElement(View, {style:styles.yellowBoxButton}, 
React.createElement(TouchableOpacity, {
onPress:this.props.onIgnored}, 
React.createElement(Text, {style:styles.yellowBoxButtonText}, 'Ignore')))))));}});











var canMountWarningBox=true;

var WarningBox=React.createClass({displayName:'WarningBox', 
getInitialState:function(){
return {
totalWarningCount:totalWarningCount, 
openWarning:null};}, 


componentWillMount:function(){
if(console.yellowBoxResetIgnored){
AsyncStorage.setItem(IGNORED_WARNINGS_KEY, '[]', function(err){
if(err){
console.warn('Could not reset ignored warnings.', err);}});


ignoredWarnings = [];}}, 


componentDidMount:function(){
invariant(
canMountWarningBox, 
'There can only be one WarningBox');

canMountWarningBox = false;
warningCountEvents.addListener(
'count', 
this._onWarningCount);}, 


componentWillUnmount:function(){
warningCountEvents.removeAllListeners();
canMountWarningBox = true;}, 

_onWarningCount:function(totalWarningCount){var _this3=this;


setImmediate(function(){
_this3.setState({totalWarningCount:totalWarningCount});});}, 


_onDismiss:function(warning){
warningCounts.delete(warning);
this.setState({
openWarning:null});}, 


render:function(){var _this4=this;
if(warningCounts.size === 0){
return React.createElement(View, null);}

if(this.state.openWarning){
return (
React.createElement(WarningBoxOpened, {
warning:this.state.openWarning, 
onClose:function(){
_this4.setState({openWarning:null});}, 

onDismissed:this._onDismiss.bind(this, this.state.openWarning), 
onIgnored:function(){
ignoredWarnings.push(_this4.state.openWarning);
saveIgnoredWarnings();
_this4._onDismiss(_this4.state.openWarning);}}));}




var warningRows=[];
warningCounts.forEach(function(count, warning){
warningRows.push(
React.createElement(WarningRow, {
key:warning, 
onOpened:function(){
_this4.setState({openWarning:warning});}, 

onDismissed:_this4._onDismiss.bind(_this4, warning), 
warning:warning}));});



return (
React.createElement(View, {style:styles.warningContainer}, 
warningRows));}});





var styles=StyleSheet.create({
bold:{
fontWeight:'bold'}, 

closeButton:{
position:'absolute', 
right:0, 
height:46, 
width:46}, 

closeButtonText:{
color:'white', 
fontSize:32, 
position:'relative', 
left:8}, 

warningContainer:{
position:'absolute', 
left:0, 
right:0, 
bottom:0}, 

warningBox:{
position:'relative', 
backgroundColor:'rgba(171, 124, 36, 0.9)', 
flex:1, 
height:46}, 

warningText:{
color:'white', 
position:'absolute', 
left:0, 
marginLeft:15, 
marginRight:46, 
top:7}, 

yellowBox:{
backgroundColor:'rgba(171, 124, 36, 0.9)', 
position:'absolute', 
left:0, 
right:0, 
top:0, 
bottom:0, 
padding:15, 
paddingTop:35}, 

yellowBoxText:{
color:'white', 
fontSize:20}, 

yellowBoxButtons:{
flexDirection:'row', 
position:'absolute', 
bottom:0}, 

yellowBoxButton:{
flex:1, 
padding:25}, 

yellowBoxButtonText:{
color:'white', 
fontSize:16}});



module.exports = WarningBox;});
__d('AsyncStorage',["NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeModules=require('NativeModules');
var RCTAsyncLocalStorage=NativeModules.AsyncLocalStorage;
var RCTAsyncRocksDBStorage=NativeModules.AsyncRocksDBStorage;


var RCTAsyncStorage=RCTAsyncRocksDBStorage || RCTAsyncLocalStorage;













var AsyncStorage={




getItem:function(
key, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiGet([key], function(errors, result){

var value=result && result[0] && result[0][1]?result[0][1]:null;
callback && callback(errors && convertError(errors[0]) || null, value);
if(errors){
reject(convertError(errors[0]));}else 
{
resolve(value);}});});}, 









setItem:function(
key, 
value, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiSet([[key, value]], function(errors){
callback && callback(errors && convertError(errors[0]) || null);
if(errors){
reject(convertError(errors[0]));}else 
{
resolve(null);}});});}, 







removeItem:function(
key, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiRemove([key], function(errors){
callback && callback(errors && convertError(errors[0]) || null);
if(errors){
reject(convertError(errors[0]));}else 
{
resolve(null);}});});}, 










mergeItem:function(
key, 
value, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiMerge([[key, value]], function(errors){
callback && callback(errors && convertError(errors[0]) || null);
if(errors){
reject(convertError(errors[0]));}else 
{
resolve(null);}});});}, 










clear:function(callback){
return new Promise(function(resolve, reject){
RCTAsyncStorage.clear(function(error){
callback && callback(convertError(error));
if(error && convertError(error)){
reject(convertError(error));}else 
{
resolve(null);}});});}, 








getAllKeys:function(callback){
return new Promise(function(resolve, reject){
RCTAsyncStorage.getAllKeys(function(error, keys){
callback && callback(convertError(error), keys);
if(error){
reject(convertError(error));}else 
{
resolve(keys);}});});}, 





















multiGet:function(
keys, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiGet(keys, function(errors, result){
var error=errors && errors.map(function(error){return convertError(error);}) || null;
callback && callback(error, result);
if(errors){
reject(error);}else 
{
resolve(result);}});});}, 











multiSet:function(
keyValuePairs, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiSet(keyValuePairs, function(errors){
var error=errors && errors.map(function(error){return convertError(error);}) || null;
callback && callback(error);
if(errors){
reject(error);}else 
{
resolve(null);}});});}, 








multiRemove:function(
keys, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiRemove(keys, function(errors){
var error=errors && errors.map(function(error){return convertError(error);}) || null;
callback && callback(error);
if(errors){
reject(error);}else 
{
resolve(null);}});});}, 











multiMerge:function(
keyValuePairs, 
callback)
{
return new Promise(function(resolve, reject){
RCTAsyncStorage.multiMerge(keyValuePairs, function(errors){
var error=errors && errors.map(function(error){return convertError(error);}) || null;
callback && callback(error);
if(errors){
reject(error);}else 
{
resolve(null);}});});}};







if(!RCTAsyncStorage.multiMerge){
delete AsyncStorage.mergeItem;
delete AsyncStorage.multiMerge;}


function convertError(error){
if(!error){
return null;}

var out=new Error(error.message);
out.key = error.key;
return out;}


module.exports = AsyncStorage;});
__d('RCTRenderingPerf',["ReactDefaultPerf","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactDefaultPerf=require('ReactDefaultPerf');

var invariant=require('invariant');






var perfModules=[];
var enabled=false;

var RCTRenderingPerf={

toggle:function(){
console.log('Render perfomance measurements enabled');
enabled = true;}, 


start:function(){
if(!enabled){
return;}


ReactDefaultPerf.start();
perfModules.forEach(function(module){return module.start();});}, 


stop:function(){
if(!enabled){
return;}


ReactDefaultPerf.stop();
ReactDefaultPerf.printInclusive();
ReactDefaultPerf.printWasted();

var totalRender=0;
var totalTime=0;
var measurements=ReactDefaultPerf.getLastMeasurements();
for(var ii=0; ii < measurements.length; ii++) {
var render=measurements[ii].render;
for(var nodeName in render) {
totalRender += render[nodeName];}

totalTime += measurements[ii].totalTime;}

console.log('Total time spent in render(): ' + totalRender + 'ms');

perfModules.forEach(function(module){return module.stop();});}, 


register:function(module){
invariant(
typeof module.start === 'function', 
'Perf module should have start() function');

invariant(
typeof module.stop === 'function', 
'Perf module should have stop() function');

perfModules.push(module);}};



module.exports = RCTRenderingPerf;});
__d('ReactDefaultPerf',["DOMProperty","ReactDefaultPerfAnalysis","ReactMount","ReactPerf","performanceNow"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var DOMProperty=require('DOMProperty');
var ReactDefaultPerfAnalysis=require('ReactDefaultPerfAnalysis');
var ReactMount=require('ReactMount');
var ReactPerf=require('ReactPerf');

var performanceNow=require('performanceNow');

function roundFloat(val){
return Math.floor(val * 100) / 100;}


function addValue(obj, key, val){
obj[key] = (obj[key] || 0) + val;}


var ReactDefaultPerf={
_allMeasurements:[], 
_mountStack:[0], 
_injected:false, 

start:function(){
if(!ReactDefaultPerf._injected){
ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);}


ReactDefaultPerf._allMeasurements.length = 0;
ReactPerf.enableMeasure = true;}, 


stop:function(){
ReactPerf.enableMeasure = false;}, 


getLastMeasurements:function(){
return ReactDefaultPerf._allMeasurements;}, 


printExclusive:function(measurements){
measurements = measurements || ReactDefaultPerf._allMeasurements;
var summary=ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
console.table(summary.map(function(item){
return {
'Component class name':item.componentName, 
'Total inclusive time (ms)':roundFloat(item.inclusive), 
'Exclusive mount time (ms)':roundFloat(item.exclusive), 
'Exclusive render time (ms)':roundFloat(item.render), 
'Mount time per instance (ms)':roundFloat(item.exclusive / item.count), 
'Render time per instance (ms)':roundFloat(item.render / item.count), 
'Instances':item.count};}));}, 






printInclusive:function(measurements){
measurements = measurements || ReactDefaultPerf._allMeasurements;
var summary=ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
console.table(summary.map(function(item){
return {
'Owner > component':item.componentName, 
'Inclusive time (ms)':roundFloat(item.time), 
'Instances':item.count};}));


console.log(
'Total time:', 
ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');}, 



getMeasurementsSummaryMap:function(measurements){
var summary=ReactDefaultPerfAnalysis.getInclusiveSummary(
measurements, 
true);

return summary.map(function(item){
return {
'Owner > component':item.componentName, 
'Wasted time (ms)':item.time, 
'Instances':item.count};});}, 




printWasted:function(measurements){
measurements = measurements || ReactDefaultPerf._allMeasurements;
console.table(ReactDefaultPerf.getMeasurementsSummaryMap(measurements));
console.log(
'Total time:', 
ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');}, 



printDOM:function(measurements){
measurements = measurements || ReactDefaultPerf._allMeasurements;
var summary=ReactDefaultPerfAnalysis.getDOMSummary(measurements);
console.table(summary.map(function(item){
var result={};
result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
result['type'] = item.type;
result['args'] = JSON.stringify(item.args);
return result;}));

console.log(
'Total time:', 
ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms');}, 



_recordWrite:function(id, fnName, totalTime, args){

var writes=
ReactDefaultPerf.
_allMeasurements[ReactDefaultPerf._allMeasurements.length - 1].
writes;
writes[id] = writes[id] || [];
writes[id].push({
type:fnName, 
time:totalTime, 
args:args});}, 



measure:function(moduleName, fnName, func){
return function(){for(var _len=arguments.length, args=Array(_len), _key=0; _key < _len; _key++) {args[_key] = arguments[_key];}
var totalTime;
var rv;
var start;

if(fnName === '_renderNewRootComponent' || 
fnName === 'flushBatchedUpdates'){




ReactDefaultPerf._allMeasurements.push({
exclusive:{}, 
inclusive:{}, 
render:{}, 
counts:{}, 
writes:{}, 
displayNames:{}, 
totalTime:0});

start = performanceNow();
rv = func.apply(this, args);
ReactDefaultPerf._allMeasurements[
ReactDefaultPerf._allMeasurements.length - 1].
totalTime = performanceNow() - start;
return rv;}else 
if(fnName === '_mountImageIntoNode' || 
moduleName === 'ReactDOMIDOperations'){
start = performanceNow();
rv = func.apply(this, args);
totalTime = performanceNow() - start;

if(fnName === '_mountImageIntoNode'){
var mountID=ReactMount.getID(args[1]);
ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);}else 
if(fnName === 'dangerouslyProcessChildrenUpdates'){

args[0].forEach(function(update){
var writeArgs={};
if(update.fromIndex !== null){
writeArgs.fromIndex = update.fromIndex;}

if(update.toIndex !== null){
writeArgs.toIndex = update.toIndex;}

if(update.textContent !== null){
writeArgs.textContent = update.textContent;}

if(update.markupIndex !== null){
writeArgs.markup = args[1][update.markupIndex];}

ReactDefaultPerf._recordWrite(
update.parentID, 
update.type, 
totalTime, 
writeArgs);});}else 


{

ReactDefaultPerf._recordWrite(
args[0], 
fnName, 
totalTime, 
Array.prototype.slice.call(args, 1));}


return rv;}else 
if(moduleName === 'ReactCompositeComponent' && (
fnName === 'mountComponent' || 
fnName === 'updateComponent' || 
fnName === '_renderValidatedComponent')){

if(typeof this._currentElement.type === 'string'){
return func.apply(this, args);}


var rootNodeID=fnName === 'mountComponent'?
args[0]:
this._rootNodeID;
var isRender=fnName === '_renderValidatedComponent';
var isMount=fnName === 'mountComponent';

var mountStack=ReactDefaultPerf._mountStack;
var entry=ReactDefaultPerf._allMeasurements[
ReactDefaultPerf._allMeasurements.length - 1];


if(isRender){
addValue(entry.counts, rootNodeID, 1);}else 
if(isMount){
mountStack.push(0);}


start = performanceNow();
rv = func.apply(this, args);
totalTime = performanceNow() - start;

if(isRender){
addValue(entry.render, rootNodeID, totalTime);}else 
if(isMount){
var subMountTime=mountStack.pop();
mountStack[mountStack.length - 1] += totalTime;
addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
addValue(entry.inclusive, rootNodeID, totalTime);}else 
{
addValue(entry.inclusive, rootNodeID, totalTime);}


entry.displayNames[rootNodeID] = {
current:this.getName(), 
owner:this._currentElement._owner?
this._currentElement._owner.getName():
'<root>'};


return rv;}else 
{
return func.apply(this, args);}};}};





module.exports = ReactDefaultPerf;});
__d('DOMProperty',["invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';















var invariant=require('invariant');

function checkMask(value, bitmask){
return (value & bitmask) === bitmask;}


var DOMPropertyInjection={




MUST_USE_ATTRIBUTE:1, 
MUST_USE_PROPERTY:2, 
HAS_SIDE_EFFECTS:4, 
HAS_BOOLEAN_VALUE:8, 
HAS_NUMERIC_VALUE:16, 
HAS_POSITIVE_NUMERIC_VALUE:32 | 16, 
HAS_OVERLOADED_BOOLEAN_VALUE:64, 


























injectDOMPropertyConfig:function(domPropertyConfig){
var Properties=domPropertyConfig.Properties || {};
var DOMAttributeNames=domPropertyConfig.DOMAttributeNames || {};
var DOMPropertyNames=domPropertyConfig.DOMPropertyNames || {};
var DOMMutationMethods=domPropertyConfig.DOMMutationMethods || {};

if(domPropertyConfig.isCustomAttribute){
DOMProperty._isCustomAttributeFunctions.push(
domPropertyConfig.isCustomAttribute);}



for(var propName in Properties) {
invariant(
!DOMProperty.isStandardName.hasOwnProperty(propName), 
'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' + 
'\'%s\' which has already been injected. You may be accidentally ' + 
'injecting the same DOM property config twice, or you may be ' + 
'injecting two configs that have conflicting property names.', 
propName);


DOMProperty.isStandardName[propName] = true;

var lowerCased=propName.toLowerCase();
DOMProperty.getPossibleStandardName[lowerCased] = propName;

if(DOMAttributeNames.hasOwnProperty(propName)){
var attributeName=DOMAttributeNames[propName];
DOMProperty.getPossibleStandardName[attributeName] = propName;
DOMProperty.getAttributeName[propName] = attributeName;}else 
{
DOMProperty.getAttributeName[propName] = lowerCased;}


DOMProperty.getPropertyName[propName] = 
DOMPropertyNames.hasOwnProperty(propName)?
DOMPropertyNames[propName]:
propName;

if(DOMMutationMethods.hasOwnProperty(propName)){
DOMProperty.getMutationMethod[propName] = DOMMutationMethods[propName];}else 
{
DOMProperty.getMutationMethod[propName] = null;}


var propConfig=Properties[propName];
DOMProperty.mustUseAttribute[propName] = 
checkMask(propConfig, DOMPropertyInjection.MUST_USE_ATTRIBUTE);
DOMProperty.mustUseProperty[propName] = 
checkMask(propConfig, DOMPropertyInjection.MUST_USE_PROPERTY);
DOMProperty.hasSideEffects[propName] = 
checkMask(propConfig, DOMPropertyInjection.HAS_SIDE_EFFECTS);
DOMProperty.hasBooleanValue[propName] = 
checkMask(propConfig, DOMPropertyInjection.HAS_BOOLEAN_VALUE);
DOMProperty.hasNumericValue[propName] = 
checkMask(propConfig, DOMPropertyInjection.HAS_NUMERIC_VALUE);
DOMProperty.hasPositiveNumericValue[propName] = 
checkMask(propConfig, DOMPropertyInjection.HAS_POSITIVE_NUMERIC_VALUE);
DOMProperty.hasOverloadedBooleanValue[propName] = 
checkMask(propConfig, DOMPropertyInjection.HAS_OVERLOADED_BOOLEAN_VALUE);

invariant(
!DOMProperty.mustUseAttribute[propName] || 
!DOMProperty.mustUseProperty[propName], 
'DOMProperty: Cannot require using both attribute and property: %s', 
propName);

invariant(
DOMProperty.mustUseProperty[propName] || 
!DOMProperty.hasSideEffects[propName], 
'DOMProperty: Properties that have side effects must use property: %s', 
propName);

invariant(
!!DOMProperty.hasBooleanValue[propName] + 
!!DOMProperty.hasNumericValue[propName] + 
!!DOMProperty.hasOverloadedBooleanValue[propName] <= 1, 
'DOMProperty: Value can be one of boolean, overloaded boolean, or ' + 
'numeric value, but not a combination: %s', 
propName);}}};




var defaultValueCache={};














var DOMProperty={

ID_ATTRIBUTE_NAME:'data-reactid', 





isStandardName:{}, 






getPossibleStandardName:{}, 






getAttributeName:{}, 






getPropertyName:{}, 






getMutationMethod:{}, 





mustUseAttribute:{}, 






mustUseProperty:{}, 







hasSideEffects:{}, 





hasBooleanValue:{}, 






hasNumericValue:{}, 






hasPositiveNumericValue:{}, 







hasOverloadedBooleanValue:{}, 




_isCustomAttributeFunctions:[], 





isCustomAttribute:function(attributeName){
for(var i=0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
var isCustomAttributeFn=DOMProperty._isCustomAttributeFunctions[i];
if(isCustomAttributeFn(attributeName)){
return true;}}


return false;}, 










getDefaultValueForProperty:function(nodeName, prop){
var nodeDefaults=defaultValueCache[nodeName];
var testElement;
if(!nodeDefaults){
defaultValueCache[nodeName] = nodeDefaults = {};}

if(!(prop in nodeDefaults)){
testElement = document.createElement(nodeName);
nodeDefaults[prop] = testElement[prop];}

return nodeDefaults[prop];}, 


injection:DOMPropertyInjection};


module.exports = DOMProperty;});
__d('ReactDefaultPerfAnalysis',["Object.assign"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 










assign=require('Object.assign');


var DONT_CARE_THRESHOLD=1.2;
var DOM_OPERATION_TYPES={
'_mountImageIntoNode':'set innerHTML', 
INSERT_MARKUP:'set innerHTML', 
MOVE_EXISTING:'move', 
REMOVE_NODE:'remove', 
TEXT_CONTENT:'set textContent', 
'updatePropertyByID':'update attribute', 
'deletePropertyByID':'delete attribute', 
'updateStylesByID':'update styles', 
'updateInnerHTMLByID':'set innerHTML', 
'dangerouslyReplaceNodeWithMarkupByID':'replace'};


function getTotalTime(measurements){




var totalTime=0;
for(var i=0; i < measurements.length; i++) {
var measurement=measurements[i];
totalTime += measurement.totalTime;}

return totalTime;}


function getDOMSummary(measurements){
var items=[];
for(var i=0; i < measurements.length; i++) {
var measurement=measurements[i];
var id;

for(id in measurement.writes) {
measurement.writes[id].forEach(function(write){
items.push({
id:id, 
type:DOM_OPERATION_TYPES[write.type] || write.type, 
args:write.args});});}}




return items;}


function getExclusiveSummary(measurements){
var candidates={};
var displayName;

for(var i=0; i < measurements.length; i++) {
var measurement=measurements[i];
var allIDs=assign(
{}, 
measurement.exclusive, 
measurement.inclusive);


for(var id in allIDs) {
displayName = measurement.displayNames[id].current;

candidates[displayName] = candidates[displayName] || {
componentName:displayName, 
inclusive:0, 
exclusive:0, 
render:0, 
count:0};

if(measurement.render[id]){
candidates[displayName].render += measurement.render[id];}

if(measurement.exclusive[id]){
candidates[displayName].exclusive += measurement.exclusive[id];}

if(measurement.inclusive[id]){
candidates[displayName].inclusive += measurement.inclusive[id];}

if(measurement.counts[id]){
candidates[displayName].count += measurement.counts[id];}}}





var arr=[];
for(displayName in candidates) {
if(candidates[displayName].exclusive >= DONT_CARE_THRESHOLD){
arr.push(candidates[displayName]);}}



arr.sort(function(a, b){
return b.exclusive - a.exclusive;});


return arr;}


function getInclusiveSummary(measurements, onlyClean){
var candidates={};
var inclusiveKey;

for(var i=0; i < measurements.length; i++) {
var measurement=measurements[i];
var allIDs=assign(
{}, 
measurement.exclusive, 
measurement.inclusive);

var cleanComponents;

if(onlyClean){
cleanComponents = getUnchangedComponents(measurement);}


for(var id in allIDs) {
if(onlyClean && !cleanComponents[id]){
continue;}


var displayName=measurement.displayNames[id];




inclusiveKey = displayName.owner + ' > ' + displayName.current;

candidates[inclusiveKey] = candidates[inclusiveKey] || {
componentName:inclusiveKey, 
time:0, 
count:0};


if(measurement.inclusive[id]){
candidates[inclusiveKey].time += measurement.inclusive[id];}

if(measurement.counts[id]){
candidates[inclusiveKey].count += measurement.counts[id];}}}





var arr=[];
for(inclusiveKey in candidates) {
if(candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD){
arr.push(candidates[inclusiveKey]);}}



arr.sort(function(a, b){
return b.time - a.time;});


return arr;}


function getUnchangedComponents(measurement){



var cleanComponents={};
var dirtyLeafIDs=Object.keys(measurement.writes);
var allIDs=assign({}, measurement.exclusive, measurement.inclusive);

for(var id in allIDs) {
var isDirty=false;


for(var i=0; i < dirtyLeafIDs.length; i++) {
if(dirtyLeafIDs[i].indexOf(id) === 0){
isDirty = true;
break;}}


if(!isDirty && measurement.counts[id] > 0){
cleanComponents[id] = true;}}


return cleanComponents;}


var ReactDefaultPerfAnalysis={
getExclusiveSummary:getExclusiveSummary, 
getInclusiveSummary:getInclusiveSummary, 
getDOMSummary:getDOMSummary, 
getTotalTime:getTotalTime};


module.exports = ReactDefaultPerfAnalysis;});
__d('ReactMount',["DOMProperty","ReactBrowserEventEmitter","ReactCurrentOwner","ReactElement","ReactElementValidator","ReactEmptyComponent","ReactInstanceHandles","ReactInstanceMap","ReactMarkupChecksum","ReactPerf","ReactReconciler","ReactUpdateQueue","ReactUpdates","emptyObject","containsNode","getReactRootElementInContainer","instantiateReactComponent","invariant","setInnerHTML","shouldUpdateReactComponent","warning"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var DOMProperty=require('DOMProperty');
var ReactBrowserEventEmitter=require('ReactBrowserEventEmitter');
var ReactCurrentOwner=require('ReactCurrentOwner');
var ReactElement=require('ReactElement');
var ReactElementValidator=require('ReactElementValidator');
var ReactEmptyComponent=require('ReactEmptyComponent');
var ReactInstanceHandles=require('ReactInstanceHandles');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactMarkupChecksum=require('ReactMarkupChecksum');
var ReactPerf=require('ReactPerf');
var ReactReconciler=require('ReactReconciler');
var ReactUpdateQueue=require('ReactUpdateQueue');
var ReactUpdates=require('ReactUpdates');

var emptyObject=require('emptyObject');
var containsNode=require('containsNode');
var getReactRootElementInContainer=require('getReactRootElementInContainer');
var instantiateReactComponent=require('instantiateReactComponent');
var invariant=require('invariant');
var setInnerHTML=require('setInnerHTML');
var shouldUpdateReactComponent=require('shouldUpdateReactComponent');
var warning=require('warning');

var SEPARATOR=ReactInstanceHandles.SEPARATOR;

var ATTR_NAME=DOMProperty.ID_ATTRIBUTE_NAME;
var nodeCache={};

var ELEMENT_NODE_TYPE=1;
var DOC_NODE_TYPE=9;


var instancesByReactRootID={};


var containersByReactRootID={};

if(__DEV__){

var rootElementsByReactRootID={};}



var findComponentRootReusableArray=[];







function firstDifferenceIndex(string1, string2){
var minLen=Math.min(string1.length, string2.length);
for(var i=0; i < minLen; i++) {
if(string1.charAt(i) !== string2.charAt(i)){
return i;}}


return string1.length === string2.length?-1:minLen;}






function getReactRootID(container){
var rootElement=getReactRootElementInContainer(container);
return rootElement && ReactMount.getID(rootElement);}












function getID(node){
var id=internalGetID(node);
if(id){
if(nodeCache.hasOwnProperty(id)){
var cached=nodeCache[id];
if(cached !== node){
invariant(
!isValid(cached, id), 
'ReactMount: Two valid but unequal nodes with the same `%s`: %s', 
ATTR_NAME, id);


nodeCache[id] = node;}}else 

{
nodeCache[id] = node;}}



return id;}


function internalGetID(node){



return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';}








function setID(node, id){
var oldID=internalGetID(node);
if(oldID !== id){
delete nodeCache[oldID];}

node.setAttribute(ATTR_NAME, id);
nodeCache[id] = node;}









function getNode(id){
if(!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)){
nodeCache[id] = ReactMount.findReactNodeByID(id);}

return nodeCache[id];}









function getNodeFromInstance(instance){
var id=ReactInstanceMap.get(instance)._rootNodeID;
if(ReactEmptyComponent.isNullComponentID(id)){
return null;}

if(!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)){
nodeCache[id] = ReactMount.findReactNodeByID(id);}

return nodeCache[id];}












function isValid(node, id){
if(node){
invariant(
internalGetID(node) === id, 
'ReactMount: Unexpected modification of `%s`', 
ATTR_NAME);


var container=ReactMount.findReactContainerForID(id);
if(container && containsNode(container, node)){
return true;}}



return false;}







function purgeID(id){
delete nodeCache[id];}


var deepestNodeSoFar=null;
function findDeepestCachedAncestorImpl(ancestorID){
var ancestor=nodeCache[ancestorID];
if(ancestor && isValid(ancestor, ancestorID)){
deepestNodeSoFar = ancestor;}else 
{


return false;}}






function findDeepestCachedAncestor(targetID){
deepestNodeSoFar = null;
ReactInstanceHandles.traverseAncestors(
targetID, 
findDeepestCachedAncestorImpl);


var foundNode=deepestNodeSoFar;
deepestNodeSoFar = null;
return foundNode;}











function mountComponentIntoNode(
componentInstance, 
rootID, 
container, 
transaction, 
shouldReuseMarkup){
var markup=ReactReconciler.mountComponent(
componentInstance, rootID, transaction, emptyObject);

componentInstance._isTopLevel = true;
ReactMount._mountImageIntoNode(markup, container, shouldReuseMarkup);}










function batchedMountComponentIntoNode(
componentInstance, 
rootID, 
container, 
shouldReuseMarkup){
var transaction=ReactUpdates.ReactReconcileTransaction.getPooled();
transaction.perform(
mountComponentIntoNode, 
null, 
componentInstance, 
rootID, 
container, 
transaction, 
shouldReuseMarkup);

ReactUpdates.ReactReconcileTransaction.release(transaction);}




















var ReactMount={

_instancesByReactRootID:instancesByReactRootID, 









scrollMonitor:function(container, renderCallback){
renderCallback();}, 









_updateRootComponent:function(
prevComponent, 
nextElement, 
container, 
callback){
if(__DEV__){
ReactElementValidator.checkAndWarnForMutatedProps(nextElement);}


ReactMount.scrollMonitor(container, function(){
ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
if(callback){
ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);}});



if(__DEV__){

rootElementsByReactRootID[getReactRootID(container)] = 
getReactRootElementInContainer(container);}


return prevComponent;}, 









_registerComponent:function(nextComponent, container){
invariant(
container && (
container.nodeType === ELEMENT_NODE_TYPE || 
container.nodeType === DOC_NODE_TYPE), 

'_registerComponent(...): Target container is not a DOM element.');


ReactBrowserEventEmitter.ensureScrollValueMonitoring();

var reactRootID=ReactMount.registerContainer(container);
instancesByReactRootID[reactRootID] = nextComponent;
return reactRootID;}, 









_renderNewRootComponent:function(
nextElement, 
container, 
shouldReuseMarkup)
{



warning(
ReactCurrentOwner.current == null, 
'_renderNewRootComponent(): Render methods should be a pure function ' + 
'of props and state; triggering nested component updates from ' + 
'render is not allowed. If necessary, trigger nested updates in ' + 
'componentDidUpdate.');


var componentInstance=instantiateReactComponent(nextElement, null);
var reactRootID=ReactMount._registerComponent(
componentInstance, 
container);






ReactUpdates.batchedUpdates(
batchedMountComponentIntoNode, 
componentInstance, 
reactRootID, 
container, 
shouldReuseMarkup);


if(__DEV__){

rootElementsByReactRootID[reactRootID] = 
getReactRootElementInContainer(container);}


return componentInstance;}, 














render:function(nextElement, container, callback){
invariant(
ReactElement.isValidElement(nextElement), 
'React.render(): Invalid component element.%s', 

typeof nextElement === 'string'?
' Instead of passing an element string, make sure to instantiate ' + 
'it by passing it to React.createElement.':
typeof nextElement === 'function'?
' Instead of passing a component class, make sure to instantiate ' + 
'it by passing it to React.createElement.':

nextElement != null && nextElement.props !== undefined?
' This may be caused by unintentionally loading two independent ' + 
'copies of React.':
'');



var prevComponent=instancesByReactRootID[getReactRootID(container)];

if(prevComponent){
var prevElement=prevComponent._currentElement;
if(shouldUpdateReactComponent(prevElement, nextElement)){
return ReactMount._updateRootComponent(
prevComponent, 
nextElement, 
container, 
callback).
getPublicInstance();}else 
{
ReactMount.unmountComponentAtNode(container);}}



var reactRootElement=getReactRootElementInContainer(container);
var containerHasReactMarkup=
reactRootElement && ReactMount.isRenderedByReact(reactRootElement);

if(__DEV__){
if(!containerHasReactMarkup || reactRootElement.nextSibling){
var rootElementSibling=reactRootElement;
while(rootElementSibling) {
if(ReactMount.isRenderedByReact(rootElementSibling)){
warning(
false, 
'render(): Target node has markup rendered by React, but there ' + 
'are unrelated nodes as well. This is most commonly caused by ' + 
'white-space inserted around server-rendered markup.');

break;}


rootElementSibling = rootElementSibling.nextSibling;}}}




var shouldReuseMarkup=containerHasReactMarkup && !prevComponent;

var component=ReactMount._renderNewRootComponent(
nextElement, 
container, 
shouldReuseMarkup).
getPublicInstance();
if(callback){
callback.call(component);}

return component;}, 











constructAndRenderComponent:function(constructor, props, container){
var element=ReactElement.createElement(constructor, props);
return ReactMount.render(element, container);}, 











constructAndRenderComponentByID:function(constructor, props, id){
var domNode=document.getElementById(id);
invariant(
domNode, 
'Tried to get element with id of "%s" but it is not present on the page.', 
id);

return ReactMount.constructAndRenderComponent(constructor, props, domNode);}, 










registerContainer:function(container){
var reactRootID=getReactRootID(container);
if(reactRootID){

reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);}

if(!reactRootID){

reactRootID = ReactInstanceHandles.createReactRootID();}

containersByReactRootID[reactRootID] = container;
return reactRootID;}, 









unmountComponentAtNode:function(container){




warning(
ReactCurrentOwner.current == null, 
'unmountComponentAtNode(): Render methods should be a pure function of ' + 
'props and state; triggering nested component updates from render is ' + 
'not allowed. If necessary, trigger nested updates in ' + 
'componentDidUpdate.');


invariant(
container && (
container.nodeType === ELEMENT_NODE_TYPE || 
container.nodeType === DOC_NODE_TYPE), 

'unmountComponentAtNode(...): Target container is not a DOM element.');


var reactRootID=getReactRootID(container);
var component=instancesByReactRootID[reactRootID];
if(!component){
return false;}

ReactMount.unmountComponentFromNode(component, container);
delete instancesByReactRootID[reactRootID];
delete containersByReactRootID[reactRootID];
if(__DEV__){
delete rootElementsByReactRootID[reactRootID];}

return true;}, 











unmountComponentFromNode:function(instance, container){
ReactReconciler.unmountComponent(instance);

if(container.nodeType === DOC_NODE_TYPE){
container = container.documentElement;}



while(container.lastChild) {
container.removeChild(container.lastChild);}}, 










findReactContainerForID:function(id){
var reactRootID=ReactInstanceHandles.getReactRootIDFromNodeID(id);
var container=containersByReactRootID[reactRootID];

if(__DEV__){
var rootElement=rootElementsByReactRootID[reactRootID];
if(rootElement && rootElement.parentNode !== container){
invariant(


internalGetID(rootElement) === reactRootID, 
'ReactMount: Root element ID differed from reactRootID.');


var containerChild=container.firstChild;
if(containerChild && 
reactRootID === internalGetID(containerChild)){




rootElementsByReactRootID[reactRootID] = containerChild;}else 
{
warning(
false, 
'ReactMount: Root element has been removed from its original ' + 
'container. New container:', rootElement.parentNode);}}}





return container;}, 








findReactNodeByID:function(id){
var reactRoot=ReactMount.findReactContainerForID(id);
return ReactMount.findComponentRoot(reactRoot, id);}, 









isRenderedByReact:function(node){
if(node.nodeType !== 1){

return false;}

var id=ReactMount.getID(node);
return id?id.charAt(0) === SEPARATOR:false;}, 










getFirstReactDOM:function(node){
var current=node;
while(current && current.parentNode !== current) {
if(ReactMount.isRenderedByReact(current)){
return current;}

current = current.parentNode;}

return null;}, 












findComponentRoot:function(ancestorNode, targetID){
var firstChildren=findComponentRootReusableArray;
var childIndex=0;

var deepestAncestor=findDeepestCachedAncestor(targetID) || ancestorNode;

firstChildren[0] = deepestAncestor.firstChild;
firstChildren.length = 1;

while(childIndex < firstChildren.length) {
var child=firstChildren[childIndex++];
var targetChild;

while(child) {
var childID=ReactMount.getID(child);
if(childID){





if(targetID === childID){
targetChild = child;}else 
if(ReactInstanceHandles.isAncestorIDOf(childID, targetID)){




firstChildren.length = childIndex = 0;
firstChildren.push(child.firstChild);}}else 


{





firstChildren.push(child.firstChild);}


child = child.nextSibling;}


if(targetChild){



firstChildren.length = 0;

return targetChild;}}



firstChildren.length = 0;

invariant(
false, 
'findComponentRoot(..., %s): Unable to find element. This probably ' + 
'means the DOM was unexpectedly mutated (e.g., by the browser), ' + 
'usually due to forgetting a <tbody> when using tables, nesting tags ' + 
'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' + 
'parent. ' + 
'Try inspecting the child nodes of the element with React ID `%s`.', 
targetID, 
ReactMount.getID(ancestorNode));}, 



_mountImageIntoNode:function(markup, container, shouldReuseMarkup){
invariant(
container && (
container.nodeType === ELEMENT_NODE_TYPE || 
container.nodeType === DOC_NODE_TYPE), 

'mountComponentIntoNode(...): Target container is not valid.');


if(shouldReuseMarkup){
var rootElement=getReactRootElementInContainer(container);
if(ReactMarkupChecksum.canReuseMarkup(markup, rootElement)){
return;}else 
{
var checksum=rootElement.getAttribute(
ReactMarkupChecksum.CHECKSUM_ATTR_NAME);

rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);

var rootMarkup=rootElement.outerHTML;
rootElement.setAttribute(
ReactMarkupChecksum.CHECKSUM_ATTR_NAME, 
checksum);


var diffIndex=firstDifferenceIndex(markup, rootMarkup);
var difference=' (client) ' + 
markup.substring(diffIndex - 20, diffIndex + 20) + 
'\n (server) ' + rootMarkup.substring(diffIndex - 20, diffIndex + 20);

invariant(
container.nodeType !== DOC_NODE_TYPE, 
'You\'re trying to render a component to the document using ' + 
'server rendering but the checksum was invalid. This usually ' + 
'means you rendered a different component type or props on ' + 
'the client from the one on the server, or your render() ' + 
'methods are impure. React cannot handle this case due to ' + 
'cross-browser quirks by rendering at the document root. You ' + 
'should look for environment dependent code in your components ' + 
'and ensure the props are the same client and server side:\n%s', 
difference);


if(__DEV__){
warning(
false, 
'React attempted to reuse markup in a container but the ' + 
'checksum was invalid. This generally means that you are ' + 
'using server rendering and the markup generated on the ' + 
'server was not what the client was expecting. React injected ' + 
'new markup to compensate which works but you have lost many ' + 
'of the benefits of server rendering. Instead, figure out ' + 
'why the markup being generated is different on the client ' + 
'or server:\n%s', 
difference);}}}





invariant(
container.nodeType !== DOC_NODE_TYPE, 
'You\'re trying to render a component to the document but ' + 
'you didn\'t use server rendering. We can\'t do this ' + 
'without using server rendering due to cross-browser quirks. ' + 
'See React.renderToString() for server rendering.');


setInnerHTML(container, markup);}, 






getReactRootID:getReactRootID, 

getID:getID, 

setID:setID, 

getNode:getNode, 

getNodeFromInstance:getNodeFromInstance, 

purgeID:purgeID};


ReactPerf.measureMethods(ReactMount, 'ReactMount', {
_renderNewRootComponent:'_renderNewRootComponent', 
_mountImageIntoNode:'_mountImageIntoNode'});


module.exports = ReactMount;});
__d('ReactBrowserEventEmitter',["EventConstants","EventPluginHub","EventPluginRegistry","ReactEventEmitterMixin","ViewportMetrics","Object.assign","isEventSupported"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var EventConstants=require('EventConstants');
var EventPluginHub=require('EventPluginHub');
var EventPluginRegistry=require('EventPluginRegistry');
var ReactEventEmitterMixin=require('ReactEventEmitterMixin');
var ViewportMetrics=require('ViewportMetrics');

var assign=require('Object.assign');
var isEventSupported=require('isEventSupported');
























































var alreadyListeningTo={};
var isMonitoringScrollValue=false;
var reactTopListenersCounter=0;




var topEventMapping={
topBlur:'blur', 
topChange:'change', 
topClick:'click', 
topCompositionEnd:'compositionend', 
topCompositionStart:'compositionstart', 
topCompositionUpdate:'compositionupdate', 
topContextMenu:'contextmenu', 
topCopy:'copy', 
topCut:'cut', 
topDoubleClick:'dblclick', 
topDrag:'drag', 
topDragEnd:'dragend', 
topDragEnter:'dragenter', 
topDragExit:'dragexit', 
topDragLeave:'dragleave', 
topDragOver:'dragover', 
topDragStart:'dragstart', 
topDrop:'drop', 
topFocus:'focus', 
topInput:'input', 
topKeyDown:'keydown', 
topKeyPress:'keypress', 
topKeyUp:'keyup', 
topMouseDown:'mousedown', 
topMouseMove:'mousemove', 
topMouseOut:'mouseout', 
topMouseOver:'mouseover', 
topMouseUp:'mouseup', 
topPaste:'paste', 
topScroll:'scroll', 
topSelectionChange:'selectionchange', 
topTextInput:'textInput', 
topTouchCancel:'touchcancel', 
topTouchEnd:'touchend', 
topTouchMove:'touchmove', 
topTouchStart:'touchstart', 
topWheel:'wheel'};





var topListenersIDKey='_reactListenersID' + String(Math.random()).slice(2);

function getListeningForDocument(mountAt){


if(!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)){
mountAt[topListenersIDKey] = reactTopListenersCounter++;
alreadyListeningTo[mountAt[topListenersIDKey]] = {};}

return alreadyListeningTo[mountAt[topListenersIDKey]];}












var ReactBrowserEventEmitter=assign({}, ReactEventEmitterMixin, {




ReactEventListener:null, 

injection:{



injectReactEventListener:function(ReactEventListener){
ReactEventListener.setHandleTopLevel(
ReactBrowserEventEmitter.handleTopLevel);

ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;}}, 








setEnabled:function(enabled){
if(ReactBrowserEventEmitter.ReactEventListener){
ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);}}, 






isEnabled:function(){
return !!(
ReactBrowserEventEmitter.ReactEventListener && 
ReactBrowserEventEmitter.ReactEventListener.isEnabled());}, 
























listenTo:function(registrationName, contentDocumentHandle){
var mountAt=contentDocumentHandle;
var isListening=getListeningForDocument(mountAt);
var dependencies=EventPluginRegistry.
registrationNameDependencies[registrationName];

var topLevelTypes=EventConstants.topLevelTypes;
for(var i=0, l=dependencies.length; i < l; i++) {
var dependency=dependencies[i];
if(!(
isListening.hasOwnProperty(dependency) && 
isListening[dependency]))
{
if(dependency === topLevelTypes.topWheel){
if(isEventSupported('wheel')){
ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelTypes.topWheel, 
'wheel', 
mountAt);}else 

if(isEventSupported('mousewheel')){
ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelTypes.topWheel, 
'mousewheel', 
mountAt);}else 

{


ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelTypes.topWheel, 
'DOMMouseScroll', 
mountAt);}}else 


if(dependency === topLevelTypes.topScroll){

if(isEventSupported('scroll', true)){
ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
topLevelTypes.topScroll, 
'scroll', 
mountAt);}else 

{
ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelTypes.topScroll, 
'scroll', 
ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE);}}else 


if(dependency === topLevelTypes.topFocus || 
dependency === topLevelTypes.topBlur){

if(isEventSupported('focus', true)){
ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
topLevelTypes.topFocus, 
'focus', 
mountAt);

ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
topLevelTypes.topBlur, 
'blur', 
mountAt);}else 

if(isEventSupported('focusin')){


ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelTypes.topFocus, 
'focusin', 
mountAt);

ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelTypes.topBlur, 
'focusout', 
mountAt);}




isListening[topLevelTypes.topBlur] = true;
isListening[topLevelTypes.topFocus] = true;}else 
if(topEventMapping.hasOwnProperty(dependency)){
ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
dependency, 
topEventMapping[dependency], 
mountAt);}



isListening[dependency] = true;}}}, 




trapBubbledEvent:function(topLevelType, handlerBaseName, handle){
return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(
topLevelType, 
handlerBaseName, 
handle);}, 



trapCapturedEvent:function(topLevelType, handlerBaseName, handle){
return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(
topLevelType, 
handlerBaseName, 
handle);}, 











ensureScrollValueMonitoring:function(){
if(!isMonitoringScrollValue){
var refresh=ViewportMetrics.refreshScrollValues;
ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
isMonitoringScrollValue = true;}}, 



eventNameDispatchConfigs:EventPluginHub.eventNameDispatchConfigs, 

registrationNameModules:EventPluginHub.registrationNameModules, 

putListener:EventPluginHub.putListener, 

getListener:EventPluginHub.getListener, 

deleteListener:EventPluginHub.deleteListener, 

deleteAllListeners:EventPluginHub.deleteAllListeners});



module.exports = ReactBrowserEventEmitter;});
__d('ViewportMetrics',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ViewportMetrics={

currentScrollLeft:0, 

currentScrollTop:0, 

refreshScrollValues:function(scrollPosition){
ViewportMetrics.currentScrollLeft = scrollPosition.x;
ViewportMetrics.currentScrollTop = scrollPosition.y;}};




module.exports = ViewportMetrics;});
__d('isEventSupported',["ExecutionEnvironment"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ExecutionEnvironment=require('ExecutionEnvironment');

var useHasFeature;
if(ExecutionEnvironment.canUseDOM){
useHasFeature = 
document.implementation && 
document.implementation.hasFeature && 


document.implementation.hasFeature('', '') !== true;}
















function isEventSupported(eventNameSuffix, capture){
if(!ExecutionEnvironment.canUseDOM || 
capture && !('addEventListener' in document)){
return false;}


var eventName='on' + eventNameSuffix;
var isSupported=(eventName in document);

if(!isSupported){
var element=document.createElement('div');
element.setAttribute(eventName, 'return;');
isSupported = typeof element[eventName] === 'function';}


if(!isSupported && useHasFeature && eventNameSuffix === 'wheel'){

isSupported = document.implementation.hasFeature('Events.wheel', '3.0');}


return isSupported;}


module.exports = isEventSupported;});
__d('ReactMarkupChecksum',["adler32"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var adler32=require('adler32');

var ReactMarkupChecksum={
CHECKSUM_ATTR_NAME:'data-react-checksum', 





addChecksumToMarkup:function(markup){
var checksum=adler32(markup);
return markup.replace(
'>', 
' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '">');}, 








canReuseMarkup:function(markup, element){
var existingChecksum=element.getAttribute(
ReactMarkupChecksum.CHECKSUM_ATTR_NAME);

existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
var markupChecksum=adler32(markup);
return markupChecksum === existingChecksum;}};



module.exports = ReactMarkupChecksum;});
__d('adler32',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var MOD=65521;





function adler32(data){
var a=1;
var b=0;
for(var i=0; i < data.length; i++) {
a = (a + data.charCodeAt(i)) % MOD;
b = (b + a) % MOD;}

return a | b << 16;}


module.exports = adler32;});
__d('containsNode',["isTextNode"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 











isTextNode=require('isTextNode');










function containsNode(outerNode, innerNode){
if(!outerNode || !innerNode){
return false;}else 
if(outerNode === innerNode){
return true;}else 
if(isTextNode(outerNode)){
return false;}else 
if(isTextNode(innerNode)){
return containsNode(outerNode, innerNode.parentNode);}else 
if(outerNode.contains){
return outerNode.contains(innerNode);}else 
if(outerNode.compareDocumentPosition){
return !!(outerNode.compareDocumentPosition(innerNode) & 16);}else 
{
return false;}}



module.exports = containsNode;});
__d('isTextNode',["isNode"],function(global, require, requireDynamic, requireLazy, module, exports) {  var 











isNode=require('isNode');





function isTextNode(object){
return isNode(object) && object.nodeType == 3;}


module.exports = isTextNode;});
__d('getReactRootElementInContainer',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var DOC_NODE_TYPE=9;






function getReactRootElementInContainer(container){
if(!container){
return null;}


if(container.nodeType === DOC_NODE_TYPE){
return container.documentElement;}else 
{
return container.firstChild;}}



module.exports = getReactRootElementInContainer;});
__d('setInnerHTML',["ExecutionEnvironment"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var ExecutionEnvironment=require('ExecutionEnvironment');

var WHITESPACE_TEST=/^[ \r\n\t\f]/;
var NONVISIBLE_TEST=/<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/;









var setInnerHTML=function(node, html){
node.innerHTML = html;};



if(typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction){
setInnerHTML = function(node, html){
MSApp.execUnsafeLocalFunction(function(){
node.innerHTML = html;});};}




if(ExecutionEnvironment.canUseDOM){






var testElement=document.createElement('div');
testElement.innerHTML = ' ';
if(testElement.innerHTML === ''){
setInnerHTML = function(node, html){





if(node.parentNode){
node.parentNode.replaceChild(node, node);}






if(WHITESPACE_TEST.test(html) || 
html[0] === '<' && NONVISIBLE_TEST.test(html)){


node.innerHTML = 'ï»¿' + html;



var textNode=node.firstChild;
if(textNode.data.length === 1){
node.removeChild(textNode);}else 
{
textNode.deleteData(0, 1);}}else 

{
node.innerHTML = html;}};}}





module.exports = setInnerHTML;});
__d('AppStateIOS',["Map","NativeModules","RCTDeviceEventEmitter","logError","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var Map=require('Map');
var NativeModules=require('NativeModules');
var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var RCTAppState=NativeModules.AppState;

var logError=require('logError');
var invariant=require('invariant');

var _eventHandlers={
change:new Map(), 
memoryWarning:new Map()};





















































var AppStateIOS={





addEventListener:function(
type, 
handler)
{
invariant(
['change', 'memoryWarning'].indexOf(type) !== -1, 
'Trying to subscribe to unknown event: "%s"', type);

if(type === 'change'){
_eventHandlers[type].set(handler, RCTDeviceEventEmitter.addListener(
'appStateDidChange', 
function(appStateData){
handler(appStateData.app_state);}));}else 


if(type === 'memoryWarning'){
_eventHandlers[type].set(handler, RCTDeviceEventEmitter.addListener(
'memoryWarning', 
handler));}}, 







removeEventListener:function(
type, 
handler)
{
invariant(
['change', 'memoryWarning'].indexOf(type) !== -1, 
'Trying to remove listener for unknown event: "%s"', type);

if(!_eventHandlers[type].has(handler)){
return;}

_eventHandlers[type].get(handler).remove();
_eventHandlers[type].delete(handler);}, 






currentState:'active'};



RCTDeviceEventEmitter.addListener(
'appStateDidChange', 
function(appStateData){
AppStateIOS.currentState = appStateData.app_state;});



RCTAppState.getCurrentAppState(
function(appStateData){
AppStateIOS.currentState = appStateData.app_state;}, 

logError);


module.exports = AppStateIOS;});
__d('CameraRoll',["ReactPropTypes","NativeModules","createStrictShapeTypeChecker","deepFreezeAndThrowOnMutationInDev","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var ReactPropTypes=require('ReactPropTypes');
var RCTCameraRollManager=require('NativeModules').CameraRollManager;

var createStrictShapeTypeChecker=require('createStrictShapeTypeChecker');
var deepFreezeAndThrowOnMutationInDev=
require('deepFreezeAndThrowOnMutationInDev');
var invariant=require('invariant');

var GROUP_TYPES_OPTIONS=[
'Album', 
'All', 
'Event', 
'Faces', 
'Library', 
'PhotoStream', 
'SavedPhotos'];


var ASSET_TYPE_OPTIONS=[
'All', 
'Videos', 
'Photos'];




deepFreezeAndThrowOnMutationInDev(GROUP_TYPES_OPTIONS);
deepFreezeAndThrowOnMutationInDev(ASSET_TYPE_OPTIONS);




var getPhotosParamChecker=createStrictShapeTypeChecker({




first:ReactPropTypes.number.isRequired, 





after:ReactPropTypes.string, 




groupTypes:ReactPropTypes.oneOf(GROUP_TYPES_OPTIONS), 





groupName:ReactPropTypes.string, 




assetType:ReactPropTypes.oneOf(ASSET_TYPE_OPTIONS)});





var getPhotosReturnChecker=createStrictShapeTypeChecker({
edges:ReactPropTypes.arrayOf(createStrictShapeTypeChecker({
node:createStrictShapeTypeChecker({
type:ReactPropTypes.string.isRequired, 
group_name:ReactPropTypes.string.isRequired, 
image:createStrictShapeTypeChecker({
uri:ReactPropTypes.string.isRequired, 
height:ReactPropTypes.number.isRequired, 
width:ReactPropTypes.number.isRequired, 
isStored:ReactPropTypes.bool}).
isRequired, 
timestamp:ReactPropTypes.number.isRequired, 
location:createStrictShapeTypeChecker({
latitude:ReactPropTypes.number, 
longitude:ReactPropTypes.number, 
altitude:ReactPropTypes.number, 
heading:ReactPropTypes.number, 
speed:ReactPropTypes.number})}).

isRequired})).
isRequired, 
page_info:createStrictShapeTypeChecker({
has_next_page:ReactPropTypes.bool.isRequired, 
start_cursor:ReactPropTypes.string, 
end_cursor:ReactPropTypes.string}).
isRequired});var 


CameraRoll=(function(){function CameraRoll(){_classCallCheck(this, CameraRoll);}_createClass(CameraRoll, null, [{key:'saveImageWithTag', value:











function saveImageWithTag(tag, successCallback, errorCallback){
invariant(
typeof tag === 'string', 
'CameraRoll.saveImageWithTag tag must be a valid string.');

RCTCameraRollManager.saveImageWithTag(
tag, 
function(imageTag){
successCallback && successCallback(imageTag);}, 

function(errorMessage){
errorCallback && errorCallback(errorMessage);});}}, {key:'getPhotos', value:












function getPhotos(params, callback, errorCallback){
var metaCallback=callback;
if(__DEV__){
getPhotosParamChecker({params:params}, 'params', 'CameraRoll.getPhotos');
invariant(
typeof callback === 'function', 
'CameraRoll.getPhotos callback must be a valid function.');

invariant(
typeof errorCallback === 'function', 
'CameraRoll.getPhotos errorCallback must be a valid function.');}


if(__DEV__){
metaCallback = function(response){
getPhotosReturnChecker(
{response:response}, 
'response', 
'CameraRoll.getPhotos callback');

callback(response);};}


RCTCameraRollManager.getPhotos(params, metaCallback, errorCallback);}}]);return CameraRoll;})();



CameraRoll.GroupTypesOptions = GROUP_TYPES_OPTIONS;
CameraRoll.AssetTypeOptions = ASSET_TYPE_OPTIONS;

module.exports = CameraRoll;});
__d('LayoutAnimation',["ReactPropTypes","NativeModules","createStrictShapeTypeChecker","keyMirror"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var PropTypes=require('ReactPropTypes');
var RCTUIManager=require('NativeModules').UIManager;

var createStrictShapeTypeChecker=require('createStrictShapeTypeChecker');
var keyMirror=require('keyMirror');

var TypesEnum={
spring:true, 
linear:true, 
easeInEaseOut:true, 
easeIn:true, 
easeOut:true};

var Types=keyMirror(TypesEnum);

var PropertiesEnum={
opacity:true, 
scaleXY:true};

var Properties=keyMirror(PropertiesEnum);

var animChecker=createStrictShapeTypeChecker({
duration:PropTypes.number, 
delay:PropTypes.number, 
springDamping:PropTypes.number, 
initialVelocity:PropTypes.number, 
type:PropTypes.oneOf(
Object.keys(Types)), 

property:PropTypes.oneOf(
Object.keys(Properties))});












var configChecker=createStrictShapeTypeChecker({
duration:PropTypes.number.isRequired, 
create:animChecker, 
update:animChecker, 
delete:animChecker});









function configureNext(config, onAnimationDidEnd, onError){
configChecker({config:config}, 'config', 'LayoutAnimation.configureNext');
RCTUIManager.configureNextLayoutAnimation(config, onAnimationDidEnd, onError);}


function create(duration, type, creationProp){
return {
duration:duration, 
create:{
type:type, 
property:creationProp}, 

update:{
type:type}};}




var LayoutAnimation={
configureNext:configureNext, 
create:create, 
Types:Types, 
Properties:Properties, 
configChecker:configChecker, 
Presets:{
easeInEaseOut:create(
300, Types.easeInEaseOut, Properties.opacity), 

linear:create(
500, Types.linear, Properties.opacity), 

spring:{
duration:700, 
create:{
type:Types.linear, 
property:Properties.opacity}, 

update:{
type:Types.spring, 
springDamping:0.4}}}};





module.exports = LayoutAnimation;});
__d('LinkingIOS',["RCTDeviceEventEmitter","NativeModules","Map","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var RCTLinkingManager=require('NativeModules').LinkingManager;
var Map=require('Map');
var invariant=require('invariant');

var _notifHandlers=new Map();
var _initialURL=RCTLinkingManager && 
RCTLinkingManager.initialURL;

var DEVICE_NOTIF_EVENT='openURL';var 





























































LinkingIOS=(function(){function LinkingIOS(){_classCallCheck(this, LinkingIOS);}_createClass(LinkingIOS, null, [{key:'addEventListener', value:




function addEventListener(type, handler){
invariant(
type === 'url', 
'LinkingIOS only supports `url` events');

var listener=RCTDeviceEventEmitter.addListener(
DEVICE_NOTIF_EVENT, 
handler);

_notifHandlers.set(handler, listener);}}, {key:'removeEventListener', value:





function removeEventListener(type, handler){
invariant(
type === 'url', 
'LinkingIOS only supports `url` events');

var listener=_notifHandlers.get(handler);
if(!listener){
return;}

listener.remove();
_notifHandlers.delete(handler);}}, {key:'openURL', value:





function openURL(url){
invariant(
typeof url === 'string', 
'Invalid url: should be a string');

RCTLinkingManager.openURL(url);}}, {key:'canOpenURL', value:






function canOpenURL(url, callback){
invariant(
typeof url === 'string', 
'Invalid url: should be a string');

invariant(
typeof callback === 'function', 
'A valid callback function is required');

RCTLinkingManager.canOpenURL(url, callback);}}, {key:'popInitialURL', value:






function popInitialURL(){
var initialURL=_initialURL;
_initialURL = null;
return initialURL;}}]);return LinkingIOS;})();



module.exports = LinkingIOS;});
__d('NetInfo',["NativeModules","Platform","RCTDeviceEventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var NativeModules=require('NativeModules');
var Platform=require('Platform');
var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');

if(Platform.OS === 'ios'){
var RCTNetInfo=NativeModules.Reachability;}else 
if(Platform.OS === 'android'){
var RCTNetInfo=NativeModules.NetInfo;}


var DEVICE_REACHABILITY_EVENT='reachabilityDidChange';






















































































































var _subscriptions={};

var NetInfo={
addEventListener:function(
eventName, 
handler)
{
_subscriptions[String(handler)] = RCTDeviceEventEmitter.addListener(
DEVICE_REACHABILITY_EVENT, 
function(appStateData){
handler(appStateData.network_reachability);});}, 




removeEventListener:function(
eventName, 
handler)
{
if(!_subscriptions[String(handler)]){
return;}

_subscriptions[String(handler)].remove();
_subscriptions[String(handler)] = null;}, 


fetch:function(){
return new Promise(function(resolve, reject){
RCTNetInfo.getCurrentReachability(
function(resp){
resolve(resp.network_reachability);}, 

reject);});}, 




isConnected:{}, 

isConnectionMetered:{}};


if(Platform.OS === 'ios'){
var _isConnected=function(
reachability)
{
return reachability !== 'none' && 
reachability !== 'unknown';};}else 

if(Platform.OS === 'android'){
var _isConnected=function(
connectionType)
{
return connectionType !== 'NONE' && connectionType !== 'UNKNOWN';};}



var _isConnectedSubscriptions={};

NetInfo.isConnected = {
addEventListener:function(
eventName, 
handler)
{
_isConnectedSubscriptions[String(handler)] = function(connection){
handler(_isConnected(connection));};

NetInfo.addEventListener(
eventName, 
_isConnectedSubscriptions[String(handler)]);}, 



removeEventListener:function(
eventName, 
handler)
{
NetInfo.removeEventListener(
eventName, 
_isConnectedSubscriptions[String(handler)]);}, 



fetch:function(){
return NetInfo.fetch().then(
function(connection){return _isConnected(connection);});}};




if(Platform.OS === 'android'){
NetInfo.isConnectionMetered = function(callback){
RCTNetInfo.isConnectionMetered(function(_isMetered){
callback(_isMetered);});};}




module.exports = NetInfo;});
__d('PushNotificationIOS',["Map","RCTDeviceEventEmitter","NativeModules","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}












var Map=require('Map');
var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var RCTPushNotificationManager=require('NativeModules').PushNotificationManager;
var invariant=require('invariant');

var _notifHandlers=new Map();
var _initialNotification=RCTPushNotificationManager && 
RCTPushNotificationManager.initialNotification;

var DEVICE_NOTIF_EVENT='remoteNotificationReceived';
var NOTIF_REGISTER_EVENT='remoteNotificationsRegistered';var 








PushNotificationIOS=(function(){















































































































































function PushNotificationIOS(nativeNotif){var _this=this;_classCallCheck(this, PushNotificationIOS);
this._data = {};





Object.keys(nativeNotif).forEach(function(notifKey){
var notifVal=nativeNotif[notifKey];
if(notifKey === 'aps'){
_this._alert = notifVal.alert;
_this._sound = notifVal.sound;
_this._badgeCount = notifVal.badge;}else 
{
_this._data[notifKey] = notifVal;}});}_createClass(PushNotificationIOS, [{key:'getMessage', value:







function getMessage(){

return this._alert;}}, {key:'getSound', value:





function getSound(){
return this._sound;}}, {key:'getAlert', value:





function getAlert(){
return this._alert;}}, {key:'getBadgeCount', value:





function getBadgeCount(){
return this._badgeCount;}}, {key:'getData', value:





function getData(){
return this._data;}}], [{key:'setApplicationIconBadgeNumber', value:function setApplicationIconBadgeNumber(number){RCTPushNotificationManager.setApplicationIconBadgeNumber(number);}}, {key:'getApplicationIconBadgeNumber', value:function getApplicationIconBadgeNumber(callback){RCTPushNotificationManager.getApplicationIconBadgeNumber(callback);}}, {key:'addEventListener', value:function addEventListener(type, handler){invariant(type === 'notification' || type === 'register', 'PushNotificationIOS only supports `notification` and `register` events');var listener;if(type === 'notification'){listener = RCTDeviceEventEmitter.addListener(DEVICE_NOTIF_EVENT, function(notifData){handler(new PushNotificationIOS(notifData));});}else if(type === 'register'){listener = RCTDeviceEventEmitter.addListener(NOTIF_REGISTER_EVENT, function(registrationInfo){handler(registrationInfo.deviceToken);});}_notifHandlers.set(handler, listener);}}, {key:'requestPermissions', value:function requestPermissions(permissions){var requestedPermissions={};if(permissions){requestedPermissions = {alert:!!permissions.alert, badge:!!permissions.badge, sound:!!permissions.sound};}else {requestedPermissions = {alert:true, badge:true, sound:true};}RCTPushNotificationManager.requestPermissions(requestedPermissions);}}, {key:'checkPermissions', value:function checkPermissions(callback){invariant(typeof callback === 'function', 'Must provide a valid callback');RCTPushNotificationManager.checkPermissions(callback);}}, {key:'removeEventListener', value:function removeEventListener(type, handler){invariant(type === 'notification' || type === 'register', 'PushNotificationIOS only supports `notification` and `register` events');var listener=_notifHandlers.get(handler);if(!listener){return;}listener.remove();_notifHandlers.delete(handler);}}, {key:'popInitialNotification', value:function popInitialNotification(){var initialNotification=_initialNotification && new PushNotificationIOS(_initialNotification);_initialNotification = null;return initialNotification;}}]);return PushNotificationIOS;})();



module.exports = PushNotificationIOS;});
__d('StatusBarIOS',["NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTStatusBarManager=require('NativeModules').StatusBarManager;












var StatusBarIOS={

setStyle:function(style, animated){
animated = animated || false;
RCTStatusBarManager.setStyle(style, animated);}, 


setHidden:function(hidden, animation){
animation = animation || 'none';
RCTStatusBarManager.setHidden(hidden, animation);}};



module.exports = StatusBarIOS;});
__d('VibrationIOS',["NativeModules","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTVibration=require('NativeModules').Vibration;

var invariant=require('invariant');












var VibrationIOS={
vibrate:function(){
invariant(
arguments[0] === undefined, 
'Vibration patterns not supported.');

RCTVibration.vibrate();}};



module.exports = VibrationIOS;});
__d('RCTNativeAppEventEmitter',["EventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventEmitter=require('EventEmitter');

var RCTNativeAppEventEmitter=new EventEmitter();

module.exports = RCTNativeAppEventEmitter;});
__d('LinkedStateMixin',["ReactLink","ReactStateSetters"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';













var ReactLink=require('ReactLink');
var ReactStateSetters=require('ReactStateSetters');




var LinkedStateMixin={









linkState:function(key){
return new ReactLink(
this.state[key], 
ReactStateSetters.createStateKeySetter(this, key));}};




module.exports = LinkedStateMixin;});
__d('ReactLink',["React"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




































var React=require('React');





function ReactLink(value, requestChange){
this.value = value;
this.requestChange = requestChange;}










function createLinkTypeChecker(linkType){
var shapes={
value:typeof linkType === 'undefined'?
React.PropTypes.any.isRequired:
linkType.isRequired, 
requestChange:React.PropTypes.func.isRequired};

return React.PropTypes.shape(shapes);}


ReactLink.PropTypes = {
link:createLinkTypeChecker};


module.exports = ReactLink;});
__d('ReactStateSetters',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var ReactStateSetters={










createStateSetter:function(component, funcReturningState){
return function(a, b, c, d, e, f){
var partialState=funcReturningState.call(component, a, b, c, d, e, f);
if(partialState){
component.setState(partialState);}};}, 















createStateKeySetter:function(component, key){

var cache=component.__keySetters || (component.__keySetters = {});
return cache[key] || (cache[key] = createStateKeySetter(component, key));}};



function createStateKeySetter(component, key){



var partialState={};
return function stateKeySetter(value){
partialState[key] = value;
component.setState(partialState);};}



ReactStateSetters.Mixin = {
















createStateSetter:function(funcReturningState){
return ReactStateSetters.createStateSetter(this, funcReturningState);}, 

















createStateKeySetter:function(key){
return ReactStateSetters.createStateKeySetter(this, key);}};



module.exports = ReactStateSetters;});
__d('ReactComponentWithPureRenderMixin',["shallowEqual"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var shallowEqual=require('shallowEqual');

























var ReactComponentWithPureRenderMixin={
shouldComponentUpdate:function(nextProps, nextState){
return !shallowEqual(this.props, nextProps) || 
!shallowEqual(this.state, nextState);}};



module.exports = ReactComponentWithPureRenderMixin;});
__d('shallowEqual',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';



















function shallowEqual(objA, objB){
if(objA === objB){
return true;}

var key;

for(key in objA) {
if(objA.hasOwnProperty(key) && (
!objB.hasOwnProperty(key) || objA[key] !== objB[key])){
return false;}}



for(key in objB) {
if(objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)){
return false;}}


return true;}


module.exports = shallowEqual;});
__d('update',["Object.assign","keyOf","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var assign=require('Object.assign');
var keyOf=require('keyOf');
var invariant=require('invariant');
var hasOwnProperty=({}).hasOwnProperty;

function shallowCopy(x){
if(Array.isArray(x)){
return x.concat();}else 
if(x && typeof x === 'object'){
return assign(new x.constructor(), x);}else 
{
return x;}}



var COMMAND_PUSH=keyOf({$push:null});
var COMMAND_UNSHIFT=keyOf({$unshift:null});
var COMMAND_SPLICE=keyOf({$splice:null});
var COMMAND_SET=keyOf({$set:null});
var COMMAND_MERGE=keyOf({$merge:null});
var COMMAND_APPLY=keyOf({$apply:null});

var ALL_COMMANDS_LIST=[
COMMAND_PUSH, 
COMMAND_UNSHIFT, 
COMMAND_SPLICE, 
COMMAND_SET, 
COMMAND_MERGE, 
COMMAND_APPLY];


var ALL_COMMANDS_SET={};

ALL_COMMANDS_LIST.forEach(function(command){
ALL_COMMANDS_SET[command] = true;});


function invariantArrayCase(value, spec, command){
invariant(
Array.isArray(value), 
'update(): expected target of %s to be an array; got %s.', 
command, 
value);

var specValue=spec[command];
invariant(
Array.isArray(specValue), 
'update(): expected spec of %s to be an array; got %s. ' + 
'Did you forget to wrap your parameter in an array?', 
command, 
specValue);}



function update(value, spec){
invariant(
typeof spec === 'object', 
'update(): You provided a key path to update() that did not contain one ' + 
'of %s. Did you forget to include {%s: ...}?', 
ALL_COMMANDS_LIST.join(', '), 
COMMAND_SET);


if(hasOwnProperty.call(spec, COMMAND_SET)){
invariant(
Object.keys(spec).length === 1, 
'Cannot have more than one key in an object with %s', 
COMMAND_SET);


return spec[COMMAND_SET];}


var nextValue=shallowCopy(value);

if(hasOwnProperty.call(spec, COMMAND_MERGE)){
var mergeObj=spec[COMMAND_MERGE];
invariant(
mergeObj && typeof mergeObj === 'object', 
'update(): %s expects a spec of type \'object\'; got %s', 
COMMAND_MERGE, 
mergeObj);

invariant(
nextValue && typeof nextValue === 'object', 
'update(): %s expects a target of type \'object\'; got %s', 
COMMAND_MERGE, 
nextValue);

assign(nextValue, spec[COMMAND_MERGE]);}


if(hasOwnProperty.call(spec, COMMAND_PUSH)){
invariantArrayCase(value, spec, COMMAND_PUSH);
spec[COMMAND_PUSH].forEach(function(item){
nextValue.push(item);});}



if(hasOwnProperty.call(spec, COMMAND_UNSHIFT)){
invariantArrayCase(value, spec, COMMAND_UNSHIFT);
spec[COMMAND_UNSHIFT].forEach(function(item){
nextValue.unshift(item);});}



if(hasOwnProperty.call(spec, COMMAND_SPLICE)){
invariant(
Array.isArray(value), 
'Expected %s target to be an array; got %s', 
COMMAND_SPLICE, 
value);

invariant(
Array.isArray(spec[COMMAND_SPLICE]), 
'update(): expected spec of %s to be an array of arrays; got %s. ' + 
'Did you forget to wrap your parameters in an array?', 
COMMAND_SPLICE, 
spec[COMMAND_SPLICE]);

spec[COMMAND_SPLICE].forEach(function(args){
invariant(
Array.isArray(args), 
'update(): expected spec of %s to be an array of arrays; got %s. ' + 
'Did you forget to wrap your parameters in an array?', 
COMMAND_SPLICE, 
spec[COMMAND_SPLICE]);

nextValue.splice.apply(nextValue, args);});}



if(hasOwnProperty.call(spec, COMMAND_APPLY)){
invariant(
typeof spec[COMMAND_APPLY] === 'function', 
'update(): expected spec of %s to be a function; got %s.', 
COMMAND_APPLY, 
spec[COMMAND_APPLY]);

nextValue = spec[COMMAND_APPLY](nextValue);}


for(var k in spec) {
if(!(ALL_COMMANDS_SET.hasOwnProperty(k) && ALL_COMMANDS_SET[k])){
nextValue[k] = update(value[k], spec[k]);}}



return nextValue;}


module.exports = update;});
__d('ReactTestUtils',["EventConstants","EventPluginHub","EventPropagators","React","ReactElement","ReactEmptyComponent","ReactBrowserEventEmitter","ReactCompositeComponent","ReactInstanceHandles","ReactInstanceMap","ReactMount","ReactUpdates","SyntheticEvent","Object.assign"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var EventConstants=require('EventConstants');
var EventPluginHub=require('EventPluginHub');
var EventPropagators=require('EventPropagators');
var React=require('React');
var ReactElement=require('ReactElement');
var ReactEmptyComponent=require('ReactEmptyComponent');
var ReactBrowserEventEmitter=require('ReactBrowserEventEmitter');
var ReactCompositeComponent=require('ReactCompositeComponent');
var ReactInstanceHandles=require('ReactInstanceHandles');
var ReactInstanceMap=require('ReactInstanceMap');
var ReactMount=require('ReactMount');
var ReactUpdates=require('ReactUpdates');
var SyntheticEvent=require('SyntheticEvent');

var assign=require('Object.assign');

var topLevelTypes=EventConstants.topLevelTypes;

function Event(suffix){}










var ReactTestUtils={
renderIntoDocument:function(instance){
var div=document.createElement('div');





return React.render(instance, div);}, 


isElement:function(element){
return ReactElement.isValidElement(element);}, 


isElementOfType:function(inst, convenienceConstructor){
return (
ReactElement.isValidElement(inst) && 
inst.type === convenienceConstructor);}, 



isDOMComponent:function(inst){


return !!(inst && inst.tagName && inst.getDOMNode);}, 


isDOMComponentElement:function(inst){
return !!(inst && 
ReactElement.isValidElement(inst) && 
!!inst.tagName);}, 


isCompositeComponent:function(inst){
return typeof inst.render === 'function' && 
typeof inst.setState === 'function';}, 


isCompositeComponentWithType:function(inst, type){
return !!(ReactTestUtils.isCompositeComponent(inst) && 
inst.constructor === type);}, 


isCompositeComponentElement:function(inst){
if(!ReactElement.isValidElement(inst)){
return false;}



var prototype=inst.type.prototype;
return (
typeof prototype.render === 'function' && 
typeof prototype.setState === 'function');}, 



isCompositeComponentElementWithType:function(inst, type){
return !!(ReactTestUtils.isCompositeComponentElement(inst) && 
inst.constructor === type);}, 


getRenderedChildOfCompositeComponent:function(inst){
if(!ReactTestUtils.isCompositeComponent(inst)){
return null;}

var internalInstance=ReactInstanceMap.get(inst);
return internalInstance._renderedComponent.getPublicInstance();}, 


findAllInRenderedTree:function(inst, test){
if(!inst){
return [];}

var ret=test(inst)?[inst]:[];
if(ReactTestUtils.isDOMComponent(inst)){
var internalInstance=ReactInstanceMap.get(inst);
var renderedChildren=internalInstance.
_renderedComponent.
_renderedChildren;
var key;
for(key in renderedChildren) {
if(!renderedChildren.hasOwnProperty(key)){
continue;}

if(!renderedChildren[key].getPublicInstance){
continue;}

ret = ret.concat(
ReactTestUtils.findAllInRenderedTree(
renderedChildren[key].getPublicInstance(), 
test));}}else 



if(ReactTestUtils.isCompositeComponent(inst)){
ret = ret.concat(
ReactTestUtils.findAllInRenderedTree(
ReactTestUtils.getRenderedChildOfCompositeComponent(inst), 
test));}



return ret;}, 







scryRenderedDOMComponentsWithClass:function(root, className){
return ReactTestUtils.findAllInRenderedTree(root, function(inst){
var instClassName=inst.props.className;
return ReactTestUtils.isDOMComponent(inst) && (
instClassName && 
(' ' + instClassName + ' ').indexOf(' ' + className + ' ') !== -1);});}, 










findRenderedDOMComponentWithClass:function(root, className){
var all=
ReactTestUtils.scryRenderedDOMComponentsWithClass(root, className);
if(all.length !== 1){
throw new Error('Did not find exactly one match ' + 
'(found: ' + all.length + ') for class:' + className);}


return all[0];}, 








scryRenderedDOMComponentsWithTag:function(root, tagName){
return ReactTestUtils.findAllInRenderedTree(root, function(inst){
return ReactTestUtils.isDOMComponent(inst) && 
inst.tagName === tagName.toUpperCase();});}, 









findRenderedDOMComponentWithTag:function(root, tagName){
var all=ReactTestUtils.scryRenderedDOMComponentsWithTag(root, tagName);
if(all.length !== 1){
throw new Error('Did not find exactly one match for tag:' + tagName);}

return all[0];}, 







scryRenderedComponentsWithType:function(root, componentType){
return ReactTestUtils.findAllInRenderedTree(root, function(inst){
return ReactTestUtils.isCompositeComponentWithType(
inst, 
componentType);});}, 










findRenderedComponentWithType:function(root, componentType){
var all=ReactTestUtils.scryRenderedComponentsWithType(
root, 
componentType);

if(all.length !== 1){
throw new Error(
'Did not find exactly one match for componentType:' + componentType);}


return all[0];}, 















mockComponent:function(module, mockTagName){
mockTagName = mockTagName || module.mockTagName || 'div';

module.prototype.render.mockImplementation(function(){
return React.createElement(
mockTagName, 
null, 
this.props.children);});



return this;}, 









simulateNativeEventOnNode:function(topLevelType, node, fakeNativeEvent){
fakeNativeEvent.target = node;
ReactBrowserEventEmitter.ReactEventListener.dispatchEvent(
topLevelType, 
fakeNativeEvent);}, 










simulateNativeEventOnDOMComponent:function(
topLevelType, 
comp, 
fakeNativeEvent){
ReactTestUtils.simulateNativeEventOnNode(
topLevelType, 
comp.getDOMNode(), 
fakeNativeEvent);}, 



nativeTouchData:function(x, y){
return {
touches:[
{pageX:x, pageY:y}]};}, 




createRenderer:function(){
return new ReactShallowRenderer();}, 


Simulate:null, 
SimulateNative:{}};





var ReactShallowRenderer=function(){
this._instance = null;};


ReactShallowRenderer.prototype.getRenderOutput = function(){
return (
this._instance && this._instance._renderedComponent && 
this._instance._renderedComponent._renderedOutput || 
null);};



var NoopInternalComponent=function(element){
this._renderedOutput = element;
this._currentElement = element === null || element === false?
ReactEmptyComponent.emptyElement:
element;};


NoopInternalComponent.prototype = {

mountComponent:function(){}, 


receiveComponent:function(element){
this._renderedOutput = element;
this._currentElement = element === null || element === false?
ReactEmptyComponent.emptyElement:
element;}, 


unmountComponent:function(){}};




var ShallowComponentWrapper=function(){};
assign(
ShallowComponentWrapper.prototype, 
ReactCompositeComponent.Mixin, {
_instantiateReactComponent:function(element){
return new NoopInternalComponent(element);}, 

_replaceNodeWithMarkupByID:function(){}, 
_renderValidatedComponent:
ReactCompositeComponent.Mixin.
_renderValidatedComponentWithoutOwnerOrContext});



ReactShallowRenderer.prototype.render = function(element, context){
var transaction=ReactUpdates.ReactReconcileTransaction.getPooled();
this._render(element, transaction, context);
ReactUpdates.ReactReconcileTransaction.release(transaction);};


ReactShallowRenderer.prototype.unmount = function(){
if(this._instance){
this._instance.unmountComponent();}};



ReactShallowRenderer.prototype._render = function(element, transaction, context){
if(!this._instance){
var rootID=ReactInstanceHandles.createReactRootID();
var instance=new ShallowComponentWrapper(element.type);
instance.construct(element);

instance.mountComponent(rootID, transaction, context);

this._instance = instance;}else 
{
this._instance.receiveComponent(element, transaction, context);}};











function makeSimulator(eventType){
return function(domComponentOrNode, eventData){
var node;
if(ReactTestUtils.isDOMComponent(domComponentOrNode)){
node = domComponentOrNode.getDOMNode();}else 
if(domComponentOrNode.tagName){
node = domComponentOrNode;}


var fakeNativeEvent=new Event();
fakeNativeEvent.target = node;


var event=new SyntheticEvent(
ReactBrowserEventEmitter.eventNameDispatchConfigs[eventType], 
ReactMount.getID(node), 
fakeNativeEvent);

assign(event, eventData);
EventPropagators.accumulateTwoPhaseDispatches(event);

ReactUpdates.batchedUpdates(function(){
EventPluginHub.enqueueEvents(event);
EventPluginHub.processEventQueue();});};}




function buildSimulators(){
ReactTestUtils.Simulate = {};

var eventType;
for(eventType in ReactBrowserEventEmitter.eventNameDispatchConfigs) {




ReactTestUtils.Simulate[eventType] = makeSimulator(eventType);}}




var oldInjectEventPluginOrder=EventPluginHub.injection.injectEventPluginOrder;
EventPluginHub.injection.injectEventPluginOrder = function(){
oldInjectEventPluginOrder.apply(this, arguments);
buildSimulators();};

var oldInjectEventPlugins=EventPluginHub.injection.injectEventPluginsByName;
EventPluginHub.injection.injectEventPluginsByName = function(){
oldInjectEventPlugins.apply(this, arguments);
buildSimulators();};


buildSimulators();

















function makeNativeSimulator(eventType){
return function(domComponentOrNode, nativeEventData){
var fakeNativeEvent=new Event(eventType);
assign(fakeNativeEvent, nativeEventData);
if(ReactTestUtils.isDOMComponent(domComponentOrNode)){
ReactTestUtils.simulateNativeEventOnDOMComponent(
eventType, 
domComponentOrNode, 
fakeNativeEvent);}else 

if(!!domComponentOrNode.tagName){

ReactTestUtils.simulateNativeEventOnNode(
eventType, 
domComponentOrNode, 
fakeNativeEvent);}};}





var eventType;
for(eventType in topLevelTypes) {

var convenienceName=eventType.indexOf('top') === 0?
eventType.charAt(3).toLowerCase() + eventType.substr(4):eventType;




ReactTestUtils.SimulateNative[convenienceName] = 
makeNativeSimulator(eventType);}


module.exports = ReactTestUtils;});
__d('react-native/Examples/UIExplorer/UIExplorerList',["ExampleTypes","react-native/Libraries/react-native/react-native","Settings","createExamplePage","react-native/Examples/UIExplorer/ViewExample","react-native/Examples/UIExplorer/WebViewExample","react-native/Examples/UIExplorer/GeolocationExample","react-native/Examples/UIExplorer/LayoutExample","react-native/Examples/UIExplorer/PanResponderExample","react-native/Examples/UIExplorer/ActivityIndicatorIOSExample","react-native/Examples/UIExplorer/DatePickerIOSExample","react-native/Examples/UIExplorer/ImageExample","react-native/Examples/UIExplorer/ListViewExample","react-native/Examples/UIExplorer/ListViewPagingExample","react-native/Examples/UIExplorer/MapViewExample","react-native/Examples/UIExplorer/Navigator/NavigatorExample","react-native/Examples/UIExplorer/NavigatorIOSColorsExample","react-native/Examples/UIExplorer/NavigatorIOSExample","react-native/Examples/UIExplorer/PickerIOSExample","react-native/Examples/UIExplorer/ProgressViewIOSExample","react-native/Examples/UIExplorer/ScrollViewExample","react-native/Examples/UIExplorer/SegmentedControlIOSExample","react-native/Examples/UIExplorer/SliderIOSExample","react-native/Examples/UIExplorer/SwitchIOSExample","react-native/Examples/UIExplorer/TabBarIOSExample","react-native/Examples/UIExplorer/TextExample.ios","react-native/Examples/UIExplorer/TextInputExample","react-native/Examples/UIExplorer/TouchableExample","react-native/Examples/UIExplorer/AccessibilityIOSExample","react-native/Examples/UIExplorer/ActionSheetIOSExample","react-native/Examples/UIExplorer/AdSupportIOSExample","react-native/Examples/UIExplorer/AlertIOSExample","AppStateIOSExample","react-native/Examples/UIExplorer/AsyncStorageExample","react-native/Examples/UIExplorer/BorderExample","react-native/Examples/UIExplorer/CameraRollExample.ios","react-native/Examples/UIExplorer/LayoutEventsExample","react-native/Examples/UIExplorer/NetInfoExample","react-native/Examples/UIExplorer/PointerEventsExample","react-native/Examples/UIExplorer/PushNotificationIOSExample","react-native/Examples/UIExplorer/StatusBarIOSExample","react-native/Examples/UIExplorer/TimerExample","react-native/Examples/UIExplorer/VibrationIOSExample","react-native/Examples/UIExplorer/XHRExample"],function(global, require, requireDynamic, requireLazy, module, exports) {  var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}














'use strict';

var React=require('react-native/Libraries/react-native/react-native');var 

AppRegistry=








React.AppRegistry;var ListView=React.ListView;var PixelRatio=React.PixelRatio;var Platform=React.Platform;var StyleSheet=React.StyleSheet;var Text=React.Text;var TextInput=React.TextInput;var TouchableHighlight=React.TouchableHighlight;var View=React.View;var 

TestModule=React.addons.TestModule;
var Settings=require('Settings');



var createExamplePage=require('createExamplePage');

var COMMON_COMPONENTS=[
require('react-native/Examples/UIExplorer/ViewExample'), 
require('react-native/Examples/UIExplorer/WebViewExample')];


var COMMON_APIS=[
require('react-native/Examples/UIExplorer/GeolocationExample'), 
require('react-native/Examples/UIExplorer/LayoutExample'), 
require('react-native/Examples/UIExplorer/PanResponderExample')];


if(Platform.OS === 'ios'){
var COMPONENTS=COMMON_COMPONENTS.concat([
require('react-native/Examples/UIExplorer/ActivityIndicatorIOSExample'), 
require('react-native/Examples/UIExplorer/DatePickerIOSExample'), 
require('react-native/Examples/UIExplorer/ImageExample'), 
require('react-native/Examples/UIExplorer/ListViewExample'), 
require('react-native/Examples/UIExplorer/ListViewPagingExample'), 
require('react-native/Examples/UIExplorer/MapViewExample'), 
require('react-native/Examples/UIExplorer/Navigator/NavigatorExample'), 
require('react-native/Examples/UIExplorer/NavigatorIOSColorsExample'), 
require('react-native/Examples/UIExplorer/NavigatorIOSExample'), 
require('react-native/Examples/UIExplorer/PickerIOSExample'), 
require('react-native/Examples/UIExplorer/ProgressViewIOSExample'), 
require('react-native/Examples/UIExplorer/ScrollViewExample'), 
require('react-native/Examples/UIExplorer/SegmentedControlIOSExample'), 
require('react-native/Examples/UIExplorer/SliderIOSExample'), 
require('react-native/Examples/UIExplorer/SwitchIOSExample'), 
require('react-native/Examples/UIExplorer/TabBarIOSExample'), 
require('react-native/Examples/UIExplorer/TextExample.ios'), 
require('react-native/Examples/UIExplorer/TextInputExample'), 
require('react-native/Examples/UIExplorer/TouchableExample')]);


var APIS=COMMON_APIS.concat([
require('react-native/Examples/UIExplorer/AccessibilityIOSExample'), 
require('react-native/Examples/UIExplorer/ActionSheetIOSExample'), 
require('react-native/Examples/UIExplorer/AdSupportIOSExample'), 
require('react-native/Examples/UIExplorer/AlertIOSExample'), 
require('AppStateIOSExample'), 
require('react-native/Examples/UIExplorer/AsyncStorageExample'), 
require('react-native/Examples/UIExplorer/BorderExample'), 
require('react-native/Examples/UIExplorer/CameraRollExample.ios'), 
require('react-native/Examples/UIExplorer/LayoutEventsExample'), 
require('react-native/Examples/UIExplorer/NetInfoExample'), 
require('react-native/Examples/UIExplorer/PointerEventsExample'), 
require('react-native/Examples/UIExplorer/PushNotificationIOSExample'), 
require('react-native/Examples/UIExplorer/StatusBarIOSExample'), 
require('react-native/Examples/UIExplorer/TimerExample'), 
require('react-native/Examples/UIExplorer/VibrationIOSExample'), 
require('react-native/Examples/UIExplorer/XHRExample')]);}else 


if(Platform.OS === 'android'){
var COMPONENTS=COMMON_COMPONENTS.concat([]);


var APIS=COMMON_APIS.concat([]);}



var ds=new ListView.DataSource({
rowHasChanged:function(r1, r2){return r1 !== r2;}, 
sectionHeaderHasChanged:function(h1, h2){return h1 !== h2;}});


function makeRenderable(example){
return example.examples?
createExamplePage(null, example):
example;}



COMPONENTS.concat(APIS).forEach(function(Example){
if(Example.displayName){
var Snapshotter=React.createClass({displayName:'Snapshotter', 
componentDidMount:function(){

global.requestAnimationFrame(function(){return (
global.requestAnimationFrame(function(){return TestModule.verifySnapshot(
TestModule.markTestCompleted);}));});}, 



render:function(){
var Renderable=makeRenderable(Example);
return React.createElement(Renderable, null);}});


AppRegistry.registerComponent(Example.displayName, function(){return Snapshotter;});}});var 










UIExplorerList=(function(_React$Component){


function UIExplorerList(props){_classCallCheck(this, UIExplorerList);
_get(Object.getPrototypeOf(UIExplorerList.prototype), 'constructor', this).call(this, props);
this.state = {
dataSource:ds.cloneWithRowsAndSections({
components:COMPONENTS, 
apis:APIS}), 

searchText:Platform.OS === 'ios'?Settings.get('searchText'):''};}_inherits(UIExplorerList, _React$Component);_createClass(UIExplorerList, [{key:'componentDidMount', value:



function componentDidMount(){
this._search(this.state.searchText);}}, {key:'render', value:


function render(){
if(Platform.OS === 'ios' || 
Platform.OS === 'android' && !this.props.isInDrawer){
var platformTextInputStyle=
Platform.OS === 'ios'?styles.searchTextInputIOS:
Platform.OS === 'android'?styles.searchTextInputAndroid:{};
var textInput=
React.createElement(View, {style:styles.searchRow}, 
React.createElement(TextInput, {
autoCapitalize:'none', 
autoCorrect:false, 
clearButtonMode:'always', 
onChangeText:this._search.bind(this), 
placeholder:'Search...', 
style:[styles.searchTextInput, platformTextInputStyle], 
value:this.state.searchText}));}




var homePage;
if(Platform.OS === 'android' && this.props.isInDrawer){
homePage = this._renderRow({
title:'UIExplorer', 
description:'List of examples'}, 
-1);}


return (
React.createElement(View, {style:styles.listContainer}, 
textInput, 
homePage, 
React.createElement(ListView, {
style:styles.list, 
dataSource:this.state.dataSource, 
renderRow:this._renderRow.bind(this), 
renderSectionHeader:this._renderSectionHeader, 
keyboardShouldPersistTaps:true, 
automaticallyAdjustContentInsets:false, 
keyboardDismissMode:'on-drag'})));}}, {key:'_renderSectionHeader', value:





function _renderSectionHeader(data, section){
return (
React.createElement(View, {style:styles.sectionHeader}, 
React.createElement(Text, {style:styles.sectionHeaderTitle}, 
section.toUpperCase())));}}, {key:'_renderRow', value:





function _renderRow(example, i){var _this=this;
return (
React.createElement(View, {key:i}, 
React.createElement(TouchableHighlight, {onPress:function(){return _this._onPressRow(example);}}, 
React.createElement(View, {style:styles.row}, 
React.createElement(Text, {style:styles.rowTitleText}, 
example.title), 

React.createElement(Text, {style:styles.rowDetailText}, 
example.description))), 



React.createElement(View, {style:styles.separator})));}}, {key:'_search', value:




function _search(text){
var regex=new RegExp(text, 'i');
var filter=function(component){return regex.test(component.title);};

this.setState({
dataSource:ds.cloneWithRowsAndSections({
components:COMPONENTS.filter(filter), 
apis:APIS.filter(filter)}), 

searchText:text});

Settings.set({searchText:text});}}, {key:'_onPressRow', value:


function _onPressRow(example){
if(example.external){
this.props.onExternalExampleRequested(example);
return;}

var Component=makeRenderable(example);
if(Platform.OS === 'ios'){
this.props.navigator.push({
title:Component.title, 
component:Component});}else 

if(Platform.OS === 'android'){
this.props.onSelectExample({
title:Component.title, 
component:Component});}}}]);return UIExplorerList;})(React.Component);





var styles=StyleSheet.create({
listContainer:{
flex:1}, 

list:{
backgroundColor:'#eeeeee'}, 

sectionHeader:{
padding:5}, 

group:{
backgroundColor:'white'}, 

sectionHeaderTitle:{
fontWeight:'500', 
fontSize:11}, 

row:{
backgroundColor:'white', 
justifyContent:'center', 
paddingHorizontal:15, 
paddingVertical:8}, 

separator:{
height:1 / PixelRatio.get(), 
backgroundColor:'#bbbbbb', 
marginLeft:15}, 

rowTitleText:{
fontSize:17, 
fontWeight:'500'}, 

rowDetailText:{
fontSize:15, 
color:'#888888', 
lineHeight:20}, 

searchRow:{
backgroundColor:'#eeeeee', 
paddingTop:75, 
paddingLeft:10, 
paddingRight:10, 
paddingBottom:10}, 

searchTextInput:{
backgroundColor:'white', 
borderColor:'#cccccc', 
borderRadius:3, 
borderWidth:1, 
paddingLeft:8}, 

searchTextInputIOS:{
height:30}, 

searchTextInputAndroid:{
padding:2}});



module.exports = UIExplorerList;});
__d('ExampleTypes',[],function(global, require, requireDynamic, requireLazy, module, exports) {  });
__d('Settings',["RCTDeviceEventEmitter","NativeModules","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTDeviceEventEmitter=require('RCTDeviceEventEmitter');
var RCTSettingsManager=require('NativeModules').SettingsManager;

var invariant=require('invariant');

var subscriptions=[];

var Settings={
_settings:RCTSettingsManager.settings, 

get:function(key){
return this._settings[key];}, 


set:function(settings){
this._settings = Object.assign(this._settings, settings);
RCTSettingsManager.setValues(settings);}, 


watchKeys:function(keys, callback){
if(typeof keys === 'string'){
keys = [keys];}


invariant(
Array.isArray(keys), 
'keys should be a string or array of strings');


var sid=subscriptions.length;
subscriptions.push({keys:keys, callback:callback});
return sid;}, 


clearWatch:function(watchId){
if(watchId < subscriptions.length){
subscriptions[watchId] = {keys:[], callback:null};}}, 



_sendObservations:function(body){var _this=this;
Object.keys(body).forEach(function(key){
var newValue=body[key];
var didChange=_this._settings[key] !== newValue;
_this._settings[key] = newValue;

if(didChange){
subscriptions.forEach(function(sub){
if(sub.keys.indexOf(key) !== -1 && sub.callback){
sub.callback();}});}});}};







RCTDeviceEventEmitter.addListener(
'settingsUpdated', 
Settings._sendObservations.bind(Settings));


module.exports = Settings;});
__d('createExamplePage',["ExampleTypes","react-native/Libraries/react-native/react-native","ReactNative","UIExplorerBlock","UIExplorerPage","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');
var ReactNative=require('ReactNative');
var UIExplorerBlock=require('UIExplorerBlock');
var UIExplorerPage=require('UIExplorerPage');

var invariant=require('invariant');



var createExamplePage=function(title, exampleModule)
{
invariant(!!exampleModule.examples, 'The module must have examples');

var ExamplePage=React.createClass({displayName:'ExamplePage', 
statics:{
title:exampleModule.title, 
description:exampleModule.description}, 


getBlock:function(example, i){


var originalRender=React.render;
var originalRenderComponent=React.renderComponent;
var originalIOSRender=ReactNative.render;
var originalIOSRenderComponent=ReactNative.renderComponent;
var renderedComponent;


React.render = 
React.renderComponent = 
ReactNative.render = 
ReactNative.renderComponent = 
function(element, container){
renderedComponent = element;};

var result=example.render(null);
if(result){
renderedComponent = result;}

React.render = originalRender;
React.renderComponent = originalRenderComponent;
ReactNative.render = originalIOSRender;
ReactNative.renderComponent = originalIOSRenderComponent;
return (
React.createElement(UIExplorerBlock, {
key:i, 
title:example.title, 
description:example.description}, 
renderedComponent));}, 




render:function(){
return (
React.createElement(UIExplorerPage, {title:title}, 
exampleModule.examples.map(this.getBlock)));}});





return ExamplePage;};


module.exports = createExamplePage;});
__d('UIExplorerBlock',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

var UIExplorerBlock=React.createClass({displayName:'UIExplorerBlock', 
propTypes:{
title:React.PropTypes.string, 
description:React.PropTypes.string}, 


getInitialState:function(){
return {description:null};}, 


render:function(){
var description;
if(this.props.description){
description = 
React.createElement(Text, {style:styles.descriptionText}, 
this.props.description);}



return (
React.createElement(View, {style:styles.container}, 
React.createElement(View, {style:styles.titleContainer}, 
React.createElement(Text, {style:styles.titleText}, 
this.props.title), 

description), 

React.createElement(View, {style:styles.children}, 
this.props.children)));}});






var styles=StyleSheet.create({
container:{
borderRadius:3, 
borderWidth:0.5, 
borderColor:'#d6d7da', 
backgroundColor:'#ffffff', 
margin:10, 
marginVertical:5, 
overflow:'hidden'}, 

titleContainer:{
borderBottomWidth:0.5, 
borderTopLeftRadius:3, 
borderTopRightRadius:2.5, 
borderBottomColor:'#d6d7da', 
backgroundColor:'#f6f7f8', 
paddingHorizontal:10, 
paddingVertical:5}, 

titleText:{
fontSize:14, 
fontWeight:'500'}, 

descriptionText:{
fontSize:14}, 

disclosure:{
position:'absolute', 
top:0, 
right:0, 
padding:10}, 

disclosureIcon:{
width:12, 
height:8}, 

children:{
margin:10}});



module.exports = UIExplorerBlock;});
__d('UIExplorerPage',["react-native/Libraries/react-native/react-native","UIExplorerTitle"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};

















var React=require('react-native/Libraries/react-native/react-native');var 

ScrollView=


React.ScrollView;var StyleSheet=React.StyleSheet;var View=React.View;

var UIExplorerTitle=require('UIExplorerTitle');

var UIExplorerPage=React.createClass({displayName:'UIExplorerPage', 

propTypes:{
keyboardShouldPersistTaps:React.PropTypes.bool, 
noScroll:React.PropTypes.bool, 
noSpacer:React.PropTypes.bool}, 


render:function(){
var ContentWrapper;
var wrapperProps={};
if(this.props.noScroll){
ContentWrapper = View;}else 
{
ContentWrapper = ScrollView;
wrapperProps.keyboardShouldPersistTaps = true;
wrapperProps.keyboardDismissMode = 'interactive';}

var title=this.props.title?
React.createElement(UIExplorerTitle, {title:this.props.title}):
null;
var spacer=this.props.noSpacer?null:React.createElement(View, {style:styles.spacer});
return (
React.createElement(View, {style:styles.container}, 
title, 
React.createElement(ContentWrapper, _extends({
style:styles.wrapper}, 
wrapperProps), 
this.props.children, 
spacer)));}});






var styles=StyleSheet.create({
container:{
backgroundColor:'#e9eaed', 
paddingTop:15, 
flex:1}, 

spacer:{
height:270}, 

wrapper:{
flex:1}});



module.exports = UIExplorerPage;});
__d('UIExplorerTitle',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

var UIExplorerTitle=React.createClass({displayName:'UIExplorerTitle', 
render:function(){
return (
React.createElement(View, {style:styles.container}, 
React.createElement(Text, {style:styles.text}, 
this.props.title)));}});






var styles=StyleSheet.create({
container:{
borderRadius:4, 
borderWidth:0.5, 
borderColor:'#d6d7da', 
margin:10, 
height:45, 
padding:10, 
backgroundColor:'white'}, 

text:{
fontSize:19, 
fontWeight:'500'}});



module.exports = UIExplorerTitle;});
__d('react-native/Examples/UIExplorer/ViewExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

var styles=StyleSheet.create({
box:{
backgroundColor:'#527FE4', 
borderColor:'#000033', 
borderWidth:1}});



exports.title = '<View>';
exports.description = 'Basic building block of all UI.';
exports.displayName = 'ViewExample';
exports.examples = [
{
title:'Background Color', 
render:function(){
return (
React.createElement(View, {style:{backgroundColor:'#527FE4', padding:5}}, 
React.createElement(Text, {style:{fontSize:11}}, 'Blue background')));}}, 





{
title:'Border', 
render:function(){
return (
React.createElement(View, {style:{borderColor:'#527FE4', borderWidth:5, padding:10}}, 
React.createElement(Text, {style:{fontSize:11}}, '5px blue border')));}}, 



{
title:'Padding/Margin', 
render:function(){
return (
React.createElement(View, {style:{borderColor:'#bb0000', borderWidth:0.5}}, 
React.createElement(View, {style:[styles.box, {padding:5}]}, 
React.createElement(Text, {style:{fontSize:11}}, '5px padding')), 

React.createElement(View, {style:[styles.box, {margin:5}]}, 
React.createElement(Text, {style:{fontSize:11}}, '5px margin')), 

React.createElement(View, {style:[styles.box, {margin:5, padding:5, alignSelf:'flex-start'}]}, 
React.createElement(Text, {style:{fontSize:11}}, '5px margin and padding,'), 


React.createElement(Text, {style:{fontSize:11}}, 'widthAutonomous=true'))));}}, 






{
title:'Border Radius', 
render:function(){
return (
React.createElement(View, {style:{borderWidth:0.5, borderRadius:5, padding:5}}, 
React.createElement(Text, {style:{fontSize:11}}, 'Too much use of `borderRadius` (especially large radii) on anything which is scrolling may result in dropped frames. Use sparingly.')));}}, 







{
title:'Circle with Border Radius', 
render:function(){
return (
React.createElement(View, {style:{borderRadius:10, borderWidth:1, width:20, height:20}}));}}, 


{
title:'Overflow', 
render:function(){
return (
React.createElement(View, {style:{flexDirection:'row'}}, 
React.createElement(View, {
style:{
width:95, 
height:10, 
marginRight:10, 
marginBottom:5, 
overflow:'hidden', 
borderWidth:0.5}}, 

React.createElement(View, {style:{width:200, height:20}}, 
React.createElement(Text, null, 'Overflow hidden'))), 


React.createElement(View, {style:{width:95, height:10, marginBottom:5, borderWidth:0.5}}, 
React.createElement(View, {style:{width:200, height:20}}, 
React.createElement(Text, null, 'Overflow visible')))));}}, 





{
title:'Opacity', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {style:{opacity:0}}, React.createElement(Text, null, 'Opacity 0')), 
React.createElement(View, {style:{opacity:0.1}}, React.createElement(Text, null, 'Opacity 0.1')), 
React.createElement(View, {style:{opacity:0.3}}, React.createElement(Text, null, 'Opacity 0.3')), 
React.createElement(View, {style:{opacity:0.5}}, React.createElement(Text, null, 'Opacity 0.5')), 
React.createElement(View, {style:{opacity:0.7}}, React.createElement(Text, null, 'Opacity 0.7')), 
React.createElement(View, {style:{opacity:0.9}}, React.createElement(Text, null, 'Opacity 0.9')), 
React.createElement(View, {style:{opacity:1}}, React.createElement(Text, null, 'Opacity 1'))));}}];});
__d('react-native/Examples/UIExplorer/WebViewExample',["react-native/Libraries/react-native/react-native","StyleSheet"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');
var StyleSheet=require('StyleSheet');var 

StyleSheet=





React.StyleSheet;var Text=React.Text;var TextInput=React.TextInput;var TouchableOpacity=React.TouchableOpacity;var View=React.View;var WebView=React.WebView;

var HEADER='#3b5998';
var BGWASH='rgba(255,255,255,0.8)';
var DISABLED_WASH='rgba(255,255,255,0.25)';

var TEXT_INPUT_REF='urlInput';
var WEBVIEW_REF='webview';
var DEFAULT_URL='https://m.facebook.com';

var WebViewExample=React.createClass({displayName:'WebViewExample', 

getInitialState:function(){
return {
url:DEFAULT_URL, 
status:'No Page Loaded', 
backButtonEnabled:false, 
forwardButtonEnabled:false, 
loading:true};}, 



inputText:'', 

handleTextInputChange:function(event){
this.inputText = event.nativeEvent.text;}, 


render:function(){
this.inputText = this.state.url;

return (
React.createElement(View, {style:[styles.container]}, 
React.createElement(View, {style:[styles.addressBarRow]}, 
React.createElement(TouchableOpacity, {onPress:this.goBack}, 
React.createElement(View, {style:this.state.backButtonEnabled?styles.navButton:styles.disabledButton}, 
React.createElement(Text, null, 
'<'))), 



React.createElement(TouchableOpacity, {onPress:this.goForward}, 
React.createElement(View, {style:this.state.forwardButtonEnabled?styles.navButton:styles.disabledButton}, 
React.createElement(Text, null, 
'>'))), 



React.createElement(TextInput, {
ref:TEXT_INPUT_REF, 
autoCapitalize:'none', 
value:this.state.url, 
onSubmitEditing:this.onSubmitEditing, 
onChange:this.handleTextInputChange, 
clearButtonMode:'while-editing', 
style:styles.addressBarTextInput}), 

React.createElement(TouchableOpacity, {onPress:this.pressGoButton}, 
React.createElement(View, {style:styles.goButton}, 
React.createElement(Text, null, 'Go!')))), 





React.createElement(WebView, {
ref:WEBVIEW_REF, 
automaticallyAdjustContentInsets:false, 
style:styles.webView, 
url:this.state.url, 
javaScriptEnabledAndroid:true, 
onNavigationStateChange:this.onNavigationStateChange, 
startInLoadingState:true}), 

React.createElement(View, {style:styles.statusBar}, 
React.createElement(Text, {style:styles.statusBarText}, this.state.status))));}, 





goBack:function(){
this.refs[WEBVIEW_REF].goBack();}, 


goForward:function(){
this.refs[WEBVIEW_REF].goForward();}, 


reload:function(){
this.refs[WEBVIEW_REF].reload();}, 


onNavigationStateChange:function(navState){
this.setState({
backButtonEnabled:navState.canGoBack, 
forwardButtonEnabled:navState.canGoForward, 
url:navState.url, 
status:navState.title, 
loading:navState.loading});}, 



onSubmitEditing:function(event){
this.pressGoButton();}, 


pressGoButton:function(){
var url=this.inputText.toLowerCase();
if(url === this.state.url){
this.reload();}else 
{
this.setState({
url:url});}



this.refs[TEXT_INPUT_REF].blur();}});




var styles=StyleSheet.create({
container:{
flex:1, 
backgroundColor:HEADER}, 

addressBarRow:{
flexDirection:'row', 
padding:8}, 

webView:{
backgroundColor:BGWASH, 
height:350}, 

addressBarTextInput:{
backgroundColor:BGWASH, 
borderColor:'transparent', 
borderRadius:3, 
borderWidth:1, 
height:24, 
paddingLeft:10, 
paddingTop:3, 
paddingBottom:3, 
flex:1, 
fontSize:14}, 

navButton:{
width:20, 
padding:3, 
marginRight:3, 
alignItems:'center', 
justifyContent:'center', 
backgroundColor:BGWASH, 
borderColor:'transparent', 
borderRadius:3}, 

disabledButton:{
width:20, 
padding:3, 
marginRight:3, 
alignItems:'center', 
justifyContent:'center', 
backgroundColor:DISABLED_WASH, 
borderColor:'transparent', 
borderRadius:3}, 

goButton:{
height:24, 
padding:3, 
marginLeft:8, 
alignItems:'center', 
backgroundColor:BGWASH, 
borderColor:'transparent', 
borderRadius:3, 
alignSelf:'stretch'}, 

statusBar:{
flexDirection:'row', 
alignItems:'center', 
paddingLeft:5, 
height:22}, 

statusBarText:{
color:'white', 
fontSize:13}, 

spinner:{
width:20, 
marginRight:6}});



exports.title = '<WebView>';
exports.description = 'Base component to display web content';
exports.examples = [
{
title:'WebView', 
render:function(){return React.createElement(WebViewExample, null);}}];});
__d('react-native/Examples/UIExplorer/GeolocationExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';


















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

exports.framework = 'React';
exports.title = 'Geolocation';
exports.description = 'Examples of using the Geolocation API.';

exports.examples = [
{
title:'navigator.geolocation', 
render:function(){
return React.createElement(GeolocationExample, null);}}];




var GeolocationExample=React.createClass({displayName:'GeolocationExample', 
watchID:null, 

getInitialState:function(){
return {
initialPosition:'unknown', 
lastPosition:'unknown'};}, 



componentDidMount:function(){var _this=this;
navigator.geolocation.getCurrentPosition(
function(initialPosition){return _this.setState({initialPosition:initialPosition});}, 
function(error){return alert(error.message);}, 
{enableHighAccuracy:true, timeout:20000, maximumAge:1000});

this.watchID = navigator.geolocation.watchPosition(function(lastPosition){
_this.setState({lastPosition:lastPosition});});}, 



componentWillUnmount:function(){
navigator.geolocation.clearWatch(this.watchID);}, 


render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, null, 
React.createElement(Text, {style:styles.title}, 'Initial position: '), 
JSON.stringify(this.state.initialPosition)), 

React.createElement(Text, null, 
React.createElement(Text, {style:styles.title}, 'Current position: '), 
JSON.stringify(this.state.lastPosition))));}});






var styles=StyleSheet.create({
title:{
fontWeight:'500'}});});
__d('react-native/Examples/UIExplorer/LayoutExample',["react-native/Libraries/react-native/react-native","UIExplorerBlock","UIExplorerPage"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

var UIExplorerBlock=require('UIExplorerBlock');
var UIExplorerPage=require('UIExplorerPage');

var Circle=React.createClass({displayName:'Circle', 
render:function(){
var size=this.props.size || 20;
return (
React.createElement(View, {
style:{
borderRadius:size / 2, 
backgroundColor:'#527fe4', 
width:size, 
height:size, 
margin:1}}));}});






var CircleBlock=React.createClass({displayName:'CircleBlock', 
render:function(){
var circleStyle={
flexDirection:'row', 
backgroundColor:'#f6f7f8', 
borderWidth:0.5, 
borderColor:'#d6d7da', 
marginBottom:2};

return (
React.createElement(View, {style:[circleStyle, this.props.style]}, 
this.props.children));}});





var LayoutExample=React.createClass({displayName:'LayoutExample', 
statics:{
title:'Layout - Flexbox', 
description:'Examples of using the flexbox API to layout views.'}, 

render:function(){
return (
React.createElement(UIExplorerPage, {title:this.props.navigator?null:'Layout'}, 
React.createElement(UIExplorerBlock, {title:'Flex Direction'}, 
React.createElement(Text, null, 'row'), 
React.createElement(CircleBlock, {style:{flexDirection:'row'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null)), 

React.createElement(Text, null, 'column'), 
React.createElement(CircleBlock, {style:{flexDirection:'column'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null)), 

React.createElement(View, {style:[styles.overlay, {position:'absolute', top:15, left:160}]}, 
React.createElement(Text, null, 'top: 15, left: 160'))), 



React.createElement(UIExplorerBlock, {title:'Justify Content - Main Direction'}, 
React.createElement(Text, null, 'flex-start'), 
React.createElement(CircleBlock, {style:{justifyContent:'flex-start'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null)), 

React.createElement(Text, null, 'center'), 
React.createElement(CircleBlock, {style:{justifyContent:'center'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null)), 

React.createElement(Text, null, 'flex-end'), 
React.createElement(CircleBlock, {style:{justifyContent:'flex-end'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null)), 

React.createElement(Text, null, 'space-between'), 
React.createElement(CircleBlock, {style:{justifyContent:'space-between'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null)), 

React.createElement(Text, null, 'space-around'), 
React.createElement(CircleBlock, {style:{justifyContent:'space-around'}}, 
React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null), React.createElement(Circle, null))), 


React.createElement(UIExplorerBlock, {title:'Align Items - Other Direction'}, 
React.createElement(Text, null, 'flex-start'), 
React.createElement(CircleBlock, {style:{alignItems:'flex-start', height:30}}, 
React.createElement(Circle, {size:15}), React.createElement(Circle, {size:10}), React.createElement(Circle, {size:20}), 
React.createElement(Circle, {size:17}), React.createElement(Circle, {size:12}), React.createElement(Circle, {size:15}), 
React.createElement(Circle, {size:10}), React.createElement(Circle, {size:20}), React.createElement(Circle, {size:17}), 
React.createElement(Circle, {size:12}), React.createElement(Circle, {size:15}), React.createElement(Circle, {size:10}), 
React.createElement(Circle, {size:20}), React.createElement(Circle, {size:17}), React.createElement(Circle, {size:12}), 
React.createElement(Circle, {size:15}), React.createElement(Circle, {size:8})), 

React.createElement(Text, null, 'center'), 
React.createElement(CircleBlock, {style:{alignItems:'center', height:30}}, 
React.createElement(Circle, {size:15}), React.createElement(Circle, {size:10}), React.createElement(Circle, {size:20}), 
React.createElement(Circle, {size:17}), React.createElement(Circle, {size:12}), React.createElement(Circle, {size:15}), 
React.createElement(Circle, {size:10}), React.createElement(Circle, {size:20}), React.createElement(Circle, {size:17}), 
React.createElement(Circle, {size:12}), React.createElement(Circle, {size:15}), React.createElement(Circle, {size:10}), 
React.createElement(Circle, {size:20}), React.createElement(Circle, {size:17}), React.createElement(Circle, {size:12}), 
React.createElement(Circle, {size:15}), React.createElement(Circle, {size:8})), 

React.createElement(Text, null, 'flex-end'), 
React.createElement(CircleBlock, {style:{alignItems:'flex-end', height:30}}, 
React.createElement(Circle, {size:15}), React.createElement(Circle, {size:10}), React.createElement(Circle, {size:20}), 
React.createElement(Circle, {size:17}), React.createElement(Circle, {size:12}), React.createElement(Circle, {size:15}), 
React.createElement(Circle, {size:10}), React.createElement(Circle, {size:20}), React.createElement(Circle, {size:17}), 
React.createElement(Circle, {size:12}), React.createElement(Circle, {size:15}), React.createElement(Circle, {size:10}), 
React.createElement(Circle, {size:20}), React.createElement(Circle, {size:17}), React.createElement(Circle, {size:12}), 
React.createElement(Circle, {size:15}), React.createElement(Circle, {size:8}))), 


React.createElement(UIExplorerBlock, {title:'Flex Wrap'}, 
React.createElement(CircleBlock, {style:{flexWrap:'wrap'}}, 
'oooooooooooooooo'.split('').map(function(char, i){return React.createElement(Circle, {key:i});})))));}});







var styles=StyleSheet.create({
overlay:{
backgroundColor:'#aaccff', 
borderRadius:10, 
borderWidth:0.5, 
opacity:0.5, 
padding:5}});



module.exports = LayoutExample;});
__d('react-native/Examples/UIExplorer/PanResponderExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var PanResponder=React.PanResponder;var View=React.View;

var CIRCLE_SIZE=80;
var CIRCLE_COLOR='blue';
var CIRCLE_HIGHLIGHT_COLOR='green';


var PanResponderExample=React.createClass({displayName:'PanResponderExample', 

statics:{
title:'PanResponder Sample', 
description:'Basic gesture handling example'}, 


_panResponder:{}, 
_previousLeft:0, 
_previousTop:0, 
_circleStyles:{}, 
circle:null, 

componentWillMount:function(){
this._panResponder = PanResponder.create({
onStartShouldSetPanResponder:this._handleStartShouldSetPanResponder, 
onMoveShouldSetPanResponder:this._handleMoveShouldSetPanResponder, 
onPanResponderGrant:this._handlePanResponderGrant, 
onPanResponderMove:this._handlePanResponderMove, 
onPanResponderRelease:this._handlePanResponderEnd, 
onPanResponderTerminate:this._handlePanResponderEnd});

this._previousLeft = 20;
this._previousTop = 84;
this._circleStyles = {
left:this._previousLeft, 
top:this._previousTop};}, 



componentDidMount:function(){
this._updatePosition();}, 


render:function(){var _this=this;
return (
React.createElement(View, {
style:styles.container}, 
React.createElement(View, _extends({
ref:function(circle){
_this.circle = circle;}, 

style:styles.circle}, 
this._panResponder.panHandlers))));}, 





_highlight:function(){
this.circle && this.circle.setNativeProps({
backgroundColor:CIRCLE_HIGHLIGHT_COLOR});}, 



_unHighlight:function(){
this.circle && this.circle.setNativeProps({
backgroundColor:CIRCLE_COLOR});}, 



_updatePosition:function(){
this.circle && this.circle.setNativeProps(this._circleStyles);}, 


_handleStartShouldSetPanResponder:function(e, gestureState){

return true;}, 


_handleMoveShouldSetPanResponder:function(e, gestureState){

return true;}, 


_handlePanResponderGrant:function(e, gestureState){
this._highlight();}, 

_handlePanResponderMove:function(e, gestureState){
this._circleStyles.left = this._previousLeft + gestureState.dx;
this._circleStyles.top = this._previousTop + gestureState.dy;
this._updatePosition();}, 

_handlePanResponderEnd:function(e, gestureState){
this._unHighlight();
this._previousLeft += gestureState.dx;
this._previousTop += gestureState.dy;}});



var styles=StyleSheet.create({
circle:{
width:CIRCLE_SIZE, 
height:CIRCLE_SIZE, 
borderRadius:CIRCLE_SIZE / 2, 
backgroundColor:CIRCLE_COLOR, 
position:'absolute', 
left:0, 
top:0}, 

container:{
flex:1, 
paddingTop:64}});



module.exports = PanResponderExample;});
__d('react-native/Examples/UIExplorer/ActivityIndicatorIOSExample',["react-native/Libraries/react-native/react-native","react-timer-mixin/TimerMixin"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

ActivityIndicatorIOS=


React.ActivityIndicatorIOS;var StyleSheet=React.StyleSheet;var View=React.View;
var TimerMixin=require('react-timer-mixin/TimerMixin');

var ToggleAnimatingActivityIndicator=React.createClass({displayName:'ToggleAnimatingActivityIndicator', 
mixins:[TimerMixin], 

getInitialState:function(){
return {
animating:true};}, 



setToggleTimeout:function(){var _this=this;
this.setTimeout(
function(){
_this.setState({animating:!_this.state.animating});
_this.setToggleTimeout();}, 

1200);}, 



componentDidMount:function(){
this.setToggleTimeout();}, 


render:function(){
return (
React.createElement(ActivityIndicatorIOS, {
animating:this.state.animating, 
style:[styles.centering, {height:80}], 
size:'large'}));}});





exports.displayName = undefined;
exports.framework = 'React';
exports.title = '<ActivityIndicatorIOS>';
exports.description = 'Animated loading indicators.';

exports.examples = [
{
title:'Default (small, white)', 
render:function(){
return (
React.createElement(ActivityIndicatorIOS, {
style:[styles.centering, styles.gray, {height:40}], 
color:'white'}));}}, 




{
title:'Gray', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(ActivityIndicatorIOS, {
style:[styles.centering, {height:40}]}), 

React.createElement(ActivityIndicatorIOS, {
style:[styles.centering, {backgroundColor:'#eeeeee', height:40}]})));}}, 





{
title:'Custom colors', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(ActivityIndicatorIOS, {color:'#0000ff'}), 
React.createElement(ActivityIndicatorIOS, {color:'#aa00aa'}), 
React.createElement(ActivityIndicatorIOS, {color:'#aa3300'}), 
React.createElement(ActivityIndicatorIOS, {color:'#00aa00'})));}}, 




{
title:'Large', 
render:function(){
return (
React.createElement(ActivityIndicatorIOS, {
style:[styles.centering, styles.gray, {height:80}], 
color:'white', 
size:'large'}));}}, 




{
title:'Large, custom colors', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(ActivityIndicatorIOS, {
size:'large', 
color:'#0000ff'}), 

React.createElement(ActivityIndicatorIOS, {
size:'large', 
color:'#aa00aa'}), 

React.createElement(ActivityIndicatorIOS, {
size:'large', 
color:'#aa3300'}), 

React.createElement(ActivityIndicatorIOS, {
size:'large', 
color:'#00aa00'})));}}, 





{
title:'Start/stop', 
render:function(){
return React.createElement(ToggleAnimatingActivityIndicator, null);}}];




var styles=StyleSheet.create({
centering:{
alignItems:'center', 
justifyContent:'center'}, 

gray:{
backgroundColor:'#cccccc'}, 

horizontal:{
flexDirection:'row', 
justifyContent:'space-around'}});});
__d('react-native/Examples/UIExplorer/DatePickerIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

DatePickerIOS=




React.DatePickerIOS;var StyleSheet=React.StyleSheet;var Text=React.Text;var TextInput=React.TextInput;var View=React.View;

var DatePickerExample=React.createClass({displayName:'DatePickerExample', 
getDefaultProps:function(){
return {
date:new Date(), 
timeZoneOffsetInHours:-1 * new Date().getTimezoneOffset() / 60};}, 



getInitialState:function(){
return {
date:this.props.date, 
timeZoneOffsetInHours:this.props.timeZoneOffsetInHours};}, 



onDateChange:function(date){
this.setState({date:date});}, 


onTimezoneChange:function(event){
var offset=parseInt(event.nativeEvent.text, 10);
if(isNaN(offset)){
return;}

this.setState({timeZoneOffsetInHours:offset});}, 


render:function(){


return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'Value:'}, 
React.createElement(Text, null, 
this.state.date.toLocaleDateString() + 
' ' + 
this.state.date.toLocaleTimeString())), 


React.createElement(WithLabel, {label:'Timezone:'}, 
React.createElement(TextInput, {
onChange:this.onTimezoneChange, 
style:styles.textinput, 
value:this.state.timeZoneOffsetInHours.toString()}), 

React.createElement(Text, null, ' hours from UTC')), 

React.createElement(Heading, {label:'Date + time picker'}), 
React.createElement(DatePickerIOS, {
date:this.state.date, 
mode:'datetime', 
timeZoneOffsetInMinutes:this.state.timeZoneOffsetInHours * 60, 
onDateChange:this.onDateChange}), 

React.createElement(Heading, {label:'Date picker'}), 
React.createElement(DatePickerIOS, {
date:this.state.date, 
mode:'date', 
timeZoneOffsetInMinutes:this.state.timeZoneOffsetInHours * 60, 
onDateChange:this.onDateChange}), 

React.createElement(Heading, {label:'Time picker, 10-minute interval'}), 
React.createElement(DatePickerIOS, {
date:this.state.date, 
mode:'time', 
timeZoneOffsetInMinutes:this.state.timeZoneOffsetInHours * 60, 
onDateChange:this.onDateChange, 
minuteInterval:10})));}});






var WithLabel=React.createClass({displayName:'WithLabel', 
render:function(){
return (
React.createElement(View, {style:styles.labelContainer}, 
React.createElement(View, {style:styles.labelView}, 
React.createElement(Text, {style:styles.label}, 
this.props.label)), 


this.props.children));}});





var Heading=React.createClass({displayName:'Heading', 
render:function(){
return (
React.createElement(View, {style:styles.headingContainer}, 
React.createElement(Text, {style:styles.heading}, 
this.props.label)));}});






exports.title = '<DatePickerIOS>';
exports.description = 'Select dates and times using the native UIDatePicker.';
exports.examples = [
{
title:'<DatePickerIOS>', 
render:function(){
return React.createElement(DatePickerExample, null);}}];



var styles=StyleSheet.create({
textinput:{
height:26, 
width:50, 
borderWidth:0.5, 
borderColor:'#0f0f0f', 
padding:4, 
fontSize:13}, 

labelContainer:{
flexDirection:'row', 
alignItems:'center', 
marginVertical:2}, 

labelView:{
marginRight:10, 
paddingVertical:2}, 

label:{
fontWeight:'500'}, 

headingContainer:{
padding:4, 
backgroundColor:'#f6f7f8'}, 

heading:{
fontWeight:'500', 
fontSize:14}});});
__d('react-native/Examples/UIExplorer/ImageExample',["react-native/Libraries/react-native/react-native","ImageCapInsetsExample","image!uie_thumb_normal","image!uie_thumb_selected","image!uie_comment_normal","image!uie_comment_highlighted","image!uie_thumb_normal","image!uie_thumb_normal","image!uie_thumb_normal","image!uie_thumb_normal"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

Image=



React.Image;var StyleSheet=React.StyleSheet;var Text=React.Text;var View=React.View;

var ImageCapInsetsExample=require('ImageCapInsetsExample');

exports.framework = 'React';
exports.title = '<Image>';
exports.description = 'Base component for displaying different types of images.';

exports.examples = [
{
title:'Plain Network Image', 
description:'If the `source` prop `uri` property is prefixed with ' + 
'"http", then it will be downloaded from the network.', 
render:function(){
return (
React.createElement(Image, {
source:{uri:'http://facebook.github.io/react/img/logo_og.png'}, 
style:styles.base}));}}, 




{
title:'Plain Static Image', 
description:'Static assets should be required by prefixing with `image!` ' + 
'and are located in the app bundle.', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {source:require('image!uie_thumb_normal'), style:styles.icon}), 
React.createElement(Image, {source:require('image!uie_thumb_selected'), style:styles.icon}), 
React.createElement(Image, {source:require('image!uie_comment_normal'), style:styles.icon}), 
React.createElement(Image, {source:require('image!uie_comment_highlighted'), style:styles.icon})));}}, 




{
title:'Border Color', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {
source:smallImage, 
style:[
styles.base, 
styles.background, 
{borderWidth:10, borderColor:'#FFFF00'}]})));}}, 






{
title:'Border Width', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {
source:smallImage, 
style:[
styles.base, 
styles.background, 
{borderWidth:5, borderColor:'#f099f0'}]})));}}, 






{
title:'Border Radius', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {
style:[styles.base, styles.background, {borderRadius:5}], 
source:smallImage}), 

React.createElement(Image, {
style:[
styles.base, 
styles.background, 
styles.leftMargin, 
{borderRadius:19}], 

source:smallImage})));}}, 





{
title:'Background Color', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {source:smallImage, style:styles.base}), 
React.createElement(Image, {
style:[
styles.base, 
styles.leftMargin, 
{backgroundColor:'rgba(0, 0, 100, 0.25)'}], 

source:smallImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {backgroundColor:'red'}], 
source:smallImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {backgroundColor:'black'}], 
source:smallImage})));}}, 





{
title:'Opacity', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {
style:[styles.base, {opacity:1}], 
source:fullImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {opacity:0.8}], 
source:fullImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {opacity:0.6}], 
source:fullImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {opacity:0.4}], 
source:fullImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {opacity:0.2}], 
source:fullImage}), 

React.createElement(Image, {
style:[styles.base, styles.leftMargin, {opacity:0}], 
source:fullImage})));}}, 





{
title:'Nesting', 
render:function(){
return (
React.createElement(Image, {
style:{width:60, height:60, backgroundColor:'transparent'}, 
source:fullImage}, 
React.createElement(Text, {style:styles.nestedText}, 'React')));}}, 






{
title:'Tint Color', 
description:'The `tintColor` style prop changes all the non-alpha ' + 
'pixels to the tint color.', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(Image, {
source:require('image!uie_thumb_normal'), 
style:[styles.icon, {tintColor:'blue'}]}), 

React.createElement(Image, {
source:require('image!uie_thumb_normal'), 
style:[styles.icon, styles.leftMargin, {tintColor:'green'}]}), 

React.createElement(Image, {
source:require('image!uie_thumb_normal'), 
style:[styles.icon, styles.leftMargin, {tintColor:'red'}]}), 

React.createElement(Image, {
source:require('image!uie_thumb_normal'), 
style:[styles.icon, styles.leftMargin, {tintColor:'black'}]})));}}, 





{
title:'Resize Mode', 
description:'The `resizeMode` style prop controls how the image is ' + 
'rendered within the frame.', 
render:function(){
return (
React.createElement(View, {style:styles.horizontal}, 
React.createElement(View, null, 
React.createElement(Text, {style:[styles.resizeModeText]}, 'Contain'), 


React.createElement(Image, {
style:styles.resizeMode, 
resizeMode:Image.resizeMode.contain, 
source:fullImage})), 


React.createElement(View, {style:styles.leftMargin}, 
React.createElement(Text, {style:[styles.resizeModeText]}, 'Cover'), 


React.createElement(Image, {
style:styles.resizeMode, 
resizeMode:Image.resizeMode.cover, 
source:fullImage})), 


React.createElement(View, {style:styles.leftMargin}, 
React.createElement(Text, {style:[styles.resizeModeText]}, 'Stretch'), 


React.createElement(Image, {
style:styles.resizeMode, 
resizeMode:Image.resizeMode.stretch, 
source:fullImage}))));}}, 






{
title:'Cap Insets', 
description:
'When the image is resized, the corners of the size specified ' + 
'by capInsets will stay a fixed size, but the center content and ' + 
'borders of the image will be stretched. This is useful for creating ' + 
'resizable rounded buttons, shadows, and other resizable assets.', 
render:function(){
return React.createElement(ImageCapInsetsExample, null);}}];




var fullImage={uri:'http://facebook.github.io/react/img/logo_og.png'};
var smallImage={uri:'http://facebook.github.io/react/img/logo_small.png'};

var styles=StyleSheet.create({
base:{
width:38, 
height:38}, 

leftMargin:{
marginLeft:10}, 

background:{
backgroundColor:'#222222'}, 

nestedText:{
marginLeft:12, 
marginTop:20, 
backgroundColor:'transparent', 
color:'white'}, 

resizeMode:{
width:90, 
height:60, 
borderWidth:0.5, 
borderColor:'black'}, 

resizeModeText:{
fontSize:11, 
marginBottom:3}, 

icon:{
width:15, 
height:15}, 

horizontal:{
flexDirection:'row'}});});
__d('ImageCapInsetsExample',["react-native/Libraries/react-native/react-native","image!story-background","image!story-background"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');var 

Image=



React.Image;var StyleSheet=React.StyleSheet;var Text=React.Text;var View=React.View;

var ImageCapInsetsExample=React.createClass({displayName:'ImageCapInsetsExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {style:styles.background}, 
React.createElement(Text, null, 'capInsets: none'), 


React.createElement(Image, {
source:require('image!story-background'), 
style:styles.storyBackground, 
capInsets:{left:0, right:0, bottom:0, top:0}})), 


React.createElement(View, {style:[styles.background, {paddingTop:10}]}, 
React.createElement(Text, null, 'capInsets: 15'), 


React.createElement(Image, {
source:require('image!story-background'), 
style:styles.storyBackground, 
capInsets:{left:15, right:15, bottom:15, top:15}}))));}});







var styles=StyleSheet.create({
background:{
backgroundColor:'#F6F6F6', 
justifyContent:'center', 
alignItems:'center'}, 

horizontal:{
flexDirection:'row'}, 

storyBackground:{
width:250, 
height:150, 
borderWidth:1, 
resizeMode:Image.resizeMode.stretch}, 

text:{
fontSize:13.5}});



module.exports = ImageCapInsetsExample;});
__d('image!story-background',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/story-background.imageset/story-background@2x.png","uri":"story-background","width":60,"height":60,"deprecated":true};});
__d('image!uie_thumb_normal',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/uie_thumb_normal.imageset/uie_thumb_normal@2x.png","uri":"uie_thumb_normal","width":17,"height":40,"deprecated":true};});
__d('image!uie_thumb_selected',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/uie_thumb_selected.imageset/uie_thumb_selected@2x.png","uri":"uie_thumb_selected","width":17,"height":40,"deprecated":true};});
__d('image!uie_comment_normal',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/uie_comment_normal.imageset/uie_comment_normal@2x.png","uri":"uie_comment_normal","width":17,"height":40,"deprecated":true};});
__d('image!uie_comment_highlighted',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/uie_comment_highlighted.imageset/uie_comment_highlighted@2x.png","uri":"uie_comment_highlighted","width":17,"height":40,"deprecated":true};});
__d('react-native/Examples/UIExplorer/ListViewExample',["react-native/Libraries/react-native/react-native","UIExplorerPage"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

Image=





React.Image;var ListView=React.ListView;var TouchableHighlight=React.TouchableHighlight;var StyleSheet=React.StyleSheet;var Text=React.Text;var View=React.View;

var UIExplorerPage=require('UIExplorerPage');

var ListViewSimpleExample=React.createClass({displayName:'ListViewSimpleExample', 
statics:{
title:'<ListView> - Simple', 
description:'Performant, scrollable list of data.'}, 


getInitialState:function(){
var ds=new ListView.DataSource({rowHasChanged:function(r1, r2){return r1 !== r2;}});
return {
dataSource:ds.cloneWithRows(this._genRows({}))};}, 



_pressData:{}, 

componentWillMount:function(){
this._pressData = {};}, 


render:function(){
return (
React.createElement(UIExplorerPage, {
title:this.props.navigator?null:'<ListView> - Simple', 
noSpacer:true, 
noScroll:true}, 
React.createElement(ListView, {
dataSource:this.state.dataSource, 
renderRow:this._renderRow})));}, 





_renderRow:function(rowData, sectionID, rowID){var _this=this;
var rowHash=Math.abs(hashCode(rowData));
var imgSource={
uri:THUMB_URLS[rowHash % THUMB_URLS.length]};

return (
React.createElement(TouchableHighlight, {onPress:function(){return _this._pressRow(rowID);}}, 
React.createElement(View, null, 
React.createElement(View, {style:styles.row}, 
React.createElement(Image, {style:styles.thumb, source:imgSource}), 
React.createElement(Text, {style:styles.text}, 
rowData + ' - ' + LOREM_IPSUM.substr(0, rowHash % 301 + 10))), 


React.createElement(View, {style:styles.separator}))));}, 





_genRows:function(pressData){
var dataBlob=[];
for(var ii=0; ii < 100; ii++) {
var pressedText=pressData[ii]?' (pressed)':'';
dataBlob.push('Row ' + ii + pressedText);}

return dataBlob;}, 


_pressRow:function(rowID){
this._pressData[rowID] = !this._pressData[rowID];
this.setState({dataSource:this.state.dataSource.cloneWithRows(
this._genRows(this._pressData))});}});




var THUMB_URLS=['https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851549_767334479959628_274486868_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851561_767334496626293_1958532586_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851579_767334503292959_179092627_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851589_767334513292958_1747022277_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851563_767334559959620_1193692107_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851593_767334566626286_1953955109_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851591_767334523292957_797560749_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851567_767334529959623_843148472_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851548_767334489959627_794462220_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851575_767334539959622_441598241_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851573_767334549959621_534583464_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851583_767334573292952_1519550680_n.png'];
var LOREM_IPSUM='Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare, an vix civibus corrumpit referrentur. Te nam case ludus inciderint, te mea facilisi adipiscing. Sea id integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo sapientem vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud modus, putant invidunt reprehendunt ne qui.';


var hashCode=function(str){
var hash=15;
for(var ii=str.length - 1; ii >= 0; ii--) {
hash = (hash << 5) - hash + str.charCodeAt(ii);}

return hash;};


var styles=StyleSheet.create({
row:{
flexDirection:'row', 
justifyContent:'center', 
padding:10, 
backgroundColor:'#F6F6F6'}, 

separator:{
height:1, 
backgroundColor:'#CCCCCC'}, 

thumb:{
width:64, 
height:64}, 

text:{
flex:1}});



module.exports = ListViewSimpleExample;});
__d('react-native/Examples/UIExplorer/ListViewPagingExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

Image=






React.Image;var LayoutAnimation=React.LayoutAnimation;var ListView=React.ListView;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableOpacity=React.TouchableOpacity;var View=React.View;

var PAGE_SIZE=4;
var THUMB_URLS=['https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851549_767334479959628_274486868_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851561_767334496626293_1958532586_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851579_767334503292959_179092627_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851589_767334513292958_1747022277_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851563_767334559959620_1193692107_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851593_767334566626286_1953955109_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851591_767334523292957_797560749_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851567_767334529959623_843148472_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851548_767334489959627_794462220_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851575_767334539959622_441598241_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851573_767334549959621_534583464_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851583_767334573292952_1519550680_n.png'];
var NUM_SECTIONS=100;
var NUM_ROWS_PER_SECTION=10;

var Thumb=React.createClass({displayName:'Thumb', 
getInitialState:function(){
return {thumbIndex:this._getThumbIdx(), dir:'row'};}, 

_getThumbIdx:function(){
return Math.floor(Math.random() * THUMB_URLS.length);}, 

_onPressThumb:function(){
var config=layoutAnimationConfigs[this.state.thumbIndex % layoutAnimationConfigs.length];
LayoutAnimation.configureNext(config);
this.setState({
thumbIndex:this._getThumbIdx(), 
dir:this.state.dir === 'row'?'column':'row'});}, 


render:function(){
return (
React.createElement(TouchableOpacity, {onPress:this._onPressThumb}, 
React.createElement(View, {style:[styles.buttonContents, {flexDirection:this.state.dir}]}, 
React.createElement(Image, {style:styles.img, source:{uri:THUMB_URLS[this.state.thumbIndex]}}), 
React.createElement(Image, {style:styles.img, source:{uri:THUMB_URLS[this.state.thumbIndex]}}), 
React.createElement(Image, {style:styles.img, source:{uri:THUMB_URLS[this.state.thumbIndex]}}), 
this.state.dir === 'column'?
React.createElement(Text, null, 'Oooo, look at this new text!  So awesome it may just be crazy. Let me keep typing here so it wraps at least one line.'):



React.createElement(Text, null))));}});







var ListViewPagingExample=React.createClass({displayName:'ListViewPagingExample', 
statics:{
title:'<ListView> - Paging', 
description:'Floating headers & layout animations.'}, 


getInitialState:function(){
var getSectionData=function(dataBlob, sectionID){
return dataBlob[sectionID];};

var getRowData=function(dataBlob, sectionID, rowID){
return dataBlob[rowID];};


var dataSource=new ListView.DataSource({
getRowData:getRowData, 
getSectionHeaderData:getSectionData, 
rowHasChanged:function(row1, row2){return row1 !== row2;}, 
sectionHeaderHasChanged:function(s1, s2){return s1 !== s2;}});


var dataBlob={};
var sectionIDs=[];
var rowIDs=[];
for(var ii=0; ii < NUM_SECTIONS; ii++) {
var sectionName='Section ' + ii;
sectionIDs.push(sectionName);
dataBlob[sectionName] = sectionName;
rowIDs[ii] = [];

for(var jj=0; jj < NUM_ROWS_PER_SECTION; jj++) {
var rowName='S' + ii + ', R' + jj;
rowIDs[ii].push(rowName);
dataBlob[rowName] = rowName;}}


return {
dataSource:dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs), 
headerPressCount:0};}, 



renderRow:function(rowData, sectionID, rowID){
return React.createElement(Thumb, {text:rowData});}, 


renderSectionHeader:function(sectionData, sectionID){
return (
React.createElement(View, {style:styles.section}, 
React.createElement(Text, {style:styles.text}, 
sectionData)));}, 





renderHeader:function(){
var headerLikeText=this.state.headerPressCount % 2?
React.createElement(View, null, React.createElement(Text, {style:styles.text}, '1 Like')):
null;
return (
React.createElement(TouchableOpacity, {onPress:this._onPressHeader}, 
React.createElement(View, {style:styles.header}, 
headerLikeText, 
React.createElement(View, null, 
React.createElement(Text, {style:styles.text}, 'Table Header (click me)')))));}, 








renderFooter:function(){
return (
React.createElement(View, {style:styles.header}, 
React.createElement(Text, {onPress:function(){return console.log('Footer!');}, style:styles.text}, 'Table Footer')));}, 






render:function(){
return (
React.createElement(ListView, {
style:styles.listview, 
dataSource:this.state.dataSource, 
onChangeVisibleRows:function(visibleRows, changedRows){return console.log({visibleRows:visibleRows, changedRows:changedRows});}, 
renderHeader:this.renderHeader, 
renderFooter:this.renderFooter, 
renderSectionHeader:this.renderSectionHeader, 
renderRow:this.renderRow, 
initialListSize:10, 
pageSize:PAGE_SIZE, 
scrollRenderAheadDistance:2000}));}, 




_onPressHeader:function(){
var config=layoutAnimationConfigs[Math.floor(this.state.headerPressCount / 2) % layoutAnimationConfigs.length];
LayoutAnimation.configureNext(config);
this.setState({headerPressCount:this.state.headerPressCount + 1});}});




var styles=StyleSheet.create({
listview:{
backgroundColor:'#B0C4DE'}, 

header:{
height:40, 
justifyContent:'center', 
alignItems:'center', 
backgroundColor:'#3B5998', 
flexDirection:'row'}, 

text:{
color:'white', 
paddingHorizontal:8}, 

rowText:{
color:'#888888'}, 

thumbText:{
fontSize:20, 
color:'#888888'}, 

buttonContents:{
flexDirection:'row', 
justifyContent:'center', 
alignItems:'center', 
marginHorizontal:5, 
marginVertical:3, 
padding:5, 
backgroundColor:'#EAEAEA', 
borderRadius:3, 
paddingVertical:10}, 

img:{
width:64, 
height:64, 
marginHorizontal:10}, 

section:{
flexDirection:'column', 
justifyContent:'center', 
alignItems:'flex-start', 
padding:6, 
backgroundColor:'#5890ff'}});



var animations={
layout:{
spring:{
duration:750, 
create:{
duration:300, 
type:LayoutAnimation.Types.easeInEaseOut, 
property:LayoutAnimation.Properties.opacity}, 

update:{
type:LayoutAnimation.Types.spring, 
springDamping:0.4}}, 


easeInEaseOut:{
duration:300, 
create:{
type:LayoutAnimation.Types.easeInEaseOut, 
property:LayoutAnimation.Properties.scaleXY}, 

update:{
delay:100, 
type:LayoutAnimation.Types.easeInEaseOut}}}};





var layoutAnimationConfigs=[
animations.layout.spring, 
animations.layout.easeInEaseOut];


module.exports = ListViewPagingExample;});
__d('react-native/Examples/UIExplorer/MapViewExample',["react-native/Libraries/react-native/react-native","StyleSheet"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');
var StyleSheet=require('StyleSheet');var 

MapView=



React.MapView;var Text=React.Text;var TextInput=React.TextInput;var View=React.View;

var regionText={
latitude:'0', 
longitude:'0', 
latitudeDelta:'0', 
longitudeDelta:'0'};


var MapRegionInput=React.createClass({displayName:'MapRegionInput', 

propTypes:{
region:React.PropTypes.shape({
latitude:React.PropTypes.number.isRequired, 
longitude:React.PropTypes.number.isRequired, 
latitudeDelta:React.PropTypes.number.isRequired, 
longitudeDelta:React.PropTypes.number.isRequired}), 

onChange:React.PropTypes.func.isRequired}, 


getInitialState:function(){
return {
region:{
latitude:0, 
longitude:0, 
latitudeDelta:0, 
longitudeDelta:0}};}, 




componentWillReceiveProps:function(nextProps){
this.setState({
region:nextProps.region || this.getInitialState().region});}, 



render:function(){
var region=this.state.region || this.getInitialState().region;
return (
React.createElement(View, null, 
React.createElement(View, {style:styles.row}, 
React.createElement(Text, null, 
'Latitude'), 

React.createElement(TextInput, {
value:'' + region.latitude, 
style:styles.textInput, 
onChange:this._onChangeLatitude, 
selectTextOnFocus:true})), 


React.createElement(View, {style:styles.row}, 
React.createElement(Text, null, 
'Longitude'), 

React.createElement(TextInput, {
value:'' + region.longitude, 
style:styles.textInput, 
onChange:this._onChangeLongitude, 
selectTextOnFocus:true})), 


React.createElement(View, {style:styles.row}, 
React.createElement(Text, null, 
'Latitude delta'), 

React.createElement(TextInput, {
value:'' + region.latitudeDelta, 
style:styles.textInput, 
onChange:this._onChangeLatitudeDelta, 
selectTextOnFocus:true})), 


React.createElement(View, {style:styles.row}, 
React.createElement(Text, null, 
'Longitude delta'), 

React.createElement(TextInput, {
value:'' + region.longitudeDelta, 
style:styles.textInput, 
onChange:this._onChangeLongitudeDelta, 
selectTextOnFocus:true})), 


React.createElement(View, {style:styles.changeButton}, 
React.createElement(Text, {onPress:this._change}, 
'Change'))));}, 






_onChangeLatitude:function(e){
regionText.latitude = e.nativeEvent.text;}, 


_onChangeLongitude:function(e){
regionText.longitude = e.nativeEvent.text;}, 


_onChangeLatitudeDelta:function(e){
regionText.latitudeDelta = e.nativeEvent.text;}, 


_onChangeLongitudeDelta:function(e){
regionText.longitudeDelta = e.nativeEvent.text;}, 


_change:function(){
this.setState({
latitude:parseFloat(regionText.latitude), 
longitude:parseFloat(regionText.longitude), 
latitudeDelta:parseFloat(regionText.latitudeDelta), 
longitudeDelta:parseFloat(regionText.longitudeDelta)});

this.props.onChange(this.state.region);}});




var MapViewExample=React.createClass({displayName:'MapViewExample', 

getInitialState:function(){
return {
mapRegion:null, 
mapRegionInput:null, 
annotations:null, 
isFirstLoad:true};}, 



render:function(){
return (
React.createElement(View, null, 
React.createElement(MapView, {
style:styles.map, 
onRegionChange:this._onRegionChange, 
onRegionChangeComplete:this._onRegionChangeComplete, 
region:this.state.mapRegion || undefined, 
annotations:this.state.annotations || undefined}), 

React.createElement(MapRegionInput, {
onChange:this._onRegionInputChanged, 
region:this.state.mapRegionInput || undefined})));}, 





_getAnnotations:function(region){
return [{
longitude:region.longitude, 
latitude:region.latitude, 
title:'You Are Here'}];}, 



_onRegionChange:function(region){
this.setState({
mapRegionInput:region});}, 



_onRegionChangeComplete:function(region){
if(this.state.isFirstLoad){
this.setState({
mapRegionInput:region, 
annotations:this._getAnnotations(region), 
isFirstLoad:false});}}, 




_onRegionInputChanged:function(region){
this.setState({
mapRegion:region, 
mapRegionInput:region, 
annotations:this._getAnnotations(region)});}});





var styles=StyleSheet.create({
map:{
height:150, 
margin:10, 
borderWidth:1, 
borderColor:'#000000'}, 

row:{
flexDirection:'row', 
justifyContent:'space-between'}, 

textInput:{
width:150, 
height:20, 
borderWidth:0.5, 
borderColor:'#aaaaaa', 
fontSize:13, 
padding:4}, 

changeButton:{
alignSelf:'center', 
marginTop:5, 
padding:3, 
borderWidth:0.5, 
borderColor:'#777777'}});



exports.title = '<MapView>';
exports.description = 'Base component to display maps';
exports.examples = [
{
title:'Map', 
render:function(){return React.createElement(MapViewExample, null);}}, 

{
title:'Map shows user location', 
render:function(){
return React.createElement(MapView, {style:styles.map, showsUserLocation:true});}}];});
__d('react-native/Examples/UIExplorer/Navigator/NavigatorExample',["react-native/Libraries/react-native/react-native","react-native/Examples/UIExplorer/Navigator/BreadcrumbNavSample","react-native/Examples/UIExplorer/Navigator/NavigationBarSample","react-native/Examples/UIExplorer/Navigator/JumpingNavSample"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}














var React=require('react-native/Libraries/react-native/react-native');var 

Navigator=





React.Navigator;var PixelRatio=React.PixelRatio;var ScrollView=React.ScrollView;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;
var BreadcrumbNavSample=require('react-native/Examples/UIExplorer/Navigator/BreadcrumbNavSample');
var NavigationBarSample=require('react-native/Examples/UIExplorer/Navigator/NavigationBarSample');
var JumpingNavSample=require('react-native/Examples/UIExplorer/Navigator/JumpingNavSample');var 

NavButton=(function(_React$Component){function NavButton(){_classCallCheck(this, NavButton);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(NavButton, _React$Component);_createClass(NavButton, [{key:'render', value:
function render(){
return (
React.createElement(TouchableHighlight, {
style:styles.button, 
underlayColor:'#B5B5B5', 
onPress:this.props.onPress}, 
React.createElement(Text, {style:styles.buttonText}, this.props.text)));}}]);return NavButton;})(React.Component);var 





NavMenu=(function(_React$Component2){function NavMenu(){_classCallCheck(this, NavMenu);if(_React$Component2 != null){_React$Component2.apply(this, arguments);}}_inherits(NavMenu, _React$Component2);_createClass(NavMenu, [{key:'render', value:
function render(){var _this=this;
return (
React.createElement(ScrollView, {style:styles.scene}, 
React.createElement(Text, {style:styles.messageText}, this.props.message), 
React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.push({
message:'Swipe right to dismiss', 
sceneConfig:Navigator.SceneConfigs.FloatFromRight});}, 


text:'Float in from right'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.push({
message:'Swipe down to dismiss', 
sceneConfig:Navigator.SceneConfigs.FloatFromBottom});}, 


text:'Float in from bottom'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.pop();}, 

text:'Pop'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.popToTop();}, 

text:'Pop to top'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.push({id:'navbar'});}, 

text:'Navbar Example'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.push({id:'jumping'});}, 

text:'Jumping Example'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.push({id:'breadcrumbs'});}, 

text:'Breadcrumbs Example'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.onExampleExit();}, 

text:'Exit <Navigator> Example'})));}}]);return NavMenu;})(React.Component);






var TabBarExample=React.createClass({displayName:'TabBarExample', 

statics:{
title:'<Navigator>', 
description:'JS-implemented navigation'}, 


renderScene:function(route, nav){
switch(route.id){
case 'navbar':
return React.createElement(NavigationBarSample, {navigator:nav});
case 'breadcrumbs':
return React.createElement(BreadcrumbNavSample, {navigator:nav});
case 'jumping':
return React.createElement(JumpingNavSample, {navigator:nav});
default:
return (
React.createElement(NavMenu, {
message:route.message, 
navigator:nav, 
onExampleExit:this.props.onExampleExit}));}}, 





render:function(){
return (
React.createElement(Navigator, {
style:styles.container, 
initialRoute:{message:'First Scene'}, 
renderScene:this.renderScene, 
configureScene:function(route){
if(route.sceneConfig){
return route.sceneConfig;}

return Navigator.SceneConfigs.FloatFromBottom;}}));}});







var styles=StyleSheet.create({
messageText:{
fontSize:17, 
fontWeight:'500', 
padding:15, 
marginTop:50, 
marginLeft:15}, 

container:{
flex:1}, 

button:{
backgroundColor:'white', 
padding:15, 
borderBottomWidth:1 / PixelRatio.get(), 
borderBottomColor:'#CDCDCD'}, 

buttonText:{
fontSize:17, 
fontWeight:'500'}, 

scene:{
flex:1, 
paddingTop:20, 
backgroundColor:'#EAEAEA'}});



TabBarExample.external = true;

module.exports = TabBarExample;});
__d('react-native/Examples/UIExplorer/Navigator/BreadcrumbNavSample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}














var React=require('react-native/Libraries/react-native/react-native');var 

PixelRatio=







React.PixelRatio;var Navigator=React.Navigator;var StyleSheet=React.StyleSheet;var ScrollView=React.ScrollView;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var TouchableOpacity=React.TouchableOpacity;var View=React.View;

var _getRandomRoute=function(){
return {
title:'#' + Math.ceil(Math.random() * 1000)};};var 



NavButton=(function(_React$Component){function NavButton(){_classCallCheck(this, NavButton);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(NavButton, _React$Component);_createClass(NavButton, [{key:'render', value:
function render(){
return (
React.createElement(TouchableHighlight, {
style:styles.button, 
underlayColor:'#B5B5B5', 
onPress:this.props.onPress}, 
React.createElement(Text, {style:styles.buttonText}, this.props.text)));}}]);return NavButton;})(React.Component);





var BreadcrumbNavSample=React.createClass({displayName:'BreadcrumbNavSample', 

componentWillMount:function(){
this._navBarRouteMapper = {
rightContentForRoute:function(route, navigator){
return null;}, 

titleContentForRoute:function(route, navigator){
return (
React.createElement(TouchableOpacity, {
onPress:function(){return navigator.push(_getRandomRoute());}}, 
React.createElement(View, null, 
React.createElement(Text, {style:styles.titleText}, route.title))));}, 




iconForRoute:function(route, navigator){
return (
React.createElement(TouchableOpacity, {onPress:function(){
navigator.popToRoute(route);}}, 

React.createElement(View, {style:styles.crumbIconPlaceholder})));}, 



separatorForRoute:function(route, navigator){
return (
React.createElement(TouchableOpacity, {onPress:navigator.pop}, 
React.createElement(View, {style:styles.crumbSeparatorPlaceholder})));}};}, 






_renderScene:function(route, navigator){var _this=this;
return (
React.createElement(ScrollView, {style:styles.scene}, 
React.createElement(NavButton, {
onPress:function(){navigator.push(_getRandomRoute());}, 
text:'Push'}), 

React.createElement(NavButton, {
onPress:function(){navigator.immediatelyResetRouteStack([_getRandomRoute(), _getRandomRoute()]);}, 
text:'Reset w/ 2 scenes'}), 

React.createElement(NavButton, {
onPress:function(){navigator.popToTop();}, 
text:'Pop to top'}), 

React.createElement(NavButton, {
onPress:function(){navigator.replace(_getRandomRoute());}, 
text:'Replace'}), 

React.createElement(NavButton, {
onPress:function(){_this.props.navigator.pop();}, 
text:'Close breadcrumb example'})));}, 





render:function(){
return (
React.createElement(Navigator, {
style:styles.container, 
initialRoute:_getRandomRoute(), 
renderScene:this._renderScene, 
navigationBar:
React.createElement(Navigator.BreadcrumbNavigationBar, {
routeMapper:this._navBarRouteMapper})}));}});










var styles=StyleSheet.create({
scene:{
paddingTop:50, 
flex:1}, 

button:{
backgroundColor:'white', 
padding:15, 
borderBottomWidth:1 / PixelRatio.get(), 
borderBottomColor:'#CDCDCD'}, 

buttonText:{
fontSize:17, 
fontWeight:'500'}, 

container:{
overflow:'hidden', 
backgroundColor:'#dddddd', 
flex:1}, 

titleText:{
fontSize:18, 
color:'#666666', 
textAlign:'center', 
fontWeight:'bold', 
lineHeight:32}, 

crumbIconPlaceholder:{
flex:1, 
backgroundColor:'#666666'}, 

crumbSeparatorPlaceholder:{
flex:1, 
backgroundColor:'#aaaaaa'}});



module.exports = BreadcrumbNavSample;});
__d('react-native/Examples/UIExplorer/Navigator/NavigationBarSample',["react-native/Libraries/react-native/react-native","cssVar"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}















var React=require('react-native/Libraries/react-native/react-native');var 

PixelRatio=







React.PixelRatio;var Navigator=React.Navigator;var ScrollView=React.ScrollView;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var TouchableOpacity=React.TouchableOpacity;var View=React.View;

var cssVar=require('cssVar');var 

NavButton=(function(_React$Component){function NavButton(){_classCallCheck(this, NavButton);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(NavButton, _React$Component);_createClass(NavButton, [{key:'render', value:
function render(){
return (
React.createElement(TouchableHighlight, {
style:styles.button, 
underlayColor:'#B5B5B5', 
onPress:this.props.onPress}, 
React.createElement(Text, {style:styles.buttonText}, this.props.text)));}}]);return NavButton;})(React.Component);





var NavigationBarRouteMapper={

LeftButton:function(route, navigator, index, navState){
if(index === 0){
return null;}


var previousRoute=navState.routeStack[index - 1];
return (
React.createElement(TouchableOpacity, {
onPress:function(){return navigator.pop();}}, 
React.createElement(View, {style:styles.navBarLeftButton}, 
React.createElement(Text, {style:[styles.navBarText, styles.navBarButtonText]}, 
previousRoute.title))));}, 






RightButton:function(route, navigator, index, navState){
return (
React.createElement(TouchableOpacity, {
onPress:function(){return navigator.push(newRandomRoute());}}, 
React.createElement(View, {style:styles.navBarRightButton}, 
React.createElement(Text, {style:[styles.navBarText, styles.navBarButtonText]}, 'Next'))));}, 







Title:function(route, navigator, index, navState){
return (
React.createElement(Text, {style:[styles.navBarText, styles.navBarTitleText]}, 
route.title, ' [', index, ']'));}};






function newRandomRoute(){
return {
title:'#' + Math.ceil(Math.random() * 1000)};}



var NavigationBarSample=React.createClass({displayName:'NavigationBarSample', 

render:function(){var _this=this;
return (
React.createElement(Navigator, {
debugOverlay:false, 
style:styles.appContainer, 
initialRoute:newRandomRoute(), 
renderScene:function(route, navigator){return (
React.createElement(ScrollView, {style:styles.scene}, 
React.createElement(Text, {style:styles.messageText}, route.content), 
React.createElement(NavButton, {
onPress:function(){
navigator.immediatelyResetRouteStack([
newRandomRoute(), 
newRandomRoute(), 
newRandomRoute()]);}, 


text:'Reset w/ 3 scenes'}), 

React.createElement(NavButton, {
onPress:function(){
_this.props.navigator.pop();}, 

text:'Exit NavigationBar Example'})));}, 



navigationBar:
React.createElement(Navigator.NavigationBar, {
routeMapper:NavigationBarRouteMapper, 
style:styles.navBar})}));}});








var styles=StyleSheet.create({
messageText:{
fontSize:17, 
fontWeight:'500', 
padding:15, 
marginTop:50, 
marginLeft:15}, 

button:{
backgroundColor:'white', 
padding:15, 
borderBottomWidth:1 / PixelRatio.get(), 
borderBottomColor:'#CDCDCD'}, 

buttonText:{
fontSize:17, 
fontWeight:'500'}, 

navBar:{
backgroundColor:'white'}, 

navBarText:{
fontSize:16, 
marginVertical:10}, 

navBarTitleText:{
color:cssVar('fbui-bluegray-60'), 
fontWeight:'500', 
marginVertical:9}, 

navBarLeftButton:{
paddingLeft:10}, 

navBarRightButton:{
paddingRight:10}, 

navBarButtonText:{
color:cssVar('fbui-accent-blue')}, 

scene:{
flex:1, 
paddingTop:20, 
backgroundColor:'#EAEAEA'}});



module.exports = NavigationBarSample;});
__d('cssVar',["invariant","CSSVarConfig"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';







var invariant=require('invariant');
var CSSVarConfig=require('CSSVarConfig');

var cssVar=function(key){
invariant(CSSVarConfig[key], 'invalid css variable ' + key);

return CSSVarConfig[key];};


module.exports = cssVar;});
__d('CSSVarConfig',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';








module.exports = {
'fbui-accent-blue':'#5890ff', 
'fbui-blue-90':'#4e69a2', 
'fbui-blue-80':'#627aad', 
'fbui-blue-70':'#758ab7', 
'fbui-blue-60':'#899bc1', 
'fbui-blue-50':'#9daccb', 
'fbui-blue-40':'#b1bdd6', 
'fbui-blue-30':'#c4cde0', 
'fbui-blue-20':'#d8deea', 
'fbui-blue-10':'#ebeef4', 
'fbui-blue-5':'#f5f7fa', 
'fbui-blue-2':'#fbfcfd', 
'fbui-blueblack-90':'#06090f', 
'fbui-blueblack-80':'#0c121e', 
'fbui-blueblack-70':'#121b2e', 
'fbui-blueblack-60':'#18243d', 
'fbui-blueblack-50':'#1e2d4c', 
'fbui-blueblack-40':'#23355b', 
'fbui-blueblack-30':'#293e6b', 
'fbui-blueblack-20':'#2f477a', 
'fbui-blueblack-10':'#355089', 
'fbui-blueblack-5':'#385490', 
'fbui-blueblack-2':'#3a5795', 
'fbui-bluegray-90':'#080a10', 
'fbui-bluegray-80':'#141823', 
'fbui-bluegray-70':'#232937', 
'fbui-bluegray-60':'#373e4d', 
'fbui-bluegray-50':'#4e5665', 
'fbui-bluegray-40':'#6a7180', 
'fbui-bluegray-30':'#9197a3', 
'fbui-bluegray-20':'#bdc1c9', 
'fbui-bluegray-10':'#dcdee3', 
'fbui-bluegray-5':'#e9eaed', 
'fbui-bluegray-2':'#f6f7f8', 
'fbui-gray-90':'#191919', 
'fbui-gray-80':'#333333', 
'fbui-gray-70':'#4c4c4c', 
'fbui-gray-60':'#666666', 
'fbui-gray-50':'#7f7f7f', 
'fbui-gray-40':'#999999', 
'fbui-gray-30':'#b2b2b2', 
'fbui-gray-20':'#cccccc', 
'fbui-gray-10':'#e5e5e5', 
'fbui-gray-5':'#f2f2f2', 
'fbui-gray-2':'#fafafa', 
'fbui-red':'#da2929', 
'fbui-error':'#ce0d24', 
'x-mobile-dark-text':'#4e5665', 
'x-mobile-medium-text':'#6a7180', 
'x-mobile-light-text':'#9197a3', 
'x-mobile-base-wash':'#dcdee3'};});
__d('react-native/Examples/UIExplorer/Navigator/JumpingNavSample',["react-native/Libraries/react-native/react-native","image!tabnav_notification","image!tabnav_list","image!tabnav_settings"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}














var React=require('react-native/Libraries/react-native/react-native');var 

Navigator=







React.Navigator;var PixelRatio=React.PixelRatio;var StyleSheet=React.StyleSheet;var ScrollView=React.ScrollView;var TabBarIOS=React.TabBarIOS;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var View=React.View;

var _getRandomRoute=function(){
return {
randNumber:Math.ceil(Math.random() * 1000)};};var 



NavButton=(function(_React$Component){function NavButton(){_classCallCheck(this, NavButton);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(NavButton, _React$Component);_createClass(NavButton, [{key:'render', value:
function render(){
return (
React.createElement(TouchableHighlight, {
style:styles.button, 
underlayColor:'#B5B5B5', 
onPress:this.props.onPress}, 
React.createElement(Text, {style:styles.buttonText}, this.props.text)));}}]);return NavButton;})(React.Component);





var ROUTE_STACK=[
_getRandomRoute(), 
_getRandomRoute(), 
_getRandomRoute()];

var INIT_ROUTE_INDEX=1;var 

JumpingNavBar=(function(_React$Component2){
function JumpingNavBar(props){_classCallCheck(this, JumpingNavBar);
_get(Object.getPrototypeOf(JumpingNavBar.prototype), 'constructor', this).call(this, props);
this.state = {
tabIndex:props.initTabIndex};}_inherits(JumpingNavBar, _React$Component2);_createClass(JumpingNavBar, [{key:'handleWillFocus', value:


function handleWillFocus(route){
var tabIndex=ROUTE_STACK.indexOf(route);
this.setState({tabIndex:tabIndex});}}, {key:'render', value:

function render(){var _this=this;
return (
React.createElement(View, {style:styles.tabs}, 
React.createElement(TabBarIOS, null, 
React.createElement(TabBarIOS.Item, {
icon:require('image!tabnav_notification'), 
selected:this.state.tabIndex === 0, 
onPress:function(){
_this.props.onTabIndex(0);
_this.setState({tabIndex:0});}}, 

React.createElement(View, null)), 

React.createElement(TabBarIOS.Item, {
icon:require('image!tabnav_list'), 
selected:this.state.tabIndex === 1, 
onPress:function(){
_this.props.onTabIndex(1);
_this.setState({tabIndex:1});}}, 

React.createElement(View, null)), 

React.createElement(TabBarIOS.Item, {
icon:require('image!tabnav_settings'), 
selected:this.state.tabIndex === 2, 
onPress:function(){
_this.props.onTabIndex(2);
_this.setState({tabIndex:2});}}, 

React.createElement(View, null)))));}}]);return JumpingNavBar;})(React.Component);







var JumpingNavSample=React.createClass({displayName:'JumpingNavSample', 
render:function(){var _this2=this;
return (
React.createElement(Navigator, {
debugOverlay:false, 
style:styles.appContainer, 
ref:function(navigator){
_this2._navigator = navigator;}, 

initialRoute:ROUTE_STACK[INIT_ROUTE_INDEX], 
initialRouteStack:ROUTE_STACK, 
renderScene:this.renderScene, 
configureScene:function(){return _extends({}, 
Navigator.SceneConfigs.HorizontalSwipeJump);}, 

navigationBar:
React.createElement(JumpingNavBar, {
ref:function(navBar){_this2.navBar = navBar;}, 
initTabIndex:INIT_ROUTE_INDEX, 
routeStack:ROUTE_STACK, 
onTabIndex:function(index){
_this2._navigator.jumpTo(ROUTE_STACK[index]);}})}));}, 







renderScene:function(route, navigator){var _this3=this;
var backBtn;
var forwardBtn;
if(ROUTE_STACK.indexOf(route) !== 0){
backBtn = 
React.createElement(NavButton, {
onPress:function(){
navigator.jumpBack();}, 

text:'jumpBack'});}



if(ROUTE_STACK.indexOf(route) !== ROUTE_STACK.length - 1){
forwardBtn = 
React.createElement(NavButton, {
onPress:function(){
navigator.jumpForward();}, 

text:'jumpForward'});}



return (
React.createElement(ScrollView, {style:styles.scene}, 
React.createElement(Text, {style:styles.messageText}, '#', route.randNumber), 
backBtn, 
forwardBtn, 
React.createElement(NavButton, {
onPress:function(){
navigator.jumpTo(ROUTE_STACK[1]);}, 

text:'jumpTo middle route'}), 

React.createElement(NavButton, {
onPress:function(){
_this3.props.navigator.pop();}, 

text:'Exit Navigation Example'}), 

React.createElement(NavButton, {
onPress:function(){
_this3.props.navigator.push({
message:'Came from jumping example'});}, 


text:'Nav Menu'})));}});






var styles=StyleSheet.create({
button:{
backgroundColor:'white', 
padding:15, 
borderBottomWidth:1 / PixelRatio.get(), 
borderBottomColor:'#CDCDCD'}, 

buttonText:{
fontSize:17, 
fontWeight:'500'}, 

appContainer:{
overflow:'hidden', 
backgroundColor:'#dddddd', 
flex:1}, 

messageText:{
fontSize:17, 
fontWeight:'500', 
padding:15, 
marginTop:50, 
marginLeft:15}, 

scene:{
flex:1, 
paddingTop:20, 
backgroundColor:'#EAEAEA'}, 

tabs:{
height:50}});



module.exports = JumpingNavSample;});
__d('image!tabnav_notification',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/tabnav_notification.imageset/tabnav_notification@3x.png","uri":"tabnav_notification","width":24,"height":24,"deprecated":true};});
__d('image!tabnav_list',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/tabnav_list.imageset/tabnav_list@3x.png","uri":"tabnav_list","width":24,"height":24,"deprecated":true};});
__d('image!tabnav_settings',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/tabnav_settings.imageset/tabnav_settings@3x.png","uri":"tabnav_settings","width":24,"height":24,"deprecated":true};});
__d('react-native/Examples/UIExplorer/NavigatorIOSColorsExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var React=require('react-native/Libraries/react-native/react-native');var 

NavigatorIOS=




React.NavigatorIOS;var StatusBarIOS=React.StatusBarIOS;var StyleSheet=React.StyleSheet;var Text=React.Text;var View=React.View;

var EmptyPage=React.createClass({displayName:'EmptyPage', 

render:function(){
return (
React.createElement(View, {style:styles.emptyPage}, 
React.createElement(Text, {style:styles.emptyPageText}, 
this.props.text)));}});







var NavigatorIOSColors=React.createClass({displayName:'NavigatorIOSColors', 

statics:{
title:'<NavigatorIOS> - Custom', 
description:'iOS navigation with custom nav bar colors'}, 


render:function(){var _this=this;

StatusBarIOS.setStyle('light-content');

return (
React.createElement(NavigatorIOS, {
style:styles.container, 
initialRoute:{
component:EmptyPage, 
title:'<NavigatorIOS>', 
rightButtonTitle:'Done', 
onRightButtonPress:function(){
StatusBarIOS.setStyle('default');
_this.props.onExampleExit();}, 

passProps:{
text:'The nav bar has custom colors with tintColor, ' + 
'barTintColor and titleTextColor props.'}}, 


tintColor:'#FFFFFF', 
barTintColor:'#183E63', 
titleTextColor:'#FFFFFF'}));}});






var styles=StyleSheet.create({
container:{
flex:1}, 

emptyPage:{
flex:1, 
paddingTop:64}, 

emptyPageText:{
margin:10}});



NavigatorIOSColors.external = true;

module.exports = NavigatorIOSColors;});
__d('react-native/Examples/UIExplorer/NavigatorIOSExample',["react-native/Libraries/react-native/react-native","react-native/Examples/UIExplorer/ViewExample","createExamplePage","image!NavBarButtonPlus"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');
var ViewExample=require('react-native/Examples/UIExplorer/ViewExample');
var createExamplePage=require('createExamplePage');var 

AlertIOS=






React.AlertIOS;var PixelRatio=React.PixelRatio;var ScrollView=React.ScrollView;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var View=React.View;

var EmptyPage=React.createClass({displayName:'EmptyPage', 

render:function(){
return (
React.createElement(View, {style:styles.emptyPage}, 
React.createElement(Text, {style:styles.emptyPageText}, 
this.props.text)));}});







var NavigatorIOSExample=React.createClass({displayName:'NavigatorIOSExample', 

statics:{
title:'<NavigatorIOS>', 
description:'iOS navigation capabilities'}, 


render:function(){var _this=this;
var recurseTitle='Recurse Navigation';
if(!this.props.topExampleRoute){
recurseTitle += ' - more examples here';}

return (
React.createElement(ScrollView, {style:styles.list}, 
React.createElement(View, {style:styles.line}), 
React.createElement(View, {style:styles.group}, 
React.createElement(View, {style:styles.row}, 
React.createElement(Text, {style:styles.rowNote}, 'See <UIExplorerApp> for top-level usage.'))), 




React.createElement(View, {style:styles.line}), 
React.createElement(View, {style:styles.groupSpace}), 
React.createElement(View, {style:styles.line}), 
React.createElement(View, {style:styles.group}, 
this._renderRow(recurseTitle, function(){
_this.props.navigator.push({
title:NavigatorIOSExample.title, 
component:NavigatorIOSExample, 
backButtonTitle:'Custom Back', 
passProps:{topExampleRoute:_this.props.topExampleRoute || _this.props.route}});}), 


this._renderRow('Push View Example', function(){
_this.props.navigator.push({
title:'Very Long Custom View Example Title', 
component:createExamplePage(null, ViewExample)});}), 


this._renderRow('Custom Right Button', function(){
_this.props.navigator.push({
title:NavigatorIOSExample.title, 
component:EmptyPage, 
rightButtonTitle:'Cancel', 
onRightButtonPress:function(){return _this.props.navigator.pop();}, 
passProps:{
text:'This page has a right button in the nav bar'}});}), 



this._renderRow('Custom Left & Right Icons', function(){
_this.props.navigator.push({
title:NavigatorIOSExample.title, 
component:EmptyPage, 
leftButtonTitle:'Custom Left', 
onLeftButtonPress:function(){return _this.props.navigator.pop();}, 
rightButtonIcon:require('image!NavBarButtonPlus'), 
onRightButtonPress:function(){
AlertIOS.alert(
'Bar Button Action', 
'Recognized a tap on the bar button icon', 
[
{
text:'OK', 
onPress:function(){return console.log('Tapped OK');}}]);}, 




passProps:{
text:'This page has an icon for the right button in the nav bar'}});}), 



this._renderRow('Pop', function(){
_this.props.navigator.pop();}), 

this._renderRow('Pop to top', function(){
_this.props.navigator.popToTop();}), 

this._renderRow('Replace here', function(){
var prevRoute=_this.props.route;
_this.props.navigator.replace({
title:'New Navigation', 
component:EmptyPage, 
rightButtonTitle:'Undo', 
onRightButtonPress:function(){return _this.props.navigator.replace(prevRoute);}, 
passProps:{
text:'The component is replaced, but there is currently no ' + 
'way to change the right button or title of the current route'}});}), 



this._renderReplacePrevious(), 
this._renderReplacePreviousAndPop(), 
this._renderPopToTopNavExample()), 

React.createElement(View, {style:styles.line})));}, 




_renderPopToTopNavExample:function(){var _this2=this;
if(!this.props.topExampleRoute){
return null;}

return this._renderRow('Pop to top NavigatorIOSExample', function(){
_this2.props.navigator.popToRoute(_this2.props.topExampleRoute);});}, 



_renderReplacePrevious:function(){var _this3=this;
if(!this.props.topExampleRoute){

return null;}

return this._renderRow('Replace previous', function(){
_this3.props.navigator.replacePrevious({
title:'Replaced', 
component:EmptyPage, 
passProps:{
text:'This is a replaced "previous" page'}, 

wrapperStyle:styles.customWrapperStyle});});}, 




_renderReplacePreviousAndPop:function(){var _this4=this;
if(!this.props.topExampleRoute){

return null;}

return this._renderRow('Replace previous and pop', function(){
_this4.props.navigator.replacePreviousAndPop({
title:'Replaced and Popped', 
component:EmptyPage, 
passProps:{
text:'This is a replaced "previous" page'}, 

wrapperStyle:styles.customWrapperStyle});});}, 




_renderRow:function(title, onPress){
return (
React.createElement(View, null, 
React.createElement(TouchableHighlight, {onPress:onPress}, 
React.createElement(View, {style:styles.row}, 
React.createElement(Text, {style:styles.rowText}, 
title))), 



React.createElement(View, {style:styles.separator})));}});





var styles=StyleSheet.create({
customWrapperStyle:{
backgroundColor:'#bbdddd'}, 

emptyPage:{
flex:1, 
paddingTop:64}, 

emptyPageText:{
margin:10}, 

list:{
backgroundColor:'#eeeeee', 
marginTop:10}, 

group:{
backgroundColor:'white'}, 

groupSpace:{
height:15}, 

line:{
backgroundColor:'#bbbbbb', 
height:1 / PixelRatio.get()}, 

row:{
backgroundColor:'white', 
justifyContent:'center', 
paddingHorizontal:15, 
paddingVertical:15}, 

separator:{
height:1 / PixelRatio.get(), 
backgroundColor:'#bbbbbb', 
marginLeft:15}, 

rowNote:{
fontSize:17}, 

rowText:{
fontSize:17, 
fontWeight:'500'}});



module.exports = NavigatorIOSExample;});
__d('image!NavBarButtonPlus',[],function(global, require, requireDynamic, requireLazy, module, exports) {  module.exports = {"__packager_asset":true,"isStatic":true,"path":"/Users/louis/Downloads/react-native-master/Examples/UIExplorer/UIExplorer/Images.xcassets/NavBarButtonPlus.imageset/NavBarButtonPlus@3x.png","uri":"NavBarButtonPlus","width":17,"height":17,"deprecated":true};});
__d('react-native/Examples/UIExplorer/PickerIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

PickerIOS=


React.PickerIOS;var Text=React.Text;var View=React.View;

var PickerItemIOS=PickerIOS.Item;

var CAR_MAKES_AND_MODELS={
amc:{
name:'AMC', 
models:['AMX', 'Concord', 'Eagle', 'Gremlin', 'Matador', 'Pacer']}, 

alfa:{
name:'Alfa-Romeo', 
models:['159', '4C', 'Alfasud', 'Brera', 'GTV6', 'Giulia', 'MiTo', 'Spider']}, 

aston:{
name:'Aston Martin', 
models:['DB5', 'DB9', 'DBS', 'Rapide', 'Vanquish', 'Vantage']}, 

audi:{
name:'Audi', 
models:['90', '4000', '5000', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q5', 'Q7']}, 

austin:{
name:'Austin', 
models:['America', 'Maestro', 'Maxi', 'Mini', 'Montego', 'Princess']}, 

borgward:{
name:'Borgward', 
models:['Hansa', 'Isabella', 'P100']}, 

buick:{
name:'Buick', 
models:['Electra', 'LaCrosse', 'LeSabre', 'Park Avenue', 'Regal', 
'Roadmaster', 'Skylark']}, 

cadillac:{
name:'Cadillac', 
models:['Catera', 'Cimarron', 'Eldorado', 'Fleetwood', 'Sedan de Ville']}, 

chevrolet:{
name:'Chevrolet', 
models:['Astro', 'Aveo', 'Bel Air', 'Captiva', 'Cavalier', 'Chevelle', 
'Corvair', 'Corvette', 'Cruze', 'Nova', 'SS', 'Vega', 'Volt']}};



var PickerExample=React.createClass({displayName:'PickerExample', 
getInitialState:function(){
return {
carMake:'cadillac', 
modelIndex:3};}, 



render:function(){var _this=this;
var make=CAR_MAKES_AND_MODELS[this.state.carMake];
var selectionString=make.name + ' ' + make.models[this.state.modelIndex];
return (
React.createElement(View, null, 
React.createElement(Text, null, 'Please choose a make for your car:'), 
React.createElement(PickerIOS, {
selectedValue:this.state.carMake, 
onValueChange:function(carMake){return _this.setState({carMake:carMake, modelIndex:0});}}, 
Object.keys(CAR_MAKES_AND_MODELS).map(function(carMake){return (
React.createElement(PickerItemIOS, {
key:carMake, 
value:carMake, 
label:CAR_MAKES_AND_MODELS[carMake].name}));})), 




React.createElement(Text, null, 'Please choose a model of ', make.name, ':'), 
React.createElement(PickerIOS, {
selectedValue:this.state.modelIndex, 
key:this.state.carMake, 
onValueChange:function(modelIndex){return _this.setState({modelIndex:modelIndex});}}, 
CAR_MAKES_AND_MODELS[this.state.carMake].models.map(
function(modelName, modelIndex){return (
React.createElement(PickerItemIOS, {
key:_this.state.carmake + '_' + modelIndex, 
value:modelIndex, 
label:modelName}));})), 




React.createElement(Text, null, 'You selected: ', selectionString)));}});





exports.title = '<PickerIOS>';
exports.description = 'Render lists of selectable options with UIPickerView.';
exports.examples = [
{
title:'<PickerIOS>', 
render:function(){
return React.createElement(PickerExample, null);}}];});
__d('react-native/Examples/UIExplorer/ProgressViewIOSExample',["react-native/Libraries/react-native/react-native","react-timer-mixin/TimerMixin"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

ProgressViewIOS=


React.ProgressViewIOS;var StyleSheet=React.StyleSheet;var View=React.View;
var TimerMixin=require('react-timer-mixin/TimerMixin');

var ProgressViewExample=React.createClass({displayName:'ProgressViewExample', 
mixins:[TimerMixin], 

getInitialState:function(){
return {
progress:0};}, 



componentDidMount:function(){
this.updateProgress();}, 


updateProgress:function(){var _this=this;
var progress=this.state.progress + 0.01;
this.setState({progress:progress});
this.requestAnimationFrame(function(){return _this.updateProgress();});}, 


getProgress:function(offset){
var progress=this.state.progress + offset;
return Math.sin(progress % Math.PI) % 1;}, 


render:function(){
return (
React.createElement(View, {style:styles.container}, 
React.createElement(ProgressViewIOS, {style:styles.progressView, progress:this.getProgress(0)}), 
React.createElement(ProgressViewIOS, {style:styles.progressView, progressTintColor:'purple', progress:this.getProgress(0.2)}), 
React.createElement(ProgressViewIOS, {style:styles.progressView, progressTintColor:'red', progress:this.getProgress(0.4)}), 
React.createElement(ProgressViewIOS, {style:styles.progressView, progressTintColor:'orange', progress:this.getProgress(0.6)}), 
React.createElement(ProgressViewIOS, {style:styles.progressView, progressTintColor:'yellow', progress:this.getProgress(0.8)})));}});





exports.framework = 'React';
exports.title = 'ProgressViewIOS';
exports.description = 'ProgressViewIOS';
exports.examples = [{
title:'ProgressViewIOS', 
render:function(){
return (
React.createElement(ProgressViewExample, null));}}];




var styles=StyleSheet.create({
container:{
marginTop:-20, 
backgroundColor:'transparent'}, 

progressView:{
marginTop:20}});});
__d('react-native/Examples/UIExplorer/ScrollViewExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

ScrollView=



React.ScrollView;var StyleSheet=React.StyleSheet;var View=React.View;var Image=React.Image;

exports.title = '<ScrollView>';
exports.description = 'Component that enables scrolling through child components';
exports.examples = [
{
title:'<ScrollView>', 
description:'To make content scrollable, wrap it within a <ScrollView> component', 
render:function(){
return (
React.createElement(ScrollView, {
onScroll:function(){console.log('onScroll!');}, 
scrollEventThrottle:200, 
contentInset:{top:-50}, 
style:styles.scrollView}, 
THUMBS.map(createThumbRow)));}}, 



{
title:'<ScrollView> (horizontal = true)', 
description:'You can display <ScrollView>\'s child components horizontally rather than vertically', 
render:function(){
return (
React.createElement(ScrollView, {
horizontal:true, 
contentInset:{top:-50}, 
style:[styles.scrollView, styles.horizontalScrollView]}, 
THUMBS.map(createThumbRow)));}}];





var Thumb=React.createClass({displayName:'Thumb', 
shouldComponentUpdate:function(nextProps, nextState){
return false;}, 

render:function(){
return (
React.createElement(View, {style:styles.button}, 
React.createElement(Image, {style:styles.img, source:{uri:this.props.uri}})));}});





var THUMBS=['https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851549_767334479959628_274486868_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851561_767334496626293_1958532586_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851579_767334503292959_179092627_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851589_767334513292958_1747022277_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851563_767334559959620_1193692107_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851593_767334566626286_1953955109_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851591_767334523292957_797560749_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851567_767334529959623_843148472_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851548_767334489959627_794462220_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851575_767334539959622_441598241_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-ash3/t39.1997/p128x128/851573_767334549959621_534583464_n.png', 'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851583_767334573292952_1519550680_n.png'];
THUMBS = THUMBS.concat(THUMBS);
var createThumbRow=function(uri, i){return React.createElement(Thumb, {key:i, uri:uri});};

var styles=StyleSheet.create({
scrollView:{
backgroundColor:'#6A85B1', 
height:300}, 

horizontalScrollView:{
height:120}, 

containerPage:{
height:50, 
width:50, 
backgroundColor:'#527FE4', 
padding:5}, 

text:{
fontSize:20, 
color:'#888888', 
left:80, 
top:20, 
height:40}, 

button:{
margin:7, 
padding:5, 
alignItems:'center', 
backgroundColor:'#eaeaea', 
borderRadius:3}, 

buttonContents:{
flexDirection:'row', 
width:64, 
height:64}, 

img:{
width:64, 
height:64}});});
__d('react-native/Examples/UIExplorer/SegmentedControlIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

SegmentedControlIOS=



React.SegmentedControlIOS;var Text=React.Text;var View=React.View;var StyleSheet=React.StyleSheet;

var BasicSegmentedControlExample=React.createClass({displayName:'BasicSegmentedControlExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {style:{marginBottom:10}}, 
React.createElement(SegmentedControlIOS, {values:['One', 'Two']})), 

React.createElement(View, null, 
React.createElement(SegmentedControlIOS, {values:['One', 'Two', 'Three', 'Four', 'Five']}))));}});






var PreSelectedSegmentedControlExample=React.createClass({displayName:'PreSelectedSegmentedControlExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, null, 
React.createElement(SegmentedControlIOS, {values:['One', 'Two'], selectedIndex:0}))));}});






var MomentarySegmentedControlExample=React.createClass({displayName:'MomentarySegmentedControlExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, null, 
React.createElement(SegmentedControlIOS, {values:['One', 'Two'], momentary:true}))));}});






var DisabledSegmentedControlExample=React.createClass({displayName:'DisabledSegmentedControlExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, null, 
React.createElement(SegmentedControlIOS, {enabled:false, values:['One', 'Two'], selectedIndex:1}))));}});






var ColorSegmentedControlExample=React.createClass({displayName:'ColorSegmentedControlExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {style:{marginBottom:10}}, 
React.createElement(SegmentedControlIOS, {tintColor:'#ff0000', values:['One', 'Two', 'Three', 'Four'], selectedIndex:0})), 

React.createElement(View, null, 
React.createElement(SegmentedControlIOS, {tintColor:'#00ff00', values:['One', 'Two', 'Three'], selectedIndex:1}))));}});






var EventSegmentedControlExample=React.createClass({displayName:'EventSegmentedControlExample', 
getInitialState:function(){
return {
values:['One', 'Two', 'Three'], 
value:'Not selected', 
selectedIndex:undefined};}, 



render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:styles.text}, 'Value: ', 
this.state.value), 

React.createElement(Text, {style:styles.text}, 'Index: ', 
this.state.selectedIndex), 

React.createElement(SegmentedControlIOS, {
values:this.state.values, 
selectedIndex:this.state.selectedIndex, 
onChange:this._onChange, 
onValueChange:this._onValueChange})));}, 




_onChange:function(event){
this.setState({
selectedIndex:event.nativeEvent.selectedIndex});}, 



_onValueChange:function(value){
this.setState({
value:value});}});




var styles=StyleSheet.create({
text:{
fontSize:14, 
textAlign:'center', 
fontWeight:'500', 
margin:10}});



exports.title = '<SegmentedControlIOS>';
exports.displayName = 'SegmentedControlExample';
exports.description = 'Native segmented control';
exports.examples = [
{
title:'Segmented controls can have values', 
render:function(){return React.createElement(BasicSegmentedControlExample, null);}}, 

{
title:'Segmented controls can have a pre-selected value', 
render:function(){return React.createElement(PreSelectedSegmentedControlExample, null);}}, 

{
title:'Segmented controls can be momentary', 
render:function(){return React.createElement(MomentarySegmentedControlExample, null);}}, 

{
title:'Segmented controls can be disabled', 
render:function(){return React.createElement(DisabledSegmentedControlExample, null);}}, 

{
title:'Custom colors can be provided', 
render:function(){return React.createElement(ColorSegmentedControlExample, null);}}, 

{
title:'Change events can be detected', 
render:function(){return React.createElement(EventSegmentedControlExample, null);}}];});
__d('react-native/Examples/UIExplorer/SliderIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

SliderIOS=



React.SliderIOS;var Text=React.Text;var StyleSheet=React.StyleSheet;var View=React.View;

var SliderExample=React.createClass({displayName:'SliderExample', 
getInitialState:function(){
return {
value:0};}, 



render:function(){var _this=this;
return (
React.createElement(View, null, 
React.createElement(Text, {style:styles.text}, 
this.state.value), 

React.createElement(SliderIOS, {
style:styles.slider, 
onValueChange:function(value){return _this.setState({value:value});}})));}});





var styles=StyleSheet.create({
slider:{
height:10, 
margin:10}, 

text:{
fontSize:14, 
textAlign:'center', 
fontWeight:'500', 
margin:10}});



exports.title = '<SliderIOS>';
exports.displayName = 'SliderExample';
exports.description = 'Slider input for numeric values';
exports.examples = [
{
title:'SliderIOS', 
render:function(){return React.createElement(SliderExample, null);}}];});
__d('react-native/Examples/UIExplorer/SwitchIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

SwitchIOS=


React.SwitchIOS;var Text=React.Text;var View=React.View;

var BasicSwitchExample=React.createClass({displayName:'BasicSwitchExample', 
getInitialState:function(){
return {
trueSwitchIsOn:true, 
falseSwitchIsOn:false};}, 


render:function(){var _this=this;
return (
React.createElement(View, null, 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this.setState({falseSwitchIsOn:value});}, 
style:{marginBottom:10}, 
value:this.state.falseSwitchIsOn}), 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this.setState({trueSwitchIsOn:value});}, 
value:this.state.trueSwitchIsOn})));}});





var DisabledSwitchExample=React.createClass({displayName:'DisabledSwitchExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(SwitchIOS, {
disabled:true, 
style:{marginBottom:10}, 
value:true}), 
React.createElement(SwitchIOS, {
disabled:true, 
value:false})));}});





var ColorSwitchExample=React.createClass({displayName:'ColorSwitchExample', 
getInitialState:function(){
return {
colorTrueSwitchIsOn:true, 
colorFalseSwitchIsOn:false};}, 


render:function(){var _this2=this;
return (
React.createElement(View, null, 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this2.setState({colorFalseSwitchIsOn:value});}, 
onTintColor:'#00ff00', 
style:{marginBottom:10}, 
thumbTintColor:'#0000ff', 
tintColor:'#ff0000', 
value:this.state.colorFalseSwitchIsOn}), 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this2.setState({colorTrueSwitchIsOn:value});}, 
onTintColor:'#00ff00', 
thumbTintColor:'#0000ff', 
tintColor:'#ff0000', 
value:this.state.colorTrueSwitchIsOn})));}});





var EventSwitchExample=React.createClass({displayName:'EventSwitchExample', 
getInitialState:function(){
return {
eventSwitchIsOn:false, 
eventSwitchRegressionIsOn:true};}, 


render:function(){var _this3=this;
return (
React.createElement(View, {style:{flexDirection:'row', justifyContent:'space-around'}}, 
React.createElement(View, null, 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this3.setState({eventSwitchIsOn:value});}, 
style:{marginBottom:10}, 
value:this.state.eventSwitchIsOn}), 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this3.setState({eventSwitchIsOn:value});}, 
style:{marginBottom:10}, 
value:this.state.eventSwitchIsOn}), 
React.createElement(Text, null, this.state.eventSwitchIsOn?'On':'Off')), 

React.createElement(View, null, 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this3.setState({eventSwitchRegressionIsOn:value});}, 
style:{marginBottom:10}, 
value:this.state.eventSwitchRegressionIsOn}), 
React.createElement(SwitchIOS, {
onValueChange:function(value){return _this3.setState({eventSwitchRegressionIsOn:value});}, 
style:{marginBottom:10}, 
value:this.state.eventSwitchRegressionIsOn}), 
React.createElement(Text, null, this.state.eventSwitchRegressionIsOn?'On':'Off'))));}});






exports.title = '<SwitchIOS>';
exports.displayName = 'SwitchExample';
exports.description = 'Native boolean input';
exports.examples = [
{
title:'Switches can be set to true or false', 
render:function(){return React.createElement(BasicSwitchExample, null);}}, 

{
title:'Switches can be disabled', 
render:function(){return React.createElement(DisabledSwitchExample, null);}}, 

{
title:'Custom colors can be provided', 
render:function(){return React.createElement(ColorSwitchExample, null);}}, 

{
title:'Change events can be detected', 
render:function(){return React.createElement(EventSwitchExample, null);}}, 

{
title:'Switches are controlled components', 
render:function(){return React.createElement(SwitchIOS, null);}}];});
__d('react-native/Examples/UIExplorer/TabBarIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=



React.StyleSheet;var TabBarIOS=React.TabBarIOS;var Text=React.Text;var View=React.View;

var TabBarExample=React.createClass({displayName:'TabBarExample', 
statics:{
title:'<TabBarIOS>', 
description:'Tab-based navigation.'}, 


getInitialState:function(){
return {
selectedTab:'redTab', 
notifCount:0, 
presses:0};}, 



_renderContent:function(color, pageText){
return (
React.createElement(View, {style:[styles.tabContent, {backgroundColor:color}]}, 
React.createElement(Text, {style:styles.tabText}, pageText), 
React.createElement(Text, {style:styles.tabText}, this.state.presses, ' re-renders of the More tab')));}, 




render:function(){var _this=this;
return (
React.createElement(TabBarIOS, {
tintColor:'black', 
barTintColor:'#3abeff'}, 
React.createElement(TabBarIOS.Item, {
title:'Blue Tab', 
selected:this.state.selectedTab === 'blueTab', 
onPress:function(){
_this.setState({
selectedTab:'blueTab'});}}, 


this._renderContent('#414A8C', 'Blue Tab')), 

React.createElement(TabBarIOS.Item, {
systemIcon:'history', 
badge:this.state.notifCount > 0?this.state.notifCount:undefined, 
selected:this.state.selectedTab === 'redTab', 
onPress:function(){
_this.setState({
selectedTab:'redTab', 
notifCount:_this.state.notifCount + 1});}}, 


this._renderContent('#783E33', 'Red Tab')), 

React.createElement(TabBarIOS.Item, {
systemIcon:'more', 
selected:this.state.selectedTab === 'greenTab', 
onPress:function(){
_this.setState({
selectedTab:'greenTab', 
presses:_this.state.presses + 1});}}, 


this._renderContent('#21551C', 'Green Tab'))));}});







var styles=StyleSheet.create({
tabContent:{
flex:1, 
alignItems:'center'}, 

tabText:{
color:'white', 
margin:50}});



module.exports = TabBarExample;});
__d('react-native/Examples/UIExplorer/TextExample.ios',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

var Entity=React.createClass({displayName:'Entity', 
render:function(){
return (
React.createElement(Text, {style:styles.entity}, 
this.props.children));}});





var AttributeToggler=React.createClass({displayName:'AttributeToggler', 
getInitialState:function(){
return {fontWeight:'500', fontSize:15};}, 

increaseSize:function(){
this.setState({
fontSize:this.state.fontSize + 1});}, 


render:function(){
var curStyle={fontSize:this.state.fontSize};
return (
React.createElement(Text, null, 
React.createElement(Text, {style:curStyle}, 'Tap the controls below to change attributes.'), 


React.createElement(Text, null, 'See how it will even work on', 
' ', 
React.createElement(Text, {style:curStyle}, 'this nested text'), 


React.createElement(Text, {onPress:this.increaseSize}, 
'>> Increase Size <<'))));}});







exports.title = '<Text>';
exports.description = 'Base component for rendering styled text.';
exports.displayName = 'TextExample';
exports.examples = [
{
title:'Wrap', 
render:function(){
return (
React.createElement(Text, null, 'The text should wrap if it goes on multiple lines. See, this is going to the next line.'));}}, 





{
title:'Padding', 
render:function(){
return (
React.createElement(Text, {style:{padding:10}}, 'This text is indented by 10px padding on all sides.'));}}, 




{
title:'Font Family', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{fontFamily:'Cochin'}}, 'Cochin'), 


React.createElement(Text, {style:{fontFamily:'Cochin', fontWeight:'bold'}}, 'Cochin bold'), 


React.createElement(Text, {style:{fontFamily:'Helvetica'}}, 'Helvetica'), 


React.createElement(Text, {style:{fontFamily:'Helvetica', fontWeight:'bold'}}, 'Helvetica bold'), 


React.createElement(Text, {style:{fontFamily:'Verdana'}}, 'Verdana'), 


React.createElement(Text, {style:{fontFamily:'Verdana', fontWeight:'bold'}}, 'Verdana bold')));}}, 





{
title:'Font Size', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{fontSize:23}}, 'Size 23'), 


React.createElement(Text, {style:{fontSize:8}}, 'Size 8')));}}, 





{
title:'Color', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{color:'red'}}, 'Red color'), 


React.createElement(Text, {style:{color:'blue'}}, 'Blue color')));}}, 





{
title:'Font Weight', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{fontWeight:'100'}}, 'Move fast and be ultralight'), 


React.createElement(Text, {style:{fontWeight:'200'}}, 'Move fast and be light'), 


React.createElement(Text, {style:{fontWeight:'normal'}}, 'Move fast and be normal'), 


React.createElement(Text, {style:{fontWeight:'bold'}}, 'Move fast and be bold'), 


React.createElement(Text, {style:{fontWeight:'900'}}, 'Move fast and be ultrabold')));}}, 





{
title:'Font Style', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{fontStyle:'normal'}}, 'Normal text'), 


React.createElement(Text, {style:{fontStyle:'italic'}}, 'Italic text')));}}, 





{
title:'Nested', 
description:'Nested text components will inherit the styles of their ' + 
'parents (only backgroundColor is inherited from non-Text parents).  ' + 
'<Text> only supports other <Text> and raw text (strings) as children.', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, null, '(Normal text,', 

React.createElement(Text, {style:{fontWeight:'bold'}}, '(and bold', 

React.createElement(Text, {style:{fontSize:11, color:'#527fe4'}}, '(and tiny inherited bold blue)'), ')'), ')'), 






React.createElement(Text, {style:{fontSize:12}}, 
React.createElement(Entity, null, 'Entity Name'))));}}, 




{
title:'Text Align', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{textAlign:'left'}}, 'left left left left left left left left left left left left left left left'), 


React.createElement(Text, {style:{textAlign:'center'}}, 'center center center center center center center center center center center'), 


React.createElement(Text, {style:{textAlign:'right'}}, 'right right right right right right right right right right right right right')));}}, 





{
title:'Letter Spacing', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{letterSpacing:0}}, 'letterSpacing = 0'), 


React.createElement(Text, {style:{letterSpacing:2, marginTop:5}}, 'letterSpacing = 2'), 


React.createElement(Text, {style:{letterSpacing:9, marginTop:5}}, 'letterSpacing = 9'), 


React.createElement(Text, {style:{letterSpacing:-1, marginTop:5}}, 'letterSpacing = -1')));}}, 





{
title:'Spaces', 
render:function(){
return (
React.createElement(Text, null, 'A ', 
'generated', ' ', ' ', ' ', 'string', ' and    some Â Â Â  spaces'));}}, 



{
title:'Line Height', 
render:function(){
return (
React.createElement(Text, null, 
React.createElement(Text, {style:{lineHeight:35}}, 'A lot of space between the lines of this long passage that should wrap once.')));}}, 






{
title:'Empty Text', 
description:'It\'s ok to have Text with zero or null children.', 
render:function(){
return (
React.createElement(Text, null));}}, 


{
title:'Toggling Attributes', 
render:function(){
return React.createElement(AttributeToggler, null);}}, 

{
title:'backgroundColor attribute', 
description:'backgroundColor is inherited from all types of views.', 
render:function(){
return (
React.createElement(View, {style:{backgroundColor:'yellow'}}, 
React.createElement(Text, null, 'Yellow background inherited from View parent,', 

React.createElement(Text, {style:{backgroundColor:'#ffaaaa'}}, 
' ', 'red background,', 
React.createElement(Text, {style:{backgroundColor:'#aaaaff'}}, 
' ', 'blue background,', 
React.createElement(Text, null, 
' ', 'inherited blue background,', 
React.createElement(Text, {style:{backgroundColor:'#aaffaa'}}, 
' ', 'nested green background.')))))));}}, 








{
title:'containerBackgroundColor attribute', 
render:function(){
return (
React.createElement(View, {style:{backgroundColor:'yellow'}}, 
React.createElement(View, {style:{flexDirection:'row', position:'absolute', height:80}}, 
React.createElement(View, {style:{backgroundColor:'#ffaaaa', width:140}}), 
React.createElement(View, {style:{backgroundColor:'#aaaaff', width:140}})), 

React.createElement(Text, {style:styles.backgroundColorText}, 'Default containerBackgroundColor (inherited) + backgroundColor wash'), 


React.createElement(Text, {style:[
styles.backgroundColorText, 
{marginBottom:5, containerBackgroundColor:'transparent'}]}, 
'containerBackgroundColor: \'transparent\' + backgroundColor wash')));}}, 




{
title:'numberOfLines attribute', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {numberOfLines:1}, 'Maximum of one line, no matter how much I write here. If I keep writing, it', 
'\'', 'll just truncate after one line.'), 

React.createElement(Text, {numberOfLines:2, style:{marginTop:20}}, 'Maximum of two lines, no matter how much I write here. If I keep writing, it', 
'\'', 'll just truncate after two lines.'), 

React.createElement(Text, {style:{marginTop:20}}, 'No maximum lines specified, no matter how much I write here. If I keep writing, it', 
'\'', 'll just keep going and going.')));}}];






var styles=StyleSheet.create({
backgroundColorText:{
margin:5, 
marginBottom:0, 
backgroundColor:'rgba(100, 100, 100, 0.3)'}, 

entity:{
fontWeight:'500', 
color:'#527fe4'}});});
__d('react-native/Examples/UIExplorer/TextInputExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

Text=



React.Text;var TextInput=React.TextInput;var View=React.View;var StyleSheet=React.StyleSheet;

var WithLabel=React.createClass({displayName:'WithLabel', 
render:function(){
return (
React.createElement(View, {style:styles.labelContainer}, 
React.createElement(View, {style:styles.label}, 
React.createElement(Text, null, this.props.label)), 

this.props.children));}});





var TextEventsExample=React.createClass({displayName:'TextEventsExample', 
getInitialState:function(){
return {
curText:'<No Event>', 
prevText:'<No Event>'};}, 



updateText:function(text){
this.setState({
curText:text, 
prevText:this.state.curText});}, 



render:function(){var _this=this;
return (
React.createElement(View, null, 
React.createElement(TextInput, {
autoCapitalize:'none', 
placeholder:'Enter text to see events', 
autoCorrect:false, 
onFocus:function(){return _this.updateText('onFocus');}, 
onBlur:function(){return _this.updateText('onBlur');}, 
onChange:function(event){return _this.updateText(
'onChange text: ' + event.nativeEvent.text);}, 

onEndEditing:function(event){return _this.updateText(
'onEndEditing text: ' + event.nativeEvent.text);}, 

onSubmitEditing:function(event){return _this.updateText(
'onSubmitEditing text: ' + event.nativeEvent.text);}, 

style:styles.default}), 

React.createElement(Text, {style:styles.eventLabel}, 
this.state.curText, '\n', '(prev: ', 
this.state.prevText, ')')));}});






var styles=StyleSheet.create({
page:{
paddingBottom:300}, 

default:{
height:26, 
borderWidth:0.5, 
borderColor:'#0f0f0f', 
flex:1, 
fontSize:13, 
padding:4}, 

multiline:{
borderWidth:0.5, 
borderColor:'#0f0f0f', 
flex:1, 
fontSize:13, 
height:50, 
padding:4, 
marginBottom:4}, 

multilineWithFontStyles:{
color:'blue', 
fontWeight:'bold', 
fontSize:18, 
fontFamily:'Cochin', 
height:60}, 

multilineChild:{
width:50, 
height:40, 
position:'absolute', 
right:5, 
backgroundColor:'red'}, 

eventLabel:{
margin:3, 
fontSize:12}, 

labelContainer:{
flexDirection:'row', 
marginVertical:2, 
flex:1}, 

label:{
width:120, 
justifyContent:'flex-end', 
flexDirection:'row', 
marginRight:10, 
paddingTop:2}});



exports.title = '<TextInput>';
exports.description = 'Single and multi-line text inputs.';
exports.examples = [
{
title:'Auto-focus', 
render:function(){
return React.createElement(TextInput, {autoFocus:true, style:styles.default});}}, 


{
title:'Auto-capitalize', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'none'}, 
React.createElement(TextInput, {
autoCapitalize:'none', 
style:styles.default})), 


React.createElement(WithLabel, {label:'sentences'}, 
React.createElement(TextInput, {
autoCapitalize:'sentences', 
style:styles.default})), 


React.createElement(WithLabel, {label:'words'}, 
React.createElement(TextInput, {
autoCapitalize:'words', 
style:styles.default})), 


React.createElement(WithLabel, {label:'characters'}, 
React.createElement(TextInput, {
autoCapitalize:'characters', 
style:styles.default}))));}}, 






{
title:'Auto-correct', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'true'}, 
React.createElement(TextInput, {autoCorrect:true, style:styles.default})), 

React.createElement(WithLabel, {label:'false'}, 
React.createElement(TextInput, {autoCorrect:false, style:styles.default}))));}}, 





{
title:'Keyboard types', 
render:function(){
var keyboardTypes=[
'default', 
'ascii-capable', 
'numbers-and-punctuation', 
'url', 
'number-pad', 
'phone-pad', 
'name-phone-pad', 
'email-address', 
'decimal-pad', 
'twitter', 
'web-search', 
'numeric'];

var examples=keyboardTypes.map(function(type){
return (
React.createElement(WithLabel, {key:type, label:type}, 
React.createElement(TextInput, {
keyboardType:type, 
style:styles.default})));});




return React.createElement(View, null, examples);}}, 


{
title:'Return key types', 
render:function(){
var returnKeyTypes=[
'default', 
'go', 
'google', 
'join', 
'next', 
'route', 
'search', 
'send', 
'yahoo', 
'done', 
'emergency-call'];

var examples=returnKeyTypes.map(function(type){
return (
React.createElement(WithLabel, {key:type, label:type}, 
React.createElement(TextInput, {
returnKeyType:type, 
style:styles.default})));});




return React.createElement(View, null, examples);}}, 


{
title:'Enable return key automatically', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'true'}, 
React.createElement(TextInput, {enablesReturnKeyAutomatically:true, style:styles.default}))));}}, 





{
title:'Secure text entry', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'true'}, 
React.createElement(TextInput, {password:true, style:styles.default, value:'abc'}))));}}, 





{
title:'Event handling', 
render:function(){return React.createElement(TextEventsExample, null);}}, 

{
title:'Colored input text', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(TextInput, {
style:[styles.default, {color:'blue'}], 
value:'Blue'}), 

React.createElement(TextInput, {
style:[styles.default, {color:'green'}], 
value:'Green'})));}}, 





{
title:'Clear button mode', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'never'}, 
React.createElement(TextInput, {
style:styles.default, 
clearButtonMode:'never'})), 


React.createElement(WithLabel, {label:'while editing'}, 
React.createElement(TextInput, {
style:styles.default, 
clearButtonMode:'while-editing'})), 


React.createElement(WithLabel, {label:'unless editing'}, 
React.createElement(TextInput, {
style:styles.default, 
clearButtonMode:'unless-editing'})), 


React.createElement(WithLabel, {label:'always'}, 
React.createElement(TextInput, {
style:styles.default, 
clearButtonMode:'always'}))));}}, 






{
title:'Clear and select', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(WithLabel, {label:'clearTextOnFocus'}, 
React.createElement(TextInput, {
placeholder:'text is cleared on focus', 
value:'text is cleared on focus', 
style:styles.default, 
clearTextOnFocus:true})), 


React.createElement(WithLabel, {label:'selectTextOnFocus'}, 
React.createElement(TextInput, {
placeholder:'text is selected on focus', 
value:'text is selected on focus', 
style:styles.default, 
selectTextOnFocus:true}))));}}, 






{
title:'Multiline', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(TextInput, {
placeholder:'multiline text input', 
multiline:true, 
style:styles.multiline}), 

React.createElement(TextInput, {
placeholder:'mutliline text input with font styles and placeholder', 
multiline:true, 
clearTextOnFocus:true, 
autoCorrect:true, 
autoCapitalize:'words', 
placeholderTextColor:'red', 
keyboardType:'url', 
style:[styles.multiline, styles.multilineWithFontStyles]}), 

React.createElement(TextInput, {
placeholder:'uneditable mutliline text input', 
editable:false, 
multiline:true, 
style:styles.multiline}), 

React.createElement(TextInput, {
placeholder:'multiline with children', 
multiline:true, 
enablesReturnKeyAutomatically:true, 
returnKeyType:'go', 
style:styles.multiline}, 
React.createElement(View, {style:styles.multilineChild}))));}}];});
__d('react-native/Examples/UIExplorer/TouchableExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

PixelRatio=






React.PixelRatio;var Image=React.Image;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var TouchableOpacity=React.TouchableOpacity;var View=React.View;

exports.title = '<Touchable*> and onPress';
exports.examples = [
{
title:'<TouchableHighlight>', 
description:'TouchableHighlight works by adding an extra view with a ' + 
'black background under the single child view.  This works best when the ' + 
'child view is fully opaque, although it can be made to work as a simple ' + 
'background color change as well with the activeOpacity and ' + 
'underlayColor props.', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {style:styles.row}, 
React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:function(){return console.log('stock THW image - highlight');}}, 
React.createElement(Image, {
source:heartImage, 
style:styles.image})), 


React.createElement(TouchableHighlight, {
style:styles.wrapper, 
activeOpacity:1, 
animationVelocity:0, 
underlayColor:'rgb(210, 230, 255)', 
onPress:function(){return console.log('custom THW text - hightlight');}}, 
React.createElement(View, {style:styles.wrapperCustom}, 
React.createElement(Text, {style:styles.text}, 'Tap Here For Custom Highlight!'))))));}}, 








{
title:'<Text onPress={fn}> with highlight', 
render:function(){
return React.createElement(TextOnPressBox, null);}}, 

{
title:'Touchable feedback events', 
description:'<Touchable*> components accept onPress, onPressIn, ' + 
'onPressOut, and onLongPress as props.', 
render:function(){
return React.createElement(TouchableFeedbackEvents, null);}}, 

{
title:'Touchable delay for events', 
description:'<Touchable*> components also accept delayPressIn, ' + 
'delayPressOut, and delayLongPress as props. These props impact the ' + 
'timing of feedback events.', 
render:function(){
return React.createElement(TouchableDelayEvents, null);}}];



var TextOnPressBox=React.createClass({displayName:'TextOnPressBox', 
getInitialState:function(){
return {
timesPressed:0};}, 


textOnPress:function(){
this.setState({
timesPressed:this.state.timesPressed + 1});}, 


render:function(){
var textLog='';
if(this.state.timesPressed > 1){
textLog = this.state.timesPressed + 'x text onPress';}else 
if(this.state.timesPressed > 0){
textLog = 'text onPress';}


return (
React.createElement(View, null, 
React.createElement(Text, {
style:styles.textBlock, 
onPress:this.textOnPress}, 'Text has built-in onPress handling'), 


React.createElement(View, {style:styles.logBox}, 
React.createElement(Text, null, 
textLog))));}});







var TouchableFeedbackEvents=React.createClass({displayName:'TouchableFeedbackEvents', 
getInitialState:function(){
return {
eventLog:[]};}, 


render:function(){var _this=this;
return (
React.createElement(View, null, 
React.createElement(View, {style:[styles.row, {justifyContent:'center'}]}, 
React.createElement(TouchableOpacity, {
style:styles.wrapper, 
onPress:function(){return _this._appendEvent('press');}, 
onPressIn:function(){return _this._appendEvent('pressIn');}, 
onPressOut:function(){return _this._appendEvent('pressOut');}, 
onLongPress:function(){return _this._appendEvent('longPress');}}, 
React.createElement(Text, {style:styles.button}, 'Press Me'))), 




React.createElement(View, {style:styles.eventLogBox}, 
this.state.eventLog.map(function(e, ii){return React.createElement(Text, {key:ii}, e);}))));}, 




_appendEvent:function(eventName){
var limit=6;
var eventLog=this.state.eventLog.slice(0, limit - 1);
eventLog.unshift(eventName);
this.setState({eventLog:eventLog});}});



var TouchableDelayEvents=React.createClass({displayName:'TouchableDelayEvents', 
getInitialState:function(){
return {
eventLog:[]};}, 


render:function(){var _this2=this;
return (
React.createElement(View, null, 
React.createElement(View, {style:[styles.row, {justifyContent:'center'}]}, 
React.createElement(TouchableOpacity, {
style:styles.wrapper, 
onPress:function(){return _this2._appendEvent('press');}, 
delayPressIn:400, 
onPressIn:function(){return _this2._appendEvent('pressIn - 400ms delay');}, 
delayPressOut:1000, 
onPressOut:function(){return _this2._appendEvent('pressOut - 1000ms delay');}, 
delayLongPress:800, 
onLongPress:function(){return _this2._appendEvent('longPress - 800ms delay');}}, 
React.createElement(Text, {style:styles.button}, 'Press Me'))), 




React.createElement(View, {style:styles.eventLogBox}, 
this.state.eventLog.map(function(e, ii){return React.createElement(Text, {key:ii}, e);}))));}, 




_appendEvent:function(eventName){
var limit=6;
var eventLog=this.state.eventLog.slice(0, limit - 1);
eventLog.unshift(eventName);
this.setState({eventLog:eventLog});}});



var heartImage={uri:'https://pbs.twimg.com/media/BlXBfT3CQAA6cVZ.png:small'};

var styles=StyleSheet.create({
row:{
justifyContent:'center', 
flexDirection:'row'}, 

icon:{
width:24, 
height:24}, 

image:{
width:50, 
height:50}, 

text:{
fontSize:16}, 

button:{
color:'#007AFF'}, 

wrapper:{
borderRadius:8}, 

wrapperCustom:{
borderRadius:8, 
padding:6}, 

logBox:{
padding:20, 
margin:10, 
borderWidth:1 / PixelRatio.get(), 
borderColor:'#f0f0f0', 
backgroundColor:'#f9f9f9'}, 

eventLogBox:{
padding:10, 
margin:10, 
height:120, 
borderWidth:1 / PixelRatio.get(), 
borderColor:'#f0f0f0', 
backgroundColor:'#f9f9f9'}, 

textBlock:{
fontWeight:'500', 
color:'blue'}});});
__d('react-native/Examples/UIExplorer/AccessibilityIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

Text=

React.Text;var View=React.View;

var AccessibilityIOSExample=React.createClass({displayName:'AccessibilityIOSExample', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {
onAccessibilityTap:function(){return alert('onAccessibilityTap success');}, 
accessible:true}, 
React.createElement(Text, null, 'Accessibility normal tap example')), 



React.createElement(View, {onMagicTap:function(){return alert('onMagicTap success');}, 
accessible:true}, 
React.createElement(Text, null, 'Accessibility magic tap example')), 



React.createElement(View, {accessibilityLabel:'Some announcement', 
accessible:true}, 
React.createElement(Text, null, 'Accessibility label example')), 



React.createElement(View, {accessibilityTraits:['button', 'selected'], 
accessible:true}, 
React.createElement(Text, null, 'Accessibility traits example'))));}});








exports.title = 'AccessibilityIOS';
exports.description = 'Interface to show iOS\' accessibility samples';
exports.examples = [
{
title:'Accessibility elements', 
render:function(){return React.createElement(AccessibilityIOSExample, null);}}];});
__d('react-native/Examples/UIExplorer/ActionSheetIOSExample',["react-native/Libraries/react-native/react-native","ActionSheetIOS"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;
var ActionSheetIOS=require('ActionSheetIOS');
var BUTTONS=[
'Button Index: 0', 
'Button Index: 1', 
'Button Index: 2', 
'Destruct', 
'Cancel'];

var DESTRUCTIVE_INDEX=3;
var CANCEL_INDEX=4;

var ActionSheetExample=React.createClass({displayName:'ActionSheetExample', 
getInitialState:function(){
return {
clicked:'none'};}, 



render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {onPress:this.showActionSheet, style:style.button}, 'Click to show the ActionSheet'), 


React.createElement(Text, null, 'Clicked button at index: "', 
this.state.clicked, '"')));}, 





showActionSheet:function(){var _this=this;
ActionSheetIOS.showActionSheetWithOptions({
options:BUTTONS, 
cancelButtonIndex:CANCEL_INDEX, 
destructiveButtonIndex:DESTRUCTIVE_INDEX}, 

function(buttonIndex){
_this.setState({clicked:BUTTONS[buttonIndex]});});}});




var ShareActionSheetExample=React.createClass({displayName:'ShareActionSheetExample', 
getInitialState:function(){
return {
text:''};}, 



render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, {onPress:this.showShareActionSheet, style:style.button}, 'Click to show the Share ActionSheet'), 


React.createElement(Text, null, 
this.state.text)));}, 





showShareActionSheet:function(){var _this2=this;
ActionSheetIOS.showShareActionSheetWithOptions({
url:'https://code.facebook.com'}, 

function(error){
console.error(error);}, 

function(success, method){
var text;
if(success){
text = 'Shared via ' + method;}else 
{
text = 'You didn\'t share';}

_this2.setState({text:text});});}});




var style=StyleSheet.create({
button:{
marginBottom:10, 
fontWeight:'500'}});



exports.title = 'ActionSheetIOS';
exports.description = 'Interface to show iOS\' action sheets';
exports.examples = [
{
title:'Show Action Sheet', 
render:function(){return React.createElement(ActionSheetExample, null);}}, 

{
title:'Show Share Action Sheet', 
render:function(){return React.createElement(ShareActionSheetExample, null);}}];});
__d('ActionSheetIOS',["NativeModules","invariant"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var RCTActionSheetManager=require('NativeModules').ActionSheetManager;

var invariant=require('invariant');

var ActionSheetIOS={
showActionSheetWithOptions:function(options, callback){
invariant(
typeof options === 'object' && options !== null, 
'Options must a valid object');

invariant(
typeof callback === 'function', 
'Must provide a valid callback');

RCTActionSheetManager.showActionSheetWithOptions(
options, 
function(){}, 
callback);}, 



showShareActionSheetWithOptions:function(
options, 
failureCallback, 
successCallback)
{
invariant(
typeof options === 'object' && options !== null, 
'Options must a valid object');

invariant(
typeof failureCallback === 'function', 
'Must provide a valid failureCallback');

invariant(
typeof successCallback === 'function', 
'Must provide a valid successCallback');

RCTActionSheetManager.showShareActionSheetWithOptions(
options, 
failureCallback, 
successCallback);}};




module.exports = ActionSheetIOS;});
__d('react-native/Examples/UIExplorer/AdSupportIOSExample',["AdSupportIOS","react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var AdSupportIOS=require('AdSupportIOS');

var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

exports.framework = 'React';
exports.title = 'Advertising ID';
exports.description = 'Example of using the ad support API.';

exports.examples = [
{
title:'Ad Support IOS', 
render:function(){
return React.createElement(AdSupportIOSExample, null);}}];




var AdSupportIOSExample=React.createClass({displayName:'AdSupportIOSExample', 
getInitialState:function(){
return {
deviceID:'No IDFA yet', 
hasAdvertiserTracking:'unset'};}, 



componentDidMount:function(){
AdSupportIOS.getAdvertisingId(
this._onDeviceIDSuccess, 
this._onDeviceIDFailure);


AdSupportIOS.getAdvertisingTrackingEnabled(
this._onHasTrackingSuccess, 
this._onHasTrackingFailure);}, 



_onHasTrackingSuccess:function(hasTracking){
this.setState({
'hasAdvertiserTracking':hasTracking});}, 



_onHasTrackingFailure:function(e){
this.setState({
'hasAdvertiserTracking':'Error!'});}, 



_onDeviceIDSuccess:function(deviceID){
this.setState({
'deviceID':deviceID});}, 



_onDeviceIDFailure:function(e){
this.setState({
'deviceID':'Error!'});}, 



render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, null, 
React.createElement(Text, {style:styles.title}, 'Advertising ID: '), 
JSON.stringify(this.state.deviceID)), 

React.createElement(Text, null, 
React.createElement(Text, {style:styles.title}, 'Has Advertiser Tracking: '), 
JSON.stringify(this.state.hasAdvertiserTracking))));}});






var styles=StyleSheet.create({
title:{
fontWeight:'500'}});});
__d('AdSupportIOS',["NativeModules"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';












var AdSupport=require('NativeModules').AdSupport;

module.exports = {
getAdvertisingId:function(onSuccess, onFailure){
AdSupport.getAdvertisingId(onSuccess, onFailure);}, 


getAdvertisingTrackingEnabled:function(onSuccess, onFailure){
AdSupport.getAdvertisingTrackingEnabled(onSuccess, onFailure);}};});
__d('react-native/Examples/UIExplorer/AlertIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=




React.StyleSheet;var View=React.View;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var AlertIOS=React.AlertIOS;

exports.framework = 'React';
exports.title = 'AlertIOS';
exports.description = 'iOS alerts and action sheets';
exports.examples = [{
title:'Alerts', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return AlertIOS.alert(
'Foo Title', 
'My Alert Msg');}}, 

React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Alert with message and default button'))), 


React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return AlertIOS.alert(
null, 
null, 
[
{text:'Button', onPress:function(){return console.log('Button Pressed!');}}]);}}, 


React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Alert with only one button'))), 


React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return AlertIOS.alert(
'Foo Title', 
'My Alert Msg', 
[
{text:'Foo', onPress:function(){return console.log('Foo Pressed!');}}, 
{text:'Bar', onPress:function(){return console.log('Bar Pressed!');}}]);}}, 


React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Alert with two buttons'))), 


React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return AlertIOS.alert(
'Foo Title', 
null, 
[
{text:'Foo', onPress:function(){return console.log('Foo Pressed!');}}, 
{text:'Bar', onPress:function(){return console.log('Bar Pressed!');}}, 
{text:'Baz', onPress:function(){return console.log('Baz Pressed!');}}]);}}, 


React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Alert with 3 buttons'))), 


React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return AlertIOS.alert(
'Foo Title', 
'My Alert Msg', 
'..............'.split('').map(function(dot, index){return {
text:'Button ' + index, 
onPress:function(){return console.log('Pressed ' + index);}};}));}}, 


React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Alert with too many buttons')))));}}, 






{
title:'Prompt', 
render:function(){
return React.createElement(PromptExample, null);}}];var 



PromptExample=(function(_React$Component){
function PromptExample(props){_classCallCheck(this, PromptExample);
_get(Object.getPrototypeOf(PromptExample.prototype), 'constructor', this).call(this, props);

this.promptResponse = this.promptResponse.bind(this);
this.state = {
promptValue:undefined};


this.title = 'Type a value';
this.defaultValue = 'Default value';
this.buttons = [{
text:'Custom cancel'}, 
{
text:'Custom OK', 
onPress:this.promptResponse}];}_inherits(PromptExample, _React$Component);_createClass(PromptExample, [{key:'render', value:



function render(){
return (
React.createElement(View, null, 
React.createElement(Text, {style:{marginBottom:10}}, 
React.createElement(Text, {style:{fontWeight:'bold'}}, 'Prompt value:'), ' ', this.state.promptValue), 


React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:this.prompt.bind(this, this.title, this.promptResponse)}, 

React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'prompt with title & callback'))), 





React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:this.prompt.bind(this, this.title, this.buttons)}, 

React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'prompt with title & custom buttons'))), 





React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:this.prompt.bind(this, this.title, this.defaultValue, this.promptResponse)}, 

React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'prompt with title, default value & callback'))), 





React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:this.prompt.bind(this, this.title, this.defaultValue, this.buttons)}, 

React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'prompt with title, default value & custom buttons')))));}}, {key:'prompt', value:








function prompt(){

AlertIOS.prompt.apply(AlertIOS, arguments);}}, {key:'promptResponse', value:


function promptResponse(promptValue){
this.setState({promptValue:promptValue});}}]);return PromptExample;})(React.Component);



var styles=StyleSheet.create({
wrapper:{
borderRadius:5, 
marginBottom:5}, 

button:{
backgroundColor:'#eeeeee', 
padding:10}});});
__d('AppStateIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');var 

AppStateIOS=


React.AppStateIOS;var Text=React.Text;var View=React.View;

var AppStateSubscription=React.createClass({displayName:'AppStateSubscription', 
getInitialState:function(){
return {
appState:AppStateIOS.currentState, 
previousAppStates:[], 
memoryWarnings:0};}, 


componentDidMount:function(){
AppStateIOS.addEventListener('change', this._handleAppStateChange);
AppStateIOS.addEventListener('memoryWarning', this._handleMemoryWarning);}, 

componentWillUnmount:function(){
AppStateIOS.removeEventListener('change', this._handleAppStateChange);
AppStateIOS.removeEventListener('memoryWarning', this._handleMemoryWarning);}, 

_handleMemoryWarning:function(){
this.setState({memoryWarnings:this.state.memoryWarnings + 1});}, 

_handleAppStateChange:function(appState){
var previousAppStates=this.state.previousAppStates.slice();
previousAppStates.push(this.state.appState);
this.setState({
appState:appState, 
previousAppStates:previousAppStates});}, 


render:function(){
if(this.props.showMemoryWarnings){
return (
React.createElement(View, null, 
React.createElement(Text, null, this.state.memoryWarnings)));}



if(this.props.showCurrentOnly){
return (
React.createElement(View, null, 
React.createElement(Text, null, this.state.appState)));}



return (
React.createElement(View, null, 
React.createElement(Text, null, JSON.stringify(this.state.previousAppStates))));}});





exports.title = 'AppStateIOS';
exports.description = 'iOS app background status';
exports.examples = [
{
title:'AppStateIOS.currentState', 
description:'Can be null on app initialization', 
render:function(){return React.createElement(Text, null, AppStateIOS.currentState);}}, 

{
title:'Subscribed AppStateIOS:', 
description:'This changes according to the current state, so you can only ever see it rendered as "active"', 
render:function(){return React.createElement(AppStateSubscription, {showCurrentOnly:true});}}, 

{
title:'Previous states:', 
render:function(){return React.createElement(AppStateSubscription, {showCurrentOnly:false});}}, 

{
title:'Memory Warnings', 
description:'In the simulator, hit Shift+Command+M to simulate a memory warning.', 
render:function(){return React.createElement(AppStateSubscription, {showMemoryWarnings:true});}}];});
__d('react-native/Examples/UIExplorer/AsyncStorageExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

AsyncStorage=



React.AsyncStorage;var PickerIOS=React.PickerIOS;var Text=React.Text;var View=React.View;
var PickerItemIOS=PickerIOS.Item;

var STORAGE_KEY='@AsyncStorageExample:key';
var COLORS=['red', 'orange', 'yellow', 'green', 'blue'];

var BasicStorageExample=React.createClass({displayName:'BasicStorageExample', 
componentDidMount:function(){var _this=this;
AsyncStorage.getItem(STORAGE_KEY).
then(function(value){
if(value !== null){
_this.setState({selectedValue:value});
_this._appendMessage('Recovered selection from disk: ' + value);}else 
{
_this._appendMessage('Initialized with no selection on disk.');}}).


catch(function(error){return _this._appendMessage('AsyncStorage error: ' + error.message);}).
done();}, 

getInitialState:function(){
return {
selectedValue:COLORS[0], 
messages:[]};}, 



render:function(){
var color=this.state.selectedValue;
return (
React.createElement(View, null, 
React.createElement(PickerIOS, {
selectedValue:color, 
onValueChange:this._onValueChange}, 
COLORS.map(function(value){return (
React.createElement(PickerItemIOS, {
key:value, 
value:value, 
label:value}));})), 



React.createElement(Text, null, 
'Selected: ', 
React.createElement(Text, {style:{color:color}}, 
this.state.selectedValue)), 


React.createElement(Text, null, ' '), 
React.createElement(Text, {onPress:this._removeStorage}, 'Press here to remove from storage.'), 


React.createElement(Text, null, ' '), 
React.createElement(Text, null, 'Messages:'), 
this.state.messages.map(function(m){return React.createElement(Text, null, m);})));}, 




_onValueChange:function(selectedValue){var _this2=this;
this.setState({selectedValue:selectedValue});
AsyncStorage.setItem(STORAGE_KEY, selectedValue).
then(function(){return _this2._appendMessage('Saved selection to disk: ' + selectedValue);}).
catch(function(error){return _this2._appendMessage('AsyncStorage error: ' + error.message);}).
done();}, 


_removeStorage:function(){var _this3=this;
AsyncStorage.removeItem(STORAGE_KEY).
then(function(){return _this3._appendMessage('Selection removed from disk.');}).
catch(function(error){_this3._appendMessage('AsyncStorage error: ' + error.message);}).
done();}, 


_appendMessage:function(message){
this.setState({messages:this.state.messages.concat(message)});}});



exports.title = 'AsyncStorage';
exports.description = 'Asynchronous local disk storage.';
exports.examples = [
{
title:'Basics - getItem, setItem, removeItem', 
render:function(){return React.createElement(BasicStorageExample, null);}}];});
__d('react-native/Examples/UIExplorer/BorderExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';














var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=

React.StyleSheet;var View=React.View;

var styles=StyleSheet.create({
box:{
width:100, 
height:100}, 

border1:{
borderWidth:10, 
borderColor:'brown'}, 

borderRadius:{
borderWidth:10, 
borderRadius:10, 
borderColor:'cyan'}, 

border2:{
borderWidth:10, 
borderTopColor:'red', 
borderRightColor:'yellow', 
borderBottomColor:'green', 
borderLeftColor:'blue'}, 

border3:{
borderColor:'purple', 
borderTopWidth:10, 
borderRightWidth:20, 
borderBottomWidth:30, 
borderLeftWidth:40}, 

border4:{
borderTopWidth:10, 
borderTopColor:'red', 
borderRightWidth:20, 
borderRightColor:'yellow', 
borderBottomWidth:30, 
borderBottomColor:'green', 
borderLeftWidth:40, 
borderLeftColor:'blue'}, 

border5:{
borderRadius:50, 
borderTopWidth:10, 
borderTopColor:'red', 
borderRightWidth:20, 
borderRightColor:'yellow', 
borderBottomWidth:30, 
borderBottomColor:'green', 
borderLeftWidth:40, 
borderLeftColor:'blue'}, 

border6:{
borderTopWidth:10, 
borderTopColor:'red', 
borderRightWidth:20, 
borderRightColor:'yellow', 
borderBottomWidth:30, 
borderBottomColor:'green', 
borderLeftWidth:40, 
borderLeftColor:'blue', 

borderTopLeftRadius:100}, 

border7:{
borderWidth:10, 
borderColor:'rgba(255,0,0,0.5)', 
borderRadius:30, 
overflow:'hidden'}, 

border7_inner:{
backgroundColor:'blue', 
width:100, 
height:100}});



exports.title = 'Border';
exports.description = 'View borders';
exports.examples = [
{
title:'Equal-Width / Same-Color', 
description:'borderWidth & borderColor', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.border1]});}}, 


{
title:'Equal-Width / Same-Color', 
description:'borderWidth & borderColor & borderRadius', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.borderRadius]});}}, 


{
title:'Equal-Width Borders', 
description:'borderWidth & border*Color', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.border2]});}}, 


{
title:'Same-Color Borders', 
description:'border*Width & borderColor', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.border3]});}}, 


{
title:'Custom Borders', 
description:'border*Width & border*Color', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.border4]});}}, 


{
title:'Custom Borders', 
description:'border*Width & border*Color', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.border5]});}}, 


{
title:'Custom Borders', 
description:'border*Width & border*Color', 
render:function(){
return React.createElement(View, {style:[styles.box, styles.border6]});}}, 


{
title:'Custom Borders', 
description:'borderRadius & clipping', 
render:function(){
return (
React.createElement(View, {style:[styles.box, styles.border7]}, 
React.createElement(View, {style:styles.border7_inner})));}}];});
__d('react-native/Examples/UIExplorer/CameraRollExample.ios',["react-native/Libraries/react-native/react-native","CameraRollView"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

CameraRoll=






React.CameraRoll;var Image=React.Image;var SliderIOS=React.SliderIOS;var StyleSheet=React.StyleSheet;var SwitchIOS=React.SwitchIOS;var Text=React.Text;var View=React.View;

var CameraRollView=require('CameraRollView');

var CAMERA_ROLL_VIEW='camera_roll_view';

var CameraRollExample=React.createClass({displayName:'CameraRollExample', 

getInitialState:function(){
return {
groupTypes:'SavedPhotos', 
sliderValue:1, 
bigImages:true};}, 



render:function(){
return (
React.createElement(View, null, 
React.createElement(SwitchIOS, {
onValueChange:this._onSwitchChange, 
value:this.state.bigImages}), 
React.createElement(Text, null, (this.state.bigImages?'Big':'Small') + ' Images'), 
React.createElement(SliderIOS, {
value:this.state.sliderValue, 
onValueChange:this._onSliderChange}), 

React.createElement(Text, null, 'Group Type: ' + this.state.groupTypes), 
React.createElement(CameraRollView, {
ref:CAMERA_ROLL_VIEW, 
batchSize:5, 
groupTypes:this.state.groupTypes, 
renderImage:this._renderImage})));}, 





_renderImage:function(asset){
var imageSize=this.state.bigImages?150:75;
var imageStyle=[styles.image, {width:imageSize, height:imageSize}];
var location=asset.node.location.longitude?
JSON.stringify(asset.node.location):'Unknown location';
return (
React.createElement(View, {key:asset, style:styles.row}, 
React.createElement(Image, {
source:asset.node.image, 
style:imageStyle}), 

React.createElement(View, {style:styles.info}, 
React.createElement(Text, {style:styles.url}, asset.node.image.uri), 
React.createElement(Text, null, location), 
React.createElement(Text, null, asset.node.group_name), 
React.createElement(Text, null, new Date(asset.node.timestamp).toString()))));}, 





_onSliderChange:function(value){
var options=CameraRoll.GroupTypesOptions;
var index=Math.floor(value * options.length * 0.99);
var groupTypes=options[index];
if(groupTypes !== this.state.groupTypes){
this.setState({groupTypes:groupTypes});}}, 



_onSwitchChange:function(value){
this.refs[CAMERA_ROLL_VIEW].rendererChanged();
this.setState({bigImages:value});}});



var styles=StyleSheet.create({
row:{
flexDirection:'row', 
flex:1}, 

url:{
fontSize:9, 
marginBottom:14}, 

image:{
margin:4}, 

info:{
flex:1}});



exports.title = '<CameraRollView>';
exports.description = 'Example component that uses CameraRoll to list user\'s photos';
exports.examples = [
{
title:'Photos', 
render:function(){return React.createElement(CameraRollExample, null);}}];});
__d('CameraRollView',["react-native/Libraries/react-native/react-native","groupByEveryN","logError"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';

















var React=require('react-native/Libraries/react-native/react-native');var 

ActivityIndicatorIOS=





React.ActivityIndicatorIOS;var CameraRoll=React.CameraRoll;var Image=React.Image;var ListView=React.ListView;var StyleSheet=React.StyleSheet;var View=React.View;

var groupByEveryN=require('groupByEveryN');
var logError=require('logError');

var propTypes={





groupTypes:React.PropTypes.oneOf([
'Album', 
'All', 
'Event', 
'Faces', 
'Library', 
'PhotoStream', 
'SavedPhotos']), 





batchSize:React.PropTypes.number, 




renderImage:React.PropTypes.func, 




imagesPerRow:React.PropTypes.number, 




assetType:React.PropTypes.oneOf([
'Photos', 
'Videos', 
'All'])};




var CameraRollView=React.createClass({displayName:'CameraRollView', 
propTypes:propTypes, 

getDefaultProps:function(){
return {
groupTypes:'SavedPhotos', 
batchSize:5, 
imagesPerRow:1, 
assetType:'Photos', 
renderImage:function(asset){
var imageSize=150;
var imageStyle=[styles.image, {width:imageSize, height:imageSize}];
return (
React.createElement(Image, {
source:asset.node.image, 
style:imageStyle}));}};}, 






getInitialState:function(){
var ds=new ListView.DataSource({rowHasChanged:this._rowHasChanged});

return {
assets:[], 
groupTypes:this.props.groupTypes, 
lastCursor:null, 
assetType:this.props.assetType, 
noMore:false, 
loadingMore:false, 
dataSource:ds};}, 







rendererChanged:function(){
var ds=new ListView.DataSource({rowHasChanged:this._rowHasChanged});
this.state.dataSource = ds.cloneWithRows(
groupByEveryN(this.state.assets, this.props.imagesPerRow));}, 



componentDidMount:function(){
this.fetch();}, 


componentWillReceiveProps:function(nextProps){
if(this.props.groupTypes !== nextProps.groupTypes){
this.fetch(true);}}, 



_fetch:function(clear){
if(clear){
this.setState(this.getInitialState(), this.fetch);
return;}


var fetchParams={
first:this.props.batchSize, 
groupTypes:this.props.groupTypes, 
assetType:this.props.assetType};

if(this.state.lastCursor){
fetchParams.after = this.state.lastCursor;}


CameraRoll.getPhotos(fetchParams, this._appendAssets, logError);}, 






fetch:function(clear){var _this=this;
if(!this.state.loadingMore){
this.setState({loadingMore:true}, function(){_this._fetch(clear);});}}, 



render:function(){
return (
React.createElement(ListView, {
renderRow:this._renderRow, 
renderFooter:this._renderFooterSpinner, 
onEndReached:this._onEndReached, 
style:styles.container, 
dataSource:this.state.dataSource}));}, 




_rowHasChanged:function(r1, r2){
if(r1.length !== r2.length){
return true;}


for(var i=0; i < r1.length; i++) {
if(r1[i] !== r2[i]){
return true;}}



return false;}, 


_renderFooterSpinner:function(){
if(!this.state.noMore){
return React.createElement(ActivityIndicatorIOS, {style:styles.spinner});}

return null;}, 



_renderRow:function(rowData, sectionID, rowID){var _this2=this;
var images=rowData.map(function(image){
if(image === null){
return null;}

return _this2.props.renderImage(image);});


return (
React.createElement(View, {style:styles.row}, 
images));}, 




_appendAssets:function(data){
var assets=data.edges;
var newState={loadingMore:false};

if(!data.page_info.has_next_page){
newState.noMore = true;}


if(assets.length > 0){
newState.lastCursor = data.page_info.end_cursor;
newState.assets = this.state.assets.concat(assets);
newState.dataSource = this.state.dataSource.cloneWithRows(
groupByEveryN(newState.assets, this.props.imagesPerRow));}



this.setState(newState);}, 


_onEndReached:function(){
if(!this.state.noMore){
this.fetch();}}});




var styles=StyleSheet.create({
row:{
flexDirection:'row', 
flex:1}, 

url:{
fontSize:9, 
marginBottom:14}, 

image:{
margin:4}, 

info:{
flex:1}, 

container:{
flex:1}});



module.exports = CameraRollView;});
__d('groupByEveryN',[],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';




























function groupByEveryN(array, n){
var result=[];
var temp=[];

for(var i=0; i < array.length; ++i) {
if(i > 0 && i % n === 0){
result.push(temp);
temp = [];}

temp.push(array[i]);}


if(temp.length > 0){
while(temp.length !== n) {
temp.push(null);}

result.push(temp);}


return result;}


module.exports = groupByEveryN;});
__d('react-native/Examples/UIExplorer/LayoutEventsExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

Image=




React.Image;var LayoutAnimation=React.LayoutAnimation;var StyleSheet=React.StyleSheet;var Text=React.Text;var View=React.View;












var LayoutEventExample=React.createClass({displayName:'LayoutEventExample', 
getInitialState:function(){
return {
viewStyle:{
margin:20}};}, 



animateViewLayout:function(){var _this=this;
LayoutAnimation.configureNext(
LayoutAnimation.Presets.spring, 
function(){
console.log('layout animation done.');
_this.addWrapText();}, 

function(error){throw new Error(JSON.stringify(error));});

this.setState({
viewStyle:{
margin:this.state.viewStyle.margin > 20?20:60}});}, 



addWrapText:function(){
this.setState(
{extraText:'  And a bunch more text to wrap around a few lines.'}, 
this.changeContainer);}, 


changeContainer:function(){
this.setState({containerStyle:{width:280}});}, 

onViewLayout:function(e){
console.log('received view layout event\n', e.nativeEvent);
this.setState({viewLayout:e.nativeEvent.layout});}, 

onTextLayout:function(e){
console.log('received text layout event\n', e.nativeEvent);
this.setState({textLayout:e.nativeEvent.layout});}, 

onImageLayout:function(e){
console.log('received image layout event\n', e.nativeEvent);
this.setState({imageLayout:e.nativeEvent.layout});}, 

render:function(){
var viewStyle=[styles.view, this.state.viewStyle];
var textLayout=this.state.textLayout || {width:'?', height:'?'};
var imageLayout=this.state.imageLayout || {x:'?', y:'?'};
return (
React.createElement(View, {style:this.state.containerStyle}, 
React.createElement(Text, null, 'onLayout events are called on mount and whenever layout is updated, including after layout animations complete.', 

'  ', 
React.createElement(Text, {style:styles.pressText, onPress:this.animateViewLayout}, 'Press here to change layout.')), 



React.createElement(View, {ref:'view', onLayout:this.onViewLayout, style:viewStyle}, 
React.createElement(Image, {
ref:'img', 
onLayout:this.onImageLayout, 
style:styles.image, 
source:{uri:'https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-prn1/t39.1997/p128x128/851561_767334496626293_1958532586_n.png'}}), 

React.createElement(Text, null, 'ViewLayout: ', 
JSON.stringify(this.state.viewLayout, null, '  ') + '\n\n'), 

React.createElement(Text, {ref:'txt', onLayout:this.onTextLayout, style:styles.text}, 'A simple piece of text.', 
this.state.extraText), 

React.createElement(Text, null, 
'\n', 'Text w/h: ', 
textLayout.width, '/', textLayout.height + '\n', 'Image x/y: ', 
imageLayout.x, '/', imageLayout.y))));}});







var styles=StyleSheet.create({
view:{
padding:12, 
borderColor:'black', 
borderWidth:0.5, 
backgroundColor:'transparent'}, 

text:{
alignSelf:'flex-start', 
borderColor:'rgba(0, 0, 255, 0.2)', 
borderWidth:0.5}, 

image:{
width:50, 
height:50, 
marginBottom:10, 
alignSelf:'center'}, 

pressText:{
fontWeight:'bold'}});



exports.title = 'onLayout';
exports.description = 'Layout events can be used to measure view size and position.';
exports.examples = [
{
title:'onLayout', 
render:function(){
return React.createElement(LayoutEventExample, null);}}];});
__d('react-native/Examples/UIExplorer/NetInfoExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

NetInfo=


React.NetInfo;var Text=React.Text;var View=React.View;

var ReachabilitySubscription=React.createClass({displayName:'ReachabilitySubscription', 
getInitialState:function(){
return {
reachabilityHistory:[]};}, 


componentDidMount:function(){
NetInfo.addEventListener(
'change', 
this._handleReachabilityChange);}, 


componentWillUnmount:function(){
NetInfo.removeEventListener(
'change', 
this._handleReachabilityChange);}, 


_handleReachabilityChange:function(reachability){
var reachabilityHistory=this.state.reachabilityHistory.slice();
reachabilityHistory.push(reachability);
this.setState({
reachabilityHistory:reachabilityHistory});}, 


render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, null, JSON.stringify(this.state.reachabilityHistory))));}});





var ReachabilityCurrent=React.createClass({displayName:'ReachabilityCurrent', 
getInitialState:function(){
return {
reachability:null};}, 


componentDidMount:function(){var _this=this;
NetInfo.addEventListener(
'change', 
this._handleReachabilityChange);

NetInfo.fetch().done(
function(reachability){_this.setState({reachability:reachability});});}, 


componentWillUnmount:function(){
NetInfo.removeEventListener(
'change', 
this._handleReachabilityChange);}, 


_handleReachabilityChange:function(reachability){
this.setState({
reachability:reachability});}, 


render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, null, this.state.reachability)));}});





var IsConnected=React.createClass({displayName:'IsConnected', 
getInitialState:function(){
return {
isConnected:null};}, 


componentDidMount:function(){var _this2=this;
NetInfo.isConnected.addEventListener(
'change', 
this._handleConnectivityChange);

NetInfo.isConnected.fetch().done(
function(isConnected){_this2.setState({isConnected:isConnected});});}, 


componentWillUnmount:function(){
NetInfo.isConnected.removeEventListener(
'change', 
this._handleConnectivityChange);}, 


_handleConnectivityChange:function(isConnected){
this.setState({
isConnected:isConnected});}, 


render:function(){
return (
React.createElement(View, null, 
React.createElement(Text, null, this.state.isConnected?'Online':'Offline')));}});





exports.title = 'NetInfo';
exports.description = 'Monitor network status';
exports.examples = [
{
title:'NetInfo.isConnected', 
description:'Asynchronously load and observe connectivity', 
render:function(){return React.createElement(IsConnected, null);}}, 

{
title:'NetInfo.reachabilityIOS', 
description:'Asynchronously load and observe iOS reachability', 
render:function(){return React.createElement(ReachabilityCurrent, null);}}, 

{
title:'NetInfo.reachabilityIOS', 
description:'Observed updates to iOS reachability', 
render:function(){return React.createElement(ReachabilitySubscription, null);}}];});
__d('react-native/Examples/UIExplorer/PointerEventsExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=


React.StyleSheet;var Text=React.Text;var View=React.View;

var ExampleBox=React.createClass({displayName:'ExampleBox', 
getInitialState:function(){
return {
log:[]};}, 


handleLog:function(msg){
this.state.log = this.state.log.concat([msg]);}, 

flushReactChanges:function(){
this.forceUpdate();}, 





handleTouchCapture:function(){
this.state.log = this.state.log.concat(['---']);}, 

render:function(){
return (
React.createElement(View, null, 
React.createElement(View, {
onTouchEndCapture:this.handleTouchCapture, 
onTouchStart:this.flushReactChanges}, 
React.createElement(this.props.Component, {onLog:this.handleLog})), 

React.createElement(View, {
style:styles.logBox}, 
React.createElement(DemoText, {style:styles.logText}, 
this.state.log.join('\n')))));}});








var NoneExample=React.createClass({displayName:'NoneExample', 
render:function(){var _this=this;
return (
React.createElement(View, {
onTouchStart:function(){return _this.props.onLog('A unspecified touched');}, 
style:styles.box}, 
React.createElement(DemoText, {style:styles.text}, 'A: unspecified'), 


React.createElement(View, {
pointerEvents:'none', 
onTouchStart:function(){return _this.props.onLog('B none touched');}, 
style:[styles.box, styles.boxPassedThrough]}, 
React.createElement(DemoText, {style:[styles.text, styles.textPassedThrough]}, 'B: none'), 


React.createElement(View, {
onTouchStart:function(){return _this.props.onLog('C unspecified touched');}, 
style:[styles.box, styles.boxPassedThrough]}, 
React.createElement(DemoText, {style:[styles.text, styles.textPassedThrough]}, 'C: unspecified')))));}});













var DemoText=React.createClass({displayName:'DemoText', 
render:function(){
return (
React.createElement(View, {pointerEvents:'none'}, 
React.createElement(Text, {
style:this.props.style}, 
this.props.children)));}});






var BoxNoneExample=React.createClass({displayName:'BoxNoneExample', 
render:function(){var _this2=this;
return (
React.createElement(View, {
onTouchStart:function(){return _this2.props.onLog('A unspecified touched');}, 
style:styles.box}, 
React.createElement(DemoText, {style:styles.text}, 'A: unspecified'), 


React.createElement(View, {
pointerEvents:'box-none', 
onTouchStart:function(){return _this2.props.onLog('B box-none touched');}, 
style:[styles.box, styles.boxPassedThrough]}, 
React.createElement(DemoText, {style:[styles.text, styles.textPassedThrough]}, 'B: box-none'), 


React.createElement(View, {
onTouchStart:function(){return _this2.props.onLog('C unspecified touched');}, 
style:styles.box}, 
React.createElement(DemoText, {style:styles.text}, 'C: unspecified')), 



React.createElement(View, {
pointerEvents:'auto', 
onTouchStart:function(){return _this2.props.onLog('C explicitly unspecified touched');}, 
style:[styles.box]}, 
React.createElement(DemoText, {style:[styles.text]}, 'C: explicitly unspecified')))));}});









var BoxOnlyExample=React.createClass({displayName:'BoxOnlyExample', 
render:function(){var _this3=this;
return (
React.createElement(View, {
onTouchStart:function(){return _this3.props.onLog('A unspecified touched');}, 
style:styles.box}, 
React.createElement(DemoText, {style:styles.text}, 'A: unspecified'), 


React.createElement(View, {
pointerEvents:'box-only', 
onTouchStart:function(){return _this3.props.onLog('B box-only touched');}, 
style:styles.box}, 
React.createElement(DemoText, {style:styles.text}, 'B: box-only'), 


React.createElement(View, {
onTouchStart:function(){return _this3.props.onLog('C unspecified touched');}, 
style:[styles.box, styles.boxPassedThrough]}, 
React.createElement(DemoText, {style:[styles.text, styles.textPassedThrough]}, 'C: unspecified')), 



React.createElement(View, {
pointerEvents:'auto', 
onTouchStart:function(){return _this3.props.onLog('C explicitly unspecified touched');}, 
style:[styles.box, styles.boxPassedThrough]}, 
React.createElement(DemoText, {style:[styles.text, styles.textPassedThrough]}, 'C: explicitly unspecified')))));}});















var exampleClasses=[
{
Component:NoneExample, 
title:'`none`', 
description:'`none` causes touch events on the container and its child components to pass through to the parent container.'}, 

{
Component:BoxNoneExample, 
title:'`box-none`', 
description:'`box-none` causes touch events on the container to pass through and will only detect touch events on its child components.'}, 

{
Component:BoxOnlyExample, 
title:'`box-only`', 
description:'`box-only` causes touch events on the container\'s child components to pass through and will only detect touch events on the container itself.'}];



var infoToExample=function(info){
return {
title:info.title, 
description:info.description, 
render:function(){
return React.createElement(ExampleBox, {key:info.title, Component:info.Component});}};};




var styles=StyleSheet.create({
text:{
fontSize:10, 
color:'#5577cc'}, 

textPassedThrough:{
color:'#88aadd'}, 

box:{
backgroundColor:'#aaccff', 
borderWidth:1, 
borderColor:'#7799cc', 
padding:10, 
margin:5}, 

boxPassedThrough:{
borderColor:'#99bbee'}, 

logText:{
fontSize:9}, 

logBox:{
padding:20, 
margin:10, 
borderWidth:0.5, 
borderColor:'#f0f0f0', 
backgroundColor:'#f9f9f9'}, 

bottomSpacer:{
marginBottom:100}});



exports.framework = 'React';
exports.title = 'Pointer Events';
exports.description = '`pointerEvents` is a prop of View that gives control ' + 
'of how touches should be handled.';
exports.examples = exampleClasses.map(infoToExample);});
__d('react-native/Examples/UIExplorer/PushNotificationIOSExample',["react-native/Libraries/react-native/react-native","RCTDeviceEventEmitter"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}
















var React=require('react-native/Libraries/react-native/react-native');var 

AlertIOS=





React.AlertIOS;var PushNotificationIOS=React.PushNotificationIOS;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var View=React.View;

var Button=React.createClass({displayName:'Button', 
render:function(){
return (
React.createElement(TouchableHighlight, {
underlayColor:'white', 
style:styles.button, 
onPress:this.props.onPress}, 
React.createElement(Text, {style:styles.buttonLabel}, 
this.props.label)));}});var 






NotificationExample=(function(_React$Component){function NotificationExample(){_classCallCheck(this, NotificationExample);if(_React$Component != null){_React$Component.apply(this, arguments);}}_inherits(NotificationExample, _React$Component);_createClass(NotificationExample, [{key:'componentWillMount', value:
function componentWillMount(){
PushNotificationIOS.addEventListener('notification', this._onNotification);}}, {key:'componentWillUnmount', value:


function componentWillUnmount(){
PushNotificationIOS.removeEventListener('notification', this._onNotification);}}, {key:'render', value:


function render(){
return (
React.createElement(View, null, 
React.createElement(Button, {
onPress:this._sendNotification, 
label:'Send fake notification'})));}}, {key:'_sendNotification', value:





function _sendNotification(){
require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
aps:{
alert:'Sample notification', 
badge:'+1', 
sound:'default', 
category:'REACT_NATIVE'}});}}, {key:'_onNotification', value:




function _onNotification(notification){
AlertIOS.alert(
'Notification Received', 
'Alert message: ' + notification.getMessage(), 
[{
text:'Dismiss', 
onPress:null}]);}}]);return NotificationExample;})(React.Component);var 





NotificationPermissionExample=(function(_React$Component2){
function NotificationPermissionExample(props){_classCallCheck(this, NotificationPermissionExample);
_get(Object.getPrototypeOf(NotificationPermissionExample.prototype), 'constructor', this).call(this, props);
this.state = {permissions:null};}_inherits(NotificationPermissionExample, _React$Component2);_createClass(NotificationPermissionExample, [{key:'render', value:


function render(){
return (
React.createElement(View, null, 
React.createElement(Button, {
onPress:this._showPermissions.bind(this), 
label:'Show enabled permissions'}), 

React.createElement(Text, null, 
JSON.stringify(this.state.permissions))));}}, {key:'_showPermissions', value:





function _showPermissions(){var _this=this;
PushNotificationIOS.checkPermissions(function(permissions){
_this.setState({permissions:permissions});});}}]);return NotificationPermissionExample;})(React.Component);




var styles=StyleSheet.create({
button:{
padding:10, 
alignItems:'center', 
justifyContent:'center'}, 

buttonLabel:{
color:'blue'}});



exports.title = 'PushNotificationIOS';
exports.description = 'Apple PushNotification and badge value';
exports.examples = [
{
title:'Badge Number', 
render:function(){
PushNotificationIOS.requestPermissions();

return (
React.createElement(View, null, 
React.createElement(Button, {
onPress:function(){return PushNotificationIOS.setApplicationIconBadgeNumber(42);}, 
label:'Set app\'s icon badge to 42'}), 

React.createElement(Button, {
onPress:function(){return PushNotificationIOS.setApplicationIconBadgeNumber(0);}, 
label:'Clear app\'s icon badge'})));}}, 





{
title:'Push Notifications', 
render:function(){
return React.createElement(NotificationExample, null);}}, 


{
title:'Notifications Permissions', 
render:function(){
return React.createElement(NotificationPermissionExample, null);}}];});
__d('react-native/Examples/UIExplorer/StatusBarIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=




React.StyleSheet;var View=React.View;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var StatusBarIOS=React.StatusBarIOS;

exports.framework = 'React';
exports.title = 'StatusBarIOS';
exports.description = 'Module for controlling iOS status bar';
exports.examples = [{
title:'Status Bar Style', 
render:function(){
return (
React.createElement(View, null, 
['default', 'light-content'].map(function(style){return (
React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return StatusBarIOS.setStyle(style);}}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'setStyle(\'', style, '\')'))));})));}}, 






{
title:'Status Bar Style Animated', 
render:function(){
return (
React.createElement(View, null, 
['default', 'light-content'].map(function(style){return (
React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return StatusBarIOS.setStyle(style, true);}}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'setStyle(\'', style, '\', true)'))));})));}}, 






{
title:'Status Bar Hidden', 
render:function(){
return (
React.createElement(View, null, 
['none', 'fade', 'slide'].map(function(animation){return (
React.createElement(View, null, 
React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return StatusBarIOS.setHidden(true, animation);}}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'setHidden(true, \'', animation, '\')'))), 


React.createElement(TouchableHighlight, {style:styles.wrapper, 
onPress:function(){return StatusBarIOS.setHidden(false, animation);}}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'setHidden(false, \'', animation, '\')')))));})));}}];









var styles=StyleSheet.create({
wrapper:{
borderRadius:5, 
marginBottom:5}, 

button:{
backgroundColor:'#eeeeee', 
padding:10}});});
__d('react-native/Examples/UIExplorer/TimerExample',["react-native/Libraries/react-native/react-native","react-timer-mixin/TimerMixin"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

AlertIOS=




React.AlertIOS;var StyleSheet=React.StyleSheet;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var View=React.View;
var TimerMixin=require('react-timer-mixin/TimerMixin');

var Button=React.createClass({displayName:'Button', 
render:function(){
return (
React.createElement(TouchableHighlight, {
onPress:this.props.onPress, 
style:styles.button, 
underlayColor:'#eeeeee'}, 
React.createElement(Text, null, 
this.props.children)));}});






var TimerTester=React.createClass({displayName:'TimerTester', 
mixins:[TimerMixin], 

_ii:0, 
_iters:0, 
_start:0, 
_timerFn:null, 
_handle:null, 

render:function(){
var args='fn' + (this.props.dt !== undefined?', ' + this.props.dt:'');
return (
React.createElement(Button, {onPress:this._run}, 'Measure: ', 
this.props.type, '(', args, ') - ', this._ii || 0));}, 




_run:function(){var _this=this;
if(!this._start){
var d=new Date();
this._start = d.getTime();
this._iters = 100;
this._ii = 0;
if(this.props.type === 'setTimeout'){
if(this.props.dt < 1){
this._iters = 5000;}else 
if(this.props.dt > 20){
this._iters = 10;}

this._timerFn = function(){return _this.setTimeout(_this._run, _this.props.dt);};}else 
if(this.props.type === 'requestAnimationFrame'){
this._timerFn = function(){return _this.requestAnimationFrame(_this._run);};}else 
if(this.props.type === 'setImmediate'){
this._iters = 5000;
this._timerFn = function(){return _this.setImmediate(_this._run);};}else 
if(this.props.type === 'setInterval'){
this._iters = 30;
this._timerFn = null;
this._handle = this.setInterval(this._run, this.props.dt);}}


if(this._ii >= this._iters && !this._handle){
var d=new Date();
var e=d.getTime() - this._start;
var msg='Finished ' + this._ii + ' ' + this.props.type + ' calls.\n' + 
'Elapsed time: ' + e + ' ms\n' + e / this._ii + ' ms / iter';
console.log(msg);
AlertIOS.alert(msg);
this._start = 0;
this.forceUpdate(function(){_this._ii = 0;});
return;}

this._ii++;

if(this._ii % (this._iters / 5) === 0){
this.forceUpdate();}

this._timerFn && this._timerFn();}, 


clear:function(){
this.clearInterval(this._handle);
if(this._handle){

this._handle = null;
this._iters = this._ii;
this._run();}}});




var styles=StyleSheet.create({
button:{
borderColor:'gray', 
borderRadius:8, 
borderWidth:1, 
padding:10, 
margin:5, 
alignItems:'center', 
justifyContent:'center'}});



exports.framework = 'React';
exports.title = 'Timers, TimerMixin';
exports.description = 'The TimerMixin provides timer functions for executing ' + 
'code in the future that are safely cleaned up when the component unmounts.';

exports.examples = [
{
title:'this.setTimeout(fn, t)', 
description:'Execute function fn t milliseconds in the future.  If ' + 
't === 0, it will be enqueued immediately in the next event loop.  ' + 
'Larger values will fire on the closest frame.', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(TimerTester, {type:'setTimeout', dt:0}), 
React.createElement(TimerTester, {type:'setTimeout', dt:1}), 
React.createElement(TimerTester, {type:'setTimeout', dt:100})));}}, 




{
title:'this.requestAnimationFrame(fn)', 
description:'Execute function fn on the next frame.', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(TimerTester, {type:'requestAnimationFrame'})));}}, 




{
title:'this.setImmediate(fn)', 
description:'Execute function fn at the end of the current JS event loop.', 
render:function(){
return (
React.createElement(View, null, 
React.createElement(TimerTester, {type:'setImmediate'})));}}, 




{
title:'this.setInterval(fn, t)', 
description:'Execute function fn every t milliseconds until cancelled ' + 
'or component is unmounted.', 
render:function(){
var IntervalExample=React.createClass({displayName:'IntervalExample', 
getInitialState:function(){
return {
showTimer:true};}, 



render:function(){var _this2=this;
if(this.state.showTimer){
var timer=
React.createElement(TimerTester, {ref:'interval', dt:25, type:'setInterval'});
var toggleText='Unmount timer';}else 
{
var timer=null;
var toggleText='Mount new timer';}

return (
React.createElement(View, null, 
timer, 
React.createElement(Button, {onPress:function(){return _this2.refs.interval.clear();}}, 'Clear interval'), 


React.createElement(Button, {onPress:this._toggleTimer}, 
toggleText)));}, 





_toggleTimer:function(){
this.setState({showTimer:!this.state.showTimer});}});


return React.createElement(IntervalExample, null);}}];});
__d('react-native/Examples/UIExplorer/VibrationIOSExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';
















var React=require('react-native/Libraries/react-native/react-native');var 

StyleSheet=




React.StyleSheet;var View=React.View;var Text=React.Text;var TouchableHighlight=React.TouchableHighlight;var VibrationIOS=React.VibrationIOS;

exports.framework = 'React';
exports.title = 'VibrationIOS';
exports.description = 'Vibration API for iOS';
exports.examples = [{
title:'VibrationIOS.vibrate()', 
render:function(){
return (
React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:function(){return VibrationIOS.vibrate();}}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Vibrate'))));}}];






var styles=StyleSheet.create({
wrapper:{
borderRadius:5, 
marginBottom:5}, 

button:{
backgroundColor:'#eeeeee', 
padding:10}});});
__d('react-native/Examples/UIExplorer/XHRExample',["react-native/Libraries/react-native/react-native"],function(global, require, requireDynamic, requireLazy, module, exports) {  'use strict';var _extends=Object.assign || function(target){for(var i=1; i < arguments.length; i++) {var source=arguments[i];for(var key in source) {if(Object.prototype.hasOwnProperty.call(source, key)){target[key] = source[key];}}}return target;};var _createClass=(function(){function defineProperties(target, props){for(var i=0; i < props.length; i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function(Constructor, protoProps, staticProps){if(protoProps)defineProperties(Constructor.prototype, protoProps);if(staticProps)defineProperties(Constructor, staticProps);return Constructor;};})();var _get=function get(object, property, receiver){var desc=Object.getOwnPropertyDescriptor(object, property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {return get(parent, property, receiver);}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass, superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, {constructor:{value:subClass, enumerable:false, writable:true, configurable:true}});if(superClass)subClass.__proto__ = superClass;}
















var React=require('react-native/Libraries/react-native/react-native');var 

AlertIOS=










React.AlertIOS;var CameraRoll=React.CameraRoll;var Image=React.Image;var LinkingIOS=React.LinkingIOS;var PixelRatio=React.PixelRatio;var ProgressViewIOS=React.ProgressViewIOS;var StyleSheet=React.StyleSheet;var Text=React.Text;var TextInput=React.TextInput;var TouchableHighlight=React.TouchableHighlight;var View=React.View;var 

Downloader=(function(_React$Component){




function Downloader(props){_classCallCheck(this, Downloader);
_get(Object.getPrototypeOf(Downloader.prototype), 'constructor', this).call(this, props);
this.cancelled = false;
this.state = {
downloading:false, 
contentSize:1, 
downloaded:0};}_inherits(Downloader, _React$Component);_createClass(Downloader, [{key:'download', value:



function download(){var _this=this;
this.xhr && this.xhr.abort();

var xhr=this.xhr || new XMLHttpRequest();
xhr.onreadystatechange = function(){
if(xhr.readyState === xhr.HEADERS_RECEIVED){
var contentSize=parseInt(xhr.getResponseHeader('Content-Length'), 10);
_this.setState({
contentSize:contentSize, 
downloaded:0});}else 

if(xhr.readyState === xhr.LOADING){
_this.setState({
downloaded:xhr.responseText.length});}else 

if(xhr.readyState === xhr.DONE){
_this.setState({
downloading:false});

if(_this.cancelled){
_this.cancelled = false;
return;}

if(xhr.status === 200){
alert('Download complete!');}else 
if(xhr.status !== 0){
alert('Error: Server returned HTTP status of ' + xhr.status + ' ' + xhr.responseText);}else 
{
alert('Error: ' + xhr.responseText);}}};



xhr.open('GET', 'http://www.gutenberg.org/cache/epub/100/pg100.txt');
xhr.send();
this.xhr = xhr;

this.setState({downloading:true});}}, {key:'componentWillUnmount', value:


function componentWillUnmount(){
this.cancelled = true;
this.xhr && this.xhr.abort();}}, {key:'render', value:


function render(){
var button=this.state.downloading?
React.createElement(View, {style:styles.wrapper}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Downloading...'))):



React.createElement(TouchableHighlight, {
style:styles.wrapper, 
onPress:this.download.bind(this)}, 
React.createElement(View, {style:styles.button}, 
React.createElement(Text, null, 'Download 5MB Text File')));




return (
React.createElement(View, null, 
button, 
React.createElement(ProgressViewIOS, {progress:this.state.downloaded / this.state.contentSize})));}}]);return Downloader;})(React.Component);





var PAGE_SIZE=20;var 

FormUploader=(function(_React$Component2){






function FormUploader(props){_classCallCheck(this, FormUploader);
_get(Object.getPrototypeOf(FormUploader.prototype), 'constructor', this).call(this, props);
this.state = {
isUploading:false, 
randomPhoto:null, 
textParams:[]};

this._isMounted = true;
this._fetchRandomPhoto = this._fetchRandomPhoto.bind(this);
this._addTextParam = this._addTextParam.bind(this);
this._upload = this._upload.bind(this);

this._fetchRandomPhoto();}_inherits(FormUploader, _React$Component2);_createClass(FormUploader, [{key:'_fetchRandomPhoto', value:


function _fetchRandomPhoto(){var _this2=this;
CameraRoll.getPhotos(
{first:PAGE_SIZE}, 
function(data){
console.log('isMounted', _this2._isMounted);
if(!_this2._isMounted){
return;}

var edges=data.edges;
var edge=edges[Math.floor(Math.random() * edges.length)];
var randomPhoto=edge && edge.node && edge.node.image;
if(randomPhoto){
_this2.setState({randomPhoto:randomPhoto});}}, 


function(error){return undefined;});}}, {key:'_addTextParam', value:



function _addTextParam(){
var textParams=this.state.textParams;
textParams.push({name:'', value:''});
this.setState({textParams:textParams});}}, {key:'componentWillUnmount', value:


function componentWillUnmount(){
this._isMounted = false;}}, {key:'_onTextParamNameChange', value:


function _onTextParamNameChange(index, text){
var textParams=this.state.textParams;
textParams[index].name = text;
this.setState({textParams:textParams});}}, {key:'_onTextParamValueChange', value:


function _onTextParamValueChange(index, text){
var textParams=this.state.textParams;
textParams[index].value = text;
this.setState({textParams:textParams});}}, {key:'_upload', value:


function _upload(){var _this3=this;
var xhr=new XMLHttpRequest();
xhr.open('POST', 'http://posttestserver.com/post.php');
xhr.onload = function(){
_this3.setState({isUploading:false});
if(xhr.status !== 200){
AlertIOS.alert(
'Upload failed', 
'Expected HTTP 200 OK response, got ' + xhr.status);

return;}

if(!xhr.responseText){
AlertIOS.alert(
'Upload failed', 
'No response payload.');

return;}

var index=xhr.responseText.indexOf('http://www.posttestserver.com/');
if(index === -1){
AlertIOS.alert(
'Upload failed', 
'Invalid response payload.');

return;}

var url=xhr.responseText.slice(index).split('\n')[0];
LinkingIOS.openURL(url);};

var formdata=new FormData();
if(this.state.randomPhoto){
formdata.append('image', _extends({}, this.state.randomPhoto, {name:'image.jpg'}));}

this.state.textParams.forEach(
function(param){return formdata.append(param.name, param.value);});

xhr.send(formdata);
this.setState({isUploading:true});}}, {key:'render', value:


function render(){var _this4=this;
var image=null;
if(this.state.randomPhoto){
image = 
React.createElement(Image, {
source:this.state.randomPhoto, 
style:styles.randomPhoto});}



var textItems=this.state.textParams.map(function(item, index){return (
React.createElement(View, {style:styles.paramRow}, 
React.createElement(TextInput, {
autoCapitalize:'none', 
autoCorrect:false, 
onChangeText:_this4._onTextParamNameChange.bind(_this4, index), 
placeholder:'name...', 
style:styles.textInput}), 

React.createElement(Text, {style:styles.equalSign}, '='), 
React.createElement(TextInput, {
autoCapitalize:'none', 
autoCorrect:false, 
onChangeText:_this4._onTextParamValueChange.bind(_this4, index), 
placeholder:'value...', 
style:styles.textInput})));});



var uploadButtonLabel=this.state.isUploading?'Uploading...':'Upload';
var uploadButton=
React.createElement(View, {style:styles.uploadButtonBox}, 
React.createElement(Text, {style:styles.uploadButtonLabel}, uploadButtonLabel));


if(!this.state.isUploading){
uploadButton = 
React.createElement(TouchableHighlight, {onPress:this._upload}, 
uploadButton);}



return (
React.createElement(View, null, 
React.createElement(View, {style:[styles.paramRow, styles.photoRow]}, 
React.createElement(Text, {style:styles.photoLabel}, 'Random photo from your library (', 

React.createElement(Text, {style:styles.textButton, onPress:this._fetchRandomPhoto}, 'update'), ')'), 



image), 

textItems, 
React.createElement(View, null, 
React.createElement(Text, {
style:[styles.textButton, styles.addTextParamButton], 
onPress:this._addTextParam}, 'Add a text param')), 



React.createElement(View, {style:styles.uploadButton}, 
uploadButton)));}}]);return FormUploader;})(React.Component);







exports.framework = 'React';
exports.title = 'XMLHttpRequest';
exports.description = 'XMLHttpRequest';
exports.examples = [{
title:'File Download', 
render:function(){
return React.createElement(Downloader, null);}}, 

{
title:'multipart/form-data Upload', 
render:function(){
return React.createElement(FormUploader, null);}}];



var styles=StyleSheet.create({
wrapper:{
borderRadius:5, 
marginBottom:5}, 

button:{
backgroundColor:'#eeeeee', 
padding:8}, 

paramRow:{
flexDirection:'row', 
paddingVertical:8, 
alignItems:'center', 
borderBottomWidth:1 / PixelRatio.get(), 
borderBottomColor:'grey'}, 

photoLabel:{
flex:1}, 

randomPhoto:{
width:50, 
height:50}, 

textButton:{
color:'blue'}, 

addTextParamButton:{
marginTop:8}, 

textInput:{
flex:1, 
borderRadius:3, 
borderColor:'grey', 
borderWidth:1, 
height:30, 
paddingLeft:8}, 

equalSign:{
paddingHorizontal:4}, 

uploadButton:{
marginTop:16}, 

uploadButtonBox:{
flex:1, 
paddingVertical:12, 
alignItems:'center', 
backgroundColor:'blue', 
borderRadius:4}, 

uploadButtonLabel:{
color:'white', 
fontSize:16, 
fontWeight:'500'}});});
;require("UIExplorerApp");
//@ sourceMappingURL=/Examples/UIExplorer/UIExplorerApp.ios.includeRequire.runModule.map