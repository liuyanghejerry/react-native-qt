#include <nan.h>

using namespace v8;

class Hello : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "getValue", GetValue);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }

  static NAN_METHOD(NewInstance) {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons, 0, 0).ToLocalChecked());
  }

 private:
  explicit Hello() {}
  ~Hello() {}

  static NAN_METHOD(New) {
    if (info.IsConstructCall()) {
      Hello * obj = new Hello();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(Nan::NewInstance(cons, 0, 0).ToLocalChecked());
    }
  }

  static NAN_METHOD(GetValue) {
    Hello* obj = ObjectWrap::Unwrap<Hello>(info.Holder());
    info.GetReturnValue().Set(1);
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};

NAN_MODULE_INIT(Init) {

  Hello::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("createObject").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(Hello::NewInstance)).ToLocalChecked()
  );
}

NODE_MODULE(hello, Init)
