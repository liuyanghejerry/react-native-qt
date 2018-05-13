## 最简单的Node.js原生模块

其实本来打算把官方的例子贴过来的，但后来想了想，贴过来也没啥太大价值，索性不如大家自己去看一下：https://nodejs.org/api/addons.html#addons_hello_world

如果要是能照做一下就更好了，以便有一个基础的开发环境。


## 不那么简单的Node.js原生模块

现在来看看我想给出的入门例子。

```shell
npm install && npm run gen-all && npm start
```

顺利的话，应该能看到“Hello, 1”的输出。

我这边使用的是Windows 10，所以配备的C++编译器就是开发者版的VS2017。这个开发者版的VS2017各位可以在微软官方免费下载，无需付费。

上面最终运行的JS代码如下：

```javascript
// 加载编译好的原生模块
const addon = require('./build/Release/addon');
// 尝试调用我们挂载的方法
console.log('hello,', (new addon.createObject()).getValue());
// or:
// console.log('hello,', addon.createObject().getValue());
```

下面来说一下各个文件的作用以及这个原生模块是怎么工作起来的。

## 原生模块的生成

V8之前和Chromium都是一个系列的，所以V8本身的开发工具链和Chromium非常相近。C++开发环境不像今天的Node.js这么整齐，因为C++官方之前没有模块系统，也没有成熟的包管理器之类的，工程管理上，各家都有各家的玩法，比如GNU make、CMake、qmake以及VC自己的工程等。

V8这边为了简化和统一各个平台的编译步骤，就采用了`gyp`这样一个工具。印象里gyp是基于Python写的，曾经尝试了解Chromium的时候需要单独安装Python的。

到了Node.js这边呢，node团队又有了`node-gyp`这么个工具，专门和Node.js配合。我忘了Node.js现在发行版有没有像带`npm`一样带着`node-gyp`，如果没有的话大家可以自己`npm install -g node-gyp`一下试试。


### `binding.gyp`

仓库里的`binding.gyp`就是node-gyp所需要的入口文件，这就好比于`package.json`相对于npm。

gyp文件的结构基本上是个JSON，其中`target_name`是原生模块编译出来以后的文件名，`include_dirs`是默认包含的C++头文件目录，`sources`就是需要编译的C++源码。

稍微说一下C++的源码特征。

C++源码分成头文件和源码文件两类，习惯上头文件是`xxx.h`、`xxx.hpp`这样的，而源码文件则是`yyy.cpp`、`yyy.cc`这样的。扩展名其实不重要，只是各个流派的习惯。

头文件里面一般放的是定义，特别是C++类的定义。源码文件当中则是具体的逻辑实现。之所以这样划分，原因不止一个，其中我觉得比较关键的是因为C++编译器希望通过头文件来快速获取一些定义，而不必将整个实现都编译完成才拿到定义。

### `addon.cc`

这个文件就是我们原生模块的C++代码了，里面放着类的定义和原生模块的初始化代码。

本来这个文件可以没有任何魔法，但是那样的话会有大量的废话代码，而且Node.js的原生模块API随着Node.js的版本发生了多次变迁，单纯维护原生模块接口和Node.js的衔接，就要写很多屎。

所以，社区里搞出了一个方案，叫做NaN。名字比较有意思，这应该是作者在玩梗了。

