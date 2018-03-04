const registerWidget = `
  <%= widgetName %>::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("create<%= widgetName %>").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(<%= widgetName %>::NewInstance)).ToLocalChecked()
  );
`;

const registerMethod = `
    Nan::SetPrototypeMethod(tpl, "<%= methodName[0] %>", <%= methodName[1] %>);
`;

const getterNoReturn = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>();
  }
`;

const getterReturnString = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    QString qtString = ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>();
    auto v8String = Nan::EmptyString();
    v8String->WriteUtf8(qtString.toUtf8().data(), qtString.length());
    info.GetReturnValue().Set(v8String);
  }
`;

const getterReturnInt32 = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    int value = ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>();
    info.GetReturnValue().Set(value);
  }
`;

const getterReturnBool = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    bool value = ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>();
    info.GetReturnValue().Set(value);
  }
`;

const setterWithString = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    v8::String::Utf8Value utf8Value(info[0]->ToString());
    ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>(QString(*utf8Value));
  }
`;

const setterWithBool = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>(info[0]->BooleanValue());
  }
`;

const setterWithInt32 = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    ((<%= widgetQtName %> *)obj->getWidget())-><%= methodQtName %>(info[0]->ToInt32());
  }
`;

const setterWithCallback = `
  static NAN_METHOD(<%= methodName %>) {
    <%= widgetName %>* obj = ObjectWrap::Unwrap<<%= widgetName %>>(info.Holder());
    if (info.Length() < 1) {
      Nan::ThrowError("Lack of callback.");
      return;
    }
    if (!info[0]->IsFunction()) {
      Nan::ThrowError("Callback must be function.");
      return;
    }
    v8::CopyablePersistentTraits<v8::Value>::CopyablePersistent p;
    p.Reset<v8::Value>(v8::Isolate::GetCurrent(), info[0]); //< Isolate required

    QObject::connect(((<%= widgetQtName %> *)obj->getWidget()), &<%= widgetQtName %>::<%= methodQtName %>, [p] () {
      v8::Local<v8::Value> v = Nan::New(p);
      Nan::Callback cb;
      cb.Reset(v.As<v8::Function>());
      cb.Call(0, 0);
    });
  }
`;

module.exports = {
  registerWidget,

  registerMethod,

  getterNoReturn,
  getterReturnString,
  getterReturnInt32,
  getterReturnBool,

  setterWithString,
  setterWithBool,
  setterWithInt32,
  setterWithCallback,
};
