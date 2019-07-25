## 跨平台

Qt 和 Node.js 都是支持多平台的，那么如何让我们的代码也能支持多个平台呢？为此我专门尝试了一下 macOS 上的编译过程，下面和大家分享一下。

其实过程也不复杂，我们的代码本身是跨平台的，只不过在编译和链接时只支持了 msvc 一种编译套件。所以现在改造一下`binding.gyp`文件，来同时支持两个平台。

由于改动之后的`binding.gyp`很长，我就不直接粘贴了，精要主要在于：

* 通过 GYP 支持的`conditions`来进行条件编译。
* macOS 平台无论是编译还是链接还是运行，都有它自己的一套机制，需要包含的目录和 Windows 平台显著不同，我也是结合了 Qt Creator（Qt官方的IDE）生成的编译脚本来写的。
* 我安装的 Qt 5.10.0的`include`目录明显缺少了几个重要的目录，为此我特地补上了。

以下是我补上的三个最基本的头文件目录：

```shell
ln -s  /Users/liuyanghe/Qt/5.10.0/clang_64/lib/QtCore.framework/Headers /Users/liuyanghe/Qt/5.10.0/clang_64/include/QtCore
ln -s  /Users/liuyanghe/Qt/5.10.0/clang_64/lib/QtGui.framework/Headers /Users/liuyanghe/Qt/5.10.0/clang_64/include/QtGui
ln -s  /Users/liuyanghe/Qt/5.10.0/clang_64/lib/QtWidgets.framework/Headers /Users/liuyanghe/Qt/5.10.0/clang_64/include/QtWidgets
```

当然了，具体的目录大家需要按自己的 Qt 安装路径来写。

跨平台效果图：

[TODO: 运行效果图]

## 我们还差什么

以上的内容完成了一个最基本的 React Native 的框架，但距离实际使用，我们还差很多东西。我大概想了一下：

* 我们从来没操心过 Qt Widget 的内存管理和回收，实际上这也主要是因为我对 V8 的 API 非常不熟。
* 代码生成不完备，只能处理非常有限的几种数据类型，信号函数也只是支持了无参数的那一种。
* Qt 很多自有的常量没有导入到 JS 代码当中，比如具名颜色之类的。
* 我们没有认真想过写出来的程序该如何打包和发行——这涉及到各个操作系统的程序发布细节，实在是没有精力覆盖了。
* 没写单元测试！
* 应该还有很多……

就先这样吧，希望大家能从上面的心路历程中有所收获。
