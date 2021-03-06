
#include <nan.h>
#include <QString>
#include <QDebug>
#include <QPushButton>

class BasicWidget;

class Button : public BasicWidget {
  public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->InstanceTemplate()->SetInternalFieldCount(7);

    Nan::SetPrototypeMethod(tpl, "setParent", SetParent);
    Nan::SetPrototypeMethod(tpl, "clearParent", ClearParent);
    Nan::SetPrototypeMethod(tpl, "setLayout", SetLayout);
    
    Nan::SetPrototypeMethod(tpl, "show", Show);

    Nan::SetPrototypeMethod(tpl, "text", Text);

    Nan::SetPrototypeMethod(tpl, "setText", SetText);

    Nan::SetPrototypeMethod(tpl, "clicked", Clicked);


    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }

  static NAN_METHOD(NewInstance) {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
  }

 private:
  explicit Button() : BasicWidget(new QPushButton) {}
  ~Button() {
    qDebug() << "Button deleted";
    delete (QObject *)(0);
  }

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      Button * obj = new Button();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
    }
  }

  
  static NAN_METHOD(Show) {
    Button* obj = ObjectWrap::Unwrap<Button>(info.Holder());
    ((QPushButton *)obj->getWidget())->show();
  }


  static NAN_METHOD(Text) {
    Button* obj = ObjectWrap::Unwrap<Button>(info.Holder());
    QString qtString = ((QPushButton *)obj->getWidget())->text();
    auto v8String = Nan::EmptyString();
    v8String->WriteUtf8(qtString.toUtf8().data(), qtString.length());
    info.GetReturnValue().Set(v8String);
  }


  static NAN_METHOD(SetText) {
    Button* obj = ObjectWrap::Unwrap<Button>(info.Holder());
    v8::String::Utf8Value utf8Value(info[0]->ToString());
    ((QPushButton *)obj->getWidget())->setText(QString(*utf8Value));
  }


  static NAN_METHOD(Clicked) {
    Button* obj = ObjectWrap::Unwrap<Button>(info.Holder());
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

    QObject::connect(((QPushButton *)obj->getWidget()), &QPushButton::clicked, [p] () {
      v8::Local<v8::Value> v = Nan::New(p);
      Nan::Callback cb;
      cb.Reset(v.As<v8::Function>());
      cb.Call(0, 0);
    });
  }


  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};
