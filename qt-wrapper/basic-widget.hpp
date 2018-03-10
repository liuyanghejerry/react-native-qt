#include <nan.h>
#include <QWidget>

class BasicWidget : public Nan::ObjectWrap {
  public:
  BasicWidget(QWidget *w) {
    this->widget_ = w;
  }

  QWidget* getWidget() {
    return (QWidget*)(this->widget_);
  }

  private:
  QWidget * widget_;
};