```cpp
// 引入NaN的头文件
#include <nan.h>

using namespace v8;

// 继承Nan::ObjectWrap，这个类本身就带有一些便利的成员函数
class Hello : public Nan::ObjectWrap {
 public:
// 原生模块初始化时会调用这个函数。函数的签名被NaN提供的NAN_MODULE_INIT宏隐藏起来了
  static NAN_MODULE_INIT(Init) {
// 创建一个函数模板。函数模板实际调用的时候，会去调用Hello::New()
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
// 设置预设的属性数量，因为我们就放了一个getValue所以目前写的是1
    tpl->InstanceTemplate()->SetInternalFieldCount(1);
// 意思基本上和函数名称一样，给我们产生的对象的原型链加个方法
    Nan::SetPrototypeMethod(tpl, "getValue", GetValue);
// 调用后面我们定义的constructor，这个函数会返回一个脱离GC的函数
    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }
// NewInstance是我们的工厂函数，实际最终也就是createObject
  static NAN_METHOD(NewInstance) {
// 拿出我们的constructor
    v8::Local<v8::Function> cons = Nan::New(constructor());
// 设置工厂函数的返回值
    info.GetReturnValue().Set(Nan::NewInstance(cons, 0, 0).ToLocalChecked());
  }

 private:
  explicit Hello() {}
  ~Hello() {}
// 函数模板最终调用的函数就是这里了
  static NAN_METHOD(New) {
// 当New以构造函数的身份调用时，会产生一个新对象
    if (info.IsConstructCall()) {
      Hello * obj = new Hello();
      obj->Wrap(info.This());
      info.GetReturnValue().Set(info.This());
    } else {
// 否则我们自行调用，最终也是会产生一个构造函数调用
      v8::Local<v8::Function> cons = Nan::New(constructor());
      info.GetReturnValue().Set(Nan::NewInstance(cons, 0, 0).ToLocalChecked());
    }
  }

// 原型链上挂的方法的实现
  static NAN_METHOD(GetValue) {
// info实际上是函数的参数，这里看起来比较唐突因为NAN_METHOD隐藏掉了
    Hello* obj = ObjectWrap::Unwrap<Hello>(info.Holder());
// 设置返回值为固定的1
    info.GetReturnValue().Set(1);
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
// Nan::Persistent<v8::Function>在V8中是一个不会被GC清理的封装。这里封装的是一个函数。
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};

// 设置模块被调用时初始化的内容
NAN_MODULE_INIT(Init) {

// target是参数，被NAN_MODULE_INIT隐藏了
  Hello::Init(target);
  Nan::Set(target,
    Nan::New<v8::String>("createObject").ToLocalChecked(),
    Nan::GetFunction(
      Nan::New<v8::FunctionTemplate>(Hello::NewInstance)).ToLocalChecked()
  );
}

// 注册模块
NODE_MODULE(hello, Init)
```

如果看完上面带注释的代码没有晕，那说明你的确有天赋，你可以自己去找点V8的开发读物自己起一摊了。没看明白或者懒得看的话，它基本上是这样的一个流程：

1. 写一个C++函数，这个函数被调用的时候，会产生一个`Hello`的实例
2. 给每个`Hello`对象增加一个原型链方法`getValue`
3. 补充`getValue`的实现，使其被调用时能够返回一个`1`
4. 给步骤1的函数挂在到原生模块上，名字叫`createObject`

所以你看，即使只有这么简单几件事，在C++中也是要大费周折的，而且这还是我们用了NaN的封装之后。

## 尝试Qt

### 关键的链接

Qt是一个C++的跨平台UI框架。要使用Qt的UI组件，首先要实现的就是，通过原生模块调起Qt。

在C++的世界里，模块的概念比较模糊，大家一般是采用动态链接库的形式来进行模块复用的。什么是动态链接库呢，在Windows上，形形色色的`xxx.dll`就是动态链接库。在macOS和Linux上，也各自有自己的动态链接库，比如`xxx.dylib`和`xxx.so`。

熟悉Node.js的朋友要问了，动态链接库是怎么工作的，和npm模块是什么区别？

动态链接库这个东西，其实是一组函数的封装，里面装的是二进制代码。它是一种特殊的可执行程序，特殊在哪呢？普通的可执行程序的入口点在`main`函数上，因此操作系统的shell知道如何唤起，但动态链接库则通常没有固定的入口点，它完全是开发者自己约定的，因此无法通过类似双击的形式执行。

