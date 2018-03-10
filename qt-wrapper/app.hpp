#include <QApplication>

class App {
public:
  static QApplication* getApp();
private:
  static char ** _args;
  static int _argv;
  static QApplication * _app;
};
