#include <nan.h>
#include <QWidget>
#include <QVBoxLayout>
#include <QHBoxLayout>

class BasicWidget : public Nan::ObjectWrap {
  public:
  BasicWidget(QWidget *w) {
    this->widget_ = w;
  }

  QWidget* getWidget() {
    return (QWidget*)(this->widget_);
  }

  static NAN_METHOD(SetParent) {
    BasicWidget *obj = Nan::ObjectWrap::Unwrap<BasicWidget>(info.Holder());
    BasicWidget *parent = Nan::ObjectWrap::Unwrap<BasicWidget>(info[0]->ToObject());
    obj->widget_->setParent(parent->getWidget());
    if (parent->getWidget()->layout()) {
      parent->getWidget()->layout()->addWidget(obj->widget_);
    }
  }

  static NAN_METHOD(ClearParent) {
    BasicWidget *obj = Nan::ObjectWrap::Unwrap<BasicWidget>(info.Holder());
    QWidget *parentWidget = (QWidget *)obj->widget_->parent();
    obj->widget_->setParent(nullptr);
    if (parentWidget && parentWidget->layout()) {
      parentWidget->layout()->removeWidget(obj->widget_);
    }
    delete obj->widget_;
    obj->widget_ = nullptr;
  }

  static NAN_METHOD(Show) {
    BasicWidget *obj = ObjectWrap::Unwrap<BasicWidget>(info.Holder());
    obj->getWidget()->show();
  }

  static NAN_METHOD(SetLayout) {
    if (!info[0]->IsInt32()) {
      Nan::ThrowError("Layout id must be int.");
      return;
    }
    BasicWidget *obj = Nan::ObjectWrap::Unwrap<BasicWidget>(info.Holder());
    const int layoutId = info[0]->Int32Value();
    QLayout *layout = nullptr;

    switch (layoutId) {
    case 1:
      layout = new QVBoxLayout;
      break;
    case 2:
      layout = new QHBoxLayout;
      break;
    }
    auto oldLayout = obj->getWidget()->layout();
    if (oldLayout) {
      delete oldLayout;
      oldLayout = nullptr;
    }
    obj->getWidget()->setLayout(layout);
  }

private:
  QWidget * widget_;
};