这样的可执行程序，主要是用来存放需要共享的代码，操作系统中同一个动态链接库通常只需要在内存中驻留一份。只要不主动更改动态链接库的接口，那么它就可以被无缝地更新。Linux上常用的一种做法就是对于`libstdc++.6.so`这样的库，不直接进行引用，而是再创建一个软连接，比如`libstdc++.so`，这样如果更新到了`libstdc++.6.0.l.so`，只需要修改软连接即可，而库本身因为不修改接口，因此依然可用。这种接口不变的机制，是二进制兼容性（binary compatibility）的根本。

Qt和其他C++库一样，发行时会携带若干动态链接库。如果要想调用Qt的功能，虽然Qt官方做了非常多的外围工作，例如提供moc、qmake之类的工具，但实际只需要正确地链接好Qt的动态链接库即可。

在C++世界里，编译器本身只是套件当中我们最熟知的一个部分，它负责把人类的代码变成机器码。如果一个C++工程当中有4个cpp文件，那么一般会产生4个对应的机器码文件。而最终将这4个机器码文件合并起来的，则是链接器。不同的编译器，实际会有不同的编译套件。Windows开发者比较熟悉的vc++，对应的链接器实际是`link.exe`；而gcc则对应的链接器是`ld`；到了LLVM平台，就是`lld`了。

链接动态链接库的过程，也是由链接器来负责的。如果编译器明确知道你要调用的函数来自于某个动态链接库，而不是你自己的代码，那么编译时就会将这个符号对应的实体预留下来，到了链接期，链接器会在系统中查找对应的库。在Node.js原生模块的编译体系里，链接什么样的库，可以写在gyp文件当中。

关键环节如下：

```javascript
"include_dirs": [
  "<!(node -e \"require('nan')\")",
  "D:/Qt/5.10.0/msvc2017_64/include/",
  "D:/Qt/5.10.0/msvc2017_64/include/QtCore"
],
```

```javascript
"link_settings": {
  "libraries": [
    "D:/Qt/5.10.0/msvc2017_64/lib/Qt5Core.lib"
  ],
},
```

这里这个选项将会告诉链接器，我最终需要链接`Qt5Core.dll`这个库。

这里稍微说一下链接都需要什么。链接器进行链接的过程，最关键的是一个查找符号的过程。所谓符号，在这里就是我们需要调用的函数。编译器在工作时，为了能将符号确定下来，就需要相应的头文件。而链接器在链接时，为了能找到对应的符号，则需要一个“符号导出表”，这个表在Windows平台当中，常被写作`.lib`文件。一旦链接完成，运行程序时，系统则会去找对应的`.dll`文件了。

因此，整个过程的顺利完成，需要头文件、lib文件和dll文件，三者缺一不可。

上面的gyp文件改动，我们增加了头文件和lib文件的查找范围。而对于`dll`文件，因为是运行时查找，因此不需要我们提供给gyp，只需要我们在运行Node.js之前，把对应的文件放在系统的默认查找位置上即可。

### 初试Qt

Qt当中功能非常多，如果我只是想验证一下调用Qt的能力，那么选择一个比较基础的功能即可。我选择的是调用`QString`相关的方法。

关键代码：

```cpp
static NAN_METHOD(GetValue) {
  Hello* obj = ObjectWrap::Unwrap<Hello>(info.Holder());
  QString str = QString("%1 wants to be %2.").arg("Trump", "the president");
  auto bytes = str.toUtf8();
  auto v8Str = Nan::New<v8::String>(bytes.data()).ToLocalChecked();
  info.GetReturnValue().Set(v8Str);
}
```
其中`QString`就是Qt的私货了，我在这创建了一个实例，然后使用了插值，并将结果转化成了V8自己的字符串格式，最后作为了`getValue()`的返回值。

`QString`的定义主要放在`QString`头文件中，因此`addon.cc`的顶端我还增加了这个头文件：

```cpp
#include <QString>
```

在Qt中，绝大部分类名都有自己对应的头文件。

