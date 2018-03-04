const fs = require('fs');
const template = require('lodash/template');
const upperFirst = require('lodash/upperFirst');
const lowerFirst = require('lodash/lowerFirst');
const widgetTpl = require('./widget.tpl.hpp');
const addonTpl = require('./addon.tpl.cc');
const partial = require('./partial');

const compiledWidgetTpl = template(widgetTpl);
const compiledAddonTpl = template(addonTpl);

function resolveMethodNamePair(method) {
  const methodName = method.methodName ? method.methodName : upperFirst(method.name);
  const methodQtName = method.methodQtName ? method.methodQtName : method.name;
  return {
    methodName,
    methodQtName,
  };
}

function genRegisterMethods(methods) {
  return methods.map((method) => {
    const { methodName, methodQtName } = resolveMethodNamePair(method);
    return template(partial.registerMethod)({
      methodName: [methodQtName, methodName],
    });
  }).join('');
}

function genMethod(widgetName, widgetQtName, methods) {
  return methods.map((method) => {
    if (method.type === 'getter') {
      return getter(method);
    } else if (method.type === 'setter') {
      return setter(method);
    }
  }).join('\n');

  function getter(method) {
    const p = ({
      'null': partial.getterNoReturn,
      'string': partial.getterReturnString,
      'int': partial.getterReturnInt32,
      'bool': partial.getterReturnBool,
    })[String(method.ret)];

    const { methodName, methodQtName } = resolveMethodNamePair(method);

    return template(p)({
      methodName,
      methodQtName,
      widgetName,
      widgetQtName,
    });
  }

  function setter(method) {
    const p = ({
      'int': partial.setterWithInt32,
      'bool': partial.setterWithBool,
      'string': partial.setterWithString,
      'callback': partial.setterWithCallback,
    })[String(method.args[0])];

    const { methodName, methodQtName } = resolveMethodNamePair(method);

    return template(p)({
      methodName,
      methodQtName,
      widgetName,
      widgetQtName,
    });
  }
}

function genWidget({
  widgetQtName,
  widgetName,
  methods,
}) {

  const registeredMethods = genRegisterMethods(methods);

  return {
    name: `./qt-wrapper/${widgetName.toLowerCase()}.hpp`,
    content: compiledWidgetTpl({
      widgetName,
      widgetQtName,
      registeredMethodsCount: methods.length,
      registeredMethods: registeredMethods,
      methodBody: genMethod(widgetName, widgetQtName, methods),
    })
  };
}

function widgetToFile(widgets) {
  return widgets.map(genWidget).map(({name, content}) => fs.writeFileSync(name, content));
}

function genAddon(widgets) {
  const registeredWidgets = widgets.map(({ widgetName }) => {
    return template(partial.registerWidget)({
      widgetName,
    });
  }).join('\n');

  const headers = widgets.map(({widgetName}) => {
    return `#include "./qt-wrapper/${lowerFirst(widgetName)}.hpp"`;
  }).join('\n');

  return compiledAddonTpl({
    registeredWidgets,
    headers,
  });
}

function addonToFile(widgets) {
  const file = genAddon(widgets);
  fs.writeFileSync('./addon.cc', file);
}

widgetToFile(require('./widgets'));
addonToFile(require('./widgets'));
