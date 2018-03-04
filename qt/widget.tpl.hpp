const tpl = `
#include <nan.h>
#include <QString>
#include <QDebug>
#include <<%= widgetQtName %>>

class BasicWidget;

class <%= widgetName %> : public BasicWidget {
  public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->InstanceTemplate()->SetInternalFieldCount(<%= registeredMethodsCount + 3 %>);

    Nan::SetPrototypeMethod(tpl, "setParent", SetParent);
    Nan::SetPrototypeMethod(tpl, "clearParent", ClearParent);
    Nan::SetPrototypeMethod(tpl, "setLayout", SetLayout);
    <%= registeredMethods %>

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }

  static NAN_METHOD(NewInstance) {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
  }

 private:
  explicit <%= widgetName %>() : BasicWidget(new <%= widgetQtName %>) {}
  ~<%= widgetName %>() {}

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      <%= widgetName %> * obj = new <%= widgetName %>();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
    }
  }

  <%= methodBody %>

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};
`;

module.exports = tpl;