现在，只要将`Qt5Core.dll`复制到`index.js`的旁边，就可以用`node index.js`调起整个程序了，其输出应该如下：

```
hello, Trump wants to be President.
```

## 再说React

前面铺垫了两节背景知识，现在终于到了React了。React渲染到Web以外的平台早就不是新鲜事了，React Native不说，之前flipboard还做了个Canvas的版本，另外还有渲染到命令行之类的例子。

我自己也是非常好奇这个是如何做到的，网上看了不少相关的文章，始终不如自己动手做一遍来的明白。恰好前几天看到有个项目做了React Native的PC版，于是我就有了用Qt来试试的想法。

为了方便指明，我把React渲染到最终目标的部分称作渲染器。

早期做一个渲染器不是很容易，需要和特定的React版本强绑定，但到了最近几个版本，似乎已经基本有了定式。

做一个渲染器最重要的部分，就是要实现一个React的reconciler。现在npm上已经有了非常容易用的reconciler的工厂，叫做react-reconciler。

这个包的用法非常简单，就是给它提供足够多的函数，它就可以帮你把reconciler生成出来。具体需要写哪些方法，可以看一下https://github.com/nitin42/Making-a-custom-React-renderer/blob/master/part-one.md，不过我自己在实践的时候，发现还缺了几个方法，各位可以看一眼仓库里的react/reconciler.js，我已经给补上了。

### 渲染器的模式

React的渲染器一般有几个经典部分组成，除了刚才说到的reconciler，还有几个部分，分别是主render函数、Root组件、组件工厂。

用户使用React的时候，最直接接触到的是主render函数，比如`ReacDOM.render`就是Web版渲染器的主render函数。

Root组件就好比是HTML中的body，所有其他的组件都会在它的内部。由于是整个渲染树的最根部，初始化的时候会和其他组件略有不同，所以这个Root组件一般不会让用户去创建，而是交给render函数内部去自动做了。

剩下的组件工厂，也很简单。大家知道React写JSX的时候，写的都是标签名或者说是叫组件名，那么React拿着这个组件名称要去创建组件的时候，必然需要寻找到它对应的组件构造函数或者是工厂函数。组件工厂的作用就在这里了，它起到了一个映射表的作用。

所以，React渲染器的渲染过程就可以概括成下面这样：

用户调起render函数，而render函数内部则通过组件工厂创建出Root组件，把它交给生成好的reconciler，最后进入React的正常组件生命周期。

### 两个事件循环

渲染器的流程理清楚之后，就可以开始思考怎么把Qt融入到其中了。

Qt的GUI实现和主流桌面GUI库没有太大区别，大体来说，就是主线程会开启一个事件循环，处理操作系统和用户产生的各种事件，根据事件来在屏幕上画出相应的内容。

在纯Qt程序里，这个主线程会被Qt的事件循环给占住，但是我们的原生模块运行在Node.js当中，如果把node的主线程给占住了，那整个JS执行环境就会停住。

如果贸然将其中一个循环挪到另一个线程中，就将会面临线程安全的挑战。作为一个C++小白，我觉得这不是我想要的。

好在Qt还提供了类似于“步进”的处理模式，每调用一次只处理一批事件，处理完了之后就不会占住主线程了。有了这个方法就好办了，我只需要用`setInterval`周期性地去调用，就可以在不破坏Node.js事件循环的前提下，同时进行Qt的事件循环了。

另一方面，渲染器的Root组件是整个组件树的起点，Qt事件循环的开始，完全可以放在Root组件的初始化当中。

### 衔接Qt组件

各位还记得最开始给出的一大长段原生模块代码么，现在我们要用它来提供Qt组件。

在Qt当中，组件可能有上百个，要从哪开始呢？

`QWidget`是所有Qt GUI组件的基类，如果单独实例化一个`QWidget`，那么它就是一个空窗口。为了验证我们是否能正常衔接Qt，我决定就用它来做第一个组件。

