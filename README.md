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

