{
  "conditions": [
    [
      "OS=='mac'", {
        "targets": [
          {
            "target_name": "addon",
            "variables": {
              "qt_clang_dir": "/Users/liuyanghe/Qt/5.10.0/clang_64/"
            },
            "include_dirs": [
                "<!(node -e \"require('nan')\")",

                "<(qt_clang_dir)/include/QtCore",
                "<(qt_clang_dir)/include/QtGui",
                "<(qt_clang_dir)/include/QtWidgets",
                "<(qt_clang_dir)/include/",
                "<(qt_clang_dir)/mkspecs/macx-clang",
                "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks/AGL.framework/Headers",
                "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks/OpenGL.framework/Headers",
                "/Library/Developer/CommandLineTools/usr/include/c++/v1",
                "/Library/Developer/CommandLineTools/usr/lib/clang/9.0.0/include",
                "/Library/Developer/CommandLineTools/usr/include",
                "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include",
              ],
            "sources": [
              "addon.cc",
            ],
            "link_settings": {
              "libraries": [
                "<(qt_clang_dir)/lib/QtCore.framework/QtCore",
                "<(qt_clang_dir)/lib/QtGui.framework/QtGui",
                "<(qt_clang_dir)/lib/QtWidgets.framework/QtWidgets"
              ],
            },
            'libraries': [
              '-Wl,-rpath,<(qt_clang_dir)/lib',
            ]
          }
        ]
      }
    ],
    [
      "OS=='win'", {
        "targets": [
          {
            "target_name": "addon",
            "variables": {
              "qt_msvc_dir": "D:/Qt/5.10.0/msvc2017_64/"
            },
            "include_dirs": [
                "<!(node -e \"require('nan')\")",

                "<(qt_msvc_dir)/include/",
                "<(qt_msvc_dir)/include/QtCore",
                "<(qt_msvc_dir)/include/QtGui",
                "<(qt_msvc_dir)/include/QtWidgets"
              ],
            "sources": [
              "addon.cc"
            ],
            "link_settings": {
              "libraries": [
                "<(qt_msvc_dir)/lib/libEGL.lib",
                "<(qt_msvc_dir)/lib/libGLESv2.lib",
                "<(qt_msvc_dir)/lib/Qt5Core.lib",
                "<(qt_msvc_dir)/lib/Qt5Gui.lib",
                "<(qt_msvc_dir)/lib/Qt5Widgets.lib"
              ],
            },
          }
        ]
      }
    ]
  ]
}