```cpp
#include <nan.h>
#include <QWidget>

// 这个class中未来会封装一些通用功能
class BasicWidget;

class Widget : public BasicWidget {
  public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->InstanceTemplate()->SetInternalFieldCount(6);

    Nan::SetPrototypeMethod(tpl, "show", Show);

    constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  }

  static NAN_METHOD(NewInstance) {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
  }

 private:
  explicit Widget() : BasicWidget(new QWidget) {}
  ~Widget() {}

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
    // getWidget是BasicWidget的方法，我们用它来获取实例中存放的QWidget实例
    ((QWidget *)obj->getWidget())->show();
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> my_constructor;
    return my_constructor;
  }

};
```

这段代码和最开始的原生模块代码没有太大区别。这里我给`Widget`挂了一个方法，叫`Show`，因为我们需要这个方法来告诉Qt，我们需要`QWidget`显示出来。

在JS一侧：

```javascript
class Widget extends Component {
  children = [];
  widget = null;

  constructor(root, props) {
    super(root, props);
    this.root = root;
    this.props = {
      ...props,
    };
    // 调用原生模块中的方法来创建组件
    this.widget = createWidget();
  }

  render(parent) {
    this.renderChildren(this);
    // 在组件渲染时通知Qt显示对应的`QWidget`
    this.widget.show();
  }
}
```

这个`Widget`类实例化出的对象，和`QWidget`的实例是一一对应的，我们需要做的就是把两边的方法桥接起来。

至此，我们已经可以成功地展示出一个Qt组件了：

```jsx
class Example extends Component {

  render() {
    return (
      <Widget></Widget>
    );
  }
}

render(<Example/>);
```

## 实现嵌套和布局

我们已经可以成功渲染一个组件了，这是一个非常大的进展。但是如果我想要将组件嵌套起来呢？用现在的代码虽然JSX可以这么写，但实际效果不会有什么卵用，两个Widget只会分别变成两个窗口。

```jsx
// 如果我们要实现这样的嵌套，该怎么做呢？
class Example extends Component {

  render() {
    return (
      <Widget>
        <Widget></Widget>
      </Widget>
    );
  }
}
```

为什么会这样呢？原因是我们的实际GUI程序是Qt所渲染的，而Qt有他自己的一套规则来进行嵌套。要使用Qt的嵌套，就必须了解一下Qt的布局系统。

Qt的布局主要依靠`QLayout`的各种子类来实现，比较常用的是`QVBoxLayout`和`QHBoxLayout`。Qt的这两个布局比较类似于CSS的flex，前者是纵向弹性布局，而后者则是横向水平布局。被布局的组件会自动撑满父组件，如果需要拉伸或压缩，则各子组件会均匀分摊。

使用的时候需要父组件设置自己的布局，也就是给父组件设置一个`QLayout`的实例，这样所有子组件就会自动被布局。

那么Qt当中如何表达组件之间的“父子关系”呢？Qt的所有GUI组件都继承自`QWidget`，而`QWidget`又继承自`QObject`。`QObject`提供了一个方法`setParent`，通过这个方法，Qt就能够将组件之间的父子关系建立起来。在Qt中，对象的父子关系不仅会用于布局，同时也会应用在对象的“垃圾回收”上，感兴趣的话，大家可以自己在官方文档中看一下。

对于我们来说，要桥接Qt的布局系统，其实只需要做两件事：

1. 在原生模块当中，我们需要暴露出组件设置布局和建立组件父子关系的方法
2. 在JS代码当中，我们需要在组件加入组件树的时候，调用原生代码建立父子关系；同时在组件移除出组件树的时候，解开原生组件的父子关系

原生代码的核心改动：

```cpp
// 加在BasicWidget中，因为我们希望每个组件都有这个方法
static NAN_METHOD(SetParent) {
  BasicWidget *obj = Nan::ObjectWrap::Unwrap<BasicWidget>(info.Holder());
  BasicWidget *parent = Nan::ObjectWrap::Unwrap<BasicWidget>(info[0]->ToObject());
  obj->widget_->setParent(parent->getWidget());
}
```

