
#include <nan.h>
#include <QString>
#include <QDebug>
#include <QWidget>

class BasicWidget;

class Widget : public BasicWidget {
  public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->InstanceTemplate()->SetInternalFieldCount(6);

    Nan::SetPrototypeMethod(tpl, "setParent", SetParent);
    Nan::SetPrototypeMethod(tpl, "clearParent", ClearParent);
    Nan::SetPrototypeMethod(tpl, "setLayout", SetLayout);
    
    Nan::SetPrototypeMethod(tpl, "show", Show);

    Nan::SetPrototypeMethod(tpl, "windowTitle", WindowTitle);

    Nan::SetPrototypeMethod(tpl, "setWindowTitle", SetWindowTitle);


    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }

  static NAN_METHOD(NewInstance) {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
  }

 private:
  explicit Widget() : BasicWidget(new QWidget) {}
  ~Widget() {
    qDebug() << "Widget deleted";
    delete (QObject *)(0);
  }

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      Widget * obj = new Widget();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
    }
  }

  
  static NAN_METHOD(Show) {
    Widget* obj = ObjectWrap::Unwrap<Widget>(info.Holder());
    ((QWidget *)obj->getWidget())->show();
  }


  static NAN_METHOD(WindowTitle) {
    Widget* obj = ObjectWrap::Unwrap<Widget>(info.Holder());
    QString qtString = ((QWidget *)obj->getWidget())->windowTitle();
    auto v8String = Nan::EmptyString();
    v8String->WriteUtf8(qtString.toUtf8().data(), qtString.length());
    info.GetReturnValue().Set(v8String);
  }


  static NAN_METHOD(SetWindowTitle) {
    Widget* obj = ObjectWrap::Unwrap<Widget>(info.Holder());
    v8::String::Utf8Value utf8Value(info[0]->ToString());
    ((QWidget *)obj->getWidget())->setWindowTitle(QString(*utf8Value));
  }


  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};
