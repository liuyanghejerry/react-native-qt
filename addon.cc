
#include <nan.h>
#include <QApplication>
#include <QWidget>
#include "./qt-wrapper/app.hpp"
#include "./qt-wrapper/basic-widget.hpp"
#include "./qt-wrapper/widget.hpp"
#include "./qt-wrapper/button.hpp"
#include "./qt-wrapper/label.hpp"
#include "./qt-wrapper/input.hpp"

using namespace v8;

QApplication * App::_app = nullptr;
int App::_argv = 0;
char** App::_args = nullptr;

QApplication* App::getApp() {
  if (App::_app) {
    return App::_app;
  }
  int & argv = App::_argv;
  App::_app = new QApplication(argv, App::_args);
  App::_app->setQuitOnLastWindowClosed(true);
  return App::_app;
}


void ProcessEvents(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  App::getApp()->processEvents();
  info.GetReturnValue().Set(App::getApp()->allWindows().length());
}

NAN_MODULE_INIT(Init) {
  
  Widget::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("createWidget").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(Widget::NewInstance)).ToLocalChecked()
  );


  Button::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("createButton").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(Button::NewInstance)).ToLocalChecked()
  );


  Label::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("createLabel").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(Label::NewInstance)).ToLocalChecked()
  );


  Input::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("createInput").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(Input::NewInstance)).ToLocalChecked()
  );

  Nan::Set(target,
    Nan::New<v8::String>("processEvents").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(ProcessEvents)).ToLocalChecked()
  );
}

NODE_MODULE(hello, Init)