另一方面，我选择在reconciler中直接加入设置父子关系的代码：

```javascript
appendInitialChild(parentInstance, child) {
  if (parentInstance.appendChild) {
    parentInstance.appendChild(child);
    // 处理父子关系
    if (child.widget && parentInstance.widget) {
     child.widget.setParent(parentInstance.widget);
    }
  } else {
    parentInstance.document = child;
  }
},
```

加完这段我发现其实不止一个地方涉及到父子关系处理，索性把父子关系相关的代码拆成了两个独立函数：

```javascript
function attachParentInQt(parent, child) {
  console.log('attachParentInQt');
  if (child.widget && parent.widget) {
    child.widget.setParent(parent.widget);
  }
}

function detachParentInQt(child) {
  console.log('detachParentInQt');
  if (child.widget) {
    child.widget.clearParent();
  }
}
```

现在来处理QLayout:


```cpp
// basic-widget.hpp
static NAN_METHOD(SetLayout) {
  // info[0]指的是第0个参数
  // 这里偷了个懒，用数字类型来表示布局到底是水平还是竖直
  if (!info[0]->IsInt32()) {
    Nan::ThrowError("Layout must be int.");
    return;
  }
  BasicWidget *obj = Nan::ObjectWrap::Unwrap<BasicWidget>(info.Holder());
  const int layoutId = info[0]->Int32Value();
  QLayout *layout = nullptr;

  // C++当中，父类类型的指针，可以存放子类的实例
  // 这是C++多态的一种表现
  switch (layoutId) {
  case 1:
    layout = new QVBoxLayout;
    break;
  case 2:
    layout = new QHBoxLayout;
    break;
  }
  auto oldLayout = obj->getWidget()->layout();
  obj->getWidget()->setLayout(layout);
  // 旧的实例需要手动清理
  if (oldLayout) {
    delete oldLayout;
    oldLayout = nullptr;
  }
}
```

JS这一侧的改动更小一些。主要是`Widget.js`里，在容器创建时，就根据`layout`属性来设置布局。另一方面，由于有了`layout`属性，那么就必须注意观察属性的变化。

```javascript
// 这是Widget的构造函数
constructor(root, props) {
  super(root, props);
  this.root = root;
  this.props = {
    ...Widget.defaultProps,
    ...props,
  };
  this.widget = createWidget();
  // 这里增加调用布局设置
  this.widget.setLayout(this.props.layout);
}

// 同时，组件的属性变化时，我们要能够及时反映在Qt系统里
update(oldProps, newProps) {
  if (newProps.layout !== oldProps.layout) {
    this.widget.setLayout(newProps.layout);
  }
}
```

现在我们的React代码就可以成功地进行嵌套了。不过如果仅仅是QWidget，那么即使嵌套也看不出什么效果，顶多是窗口数量从2变成了1。下一节我们来看看如何量产一些其他的组件。

## 量产组件

为了更好地看到效果，我决定批量生成一些组件。首先来回顾一下，要生成一个组件，我都要修改哪些文件：

* 新建一个`xxx.hpp`，以便将原生代码和V8连接起来
* 新建一个`xxx.js`，以便在React中有相应的组件
* 在`createElement`中的组件映射表中增加新的组件名称映射，以便在JSX中可以使用

这里面工作量最大的部分，就是第一步。为了让第一步好受一些，我决定写一个脚本来自动生成原生代码。

通常一个Qt的Widget会有很多方法，但绝大部分方法的参数、返回值，都集中在数字、字符串和布尔值上，所以我可以用一个通用的格式来描述组件：

