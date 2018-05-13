
#include <nan.h>
#include <QString>
#include <QDebug>
#include <QLabel>

class BasicWidget;

class Label : public BasicWidget {
  public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->InstanceTemplate()->SetInternalFieldCount(6);

    Nan::SetPrototypeMethod(tpl, "setParent", SetParent);
    Nan::SetPrototypeMethod(tpl, "clearParent", ClearParent);
    Nan::SetPrototypeMethod(tpl, "setLayout", SetLayout);
    
    Nan::SetPrototypeMethod(tpl, "show", Show);

    Nan::SetPrototypeMethod(tpl, "text", Text);

    Nan::SetPrototypeMethod(tpl, "setText", SetText);


    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }

  static NAN_METHOD(NewInstance) {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
  }

 private:
  explicit Label() : BasicWidget(new QLabel) {}
  ~Label() {}

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      Label * obj = new Label();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
    }
  }

  
  static NAN_METHOD(Show) {
    Label* obj = ObjectWrap::Unwrap<Label>(info.Holder());
    ((QLabel *)obj->getWidget())->show();
  }


  static NAN_METHOD(Text) {
    Label* obj = ObjectWrap::Unwrap<Label>(info.Holder());
    QString qtString = ((QLabel *)obj->getWidget())->text();
    auto v8String = Nan::EmptyString();
    v8String->WriteUtf8(qtString.toUtf8().data(), qtString.length());
    info.GetReturnValue().Set(v8String);
  }


  static NAN_METHOD(SetText) {
    Label* obj = ObjectWrap::Unwrap<Label>(info.Holder());
    v8::String::Utf8Value utf8Value(info[0]->ToString());
    ((QLabel *)obj->getWidget())->setText(QString(*utf8Value));
  }


  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};