```javascript
{
  widgetName: 'Button',
  widgetQtName: 'QPushButton',
  methods: [
    {
      name: 'show',
      type: 'getter',
      ret: 'null',
    },
    {
      name: 'text',
      type: 'getter',
      ret: 'string',
    },
    {
      name: 'setText',
      type: 'setter',
      args: ['string'],
    },
    {
      name: 'clicked',
      type: 'setter',
      args: ['callback'],
    },
  ],
}
```

这里面其他的都好说，大家看一眼`qt/wrapper-generator.js`和`qt/partial.js`的内容也就明白了，唯独Qt有个信号槽机制，需要我们单独处理一下。

## Qt的信号槽

如果我点了一个按钮，希望触发一些操作，比如弹个框什么的，该怎么做呢？常见的GUI原生库一般有两种套路。第一种是通过消息机制，我记得win32最早的编程就是这么搞的，写个巨大的`switch case`语句，然后过滤消息，根据不同的消息来做处理；第二种是通过回调函数，这个就和浏览器的API差不多，宝蓝公司的VCL走的是这个套路。

Qt呢，两个套路都有，而且在套路之外，用信号槽机制来包装了一层。举个例子：

```cpp
QObject::connect(&a, &Counter::valueChanged,
                 &b, &Counter::setValue);
```

这句代码将`a`对象的`valueChanged`信号对接到了`b`对象的`setValue`槽上，于是当`valueChanged`被触发时，`setValue`会自动调用，且被调用的参数就是`valueChanged`的参数。

信号槽当中一个信号可以连接多个槽，而一个槽也可以被多个信号触发。这个神奇的机制完成了一个“观察者模式”，其本质是Qt的元编程工具`moc`帮我们进行了自动调用。

有些小伙伴可能不理解，如果我有消息机制和回调函数，为什么还要费周折去搞这一套呢？这里面有两个原因，一方面是消息机制往往需要编写额外的代码来衔接事件，很难做到优雅；另一方面，用回调函数的话，一旦牵扯到跨线程调用，竞态是很难发现和避免的。Qt的这个自动连接，可以在跨线程时变为按消息传递，避免了直接调用回调函数的尴尬。

回到正题，Qt的各类GUI组件，也是通过信号槽机制来衔接的。以`QPushButton`这个按钮组件来说，`QPushButton::clicked`就是一个信号函数。这个信号函数在按钮被点击时，会被Qt自动调用，随之也就会调用连接着这个信号的所有槽函数。JavaScript当中我们比较熟悉的机制是回调函数，那么不如让我们的回调函数成为槽函数，这样就可以实现点击响应了。

我在代码生成脚本中为每个信号函数生成了一个能够挂载槽函数的函数，会生成出这样的原生代码：

```cpp
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

  // 挂载一个匿名函数，匿名函数内部调用实际的JavaScript回调
  QObject::connect(((QPushButton *)obj->getWidget()), &QPushButton::clicked, [p] () {
    v8::Local<v8::Value> v = Nan::New(p);
    Nan::Callback cb;
    cb.Reset(v.As<v8::Function>());
    cb.Call(0, 0);
  });
}
`;
```

有了这样的代码，我就可以在JS对应的组件这边挂载回调了：

```javascript
// 注意这个clicked
<Button key={1} text={this.state.buttonText} clicked={this.incCounter.bind(this)}></Button>
```

好了，现在我们可以批量造一些简单的组件了。实际效果：

```javascript
<Widget layout={1} windowTitle="Example">
  <Button key={1} text={this.state.buttonText} clicked={this.incCounter.bind(this)}></Button>
  <Button key={2} text={"no-op"}></Button>
  <Button key={3} text={"Exit"} clicked={stopUiLoop}></Button>
  <Widget layout={2}>
    <Button key={4} text={"1"}></Button>
    <Button key={5} text={"2"}></Button>
    <Button key={6} text={"3"}></Button>
  </Widget>
  <Widget layout={2}>
    <Input text="" returnPressed={this.applyInputContent.bind(this)} />
    <Label text="This is a Qt Label." />
  </Widget>
</Widget>
```
